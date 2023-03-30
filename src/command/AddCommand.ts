import { Files } from 'cafe-node-utility'
import { Strings } from 'cafe-utility'
import { GlobalState } from '../engine/GlobalState'
import { peekFeedAddress, promptForOption, promptForText } from '../engine/SwarmUtility'
import { createArticlePage } from '../page/ArticlePage'
import { createFrontPage } from '../page/FrontPage'
import { createMenuPage } from '../page/MenuPage'

export async function executeAddCommand(globalState: GlobalState) {
    const type = await promptForOption('What type of content do you want to add?', ['Article', 'Page'])
    const title = await promptForText('What is the title of the content?')
    if (globalState.articles.some(x => x.title === title) || globalState.pages.some(x => x.title === title)) {
        throw Error('You already have a content with this title. Please choose a different title.')
    }
    if (type === 'Article') {
        const fileContent = await Files.readUtf8FileAsync(process.argv[3])
        const uploadResults = await createArticlePage(title, fileContent, globalState)
        globalState.articles.push({
            title,
            markdown: uploadResults.markdownReference,
            html: uploadResults.swarmReference,
            createdAt: Date.now()
        })
        await createFrontPage('0'.repeat(64), globalState)
        console.log(`[Jot. 🐝] Successfully added article: ${title}`)
        console.log(`[Jot. 🐝] Your front page: http://localhost:1633/bzz/${globalState.feed}`)
    }
    if (type === 'Page') {
        const topic = Strings.randomHex(64)
        const feed = await peekFeedAddress(topic, globalState)
        const page = {
            title,
            topic,
            feed,
            markdown: '',
            html: ''
        }
        globalState.pages.push(page)
        const fileContent = await Files.readUtf8FileAsync(process.argv[3])
        const uploadResults = await createMenuPage(title, fileContent, topic, globalState)
        page.markdown = uploadResults.markdownReference
        page.html = uploadResults.swarmReference
        for (const page of globalState.pages) {
            if (page.title === title) {
                continue
            }
            console.log('Regenerating page: ' + page.title)
            const rawData = await globalState.bee.downloadFile(page.markdown)
            await createMenuPage(page.title, rawData.data.text(), page.topic, globalState)
        }
        console.log('Regenerating front page')
        await createFrontPage('0'.repeat(64), globalState)
        console.log(`[Jot. 🐝] Successfully added page: ${title}`)
        console.log(`[Jot. 🐝] Your front page: http://localhost:1633/bzz/${globalState.feed}`)
    }
}
