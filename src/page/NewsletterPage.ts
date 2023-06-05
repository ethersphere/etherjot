import { Files } from 'cafe-node-utility'
import { GlobalState, getPath } from '../engine/GlobalState'
import { exportToWeb2 } from '../engine/Web2Export'
import { createFooter } from '../html/Footer'
import { createHeader } from '../html/Header'
import { createHtml5 } from '../html/Html5'
import { createStyleSheet } from '../html/StyleSheet'

export async function createNewsletterPage(globalState: GlobalState): Promise<{ swarmReference: string }> {
    const head = `<title>${globalState.configuration.title}</title>${createStyleSheet(0)}`
    const body = `
    ${createHeader(globalState, 0, 'Latest')}
    <main>
        <div class="grid-container content-area">
            <div class="grid-3"></div>
            <div class="grid-6">
                ${await Files.readUtf8FileAsync(getPath('.jot.newsletter.html'))}
            </div>
        </div>
    </main>
    ${createFooter(globalState, 0)}
`
    const html = await createHtml5(head, body)
    const htmlResults = await globalState.bee.uploadData(globalState.stamp, html)
    await exportToWeb2('newsletter.html', html)
    return {
        swarmReference: htmlResults.reference
    }
}
