import { Bee, BeeDebug } from '@ethersphere/bee-js'
import { Files } from 'cafe-node-utility'
import { Arrays, Strings, Types } from 'cafe-utility'
import { default as Wallet, default as ether } from 'ethereumjs-wallet'
import inquirer from 'inquirer'
import { homedir } from 'os'
import { join } from 'path'
import { STYLE } from '../html/Style'
import { createFrontPage } from '../page/FrontPage'

interface Page {
    title: string
    markdown: string
    html: string
    feed: string
    topic: string
}

interface Article {
    title: string
    markdown: string
    html: string
    categories: string[]
    tags: string[]
    createdAt: number
    wordCount: number
    banner?: string
}

interface GlobalStateOnDisk {
    privateKey: string
    websiteName: string
    feed: string
    style: string
    pages: Page[]
    articles: Article[]
    images: Record<string, string>
    collections: Record<string, string>
}

export interface GlobalState {
    wallet: Wallet
    bee: Bee
    beeDebug: BeeDebug
    stamp: string
    websiteName: string
    feed: string
    style: string
    pages: Page[]
    articles: Article[]
    images: Record<string, string>
    collections: Record<string, string>
}

export async function getGlobalState(websiteName?: string): Promise<GlobalState> {
    if (!(await Files.existsAsync(getPath()))) {
        await createDefaultGlobalState(websiteName)
    }
    const json = await Files.readJsonAsync(getPath())
    const globalStateOnDisk: GlobalStateOnDisk = {
        privateKey: Types.asString(json.privateKey),
        websiteName: Types.asString(json.websiteName),
        feed: Types.asString(json.feed),
        style: Types.asString(json.style),
        pages: Types.asArray(json.pages).map((x: any) => ({
            title: Types.asString(x.title),
            markdown: Types.asString(x.markdown),
            html: Types.asString(x.html),
            feed: Types.asString(x.feed),
            topic: Types.asString(x.topic)
        })),
        articles: Types.asArray(json.articles).map((x: any) => {
            return {
                title: Types.asString(x.title),
                markdown: Types.asString(x.markdown),
                html: Types.asString(x.html),
                categories: Types.asArray(x.categories || []).map(Types.asString),
                tags: Types.asArray(x.tags || []).map(Types.asString),
                wordCount: Types.asNumber(x.wordCount || 0),
                createdAt: Types.asNumber(x.createdAt)
            }
        }),
        images: Types.asObject(json.images) as Record<string, string>,
        collections: Types.asObject(json.collections || {}) as Record<string, string>
    }
    return createGlobalState(globalStateOnDisk)
}

export async function saveGlobalState(globalState: GlobalState): Promise<void> {
    const globalStateOnDisk: GlobalStateOnDisk = {
        privateKey: globalState.wallet.getPrivateKeyString(),
        websiteName: globalState.websiteName,
        feed: globalState.feed,
        style: globalState.style,
        pages: globalState.pages,
        articles: globalState.articles,
        images: globalState.images,
        collections: globalState.collections
    }
    await Files.writeUtf8FileAsync(getPath(), JSON.stringify(globalStateOnDisk))
}

async function createDefaultGlobalState(websiteName?: string): Promise<void> {
    const privateKey = Strings.randomHex(64)
    const wallet = ether.fromPrivateKey(Buffer.from(privateKey, 'hex'))
    const pages: Page[] = []
    const articles: Article[] = []
    const images: Record<string, string> = {}
    const bee = new Bee(process.env.JOT_BEE || 'http://localhost:1633')
    const beeDebug = new BeeDebug(process.env.JOT_BEE_DEBUG || 'http://localhost:1635')
    const stamp = await getStamp(beeDebug)
    const feedReference = await bee.createFeedManifest(stamp, 'sequence', '0'.repeat(64), wallet.getAddressString())
    const styleReference = await bee.uploadFile(stamp, STYLE, 'style.css', { contentType: 'text/css' })
    const globalStateOnDisk: GlobalStateOnDisk = {
        privateKey,
        pages,
        articles,
        images,
        feed: feedReference.reference,
        style: styleReference.reference,
        websiteName:
            websiteName ||
            (await inquirer
                .prompt({
                    type: 'input',
                    name: 'websiteName',
                    message: 'What is the name of your website?',
                    default: 'My Website'
                })
                .then(x => x.websiteName)),
        collections: {}
    }
    await createFrontPage(await createGlobalState(globalStateOnDisk))
    await Files.writeUtf8FileAsync(getPath(), JSON.stringify(globalStateOnDisk))
}

export function getPath() {
    return join(homedir(), '.jot.json')
}

async function createGlobalState(globalStateOnDisk: GlobalStateOnDisk): Promise<GlobalState> {
    const beeDebug = new BeeDebug('http://localhost:1635')
    const stamp = await getStamp(beeDebug)
    const globalState: GlobalState = {
        wallet: ether.fromPrivateKey(
            Buffer.from(
                globalStateOnDisk.privateKey.startsWith('0x')
                    ? globalStateOnDisk.privateKey.slice(2)
                    : globalStateOnDisk.privateKey,
                'hex'
            )
        ),
        bee: new Bee('http://localhost:1633'),
        beeDebug,
        websiteName: globalStateOnDisk.websiteName,
        feed: globalStateOnDisk.feed,
        style: globalStateOnDisk.style,
        stamp,
        pages: globalStateOnDisk.pages,
        articles: globalStateOnDisk.articles,
        images: globalStateOnDisk.images,
        collections: globalStateOnDisk.collections
    }
    return globalState
}

async function getStamp(beeDebug: BeeDebug): Promise<string> {
    const stamps = await beeDebug.getAllPostageBatch()
    if (stamps.length === 0) {
        throw new Error('No stamps available. Please create a stamp using Bee Debug API.')
    }
    return Arrays.pick(stamps).batchID
}
