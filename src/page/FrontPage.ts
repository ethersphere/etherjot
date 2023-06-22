import { GlobalState } from '../engine/GlobalState'
import { exportToWeb2 } from '../engine/Web2Export'
import { createFooter } from '../html/Footer'
import { createHeader } from '../html/Header'
import { createHtml5 } from '../html/Html5'
import { createPostContainer } from '../html/PostContainer'
import { createStyleSheet } from '../html/StyleSheet'
import { createCollectionPage } from './CollectionPage'

export async function createFrontPage(globalState: GlobalState): Promise<{ swarmReference: string }> {
    await buildCollectionPages(globalState)
    const head = `<title>${globalState.configuration.title}</title>${createStyleSheet(0)}`
    const body = `
    ${await createHeader(globalState, 0, 'Latest')}
    <main>
        <div class="content-area">
            ${globalState.articles.length === 0 ? '<p class="no-content">This blog has no content yet.</p>' : ''}
            ${createPostContainer(globalState)}
        </div>
    </main>
    ${await createFooter(globalState, 0)}`
    const html = await createHtml5(head, body)
    const htmlResults = await globalState.bee.uploadData(globalState.stamp, html)
    await exportToWeb2('index.html', html)
    return {
        swarmReference: htmlResults.reference
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
