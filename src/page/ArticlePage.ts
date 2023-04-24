import { marked } from 'marked'
import { GlobalState } from '../engine/GlobalState'
import { preprocess } from '../engine/Preprocessor'
import { createFooter } from '../html/Footer'
import { createHeader } from '../html/Header'
import { createHtml5 } from '../html/Html5'
import { createNav } from '../html/Nav'
import { createStyleSheet } from '../html/StyleSheet'

export async function createArticlePage(
    title: string,
    markdown: string,
    globalState: GlobalState,
    banner?: string
): Promise<{
    markdownReference: string
    swarmReference: string
}> {
    const head = `<title>${title} | ${globalState.websiteName}</title>${createStyleSheet(globalState)}`
    const body = `${createHeader(globalState, 'p')}${createNav(globalState)}<main><article><h1>${title}</h1>${
        banner ? `<img src="/bzz/${banner}" class="banner" />` : ''
    }${await preprocess(marked.parse(markdown), globalState)}</article><a href="/bzz/${globalState.feed}/">Return to ${
        globalState.websiteName
    }</a></main>${createFooter()}`
    const html = createHtml5(head, body)
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
