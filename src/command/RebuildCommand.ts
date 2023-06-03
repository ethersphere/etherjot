import { GlobalState } from '../engine/GlobalState'
import { rebuildArticlePages, rebuildMenuPages } from '../engine/Rebuild'
import { createStyle } from '../html/Style'

export async function executeRebuildCommand(globalState: GlobalState) {
    const styleResults = await globalState.bee.uploadData(globalState.stamp, createStyle())
    globalState.styleReference = styleResults.reference
    await rebuildMenuPages(globalState)
    await rebuildArticlePages(globalState)
}
