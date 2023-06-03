import { Strings } from 'cafe-utility'
import { GlobalState } from '../engine/GlobalState'

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
                `<a href="${'../'.repeat(depth)}${Strings.slugify(x)}" class="${
                    active === x ? 'nav-item nav-item-active' : 'nav-item'
                }">${x}</a>`
        )
        .join('')}</nav>`
}
