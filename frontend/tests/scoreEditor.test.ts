import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, reactive } from 'vue'

import type { Fetcher } from '../src/api/client'
import { History } from '../src/shared/history'
import { clampSpeed, countInClicks, frequency, playLength, playClock, schedule, scoreTime, sounding, sourceSecond } from '../src/shared/playback'
import {
  type ScoreView,
  clock,
  describe as describeElement,
  elementAtDisplay,
  elementAtSource,
  elementById,
  firstElementOfBar,
  knownIds,
  modelNoteOfSegment,
  neighbour,
  nextDuration,
  otherVoice,
  sectionOfBar
} from '../src/shared/scoreView'
import type { WorkingDoc } from '../src/shared/sheetSession'
import { defaultPrefs, loadPrefs, savePrefs } from '../src/sheet-editor/score/prefs'
import { commitBlockOf, useScoreSession } from '../src/sheet-editor/score/useScoreSession'
// The editor view of the TRICKY score of tests/unit/test_score_editor.py, as the backend
// returns it (test_frontend_fixture_is_current keeps it up to date).
import fixture from './fixtures/tricky-score.json'

const ABC: string = fixture.abc
const VIEW = fixture.view as unknown as ScoreView
const ALL = { Vocal: true, Ins: true, chords: true }

describe('history', () => {
  it('records, undoes and redoes labelled snapshots', () => {
    const history = new History('a')
    expect(history.canUndo).toBe(false)
    history.record('b', 'first')
    history.record('c', 'second')
    expect(history.undoLabel).toBe('second')
    expect(history.undo()?.text).toBe('b')
    expect(history.redoLabel).toBe('second')
    expect(history.undo()?.text).toBe('a')
    expect(history.undo()).toBeNull()
    expect(history.redo()?.text).toBe('b')
    history.record('d', 'third') // a new step drops the redo branch
    expect(history.canRedo).toBe(false)
    expect(history.undo()?.text).toBe('b')
  })

  it('ignores a snapshot equal to the current text', () => {
    const history = new History('a')
    history.record('a', 'nothing')
    expect(history.canUndo).toBe(false)
  })

  it('groups typing until sealed or undone', () => {
    const history = new History('')
    history.record('h', 'typing', { group: 'typing' })
    history.record('he', 'typing', { group: 'typing' })
    history.record('hey', 'typing', { group: 'typing' })
    expect(history.undo()?.text).toBe('')
    history.redo()
    history.seal()
    history.record('hey!', 'typing', { group: 'typing' })
    expect(history.undo()?.text).toBe('hey')
    history.record('hey?', 'typing', { group: 'typing' }) // after an undo: a new step
    history.record('hey??', 'typing', { group: 'typing' })
    expect(history.undo()?.text).toBe('hey')
  })

  it('hands the side state of a step back with its text (the Guide notes of a MIDI import)', () => {
    const history = new History('old')
    history.record('typed', 'typing')
    history.annotate({ guide: 'G0' }) // the state that belonged to this text before the import
    history.record('imported', 'import MIDI', { extra: { guide: 'G1' } })
    history.record('typed again', 'typing')
    expect(history.undo()).toEqual({ text: 'imported', label: 'import MIDI', extra: { guide: 'G1' } })
    expect(history.undo()).toEqual({ text: 'typed', label: 'typing', extra: { guide: 'G0' } })
    expect(history.undo()?.extra).toBeUndefined() // a step without its own side state leaves it alone
    expect(history.redo()?.extra).toEqual({ guide: 'G0' })
    history.annotate({ guide: 'other' }) // a step keeps the state it already has
    expect(history.current.extra).toEqual({ guide: 'G0' })
  })

  it('keeps at most its limit of snapshots', () => {
    const history = new History('0', 3)
    for (const text of ['1', '2', '3', '4']) history.record(text, text)
    expect(history.undo()?.text).toBe('3')
    expect(history.undo()?.text).toBe('2')
    expect(history.canUndo).toBe(false)
  })
})

