/**
 * The clipboard in the roll (docs/design/score-arrange-design.md §3; Cubase: key editor): the select
 * frame takes chord symbols in the lane, Ctrl+A takes everything, and the Score tab copies, cuts,
 * pastes at the cursor (overwriting or inserting) and duplicates through one backend operation each.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { type App, createApp, h, nextTick, reactive } from 'vue'

import type { Fetcher, ScoreOperation } from '../src/api/client'
import type { ScoreModelView, ScoreView } from '../src/shared/scoreView'
import type { WorkingDoc } from '../src/shared/sheetSession'
import PianoRoll from '../src/sheet-editor/score/PianoRoll.vue'
import ScoreTab from '../src/sheet-editor/score/ScoreTab.vue'
import type { ClipAction } from '../src/sheet-editor/score/clipboard'
import { clipboard } from '../src/sheet-editor/score/clipboard'
import { HEADER, TOP, chordsInBand, geometry, noteRect, notesOf, xOf, yOf } from '../src/sheet-editor/score/pianoRoll'
import { defaultPrefs, savePrefs } from '../src/sheet-editor/score/prefs'
import fixture from './fixtures/tricky-score.json'

const VIEW = fixture.view as unknown as ScoreView
const MODEL = VIEW.model as ScoreModelView
const GEO = geometry(MODEL, { pxPerQuarter: 48, height: 280, snap: 'auto' })
const CHORDS = MODEL.tracks.chords
const centre = (id: string): [number, number] => {
  const rect = noteRect(notesOf(MODEL).find((n) => n.id === id)!, GEO)
  return [rect.x + rect.width / 2, rect.y + rect.height / 2]
}

let app: App | null = null
afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
  clipboard.value = null
})

function pointer(target: Element, type: string, x: number, y: number, init: PointerEventInit = {}): void {
  target.dispatchEvent(new PointerEvent(type, { clientX: x, clientY: y, button: 0, bubbles: true, pointerId: 1, ...init }))
}

function key(target: Element, name: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true, ...init })
  target.dispatchEvent(event)
  return event
}

async function settle(times = 4): Promise<void> {
  for (let index = 0; index < times; index++) {
    await new Promise((resolve) => setTimeout(resolve, 0))
    await nextTick()
  }
}

describe('the select frame and chord symbols', () => {
  it('takes the chords whose boxes it overlaps once it reaches into the lane', () => {
    const across = { x0: xOf(30, GEO), y0: yOf(70, GEO), x1: xOf(70, GEO), y1: HEADER + 4 }
    const taken = chordsInBand(CHORDS, across, GEO).map((c) => c.onset)
    expect(taken.length).toBeGreaterThan(0)
    for (const onset of taken) expect(onset).toBeLessThan(70)
    // below the lane it takes none
    expect(chordsInBand(CHORDS, { ...across, y1: TOP + 2 }, GEO)).toEqual([])
    // nor when the pane scrolled the start of a frame on the rows under the lanes
    const scrolled = { x0: xOf(30, GEO), y0: yOf(70, GEO), x1: xOf(70, GEO), y1: yOf(60, GEO) + 600, from: { scrollTop: 0, scrollLeft: 0 } }
    expect(chordsInBand(CHORDS, scrolled, GEO, 600)).toEqual([])
  })
})

describe('PianoRoll: chords in the selection, clipboard buttons', () => {
  function mountRoll(selection: string[] = [], clip: string | null = null) {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const state = reactive({ selection, clip })
    const actions: ClipAction[] = []
    app = createApp({
      render: () =>
        h(PianoRoll, {
          view: VIEW,
          selection: state.selection,
          operate: (_op: ScoreOperation) => Promise.resolve(true),
          locator: 64,
          clip: state.clip,
          onSelect: (ids: string[]) => (state.selection = ids),
          onClipboard: (action: ClipAction) => actions.push(action)
        })
    })
    app.mount(host)
    const button = (name: string) => [...host.querySelectorAll('.clip-tools button')].find((b) => b.textContent?.trim() === name) as HTMLButtonElement
    return { host, svg: host.querySelector('svg.roll-svg') as SVGSVGElement, root: host.querySelector('.roll') as HTMLElement, state, actions, button }
  }

  it('selects chord symbols with a frame from the lane, and notes and chords with Ctrl+A', async () => {
    const { host, svg, root, state } = mountRoll()
    ;(host.querySelector('button.mode.select') as HTMLButtonElement).click()
    await nextTick()
    const lane = HEADER + 8
    // from the empty end of the lane (a press on a chord's box would select that chord) to the start
    pointer(svg, 'pointerdown', xOf(MODEL.total - 1, GEO), lane)
    pointer(svg, 'pointermove', xOf(100, GEO), lane)
    pointer(svg, 'pointermove', xOf(0, GEO), lane)
    await nextTick()
    expect(svg.querySelector('.roll-top rect.band')).not.toBeNull() // the frame shows in the lane
    pointer(svg, 'pointerup', xOf(0, GEO), lane)
    await settle()
    expect(state.selection).toEqual(CHORDS.map((c) => c.id)) // only chords: the frame stayed in the lane
    key(root, 'a', { ctrlKey: true })
    await nextTick()
    expect(state.selection.filter((id) => id.startsWith('chord:'))).toHaveLength(CHORDS.length)
    expect(state.selection.length).toBeGreaterThan(CHORDS.length)
  })

  it('asks the Score tab to copy, cut, paste and insert', async () => {
    const { button, actions, state } = mountRoll()
    expect(button('Copy').disabled).toBe(true)
    expect(button('Paste').disabled).toBe(true)
    state.selection = ['chord:0']
    state.clip = '2 notes'
    await nextTick()
    for (const name of ['Copy', 'Cut', 'Paste', 'Insert']) button(name).click()
    expect(actions).toEqual(['copy', 'cut', 'paste', 'insert'])
    expect(button('Insert').title).toContain('Insert 2 notes at the cursor')
  })
})

// --- the Score tab: one backend operation per command ----------------------------------------

describe('ScoreTab: copy, cut, paste at the cursor, insert, duplicate', () => {
  beforeEach(() => {
    window.localStorage.clear()
    savePrefs({ ...defaultPrefs() })
  })

  async function mountTab(readonly = false) {
    const sent: ScoreOperation[] = []
    const fetcher: Fetcher = {
      fetchApi: (route: string, init?: RequestInit) => {
        if (route.includes('/transform')) sent.push(JSON.parse(String(init?.body)).operation)
        const body = route.includes('/transform')
          ? { abc: fixture.abc, changes: ['pasted'], warnings: [], select: [], analysis: VIEW }
          : route.includes('/analyze')
            ? VIEW
            : {}
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) } as Response)
      }
    }
    const host = document.createElement('div')
    document.body.appendChild(host)
    const doc: WorkingDoc = { kind: 'score', text: fixture.abc, intent: 'keep' }
    app = createApp({
      render: () => h(ScoreTab, { doc, fetcher, payload: null, readonly, layoutDefault: 'review', lyrics: null, title: 'Song' })
    })
    app.mount(host)
    await settle()
    const svg = host.querySelector('svg.roll-svg') as SVGSVGElement
    const root = host.querySelector('.roll') as HTMLElement
    const status = () => host.querySelector('.status')?.textContent ?? ''
    const error = () => host.querySelector('.error')?.textContent ?? ''
    return { host, svg, root, sent, status, error }
  }

  async function click(svg: SVGSVGElement, at: [number, number], init: PointerEventInit = {}): Promise<void> {
    pointer(svg, 'pointerdown', ...at, init)
    pointer(svg, 'pointerup', ...at, init)
    await settle()
  }

  it('copies the selection and pastes it at the cursor, overwriting or inserting', async () => {
    const { svg, root, sent, status } = await mountTab()
    await click(svg, centre('vocal:40'))
    await click(svg, centre('vocal:48'), { shiftKey: true })
    key(root, 'c', { ctrlKey: true })
    expect(clipboard.value?.label).toBe('2 notes')
    await nextTick()
    expect(status()).toContain('copied 2 notes')
    await click(svg, [xOf(96, GEO), 6]) // the cursor to bar 4
    key(root, 'v', { ctrlKey: true })
    await settle()
    expect(sent.at(-1)).toMatchObject({
      op: 'paste',
      at: 96,
      mode: 'overwrite',
      span: 16,
      tracks: ['vocal'],
      notes: [
        { track: 'vocal', onset: 0, duration: 8, pitch: 78 },
        { track: 'vocal', onset: 8, duration: 8, pitch: 65 }
      ]
    })
    key(root, 'V', { ctrlKey: true, shiftKey: true })
    await settle()
    expect(sent.at(-1)).toMatchObject({ op: 'paste', at: 96, mode: 'insert', sections: [] })
  })

  it('cuts to rests and duplicates right after the selection', async () => {
    const { svg, root, sent } = await mountTab()
    await click(svg, centre('vocal:40'))
    key(root, 'x', { ctrlKey: true })
    await settle()
    expect(clipboard.value?.label).toBe('1 note')
    expect(sent.at(-1)).toEqual({ op: 'delete', ids: ['vocal:40'] })
    await click(svg, centre('vocal:96'))
    const before = clipboard.value
    key(root, 'd', { ctrlKey: true })
    await settle()
    expect(sent.at(-1)).toMatchObject({ op: 'paste', at: 104, mode: 'overwrite', span: 8 })
    expect(clipboard.value).toBe(before) // duplicate leaves the clipboard alone
  })

  it('pastes sections copied in the list, with their names when inserted', async () => {
    const { host, root, sent } = await mountTab()
    const chorus = [...host.querySelectorAll('.section-head')][2] as HTMLElement
    chorus.click()
    await nextTick()
    key(host.querySelector('nav.navigator') as HTMLElement, 'c', { ctrlKey: true })
    expect(clipboard.value?.label).toBe('section chorus')
    key(root, 'V', { ctrlKey: true, shiftKey: true }) // the cursor is at the chorus (bar 6)
    await settle()
    expect(sent.at(-1)).toMatchObject({
      op: 'paste',
      at: 160,
      mode: 'insert',
      span: 64,
      tracks: ['vocal', 'ins'],
      with_chords: true,
      sections: [{ onset: 0, label: 'chorus' }]
    })
  })

  it('says why when there is nothing to copy or paste, and only copies from a read-only score', async () => {
    const first = await mountTab()
    key(first.root, 'v', { ctrlKey: true })
    await settle()
    expect(first.error()).toContain('clipboard is empty')
    key(first.root, 'c', { ctrlKey: true })
    await nextTick()
    expect(first.error()).toContain('Select notes or chord symbols first')
    app?.unmount()
    document.body.innerHTML = ''
    const { svg, root, sent } = await mountTab(true)
    await click(svg, centre('vocal:40'))
    key(root, 'c', { ctrlKey: true })
    expect(clipboard.value?.label).toBe('1 note')
    key(root, 'v', { ctrlKey: true })
    key(root, 'x', { ctrlKey: true })
    await settle()
    expect(sent).toEqual([])
  })
})
