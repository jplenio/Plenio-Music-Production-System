/** Blocks saved before they followed the brief's creativity, brought up to date as a workflow opens (owner's
 * report 2026-10-20): which workflows are sent to the backend, the graph changed in place, the toasts. */
import { describe, expect, it } from 'vitest'

import type { BlocksUpgrade, Fetcher } from '../src/api/client'
import type { BlocksUpgrade as Answer } from '../src/api/client'
import { upgradeBlocks } from '../src/api/client'
import {
  blocksMessages,
  bringBlocksUpToDate,
  mayBeOutdated,
  modelBlocksMessages,
  oldModelBlocks,
  oldModelBlocksMessage
} from '../src/extension/blocks'

const block = (name: string, ...types: string[]) => ({ id: name, name, nodes: types.map((type, id) => ({ id, type })) })
const graph = (...subgraphs: unknown[]) => ({ nodes: [{ id: 1 }], links: [], definitions: { subgraphs } })

function fetcher(answer: BlocksUpgrade, sent: unknown[] = []): Fetcher {
  return {
    async fetchApi(route: string, options?: RequestInit) {
      sent.push([route, JSON.parse(String(options?.body))])
      return new Response(JSON.stringify(answer), { status: 200 })
    }
  }
}

const NOTHING: BlocksUpgrade = { workflow: null, updated: [], kept: [], linked: [], unlinked: [] }

describe('blocks saved before the creativity', () => {
  it('are the Plenio blocks that sample without a Creativity node', () => {
    expect(mayBeOutdated(graph(block('Plenio · YuE2 Plan', 'YuE2GenerateABC', 'PrimitiveInt')))).toBe(true)
    expect(mayBeOutdated(graph(block('Plenio · Write Song', 'PlenioComposePrompt', 'TextGenerate')))).toBe(true)
    // up to date, a block that does not sample, a block of one's own, no blocks at all
    expect(mayBeOutdated(graph(block('Plenio · YuE2 Plan', 'YuE2GenerateABC', 'PlenioCreativity')))).toBe(false)
    expect(mayBeOutdated(graph(block('Plenio · Master', 'PlenioEQ', 'PlenioLoudness')))).toBe(false)
    expect(mayBeOutdated(graph(block('My YuE2', 'YuE2GenerateABC')))).toBe(false)
    expect(mayBeOutdated({ nodes: [] })).toBe(false)
    expect(mayBeOutdated(null)).toBe(false)
  })

  it('are brought up to date in place, so the frontend configures the new graph', async () => {
    const workflow = graph(block('Plenio · YuE2 Plan', 'YuE2GenerateABC'))
    const fresh = graph(block('Plenio · YuE2 Plan', 'YuE2GenerateABC', 'PlenioCreativity'))
    const answer = { ...NOTHING, workflow: fresh, updated: ['Plenio · YuE2 Plan'], linked: ['Plenio · YuE2 Plan'] }
    const sent: unknown[] = []
    expect(await bringBlocksUpToDate(workflow, fetcher(answer, sent))).toEqual(answer)
    expect(sent).toEqual([['/plenio/workflow/blocks', { workflow: graph(block('Plenio · YuE2 Plan', 'YuE2GenerateABC')) }]])
    expect(workflow).toEqual(fresh)
    expect(mayBeOutdated(workflow)).toBe(false)
  })

  it('leave the graph alone when nothing changed, and ask nothing of an up-to-date workflow', async () => {
    const kept = graph(block('Plenio · YuE2 Render', 'YuE2GenerateMusic'))
    const before = JSON.stringify(kept)
    const answer = { ...NOTHING, kept: [['Plenio · YuE2 Render', 'its node YuE2GenerateMusic was changed inside the block']] as [string, string][] }
    expect(await bringBlocksUpToDate(kept, fetcher(answer))).toEqual(answer)
    expect(JSON.stringify(kept)).toBe(before)
    const sent: unknown[] = []
    expect(await bringBlocksUpToDate(graph(block('Plenio · Master', 'PlenioEQ')), fetcher(NOTHING, sent))).toBeNull()
    expect(sent).toEqual([])
  })

  it('say what changed and what the creativity does not reach', () => {
    expect(blocksMessages(null)).toEqual([])
    expect(blocksMessages(NOTHING)).toEqual([])
    const [info, warn] = blocksMessages({
      workflow: {},
      updated: ['Plenio · Write Song', 'Plenio · YuE2 Plan'],
      kept: [['Plenio · YuE2 Render', 'its node YuE2GenerateMusic was changed inside the block']],
      linked: ['Plenio · YuE2 Plan'],
      unlinked: [['Plenio · YuE2 Takes', 'the workflow has no single brief to link it from']]
    })
    expect(info.severity).toBe('info')
    expect(info.detail).toContain('Write Song, YuE2 Plan are the current blocks now')
    expect(info.detail).toContain('The creativity of YuE2 Plan now comes from the brief')
    expect(info.detail).toContain('At creativity 50 they work exactly as before')
    expect(warn.severity).toBe('warn')
    expect(warn.detail).toContain('YuE2 Render was kept as it was (its node YuE2GenerateMusic was changed inside the block) - its sampling stays fixed')
    expect(warn.detail).toContain('YuE2 Takes has its own creativity slider (the workflow has no single brief to link it from)')
  })
})


describe('the model blocks of a workflow saved with 1.x', () => {
  const old = block('Plenio · YuE2 Model', 'CheckpointLoaderSimple', 'LoraLoader', 'PlenioEngine')
  const current = block('Plenio · MiniMax Model', 'PlenioModelChoice', 'UNETLoader')

  it('are named when it opens, with what they do as they are and what the command does', () => {
    expect(oldModelBlocks(graph(old, current))).toEqual(['Plenio · YuE2 Model'])
    const message = oldModelBlocksMessage(graph(old))
    expect(message?.detail).toContain('load the files they name, as before')
    expect(message?.detail).toContain('Bring the model blocks up to date')
    expect(oldModelBlocksMessage(graph(current))).toBeNull()
  })

  it('come up to date only through the command, which asks for models', async () => {
    const sent: unknown[] = []
    await upgradeBlocks(fetcher(NOTHING, sent), graph(old), true)
    await upgradeBlocks(fetcher(NOTHING, sent), graph(old))
    expect((sent[0] as [string, Record<string, unknown>])[1].models).toBe(true)
    expect('models' in (sent[1] as [string, Record<string, unknown>])[1]).toBe(false)
  })

  it('say what the command did', () => {
    const done: Answer = { ...NOTHING, workflow: {}, updated: ['Plenio · YuE2 Model'], kept: [['Plenio · Cover Art', 'its node Flux2Scheduler was changed inside the block']] }
    const [first, second] = modelBlocksMessages(done)
    expect(first.detail).toContain('YuE2 Model choose their files with Model Choice now; each keeps the file it loaded')
    expect(second.severity).toBe('warn')
    expect(second.detail).toContain('Cover Art (its node Flux2Scheduler was changed inside the block)')
    expect(modelBlocksMessages(NOTHING)[0].summary).toBe('Nothing to bring up to date')
  })
})
