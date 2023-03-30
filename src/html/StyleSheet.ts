import { GlobalState } from '../engine/GlobalState'

export function createStyleSheet(globalState: GlobalState) {
    return `<link rel="stylesheet" href="http://localhost:1633/bzz/${globalState.style}" />`
}
