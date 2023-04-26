import { Files } from 'cafe-node-utility'
import { Strings, Types } from 'cafe-utility'
import { readdir } from 'fs/promises'
import { load } from 'js-yaml'
import toml from 'toml'
import { parseMarkdown } from '../engine/FrontMatter'
import { GlobalState, getGlobalState } from '../engine/GlobalState'
import { uploadImage } from '../engine/ImageUploader'
import { createArticlePage } from '../page/ArticlePage'
import { createFrontPage } from '../page/FrontPage'
import { createMenuPage } from '../page/MenuPage'

export async function executeImportCommand(): Promise<GlobalState> {
    console.log('Attempting to convert Jekyll/Hugo website to Swarm website')
    console.log('Loading configuration from _config.yml or config.toml')
    const websiteName = await loadConfiguration()
    console.log(`Website name: ${websiteName}`)
    console.log('Creating front page')
    const globalState = await getGlobalState(websiteName)
    console.log(`Your front page: http://localhost:1633/bzz/${globalState.feed}`)
    console.log('Detecting pages')
    const pagePaths = (await readdir('.'))
        .filter(x => !x.toLowerCase().startsWith('readme.'))
        .filter(x => !x.toLowerCase().startsWith('404.'))
        .filter(x => !x.toLowerCase().startsWith('license'))
        .filter(x => x.endsWith('.md') || x.endsWith('.markdown'))
        .filter(x => !x.startsWith('index.'))
    console.log(`Found ${pagePaths.length} pages`)
    console.log('Detecting articles')
    const articlePaths = await loadArticlePaths()
    console.log(`Found ${articlePaths.length} articles`)
    for (const path of pagePaths) {
        console.log(`Processing page: ${path}`)
        const fileContent = await Files.readUtf8FileAsync(path)
        const content = parseMarkdown(fileContent)
        const body = stripContent(content.body)
        const title = Types.asString(Types.asObject(content.attributes).title)
        console.log(`Page title: ${title}`)
        const page = {
            title,
            markdown: '',
            html: '',
            path: Strings.slugify(Strings.getBasename(path)).slice(0, 42)
        }
        globalState.pages = globalState.pages.filter(x => x.title !== title)
        globalState.pages.push(page)
        const uploadResults = await createMenuPage(title, body, globalState)
        page.markdown = uploadResults.markdownReference
        page.html = uploadResults.swarmReference
    }
    for (const path of articlePaths) {
        console.log(`Processing article: ${path}`)
        const fileContent = await Files.readUtf8FileAsync(path)
        const content = parseMarkdown(fileContent)
        content.body = stripContent(content.body)
        const categories = getTagsOrCategories(content.attributes.categories)
        const tags = getTagsOrCategories(content.attributes.tags)
        const title = Types.asString(content.attributes.title || Strings.after(path, '_posts/'))
        console.log(`Article title: ${title}`)
        let banner = null
        if (content.attributes.banner) {
            const bannerPath = Types.asString(content.attributes.banner)
            if (!globalState.images[bannerPath]) {
                const imageReference = await uploadImage(globalState, 'banner', bannerPath)
                globalState.images[bannerPath] = imageReference
                banner = imageReference
            } else {
                banner = globalState.images[bannerPath]
            }
        }
        const uploadResults = await createArticlePage(title, content, globalState, [...tags, ...categories], banner)
        globalState.articles = globalState.articles.filter(x => x.title !== title)
        const article = {
            title,
            markdown: uploadResults.markdownReference,
            html: uploadResults.swarmReference,
            tags,
            categories,
            wordCount: content.body.split(' ').length,
            createdAt: getCreatedAt(path, Types.asObject(content.attributes).date),
            banner,
            path: uploadResults.path
        }
        globalState.articles.push(article)
    }
    console.log('Rebuilding front page')
    await createFrontPage(globalState)
    console.log(`[Jot. 🐝] Your front page: http://localhost:1633/bzz/${globalState.feed}`)
    return globalState
}

function getTagsOrCategories(value: any): string[] {
    if (Array.isArray(value)) {
        return value.map(x => Strings.capitalize(Types.asString(x)))
    }
    if (Types.isString(value)) {
        return [Strings.capitalize(value)]
    }
    return []
}

function getCreatedAt(path: string, value: any): number {
    if (Types.isDate(value)) {
        return value.getTime()
    }
    if (Types.isString(value)) {
        return new Date(value).getTime()
    }
    if (path.includes('_posts/')) {
        return new Date(Strings.after(path, '_posts/').split('-').slice(0, 3).join('-')).getTime()
    }
    return Date.now()
}

function stripContent(content: string): string {
    const forBlocks = Strings.extractAllBlocks(content, { opening: '{% for ', closing: '{% endfor %}' })
    for (const block of forBlocks) {
        content = content.replace(block, '')
    }
    const ifBlocks = Strings.extractAllBlocks(content, { opening: '{% if ', closing: '{% endif %}' })
    for (const block of ifBlocks) {
        content = content.replace(block, '')
    }
    return content
}

async function loadConfiguration(): Promise<string> {
    if (await Files.existsAsync('_config.yml')) {
        const configuration = Types.asObject(load(await Files.readUtf8FileAsync('_config.yml')))
        const websiteName = Types.asString(configuration.title)
        return websiteName
    } else if (await Files.existsAsync('config.toml')) {
        const configuration = toml.parse(await Files.readUtf8FileAsync('config.toml'))
        const websiteName = Types.asString(configuration.title)
        return websiteName
    }
    return 'Awesome Blog'
}

async function loadArticlePaths(): Promise<string[]> {
    const jekyllArticles = (await Files.readdirDeepAsync('_posts').catch(() => [])).filter(
        x => !x.toLowerCase().startsWith('_posts/license')
    )
    const hugoArticles = (await Files.readdirDeepAsync('content').catch(() => [])).filter(
        x => !x.toLowerCase().includes('_index.md') && !x.toLowerCase().includes('search.md')
    )
    return [...jekyllArticles, ...hugoArticles]
}
