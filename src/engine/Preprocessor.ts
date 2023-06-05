import axios from 'axios'
import { Files } from 'cafe-node-utility'
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
        let src = image.substring('<img src="'.length, image.length - '"'.length)
        if (image.startsWith('<img src="http://') || image.startsWith('<img src="https://')) {
            console.log('Downloading external image', src)
            const extension = src.substring(src.lastIndexOf('.') + 1)
            const targetPath = 'cache/' + Strings.slugify(src) + '.' + extension
            if (await Files.existsAsync(targetPath)) {
                src = targetPath
            } else {
                try {
                    const response = await axios.get(src, {
                        responseType: 'arraybuffer',
                        headers: {
                            'accept-language': 'en-GB,en;q=0.7',
                            'user-agent':
                                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36'
                        }
                    })
                    await Files.putFile(targetPath, response.data)
                    src = targetPath
                } catch {
                    console.log('Failed to download image', src)
                }
            }
        }
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
