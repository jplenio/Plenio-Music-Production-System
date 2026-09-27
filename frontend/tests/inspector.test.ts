/**
 * The inspector (M1/D2): focus, positions, parsing, the one canonical operation of each field,
 * the layout rule, the metronome, and the mounted component with a fake ``operate``.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { type App, createApp, h, nextTick } from 'vue'

import type { ScoreOperation } from '../src/api/client'
import { schedule } from '../src/shared/playback'
import type { ScoreModelView, ScoreView } from '../src/shared/scoreView'
import Inspector from '../src/sheet-editor/score/Inspector.vue'
import {
  KEYS,
  chordMoveOp,
  chordOp,
  deleteBarsOp,
  duplicateBarsOp,
  focusOf,
  initialLayout,
  insertBarsOp,
  keyChangeAt,
  keyOp,
  lengthChoices,
  lengthOp,
  meterOp,
  onsetFrom,
  parsePitch,
  pitchName,
  pitchOp,
  positionOf,
  removeKeyOp,
  shiftOp,
  startOp,
  voiceOp
} from '../src/sheet-editor/score/inspector'
import { type RollNote, notesOf } from '../src/sheet-editor/score/pianoRoll'
import fixture from './fixtures/tricky-score.json'

const VIEW = fixture.view as unknown as ScoreView
const MODEL = VIEW.model as ScoreModelView
const NOTES = notesOf(MODEL)
const note = (id: string): RollNote => NOTES.find((n) => n.id === id) as RollNote
const bar = (n: number) => MODEL.measures[n - 1]

describe('focus and positions', () => {
  it('puts the selected notes, a chord and the bar into focus', () => {
    const one = focusOf(VIEW, ['V3.1'], null) // a tied segment of vocal:64
    expect(one.notes.map((n) => n.id)).toEqual(['vocal:64'])
    expect(one.chordAtNote?.name).toBe('A7')
    expect(one.measure?.n).toBe(3)
    expect(focusOf(VIEW, ['chord:32'], null)).toMatchObject({ chords: [{ name: 'G' }], measure: { n: 2 } })
    expect(focusOf(VIEW, ['V1.0'], 1)).toMatchObject({ notes: [], measure: { n: 1 } }) // a rest: its bar
    expect(focusOf(VIEW, [], null)).toMatchObject({ notes: [], chords: [], measure: null })
    expect(focusOf(null, ['V2.0'], 2).measure).toBeNull()
  })

  it('says where an onset is and finds it again', () => {
    expect(positionOf(MODEL, 32).text).toBe('bar 2 · beat 1')
    expect(positionOf(MODEL, 50)).toMatchObject({ bar: 2, offset: 18, beat: 3, tick: 2, text: 'bar 2 · beat 3 + 2/32' })
    expect(onsetFrom(MODEL, 2, 18)).toBe(50)
    expect(onsetFrom(MODEL, 2, 32)).toBeNull() // past the bar
    expect(onsetFrom(MODEL, 9, 0)).toBeNull()
    expect(onsetFrom(MODEL, 2, 1.5)).toBeNull()
  })

  it('reads pitches and offers the note values of the score', () => {
    expect(parsePitch('C#5')).toBe(73)
    expect(parsePitch('bb3')).toBe(58)
    expect(parsePitch('E##4')).toBe(66)
    expect(parsePitch(' 60 ')).toBe(60)
    expect(parsePitch('C-1')).toBe(0)
    for (const bad of ['H4', 'C#', '128', 'G9#', '']) expect(parsePitch(bad)).toBeNull()
    expect(pitchName(66)).toBe('F#4')
    expect(lengthChoices(MODEL).map((c) => `${c.label}=${c.units}`)).toEqual([
      '1/32=1',
      '1/16=2',
      '1/16.=3',
      '1/8=4',
      '1/8.=6',
      '1/4=8',
      '1/4.=12',
      '1/2=16',
      '1/2.=24',
      '1/1=32'
    ])
  })
})

describe('each field commits one canonical operation', () => {
  it('notes', () => {
    const n = note('vocal:32')
    expect(pitchOp([n], 70)).toEqual({ op: 'set_note_pitch', ids: ['vocal:32'], midi: 70 })
    expect(pitchOp([n], 66)).toBeNull()
    expect(shiftOp([n, note('vocal:40')], -12)).toEqual({ op: 'set_note_pitch', ids: ['vocal:32', 'vocal:40'], semitones: -12 })
    expect(shiftOp([{ ...n, pitch: 120 }], 12)).toBeNull()
    expect(voiceOp([n], 'ins')).toEqual({ op: 'move_notes', ids: ['vocal:32'], track: 'ins' })
    expect(voiceOp([n], 'vocal')).toBeNull()
    expect(startOp(MODEL, n, 50)).toEqual({ op: 'move_notes', ids: ['vocal:32'], delta: 18 })
    expect(startOp(MODEL, n, 220)).toBeNull() // would end after the score
    expect(startOp(MODEL, n, null)).toBeNull()
    expect(lengthOp(MODEL, n, 12, 'rests')).toEqual({ op: 'resize_note', id: 'vocal:32', duration: 12, mode: 'rests' })
    expect(lengthOp(MODEL, n, 8, 'rests')).toBeNull()
    expect(lengthOp(MODEL, n, 0, 'rests')).toBeNull()
  })

  it('chord symbols', () => {
    const chord = MODEL.tracks.chords[1]
    expect(chordOp(32, ' Em7 ', chord)).toEqual({ op: 'put_chord', onset: 32, name: 'Em7' })
    expect(chordOp(32, 'G', chord)).toBeNull()
    expect(chordOp(32, '', chord)).toEqual({ op: 'delete_chord', onset: 32 })
    expect(chordOp(40, '', null)).toBeNull()
    expect(chordMoveOp(chord, 40)).toEqual({ op: 'move_chord', onset: 32, to: 40 })
    expect(chordMoveOp(chord, 32)).toBeNull()
  })

  it('bars, meter and key', () => {
    expect(insertBarsOp(bar(3), 'before')).toEqual({ op: 'insert_measures', bar: 3, count: 1 })
    expect(insertBarsOp(bar(7), 'after')).toEqual({ op: 'insert_measures', bar: 8, count: 1 })
    expect(duplicateBarsOp(bar(2))).toEqual({ op: 'duplicate_measures', bar: 2, count: 1 })
    expect(deleteBarsOp(MODEL, bar(2))).toEqual({ op: 'delete_measures', bar: 2, count: 1 })
    expect(deleteBarsOp({ ...MODEL, measures: [bar(1)] }, bar(1))).toBeNull()
    expect(meterOp(bar(1), '3/4')).toEqual({ op: 'change_meter', bar: 1, count: 1, meter: '3/4' })
    expect(meterOp(bar(1), '4/4')).toBeNull()
    expect(meterOp(bar(1), 'waltz')).toBeNull()
    expect(keyOp(bar(4), 'G')).toEqual({ op: 'put_key', onset: 96, key: 'G' })
    expect(keyOp(bar(4), 'D')).toBeNull() // already D
    expect(keyOp(bar(4), 'H')).toBeNull()
    expect(keyChangeAt(MODEL, bar(1))).toBeNull() // the first key can only be changed
    const changed = { ...MODEL, keys: [...MODEL.keys, { onset: 96, key: 'G' }] }
    expect(removeKeyOp(changed, bar(4))).toEqual({ op: 'delete_key', onset: 96 })
    expect(removeKeyOp(MODEL, bar(4))).toBeNull()
    expect(KEYS).toHaveLength(30)
  })

  it('opens the layout of the node, else the remembered one', () => {
    expect(initialLayout('text', 'review')).toBe('text')
    expect(initialLayout('review', 'text')).toBe('review')
    expect(initialLayout('daw', 'text')).toBe('daw')
    expect(initialLayout(undefined, 'text')).toBe('text')
    expect(initialLayout(42, 'review')).toBe('review')
  })
})

describe('metronome', () => {
  it('clicks on every beat, higher on the first beat of a bar', () => {
    const base = { from: 0, to: null, voices: { Vocal: false, Ins: false, chords: false }, speed: 1 }
    expect(schedule(VIEW, base)).toEqual([])
    const clicks = schedule(VIEW, { ...base, metronome: true })
    expect(clicks).toHaveLength(7 * 4)
    expect(clicks.every((c) => c.part === 'click')).toBe(true)
    expect(clicks.slice(0, 5).map((c) => c.midi)).toEqual([96, 89, 89, 89, 96])
    const beat = VIEW.bars[0].duration_s / 4
    expect(clicks[1].at).toBeCloseTo(beat, 6)
    const half = schedule(VIEW, { ...base, metronome: true, speed: 0.5, from: VIEW.bars[1].start_s })
    expect(half).toHaveLength(6 * 4)
    expect(half[1].at).toBeCloseTo(beat * 2, 6)
  })
})

// --- the component ----------------------------------------------------------------------------

let app: App | null = null

afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
})

function mount(selection: string[], props: Record<string, unknown> = {}) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const operate = vi.fn((_op: ScoreOperation) => Promise.resolve(true))
  app = createApp({ render: () => h(Inspector, { view: VIEW, selection, operate, ...props }) })
  app.mount(host)
  return { host, operate }
}

function field(host: HTMLElement, label: string): HTMLInputElement {
  const element = host.querySelector(`[aria-label^="${label}"]`)
  if (!element) throw new Error(`no field ${label}`)
  return element as HTMLInputElement
}

async function enter(input: HTMLInputElement, value: string): Promise<void> {
  input.value = value
  input.dispatchEvent(new Event('input'))
  input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
  await nextTick()
}

function button(host: HTMLElement, text: string): HTMLButtonElement {
  const found = [...host.querySelectorAll('button')].find((b) => b.textContent?.trim() === text)
  if (!found) throw new Error(`no button ${text}`)
  return found as HTMLButtonElement
}

describe('Inspector', () => {
  it('shows the selected note and commits its fields', async () => {
    const { host, operate } = mount(['V2.0'])
    expect(host.querySelector('h4')?.textContent).toContain('Vocal note')
    expect(host.querySelector('h4')?.textContent).toContain('bar 2 · beat 1')
    expect(field(host, 'Pitch (').value).toBe('F#4')
    await enter(field(host, 'Pitch ('), 'A4')
    expect(operate).toHaveBeenLastCalledWith({ op: 'set_note_pitch', ids: ['vocal:32'], midi: 69 })
    await enter(field(host, 'Units of'), '8')
    expect(operate).toHaveBeenLastCalledWith({ op: 'move_notes', ids: ['vocal:32'], delta: 8 })
    await enter(field(host, 'Length in units'), '12')
    expect(operate).toHaveBeenLastCalledWith({ op: 'resize_note', id: 'vocal:32', duration: 12, mode: 'rests' })
    const overwrite = host.querySelector('input[type="checkbox"]') as HTMLInputElement
    overwrite.checked = true
    overwrite.dispatchEvent(new Event('change'))
    await nextTick()
    await enter(field(host, 'Length in units'), '16')
    expect(operate).toHaveBeenLastCalledWith({ op: 'resize_note', id: 'vocal:32', duration: 16, mode: 'overwrite' })
    await enter(field(host, 'Chord symbol where'), 'Em')
    expect(operate).toHaveBeenLastCalledWith({ op: 'put_chord', onset: 32, name: 'Em' })
    button(host, 'Ins').click()
    expect(operate).toHaveBeenLastCalledWith({ op: 'move_notes', ids: ['vocal:32'], track: 'ins' })
    button(host, '→ rest').click()
    expect(operate).toHaveBeenLastCalledWith({ op: 'delete', ids: ['vocal:32'] })
  })

  it('refuses an unreadable pitch without an operation', async () => {
    const { host, operate } = mount(['V2.0'])
    await enter(field(host, 'Pitch ('), 'H2')
    expect(operate).not.toHaveBeenCalled()
    expect(host.querySelector('.error')?.textContent).toContain('not a pitch')
    expect(field(host, 'Pitch (').value).toBe('F#4')
  })

  it('edits bars, meter and key', async () => {
    const { host, operate } = mount(['V4.0'])
    expect(host.querySelector('[aria-label="Bar 4"] h4')?.textContent).toContain('Bar 4')
    button(host, '+ after').click()
    expect(operate).toHaveBeenLastCalledWith({ op: 'insert_measures', bar: 5, count: 1 })
    button(host, 'duplicate').click()
    expect(operate).toHaveBeenLastCalledWith({ op: 'duplicate_measures', bar: 4, count: 1 })
    await enter(field(host, 'Meter of this bar'), '3/4')
    expect(operate).toHaveBeenLastCalledWith({ op: 'change_meter', bar: 4, count: 1, meter: '3/4' })
    const key = field(host, 'Key from this bar on') as unknown as HTMLSelectElement
    key.value = 'Bm'
    key.dispatchEvent(new Event('change'))
    await nextTick()
    expect(operate).toHaveBeenLastCalledWith({ op: 'put_key', onset: 96, key: 'Bm' })
  })

  it('edits a chord symbol selected in the chord lane', async () => {
    const { host, operate } = mount(['chord:64'])
    expect(host.querySelector('h4')?.textContent).toContain('Chord symbol')
    await enter(field(host, 'Chord symbol (empty'), '')
    expect(operate).toHaveBeenLastCalledWith({ op: 'delete_chord', onset: 64 })
  })

  it('is read-only while the text is invalid', async () => {
    const { host, operate } = mount(['V2.0'], { stale: true })
    expect(field(host, 'Pitch (').disabled).toBe(true)
    button(host, '+1').click()
    expect(operate).not.toHaveBeenCalled()
  })

  it('asks for a selection and explains a score outside the subset', () => {
    const { host } = mount([])
    expect(host.textContent).toContain('Select a note')
    app?.unmount()
    const outside = { ...VIEW, model: null, model_error: { message: 'not a whole number of units', diagnostics: [] } }
    const other = document.createElement('div')
    document.body.appendChild(other)
    app = createApp({ render: () => h(Inspector, { view: outside, selection: [], operate: vi.fn() }) })
    app.mount(other)
    expect(other.textContent).toContain('not a whole number')
  })
})
