import { Files } from 'cafe-node-utility'
import { Types } from 'cafe-utility'
import { parseMarkdown } from '../engine/FrontMatter'
import { GlobalState } from '../engine/GlobalState'
import { uploadImage } from '../engine/ImageUploader'
import { getTagsOrCategories } from '../engine/Metadata'
import { rebuildArticlePages, rebuildMenuPages } from '../engine/Rebuild'
import { promptForText } from '../engine/SwarmUtility'
import { createArticleSlug } from '../engine/Utility'
import { createArticlePage } from '../page/ArticlePage'
import { createMenuPage } from '../page/MenuPage'

const intentions = {
    addArticle: 'Add a new Article',
    addPage: 'Add a new Page'
}

export async function executeAddCommand(globalState: GlobalState) {
    const type = intentions.addArticle

    if (type === intentions.addArticle) {
        await addNewArticle(globalState)
    }
    if (type === intentions.addPage) {
        const title = await promptForText('What is the title of your page?')
        if (globalState.pages.some(x => x.title === title)) {
            throw Error('You already have a page with this title. Please choose a different title.')
        }
        await addNewPage(title, globalState)
        await rebuildMenuPages(globalState)
        await rebuildArticlePages(globalState)
    }

    async function addNewArticle(globalState: GlobalState) {
        const fileContent = await Files.readUtf8FileAsync(process.argv[3])
        const content = parseMarkdown(fileContent)
        let title: string
        if (Types.isString(content.attributes.title)) {
            title = content.attributes.title
        } else {
            title = await promptForText('What is the title of your article?')
        }
        const categories = getTagsOrCategories(content.attributes.categories)
        const tags = getTagsOrCategories(content.attributes.tags)
        if (globalState.articles.some(x => x.title === title)) {
            throw Error('You already have an article with this title. Please choose a different title.')
        }
        let banner = 'default.png'
        if (content.attributes.banner) {
            let bannerPath = Types.asString(content.attributes.banner)
            if (bannerPath.startsWith('/')) {
                bannerPath = bannerPath.slice(1)
            }
            banner = bannerPath
            if (!globalState.images[bannerPath]) {
                const uploadedImage = await uploadImage(globalState, bannerPath)
                globalState.images[bannerPath] = uploadedImage.reference
            }
        }
        const uploadResults = await createArticlePage(
            title,
            content,
            globalState,
            [...tags, ...categories],
            banner,
            new Date().toDateString()
        )
        globalState.articles.push({
            title,
            preview: content.body.slice(0, 150),
            markdown: uploadResults.markdownReference,
            html: uploadResults.swarmReference,
            categories,
            tags,
            wordCount: content.body.split(' ').length,
            createdAt: Date.now(),
            path: `post/${createArticleSlug(title)}`,
            banner,
            kind: 'regular'
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
            path: createArticleSlug(title)
        }
        globalState.pages.push(page)
        console.log(`[Jot. 🐝] Successfully added page: ${title}`)
        console.log(`[Jot. 🐝] Your front page: http://localhost:1633/bzz/${globalState.feed}`)
    }
}
