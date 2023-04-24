import { Files } from 'cafe-node-utility'
import { Strings } from 'cafe-utility'
import { GlobalState } from '../engine/GlobalState'
import { peekFeedAddress, promptForOption, promptForText } from '../engine/SwarmUtility'
import { createArticlePage } from '../page/ArticlePage'
import { createFrontPage } from '../page/FrontPage'
import { createMenuPage } from '../page/MenuPage'

const intentions = {
    addArticle: 'Add a new Article',
    addPage: 'Add a new Page',
    update: 'Update an existing item'
}

export async function executeAddCommand(globalState: GlobalState) {
    const type = await promptForOption('What would you like to do?', Object.values(intentions))
    const title = await promptForText('What is the title of the content?')
    if (globalState.articles.some(x => x.title === title) || globalState.pages.some(x => x.title === title)) {
        throw Error('You already have a content with this title. Please choose a different title.')
    }
    if (type === intentions.addArticle) {
        await addNewArticle(title, globalState)
    }
    if (type === intentions.addPage) {
        await addNewPage(title, globalState)
    }
    if (type === intentions.update) {
        await updateExistingItem(globalState)
    }

    async function addNewArticle(title: string, globalState: GlobalState) {
        const fileContent = await Files.readUtf8FileAsync(process.argv[3])
        const uploadResults = await createArticlePage(title, fileContent, globalState)
        globalState.articles.push({
            title,
            markdown: uploadResults.markdownReference,
            html: uploadResults.swarmReference,
            categories: [],
            tags: [],
            wordCount: fileContent.split(' ').length,
            createdAt: Date.now()
        })
        await createFrontPage(globalState)
        console.log(`[Jot. 🐝] Successfully added article: ${title}`)
        console.log(`[Jot. 🐝] Your front page: http://localhost:1633/bzz/${globalState.feed}`)
    }

    async function addNewPage(title: string, globalState: GlobalState) {
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
        await createFrontPage(globalState)
        console.log(`[Jot. 🐝] Successfully added page: ${title}`)
        console.log(`[Jot. 🐝] Your front page: http://localhost:1633/bzz/${globalState.feed}`)
    }

    async function updateExistingItem(globalState: GlobalState) {
        const fileContent = await Files.readUtf8FileAsync(process.argv[3])
        const options = globalState.articles.map(x => x.title).concat(globalState.pages.map(x => x.title))
        const title = await promptForOption('What content do you want to update?', options)
        const isPage = globalState.pages.some(x => x.title === title)
        if (isPage) {
            const page = globalState.pages.find(x => x.title === title)!
            const uploadResults = await createMenuPage(title, fileContent, page.topic, globalState)
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
            await createFrontPage(globalState)
            console.log(`[Jot. 🐝] Successfully updated page: ${title}`)
            console.log(`[Jot. 🐝] Your front page: http://localhost:1633/bzz/${globalState.feed}`)
        } else {
            const uploadResults = await createArticlePage(title, fileContent, globalState)
            globalState.articles.push({
                title,
                markdown: uploadResults.markdownReference,
                html: uploadResults.swarmReference,
                categories: [],
                tags: [],
                wordCount: fileContent.split(' ').length,
                createdAt: Date.now()
            })
            await createFrontPage(globalState)
            console.log(`[Jot. 🐝] Successfully updated article: ${title}`)
            console.log(`[Jot. 🐝] Your front page: http://localhost:1633/bzz/${globalState.feed}`)
        }
    }
}
