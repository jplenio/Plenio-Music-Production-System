/**
 * A locked track stays as it is, whichever way an edit comes, and is only shown; what belongs to the whole song still
 * reaches it. The notes against the lyrics: what the markers and the fit's range say. Scores from the backend.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { type App, createApp, h, nextTick, reactive } from 'vue'

import type { ScoreOperation } from '../src/api/client'
import type { LyricLayoutView, LyricLine, ScoreModelView, ScoreView } from '../src/shared/scoreView'
import PianoRoll from '../src/sheet-editor/score/PianoRoll.vue'
import { fitRange, lineOff, linesOff, offHint, offLabel } from '../src/sheet-editor/score/noteFit'
import { geometry, noteRect, notesOf, selectionFor } from '../src/sheet-editor/score/pianoRoll'
import { defaultPrefs, loadPrefs } from '../src/sheet-editor/score/prefs'
import { NO_LOCKS, type TrackLocks, guardOperation, lockedIds, parseLocks, unlockedIds } from '../src/sheet-editor/score/trackLock'
import tricky from './fixtures/tricky-score.json'

const VIEW = tricky.view as unknown as ScoreView
const MODEL = VIEW.model as ScoreModelView
const GEO = geometry(MODEL, { pxPerQuarter: 48, snap: 'auto' })
const VOCAL = MODEL.tracks.vocal[0]
const INS = MODEL.tracks.ins[0]
const VOCAL_LOCKED: TrackLocks = { vocal: true, ins: false }
const INS_LOCKED: TrackLocks = { vocal: false, ins: true }

const guard = (operation: ScoreOperation, locks: TrackLocks = VOCAL_LOCKED) => guardOperation(operation, VIEW, locks)

describe('the guard of every edit', () => {
  it('lets everything through without a lock', () => {
    const operation = { op: 'delete', ids: [VOCAL.id] }
    expect(guard(operation, NO_LOCKS)).toEqual({ operation, note: null })
  })

  it('stops edits of notes on a locked track', () => {
    for (const operation of [
      { op: 'delete', ids: [VOCAL.id] },
      { op: 'delete_close_gap', ids: [VOCAL.id] },
      { op: 'set_note_pitch', ids: [VOCAL.id], semitones: 1 },
      { op: 'move_notes', ids: [VOCAL.id], delta: 2 },
      { op: 'resize_note', id: VOCAL.id, duration: 1 },
      { op: 'split_note', id: VOCAL.id, at: VOCAL.onset + 1 },
      { op: 'join_notes', ids: [VOCAL.id] },
      { op: 'quantize', ids: [VOCAL.id], grid: 2 },
      { op: 'note_to_rest', ids: [...VOCAL.segments] },
      { op: 'shift_pitch', ids: [...VOCAL.segments], semitones: 1 }
    ]) {
      const done = guard(operation)
      expect(done.operation, operation.op).toBeNull()
      expect(done.note, operation.op).toContain('Vocal track is locked')
    }
  })

  it('keeps the other notes of a mixed selection, and says so', () => {
    const done = guard({ op: 'delete', ids: [VOCAL.id, INS.id] })
    expect(done.operation).toEqual({ op: 'delete', ids: [INS.id] })
    expect(done.note).toContain('stayed as they are')
    expect(guard({ op: 'delete', ids: [INS.id] }).note).toBeNull()
    expect(guard({ op: 'delete', ids: ['chord:0'] }).operation).toEqual({ op: 'delete', ids: ['chord:0'] })
  })

  it('stops notes put into a locked track, and whole-track edits', () => {
    expect(guard({ op: 'insert_note', track: 'vocal', onset: 0, duration: 1, pitch: 60 }).operation).toBeNull()
    expect(guard({ op: 'insert_note', track: 'ins', onset: 0, duration: 1, pitch: 60 }).operation).not.toBeNull()
    expect(guard({ op: 'place_notes', track: 'vocal', notes: [] }).operation).toBeNull()
    expect(guard({ op: 'fill_rest', track: 'vocal', onset: 0 }).operation).toBeNull()
    expect(guard({ op: 'shift_track', track: 'vocal', semitones: 12 }).operation).toBeNull()
    expect(guard({ op: 'shift_track', track: 'ins', semitones: 12 }).operation).not.toBeNull()
    expect(guard({ op: 'silence_voice', voice: 'Vocal' }).operation).toBeNull()
    expect(guard({ op: 'silence_voice', voice: 'Ins' }).operation).not.toBeNull()
    expect(guard({ op: 'move_vocal_to_ins' }).operation).toBeNull()
    expect(guard({ op: 'move_vocal_to_ins' }, INS_LOCKED).operation).toBeNull()
    // to the locked track: an edit of it, also from the other voice
    expect(guard({ op: 'move_notes', ids: [INS.id], track: 'vocal' }).operation).toBeNull()
    expect(guard({ op: 'move_notes', ids: [VOCAL.id], track: 'ins' }, INS_LOCKED).operation).toBeNull()
  })

  it('lets what belongs to the whole song reach a locked track: the voices stay together', () => {
    for (const operation of [
      { op: 'insert_measures', bar: 2, count: 1 },
      { op: 'delete_measures', bar: 2, count: 1 },
      { op: 'duplicate_measures', bar: 2, count: 1 },
      { op: 'arrange_sections', order: [1] },
      { op: 'arrange_measures', order: [0] },
      { op: 'change_meter', bar: 1, count: 1, meter: '3/4' },
      { op: 'transpose_by', semitones: 1 },
      { op: 'transpose', semitones: 1 },
      { op: 'change_tempo', bpm: 90 },
      { op: 'set_tempo', bpm: 90 },
      { op: 'put_key', onset: 0, key: 'G' },
      { op: 'put_chord', onset: 0, name: 'C' },
      { op: 'start_section', bar: 2, label: 'chorus' }
    ]) {
      for (const locks of [VOCAL_LOCKED, INS_LOCKED, { vocal: true, ins: true }]) {
        expect(guard(operation, locks), operation.op).toEqual({ operation, note: null })
      }
    }
  })

  it('pastes bars into both voices, notes only into the open one', () => {
    const notes = [
      { track: 'vocal', onset: 0, duration: 1, pitch: 60 },
      { track: 'ins', onset: 0, duration: 1, pitch: 64 }
    ]
    const inserted = { op: 'paste', mode: 'insert', notes, tracks: ['vocal', 'ins'], chords: [], at: 0 }
    expect(guard(inserted).operation).toEqual(inserted)
    const done = guard({ op: 'paste', mode: 'overwrite', notes, tracks: ['vocal', 'ins'], chords: [], at: 0 })
    expect(done.operation?.notes).toEqual([notes[1]])
    expect(done.operation?.tracks).toEqual(['ins'])
    expect(done.note).toContain('Only the other notes')
    expect(guard({ op: 'paste', mode: 'merge', notes: [notes[0]], tracks: ['vocal'], chords: [], at: 0 }).operation).toBeNull()
  })

  it('fits the notes only with the Vocal open, and sends nothing to a locked Instrument', () => {
    expect(guard({ op: 'fit_notes', lyrics: 'x', surplus: 'auto' }).operation).toBeNull()
    for (const surplus of ['auto', 'ins']) {
      const done = guardOperation({ op: 'fit_notes', lyrics: 'x', surplus }, VIEW, INS_LOCKED)
      expect(done.operation?.surplus).toBe('omit')
      expect(done.note).toContain('left out')
    }
    expect(guardOperation({ op: 'fit_notes', lyrics: 'x', surplus: 'omit' }, VIEW, INS_LOCKED).note).toBeNull()
    expect(guardOperation({ op: 'fit_notes', lyrics: 'x', surplus: 'ins' }, VIEW, NO_LOCKS).operation?.surplus).toBe('ins')
  })
})

describe('what can be selected', () => {
  it('leaves out a locked track, its segments and rests', () => {
    const ids = lockedIds(VIEW, VOCAL_LOCKED)
    for (const note of MODEL.tracks.vocal) {
      expect(ids.has(note.id)).toBe(true)
      for (const segment of note.segments) expect(ids.has(segment)).toBe(true)
    }
    for (const note of MODEL.tracks.ins) expect(ids.has(note.id)).toBe(false)
    const both = selectionFor([VOCAL, INS])
    expect(unlockedIds(VIEW, both, VOCAL_LOCKED)).toEqual(selectionFor([INS]))
    expect(unlockedIds(VIEW, both, NO_LOCKS)).toEqual(both)
    expect(lockedIds(VIEW, NO_LOCKS).size).toBe(0)
  })

  it('is kept with the editor: an unknown setting locks nothing', () => {
    expect(parseLocks({ vocal: true })).toEqual({ vocal: true, ins: false })
    expect(parseLocks('both')).toEqual({ vocal: false, ins: false })
    expect(defaultPrefs().locks).toEqual({ vocal: false, ins: false })
    expect(loadPrefs({ getItem: () => JSON.stringify({ locks: { ins: true } }) }).locks).toEqual({ vocal: false, ins: true })
    expect(loadPrefs({ getItem: () => JSON.stringify({ fitSurplus: 'nonsense' }) }).fitSurplus).toBe('auto')
  })
})

describe('the roll with a locked track', () => {
  let app: App | null = null
  afterEach(() => {
    app?.unmount()
    app = null
    document.body.innerHTML = ''
  })

  function mountRoll(locks: TrackLocks) {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const state = reactive({ selection: [] as string[], locks, track: 'vocal' as 'vocal' | 'ins' })
    const operate = vi.fn((_op: ScoreOperation) => Promise.resolve(true))
    app = createApp({
      render: () =>
        h(PianoRoll, {
          view: VIEW,
          selection: state.selection,
          operate,
          locks: state.locks,
          'onUpdate:locks': (next: TrackLocks) => (state.locks = next),
          track: state.track,
          'onUpdate:track': (next: 'vocal' | 'ins') => (state.track = next),
          onSelect: (ids: string[]) => (state.selection = ids)
        })
    })
    app.mount(host)
    return { host, state, operate, svg: host.querySelector('svg.roll-svg') as SVGSVGElement, root: host.querySelector('.roll') as HTMLElement }
  }

  const fire = (target: Element, type: string, x: number, y: number) =>
    target.dispatchEvent(new PointerEvent(type, { clientX: x, clientY: y, button: 0, bubbles: true, pointerId: 1 }))

  it('shows a locked note pale and does not pick it up', async () => {
    const { host, state, svg } = mountRoll(VOCAL_LOCKED)
    await nextTick()
    const pale = host.querySelectorAll('rect.note.locked')
    expect(pale.length).toBeGreaterThan(0)
    expect(host.querySelectorAll('rect.note.vocal.locked').length).toBe(pale.length)
    expect(host.querySelectorAll('rect.note.ins.locked').length).toBe(0)
    const note = notesOf(MODEL).find((n) => n.track === 'vocal' && !MODEL.tracks.ins.some((m) => m.onset < n.onset + n.duration && m.onset + m.duration > n.onset))!
    const box = noteRect(note, GEO)
    fire(svg, 'pointerdown', box.x + 1, box.y + 1)
    fire(svg, 'pointerup', box.x + 1, box.y + 1)
    await nextTick()
    expect(state.selection).not.toContain(note.id)
    for (const id of note.segments) expect(state.selection).not.toContain(id)
  })

  it('draws nothing into a locked track', async () => {
    const { svg, operate, state } = mountRoll({ vocal: true, ins: true })
    await nextTick()
    state.track = 'vocal'
    await nextTick()
    const x = GEO.width - 20
    const y = 300
    fire(svg, 'pointerdown', x, y)
    fire(svg, 'pointerup', x, y)
    await nextTick()
    expect(operate).not.toHaveBeenCalled()
  })

  it('selects all without the locked track', async () => {
    const { root, state } = mountRoll(INS_LOCKED)
    await nextTick()
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', ctrlKey: true, bubbles: true }))
    await nextTick()
    const picked = new Set(state.selection)
    expect(MODEL.tracks.vocal.some((n) => n.segments.some((s) => picked.has(s)) || picked.has(n.id))).toBe(true)
    expect(MODEL.tracks.ins.some((n) => n.segments.some((s) => picked.has(s)) || picked.has(n.id))).toBe(false)
  })

  it('locks and unlocks from the toolbar; a locked track takes no new notes', async () => {
    const { host, state } = mountRoll(NO_LOCKS)
    await nextTick()
    const lock = host.querySelector('[data-testid="lock-vocal"]') as HTMLButtonElement
    lock.click()
    await nextTick()
    expect(state.locks).toEqual(VOCAL_LOCKED)
    expect(lock.getAttribute('aria-pressed')).toBe('true')
    const draw = [...host.querySelectorAll('button.vocal')].find((b) => b.textContent?.trim() === 'Vocal') as HTMLButtonElement
    expect(draw.disabled).toBe(true)
    lock.click()
    await nextTick()
    expect(state.locks).toEqual(NO_LOCKS)
  })
})

describe('the notes against the lyrics', () => {
  const line = (wanted: number, onsets: number[], holds: number[] = []): LyricLine => ({
    block: 0,
    line: 0,
    text: 'la la',
    start: onsets[0] ?? 0,
    end: 8,
    syllables: onsets.map((onset) => ({ onset, text: 'la', end_of_word: true })),
    holds,
    pinned: false,
    wanted
  })
  const layoutOf = (...lines: LyricLine[]): LyricLayoutView =>
    ({ parts: [{ block: 0, tag: 'verse', start: 0, end: 8, phrases: [], lines }], unplaced: [], unsung: [] }) as unknown as LyricLayoutView

  it('says how many notes a line lacks or has to spare', () => {
    expect(lineOff(line(3, [0, 2, 4]))).toBe(0)
    expect(lineOff(line(5, [0, 2, 4]))).toBe(2)
    expect(lineOff(line(2, [0, 2], [4, 6]))).toBe(-2)
    expect(lineOff(line(4, [0, 0, 2]))).toBe(2) // syllables sharing a note
    expect(lineOff(line(3, []))).toBe(3) // no note sings it
    expect(lineOff({ ...line(3, [0]), wanted: undefined })).toBe(0)
    expect(lineOff(line(0, []))).toBe(0)
  })

  it('labels it for the lane and counts the lines', () => {
    expect(offLabel(2)).toBe('+2')
    expect(offLabel(-3)).toBe('−3')
    expect(offHint(line(5, [0, 2, 4]))).toBe('5 syllables on 3 notes')
    expect(offHint(line(1, [0], [2]))).toBe('1 syllable on 2 notes')
    expect(offHint(line(3, [0, 2, 4]))).toBe('')
    expect(linesOff(layoutOf(line(3, [0, 2, 4]), line(5, [6])))).toHaveLength(1)
    expect(linesOff(null)).toEqual([])
  })

  it('works on what is selected: notes or lyrics lines', () => {
    expect(fitRange(VIEW, [], [])).toBeNull()
    const [note] = MODEL.tracks.vocal
    expect(fitRange(VIEW, selectionFor([note]), [])).toEqual([note.onset, note.onset + note.duration])
    const [a, b] = [MODEL.tracks.vocal[0], MODEL.tracks.vocal[3]]
    expect(fitRange(VIEW, selectionFor([a, b]), [])).toEqual([a.onset, b.onset + b.duration])
    const lyrics = layoutOf({ ...line(2, [8, 10]), block: 1, line: 2, start: 8, end: 16 })
    expect(fitRange({ ...VIEW, lyrics }, [], ['1:2'])).toEqual([8, 16])
    expect(fitRange({ ...VIEW, lyrics }, [], ['9:9'])).toBeNull()
  })
})
