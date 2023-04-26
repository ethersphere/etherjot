import { marked } from 'marked'
import { GlobalState } from '../engine/GlobalState'
import { preprocess } from '../engine/Preprocessor'
import { createFooter } from '../html/Footer'
import { createHeader } from '../html/Header'
import { createHtml5 } from '../html/Html5'
import { createNav } from '../html/Nav'
import { createStyleSheet } from '../html/StyleSheet'

export async function createMenuPage(
    title: string,
    markdown: string,
    globalState: GlobalState
): Promise<{
    markdownReference: string
    swarmReference: string
}> {
    const head = `<title>${title} | ${globalState.websiteName}</title>${createStyleSheet(0)}`
    const body = `${createHeader(globalState)}${createNav(globalState, 0)}<main>${await preprocess(
        marked.parse(markdown),
        globalState
    )}</main>${createFooter()}`
    const html = createHtml5(head, body)
    const markdownResults = await globalState.bee.uploadFile(globalState.stamp, markdown, 'index.md', {
        contentType: 'text/markdown'
    })
    const htmlResults = await globalState.bee.uploadData(globalState.stamp, html)
    return {
        markdownReference: markdownResults.reference,
        swarmReference: htmlResults.reference
    }
}
