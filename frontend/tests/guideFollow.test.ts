/**
 * The Guide track follows the bars (docs/design/score-arrange-design.md §4, DAW sheet): an edit
 * that moves bars returns a time map, the Guide notes move, are copied and deleted with their bars,
 * and undo / redo bring the Guide back with the text.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { type App, createApp, h, nextTick, reactive } from 'vue'

import type { Fetcher, GuideNote, ScoreOperation } from '../src/api/client'
import type { ScoreView } from '../src/shared/scoreView'
import type { WorkingDoc } from '../src/shared/sheetSession'
import ScoreTab from '../src/sheet-editor/score/ScoreTab.vue'
import { defaultPrefs, savePrefs } from '../src/sheet-editor/score/prefs'
import { remapGuide } from '../src/sheet-editor/score/tracks'
import fixture from './fixtures/tricky-score.json'

const VIEW = fixture.view as unknown as ScoreView

describe('remapGuide', () => {
  const bar = 32
  const guide: GuideNote[] = [
    [0, 8, 60], // bar 1
    [40, 8, 62], // bar 2
    [56, 16, 64], // across the line of bars 2 and 3
    [100, 4, 65] // bar 4
  ]

  it('moves what follows an insertion and keeps a note across the cursor in two parts', () => {
    // two bars inserted at bar 3 (the backend's map of insert_measures / paste time)
    const after = remapGuide(guide, [
      [0, 2 * bar, 0],
      [2 * bar, 4 * bar, 4 * bar]
    ])
    expect(after).toEqual([
      [0, 8, 60],
      [40, 8, 62],
      [56, 8, 64],
      [128, 8, 64],
      [164, 4, 65]
    ])
  })

  it('loses the notes of deleted bars and closes up', () => {
    const after = remapGuide(guide, [
      [0, bar, 0],
      [2 * bar, 4 * bar, bar]
    ]) // bar 2 deleted
    expect(after).toEqual([
      [0, 8, 60],
      [32, 8, 64], // the part in bar 3 stays
      [68, 4, 65]
    ])
  })

  it('copies the notes of a duplicated range and keeps neighbouring pieces in one note', () => {
    // bars 1-2 duplicated after themselves: (0, 64, 0), (0, 64, 64), (64, 128, 128)
    const after = remapGuide(guide, [
      [0, 2 * bar, 0],
      [0, 2 * bar, 2 * bar],
      [2 * bar, 4 * bar, 4 * bar]
    ])
    expect(after).toEqual([
      [0, 8, 60],
      [40, 8, 62],
      [56, 8, 64], // the original is cut where the copy starts
      [64, 8, 60],
      [104, 8, 62],
      [120, 16, 64], // the copy runs on into the moved bar 3 - its neighbour in the old score
      [164, 4, 65]
    ])
  })

  it('arranges sections: a moved block takes its notes, a repeated one copies them', () => {
    // bars 3-4 first, then bars 1-2, then bars 3-4 again
    const after = remapGuide(guide, [
      [2 * bar, 4 * bar, 0],
      [0, 2 * bar, 2 * bar],
      [2 * bar, 4 * bar, 4 * bar]
    ])
    expect(after).toEqual([
      [0, 8, 64],
      [36, 4, 65],
      [64, 8, 60],
      [104, 8, 62],
      [120, 16, 64], // bars 2 and 3 are neighbours again here: one note
      [164, 4, 65]
    ])
  })
})

// --- the Score tab: one undo step for text and Guide ------------------------------------------

let app: App | null = null
afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
})

async function settle(times = 4): Promise<void> {
  for (let index = 0; index < times; index++) {
    await new Promise((resolve) => setTimeout(resolve, 0))
    await nextTick()
  }
}

describe('ScoreTab: the Guide follows the bars', () => {
  beforeEach(() => {
    window.localStorage.clear()
    savePrefs({ ...defaultPrefs() })
  })

  it('moves the Guide with an arrangement and brings it back on undo and redo', async () => {
    const sent: ScoreOperation[] = []
    const fetcher: Fetcher = {
      fetchApi: (route: string, init?: RequestInit) => {
        if (route.includes('/transform')) sent.push(JSON.parse(String(init?.body)).operation)
        const body = route.includes('/transform')
          ? {
              abc: `${fixture.abc}\n% arranged\n`,
              changes: ['sections moved: chorus - intro - verse'],
              warnings: [],
              select: [],
              time_map: [
                [160, 224, 0],
                [0, 160, 64]
              ],
              analysis: VIEW
            }
          : route.includes('/analyze')
            ? VIEW
            : {}
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) } as Response)
      }
    }
    const state = reactive({ guide: [[0, 8, 60] as GuideNote, [170, 4, 67] as GuideNote] })
    const changes: GuideNote[][] = []
    const host = document.createElement('div')
    document.body.appendChild(host)
    const doc: WorkingDoc = { kind: 'score', text: fixture.abc, intent: 'keep' }
    app = createApp({
      render: () =>
        h(ScoreTab, {
          doc,
          fetcher,
          payload: null,
          readonly: false,
          layoutDefault: 'daw',
          lyrics: null,
          title: 'Song',
          guide: state.guide,
          onGuideChange: (next: GuideNote[]) => {
            changes.push(next)
            state.guide = next
          }
        })
    })
    app.mount(host)
    await settle()
    // the chorus first: drag it before the intro
    const items = [...host.querySelectorAll('ol.sections li')] as HTMLElement[]
    items[2].dispatchEvent(new Event('dragstart', { bubbles: true }))
    const over = new Event('dragover', { bubbles: true, cancelable: true })
    Object.defineProperty(over, 'clientY', { value: -1 })
    items[0].dispatchEvent(over)
    items[0].dispatchEvent(new Event('drop', { bubbles: true, cancelable: true }))
    await settle()
    expect(sent.at(-1)).toEqual({ op: 'arrange_sections', order: [3, 1, 2] })
    expect(changes.at(-1)).toEqual([
      [10, 4, 67],
      [64, 8, 60]
    ])
    const tab = host.querySelector('.score-tab') as HTMLElement
    tab.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true, cancelable: true }))
    await settle()
    expect(changes.at(-1)).toEqual([
      [0, 8, 60],
      [170, 4, 67]
    ])
    tab.dispatchEvent(new KeyboardEvent('keydown', { key: 'y', ctrlKey: true, bubbles: true, cancelable: true }))
    await settle()
    expect(changes.at(-1)).toEqual([
      [10, 4, 67],
      [64, 8, 60]
    ])
  })
})
