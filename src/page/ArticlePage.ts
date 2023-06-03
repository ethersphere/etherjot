import { Strings } from 'cafe-utility'
import { marked } from 'marked'
import { ParsedMarkdown } from '../engine/FrontMatter'
import { GlobalState } from '../engine/GlobalState'
import { preprocess } from '../engine/Preprocessor'
import { exportToWeb2 } from '../engine/Web2Export'
import { createFooter } from '../html/Footer'
import { createHeader } from '../html/Header'
import { createHtml5 } from '../html/Html5'
import { createRelatedArticles } from '../html/RelatedArticles'
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
    const head = `<title>${title} | ${globalState.configuration.title}</title>${createStyleSheet(1)}`
    const body = `
    ${createHeader(globalState, 1, 'Latest', 'p')}
    <main>
        <article>
            <div class="article-area">
                ${createTagCloud(tagsAndCategories, 1)}
                <h1>${title}</h1>
                ${banner ? `<img src="${banner}" class="banner" />` : ''}
                ${await preprocess(marked.parse(markdown.body), globalState)}
            </div>
        </article>
        <div class="content-area">
            <h2>Read more...</h2>
            ${createRelatedArticles(globalState, title, tagsAndCategories[0] || '')}
        </div>
    </main>
    ${createFooter(globalState)}`
    const html = createHtml5(head, body)
    const markdownResults = await globalState.bee.uploadFile(globalState.stamp, markdown.raw, 'index.md', {
        contentType: 'text/markdown'
    })
    await exportToWeb2(`post/${Strings.slugify(title.slice(0, 80))}.html`, html)
    const htmlResults = await globalState.bee.uploadData(globalState.stamp, html)
    const path = `post/${Strings.slugify(title.slice(0, 80))}`
    return {
        markdownReference: markdownResults.reference,
        swarmReference: htmlResults.reference,
        path
    }
}
