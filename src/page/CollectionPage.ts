import { GlobalState } from '../engine/GlobalState'
import { createFooter } from '../html/Footer'
import { createHeader } from '../html/Header'
import { createHtml5 } from '../html/Html5'
import { createPostContainer } from '../html/PostContainer'
import { createStyleSheet } from '../html/StyleSheet'

export async function createCollectionPage(
    collectionName: string,
    globalState: GlobalState
): Promise<{ swarmReference: string }> {
    const head = `<title>${globalState.configuration.title} | ${collectionName} Posts</title>${createStyleSheet(0)}`
    const body = `
    ${createHeader(globalState, 0, collectionName)}
    <main>
        ${createPostContainer(globalState, collectionName)}
    </main>
    ${createFooter(globalState)}`
    const html = createHtml5(head, body)
    const htmlResults = await globalState.bee.uploadData(globalState.stamp, html)
    return {
        swarmReference: htmlResults.reference
    }
}
