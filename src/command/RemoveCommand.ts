import { GlobalState } from '../engine/GlobalState'
import { promptForOption } from '../engine/SwarmUtility'
import { createFrontPage } from '../page/FrontPage'
import { createMenuPage } from '../page/MenuPage'

export async function executeRemoveCommand(globalState: GlobalState) {
    const options = globalState.articles.map(x => x.title).concat(globalState.pages.map(x => x.title))
    const title = await promptForOption('What content do you want to remove?', options)
    const isPage = globalState.pages.some(x => x.title === title)
    globalState.articles = globalState.articles.filter(x => x.title !== title)
    globalState.pages = globalState.pages.filter(x => x.title !== title)
    await createFrontPage(globalState)
    if (isPage) {
        for (const page of globalState.pages) {
            console.log('Regenerating page: ' + page.title)
            const rawData = await globalState.bee.downloadFile(page.markdown)
            await createMenuPage(page.title, rawData.data.text(), page.topic, globalState)
        }
    }
    console.log(`[Jot. 🐝] Successfully removed ${title}`)
    console.log(`[Jot. 🐝] Your front page: http://localhost:1633/bzz/${globalState.feed}`)
}
