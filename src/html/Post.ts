import { GlobalState } from '../engine/GlobalState'
import { createTag } from './Tag'

export function createPost(
    globalState: GlobalState,
    title: string,
    html: string,
    tags: string[],
    wordCount: number,
    createdAt: number,
    banner?: string
): string {
    return `
    <div class="article-container">
        ${banner ? `<a href="/bzz/${html}"><img class="article-banner" src="/bzz/${banner}"></a>` : ''}
        <div class="article-body">
            <a href="/bzz/${html}">
                <p class="article-title">${title}</p>
                <p class="article-word-count">${wordCount} words, ${Math.ceil(wordCount / 200)} minute(s) to read</p>
                <p class="article-timestamp">${new Date(createdAt).toDateString()}</p>
            </a>
            <div class="article-tags">
                ${tags.map(x => createTag(x, globalState.collections[x])).join('')}
            </div>
        </div>
    </div>`
}
