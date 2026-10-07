/**
 * Piano roll and chord lane (M1/D1): geometry, snapping, gestures -> exactly one canonical
 * operation, the keyboard, the selection shared with the staff, and the component with a fake
 * ``operate`` (a refused operation removes the ghost).
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { type App, createApp, h, nextTick, reactive } from 'vue'

import type { ScoreOperation } from '../src/api/client'
import { type ScoreModelView, type ScoreView, elementSelection } from '../src/shared/scoreView'
import PianoRoll from '../src/sheet-editor/score/PianoRoll.vue'
import {
  HEADER,
  KEYS_WIDTH,
  LANE,
  PIANO_HIGH,
  PIANO_LOW,
  ROW_HEIGHT,
  TOP,
  type RollNote,
  bandInLane,
  bandRect,
  dragOp,
  dragTo,
  geometry,
  ghosts,
  gridLines,
  hitTest,
  keyOp,
  noteRect,
  notesInRect,
  notesOf,
  pitchRange,
  rollRange,
  scrollTopFor,
  scrollTopToShow,
  selectedNoteIds,
  selectionFor,
  snapUnits,
  startChord,
  startDraw,
  startMove,
  startResize,
  unitAt,
  xOf,
  yOf
} from '../src/sheet-editor/score/pianoRoll'
// The editor view of TRICKY (tests/unit/test_score_editor.py), kept current by the backend tests.
import fixture from './fixtures/tricky-score.json'

const VIEW = fixture.view as unknown as ScoreView
const MODEL = VIEW.model as ScoreModelView
const NOTES = notesOf(MODEL)
const CHORDS = MODEL.tracks.chords
const GEO = geometry(MODEL, { pxPerQuarter: 48, height: 280, snap: 'auto' }) // the component's defaults
const note = (id: string): RollNote => NOTES.find((n) => n.id === id) as RollNote
const centre = (n: RollNote): [number, number] => {
  const rect = noteRect(n, GEO)
  return [rect.x + rect.width / 2, rect.y + rect.height / 2]
}

describe('geometry and snapping', () => {
  it('lays the score out in units and pitch rows', () => {
    expect(GEO.pxPerUnit).toBe(6) // 48 px per quarter, 8 units per quarter (L:1/32)
    // the whole piano range, one fixed row each; the pane scrolls vertically through it
    expect([GEO.low, GEO.high]).toEqual([PIANO_LOW, PIANO_HIGH])
    expect(GEO.rowHeight).toBe(ROW_HEIGHT)
    expect(GEO.height).toBe(TOP + (PIANO_HIGH - PIANO_LOW + 1) * ROW_HEIGHT)
    expect(GEO.focus).toEqual([58, 85]) // the notes (62-81) padded by 4: where the roll opens
    // the pane's height no longer squeezes the rows
    expect(geometry(MODEL, { pxPerQuarter: 48, height: 120, snap: 'auto' }).rowHeight).toBe(ROW_HEIGHT)
    expect(GEO.snap).toBe(1)
    expect(GEO.drawLength).toBe(8) // a quarter note
    expect(GEO.width).toBe(KEYS_WIDTH + 224 * 6 + 40)
    const rect = noteRect(note('vocal:32'), GEO)
    expect(rect).toEqual({ x: xOf(32, GEO), y: yOf(66, GEO) + 0.5, width: 47, height: ROW_HEIGHT - 1 })
    expect(unitAt(xOf(40, GEO), GEO)).toBe(40)
  })

  it('pads and clamps the pitch range', () => {
    expect(pitchRange([])).toEqual([58, 81])
    const [low, high] = pitchRange([{ pitch: 1 }])
    expect(low).toBe(0)
    expect(high - low + 1).toBeGreaterThanOrEqual(24)
    expect(pitchRange([{ pitch: 126 }])[1]).toBe(127)
  })

  it('offers the piano range, widened to notes outside it', () => {
    expect(rollRange([])).toEqual([PIANO_LOW, PIANO_HIGH])
    expect(rollRange([{ pitch: 60 }, { pitch: 72 }])).toEqual([PIANO_LOW, PIANO_HIGH])
    expect(rollRange([{ pitch: 10 }, { pitch: 120 }])).toEqual([8, 122])
    expect(rollRange([{ pitch: 0 }, { pitch: 127 }])).toEqual([0, 127])
  })

  it('opens on the notes and scrolls a note into view', () => {
    const pane = 280
    const top = scrollTopFor(GEO, pane, GEO.focus[0], GEO.focus[1])
    // the notes' middle sits in the middle of the rows below the pinned header
    const middle = (yOf(GEO.focus[1], GEO) + yOf(GEO.focus[0], GEO) + ROW_HEIGHT) / 2
    expect(Math.abs(middle - top - (TOP + (pane - TOP) / 2))).toBeLessThanOrEqual(1)
    expect(scrollTopFor(GEO, pane, PIANO_HIGH, PIANO_HIGH)).toBe(0) // clamped at the top
    expect(scrollTopFor(GEO, pane, PIANO_LOW, PIANO_LOW)).toBe(GEO.height - pane) // and at the bottom
    expect(scrollTopToShow(GEO, top, pane, 70)).toBeNull() // visible: nothing to do
    const low = scrollTopToShow(GEO, top, pane, 30) as number
    expect(yOf(30, GEO)).toBeGreaterThanOrEqual(low + TOP)
    expect(yOf(30, GEO) + ROW_HEIGHT).toBeLessThanOrEqual(low + pane)
  })

  it('snaps to the score grid or to a note value', () => {
    expect(snapUnits(MODEL, 'auto')).toBe(1)
    expect(snapUnits(MODEL, 16)).toBe(2)
    expect(snapUnits(MODEL, 4)).toBe(8)
    expect(snapUnits({ ...MODEL, unit: '1/16' }, 32)).toBe(1) // never below one unit
  })

  it('draws bar and beat lines per meter', () => {
    const lines = gridLines(MODEL)
    expect(lines.filter((l) => l.kind === 'bar').map((l) => l.bar)).toEqual([1, 2, 3, 4, 5, 6, 7])
    expect(lines.filter((l) => l.kind === 'beat')).toHaveLength(7 * 3)
  })
})

describe('hit testing', () => {
  it('finds notes, their ends, the grid, chords and the lane', () => {
    const [x, y] = centre(note('vocal:32'))
    expect(hitTest(x, y, NOTES, CHORDS, GEO, 'vocal')).toMatchObject({ area: 'note', edge: 'body', note: { id: 'vocal:32' } })
    const rect = noteRect(note('vocal:32'), GEO)
    expect(hitTest(rect.x + rect.width - 1, y, NOTES, CHORDS, GEO, 'vocal')).toMatchObject({ area: 'note', edge: 'end' })
    const empty = hitTest(xOf(200, GEO), yOf(60, GEO) + 3, NOTES, CHORDS, GEO, 'vocal')
    expect(empty).toEqual({ area: 'grid', unit: 200, pitch: 60 })
    expect(hitTest(xOf(33, GEO), HEADER + 8, NOTES, CHORDS, GEO, 'vocal')).toMatchObject({ area: 'chord', chord: { id: 'chord:32' } })
    expect(hitTest(xOf(50, GEO), HEADER + 8, NOTES, CHORDS, GEO, 'vocal')).toMatchObject({ area: 'lane', unit: 50 })
    expect(hitTest(xOf(50, GEO), 4, NOTES, CHORDS, GEO, 'vocal').area).toBe('header')
    // scrolled down: the header and the lane stay at the top of the pane, over the rows below them
    const scrolled = 400
    expect(hitTest(xOf(50, GEO), scrolled + 4, NOTES, CHORDS, GEO, 'vocal', scrolled).area).toBe('header')
    expect(hitTest(xOf(50, GEO), scrolled + HEADER + 8, NOTES, CHORDS, GEO, 'vocal', scrolled)).toMatchObject({ area: 'lane' })
    expect(hitTest(xOf(50, GEO), scrolled + TOP + 3, NOTES, CHORDS, GEO, 'vocal', scrolled)).toMatchObject({ area: 'grid' })
  })
})

describe('the selection frame (select mode)', () => {
  it('spans the drag either way and keeps to the rows that can be seen', () => {
    expect(bandRect({ x0: 300, y0: 900, x1: 100, y1: 800 }, GEO)).toEqual({ x: 100, y: 800, width: 200, height: 100 })
    // pulled over the pitch column and into the pinned lane of a scrolled pane: only the rows below them
    expect(bandRect({ x0: 0, y0: 400, x1: 200, y1: 700 }, GEO, 500, 50)).toEqual({
      x: 50 + KEYS_WIDTH,
      y: 500 + TOP,
      width: 200 - 50 - KEYS_WIDTH,
      height: 700 - 500 - TOP
    })
    expect(bandRect({ x0: 100, y0: 800, x1: 1e6, y1: 1e6 }, GEO)).toMatchObject({ width: GEO.width - 100, height: GEO.height - 800 })
  })

  it('keeps its start when the pane scrolls along under the pointer', () => {
    // started on the rows at scroll 400, pulled to the bottom edge: the pane scrolled to 700, which moved
    // the start under the pinned lanes - the frame still reaches up to it (the tutorial 2 bug of 0.4.4)
    const frame = { x0: 300, y0: 400 + TOP + 40, x1: 500, y1: 700 + TOP + 300, from: { scrollTop: 400, scrollLeft: 0 } }
    expect(bandRect(frame, GEO, 700, 0)).toEqual({ x: 300, y: 400 + TOP + 40, width: 200, height: 300 + 260 })
    expect(bandInLane(frame, 700)).toBe(false)
    // pulled up into the lane of the scrolled pane, it does reach it
    expect(bandInLane({ ...frame, y1: 700 + HEADER + 4 }, 700)).toBe(true)
  })

  it('selects every note it touches', () => {
    // bars 2 and 3 of the vocal line: G#4 (66), F#5 (78), F4 (65) touched, not the note from unit 56 on
    const frame = bandRect({ x0: xOf(50, GEO), y0: yOf(64, GEO), x1: xOf(34, GEO), y1: yOf(79, GEO) }, GEO)
    expect(notesInRect(NOTES, frame, GEO).map((n) => n.id)).toEqual(['vocal:32', 'vocal:40', 'vocal:48'])
    // both voices at once
    const both = bandRect({ x0: xOf(97, GEO), y0: yOf(72, GEO), x1: xOf(99, GEO), y1: yOf(61, GEO) }, GEO)
    expect(notesInRect(NOTES, both, GEO).map((n) => n.id)).toEqual(['vocal:96', 'ins:96'])
    expect(notesInRect(NOTES, bandRect({ x0: xOf(200, GEO), y0: yOf(62, GEO), x1: xOf(210, GEO), y1: yOf(58, GEO) }, GEO), GEO)).toEqual([])
    expect(notesInRect(NOTES, { x: xOf(34, GEO), y: yOf(66, GEO), width: 0, height: 20 }, GEO)).toEqual([])
  })
})

describe('gestures commit exactly one canonical operation', () => {
  it('moves notes by the grid and in pitch, within the score', () => {
    const anchor = note('vocal:32')
    let drag = startMove([anchor], anchor, 34, 66)
    drag = dragTo(drag, 34 + 10.4, 68, GEO, { alt: false })
    expect(dragOp(drag, 'rests')).toEqual({ op: 'move_notes', ids: ['vocal:32'], delta: 10, semitones: 2 })
    expect(ghosts(drag)).toEqual([{ track: 'vocal', onset: 42, duration: 8, pitch: 68 }])
    expect(dragOp(dragTo(drag, 34, 66, GEO, { alt: false }), 'rests')).toBeNull() // back to the start
    expect(dragOp(dragTo(drag, -500, 66, GEO, { alt: false }), 'rests')).toMatchObject({ delta: -32 })
    const coarse = { ...GEO, snap: 8 }
    expect(dragOp(dragTo(startMove([anchor], anchor, 32, 66), 37, 66, coarse, { alt: false }), 'rests')).toMatchObject({ delta: 8 })
  })

  it('resizes into rests, or over the next note with Alt', () => {
    const target = note('vocal:112')
    const drag = dragTo(startResize(target), 139.6, 70, GEO, { alt: false })
    expect(dragOp(drag, 'rests')).toEqual({ op: 'resize_note', id: 'vocal:112', duration: 28, mode: 'rests' })
    expect(dragOp(dragTo(startResize(target), 139.6, 70, GEO, { alt: true }), 'rests')).toMatchObject({ mode: 'overwrite' })
    expect(dragOp(dragTo(startResize(target), 50, 70, GEO, { alt: false }), 'rests')).toMatchObject({ duration: 1 })
    expect(dragOp(dragTo(startResize(target), 128, 70, GEO, { alt: false }), 'rests')).toBeNull()
  })

  it('draws a note into the active track', () => {
    const start = startDraw('ins', 200.7, 60, GEO)
    expect(dragOp(dragTo(start, 209.2, 64, GEO, { alt: false }), 'rests')).toEqual({
      op: 'insert_note',
      track: 'ins',
      onset: 200,
      duration: 9,
      pitch: 60
    })
    expect(dragOp(dragTo(start, 150, 60, GEO, { alt: false }), 'rests')).toMatchObject({ onset: 200, duration: 1 })
  })

  it('moves chord symbols on the grid', () => {
    const chord = CHORDS[1]
    expect(dragOp(dragTo(startChord(chord), 47.6, 0, GEO, { alt: false }), 'rests')).toEqual({ op: 'move_chord', onset: 32, to: 48 })
    expect(dragOp(dragTo(startChord(chord), 32.2, 0, GEO, { alt: false }), 'rests')).toBeNull()
  })
})

describe('keyboard', () => {
  const selected = [note('vocal:32'), note('vocal:40')]

  it('maps keys to canonical operations', () => {
    const key = (name: string, shift = false, alt = false, notes = selected) =>
      keyOp(name, { shift, alt }, notes, [], GEO, 'rests')
    expect(key('ArrowUp')).toEqual({ op: 'set_note_pitch', ids: ['vocal:32', 'vocal:40'], semitones: 1 })
    expect(key('ArrowDown', true)).toMatchObject({ semitones: -12 })
    expect(key('ArrowRight')).toEqual({ op: 'move_notes', ids: ['vocal:32', 'vocal:40'], delta: 1 })
    expect(key('ArrowLeft', true)).toMatchObject({ delta: -8 })
    expect(key('ArrowRight', false, true)).toEqual({ op: 'resize_note', id: 'vocal:32', duration: 9, mode: 'rests' })
    expect(key('Delete')).toEqual({ op: 'delete', ids: ['vocal:32', 'vocal:40'] })
    expect(key('Backspace', true)).toEqual({ op: 'delete_close_gap', ids: ['vocal:32', 'vocal:40'] })
    expect(keyOp('Delete', { shift: false, alt: false }, [], [CHORDS[0]], GEO, 'rests')).toEqual({ op: 'delete', ids: ['chord:0'] })
    // chord symbols move by semitones too, alone or with the notes
    expect(keyOp('ArrowUp', { shift: false, alt: false }, [], [CHORDS[0]], GEO, 'rests')).toEqual({ op: 'set_note_pitch', ids: ['chord:0'], semitones: 1 })
    expect(keyOp('ArrowDown', { shift: false, alt: false }, selected, [CHORDS[0]], GEO, 'rests')).toEqual({
      op: 'set_note_pitch',
      ids: ['vocal:32', 'vocal:40', 'chord:0'],
      semitones: -1
    })
    expect(key('ArrowUp', true, false, [{ ...note('vocal:32'), pitch: 120 }])).toBeNull() // would leave MIDI
    expect(key('ArrowLeft', true, false, [note('ins:0')])).toBeNull() // already at the start
    expect(key('ArrowUp', false, false, [])).toBeUndefined()
    expect(key('x')).toBeUndefined()
  })
})

describe('selection shared with the staff', () => {
  it('maps written segments to canonical notes and back', () => {
    expect([...selectedNoteIds(VIEW, ['V3.1', 'ins:0', 'chord:0', 'V1.0'])]).toEqual(['vocal:64', 'ins:0'])
    expect(selectionFor([note('vocal:64')], [CHORDS[0]])).toEqual(['V3.0', 'V3.1', 'chord:0'])
    expect(elementSelection(VIEW, ['vocal:64', 'chord:0', 'V2.0', 'ins:9999'])).toEqual(['V3.0', 'V3.1', 'chord:0', 'V2.0', 'ins:9999'])
  })
})

// --- the component ----------------------------------------------------------------------------

interface Mounted {
  root: HTMLElement
  svg: SVGSVGElement
  state: { selection: string[]; view: ScoreView; stale: boolean; readonly: boolean }
  operate: ReturnType<typeof vi.fn>
  selects: string[][]
}

let app: App | null = null

afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
})

async function settle(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0))
  await nextTick()
}

function mount(answer: boolean | (() => Promise<boolean>) = true, selection: string[] = []): Mounted {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const state = reactive({ selection, view: VIEW, stale: false, readonly: false })
  const selects: string[][] = []
  const operate = vi.fn((_op: ScoreOperation) => (typeof answer === 'function' ? answer() : Promise.resolve(answer)))
  app = createApp({
    render: () =>
      h(PianoRoll, {
        view: state.view,
        selection: state.selection,
        stale: state.stale,
        readonly: state.readonly,
        operate,
        onSelect: (ids: string[]) => {
          selects.push(ids)
          state.selection = ids
        }
      })
  })
  app.mount(host)
  return {
    root: host.querySelector('.roll') as HTMLElement,
    svg: host.querySelector('svg.roll-svg') as SVGSVGElement,
    state,
    operate,
    selects
  }
}

function pointer(target: Element, type: string, x: number, y: number, init: PointerEventInit = {}): void {
  target.dispatchEvent(new PointerEvent(type, { clientX: x, clientY: y, button: 0, bubbles: true, pointerId: 1, ...init }))
}

async function gesture(svg: SVGSVGElement, from: [number, number], to: [number, number], init: PointerEventInit = {}): Promise<void> {
  pointer(svg, 'pointerdown', ...from, init)
  pointer(svg, 'pointermove', (from[0] + to[0]) / 2, (from[1] + to[1]) / 2, init)
  pointer(svg, 'pointermove', ...to, init)
  await nextTick()
  pointer(svg, 'pointerup', ...to, init)
  await settle()
}

function key(target: Element, name: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true, ...init })
  target.dispatchEvent(event)
  return event
}

describe('PianoRoll', () => {
  it('draws both voices, the chord lane and the bars', () => {
    const { svg } = mount()
    expect(svg.querySelectorAll('rect.note.vocal')).toHaveLength(MODEL.tracks.vocal.length)
    expect(svg.querySelectorAll('rect.note.ins')).toHaveLength(MODEL.tracks.ins.length)
    expect([...svg.querySelectorAll('g.chord text')].map((t) => t.textContent?.trim())).toEqual(CHORDS.map((c) => c.name))
    expect([...svg.querySelectorAll('text.section-label')].map((t) => t.textContent?.trim())).toEqual(['intro', 'verse', 'chorus'])
  })

  it('selects a note with all its written segments and shows the staff selection', async () => {
    const { svg, selects } = mount()
    const [x, y] = centre(note('vocal:64'))
    pointer(svg, 'pointerdown', x, y)
    pointer(svg, 'pointerup', x, y)
    await settle()
    expect(selects).toEqual([['V3.0', 'V3.1']])
    expect(svg.querySelector('rect.note.selected title')?.textContent).toContain('A4')
    // a click on the empty grid clears the selection
    pointer(svg, 'pointerdown', xOf(210, GEO), yOf(60, GEO) + 3)
    pointer(svg, 'pointerup', xOf(210, GEO), yOf(60, GEO) + 3)
    await settle()
    expect(selects.at(-1)).toEqual([])
  })

  it('moves a note with a ghost and commits one operation on release', async () => {
    let release: (value: boolean) => void = () => undefined
    const { svg, operate } = mount(() => new Promise<boolean>((resolve) => (release = resolve)))
    const [x, y] = centre(note('vocal:32'))
    pointer(svg, 'pointerdown', x, y)
    pointer(svg, 'pointermove', x + 16 * GEO.pxPerUnit, y - GEO.rowHeight)
    await nextTick()
    expect(svg.querySelectorAll('rect.ghost')).toHaveLength(1)
    expect(svg.querySelector('rect.note.dragged')).not.toBeNull()
    pointer(svg, 'pointerup', x + 16 * GEO.pxPerUnit, y - GEO.rowHeight)
    await settle()
    expect(operate).toHaveBeenCalledTimes(1)
    expect(operate).toHaveBeenCalledWith({ op: 'move_notes', ids: ['vocal:32'], delta: 16, semitones: 1 })
    expect(svg.querySelectorAll('rect.ghost')).toHaveLength(1) // shown until the answer arrives
    release(true)
    await settle()
    expect(svg.querySelectorAll('rect.ghost')).toHaveLength(0)
  })

  it('removes the ghost of a refused operation and keeps the score', async () => {
    const { svg, operate } = mount(false)
    const [x, y] = centre(note('vocal:32'))
    await gesture(svg, [x, y], [x + 40 * GEO.pxPerUnit, y])
    expect(operate).toHaveBeenCalledTimes(1)
    expect(svg.querySelectorAll('rect.ghost')).toHaveLength(0)
    expect(svg.querySelector('rect.note.dragged')).toBeNull()
    expect(svg.querySelectorAll('rect.note')).toHaveLength(NOTES.length)
  })

  it('draws into the active track, resizes and inserts on double-click', async () => {
    const { root, svg, operate } = mount()
    await gesture(svg, [xOf(200, GEO) + 1, yOf(60, GEO) + 3], [xOf(208, GEO) + 1, yOf(60, GEO) + 3])
    expect(operate).toHaveBeenLastCalledWith({ op: 'insert_note', track: 'vocal', onset: 200, duration: 8, pitch: 60 })
    ;(root.querySelector('.roll-tools button.ins') as HTMLButtonElement).click()
    await nextTick()
    await gesture(svg, [xOf(200, GEO) + 1, yOf(60, GEO) + 3], [xOf(204, GEO) + 1, yOf(60, GEO) + 3])
    expect(operate).toHaveBeenLastCalledWith({ op: 'insert_note', track: 'ins', onset: 200, duration: 4, pitch: 60 })
    const rect = noteRect(note('vocal:112'), GEO)
    const y = rect.y + 3
    await gesture(svg, [rect.x + rect.width - 1, y], [xOf(140, GEO), y], { altKey: true })
    expect(operate).toHaveBeenLastCalledWith({ op: 'resize_note', id: 'vocal:112', duration: 28, mode: 'overwrite' })
    svg.dispatchEvent(new MouseEvent('dblclick', { clientX: xOf(210, GEO) + 2, clientY: yOf(59, GEO) + 3, bubbles: true }))
    await settle()
    expect(operate).toHaveBeenLastCalledWith({ op: 'insert_note', track: 'ins', onset: 210, duration: 8, pitch: 59 })
  })

  it('handles the keyboard and keeps handled keys from the staff', async () => {
    const outer = vi.fn()
    const { root, operate } = mount(true, ['V2.0'])
    document.body.addEventListener('keydown', outer)
    key(root, 'ArrowUp')
    await settle()
    expect(operate).toHaveBeenLastCalledWith({ op: 'set_note_pitch', ids: ['vocal:32'], semitones: 1 })
    key(root, 'Delete', { shiftKey: true })
    await settle()
    expect(operate).toHaveBeenLastCalledWith({ op: 'delete_close_gap', ids: ['vocal:32'] })
    expect(outer).not.toHaveBeenCalled()
    key(root, ' ') // not the roll's key: the Score tab (transport) gets it
    expect(outer).toHaveBeenCalledTimes(1)
    document.body.removeEventListener('keydown', outer)
  })

  it('moves, adds and renames chord symbols in the lane', async () => {
    const { root, svg, operate } = mount()
    await gesture(svg, [xOf(33, GEO), HEADER + 8], [xOf(48, GEO), HEADER + 8])
    expect(operate).toHaveBeenLastCalledWith({ op: 'move_chord', onset: 32, to: 47 })
    svg.dispatchEvent(new MouseEvent('dblclick', { clientX: xOf(50, GEO) + 2, clientY: HEADER + 8, bubbles: true }))
    await nextTick()
    const input = root.querySelector('input.chord-edit') as HTMLInputElement
    expect(input).not.toBeNull()
    input.value = 'Em7'
    input.dispatchEvent(new Event('input'))
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await settle()
    expect(operate).toHaveBeenLastCalledWith({ op: 'put_chord', onset: 50, name: 'Em7' })
    expect(root.querySelector('input.chord-edit')).toBeNull()
  })

  it('only selects while the text is invalid or the sheet is read-only', async () => {
    const mounted = mount()
    mounted.state.stale = true
    await nextTick()
    const [x, y] = centre(note('vocal:32'))
    await gesture(mounted.svg, [x, y], [x + 50, y])
    key(mounted.root, 'Delete')
    await settle()
    expect(mounted.operate).not.toHaveBeenCalled()
    expect(mounted.selects[0]).toEqual(['V2.0'])
    expect(mounted.root.classList.contains('stale')).toBe(true)
  })

  it('explains a score outside the supported subset', () => {
    const outside = { ...VIEW, model: null, model_error: { message: 'bar 1: not a whole number of units', diagnostics: [] } }
    const host = document.createElement('div')
    document.body.appendChild(host)
    app = createApp({ render: () => h(PianoRoll, { view: outside, selection: [], operate: vi.fn() }) })
    app.mount(host)
    expect(host.querySelector('svg.roll-svg')).toBeNull()
    expect(host.querySelector('.roll-note')?.textContent).toContain('not a whole number')
  })
})

describe('PianoRoll modes', () => {
  const modeButton = (root: HTMLElement, mode: 'draw' | 'select'): HTMLButtonElement =>
    root.querySelector(`.roll-tools button.mode.${mode}`) as HTMLButtonElement

  async function selectMode(root: HTMLElement): Promise<void> {
    modeButton(root, 'select').click()
    await nextTick()
  }

  it('opens in draw mode, every time', async () => {
    let mounted = mount()
    expect(mounted.root.classList.contains('mode-draw')).toBe(true)
    expect(modeButton(mounted.root, 'draw').getAttribute('aria-pressed')).toBe('true')
    expect(mounted.root.querySelector('.roll-tools .hint')?.textContent).toContain('drag: draw')
    await selectMode(mounted.root)
    expect(mounted.root.classList.contains('mode-select')).toBe(true)
    expect(modeButton(mounted.root, 'select').getAttribute('aria-pressed')).toBe('true')
    expect(mounted.root.querySelector('.roll-tools .hint')?.textContent).toContain('frame the notes')
    app?.unmount()
    mounted = mount()
    expect(mounted.root.classList.contains('mode-draw')).toBe(true)
    await gesture(mounted.svg, [xOf(200, GEO) + 1, yOf(60, GEO) + 3], [xOf(208, GEO) + 1, yOf(60, GEO) + 3])
    expect(mounted.operate).toHaveBeenLastCalledWith({ op: 'insert_note', track: 'vocal', onset: 200, duration: 8, pitch: 60 })
  })

  it('selects the notes a frame touches, shows them while it is pulled and adds with Shift', async () => {
    const { root, svg, operate, selects } = mount()
    await selectMode(root)
    pointer(svg, 'pointerdown', xOf(50, GEO), yOf(63, GEO) + 2)
    pointer(svg, 'pointermove', xOf(40, GEO), yOf(70, GEO))
    pointer(svg, 'pointermove', xOf(34, GEO), yOf(79, GEO))
    await nextTick()
    expect(svg.querySelector('rect.band')).not.toBeNull()
    expect(svg.querySelectorAll('rect.note.selected')).toHaveLength(3) // before the release
    expect(selects).toEqual([])
    pointer(svg, 'pointerup', xOf(34, GEO), yOf(79, GEO))
    await settle()
    expect(operate).not.toHaveBeenCalled() // selecting draws nothing
    expect(selects.at(-1)).toEqual(['V2.0', 'V2.1', 'V2.2']) // the staff and the text select them too
    expect(svg.querySelector('rect.band')).toBeNull()
    // Shift: the frame adds to the selection (from the empty grid above the note at unit 56)
    await gesture(svg, [xOf(60, GEO), yOf(80, GEO) + 3], [xOf(58, GEO), yOf(77, GEO) + 3], { shiftKey: true })
    expect(selects.at(-1)).toEqual(['V2.0', 'V2.1', 'V2.2', 'V2.3'])
    // a frame without Shift replaces it
    await gesture(svg, [xOf(97, GEO), yOf(72, GEO)], [xOf(99, GEO), yOf(61, GEO)])
    expect(selects.at(-1)).toEqual(['V4.0', 'I4.0'])
    // a click on the empty grid clears it
    pointer(svg, 'pointerdown', xOf(210, GEO), yOf(60, GEO) + 3)
    pointer(svg, 'pointerup', xOf(210, GEO), yOf(60, GEO) + 3)
    await settle()
    expect(selects.at(-1)).toEqual([])
  })

  it('moves all selected notes by dragging one of them and draws no notes', async () => {
    const { root, svg, operate } = mount(true, ['V2.0', 'V2.1', 'V2.2'])
    await selectMode(root)
    const [x, y] = centre(note('vocal:40'))
    await gesture(svg, [x, y], [x + 16 * GEO.pxPerUnit, y])
    expect(operate).toHaveBeenLastCalledWith({ op: 'move_notes', ids: ['vocal:32', 'vocal:40', 'vocal:48'], delta: 16, semitones: 0 })
    operate.mockClear()
    svg.dispatchEvent(new MouseEvent('dblclick', { clientX: xOf(210, GEO) + 2, clientY: yOf(59, GEO) + 3, bubbles: true }))
    await settle()
    expect(operate).not.toHaveBeenCalled()
  })

  it('cancels a frame with Escape and selects while the score cannot be edited', async () => {
    const { root, svg, state, selects } = mount()
    state.stale = true
    await selectMode(root)
    pointer(svg, 'pointerdown', xOf(50, GEO), yOf(63, GEO) + 2)
    pointer(svg, 'pointermove', xOf(34, GEO), yOf(79, GEO))
    await nextTick()
    expect(key(root, 'Escape').defaultPrevented).toBe(true)
    await nextTick()
    expect(svg.querySelector('rect.band')).toBeNull()
    pointer(svg, 'pointerup', xOf(34, GEO), yOf(79, GEO))
    await settle()
    expect(selects).toEqual([])
    await gesture(svg, [xOf(50, GEO), yOf(63, GEO) + 2], [xOf(34, GEO), yOf(79, GEO)])
    expect(selects.at(-1)).toEqual(['V2.0', 'V2.1', 'V2.2'])
  })

  it('selects all notes and chord symbols with Ctrl+A (Cubase: Select All)', async () => {
    const { root, selects } = mount(true, ['chord:0'])
    const event = key(root, 'a', { ctrlKey: true })
    await settle()
    expect(event.defaultPrevented).toBe(true)
    expect(selects.at(-1)).toEqual(selectionFor(NOTES, CHORDS))
  })
})

describe('PianoRoll scrolling', () => {
  it('scrolls in its pane and keeps the header and the chord lane on top', async () => {
    const { root, svg } = mount()
    const scroller = root.querySelector('.roll-scroll') as HTMLElement
    expect(parseFloat(scroller.style.height)).toBe(280) // the pane, not the full range (1098 px)
    scroller.scrollTop = 500
    scroller.dispatchEvent(new Event('scroll'))
    await settle()
    expect(svg.querySelector('g.roll-top')?.getAttribute('transform')).toBe('translate(0 500)')
    // a double-click in the pinned lane (below the header of the *scrolled* pane) opens the chord field there
    svg.dispatchEvent(new MouseEvent('dblclick', { clientX: xOf(50, GEO), clientY: 500 + HEADER + 8, bubbles: true }))
    await settle()
    const field = root.querySelector('input.chord-edit') as HTMLInputElement
    expect(field).toBeTruthy()
    expect(field.style.top).toBe(`${HEADER + 1 + 500}px`)
  })
})

// keep the lane constants honest for the CSS and the tests above
it('lays the header and the lane above the rows', () => {
  expect(TOP).toBe(HEADER + LANE)
})
