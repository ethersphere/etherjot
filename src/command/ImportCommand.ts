import { Files } from 'cafe-node-utility'
import { Objects, Strings, Types } from 'cafe-utility'
import { readFile } from 'fs/promises'
import { load } from 'js-yaml'
import {
    GlobalState,
    createArticlePage,
    createDefaultGlobalState,
    getGlobalState,
    parseMarkdown,
    recreateMantaray,
    saveGlobalState
} from 'libetherjot'
import { marked } from 'marked'
import toml from 'toml'
import { determineContentType } from '../engine/SwarmUtility'

export async function executeImportCommand(): Promise<GlobalState> {
    console.log('Attempting to convert Jekyll/Hugo website to Swarm website')
    console.log('Loading optional configuration from .jot')
    const jotConfiguration = {}
    if (await Files.existsAsync('.jot')) {
        const jotFile = await Files.readJsonAsync('.jot')
        Objects.deepMergeInPlace(jotConfiguration, jotFile)
    }
    console.log('Loading configuration from _config.yml or config.toml')
    const websiteName = await loadConfiguration()
    console.log(`Website name: ${websiteName}`)
    console.log('Creating front page')
    const globalState = await getGlobalState(await createDefaultGlobalState(websiteName))
    Objects.setSomeDeep(globalState.configuration as any, 'header.link', jotConfiguration, 'link')
    Objects.setSomeDeep(globalState.configuration as any, 'main.highlight', jotConfiguration, 'highlight')
    Objects.setSomeDeep(globalState.configuration as any, 'footer.description', jotConfiguration, 'footer')
    Objects.setSomeDeep(globalState.configuration as any, 'footer.links.discord', jotConfiguration, 'discord')
    Objects.setSomeDeep(globalState.configuration as any, 'footer.links.twitter', jotConfiguration, 'twitter')
    Objects.setSomeDeep(globalState.configuration as any, 'footer.links.github', jotConfiguration, 'github')
    Objects.setSomeDeep(globalState.configuration as any, 'footer.links.youtube', jotConfiguration, 'youtube')
    Objects.setSomeDeep(globalState.configuration as any, 'footer.links.reddit', jotConfiguration, 'reddit')
    console.log(`Your front page: http://localhost:1633/bzz/${globalState.feed}`)
    console.log('Detecting articles')
    const articlePaths = await loadArticlePaths()
    console.log(`Found ${articlePaths.length} articles`)
    console.log('Detecting Hugo settings')
    let headerDescription = ''
    let h1Page = ''
    const h2Pages = []
    if (await Files.existsAsync('content/_index.md')) {
        console.log('Found Hugo settings')
        const fileContent = await Files.readUtf8FileAsync('content/_index.md')
        const content = parseMarkdown(fileContent)
        if (content.attributes.featured) {
            h1Page = Strings.betweenNarrow(content.attributes.featured as string, '/', '.')!
        }
        if (content.attributes.featured_secondary_first) {
            h2Pages.push(Strings.betweenNarrow(content.attributes.featured_secondary_first as string, '/', '.'))
        }
        if (content.attributes.featured_secondary_second) {
            h2Pages.push(Strings.betweenNarrow(content.attributes.featured_secondary_second as string, '/', '.'))
        }
        headerDescription = (content.attributes.description as string) || ''
        Objects.setDeep(
            globalState.configuration as any,
            'header.description',
            Strings.resolveMarkdownLinks(headerDescription, (label, link) => `<a href="${link}">${label}</a>`)
        )
    }
    for (const path of articlePaths) {
        console.log(`Processing article: ${path}`)
        const fileContent = await Files.readUtf8FileAsync(path)
        const content = parseMarkdown(fileContent)
        console.log(content.attributes)
        content.body = stripContent(content.body)
        const category = getCategory(content.attributes.categories)
        const tags = getTags(content.attributes.tags)
        const title = Types.asString(content.attributes.title || Strings.after(path, '_posts/'))
        console.log(`Article title: ${title}`)
        let bannerPath = 'default.png'
        if (content.attributes.banner) {
            const filePath = await locateFile(Types.asString(content.attributes.banner))
            const byteArray = await readFile(filePath)
            const contentType = determineContentType(filePath)
            const name = Strings.normalizeFilename(filePath)
            const hash = await globalState.swarm.newResource(name, byteArray, contentType).save()
            bannerPath = `/bzz/${hash.hash}`
            if (!globalState.assets.some(x => x.reference === hash.hash)) {
                globalState.assets.push({
                    reference: hash.hash,
                    contentType,
                    name
                })
            }
        }
        console.log(`Banner path: ${bannerPath}`)
        const createdAt = getCreatedAt(path, Types.asObject(content.attributes).date)
        const article = await createArticlePage(
            title,
            content,
            globalState,
            category,
            tags,
            bannerPath,
            new Date(createdAt).toDateString(),
            Strings.randomHex(40),
            'regular',
            marked.parse
        )
        globalState.articles = globalState.articles.filter(x => x.title !== title)
        globalState.articles.push(article)
    }
    await recreateMantaray(globalState)
    console.log('')
    console.log('Paste this to Etherjot UI to import your blog:')
    console.log(JSON.stringify(await saveGlobalState(globalState)))
    console.log('')
    console.log('Here is your blog:')
    console.log(`http://localhost:1633/bzz/${globalState.feed}/`)
    console.log('')
    return globalState
}

function getCreatedAt(path: string, value: any): number {
    if (Types.isDate(value)) {
        return value.getTime()
    }
    if (Types.isString(value)) {
        return new Date(value).getTime()
    }
    if (path.includes('_posts/')) {
        return new Date(Strings.after(path, '_posts/')!.split('-').slice(0, 3).join('-')).getTime()
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
        x => !x.toLowerCase().startsWith('_posts/license') && !x.includes('.DS_Store')
    )
    const hugoArticles = (await Files.readdirDeepAsync('content').catch(() => [])).filter(
        x =>
            !x.toLowerCase().includes('_index.md') && !x.toLowerCase().includes('search.md') && !x.includes('.DS_Store')
    )
    return [...jekyllArticles, ...hugoArticles]
}

function getCategory(some: unknown): string {
    if (some && Types.isString(some)) {
        return some
    }
    if (some && Array.isArray(some)) {
        return some[0] || 'default'
    }
    return 'default'
}

function getTags(some: unknown): string[] {
    if (some && Types.isString(some)) {
        return [some]
    }
    if (some && Array.isArray(some)) {
        return some.map(x => Types.asString(x))
    }
    return []
}

async function locateFile(src: string): Promise<string> {
    if (src.startsWith('/')) {
        src = src.substring(1)
    }
    if (await Files.existsAsync(src)) {
        return src
    }
    if (await Files.existsAsync(`static/${src}`)) {
        src = `static/${src}`
        return src
    }
    throw Error(`Unable to locate file: ${src}`)
}
