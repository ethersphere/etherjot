import { prompt } from 'inquirer'
import { GlobalState } from './GlobalState'

export async function peekFeedAddress(topic: string, globalState: GlobalState): Promise<string> {
    const manifest = await globalState.bee.createFeedManifest(
        globalState.stamp,
        'sequence',
        topic,
        globalState.wallet.getAddressString()
    )
    return manifest.reference
}

export async function putToFeed(
    content: string,
    contentType: string,
    name: string,
    topic: string,
    globalState: GlobalState
): Promise<{ swarmReference: string }> {
    const uploadResults = await globalState.bee.uploadFile(globalState.stamp, content, name, { contentType })
    const writer = globalState.bee.makeFeedWriter('sequence', topic, globalState.wallet.getPrivateKeyString())
    await writer.upload(globalState.stamp, uploadResults.reference)
    return {
        swarmReference: uploadResults.reference
    }
}

export async function promptForText(message: string, defaultText = 'Untitled'): Promise<string> {
    const value = await prompt({
        type: 'input',
        name: 'value',
        message,
        default: defaultText
    }).then(x => x.value)
    return value
}

export async function promptForOption(message: string, options: string[]): Promise<string> {
    const value = await prompt({
        type: 'list',
        name: 'value',
        message,
        choices: options
    }).then(x => x.value)
    return value
}
