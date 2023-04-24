import { GlobalState } from '../engine/GlobalState'
import { putToFeed } from '../engine/SwarmUtility'
import { createFooter } from '../html/Footer'
import { createHeader } from '../html/Header'
import { createHtml5 } from '../html/Html5'
import { createNav } from '../html/Nav'
import { createPostContainer } from '../html/PostContainer'
import { createStyleSheet } from '../html/StyleSheet'
import { createTag } from '../html/Tag'
import { createCollectionPage } from './CollectionPage'

export async function createFrontPage(globalState: GlobalState): Promise<{ swarmReference: string }> {
    await buildCollectionPages(globalState)
    const head = `<title>${globalState.websiteName}</title>${createStyleSheet(globalState)}`
    const body = `
    ${createHeader(globalState)}
    ${createNav(globalState)}
    <main>
        <h1>Posts</h1>
        ${createPostContainer(globalState)}
        ${!globalState.articles.length ? '<p>This blog has no content yet.</p>' : ''}
        <h1>Tags</h1>
        ${Object.entries(globalState.collections)
            .map(x => createTag(x[0], x[1]))
            .join('')}
    </main>
    ${createFooter()}`
    const html = createHtml5(head, body)
    const results = await putToFeed(html, 'text/html', 'index.html', '00'.repeat(32), globalState)
    return {
        swarmReference: results.swarmReference
    }
}

async function buildCollectionPages(globalState: GlobalState) {
    const uniqueCategories = new Set<string>()
    const uniqueTags = new Set<string>()
    for (const article of globalState.articles) {
        for (const category of article.categories) {
            uniqueCategories.add(category)
        }
        for (const tag of article.tags) {
            uniqueTags.add(tag)
        }
    }
    for (const category of uniqueCategories) {
        const { swarmReference } = await createCollectionPage(category, globalState)
        globalState.collections[category] = swarmReference
    }
    for (const tag of uniqueTags) {
        const { swarmReference } = await createCollectionPage(tag, globalState)
        globalState.collections[tag] = swarmReference
    }
}
