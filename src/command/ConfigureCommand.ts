import { Objects, Strings } from 'cafe-utility'
import { GlobalState } from '../engine/GlobalState'
import { rebuildArticlePages, rebuildMenuPages } from '../engine/Rebuild'
import { promptForOption, promptForText } from '../engine/SwarmUtility'

export async function executeConfigureCommand(globalState: GlobalState) {
    const options = [
        'Title',
        'Header > Title',
        'Header > Description',
        'Header > Link',
        'Main > Highlight',
        'Footer > Description',
        'Footer > Links > Discord',
        'Footer > Links > Twitter',
        'Footer > Links > GitHub',
        'Footer > Links > YouTube',
        'Footer > Links > Reddit'
    ]
    const option = await promptForOption('What do you want to configure?', options)
    const property = Strings.slugify(option).replaceAll('-', '.')
    const value = await promptForText(`What do you want to set ${property} to?`)
    Objects.setDeep(globalState.configuration as any, property, value)
    await rebuildMenuPages(globalState)
    await rebuildArticlePages(globalState)
}
