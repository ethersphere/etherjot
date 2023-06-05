import { Strings } from 'cafe-utility'
import { GlobalState } from './GlobalState'
import { uploadImage } from './ImageUploader'

interface PreprocessedPage {
    html: string
    tableOfContents: string[]
}

export async function preprocess(html: string, globalState: GlobalState): Promise<PreprocessedPage> {
    const images = Strings.extractAllBlocks(html, {
        opening: '<img src="',
        closing: '"'
    })
    for (const image of images) {
        if (image.startsWith('<img src="http://') || image.startsWith('<img src="https://')) {
            console.log('Skipping external image', image)
            continue
        }
        const src = image.substring('<img src="'.length, image.length - '"'.length)
        const relativeSrc = src.startsWith('/') ? src.substring(1) : src
        if (!globalState.images[relativeSrc]) {
            const uploadedImage = await uploadImage(globalState, relativeSrc)
            globalState.images[relativeSrc] = uploadedImage.reference
        }
        html = html.replace(image, `<img src="../${relativeSrc}"`)
    }
    const tableOfContents = Strings.extractAllBlocks(html, {
        opening: 'id="',
        closing: '"',
        exclusive: true
    })
    return { html, tableOfContents }
}
