#!/usr/bin/env node

import { executeAddCommand } from './command/AddCommand'
import { executeListCommand } from './command/ListCommand'
import { executeRemoveCommand } from './command/RemoveCommand'
import { executeRootCommand } from './command/RootCommand'
import { getGlobalState, saveGlobalState } from './engine/GlobalState'

async function main() {
    const globalState = await getGlobalState()
    if (!process.argv[2]) {
        executeRootCommand(globalState)
    } else if (process.argv[2] === 'add') {
        await executeAddCommand(globalState)
    } else if (process.argv[2] === 'remove') {
        await executeRemoveCommand(globalState)
    } else if (process.argv[2] === 'list') {
        executeListCommand(globalState)
    }
    await saveGlobalState(globalState)
}

main().catch(error => console.error(error.message))
