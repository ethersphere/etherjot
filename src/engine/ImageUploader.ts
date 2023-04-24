import { Files } from 'cafe-node-utility'
import { readFile } from 'fs/promises'
import { GlobalState } from './GlobalState'

export async function uploadImage(globalState: GlobalState, name: string, path: string): Promise<string> {
    path = await locateFile(path)
    const results = await globalState.bee.uploadFile(globalState.stamp, await readFile(path), name, {
        contentType: determineContentType(path)
    })
    return results.reference
}

async function locateFile(src: string): Promise<string> {
    if (src.startsWith('/')) {
        src = src.substring(1)
    }
    if (await Files.existsAsync(src)) {
        return src
    }
    if (await Files.existsAsync(`static/${src}`)) {
        return `static/${src}`
    }
    throw Error(`Unable to locate file: ${src}`)
}

function determineContentType(path: string): string {
    path = path.toLowerCase()
    if (path.endsWith('.png')) {
        return 'image/png'
    }
    if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
        return 'image/jpeg'
    }
    if (path.endsWith('.webp')) {
        return 'image/webp'
    }
    if (path.endsWith('.gif')) {
        return 'image/gif'
    }
    if (path.endsWith('.svg')) {
        return 'image/svg+xml'
    }
    return 'application/octet-stream'
}
