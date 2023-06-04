import { createArticlePage } from '../page/ArticlePage'
import { createMenuPage } from '../page/MenuPage'
import { parseMarkdown } from './FrontMatter'
import { GlobalState } from './GlobalState'

export async function rebuildMenuPages(globalState: GlobalState): Promise<void> {
    for (const page of globalState.pages) {
        const rawData = await globalState.bee.downloadFile(page.markdown)
        const results = await createMenuPage(page.title, rawData.data.text(), globalState)
        page.html = results.swarmReference
    }
}

export async function rebuildArticlePages(globalState: GlobalState): Promise<void> {
    for (const article of globalState.articles) {
        const rawData = await globalState.bee.downloadFile(article.markdown)
        const results = await createArticlePage(
            article.title,
            parseMarkdown(rawData.data.text()),
            globalState,
            [...article.tags, ...article.categories],
            article.banner,
            new Date(article.createdAt).toDateString()
        )
        article.html = results.swarmReference
    }
}
