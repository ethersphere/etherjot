import { GlobalState } from '../engine/GlobalState'
import { createPost } from './Post'

export function createPostContainer(globalState: GlobalState, filter?: string): string {
    const innerHtml = `${globalState.articles
        .filter(x => (filter ? x.categories.includes(filter) || x.tags.includes(filter) : true))
        .sort((a, b) => b.createdAt - a.createdAt)
        .map(x => createPost(x.title, [...x.tags, ...x.categories], x.wordCount, x.createdAt, x.path, x.banner))
        .join('\n')}`
    return `<div class="post-container">${innerHtml}</div>`
}
