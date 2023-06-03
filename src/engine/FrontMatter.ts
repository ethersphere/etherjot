import { Strings, Types } from 'cafe-utility'
import { load } from 'js-yaml'
import toml from 'toml'

export interface ParsedMarkdown {
    raw: string
    attributes: Record<string, unknown>
    body: string
}

export function parseMarkdown(markdown: string): ParsedMarkdown {
    if (markdown.startsWith('---')) {
        const metadata = Strings.extractBlock(markdown, { opening: '---', closing: '---', exclusive: true })
        if (!metadata) {
            return {
                raw: markdown,
                attributes: {},
                body: markdown
            }
        }
        const attributes = load(metadata)
        const body = markdown.substring(metadata.length + 6).trim()
        return {
            raw: markdown,
            attributes: Types.asObject(attributes),
            body
        }
    }
    if (markdown.startsWith('+++')) {
        const metadata = Strings.extractBlock(markdown, { opening: '+++', closing: '+++', exclusive: true })
        if (!metadata) {
            return {
                raw: markdown,
                attributes: {},
                body: markdown
            }
        }
        const attributes = toml.parse(metadata)
        const body = markdown.substring(metadata.length + 6).trim()
        return {
            raw: markdown,
            attributes,
            body
        }
    }
    return {
        raw: markdown,
        attributes: {},
        body: markdown
    }
}
