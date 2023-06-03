import { unlink } from 'fs/promises'
import { getPath } from '../engine/GlobalState'

export async function executePurgeCommand() {
    await unlink(getPath())
}
