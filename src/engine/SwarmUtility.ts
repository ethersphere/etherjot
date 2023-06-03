import { prompt } from 'inquirer'

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
