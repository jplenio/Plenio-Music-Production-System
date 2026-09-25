import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, reactive } from 'vue'

import type { Fetcher } from '../src/api/client'
import { History } from '../src/shared/history'
import { clampSpeed, frequency, schedule, scoreTime, sounding, sourceSecond } from '../src/shared/playback'
import {
  type ScoreView,
  clock,
  describe as describeElement,
  elementAtDisplay,
  elementAtSource,
  elementById,
  firstElementOfBar,
  neighbour,
  nextDuration,
  otherVoice,
  sectionOfBar
} from '../src/shared/scoreView'
import type { WorkingDoc } from '../src/shared/sheetSession'
import { defaultPrefs, loadPrefs, savePrefs } from '../src/sheet-editor/score/prefs'
import { useScoreSession } from '../src/sheet-editor/score/useScoreSession'
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
      zoom: 1.4,
      voices: { Vocal: false, Ins: true, chords: true },
      speed: 0.5
    })
    const wrong = JSON.stringify({ layout: 'huge', zoom: 9, voices: 'all', speed: '1' })
    expect(loadPrefs({ getItem: () => wrong })).toEqual(defaultPrefs())
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

  it('does not analyze an empty text', async () => {
    doc.text = '   '
    const session = await start()
    expect(backend.calls).toHaveLength(0)
    expect(session.view).toBeNull()
    expect(session.pending).toBe(false)
  })
})
