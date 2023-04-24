import { marked } from 'marked'
import { GlobalState } from '../engine/GlobalState'
import { preprocess } from '../engine/Preprocessor'
import { putToFeed } from '../engine/SwarmUtility'
import { createFooter } from '../html/Footer'
import { createHeader } from '../html/Header'
import { createHtml5 } from '../html/Html5'
import { createNav } from '../html/Nav'
import { createStyleSheet } from '../html/StyleSheet'

export async function createMenuPage(
    title: string,
    markdown: string,
    topic: string,
    globalState: GlobalState
): Promise<{
    markdownReference: string
    swarmReference: string
}> {
    const head = `<title>${title} | ${globalState.websiteName}</title>${createStyleSheet(globalState)}`
    const body = `${createHeader(globalState)}${createNav(globalState)}<main>${await preprocess(
        marked.parse(markdown),
        globalState
    )}</main>${createFooter()}`
    const html = createHtml5(head, body)
    const markdownResults = await globalState.bee.uploadFile(globalState.stamp, markdown, 'index.md', {
        contentType: 'text/markdown'
    })
    const results = await putToFeed(html, 'text/html', 'index.html', topic, globalState)
    return {
        markdownReference: markdownResults.reference,
        swarmReference: results.swarmReference
    }
}
