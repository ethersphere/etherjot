import { Strings } from 'cafe-utility'
import { marked } from 'marked'
import { ParsedMarkdown } from '../engine/FrontMatter'
import { GlobalState } from '../engine/GlobalState'
import { preprocess } from '../engine/Preprocessor'
import { createFooter } from '../html/Footer'
import { createHeader } from '../html/Header'
import { createHtml5 } from '../html/Html5'
import { createNav } from '../html/Nav'
import { createStyleSheet } from '../html/StyleSheet'
import { createTagCloud } from '../html/TagCloud'

export async function createArticlePage(
    title: string,
    markdown: ParsedMarkdown,
    globalState: GlobalState,
    tagsAndCategories: string[],
    banner: string | null
): Promise<{
    markdownReference: string
    swarmReference: string
    path: string
}> {
    const head = `<title>${title} | ${globalState.websiteName}</title>${createStyleSheet(1)}`
    const body = `
    ${createHeader(globalState, 'p')}
    ${createNav(globalState, 1)}
    <main>
        <article>
            <h1>${title}</h1>
            ${banner ? `<img src="/bzz/${banner}" class="banner" />` : ''}
            ${await preprocess(marked.parse(markdown.body), globalState)}</article>
            ${createTagCloud(tagsAndCategories, 1)}
            <a href="../">Return to ${globalState.websiteName}</a>
        </main>
        ${createFooter()}`
    const html = createHtml5(head, body)
    const markdownResults = await globalState.bee.uploadFile(globalState.stamp, markdown.raw, 'index.md', {
        contentType: 'text/markdown'
    })
    const htmlResults = await globalState.bee.uploadData(globalState.stamp, html)
    const path = `post/${Strings.slugify(title.slice(0, 80))}`
    return {
        markdownReference: markdownResults.reference,
        swarmReference: htmlResults.reference,
        path
    }
}
