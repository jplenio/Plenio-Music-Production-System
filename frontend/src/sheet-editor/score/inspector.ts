/**
 * The inspector of the score editor (next-release plan §10.3; milestone M1, task D2): what is in
 * focus (notes, a chord symbol, a bar) and the one canonical operation each field commits.
 *
 * Like the piano roll it computes no musical content: it reads ``view.model`` and turns an edit of
 * a field into exactly one operation of ``plenio.core.score.ops``; the backend checks it. Pure.
 */
import type { ScoreOperation } from '../../api/client'
import type { ModelChord, ModelMeasure, ScoreModelView, ScoreView } from '../../shared/scoreView'
import { type ResizeMode, type RollNote, type Track, notesOf, selectedChordIds, selectedNoteIds, unitDenominator } from './pianoRoll'

/** The keys of the native dialect (upstream ``KEYS``): 15 major and 15 minor keys. */
export const KEYS = [
  'Cb', 'Gb', 'Db', 'Ab', 'Eb', 'Bb', 'F', 'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#',
  'Abm', 'Ebm', 'Bbm', 'Fm', 'Cm', 'Gm', 'Dm', 'Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'A#m'
] as const

export const METERS = ['2/4', '3/4', '4/4', '5/4', '6/8', '7/8', '9/8', '12/8', '2/2', '3/8'] as const

export interface Focus {
  notes: RollNote[]
  chords: ModelChord[]
  /** The chord symbol that starts where the single selected note starts. */
  chordAtNote: ModelChord | null
  /** The bar in focus: of the selection, else the fallback bar (the staff's selected rest ...). */
  measure: ModelMeasure | null
}

export function measureAt(model: ScoreModelView, onset: number): ModelMeasure | null {
  let found: ModelMeasure | null = null
  for (const measure of model.measures) if (measure.onset <= onset) found = measure
  return found
}

/** What the selection puts into focus (``fallbackBar``: 1-based, e.g. the bar of a selected rest). */
export function focusOf(view: ScoreView | null, selection: readonly string[], fallbackBar: number | null): Focus {
  const model = view?.model
  if (!model) return { notes: [], chords: [], chordAtNote: null, measure: null }
  const noteIds = selectedNoteIds(view, selection)
  const chordIds = selectedChordIds(selection)
  const notes = notesOf(model).filter((n) => noteIds.has(n.id))
  const chords = model.tracks.chords.filter((c) => chordIds.has(c.id))
  const chordAtNote = notes.length === 1 ? (model.tracks.chords.find((c) => c.onset === notes[0].onset) ?? null) : null
  const anchor = notes[0]?.onset ?? chords[0]?.onset
  const measure =
    anchor !== undefined ? measureAt(model, anchor) : fallbackBar ? (model.measures[fallbackBar - 1] ?? null) : null
  return { notes, chords, chordAtNote, measure }
}

export interface Position {
  bar: number
  /** Units from the start of the bar. */
  offset: number
  beat: number
  /** Units from the start of the beat. */
  tick: number
  text: string
}

/** ``bar 3 · beat 2 + 1/32``: where an onset is (a beat = one note of the meter's denominator). */
export function positionOf(model: ScoreModelView, onset: number): Position {
  const measure = measureAt(model, onset) ?? model.measures[0]
  const offset = onset - measure.onset
  const beats = Number(measure.meter.split('/')[0]) || 1
  const beatUnits = measure.length / beats
  const beat = Math.floor(offset / beatUnits) + 1
  const tick = offset - (beat - 1) * beatUnits
  const unit = unitDenominator(model)
  const rest = tick ? ` + ${tick}/${unit}` : ''
  return { bar: measure.n, offset, beat, tick, text: `bar ${measure.n} · beat ${beat}${rest}` }
}

/** The onset of ``offset`` units into bar ``bar`` (``null`` outside the score or the bar). */
export function onsetFrom(model: ScoreModelView, bar: number, offset: number): number | null {
  const measure = model.measures[bar - 1]
  if (!measure || !Number.isInteger(offset) || offset < 0 || offset >= measure.length) return null
  return measure.onset + offset
}

const LETTERS: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

export function pitchName(midi: number): string {
  return `${NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`
}

