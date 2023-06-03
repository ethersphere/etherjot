import { Bee, BeeDebug } from '@ethersphere/bee-js'
import { Files } from 'cafe-node-utility'
import { Arrays, Objects, Strings, Types } from 'cafe-utility'
import { default as Wallet, default as ether } from 'ethereumjs-wallet'
import inquirer from 'inquirer'
import { MantarayNode } from 'mantaray-js'
import { homedir } from 'os'
import { join } from 'path'
import { createDefaultImage } from '../html/DefaultImage'
import { createArticleFontData, createBrandingFontData, createNormalFontData } from '../html/Font'
import { createStyle } from '../html/Style'
import { createFrontPage } from '../page/FrontPage'
import { recreateMantaray } from './Mantaray'

interface FontCollection {
    menu: string
    branding: string
    article: string
}

interface Configuration {
    title: string
    header?: {
        title?: string | null
        description?: string | null
        link?: string | null
    }
    main?: {
        highlight?: string | null
    }
    footer?: {
        description?: string | null
        links?: {
            discord?: string | null
            twitter?: string | null
            github?: string | null
            youtube?: string | null
            reddit?: string | null
        }
    }
}

interface Page {
    title: string
    markdown: string
    html: string
    path: string
}

export interface Article {
    title: string
    preview: string
    markdown: string
    html: string
    categories: string[]
    tags: string[]
    createdAt: number
    wordCount: number
    path: string
    banner: string
    kind: 'h1' | 'h2' | 'highlight' | 'regular'
}

interface GlobalStateOnDisk {
    privateKey: string
    configuration: Configuration
    feed: string
    styleReference: string
    font: FontCollection
    defaultCoverImage: string
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
    configuration: Configuration
    feed: string
    styleReference: string
    font: FontCollection
    defaultCoverImage: string
    pages: Page[]
    articles: Article[]
    images: Record<string, string>
    collections: Record<string, string>
    mantaray: MantarayNode
    doNotSave: boolean
}

export async function getGlobalState(websiteName?: string): Promise<GlobalState> {
    if (!(await Files.existsAsync(getPath()))) {
        await createDefaultGlobalState(websiteName)
    }
    const json = await Files.readJsonAsync(getPath())
    const configuration = Types.asObject(json.configuration)
    const globalStateOnDisk: GlobalStateOnDisk = {
        privateKey: Types.asString(json.privateKey),
        configuration: {
            title: Types.asString(configuration.title),
            header: {
                title: Types.asNullableString(Objects.getDeep(configuration, 'header.title')),
                description: Types.asNullableString(Objects.getDeep(configuration, 'header.description')),
                link: Types.asNullableString(Objects.getDeep(configuration, 'header.link'))
            },
            main: {
                highlight: Types.asNullableString(Objects.getDeep(configuration, 'main.highlight'))
            },
            footer: {
                description: Types.asNullableString(Objects.getDeep(configuration, 'footer.description')),
                links: {
                    discord: Types.asNullableString(Objects.getDeep(configuration, 'footer.links.discord')),
                    twitter: Types.asNullableString(Objects.getDeep(configuration, 'footer.links.twitter')),
                    github: Types.asNullableString(Objects.getDeep(configuration, 'footer.links.github')),
                    youtube: Types.asNullableString(Objects.getDeep(configuration, 'footer.links.youtube')),
                    reddit: Types.asNullableString(Objects.getDeep(configuration, 'footer.links.reddit'))
                }
            }
        },
        feed: Types.asString(json.feed),
        styleReference: Types.asString(json.styleReference),
        font: {
            menu: Types.asString(Types.asObject(json.font).menu),
            branding: Types.asString(Types.asObject(json.font).branding),
            article: Types.asString(Types.asObject(json.font).article)
        },
        defaultCoverImage: Types.asString(json.defaultCoverImage),
        pages: Types.asArray(json.pages).map((x: any) => ({
            title: Types.asString(x.title),
            markdown: Types.asString(x.markdown),
            html: Types.asString(x.html),
            path: Types.asString(x.path)
        })),
        articles: Types.asArray(json.articles).map((x: any) => {
            return {
                title: Types.asString(x.title),
                preview: Types.asString(x.preview),
                markdown: Types.asString(x.markdown),
                html: Types.asString(x.html),
                categories: Types.asArray(x.categories || []).map(Types.asString),
                tags: Types.asArray(x.tags || []).map(Types.asString),
                wordCount: Types.asNumber(x.wordCount || 0),
                createdAt: Types.asNumber(x.createdAt),
                path: Types.asString(x.path),
                banner: x.banner || null,
                kind: Types.asString(x.kind) as any
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
        configuration: globalState.configuration,
        feed: globalState.feed,
        styleReference: globalState.styleReference,
        font: globalState.font,
        defaultCoverImage: globalState.defaultCoverImage,
        pages: globalState.pages,
        articles: globalState.articles,
        images: globalState.images,
        collections: globalState.collections
    }
    await Files.writeUtf8FileAsync(getPath(), JSON.stringify(globalStateOnDisk))
    await recreateMantaray(globalState)
}

async function createDefaultGlobalState(websiteName?: string): Promise<void> {
    const privateKey = Strings.randomHex(64)
    const wallet = ether.fromPrivateKey(Buffer.from(privateKey, 'hex'))
    const bee = new Bee(process.env.JOT_BEE || 'http://localhost:1633')
    const beeDebug = new BeeDebug(process.env.JOT_BEE_DEBUG || 'http://localhost:1635')
    const stamp = await getStamp(beeDebug)
    const feedReference = await bee.createFeedManifest(stamp, 'sequence', '0'.repeat(64), wallet.getAddressString())
    const fontNormalResults = await bee.uploadData(stamp, createNormalFontData())
    const fontBrandingResults = await bee.uploadData(stamp, createBrandingFontData())
    const fontArticleResults = await bee.uploadData(stamp, createArticleFontData())
    const styleResults = await bee.uploadData(stamp, createStyle())
    const defaultCoverImageResults = await bee.uploadData(stamp, createDefaultImage())
    if (!websiteName) {
        websiteName = (await inquirer
            .prompt({
                type: 'input',
                name: 'websiteName',
                message: 'What is the name of your website?',
                default: 'My Website'
            })
            .then(x => x.websiteName)) as string
    }
    const globalStateOnDisk: GlobalStateOnDisk = {
        privateKey,
        pages: [],
        articles: [],
        images: {},
        feed: feedReference.reference,
        styleReference: styleResults.reference,
        font: {
            menu: fontNormalResults.reference,
            branding: fontBrandingResults.reference,
            article: fontArticleResults.reference
        },
        defaultCoverImage: defaultCoverImageResults.reference,
        configuration: {
            title: websiteName
        },
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
        configuration: globalStateOnDisk.configuration,
        feed: globalStateOnDisk.feed,
        styleReference: globalStateOnDisk.styleReference,
        font: globalStateOnDisk.font,
        defaultCoverImage: globalStateOnDisk.defaultCoverImage,
        stamp,
        pages: globalStateOnDisk.pages,
        articles: globalStateOnDisk.articles,
        images: globalStateOnDisk.images,
        collections: globalStateOnDisk.collections,
        mantaray: new MantarayNode(),
        doNotSave: false
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
