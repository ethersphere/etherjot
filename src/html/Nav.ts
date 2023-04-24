import { GlobalState } from '../engine/GlobalState'

export function createNav(globalState: GlobalState) {
    if (!globalState.pages.length) {
        return ''
    }
    const pages = [...globalState.pages]
    pages.unshift({ title: 'Home', feed: globalState.feed, topic: '', markdown: '', html: '' })
    return `<nav>${pages.map(x => `<a href="/bzz/${x.feed}" class="nav-item">${x.title}</a>`).join('')}</nav>`
}
