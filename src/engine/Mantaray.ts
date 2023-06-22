import { Files } from 'cafe-node-utility'
import { Strings } from 'cafe-utility'
import { readFile } from 'fs/promises'
import { MantarayNode, Reference } from 'mantaray-js'
import { createDefaultImage } from '../html/DefaultImage'
import { createArticleFontData, createBrandingFontData, createNormalFontData } from '../html/Font'
import { createStyle } from '../html/Style'
import { createFrontPage } from '../page/FrontPage'
import { createNewsletterPage } from '../page/NewsletterPage'
import { createSearchPage } from '../page/SearchPage'
import { GlobalState, getPath } from './GlobalState'
import { createArticleSlug } from './Utility'
import { exportToWeb2 } from './Web2Export'

type OptionalPage = { swarmReference: string } | undefined

export async function recreateMantaray(globalState: GlobalState): Promise<void> {
    if (globalState.doNotSave) {
        return
    }
    const node = globalState.mantaray
    const frontPage = await createFrontPage(globalState)
    let searchPage: OptionalPage
    let newsletterPage: OptionalPage
    if (await Files.existsAsync(getPath('.jot.search.json'))) {
        searchPage = await createSearchPage(globalState)
    }
    if (await Files.existsAsync(getPath('.jot.newsletter.html'))) {
        newsletterPage = await createNewsletterPage(globalState)
    }
    addToMantaray(node, 'index.html', frontPage.swarmReference)
    if (searchPage) {
        addToMantaray(node, 'search', searchPage.swarmReference)
    }
    if (newsletterPage) {
        addToMantaray(node, 'newsletter', newsletterPage.swarmReference)
    }
    addToMantaray(node, '/', frontPage.swarmReference)
    addToMantaray(node, 'style.css', globalState.styleReference)
    addToMantaray(node, 'font-variant-1.ttf', globalState.font.branding)
    addToMantaray(node, 'font-variant-2.woff2', globalState.font.menu)
    addToMantaray(node, 'font-variant-3.ttf', globalState.font.article)
    addToMantaray(node, 'post/font-variant-1.ttf', globalState.font.branding)
    addToMantaray(node, 'post/font-variant-2.woff2', globalState.font.menu)
    addToMantaray(node, 'post/font-variant-3.ttf', globalState.font.article)
    addToMantaray(node, 'default.png', globalState.defaultCoverImage)
    addToMantaray(node, 'favicon.png', globalState.favicon)
    addToMantaray(node, 'post/favicon.png', globalState.favicon)
    addToMantaray(node, 'post/default.png', globalState.defaultCoverImage)
    await exportToWeb2('style.css', createStyle())
    await exportToWeb2('default.png', createDefaultImage())
    await exportToWeb2('post/default.png', createDefaultImage())
    await exportToWeb2('font-variant-1.ttf', createBrandingFontData())
    await exportToWeb2('font-variant-2.woff2', createNormalFontData())
    await exportToWeb2('font-variant-3.ttf', createArticleFontData())
    await exportToWeb2('post/font-variant-1.ttf', createBrandingFontData())
    await exportToWeb2('post/font-variant-2.woff2', createNormalFontData())
    await exportToWeb2('post/font-variant-3.ttf', createArticleFontData())
    for (const page of globalState.pages) {
        addToMantaray(node, page.path, page.html)
    }
    for (const article of globalState.articles) {
        addToMantaray(node, article.path, article.html)
    }
    for (const collection of Object.keys(globalState.collections)) {
        addToMantaray(node, createArticleSlug(collection), globalState.collections[collection])
    }
    for (const [src, reference] of Object.entries(globalState.images)) {
        addToMantaray(node, src, reference)
        addToMantaray(node, Strings.joinUrl('post', src), reference)
        if (0) {
            await exportToWeb2(src, await readFile(src))
        }
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
        'Content-Type': determineContentType(key),
        Filename: Strings.normalizeFilename(key),
        'website-index-document': 'index.html',
        'website-error-document': 'index.html'
    })
}

function encodePath(path: string): Uint8Array {
    return new TextEncoder().encode(path)
}

function determineContentType(path: string): string {
    if (path.endsWith('.css')) {
        return 'text/css'
    }
    if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
        return 'image/jpeg'
    }
    if (path.endsWith('.png')) {
        return 'image/png'
    }
    if (path.endsWith('.svg')) {
        return 'image/svg+xml'
    }
    if (path.endsWith('.webp')) {
        return 'image/webp'
    }
    return 'text/html'
}
