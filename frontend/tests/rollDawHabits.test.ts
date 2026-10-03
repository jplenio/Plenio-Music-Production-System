/**
 * DAW habits in the score editor (owner's request 2026-10-03: "DAW users should know their way at
 * once", covers with full control): a click draws a note, Shift+drag frames in draw mode, Alt+drag
 * copies, a note's end stops at the next note, the keyboard and the source lane, Ctrl+wheel and G / H
 * zoom - and the playing clock that keeps a cover's source recording, the notes and the metronome
 * together bar by bar.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { type App, createApp, h, nextTick, reactive } from 'vue'

import type { ScoreOperation } from '../src/api/client'
import { playClock, schedule, scoreTime, sourceSegments, toReal, toScore } from '../src/shared/playback'
import type { ScoreModelView, ScoreView } from '../src/shared/scoreView'
import PianoRoll from '../src/sheet-editor/score/PianoRoll.vue'
import {
  KEYS_WIDTH,
  SOURCE_LANE,
  TOP,
  dragOp,
  dragTo,
  geometry,
  hitTest,
  noteRect,
  notesOf,
  startMove,
  startResize,
  xOf,
  yOf
} from '../src/sheet-editor/score/pianoRoll'
import { envelopeOf, waveColumns } from '../src/sheet-editor/score/sourceAudio'
import fixture from './fixtures/tricky-score.json'

const VIEW = fixture.view as unknown as ScoreView
const MODEL = VIEW.model as ScoreModelView
const NOTES = notesOf(MODEL)
const GEO = geometry(MODEL, { pxPerQuarter: 48, snap: 'auto' })

describe('the roll: gestures as in a DAW', () => {
  it('stops a note at the next note of its voice; Alt goes over it', () => {
    const vocal = NOTES.filter((n) => n.track === 'vocal').sort((a, b) => a.onset - b.onset)
    const note = vocal[0]
    const next = vocal[1]
    // the next note right after it: nothing to grow into
    const touching = [{ ...note }, { ...next, onset: note.onset + note.duration }]
    const far = note.onset + note.duration + 24
    expect(dragOp(dragTo(startResize(touching[0], touching, MODEL.total), far, note.pitch, GEO, { alt: false }), 'rests')).toBeNull()
    const over = dragOp(dragTo(startResize(touching[0], touching, MODEL.total), far, note.pitch, GEO, { alt: true }), 'rests')
    expect(over).toMatchObject({ op: 'resize_note', id: note.id, mode: 'overwrite' })
    // with rest after it, it grows up to the next note, never past it
    const roomy = [{ ...note }, { ...next, onset: note.onset + note.duration + 16 }]
    expect(dragOp(dragTo(startResize(roomy[0], roomy, MODEL.total), roomy[1].onset + 20, note.pitch, GEO, { alt: false }), 'rests')).toEqual({
      op: 'resize_note',
      id: note.id,
      duration: note.duration + 16,
      mode: 'rests'
    })
  })

  it('copies notes with Alt+drag: a paste where they were dropped, the originals stay', () => {
    const anchor = NOTES.find((n) => n.track === 'vocal')!
    const drag = dragTo(startMove([anchor], anchor, anchor.onset, anchor.pitch), anchor.onset + 32, anchor.pitch + 2, GEO, { alt: true })
    expect(dragOp(drag, 'rests')).toEqual({
      op: 'paste',
      at: anchor.onset + 32,
      mode: 'overwrite',
      span: anchor.duration,
      tracks: ['vocal'],
      with_chords: false,
      notes: [{ track: 'vocal', onset: 0, duration: anchor.duration, pitch: anchor.pitch + 2 }],
      chords: [],
      sections: []
    })
  })

  it('knows the keyboard column and the source lane', () => {
    const withSource = geometry(MODEL, { pxPerQuarter: 48, snap: 'auto', source: true })
    expect(withSource.sourceTop).toBe(TOP)
    expect(withSource.top).toBe(TOP + SOURCE_LANE)
    expect(hitTest(KEYS_WIDTH + 200, TOP + 5, NOTES, [], withSource, 'vocal')).toMatchObject({ area: 'source' })
    // the keyboard stays at the left while the pane scrolls: a note under it cannot be hit there
    const n = NOTES[0]
    const rect = noteRect(n, GEO)
    expect(hitTest(rect.x + 2, rect.y + 2, NOTES, [], GEO, 'vocal', 0, rect.x - 10)).toEqual({ area: 'keys', pitch: n.pitch })
    expect(hitTest(rect.x + 2, rect.y + 2, NOTES, [], GEO, 'vocal', 0, 0)).toMatchObject({ area: 'note' })
  })
})

// --- the component ----------------------------------------------------------------------------

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

function mount(selection: string[] = []) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const state = reactive({ selection, zoom: 48 })
  const operate = vi.fn((_op: ScoreOperation) => Promise.resolve(true))
  app = createApp({
    render: () =>
      h(PianoRoll, {
        view: VIEW,
        selection: state.selection,
        operate,
        audition: false,
        zoom: state.zoom,
        'onUpdate:zoom': (value: number) => (state.zoom = value),
        onSelect: (ids: string[]) => (state.selection = ids)
      })
  })
  app.mount(host)
  return { root: host.querySelector('.roll') as HTMLElement, svg: host.querySelector('svg.roll-svg') as SVGSVGElement, operate, state }
}

function pointer(target: Element, type: string, x: number, y: number, init: PointerEventInit = {}): void {
  target.dispatchEvent(new PointerEvent(type, { clientX: x, clientY: y, button: 0, bubbles: true, pointerId: 1, ...init }))
}

describe('PianoRoll: DAW habits', () => {
  it('inserts a note with a click on the empty grid (a beat, then the last drawn length)', async () => {
    const { svg, operate } = mount()
    pointer(svg, 'pointerdown', xOf(210, GEO), yOf(60, GEO) + 3)
    pointer(svg, 'pointerup', xOf(210, GEO), yOf(60, GEO) + 3)
    await settle()
    expect(operate).toHaveBeenLastCalledWith({ op: 'insert_note', track: 'vocal', onset: 210, duration: GEO.drawLength, pitch: 60 })
    // a drawn note sets the length the next click inserts
    pointer(svg, 'pointerdown', xOf(176, GEO), yOf(62, GEO) + 3)
    pointer(svg, 'pointermove', xOf(180, GEO), yOf(62, GEO) + 3)
    pointer(svg, 'pointermove', xOf(188, GEO), yOf(62, GEO) + 3)
    await nextTick()
    pointer(svg, 'pointerup', xOf(188, GEO), yOf(62, GEO) + 3)
    await settle()
    expect(operate).toHaveBeenLastCalledWith(expect.objectContaining({ op: 'insert_note', onset: 176, duration: 12 }))
    pointer(svg, 'pointerdown', xOf(150, GEO), yOf(59, GEO) + 3)
    pointer(svg, 'pointerup', xOf(150, GEO), yOf(59, GEO) + 3)
    await settle()
    expect(operate).toHaveBeenLastCalledWith(expect.objectContaining({ op: 'insert_note', onset: 150, duration: 12 }))
  })

  it('only lets the selection go with a click on the empty grid while notes are selected', async () => {
    const { svg, operate, state } = mount(['V2.0'])
    pointer(svg, 'pointerdown', xOf(210, GEO), yOf(60, GEO) + 3)
    pointer(svg, 'pointerup', xOf(210, GEO), yOf(60, GEO) + 3)
    await settle()
    expect(operate).not.toHaveBeenCalled()
    expect(state.selection).toEqual([])
  })

  it('pulls a frame with Shift+drag in draw mode and draws nothing', async () => {
    const { svg, operate, state } = mount()
    pointer(svg, 'pointerdown', xOf(50, GEO), yOf(63, GEO) + 2, { shiftKey: true })
    pointer(svg, 'pointermove', xOf(40, GEO), yOf(70, GEO), { shiftKey: true })
    pointer(svg, 'pointermove', xOf(34, GEO), yOf(79, GEO), { shiftKey: true })
    await nextTick()
    pointer(svg, 'pointerup', xOf(34, GEO), yOf(79, GEO), { shiftKey: true })
    await settle()
    expect(operate).not.toHaveBeenCalled()
    expect(state.selection).toEqual(['V2.0', 'V2.1', 'V2.2'])
  })

  it('quantizes with Q (the selection, else all notes) and zooms the rows with Shift+G / H and Alt+wheel', async () => {
    const { root, operate, state } = mount(['V2.0'])
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'q', bubbles: true }))
    await settle()
    expect(operate).toHaveBeenLastCalledWith({ op: 'quantize', ids: ['vocal:32'], grid: GEO.snap, lengths: false })
    state.selection = []
    await nextTick()
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'Q', shiftKey: true, bubbles: true }))
    await settle()
    expect(operate).toHaveBeenLastCalledWith(expect.objectContaining({ op: 'quantize', lengths: true }))
    expect((operate.mock.lastCall?.[0] as { ids: string[] }).ids).toHaveLength(NOTES.length)
    const svg = root.querySelector('svg.roll-svg') as SVGSVGElement
    const height = Number(svg.getAttribute('height'))
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'H', shiftKey: true, bubbles: true }))
    await settle()
    const taller = Number(svg.getAttribute('height'))
    expect(taller).toBeGreaterThan(height)
    const wheel = new MouseEvent('wheel', { altKey: true, bubbles: true, cancelable: true })
    Object.defineProperty(wheel, 'deltaY', { value: 100 })
    ;(root.querySelector('.roll-scroll') as HTMLElement).dispatchEvent(wheel)
    await settle()
    expect(wheel.defaultPrevented).toBe(true)
    expect(Number(svg.getAttribute('height'))).toBeLessThan(taller)
  })

  it('zooms with Ctrl+wheel and with G / H, never the page', async () => {
    const { root, state } = mount()
    const scroller = root.querySelector('.roll-scroll') as HTMLElement
    // (jsdom's WheelEvent drops the modifier keys: a MouseEvent of type wheel carries them)
    const wheel = new MouseEvent('wheel', { ctrlKey: true, bubbles: true, cancelable: true, clientX: 300 })
    Object.defineProperty(wheel, 'deltaY', { value: -100 })
    scroller.dispatchEvent(wheel)
    await settle()
    expect(wheel.defaultPrevented).toBe(true)
    expect(state.zoom).toBeGreaterThan(48)
    const before = state.zoom
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', bubbles: true }))
    await settle()
    expect(state.zoom).toBeLessThan(before)
    // a plain wheel scrolls the pane as always
    const plain = new MouseEvent('wheel', { bubbles: true, cancelable: true })
    Object.defineProperty(plain, 'deltaY', { value: 100 })
    scroller.dispatchEvent(plain)
    expect(plain.defaultPrevented).toBe(false)
  })
})

// --- the playing clock of a cover --------------------------------------------------------------

describe('the playing clock: the source recording, the notes and the metronome together', () => {
  // three bars of 2 s in the score; the source sings them in 2.2 s, 1.8 s and - after a jump back
  // (an arranged cover: bar 3 is a copy of bar 1) - bar 1's 2.2 s again
  const view = {
    bars: [
      { index: 1, start_s: 0, duration_s: 2, meter: '4/4' },
      { index: 2, start_s: 2, duration_s: 2, meter: '4/4' },
      { index: 3, start_s: 4, duration_s: 2, meter: '4/4' }
    ],
    duration_s: 6,
    notes: { Vocal: [{ start_s: 3, duration_s: 1, midi: 60 }], Ins: [] },
    chords: []
  } as unknown as ScoreView
  const bars: [number, number, string][] = [
    [10, 12.2, '4/4'],
    [12.2, 14, '4/4'],
    [10, 12.2, '4/4']
  ]
  const clock = playClock(view, bars)

  it('gives every bar the length of its source bar', () => {
    expect(clock.map((b) => [Number(b.realStart.toFixed(3)), Number(b.realDur.toFixed(3))])).toEqual([
      [0, 2.2],
      [2.2, 1.8],
      [4, 2.2]
    ])
    expect(toReal(clock, 3)).toBeCloseTo(3.1)
    expect(toScore(clock, 3.1)).toBeCloseTo(3)
    // without a timeline the clock is the score's own
    expect(playClock(view, undefined).map((b) => b.realDur)).toEqual([2, 2, 2])
  })

  it('plays the source in pieces: on where it runs on, again from bar 1 for the copy', () => {
    expect(sourceSegments(clock, 0)).toEqual([
      { at: 0, offset: 10, duration: 4 },
      { at: 4, offset: 10, duration: expect.closeTo(2.2, 6) }
    ])
    // from the middle of bar 2, to the end of bar 2 (a loop)
    const [piece] = sourceSegments(clock, 3, 4)
    expect(piece.at).toBe(0)
    expect(piece.offset).toBeCloseTo(13.1)
    expect(piece.duration).toBeCloseTo(0.9)
    // a pickup bar padded before the recording: the recording starts when its first second comes
    const padded = playClock(view, [[-0.5, 1.5, '4/4'], [1.5, 3.5, '4/4'], null])
    expect(sourceSegments(padded, 0)).toEqual([{ at: 0.5, offset: 0, duration: 3.5 }])
  })

  it('schedules the notes and the clicks on the source clock and maps the time back', () => {
    const events = schedule(view, { from: 2, voices: { Vocal: true, Ins: true, chords: false }, speed: 1, metronome: true, clock })
    const tone = events.find((e) => e.part === 'Vocal')!
    expect(tone.at).toBeCloseTo(0.9) // half of bar 2 on the source clock (1.8 s / 2)
    expect(tone.duration).toBeCloseTo(0.9)
    const clicks = events.filter((e) => e.part === 'click').map((e) => Number(e.at.toFixed(3)))
    expect(clicks.slice(0, 5)).toEqual([0, 0.45, 0.9, 1.35, 1.8])
    expect(scoreTime({ from: 2, voices: { Vocal: true, Ins: true, chords: false }, speed: 1, clock }, 0.9)).toBeCloseTo(3)
  })
})

describe('the source waveform', () => {
  it('keeps the extremes per column', () => {
    const samples = new Float32Array(1000)
    samples[100] = 0.5
    samples[900] = -0.8
    const envelope = envelopeOf(samples, 1000, 10)
    expect(envelope.max[1]).toBeCloseTo(0.5)
    expect(envelope.min[9]).toBeCloseTo(-0.8)
    const columns = waveColumns(envelope, 0, 1, 2)
    expect(columns[0][1]).toBeCloseTo(0.5)
    expect(columns[1][0]).toBeCloseTo(-0.8)
  })
})
