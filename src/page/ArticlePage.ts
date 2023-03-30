import { marked } from 'marked'
import { GlobalState } from '../engine/GlobalState'
import { preprocess } from '../engine/Preprocessor'
import { createFooter } from '../html/Footer'
import { createHeader } from '../html/Header'
import { createNav } from '../html/Nav'
import { createStyleSheet } from '../html/StyleSheet'

export async function createArticlePage(
    title: string,
    markdown: string,
    globalState: GlobalState
): Promise<{
    markdownReference: string
    swarmReference: string
}> {
    const html = `<html><head><title>${title} | ${globalState.websiteName}</title>${createStyleSheet(
        globalState
    )}</head><body>${createHeader(globalState, 'p')}${createNav(globalState)}<main><article>${await preprocess(
        marked.parse(markdown),
        globalState
    )}</article><a href="/bzz/${globalState.feed}/">Return to ${
        globalState.websiteName
    }</a></main>${createFooter()}</body></html>`
    const markdownResults = await globalState.bee.uploadFile(globalState.stamp, markdown, 'index.md', {
        contentType: 'text/markdown'
    })
    const htmlResults = await globalState.bee.uploadFile(globalState.stamp, html, 'index.html', {
        contentType: 'text/html'
    })
    return {
        markdownReference: markdownResults.reference,
        swarmReference: htmlResults.reference
    }
}
