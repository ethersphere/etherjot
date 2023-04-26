import { GlobalState } from '../engine/GlobalState'
import { createFooter } from '../html/Footer'
import { createHeader } from '../html/Header'
import { createHtml5 } from '../html/Html5'
import { createNav } from '../html/Nav'
import { createPostContainer } from '../html/PostContainer'
import { createStyleSheet } from '../html/StyleSheet'

export async function createCollectionPage(
    collectionName: string,
    globalState: GlobalState
): Promise<{ swarmReference: string }> {
    const head = `<title>${globalState.websiteName} | ${collectionName} Posts</title>${createStyleSheet(0)}`
    const body = `
    ${createHeader(globalState)}
    ${createNav(globalState, 0)}
    <main>
        <h1>${collectionName} Posts</h1>
        ${createPostContainer(globalState, collectionName)}
    </main>
    ${createFooter()}`
    const html = createHtml5(head, body)
    const htmlResults = await globalState.bee.uploadData(globalState.stamp, html)
    return {
        swarmReference: htmlResults.reference
    }
}
