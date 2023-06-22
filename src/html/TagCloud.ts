import { createArticleSlug } from '../engine/Utility'
import { createTag } from './Tag'

export function createTagCloud(tags: string[], depth: number): string {
    return tags.map(x => createTag(x, createArticleSlug(x), depth)).join('')
}