describe('score view helpers', () => {
  it('steps through the native lengths', () => {
    expect(nextDuration(8, 1)).toBe(12)
    expect(nextDuration(8, -1)).toBe(6)
    expect(nextDuration(1, -1)).toBeNull()
    expect(nextDuration(48, 1)).toBeNull()
    expect(nextDuration(5, 1)).toBeNull()
  })

  it('finds the element of a click in the notation (display ranges)', () => {
    const element = elementById(VIEW, 'V2.2')!
    expect(elementAtDisplay(VIEW, element.display[0], element.display[1])?.id).toBe('V2.2')
    // abcjs ranges may include a leading accidental or annotation: the end decides
    expect(elementAtDisplay(VIEW, element.display[0] - 1, element.display[1])?.id).toBe('V2.2')
    // otherwise the largest overlap
    expect(elementAtDisplay(VIEW, element.display[0] + 1, element.display[1] - 1)?.id).toBe('V2.2')
    expect(elementAtDisplay(VIEW, 0, 5)).toBeNull()
  })

  it('finds the element at a cursor in the ABC text (source ranges)', () => {
    const element = elementById(VIEW, 'V3.0')!
    expect(ABC.slice(...element.source)).toBe('A16-')
    expect(elementAtSource(VIEW, element.source[0])?.id).toBe('V3.0')
    expect(elementAtSource(VIEW, element.source[1] - 1)?.id).toBe('V3.0')
    // a cursor right after the last token of a bar still belongs to it
    const last = elementById(VIEW, 'V3.1')!
    expect(elementAtSource(VIEW, last.source[1])?.id).toBe('V3.1')
    expect(elementAtSource(VIEW, 0)).toBeNull()
  })

  it('looks up elements by id and neighbours within a voice', () => {
    expect(elementById(null, 'V2.0')).toBeNull()
    expect(elementById(VIEW, null)).toBeNull()
    expect(elementById(VIEW, 'V99.0')).toBeNull()
    expect(neighbour(VIEW, 'V2.3', 1)?.id).toBe('V3.0')
    expect(neighbour(VIEW, 'V2.0', -1)?.id).toBe('V1.0')
    expect(neighbour(VIEW, 'V1.0', -1)).toBeNull()
    expect(neighbour(VIEW, 'I1.2', 1)?.id).toBe('I2.0')
    expect(neighbour(VIEW, 'nope', 1)).toBeNull()
  })

  it('finds the other voice at the same time', () => {
    expect(otherVoice(VIEW, 'V4.1')?.id).toBe('I4.1')
    expect(otherVoice(VIEW, 'V2.3')?.id).toBe('I2.0') // inside a full-bar rest
    expect(otherVoice(VIEW, 'I1.2')?.id).toBe('V1.0')
    expect(otherVoice(VIEW, 'nope')).toBeNull()
  })

  it('knows bars and sections', () => {
    expect(firstElementOfBar(VIEW, 4)?.id).toBe('V4.0')
    expect(firstElementOfBar(VIEW, 4, 'Ins')?.id).toBe('I4.0')
    expect(firstElementOfBar(VIEW, 99)).toBeNull()
    expect(sectionOfBar(VIEW, 1)).toBe(0)
    expect(sectionOfBar(VIEW, 5)).toBe(1)
    expect(sectionOfBar(VIEW, 7)).toBe(2)
    expect(sectionOfBar(VIEW, 99)).toBe(0)
  })

  it('describes elements for the status line', () => {
    const unit = VIEW.header.unit
    expect(unit).toBe('1/32')
    expect(describeElement(elementById(VIEW, 'V2.0'), unit)).toBe('Vocal bar 2: F#4, quarter, chord G')
    expect(describeElement(elementById(VIEW, 'V3.0'), unit)).toBe('Vocal bar 3: A4 (tied), half, chord A7')
    expect(describeElement(elementById(VIEW, 'V1.0'), unit)).toBe('Vocal bar 1: rest, whole, chord D')
    expect(describeElement(elementById(VIEW, 'I2.0'), unit)).toBe('Ins bar 2: rest, whole bar')
    expect(describeElement(null)).toBe('nothing selected')
    expect(describeElement({ ...elementById(VIEW, 'V2.0')!, units: 5 }, unit)).toContain('5 units')
    expect(describeElement({ ...elementById(VIEW, 'V2.0')!, units: 4 }, '1/16')).toContain('quarter')
  })

  it('formats clock times', () => {
    expect(clock(0)).toBe('0:00')
    expect(clock(61.9)).toBe('1:01')
    expect(clock(600)).toBe('10:00')
    expect(clock(-1.2)).toBe('0:00') // a padded pickup bar of a transcription (read "-1:58")
  })
})

