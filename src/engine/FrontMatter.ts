import { Strings } from 'cafe-utility'
import { load } from 'js-yaml'
import toml from 'toml'

export function parseMarkdown(markdown: string): {
    attributes: any
    body: string
} {
    if (markdown.startsWith('---')) {
        const metadata = Strings.extractBlock(markdown, { opening: '---', closing: '---', exclusive: true })
        if (!metadata) {
            return {
                attributes: {},
                body: markdown
            }
        }
        const attributes = load(metadata)
        const body = markdown.substring(metadata.length + 6).trim()
        return {
            attributes,
            body
        }
    }
    if (markdown.startsWith('+++')) {
        const metadata = Strings.extractBlock(markdown, { opening: '+++', closing: '+++', exclusive: true })
        if (!metadata) {
            return {
                attributes: {},
                body: markdown
            }
        }
        const attributes = toml.parse(metadata)
        const body = markdown.substring(metadata.length + 6).trim()
        return {
            attributes,
            body
        }
    }
    return {
        attributes: {},
        body: markdown
    }
}
