/**
 * The lyrics where they are sung (owner's request 2026-10-01): the roll's lyrics lane shows every line
 * over its Vocal phrase and each syllable over its note, a double-click edits the line there, and the
 * Score tab sends the lyrics with the score, reports the edited lyrics and undoes an edit.
 * The view comes from the backend (fixtures/tricky-lyrics.json, kept current by test_lyric_layout.py).
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { type App, createApp, h, nextTick, reactive } from 'vue'

import type { Fetcher, ScoreOperation } from '../src/api/client'
import type { LyricLayoutView, ScoreModelView, ScoreView } from '../src/shared/scoreView'
import type { WorkingDoc } from '../src/shared/sheetSession'
import PianoRoll from '../src/sheet-editor/score/PianoRoll.vue'
import ScoreTab from '../src/sheet-editor/score/ScoreTab.vue'
import { followOf, followReplace, followText, replaceLine } from '../src/sheet-editor/score/lyricsFollow'
import { LYRICS_LANE, TOP, geometry, xOf, yOf } from '../src/sheet-editor/score/pianoRoll'
import { defaultPrefs, savePrefs } from '../src/sheet-editor/score/prefs'
import plain from './fixtures/tricky-score.json'
import fixture from './fixtures/tricky-lyrics.json'

const VIEW = fixture.view as unknown as ScoreView
const MODEL = VIEW.model as ScoreModelView
const LAYOUT = VIEW.lyrics as LyricLayoutView
const LYRICS = fixture.lyrics // [Intro] / [Verse] beautiful morning, sing it again / [Chorus] hold on

let app: App | null = null
afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
})

async function settle(times = 4): Promise<void> {
  for (let i = 0; i < times; i++) {
    await new Promise((resolve) => setTimeout(resolve, 0))
    await nextTick()
  }
}

describe('editing a lyrics line', () => {
  it('replaces, adds and removes a line and keeps the rest of the text', () => {
    expect(replaceLine(LYRICS, 1, 1, 'sing it once more')).toBe(LYRICS.replace('sing it again', 'sing it once more'))
    expect(replaceLine(LYRICS, 2, 1, 'and on')).toBe(`${LYRICS}\nand on`)
    expect(replaceLine(LYRICS, 1, 0, '  ')).toBe(LYRICS.replace('beautiful morning\n', ''))
    expect(replaceLine(LYRICS, 9, 0, 'x')).toBe(LYRICS)
  })

  it('edits the block of a section while the lyrics follow the sections', () => {
    const follow = followOf(LYRICS, MODEL)!
    const intro = followReplace(follow, MODEL, 0, 0, 'la la')
    expect(followText(intro, MODEL)).toBe(LYRICS.replace('[Intro]', '[Intro]\nla la'))
  })
})

describe('PianoRoll: the lyrics lane', () => {
  function mountRoll(editable = true) {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const edits: unknown[] = []
    const state = reactive({ lyrics: LAYOUT as LyricLayoutView | null })
    app = createApp({
      render: () =>
        h(PianoRoll, {
          view: VIEW,
          selection: [],
          operate: (_op: ScoreOperation) => Promise.resolve(true),
          readonly: !editable,
          lyrics: state.lyrics,
          lyricsEditable: editable,
          onLyricEdit: (edit: unknown) => edits.push(edit)
        })
    })
    app.mount(host)
    return { host, svg: host.querySelector('svg.roll-svg') as SVGSVGElement, edits, state }
  }
  const GEO = geometry(MODEL, { pxPerQuarter: 48, snap: 'auto', lyrics: true })
  const lane = TOP + LYRICS_LANE / 2
  const dblclick = (svg: SVGSVGElement, unit: number) =>
    svg.dispatchEvent(new MouseEvent('dblclick', { clientX: xOf(unit, GEO), clientY: lane, bubbles: true }))

  it('shows each line over its phrase and each syllable over its note, under the chord lane', async () => {
    const { svg, state } = mountRoll()
    expect([...svg.querySelectorAll('.lyric-line text')].map((t) => t.textContent)).toEqual(['beautiful morning', 'sing it again', 'hold on'])
    const syllables = [...svg.querySelectorAll('text.syllable')].map((t) => t.textContent)
    expect(syllables.slice(0, 5)).toEqual(['beau-', 'ti-', 'ful', 'mor-', 'ning'])
    expect(syllables).toHaveLength(11)
    // the rows start under the lyrics lane
    expect(Number(svg.querySelector('rect.keys-bg')?.getAttribute('y'))).toBe(TOP + LYRICS_LANE)
    expect(GEO.top).toBe(TOP + LYRICS_LANE)
    expect(yOf(MODEL.tracks.vocal[0].pitch, GEO)).toBe(yOf(MODEL.tracks.vocal[0].pitch, geometry(MODEL, { pxPerQuarter: 48, snap: 'auto' })) + LYRICS_LANE)
    state.lyrics = null
    await nextTick()
    expect(svg.querySelector('.lyrics-lane')).toBeNull()
  })

  it('edits the line sung where it is double-clicked, and adds one for a section without words', async () => {
    const { host, svg, edits } = mountRoll()
    dblclick(svg, 100) // in "sing it again" (bars 4-5)
    await nextTick()
    const input = host.querySelector('input.lyric-edit') as HTMLInputElement
    expect(input.value).toBe('sing it again')
    input.value = 'sing it once more'
    input.dispatchEvent(new Event('input'))
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await nextTick()
    expect(edits).toEqual([{ section: 1, block: 1, line: 1, text: 'sing it once more' }])
    expect(host.querySelector('input.lyric-edit')).toBeNull()
    dblclick(svg, 10) // the intro: no Vocal notes, no words yet
    await nextTick()
    const added = host.querySelector('input.lyric-edit') as HTMLInputElement
    expect(added.value).toBe('')
    added.value = 'oh'
    added.dispatchEvent(new Event('input'))
    added.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    added.dispatchEvent(new FocusEvent('blur'))
    await nextTick()
    expect(edits).toHaveLength(1) // Esc keeps the line as it was
  })

  it('only shows the lyrics where they cannot be edited', async () => {
    const { host, svg } = mountRoll(false)
    dblclick(svg, 100)
    await nextTick()
    expect(host.querySelector('input.lyric-edit')).toBeNull()
    expect(svg.querySelectorAll('.lyric-line')).toHaveLength(3)
  })
})

describe('ScoreTab: lyrics with the score', () => {
  beforeEach(() => {
    window.localStorage.clear()
    savePrefs({ ...defaultPrefs() })
  })

  it('sends them, edits a line in the lane, reports it and undoes it', async () => {
    const asked: (string | undefined)[] = []
    const fetcher: Fetcher = {
      fetchApi: (route: string, init?: RequestInit) => {
        const body = JSON.parse(String(init?.body ?? '{}'))
        if (route.includes('/analyze')) asked.push(body.lyrics)
        const answer = route.includes('/analyze') ? (body.lyrics ? VIEW : plain.view) : {}
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(answer) } as Response)
      }
    }
    const reported: (string | null)[] = []
    const host = document.createElement('div')
    document.body.appendChild(host)
    const doc: WorkingDoc = { kind: 'score', text: plain.abc, intent: 'keep' }
    app = createApp({
      render: () =>
        h(ScoreTab, {
          doc,
          fetcher,
          payload: null,
          readonly: false,
          layoutDefault: 'review',
          lyrics: LYRICS,
          title: 'Song',
          lyricsTarget: { title: 'Song Sheet · Text', blocked: null, replans: false },
          onLyricsChange: (text: string | null) => reported.push(text)
        })
    })
    app.mount(host)
    await settle(6)
    expect(asked.at(-1)).toBe(LYRICS)
    expect(host.querySelectorAll('.lyric-line')).toHaveLength(3)
    const svg = host.querySelector('svg.roll-svg') as SVGSVGElement
    const geo = geometry(MODEL, { pxPerQuarter: 48, snap: 'auto', lyrics: true })
    svg.dispatchEvent(new MouseEvent('dblclick', { clientX: xOf(170, geo), clientY: TOP + 8, bubbles: true }))
    await nextTick()
    const input = host.querySelector('input.lyric-edit') as HTMLInputElement
    expect(input.value).toBe('hold on')
    input.value = 'hold on tight'
    input.dispatchEvent(new Event('input'))
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await settle()
    const edited = LYRICS.replace('hold on', 'hold on tight')
    expect(reported.at(-1)).toBe(edited)
    expect(asked.at(-1)).toBe(edited) // the view follows the new words
    expect(host.querySelector('.lyrics-follow')?.textContent).toContain('Apply writes the changed lyrics into Song Sheet · Text')
    host.querySelector('.score-tab')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true, cancelable: true }))
    await settle()
    expect(reported.at(-1)).toBe(LYRICS)
  })
})
