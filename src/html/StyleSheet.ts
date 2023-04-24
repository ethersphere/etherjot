import { GlobalState } from '../engine/GlobalState'

export function createStyleSheet(globalState: GlobalState) {
    return `<link rel="stylesheet" href="/bzz/${globalState.style}" />`
}
