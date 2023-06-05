import { Strings } from 'cafe-utility'
import { marked } from 'marked'
import { ParsedMarkdown } from '../engine/FrontMatter'
import { GlobalState } from '../engine/GlobalState'
import { preprocess } from '../engine/Preprocessor'
import { exportToWeb2 } from '../engine/Web2Export'
import { createFooter } from '../html/Footer'
import { createHeader } from '../html/Header'
import { createHtml5 } from '../html/Html5'
import { createLinkSvg } from '../html/LinkSvg'
import { createLinkedinSvg } from '../html/LinkedinSvg'
import { createRelatedArticles } from '../html/RelatedArticles'
import { createStyleSheet } from '../html/StyleSheet'
import { createTagCloud } from '../html/TagCloud'
import { createTwitterSvg } from '../html/TwitterSvg'

export async function createArticlePage(
    title: string,
    markdown: ParsedMarkdown,
    globalState: GlobalState,
    tagsAndCategories: string[],
    banner: string,
    date: string
): Promise<{
    markdownReference: string
    swarmReference: string
    path: string
}> {
    const processedArticle = await preprocess(marked.parse(markdown.body), globalState)
    const head = `<title>${title} | ${globalState.configuration.title}</title>${createStyleSheet(1)}`
    const body = `
    ${createHeader(globalState, 1, 'Latest', 'p')}
    <main>
        <article>
            <div class="content-area grid-container">
                <div class="grid-3">
                    <p class="article-date">${date}</p>
                </div>
                <div class="grid-6">
                    ${createTagCloud(tagsAndCategories, 1)}
                    <h1>${title}</h1>
                </div>
            </div>
            <div class="content-area onpage-banner">
                <img src="${banner}" class="banner" />
            </div>
            <div class="content-area grid-container">
                <aside class="grid-3">
                    <div class="article-sidebar">
                        <div class="article-sidebar-block">
                            <h3>Jump to:</h3>
                            <div class="table-of-contents">
                                ${processedArticle.tableOfContents
                                    .map(x => `<a href="#${x}">${Strings.camelToTitle(Strings.slugToCamel(x))}</a>`)
                                    .join('')}
                            </div>
                        </div>
                        <div class="article-sidebar-block">
                            <h3>Published in:</h3>
                            ${createTagCloud(tagsAndCategories, 1)}
                        </div>
                        <div class="article-sidebar-block">
                            <h3>Share to:</h3>
                            <span id="share-link" class="pointer">${createLinkSvg()}</span>
                            <span id="share-twitter" class="pointer">${createTwitterSvg()}</span>
                            <span id="share-linkedin" class="pointer">${createLinkedinSvg()}</span>
                        </div>
                    </div>
                </aside>
                <div class="grid-6">
                    ${processedArticle.html}
                </div>
            </div>
        </article>
        <div class="content-area">
            <h2 class="read-more">Read more...</h2>
            ${createRelatedArticles(globalState, title, tagsAndCategories[0] || '')}
        </div>
    </main>
    ${createFooter(globalState, 1)}
    <script>
        const shareLink = document.getElementById('share-link')
        const shareTwitter = document.getElementById('share-twitter')
        const shareLinkedin = document.getElementById('share-linkedin')
        const url = window.location.href
        shareLink.addEventListener('click', () => {
            navigator.clipboard.writeText(url)
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 1000
              })
              Toast.fire({
                icon: 'success',
                title: 'Copied to clipboard'
              })
        })
        shareTwitter.addEventListener('click', () => {
            window.open('https://twitter.com/intent/tweet?url=' + encodeURIComponent(url))
        })
        shareLinkedin.addEventListener('click', () => {
            window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url))
        })
    </script>`
    const html = createHtml5(head, body)
    const markdownResults = await globalState.bee.uploadFile(globalState.stamp, markdown.raw, 'index.md', {
        contentType: 'text/markdown'
    })
    await exportToWeb2(`post/${Strings.slugify(title.slice(0, 80), Strings.isChinese)}.html`, html)
    const htmlResults = await globalState.bee.uploadData(globalState.stamp, html)
    const path = `post/${Strings.slugify(title.slice(0, 80), Strings.isChinese)}`
    return {
        markdownReference: markdownResults.reference,
        swarmReference: htmlResults.reference,
        path
    }
}