describe('playback', () => {
  it('clamps the speed', () => {
    expect(clampSpeed(1)).toBe(1)
    expect(clampSpeed(0.1)).toBe(0.25)
    expect(clampSpeed(5)).toBe(2)
    expect(clampSpeed(Number.NaN)).toBe(1)
  })

  it('schedules the sounding notes and chords from a start time', () => {
    const events = schedule(VIEW, { from: 0, voices: ALL, speed: 1 })
    const vocal = events.filter((e) => e.part === 'Vocal')
    expect(vocal).toHaveLength(VIEW.notes!.Vocal.length) // tied notes sound once
    const tied = vocal.find((e) => e.midi === 69)!
    expect(tied.duration).toBeCloseTo(2.6667, 3)
    expect(events.filter((e) => e.part === 'chord')).toHaveLength(
      VIEW.chords!.reduce((sum, chord) => sum + chord.pitches.length, 0)
    )
    for (let i = 1; i < events.length; i++) expect(events[i].at).toBeGreaterThanOrEqual(events[i - 1].at)
  })

  it('plays a range at a speed, with a chord already sounding at the start', () => {
    const from = VIEW.bars[1].start_s + 1 // inside bar 2 (chord G sounds from the bar start)
    const to = VIEW.bars[2].start_s
    const events = schedule(VIEW, { from, to, voices: ALL, speed: 0.5 })
    const chord = events.filter((e) => e.part === 'chord')
    expect(chord.map((e) => e.midi)).toEqual([55, 59, 62])
    expect(chord[0].at).toBe(0)
    expect(chord[0].duration).toBeCloseTo((to - from) / 0.5, 3)
    const vocal = events.filter((e) => e.part === 'Vocal')
    expect(vocal.map((e) => e.midi)).toEqual([65, 77]) // the notes starting at or after ``from``
    expect(vocal[0].at).toBeCloseTo((VIEW.notes!.Vocal[2].start_s - from) / 0.5, 3)
    expect(events.every((e) => e.at >= 0 && (e.at + e.duration) * 0.5 <= to - from + 1e-3)).toBe(true)
  })

  it('starts with the first note of a bar although bar and note times are rounded differently', () => {
    // bars come with 3 decimals (2.667), notes with 4 (2.6667)
    const bar = VIEW.bars[1]
    const first = elementById(VIEW, 'V2.0')!
    expect(first.start_s).toBeGreaterThan(bar.start_s - 1e-3)
    expect(first.start_s).not.toBe(bar.start_s)
    const events = schedule(VIEW, { from: bar.start_s, to: VIEW.bars[2].start_s, voices: ALL, speed: 1 })
    const vocal = events.filter((e) => e.part === 'Vocal')
    expect(vocal.map((e) => e.midi)).toEqual([66, 78, 65, 77])
    expect(vocal[0].at).toBe(0)
    // a loop that ends at a section end leaves out the note starting there
    const verse = VIEW.sections[1]
    const looped = schedule(VIEW, { from: verse.start_s, to: verse.end_s, voices: ALL, speed: 1 })
    expect(looped.every((e) => e.at < verse.end_s - verse.start_s - 1e-3)).toBe(true)
    expect(looped.filter((e) => e.part === 'Vocal').at(-1)?.midi).toBe(74) // bar 5's d, not bar 6's c#
  })

  it('leaves out switched-off voices', () => {
    const events = schedule(VIEW, { from: 0, voices: { Vocal: false, Ins: true, chords: false }, speed: 1 })
    expect(new Set(events.map((e) => e.part))).toEqual(new Set(['Ins']))
    expect(schedule(VIEW, { from: 0, voices: { Vocal: false, Ins: false, chords: false }, speed: 1 })).toEqual([])
  })

  it('plays to the end of the score or the range, also through bars of rests', () => {
    expect(playLength(VIEW, { from: 0, voices: ALL, speed: 1 })).toBeCloseTo(VIEW.duration_s)
    expect(playLength(VIEW, { from: 1, to: 3, voices: ALL, speed: 0.5 })).toBeCloseTo(4)
    // nothing sounds (every voice off), it still lasts to the end
    expect(playLength(VIEW, { from: 2, voices: { Vocal: false, Ins: false, chords: false }, speed: 2 })).toBeCloseTo((VIEW.duration_s - 2) / 2)
    // on the playing clock of a cover: as long as the source's bars
    const sourceBars = VIEW.bars.map((bar) => [bar.start_s * 2, (bar.start_s + bar.duration_s) * 2, 'x'] as [number, number, string])
    expect(playLength(VIEW, { from: 0, voices: ALL, speed: 1, clock: playClock(VIEW, sourceBars) })).toBeCloseTo(VIEW.duration_s * 2)
  })

  it('counts in on the beats of the score, also from a cursor between two beats', () => {
    const bar = { start_s: 0, duration_s: 2 }
    const on = countInClicks(bar, 4, 0, 1, 2, 0.5)
    expect(on.map((c) => [c.at, c.midi])).toEqual([[0, 96], [0.5, 89], [1, 89], [1.5, 89]])
    // a sixteenth after the second beat: the clicks keep the beat grid and run on into the music
    const between = countInClicks(bar, 4, 0.625, 1, 2, 0.5)
    expect(between.map((c) => [c.at, c.midi])).toEqual([[0.375, 89], [0.875, 89], [1.375, 96], [1.875, 89]])
    // at half speed the beats are twice as long
    expect(countInClicks(bar, 4, 0.625, 1, 4, 1).map((c) => c.at)).toEqual([0.75, 1.75, 2.75, 3.75])
    expect(countInClicks(bar, 4, 0, 0, 0, 0.5)).toEqual([])
  })

  it('maps playback time to score time and the cursor', () => {
    expect(scoreTime({ from: 10, voices: ALL, speed: 0.5 }, 4)).toBe(12)
    const at = elementById(VIEW, 'V3.1')!.start_s + 0.1
    expect(sounding(VIEW, at, ALL)).toEqual(['V3.1', 'I3.0'].filter((id) => elementById(VIEW, id)!.kind === 'note'))
    expect(sounding(VIEW, at, { Vocal: false, Ins: true, chords: true })).toEqual([])
    expect(sounding(VIEW, elementById(VIEW, 'I4.2')!.start_s, ALL)).toEqual(['V4.2', 'I4.2'])
  })

  it('converts pitches and bars', () => {
    expect(frequency(69)).toBe(440)
    expect(frequency(81)).toBe(880)
    expect(sourceSecond(2, [[0, 1.5, 'x'], [1.5, 1.4, 'y']], VIEW)).toBe(1.5)
    expect(sourceSecond(3, [[0, 1.5, 'x']], VIEW)).toBe(VIEW.bars[2].start_s)
    expect(sourceSecond(3, undefined, VIEW)).toBe(VIEW.bars[2].start_s)
    expect(sourceSecond(99, undefined, VIEW)).toBe(0)
  })
})

