import { GlobalState } from '../engine/GlobalState'
import { createArticleSlug } from '../engine/Utility'

export function createNav(globalState: GlobalState, depth: number, active: string) {
    const categorySet = globalState.articles.reduce((categories, article) => {
        for (const category of article.categories) {
            categories.add(category)
        }
        return categories
    }, new Set<string>())
    const categories = ['Latest', ...[...categorySet].sort((a, b) => a.localeCompare(b))]
    return `<nav>${categories
        .map(
            x =>
                `<a href="${'../'.repeat(depth)}${createArticleSlug(x)}" class="${
                    active === x ? 'nav-item nav-item-active' : 'nav-item'
                }">${x}</a>`
        )
        .join('')}</nav>`
}
