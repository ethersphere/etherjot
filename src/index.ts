#!/usr/bin/env node

import { executeImportCommand } from './command/ImportCommand'

async function main() {
    if (process.argv[2] === 'import') {
        await executeImportCommand()
        return
    }
}

main().catch(error => {
    console.error(error.message)
    throw error
})