describe('editor preferences', () => {
  it('gives the defaults for an empty, blocked or broken storage', () => {
    expect(loadPrefs(null)).toEqual(defaultPrefs())
    expect(loadPrefs({ getItem: () => null })).toEqual(defaultPrefs())
    expect(loadPrefs({ getItem: () => '{not json' })).toEqual(defaultPrefs())
    const blocked = {
      getItem: () => {
        throw new DOMException('blocked', 'SecurityError')
      }
    }
    expect(loadPrefs(blocked)).toEqual(defaultPrefs())
  })

  it('keeps valid values and replaces invalid ones', () => {
    const stored = JSON.stringify({ layout: 'text', zoom: 1.4, voices: { Vocal: false }, speed: 0.5 })
    expect(loadPrefs({ getItem: () => stored })).toEqual({
      layout: 'text',
      advanced: false,
      zoom: 1.4,
      voices: { Vocal: false, Ins: true, chords: true, guide: true },
      speed: 0.5,
      roll: true,
      rollZoom: 48,
      rollHeight: 280,
      notationShare: 0.6,
      sideWidth: 230,
      metronome: false,
      hear: 'both',
      sourceLevel: 0.7,
      audition: true,
      rowHeight: 12,
      follow: true,
      sung: true,
      wave: true,
      sounds: { Vocal: 'soft', Ins: 'plain', chord: 'plain', guide: 'plain' },
      paper: 'a4',
      record: { countIn: 1, quantize: 16, mode: 'replace', mute: true, thru: true, stepLength: 8 },
      midiInput: 'all'
    })
    // the sounds: valid instruments stay, unknown ones fall back to the classic sound
    const sounds = JSON.stringify({ sounds: { Vocal: 'voice', Ins: 'theremin', chord: 'pad' }, paper: 'letter', wave: false })
    expect(loadPrefs({ getItem: () => sounds })).toMatchObject({
      sounds: { Vocal: 'voice', Ins: 'plain', chord: 'pad', guide: 'plain' },
      paper: 'letter',
      wave: false
    })
    const roll = JSON.stringify({ roll: false, rollZoom: 96, metronome: true, advanced: true })
    expect(loadPrefs({ getItem: () => roll })).toMatchObject({ roll: false, rollZoom: 96, metronome: true, advanced: true })
    const wrong = JSON.stringify({ layout: 'huge', zoom: 9, voices: 'all', speed: '1', rollZoom: 5000, metronome: 'yes' })
    expect(loadPrefs({ getItem: () => wrong })).toEqual(defaultPrefs())
    // the pane sizes keep valid values and replace what is out of range (owner's request, 2026-09-28)
    const panes = JSON.stringify({ rollHeight: 400, notationShare: 0.4, sideWidth: 300 })
    expect(loadPrefs({ getItem: () => panes })).toMatchObject({
      rollHeight: 400,
      notationShare: 0.4,
      sideWidth: 300
    })
    const panesWrong = JSON.stringify({ rollHeight: 5000, notationShare: 0.1, sideWidth: 20 })
    expect(loadPrefs({ getItem: () => panesWrong })).toMatchObject({
      rollHeight: 280,
      notationShare: 0.6,
      sideWidth: 230
    })
  })

  it('reads the layouts of 0.2.x', () => {
    const load = (layout: string) => loadPrefs({ getItem: () => JSON.stringify({ layout }) })
    expect(load('both')).toMatchObject({ layout: 'review', advanced: true }) // notation and ABC
    expect(load('notation')).toMatchObject({ layout: 'review', advanced: false })
    expect(load('text')).toMatchObject({ layout: 'text' })
    expect(defaultPrefs()).toMatchObject({ layout: 'review', advanced: false, roll: true })
  })

  it('saves, and ignores a full or blocked storage', () => {
    const saved: Record<string, string> = {}
    const prefs = { ...defaultPrefs(), zoom: 0.8 }
    savePrefs(prefs, { setItem: (key, value) => void (saved[key] = value) })
    expect(loadPrefs({ getItem: (key) => saved[key] ?? null })).toEqual(prefs)
    expect(() =>
      savePrefs(prefs, {
        setItem: () => {
          throw new DOMException('full', 'QuotaExceededError')
        }
      })
    ).not.toThrow()
    expect(() => savePrefs(prefs, null)).not.toThrow()
  })
})

