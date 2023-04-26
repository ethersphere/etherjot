import { Strings } from 'cafe-utility'
import { GlobalState } from './GlobalState'
import { uploadImage } from './ImageUploader'

export async function preprocess(html: string, globalState: GlobalState): Promise<string> {
    const images = Strings.extractAllBlocks(html, {
        opening: '<img src="',
        closing: '"'
    })
    for (const image of images) {
        if (image.startsWith('<img src="http://') || image.startsWith('<img src="https://')) {
            continue
        }
        const src = image.substring('<img src="'.length, image.length - '"'.length)
        const name = Strings.afterLast(src, '/')
        let reference = ''
        if (globalState.images[src]) {
            reference = globalState.images[src]
        } else {
            reference = await uploadImage(globalState, name, src)
            globalState.images[src] = reference
        }
        html = html.replace(image, `<img src="/bzz/${reference}"`)
    }
    return html
}
