import { Files } from 'cafe-node-utility'
import { Strings } from 'cafe-utility'
import { readFile } from 'fs/promises'
import { GlobalState } from './GlobalState'
import { exportToWeb2 } from './Web2Export'

interface FileInformation {
    name: string
    path: string
    contentType: string
}

interface UploadedFile {
    reference: string
    path: string
}

export async function uploadImage(globalState: GlobalState, path: string): Promise<UploadedFile> {
    const locatedFile = await locateFile(path)
    const buffer = await readFile(locatedFile.path)
    const web2Path = path.startsWith('/') ? path.substring(1) : path
    await exportToWeb2(web2Path, buffer)
    await exportToWeb2(Strings.joinUrl('post', web2Path), buffer)
    const results = await globalState.bee.uploadData(globalState.stamp, buffer)
    return {
        reference: results.reference,
        path: locatedFile.path
    }
}

async function locateFile(src: string): Promise<FileInformation> {
    if (src.startsWith('/')) {
        src = src.substring(1)
    }
    if (await Files.existsAsync(src)) {
        const parsedFile = Strings.parseFilename(src)
        const contentType = determineContentType(src)
        return {
            path: src,
            name: parsedFile.filename,
            contentType
        }
    }
    if (await Files.existsAsync(`static/${src}`)) {
        src = `static/${src}`
        const parsedFile = Strings.parseFilename(src)
        const contentType = determineContentType(src)
        return {
            path: src,
            name: parsedFile.filename,
            contentType
        }
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