// --- the editing session with a fake backend ---------------------------------------------

interface Call {
  route: string
  body: { abc: string; operation?: Record<string, unknown> }
  answer(data: unknown, status?: number): Promise<void>
}

function fakeBackend() {
  const calls: Call[] = []
  const fetcher: Fetcher = {
    fetchApi(route, options) {
      return new Promise<Response>((resolve) => {
        calls.push({
          route,
          body: JSON.parse(String(options?.body)),
          async answer(data, status = 200) {
            resolve({ ok: status < 400, status, json: async () => data } as Response)
            await settle()
          }
        })
      })
    }
  }
  return { fetcher, calls }
}

async function settle(): Promise<void> {
  await vi.advanceTimersByTimeAsync(0)
  await nextTick()
}

/** A view for another text (the session only cares that it is an answer for that text). */
function viewFor(sha: string, ok = true): ScoreView {
  return ok ? { ...VIEW, sha256: sha } : ({ ...VIEW, ok: false, sha256: sha, elements: undefined } as ScoreView)
}

function transformAnswer(abc: string, extra: Record<string, unknown> = {}) {
  return { abc, changes: ['bar 2 Vocal: F#4 -> G4'], warnings: [], select: ['V2.0'], analysis: viewFor('edited'), ...extra }
}

describe('score session', () => {
  let doc: WorkingDoc
  let backend: ReturnType<typeof fakeBackend>

  beforeEach(() => {
    vi.useFakeTimers()
    doc = reactive<WorkingDoc>({ kind: 'score', text: ABC, intent: 'keep' })
    backend = fakeBackend()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  async function start(onEdit?: () => void) {
    const session = useScoreSession(doc, { fetcher: backend.fetcher, onEdit, debounceMs: 300 })
    await settle()
    return session
  }

  it('analyzes the text on start', async () => {
    const session = await start()
    expect(backend.calls.map((c) => c.route)).toEqual(['/plenio/score/analyze'])
    expect(backend.calls[0].body.abc).toBe(ABC)
    expect(session.pending).toBe(true)
    expect(session.current).toBeNull()
    await backend.calls[0].answer(VIEW)
    expect(session.pending).toBe(false)
    expect(session.current?.sha256).toBe(VIEW.sha256)
    expect(session.lastValid?.sha256).toBe(VIEW.sha256)
  })

  it('debounces typing and drops the answer for an older text', async () => {
    const edits = vi.fn()
    const session = await start(edits)
    const first = backend.calls[0]
    session.typed(ABC + ' ')
    session.typed(ABC + '  ')
    expect(edits).toHaveBeenCalledTimes(2)
    expect(backend.calls).toHaveLength(1) // debounced
    await first.answer(VIEW) // the answer for the text before the typing
    expect(session.view).toBeNull()
    expect(session.pending).toBe(true)
    await vi.advanceTimersByTimeAsync(300)
    expect(backend.calls).toHaveLength(2)
    expect(backend.calls[1].body.abc).toBe(ABC + '  ')
    await backend.calls[1].answer(viewFor('typed'))
    expect(session.current?.sha256).toBe('typed')
    expect(session.pending).toBe(false)
  })

  it('keeps the last valid view and the selection while the text is invalid', async () => {
    const session = await start()
    await backend.calls[0].answer(VIEW)
    session.select(['V2.0', 'V3.1'])
    expect(session.primary?.id).toBe('V2.0')
    session.typed('X:1\nbroken')
    await vi.advanceTimersByTimeAsync(300)
    await backend.calls[1].answer(viewFor('broken', false))
    expect(session.view?.ok).toBe(false)
    expect(session.lastValid?.sha256).toBe(VIEW.sha256)
    expect(session.selection).toEqual(['V2.0', 'V3.1'])
    // a valid view without those ids clears them from the selection
    session.typed(ABC)
    await vi.advanceTimersByTimeAsync(300)
    const fewer = { ...VIEW, sha256: 'fewer', elements: VIEW.elements!.filter((e) => e.id !== 'V3.1') }
    await backend.calls[2].answer(fewer)
    expect(session.selection).toEqual(['V2.0'])
  })

  it('applies an operation, selects its result and enters one undo step', async () => {
    const edits = vi.fn()
    const session = await start(edits)
    await backend.calls[0].answer(VIEW)
    const done = session.operate({ op: 'shift_pitch', ids: ['V2.0'], semitones: 1 })
    expect(session.busy).toBe(true)
    const call = backend.calls[1]
    expect(call.route).toBe('/plenio/score/transform')
    expect(call.body).toEqual({ abc: ABC, operation: { op: 'shift_pitch', ids: ['V2.0'], semitones: 1 } })
    await call.answer(transformAnswer('EDITED', { warnings: ['a tie was removed'] }))
    expect(await done).toBe(true)
    expect(doc.text).toBe('EDITED')
    expect(session.busy).toBe(false)
    expect(session.current?.sha256).toBe('edited') // no second analysis needed
    expect(session.selection).toEqual(['V2.0'])
    expect(session.notes).toEqual(['bar 2 Vocal: F#4 -> G4', 'warning: a tie was removed'])
    expect(session.undoLabel).toBe('bar 2 Vocal: F#4 -> G4')
    expect(edits).toHaveBeenCalledTimes(1)
    await settle()
    expect(backend.calls).toHaveLength(2) // the session's own write does not trigger an analysis

    session.undo()
    expect(doc.text).toBe(ABC)
    expect(session.canRedo).toBe(true)
    await settle()
    await backend.calls[2].answer(VIEW)
    expect(session.current?.sha256).toBe(VIEW.sha256)
    session.redo()
    expect(doc.text).toBe('EDITED')
    expect(session.canUndo).toBe(true)
  })

  it('moves a side state with its text through undo and redo (the Guide notes of an import)', async () => {
    const restored: unknown[] = []
    const session = useScoreSession(doc, {
      fetcher: backend.fetcher,
      debounceMs: 300,
      onRestore: (extra) => restored.push(extra)
    })
    await settle()
    await backend.calls[0].answer(VIEW)
    session.replaceText('IMPORTED', 'import MIDI (a.mid)', viewFor('imported'), {
      before: { guide: [[0, 4, 60]] },
      after: { guide: [] }
    })
    expect(restored).toEqual([]) // the caller applies the new state itself
    session.undo()
    expect(doc.text).toBe(ABC)
    expect(restored).toEqual([{ guide: [[0, 4, 60]] }])
    session.redo()
    expect(doc.text).toBe('IMPORTED')
    expect(restored).toEqual([{ guide: [[0, 4, 60]] }, { guide: [] }])
  })

  const NL = String.fromCharCode(10)
  it('checks an imported score again with the lyrics (the import route does not lay them out)', async () => {
    const session = useScoreSession(doc, { fetcher: backend.fetcher, debounceMs: 300, lyrics: () => '[Verse]' + NL + 'la la' })
    await settle()
    await backend.calls[0].answer(VIEW)
    session.replaceText('IMPORTED', 'import MIDI (a.mid)', viewFor('imported'))
    await settle()
    const check = backend.calls.at(-1)!
    expect(check.route).toBe('/plenio/score/analyze')
    expect(check.body).toMatchObject({ abc: 'IMPORTED', lyrics: '[Verse]' + NL + 'la la' })
    // without lyrics the route's own view is taken as it is
    const plain = useScoreSession({ ...doc }, { fetcher: backend.fetcher, debounceMs: 300 })
    await settle()
    await backend.calls.at(-1)!.answer(VIEW)
    const before = backend.calls.length
    plain.replaceText('IMPORTED', 'import MIDI (a.mid)', viewFor('imported'))
    await settle()
    expect(backend.calls.length).toBe(before)
  })

  it('refuses an operation whose text changed while it was computed', async () => {
    const session = await start()
    await backend.calls[0].answer(VIEW)
    const done = session.operate({ op: 'note_to_rest', ids: ['V2.0'] })
    session.typed(ABC + '%')
    await backend.calls[1].answer(transformAnswer('EDITED'))
    expect(await done).toBe(false)
    expect(doc.text).toBe(ABC + '%')
    expect(session.error).toBe('The score changed while the edit was computed; it was not applied.')
    expect(session.undoLabel).toBe('typing')
  })

  it('shows the backend refusal with its hint and keeps the text', async () => {
    const session = await start()
    await backend.calls[0].answer(VIEW)
    const done = session.operate({ op: 'set_duration', id: 'V2.0', units: 16 })
    await backend.calls[1].answer(
      { error: { message: 'Only 0 units of rest follow the note.', hint: 'Turn the following note into a rest first.' } },
      400
    )
    expect(await done).toBe(false)
    expect(doc.text).toBe(ABC)
    expect(session.error).toBe('Only 0 units of rest follow the note. — Turn the following note into a rest first.')
    expect(session.canUndo).toBe(false)
  })

  it('groups a burst of typing into one undo step', async () => {
    const session = await start()
    await backend.calls[0].answer(VIEW)
    session.typed(ABC + 'a')
    await settle()
    session.typed(ABC + 'ab')
    await settle()
    session.typed(ABC + 'abc')
    await settle()
    session.undo()
    expect(doc.text).toBe(ABC)
    expect(session.canUndo).toBe(false)
  })

  it('enters an external replacement of the document into the history', async () => {
    const edits = vi.fn()
    const session = await start(edits)
    await backend.calls[0].answer(VIEW)
    doc.text = 'NEW DRAFT' // e.g. "use the new draft" in the dialog
    await settle()
    expect(edits).not.toHaveBeenCalled()
    expect(session.undoLabel).toBe('document replaced')
    expect(backend.calls.at(-1)?.body.abc).toBe('NEW DRAFT')
    session.undo()
    expect(doc.text).toBe(ABC)
    await settle()
    expect(session.redoLabel).toBe('document replaced')
  })

  it('replaces the whole text as one undo step, with or without a known view', async () => {
    const edits = vi.fn()
    const session = await start(edits)
    await backend.calls[0].answer(VIEW)
    const imported = 'X:1\nIMPORTED'
    expect(session.replaceText(imported, 'import MIDI (sketch.mid)', viewFor('imported'))).toBe(true)
    await settle()
    expect(doc.text).toBe(imported)
    expect(edits).toHaveBeenCalledTimes(1)
    expect(session.view?.sha256).toBe('imported')
    expect(session.lastValid?.sha256).toBe('imported')
    expect(session.undoLabel).toBe('import MIDI (sketch.mid)')
    // the view came with the import: no second round trip
    expect(backend.calls.map((call) => call.route)).toEqual(['/plenio/score/analyze'])
    session.undo()
    expect(doc.text).toBe(ABC)
    // without a view the replaced text is checked as usual
    expect(session.replaceText(imported, 'again')).toBe(true)
    await settle()
    expect(backend.calls.at(-1)?.body.abc).toBe(imported)
    expect(session.replaceText(imported, 'again')).toBe(false) // the same text: nothing happens
  })

  it('does not analyze an empty text', async () => {
    doc.text = '   '
    const session = await start()
    expect(backend.calls).toHaveLength(0)
    expect(session.view).toBeNull()
    expect(session.pending).toBe(false)
    expect(session.commitBlock).toBeNull()
  })

  it('blocks the commit while the text is unchecked or invalid and reverts to the last valid text', async () => {
    const edits = vi.fn()
    const session = await start(edits)
    expect(session.commitBlock).toBe('The score is still being checked.')
    await backend.calls[0].answer(VIEW)
    expect(session.commitBlock).toBeNull()
    expect(session.canRevert).toBe(false)

    session.typed('X:1\nbroken')
    expect(session.commitBlock).toBe('The score is still being checked.')
    await vi.advanceTimersByTimeAsync(300)
    const diagnostic = {
      severity: 'error' as const,
      message: 'Incomplete native two-voice ABC',
      bar: null,
      voice: null,
      where: 'score',
      line: 2,
      start: 4,
      end: 10
    }
    await backend.calls[1].answer({ ...viewFor('broken', false), diagnostics: [diagnostic] })
    expect(session.commitBlock).toBe(
      'The ABC text is not valid (line 2: Incomplete native two-voice ABC). Fix it, or revert to the last valid score.'
    )
    expect(session.lastValid?.sha256).toBe(VIEW.sha256)
    expect(session.canRevert).toBe(true)

    // the notation's operations are refused while the text is invalid (nothing is sent)
    expect(await session.operate({ op: 'delete', ids: ['vocal:32'] })).toBe(false)
    expect(backend.calls).toHaveLength(2)
    expect(session.error).toContain('revert to the last valid score')

    expect(session.revertToLastValid()).toBe(true)
    expect(doc.text).toBe(ABC)
    expect(session.commitBlock).toBeNull()
    expect(session.current?.sha256).toBe(VIEW.sha256) // its view is known: no new analysis
    await settle()
    expect(backend.calls).toHaveLength(2)
    expect(session.undoLabel).toBe('revert to the last valid score')
    expect(edits).toHaveBeenCalledTimes(2)
    session.undo()
    expect(doc.text).toBe('X:1\nbroken')
  })

  it('blocks the commit when the check itself failed', async () => {
    const session = await start()
    await backend.calls[0].answer({ error: { message: 'Server unavailable' } }, 500)
    expect(session.commitBlock).toBe('The score could not be checked: Server unavailable')
  })

  it('keeps canonical note and chord ids in the selection', async () => {
    const session = await start()
    await backend.calls[0].answer(VIEW)
    const note = VIEW.model!.tracks.vocal[0]
    expect(modelNoteOfSegment(VIEW, note.segments[0])?.id).toBe(note.id)
    session.select([note.id, 'chord:0', 'V2.0', 'ins:9999'])
    session.typed(ABC + ' ')
    await vi.advanceTimersByTimeAsync(300)
    await backend.calls[1].answer(viewFor('typed'))
    expect(session.selection).toEqual([note.id, 'chord:0', 'V2.0'])
    expect(knownIds(VIEW).has('ins:9999')).toBe(false)
  })

  it('turns the canonical ids of a canonical operation into the staff selection', async () => {
    const session = await start()
    await backend.calls[0].answer(VIEW)
    const done = session.operate({ op: 'insert_note', track: 'vocal', onset: 64, duration: 32, pitch: 69 })
    await backend.calls[1].answer(transformAnswer('EDITED', { select: ['vocal:64'], changes: ['bar 2 Ins: C4 (8 units) inserted'] }))
    expect(await done).toBe(true)
    expect(session.selection).toEqual(['V3.0', 'V3.1']) // the staff's written segments of vocal:64
    expect(session.undoLabel).toBe('bar 2 Ins: C4 (8 units) inserted')
  })
})

describe('commit gate', () => {
  const base = { text: 'X:1', view: VIEW, pending: false, busy: false, checkFailed: null }

  it('lets a checked valid text through and blocks everything else', () => {
    expect(commitBlockOf(base)).toBeNull()
    expect(commitBlockOf({ ...base, text: '' })).toBeNull()
    expect(commitBlockOf({ ...base, pending: true })).toContain('being checked')
    expect(commitBlockOf({ ...base, busy: true })).toContain('being checked')
    expect(commitBlockOf({ ...base, view: null })).toContain('not been checked')
    expect(commitBlockOf({ ...base, checkFailed: 'offline' })).toContain('could not be checked: offline')
    expect(commitBlockOf({ ...base, view: { ...VIEW, ok: false, diagnostics: [] } })).toBe(
      'The ABC text is not valid. Fix it, or revert to the last valid score.'
    )
  })
})
