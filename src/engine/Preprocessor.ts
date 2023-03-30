import { Strings } from 'cafe-utility'
import { readFile } from 'fs/promises'
import { GlobalState } from './GlobalState'

export async function preprocess(html: string, globalState: GlobalState): Promise<string> {
    const images = Strings.extractAllBlocks(html, {
        opening: '<img src="',
        closing: '"'
    })
    for (const image of images) {
        const src = image.substring('<img src="'.length, image.length - '"'.length)
        const name = Strings.afterLast(src, '/')
        let reference = ''
        if (globalState.images[src]) {
            reference = globalState.images[src]
        } else {
            const results = await globalState.bee.uploadFile(globalState.stamp, await readFile(src), name, {
                contentType: 'image/png'
            })
            reference = results.reference
            globalState.images[src] = reference
        }
        html = html.replace(image, `<img src="/bzz/${reference}"`)
    }
    return html
}
