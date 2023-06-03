import { Objects } from 'cafe-utility'
import { GlobalState } from '../engine/GlobalState'

export async function executeListCommand(globalState: GlobalState) {
    console.log(
        JSON.stringify(Objects.removeEmptyValues(Objects.flatten(globalState.configuration as any) as any), null, 4)
    )
    globalState.doNotSave = true
    globalState.articles.forEach(x => {
        console.log(`Article: ${x.title}`)
        console.log(`Markdown: ${x.markdown}`)
        console.log(`HTML: ${x.html}`)
        console.log('')
    })
    globalState.pages.forEach(x => {
        console.log(`Page: ${x.title}`)
        console.log(`Markdown: ${x.markdown}`)
        console.log(`HTML: ${x.html}`)
        console.log('')
    })
    console.log(`[Jot. 🐝] Your front page: http://localhost:1633/bzz/${globalState.feed}`)
}
