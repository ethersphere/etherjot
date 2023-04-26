import { GlobalState } from '../engine/GlobalState'

export function createNav(globalState: GlobalState, depth: number) {
    if (!globalState.pages.length) {
        return ''
    }
    const pages = [...globalState.pages]
    pages.unshift({ title: 'Home', markdown: '', html: '', path: 'index.html' })
    return `<nav>${pages
        .map(x => `<a href="${'../'.repeat(depth)}${x.path}" class="nav-item">${x.title}</a>`)
        .join('')}</nav>`
}
