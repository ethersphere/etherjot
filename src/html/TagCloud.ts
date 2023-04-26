import { Strings } from 'cafe-utility'
import { createTag } from './Tag'

export function createTagCloud(tags: string[], depth: number): string {
    return `
    <div class="article-tags">
        ${tags.map(x => createTag(x, Strings.slugify(x), depth)).join('')}
    </div>`
}
