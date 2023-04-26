import { Files } from 'cafe-node-utility'
import { Strings, Types } from 'cafe-utility'
import { parseMarkdown } from '../engine/FrontMatter'
import { GlobalState } from '../engine/GlobalState'
import { uploadImage } from '../engine/ImageUploader'
import { getTagsOrCategories } from '../engine/Metadata'
import { promptForOption, promptForText } from '../engine/SwarmUtility'
import { createArticlePage } from '../page/ArticlePage'
import { createMenuPage } from '../page/MenuPage'

const intentions = {
    addArticle: 'Add a new Article',
    addPage: 'Add a new Page'
}

export async function executeAddCommand(globalState: GlobalState) {
    const type = await promptForOption('What would you like to do?', Object.values(intentions))

    if (type === intentions.addArticle) {
        await addNewArticle(globalState)
    }
    if (type === intentions.addPage) {
        const title = await promptForText('What is the title of your page?')
        if (globalState.pages.some(x => x.title === title)) {
            throw Error('You already have a page with this title. Please choose a different title.')
        }
        await addNewPage(title, globalState)
        for (const page of globalState.pages) {
            const rawData = await globalState.bee.downloadFile(page.markdown)
            const results = await createMenuPage(page.title, rawData.data.text(), globalState)
            page.html = results.swarmReference
        }
        for (const article of globalState.articles) {
            const rawData = await globalState.bee.downloadFile(article.markdown)
            const results = await createArticlePage(
                article.title,
                parseMarkdown(rawData.data.text()),
                globalState,
                [...article.tags, ...article.categories],
                article.banner
            )
            article.html = results.swarmReference
        }
    }

    async function addNewArticle(globalState: GlobalState) {
        const fileContent = await Files.readUtf8FileAsync(process.argv[3])
        const content = parseMarkdown(fileContent)
        const title = content.attributes.title || (await promptForText('What is the title of your article?'))
        const categories = getTagsOrCategories(content.attributes.categories)
        const tags = getTagsOrCategories(content.attributes.tags)
        if (globalState.articles.some(x => x.title === title)) {
            throw Error('You already have an article with this title. Please choose a different title.')
        }
        let banner = null
        if (content.attributes.banner) {
            const bannerPath = Types.asString(content.attributes.banner)
            if (!globalState.images[bannerPath]) {
                const imageReference = await uploadImage(globalState, Strings.getBasename(bannerPath), bannerPath)
                globalState.images[bannerPath] = imageReference
                banner = imageReference
            } else {
                banner = globalState.images[bannerPath]
            }
        }
        const uploadResults = await createArticlePage(title, content, globalState, [...tags, ...categories], banner)
        globalState.articles.push({
            title,
            markdown: uploadResults.markdownReference,
            html: uploadResults.swarmReference,
            categories,
            tags,
            wordCount: content.body.split(' ').length,
            createdAt: Date.now(),
            path: `post/${Strings.slugify(title).slice(0, 80)}`,
            banner
        })
        console.log(`[Jot. 🐝] Successfully added article: ${title}`)
        console.log(`[Jot. 🐝] Your front page: http://localhost:1633/bzz/${globalState.feed}`)
    }

    async function addNewPage(title: string, globalState: GlobalState) {
        const fileContent = await Files.readUtf8FileAsync(process.argv[3])
        const uploadResults = await createMenuPage(title, fileContent, globalState)
        const page = {
            title,
            markdown: uploadResults.markdownReference,
            html: uploadResults.swarmReference,
            path: Strings.slugify(title).slice(0, 42)
        }
        globalState.pages.push(page)
        console.log(`[Jot. 🐝] Successfully added page: ${title}`)
        console.log(`[Jot. 🐝] Your front page: http://localhost:1633/bzz/${globalState.feed}`)
    }
}
