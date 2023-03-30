import { GlobalState } from '../engine/GlobalState'

export function createHeader(globalState: GlobalState, variant = 'h1') {
    return `<header><${variant} class="blog-name">${globalState.websiteName}</${variant}></header>`
}
