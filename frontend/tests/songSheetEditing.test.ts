/**
 * Song Sheet editing (GitHub issue #28: karaoke and translations, the score edited by hand): a clicked chord
 * symbol is heard once, dragging one never scrolls the roll, a chord selected in the lane can be renamed and
 * removed with the toolbar's *set* and *remove*, and *shorter* / *longer* change a note tied over a bar line
 * as the one note it is. The scores come from the backend (fixtures/tricky-score.json, fixtures/tied-score.json
 * - kept current by tests/unit/test_song_sheet_editing.py).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { type App, createApp, h, nextTick, reactive } from 'vue'

import type { Fetcher, ScoreOperation } from '../src/api/client'
import { type ScoreElement, type ScoreModelView, type ScoreView, elementById, lengthOperation, steppedDuration } from '../src/shared/scoreView'
import type { WorkingDoc } from '../src/shared/sheetSession'
import PianoRoll from '../src/sheet-editor/score/PianoRoll.vue'
import ScorePalette from '../src/sheet-editor/score/ScorePalette.vue'
import ScoreTab from '../src/sheet-editor/score/ScoreTab.vue'
import { HEADER, LANE, geometry, noteRect, notesOf, xOf, yOf } from '../src/sheet-editor/score/pianoRoll'
import { defaultPrefs, savePrefs } from '../src/sheet-editor/score/prefs'
import tricky from './fixtures/tricky-score.json'
import tied from './fixtures/tied-score.json'

const heard = vi.hoisted(() => ({ chords: [] as unknown[][], notes: [] as unknown[][] }))
vi.mock('../src/sheet-editor/score/player', async (original) => ({
  ...(await original<typeof import('../src/sheet-editor/score/player')>()),
  audition: (...args: unknown[]) => heard.notes.push(args),
  auditionChord: (...args: unknown[]) => heard.chords.push(args)
}))

const VIEW = tricky.view as unknown as ScoreView
const MODEL = VIEW.model as ScoreModelView
const GEO = geometry(MODEL, { pxPerQuarter: 48, snap: 'auto' })
const TIED = tied.view as unknown as ScoreView

let app: App | null = null
beforeEach(() => {
  heard.chords.length = 0
  heard.notes.length = 0
})
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

function pointer(target: Element, type: string, x: number, y: number, init: PointerEventInit = {}): void {
  target.dispatchEvent(new PointerEvent(type, { clientX: x, clientY: y, button: 0, bubbles: true, pointerId: 1, ...init }))
}

function rect(top: number, height: number, width = 900): DOMRect {
  return { top, bottom: top + height, left: 0, right: width, height, width, x: 0, y: top, toJSON: () => ({}) } as DOMRect
}

function mountRoll(view: ScoreView = VIEW, options: { audition?: boolean } = {}) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const state = reactive({ selection: [] as string[] })
  const operate = vi.fn((_op: ScoreOperation) => Promise.resolve(true))
  const notices: string[] = []
  app = createApp({
    render: () =>
      h(PianoRoll, {
        view,
        selection: state.selection,
        operate,
        audition: options.audition ?? true,
        chordSound: 'piano',
        onSelect: (ids: string[]) => (state.selection = ids),
        onNotice: (text: string) => notices.push(text)
      })
  })
  app.mount(host)
  const root = host.querySelector('.roll') as HTMLElement
  const svg = host.querySelector('svg.roll-svg') as SVGSVGElement
  const scroller = root.querySelector('.roll-scroll') as HTMLElement
  return { root, svg, scroller, state, operate, notices }
}

const lane = HEADER + LANE / 2

describe('a chord symbol clicked in the lane', () => {
  it('is selected and heard once, in the chords sound - a drag does not sound it again', async () => {
    const { svg, state, operate } = mountRoll()
    const x = xOf(32, GEO) + 3 // "G": G3 B3 D4
    pointer(svg, 'pointerdown', x, lane)
    expect(state.selection).toEqual(['chord:32'])
    expect(heard.chords).toEqual([[[55, 59, 62], 0.8, 'piano']])
    pointer(svg, 'pointermove', x + 10, lane)
    pointer(svg, 'pointermove', x + 6 * 8, lane)
    pointer(svg, 'pointerup', x + 6 * 8, lane)
    await settle()
    expect(heard.chords).toHaveLength(1)
    expect(operate).toHaveBeenCalledWith({ op: 'move_chord', onset: 32, to: 40 })
    // a click (no drag) changes nothing
    operate.mockClear()
    pointer(svg, 'pointerdown', xOf(64, GEO) + 3, lane) // "A7": A3 C#4 E4 G4
    pointer(svg, 'pointerup', xOf(64, GEO) + 3, lane)
    await settle()
    expect(heard.chords.at(-1)).toEqual([[57, 61, 64, 67], 0.8, 'piano'])
    expect(operate).not.toHaveBeenCalled()
  })

  it('stays silent with *hear* off, and says why for a symbol without pitches', async () => {
    const off = mountRoll(VIEW, { audition: false })
    pointer(off.svg, 'pointerdown', xOf(32, GEO) + 3, lane)
    pointer(off.svg, 'pointerup', xOf(32, GEO) + 3, lane)
    expect(heard.chords).toEqual([])
    app?.unmount()
    const silent = JSON.parse(JSON.stringify(VIEW)) as ScoreView
    silent.model!.tracks.chords[1].pitches = []
    const { svg, notices } = mountRoll(silent)
    pointer(svg, 'pointerdown', xOf(32, GEO) + 3, lane)
    expect(heard.chords).toEqual([])
    expect(notices).toEqual(['The chord symbol G has no pitches Plenio can play.'])
  })
})

describe('the roll while a chord symbol is dragged', () => {
  it('keeps its scroll position (it scrolled up a row on every move of the pointer)', async () => {
    const { svg, scroller, operate } = mountRoll()
    scroller.scrollTop = 400
    scroller.scrollLeft = 0
    scroller.dispatchEvent(new Event('scroll'))
    await settle()
    // the pane on the screen, the roll scrolled 400 px under its top
    scroller.getBoundingClientRect = () => rect(0, 280)
    svg.getBoundingClientRect = () => rect(-scroller.scrollTop, GEO.height)
    const x = xOf(32, GEO) + 3
    pointer(svg, 'pointerdown', x, lane)
    for (const step of [4, 12, 24, 36, 48]) pointer(svg, 'pointermove', x + step, lane)
    await nextTick()
    expect(scroller.scrollTop).toBe(400)
    pointer(svg, 'pointerup', x + 48, lane)
    await settle()
    expect(scroller.scrollTop).toBe(400)
    expect(scroller.scrollLeft).toBe(0)
    expect(operate).toHaveBeenCalledWith({ op: 'move_chord', onset: 32, to: 40 })
  })

  it('still scrolls along while a note is dragged to the top edge (on purpose)', async () => {
    const { svg, scroller } = mountRoll()
    const note = notesOf(MODEL).find((n) => n.id === 'vocal:32')!
    const box = noteRect(note, GEO)
    scroller.scrollTop = box.y - 60
    scroller.dispatchEvent(new Event('scroll'))
    await settle()
    const top = scroller.scrollTop
    scroller.getBoundingClientRect = () => rect(0, 280)
    svg.getBoundingClientRect = () => rect(-scroller.scrollTop, GEO.height)
    const y = box.y + 3 - top // on the screen
    pointer(svg, 'pointerdown', box.x + 4, y)
    pointer(svg, 'pointermove', box.x + 4, y - 20)
    pointer(svg, 'pointermove', box.x + 4, GEO.top + 2) // inside the top edge of the rows
    await nextTick()
    expect(scroller.scrollTop).toBeLessThan(top)
    pointer(svg, 'pointerup', box.x + 4, GEO.top + 2)
    await settle()
    expect(yOf(note.pitch, GEO)).toBeGreaterThan(0)
  })
})

describe('the toolbar on a chord symbol selected in the lane', () => {
  function mountPalette(props: { selection: string[]; primary?: ScoreElement | null; busy?: boolean; stale?: boolean; view?: ScoreView }) {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const operations: ScoreOperation[] = []
    const state = reactive({ view: VIEW, primary: null as ScoreElement | null, busy: false, stale: false, ...props })
    app = createApp({
      render: () =>
        h(ScorePalette, {
          view: state.view,
          selection: state.selection,
          primary: state.primary,
          busy: state.busy,
          stale: state.stale,
          canUndo: false,
          canRedo: false,
          undoLabel: null,
          redoLabel: null,
          onOperate: (operation: ScoreOperation) => operations.push(operation)
        })
    })
    app.mount(host)
    const button = (label: string) => [...host.querySelectorAll('button')].find((b) => b.textContent?.trim() === label) as HTMLButtonElement
    const field = host.querySelector('input.chord') as HTMLInputElement
    return { host, state, operations, button, field }
  }

  it('shows its name; *set* renames it and *remove* removes it, with the operations the lane uses', async () => {
    const { operations, button, field } = mountPalette({ selection: ['chord:32'] })
    await nextTick()
    expect(field.disabled).toBe(false)
    expect(field.value).toBe('G')
    expect(button('remove').disabled).toBe(false)
    field.value = 'Em7'
    field.dispatchEvent(new Event('input'))
    await nextTick()
    expect(button('set').disabled).toBe(false)
    button('set').click()
    field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    button('remove').click()
    expect(operations).toEqual([
      { op: 'put_chord', onset: 32, name: 'Em7' },
      { op: 'put_chord', onset: 32, name: 'Em7' },
      { op: 'delete_chord', onset: 32 }
    ])
  })

  it('removes several selected chord symbols at once; renames only one', async () => {
    const { operations, button } = mountPalette({ selection: ['chord:32', 'chord:64'] })
    await nextTick()
    expect(button('set').disabled).toBe(true)
    button('remove').click()
    expect(operations).toEqual([{ op: 'delete', ids: ['chord:32', 'chord:64'] }])
  })

  it('stays disabled while the score is busy or its text is invalid, and follows the score after an edit', async () => {
    const { state, button, field } = mountPalette({ selection: ['chord:32'], busy: true })
    await nextTick()
    expect([field.disabled, button('set').disabled, button('remove').disabled]).toEqual([true, true, true])
    state.busy = false
    state.stale = true
    await nextTick()
    expect([field.disabled, button('remove').disabled]).toEqual([true, true])
    state.stale = false
    // the chord renamed by the backend: the field shows the new name
    const renamed = JSON.parse(JSON.stringify(VIEW)) as ScoreView
    renamed.model!.tracks.chords[1].name = 'Em7'
    state.view = renamed
    await nextTick()
    expect(field.value).toBe('Em7')
    // removed: its id leaves the selection (the session keeps only ids the view knows) - nothing to set or remove
    state.selection = []
    await nextTick()
    expect([field.disabled, button('remove').disabled]).toEqual([true, true])
  })

  it('keeps setting a chord at a selected note or rest', async () => {
    const element = elementById(VIEW, 'V2.0') as ScoreElement
    const { operations, button, field } = mountPalette({ selection: ['V2.0'], primary: element })
    await nextTick()
    field.value = 'C'
    field.dispatchEvent(new Event('input'))
    await nextTick()
    button('set').click()
    expect(operations).toEqual([{ op: 'set_chord', id: 'V2.0', name: 'C' }])
  })
})

describe('shorter and longer on a note tied over a bar line', () => {
  const first = elementById(TIED, 'I1.4') as ScoreElement // A4: 2 units in bar 1, tied to 4 in bar 2

  it('is one note: the whole note gets the next length, from its start', () => {
    expect(first.units).toBe(2)
    expect(lengthOperation(TIED, first, -1)).toEqual({ op: 'resize_note', id: 'ins:14', duration: 4, mode: 'rests' })
    expect(lengthOperation(TIED, first, 1)).toEqual({ op: 'resize_note', id: 'ins:14', duration: 8, mode: 'rests' })
    // its second segment selected (from the staff): the same note
    expect(lengthOperation(TIED, elementById(TIED, 'I2.0'), -1)).toEqual({ op: 'resize_note', id: 'ins:14', duration: 4, mode: 'rests' })
    // the Vocal track's tied note too
    expect(lengthOperation(TIED, elementById(TIED, 'V1.4'), -1)).toEqual({ op: 'resize_note', id: 'vocal:14', duration: 4, mode: 'rests' })
    // a note in one segment: its segment, as always
    expect(lengthOperation(TIED, elementById(TIED, 'I1.1'), -1)).toEqual({ op: 'set_duration', id: 'I1.1', units: 1 })
    expect(lengthOperation(TIED, elementById(TIED, 'I1.0'), -1)).toBeNull() // a rest
    expect([steppedDuration(6, -1), steppedDuration(5, -1), steppedDuration(1, -1), steppedDuration(48, 1)]).toEqual([4, 4, null, null])
  })

  it('the toolbar and the [ key send it', async () => {
    const sent: ScoreOperation[] = []
    const fetcher: Fetcher = {
      fetchApi: (route: string, init?: RequestInit) => {
        const body = JSON.parse(String(init?.body ?? '{}'))
        if (route.includes('/transform')) sent.push(body.operation)
        const answer = route.includes('/analyze') ? TIED : { abc: tied.abc, changes: [], warnings: [], select: [], analysis: TIED }
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(answer) } as Response)
      }
    }
    window.localStorage.clear()
    savePrefs({ ...defaultPrefs() })
    const host = document.createElement('div')
    document.body.appendChild(host)
    const doc: WorkingDoc = { kind: 'score', text: tied.abc, intent: 'keep' }
    app = createApp({
      render: () => h(ScoreTab, { doc, fetcher, payload: null, readonly: false, layoutDefault: 'review', title: 'Song' })
    })
    app.mount(host)
    await settle(6)
    // the note clicked in the roll (both voices have it: the draw-into track's is taken), both its segments
    // selected
    const svg = host.querySelector('svg.roll-svg') as SVGSVGElement
    const note = notesOf(TIED.model as ScoreModelView).find((n) => n.id === 'ins:14')!
    const geo = geometry(TIED.model as ScoreModelView, { pxPerQuarter: 48, snap: 'auto' })
    const box = noteRect(note, geo)
    const button = (label: string) => [...host.querySelectorAll('button')].find((b) => b.textContent?.trim() === label) as HTMLButtonElement
    pointer(svg, 'pointerdown', box.x + 2, box.y + 2)
    pointer(svg, 'pointerup', box.x + 2, box.y + 2)
    await settle()
    expect(button('shorter').disabled).toBe(false)
    button('shorter').click()
    await settle()
    expect(sent.at(-1)).toEqual({ op: 'resize_note', id: 'vocal:14', duration: 4, mode: 'rests' })
    // the Ins track's: the same with the [ key
    button('Ins').click()
    await nextTick()
    pointer(svg, 'pointerdown', box.x + 2, box.y + 2)
    pointer(svg, 'pointerup', box.x + 2, box.y + 2)
    await settle()
    const roll = host.querySelector('.roll') as HTMLElement
    roll.dispatchEvent(new KeyboardEvent('keydown', { key: '[', bubbles: true, cancelable: true }))
    await settle()
    expect(sent.at(-1)).toEqual({ op: 'resize_note', id: 'ins:14', duration: 4, mode: 'rests' })
    roll.dispatchEvent(new KeyboardEvent('keydown', { key: ']', bubbles: true, cancelable: true }))
    await settle()
    expect(sent.at(-1)).toEqual({ op: 'resize_note', id: 'ins:14', duration: 8, mode: 'rests' })
    expect(sent.some((op) => op.op === 'set_duration')).toBe(false)
  })
})
