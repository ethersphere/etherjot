import { createTagCloud } from './TagCloud'

export function createPost(
    title: string,
    preview: string,
    tags: string[],
    createdAt: number,
    path: string,
    banner: string,
    kind: 'h1' | 'h2' | 'highlight' | 'regular'
): string {
    const formattedDate = new Date(createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric' })

    const image = kind === 'highlight' ? '' : `<a href="${path}"><img class="article-banner" src="${banner}"></a>`
    const meta =
        kind === 'highlight'
            ? `<p class="article-timestamp">${formattedDate}</p>`
            : `<p class="article-timestamp">${formattedDate}</p>${createTagCloud(tags, 0)}`

    return `
    <div class="article-container article-container-${kind}">
        ${image}
        <div class="article-body">
            <a href="${path}">
                <p class="article-title">${title}</p>
                <p class="article-preview">${preview}</p>
            </a>
            <div class="article-meta">
                ${meta}
            </div>
        </div>
    </div>`
}
