import { Files } from 'cafe-node-utility'
import { parseMarkdown } from '../engine/FrontMatter'
import { GlobalState, getPath } from '../engine/GlobalState'

export async function executeSearchCommand(globalState: GlobalState) {
    type Value = {
        data: string
        link: string
    }
    const database: Record<string, Value> = {}
    for (const article of globalState.articles) {
        const content = await globalState.bee.downloadFile(article.markdown)
        const markdown = parseMarkdown(content.data.text())
        database[article.title] = {
            data: markdown.body,
            link: article.path
        }
    }
    await Files.writeJsonAsync(getPath('.jot.search.json'), database)
}
