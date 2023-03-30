import { GlobalState } from '../engine/GlobalState'
import { putToFeed } from '../engine/SwarmUtility'
import { createFooter } from '../html/Footer'
import { createHeader } from '../html/Header'
import { createNav } from '../html/Nav'
import { createStyleSheet } from '../html/StyleSheet'

export async function createFrontPage(topic: string, globalState: GlobalState): Promise<{ swarmReference: string }> {
    const html = `<html><head><title>${globalState.websiteName}</title>${createStyleSheet(
        globalState
    )}</head><body>${createHeader(globalState)}${createNav(globalState)}<main>${globalState.articles
        .sort((a, b) => b.createdAt - a.createdAt)
        .map(
            x =>
                `<a href="/bzz/${x.html}"><div class="article-container"><p class="article-title">${
                    x.title
                }</p><p class="article-timestamp">${new Date(x.createdAt).toDateString()}</p></div></a>`
        )
        .join('\n')}${
        !globalState.articles.length ? '<p>This blog has no content yet.</p>' : ''
    }</main>${createFooter()}</body></html>`
    const results = await putToFeed(html, 'text/html', 'index.html', topic, globalState)
    return {
        swarmReference: results.swarmReference
    }
}
