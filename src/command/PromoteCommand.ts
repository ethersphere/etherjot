import { GlobalState } from '../engine/GlobalState'
import { rebuildArticlePages, rebuildMenuPages } from '../engine/Rebuild'
import { promptForOption } from '../engine/SwarmUtility'

export async function executePromoteCommand(globalState: GlobalState) {
    const options = ['H1', 'H2', 'Highlight', 'Regular']
    const articles = globalState.articles.map(x => x.title)
    const article = await promptForOption('Which article do you want to promote?', articles)
    const option = await promptForOption('What do you want to promote it to?', options)
    globalState.articles.find(x => x.title === article)!.kind = option.toLowerCase() as any
    await rebuildMenuPages(globalState)
    await rebuildArticlePages(globalState)
}
