import { Strings } from 'cafe-utility'
import { createTag } from './Tag'

export function createTagCloud(tags: string[], depth: number): string {
    return tags.map(x => createTag(x, Strings.slugify(x, Strings.isChinese), depth)).join('')
}
