import { GlobalState } from '../engine/GlobalState'

export function executeRootCommand(globalState: GlobalState) {
    console.log(`[Jot. 🐝] Your front page: http://localhost:1633/bzz/${globalState.feed}`)
}