/** A MIDI pitch from ``C#5``, ``Bb3``, ``e4`` or a number (``null`` when unreadable or outside 0-127). */
export function parsePitch(text: string): number | null {
  const value = text.trim()
  if (/^\d{1,3}$/.test(value)) {
    const midi = Number(value)
    return midi <= 127 ? midi : null
  }
  const match = /^([A-Ga-g])(##|#|bb|b)?(-?\d)$/.exec(value)
  if (!match) return null
  const shift = { '#': 1, '##': 2, b: -1, bb: -2 }[match[2] ?? ''] ?? 0
  const midi = (Number(match[3]) + 1) * 12 + LETTERS[match[1].toUpperCase()] + shift
  return midi >= 0 && midi <= 127 ? midi : null
}

export interface LengthChoice {
  label: string
  units: number
}

/** Note values that are a whole number of units in this score (1/32 ... 1/1). */
export function lengthChoices(model: ScoreModelView): LengthChoice[] {
  const denominator = unitDenominator(model)
  const choices: LengthChoice[] = []
  for (const value of [32, 16, 8, 4, 2, 1]) {
    if (denominator % value === 0) choices.push({ label: `1/${value}`, units: denominator / value })
    const dotted = (denominator / value) * 1.5
    if (value >= 2 && value <= 16 && Number.isInteger(dotted)) choices.push({ label: `1/${value}.`, units: dotted })
  }
  return choices.sort((a, b) => a.units - b.units)
}

// --- operations -------------------------------------------------------------------------------

export function pitchOp(notes: readonly RollNote[], midi: number): ScoreOperation | null {
  if (!notes.length || notes.every((n) => n.pitch === midi)) return null
  return { op: 'set_note_pitch', ids: notes.map((n) => n.id), midi }
}

export function shiftOp(notes: readonly RollNote[], semitones: number): ScoreOperation | null {
  if (!notes.length || notes.some((n) => n.pitch + semitones < 0 || n.pitch + semitones > 127)) return null
  return { op: 'set_note_pitch', ids: notes.map((n) => n.id), semitones }
}

export function voiceOp(notes: readonly RollNote[], track: Track): ScoreOperation | null {
  if (!notes.length || notes.every((n) => n.track === track)) return null
  return { op: 'move_notes', ids: notes.map((n) => n.id), track }
}

export function startOp(model: ScoreModelView, note: RollNote, onset: number | null): ScoreOperation | null {
  if (onset === null || onset === note.onset || onset + note.duration > model.total) return null
  return { op: 'move_notes', ids: [note.id], delta: onset - note.onset }
}

export function lengthOp(
  model: ScoreModelView,
  note: RollNote,
  units: number,
  mode: ResizeMode
): ScoreOperation | null {
  if (!Number.isInteger(units) || units < 1 || units === note.duration || note.onset + units > model.total) return null
  return { op: 'resize_note', id: note.id, duration: units, mode }
}

/** Add, rename or (empty name) remove the chord symbol at ``onset``. */
export function chordOp(onset: number, name: string, existing: ModelChord | null): ScoreOperation | null {
  const value = name.trim()
  if (!value) return existing ? { op: 'delete_chord', onset } : null
  if (existing?.name === value) return null
  return { op: 'put_chord', onset, name: value }
}

export function chordMoveOp(chord: ModelChord, onset: number | null): ScoreOperation | null {
  if (onset === null || onset === chord.onset) return null
  return { op: 'move_chord', onset: chord.onset, to: onset }
}

// --- bars -------------------------------------------------------------------------------------

export function insertBarsOp(measure: ModelMeasure, where: 'before' | 'after', count = 1): ScoreOperation {
  return { op: 'insert_measures', bar: where === 'before' ? measure.n : measure.n + 1, count }
}

export function duplicateBarsOp(measure: ModelMeasure, count = 1): ScoreOperation {
  return { op: 'duplicate_measures', bar: measure.n, count }
}

export function deleteBarsOp(model: ScoreModelView, measure: ModelMeasure, count = 1): ScoreOperation | null {
  return model.measures.length > count ? { op: 'delete_measures', bar: measure.n, count } : null
}

export function meterOp(measure: ModelMeasure, meter: string): ScoreOperation | null {
  const value = meter.trim()
  if (!/^\d+\/\d+$/.test(value) || value === measure.meter) return null
  return { op: 'change_meter', bar: measure.n, count: 1, meter: value }
}

/** The key change that starts at this bar (never the key of bar 1: it can only be changed). */
export function keyChangeAt(model: ScoreModelView, measure: ModelMeasure): { onset: number; key: string } | null {
  return model.keys.find((k) => k.onset === measure.onset && k.onset > 0) ?? null
}

export function keyOp(measure: ModelMeasure, key: string): ScoreOperation | null {
  if (!(KEYS as readonly string[]).includes(key) || key === measure.key) return null
  return { op: 'put_key', onset: measure.onset, key }
}

export function removeKeyOp(model: ScoreModelView, measure: ModelMeasure): ScoreOperation | null {
  const change = keyChangeAt(model, measure)
  return change ? { op: 'delete_key', onset: change.onset } : null
}

// --- layout -----------------------------------------------------------------------------------

export type Layout = 'review' | 'daw' | 'text'

/**
 * The layout a sheet opens in: the node's ``plenio_editor_layout`` (a template's intent: ``review``,
 * ``daw``, ``text``), else the viewer's last choice.
 */
export function initialLayout(nodeLayout: unknown, remembered: Layout): Layout {
  if (nodeLayout === 'text') return 'text'
  if (nodeLayout === 'daw') return 'daw'
  if (nodeLayout === 'review') return 'review'
  return remembered
}
