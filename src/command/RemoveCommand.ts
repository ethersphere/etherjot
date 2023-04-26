import { GlobalState } from '../engine/GlobalState'
import { promptForOption } from '../engine/SwarmUtility'

export async function executeRemoveCommand(globalState: GlobalState) {
    const options = globalState.articles.map(x => x.title).concat(globalState.pages.map(x => x.title))
    const title = await promptForOption('What content do you want to remove?', options)
    globalState.articles = globalState.articles.filter(x => x.title !== title)
    globalState.pages = globalState.pages.filter(x => x.title !== title)
    console.log(`[Jot. 🐝] Successfully removed ${title}`)
    console.log(`[Jot. 🐝] Your front page: http://localhost:1633/bzz/${globalState.feed}`)
}
