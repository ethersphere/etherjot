import { Files } from 'cafe-node-utility'
import { Strings } from 'cafe-utility'

export async function exportToWeb2(path: string, content: string | Buffer): Promise<void> {
    await Files.putFile(Strings.joinUrl('dist', path), content as string)
}
