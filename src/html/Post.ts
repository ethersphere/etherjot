import { createTagCloud } from './TagCloud'

export function createPost(
    title: string,
    tags: string[],
    wordCount: number,
    createdAt: number,
    path: string,
    banner: string | null
): string {
    return `
    <div class="article-container">
        ${banner ? `<a href="${path}"><img class="article-banner" src="/bzz/${banner}"></a>` : ''}
        <div class="article-body">
            <a href="${path}">
                <p class="article-title">${title}</p>
                <p class="article-word-count">${wordCount} words, ${Math.ceil(wordCount / 200)} minute(s) to read</p>
                <p class="article-timestamp">${new Date(createdAt).toDateString()}</p>
            </a>
            ${createTagCloud(tags, 0)}
        </div>
    </div>`
}
