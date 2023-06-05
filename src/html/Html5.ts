import { Files } from 'cafe-node-utility'
import { getPath } from '../engine/GlobalState'

export async function createHtml5(head: string, body: string): Promise<string> {
    let analytics = ''
    if (await Files.existsAsync(getPath('.jot.analytics.html'))) {
        analytics = await Files.readUtf8FileAsync(getPath('.jot.analytics.html'))
    }
    return `
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8">
            <link rel="icon" href="favicon.png">
            ${analytics}
            ${head}
        </head>
        <body>
            ${body}
        </body>
    </html>`
}
