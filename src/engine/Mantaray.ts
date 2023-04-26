import { Strings } from 'cafe-utility'
import { MantarayNode, Reference } from 'mantaray-js'
import { createFrontPage } from '../page/FrontPage'
import { GlobalState } from './GlobalState'

export async function recreateMantaray(globalState: GlobalState): Promise<void> {
    if (globalState.doNotSave) {
        return
    }
    const node = globalState.mantaray
    const frontPage = await createFrontPage(globalState)
    addToMantaray(globalState.mantaray, 'index.html', frontPage.swarmReference)
    addToMantaray(globalState.mantaray, '/', frontPage.swarmReference)
    addToMantaray(node, 'style.css', globalState.styleReference)
    for (const page of globalState.pages) {
        addToMantaray(node, page.path, page.html)
    }
    for (const article of globalState.articles) {
        addToMantaray(node, article.path, article.html)
    }
    for (const collection of Object.keys(globalState.collections)) {
        addToMantaray(node, Strings.slugify(collection), globalState.collections[collection])
    }
    await uploadMantaray(globalState)
}

async function uploadMantaray(globalState: GlobalState): Promise<void> {
    const reference = await globalState.mantaray.save(async (data: Uint8Array) => {
        const { reference } = await globalState.bee.uploadData(globalState.stamp, data)
        return Buffer.from(reference, 'hex') as Reference
    })
    const writer = globalState.bee.makeFeedWriter('sequence', '0'.repeat(64), globalState.wallet.getPrivateKeyString())
    await writer.upload(globalState.stamp, reference as any)
    return
}

function addToMantaray(node: MantarayNode, key: string, value: string): void {
    node.addFork(encodePath(key), Buffer.from(value, 'hex') as Reference, {
        'Content-Type': key.endsWith('.css') ? 'text/css' : 'text/html',
        Filename: key,
        'website-index-document': 'index.html',
        'website-error-document': 'index.html'
    })
}

function encodePath(path: string): Uint8Array {
    return new TextEncoder().encode(path)
}
