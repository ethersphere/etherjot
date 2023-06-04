#!/usr/bin/env node

import { executeAddCommand } from './command/AddCommand'
import { executeConfigureCommand } from './command/ConfigureCommand'
import { executeImportCommand } from './command/ImportCommand'
import { executeListCommand } from './command/ListCommand'
import { executePromoteCommand } from './command/PromoteCommand'
import { executePurgeCommand } from './command/PurgeCommand'
import { executeRebuildCommand } from './command/RebuildCommand'
import { executeRemoveCommand } from './command/RemoveCommand'
import { executeRootCommand } from './command/RootCommand'
import { executeSearchCommand } from './command/SearchCommand'
import { getGlobalState, saveGlobalState } from './engine/GlobalState'

async function main() {
    if (process.argv[2] === 'purge') {
        await executePurgeCommand()
        return
    }
    if (process.argv[2] === 'import') {
        await saveGlobalState(await executeImportCommand())
        return
    }
    const globalState = await getGlobalState()
    if (process.argv[2] === 'search') {
        await executeSearchCommand(globalState)
        return
    }
    if (!process.argv[2]) {
        executeRootCommand(globalState)
    } else if (process.argv[2] === 'add') {
        await executeAddCommand(globalState)
    } else if (process.argv[2] === 'rebuild') {
        await executeRebuildCommand(globalState)
    } else if (process.argv[2] === 'remove') {
        await executeRemoveCommand(globalState)
    } else if (process.argv[2] === 'list') {
        executeListCommand(globalState)
    } else if (process.argv[2] === 'configure') {
        await executeConfigureCommand(globalState)
    } else if (process.argv[2] === 'promote') {
        await executePromoteCommand(globalState)
    }
    await saveGlobalState(globalState)
}

main().catch(error => {
    console.error(error.message)
    throw error
})
