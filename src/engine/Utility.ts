import { Strings } from 'cafe-utility'

export function createArticleSlug(title: string): string {
    return Strings.slugify(title.slice(0, 80), Strings.isChinese)
}
