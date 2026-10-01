/**
 * Piano roll and chord lane: geometry, hit testing, the select mode's frame and gestures
 * (next-release plan §9.8, §10.3; milestone M1, task D1).
 *
 * The roll draws the canonical model of the current text (``view.model``, integer units of L)
 * and never computes musical content. A gesture is drawn as a ghost locally and commits exactly
 * one canonical operation on release; the backend checks it, writes the text and returns the new
 * view (a refused operation leaves the score unchanged). Everything here is pure (no DOM).
 *
 * Selection is shared with the staff and the ABC text through element ids: a note of the roll is
 * selected when any of its written segments (``V12.3`` ...) is selected, and selecting a note in
 * the roll selects all of its segments.
 */
import type { ScoreOperation } from '../../api/client'
import type { ModelChord, ModelNote, ScoreModelView, ScoreView } from '../../shared/scoreView'

export type Track = 'vocal' | 'ins'
export const TRACKS: readonly Track[] = ['vocal', 'ins']
export type ResizeMode = 'rests' | 'overwrite'
export type SnapChoice = 'auto' | 4 | 8 | 16 | 32
/** What a drag on the empty grid does: draw a note, or pull a frame that selects the notes it touches. */
export type RollMode = 'draw' | 'select'

export interface RollNote extends ModelNote {
  track: Track
}

/** Header (bar numbers, sections), chord lane, pitch-label column, in pixels. */
export const HEADER = 18
export const LANE = 24
export const TOP = HEADER + LANE
export const KEYS_WIDTH = 36
export const EDGE_PX = 6
export const MOVE_THRESHOLD_PX = 3
/** One key row: the roll scrolls vertically through the whole range instead of squeezing it. */
export const ROW_HEIGHT = 12
/** The range the roll always offers - the piano's A0 to C8 - widened for notes outside it. */
export const PIANO_LOW = 21
export const PIANO_HIGH = 108

export interface Geometry {
  pxPerUnit: number
  rowHeight: number
  /** Highest and lowest pitch shown (top and bottom row). */
  high: number
  low: number
  /** The notes' own range, padded (``pitchRange``): where the roll opens. */
  focus: [number, number]
  total: number
  /** Snap step in units. */
  snap: number
  /** Default length of a double-clicked note (a beat, at least one snap step). */
  drawLength: number
  width: number
  height: number
}

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

// --- the model -------------------------------------------------------------------------------

export function notesOf(model: ScoreModelView): RollNote[] {
  return [
    ...model.tracks.vocal.map((n) => ({ ...n, track: 'vocal' as const })),
    ...model.tracks.ins.map((n) => ({ ...n, track: 'ins' as const }))
  ]
}

/** Units per whole note of the score (the denominator of L). */
export function unitDenominator(model: ScoreModelView): number {
  const denominator = Number(model.unit.split('/')[1])
  return Number.isFinite(denominator) && denominator > 0 ? denominator : 32
}

/** The snap step in units: the backend's grid, or a note value (never below one unit). */
export function snapUnits(model: ScoreModelView, choice: SnapChoice): number {
  if (choice === 'auto') return Math.max(1, model.grid.snap)
  return Math.max(1, Math.round(unitDenominator(model) / choice))
}

/** ``[low, high]``: the notes' range padded, at least ``span`` semitones, within MIDI. */
export function pitchRange(notes: readonly { pitch: number }[], pad = 4, span = 24): [number, number] {
  let low = notes.length ? Math.min(...notes.map((n) => n.pitch)) - pad : 60
  let high = notes.length ? Math.max(...notes.map((n) => n.pitch)) + pad : 79
  if (high - low + 1 < span) {
    const missing = span - (high - low + 1)
    low -= Math.floor(missing / 2)
    high += Math.ceil(missing / 2)
  }
  if (low < 0) [low, high] = [0, Math.min(127, high - low)]
  if (high > 127) [low, high] = [Math.max(0, low - (high - 127)), 127]
  return [low, high]
}

/** ``[low, high]`` of the roll: the piano's range, widened to every note (within MIDI). */
export function rollRange(notes: readonly { pitch: number }[]): [number, number] {
  const pitches = notes.map((n) => n.pitch)
  const low = Math.max(0, Math.min(PIANO_LOW, ...pitches.map((p) => p - 2)))
  const high = Math.min(127, Math.max(PIANO_HIGH, ...pitches.map((p) => p + 2)))
  return [low, high]
}

/**
 * The layout of the roll. Every pitch of the piano (and any note beyond it) has a row of
 * ``ROW_HEIGHT``; the roll's pane scrolls vertically through them - before, the rows were squeezed
 * into the pane and only the notes' range (+-4 semitones) existed, so nothing could be drawn above
 * or below it. ``options.height`` (the pane) no longer changes the layout.
 */
export function geometry(
  model: ScoreModelView,
  options: { pxPerQuarter: number; height?: number; snap: SnapChoice }
): Geometry {
  const notes = notesOf(model)
  const [low, high] = rollRange(notes)
  const rows = high - low + 1
  const pxPerUnit = options.pxPerQuarter / Math.max(model.grid.units_per_quarter, 1e-9)
  const rowHeight = ROW_HEIGHT
  const snap = snapUnits(model, options.snap)
  const beat = Math.max(1, Math.round(model.grid.units_per_quarter))
  return {
    pxPerUnit,
    rowHeight,
    high,
    low,
    focus: pitchRange(notes),
    total: model.total,
    snap,
    drawLength: Math.max(snap, Math.round(beat / snap) * snap),
    width: KEYS_WIDTH + model.total * pxPerUnit + 40,
    height: TOP + rows * rowHeight
  }
}

export const xOf = (unit: number, geo: Geometry): number => KEYS_WIDTH + unit * geo.pxPerUnit
export const unitAt = (x: number, geo: Geometry): number => (x - KEYS_WIDTH) / geo.pxPerUnit
export const yOf = (pitch: number, geo: Geometry): number => TOP + (geo.high - pitch) * geo.rowHeight

/**
 * The vertical scroll position that centres the pitches ``[low, high]`` in a pane of
 * ``viewportHeight`` (the header and the chord lane stay on top of it), within the roll.
 */
export function scrollTopFor(geo: Geometry, viewportHeight: number, low: number, high: number): number {
  const middle = (yOf(high, geo) + yOf(low, geo) + geo.rowHeight) / 2
  const visible = Math.max(0, viewportHeight - TOP)
  const top = middle - TOP - visible / 2
  return Math.round(Math.max(0, Math.min(Math.max(0, geo.height - viewportHeight), top)))
}

/** The scroll position that brings ``pitch`` into view, or ``null`` when its row is visible already. */
export function scrollTopToShow(geo: Geometry, scrollTop: number, viewportHeight: number, pitch: number): number | null {
  const y = yOf(pitch, geo)
  if (y >= scrollTop + TOP && y + geo.rowHeight <= scrollTop + viewportHeight) return null
  return scrollTopFor(geo, viewportHeight, pitch, pitch)
}

export function pitchAt(y: number, geo: Geometry): number {
  const pitch = geo.high - Math.floor((y - TOP) / geo.rowHeight)
  return Math.max(geo.low, Math.min(geo.high, pitch))
}

export const snapFloor = (unit: number, snap: number): number => Math.floor(unit / snap) * snap
export const snapRound = (unit: number, snap: number): number => Math.round(unit / snap) * snap

export function noteRect(note: { onset: number; duration: number; pitch: number }, geo: Geometry): Rect {
  return {
    x: xOf(note.onset, geo),
    y: yOf(note.pitch, geo) + 0.5,
    width: Math.max(2, note.duration * geo.pxPerUnit - 1),
    height: Math.max(2, geo.rowHeight - 1)
  }
}

/** Width of a chord symbol's box in the lane (up to the next chord). */
export function chordWidth(chord: ModelChord, next: ModelChord | undefined, geo: Geometry): number {
  const text = chord.name.length * 7 + 10
  const room = next ? (next.onset - chord.onset) * geo.pxPerUnit - 2 : text
  return Math.max(12, Math.min(text, room))
}

export const isBlackKey = (pitch: number): boolean => [1, 3, 6, 8, 10].includes(((pitch % 12) + 12) % 12)

export function pitchLabel(pitch: number): string {
  return `C${Math.floor(pitch / 12) - 1}`
}

export interface GridLine {
  unit: number
  kind: 'bar' | 'beat'
  bar?: number
}

/** Bar and beat lines (a beat = one note of the meter's denominator). */
export function gridLines(model: ScoreModelView): GridLine[] {
  const lines: GridLine[] = []
  for (const measure of model.measures) {
    lines.push({ unit: measure.onset, kind: 'bar', bar: measure.n })
    const beats = Number(measure.meter.split('/')[0]) || 1
    const step = measure.length / beats
    for (let i = 1; i < beats; i++) lines.push({ unit: measure.onset + i * step, kind: 'beat' })
  }
  return lines
}

// --- hit testing ------------------------------------------------------------------------------

export type Hit =
  | { area: 'note'; note: RollNote; edge: 'body' | 'end' }
  | { area: 'grid'; unit: number; pitch: number }
  | { area: 'chord'; chord: ModelChord }
  | { area: 'lane'; unit: number }
  | { area: 'header'; unit: number }

/**
 * What lies under ``(x, y)`` (roll coordinates). The header and the chord lane stay at the top of the
 * pane while it scrolls: with ``scrollTop`` the first ``TOP`` pixels of the *visible* area are them,
 * and a note scrolled underneath cannot be hit there.
 */
export function hitTest(
  x: number,
  y: number,
  notes: readonly RollNote[],
  chords: readonly ModelChord[],
  geo: Geometry,
  prefer: Track,
  scrollTop = 0
): Hit {
  const unit = Math.max(0, Math.min(geo.total, unitAt(x, geo)))
  const inPane = y - scrollTop
  if (inPane < HEADER) return { area: 'header', unit }
  if (inPane < TOP) {
    for (let i = chords.length - 1; i >= 0; i--) {
      const chord = chords[i]
      const left = xOf(chord.onset, geo)
      if (x >= left && x <= left + chordWidth(chord, chords[i + 1], geo)) return { area: 'chord', chord }
    }
    return { area: 'lane', unit }
  }
  const hits = notes.filter((note) => {
    const rect = noteRect(note, geo)
    return x >= rect.x && x <= rect.x + rect.width && y >= rect.y - 0.5 && y <= rect.y + rect.height + 0.5
  })
  const note = hits.find((n) => n.track === prefer) ?? hits[0]
  if (note) {
    const rect = noteRect(note, geo)
    const edge = x >= rect.x + rect.width - Math.min(EDGE_PX, rect.width / 3) ? 'end' : 'body'
    return { area: 'note', note, edge }
  }
  return { area: 'grid', unit, pitch: pitchAt(y, geo) }
}

// --- the selection frame ----------------------------------------------------------------------

/** A selection frame (select mode): where the drag started and where the pointer is, in roll coordinates. */
export interface Band {
  x0: number
  y0: number
  x1: number
  y1: number
}

/**
 * The frame's rectangle, kept to the rows that can be seen: below the header and the chord lane and
 * right of the pitch column, which stay in place while the pane scrolls (``scrollTop``, ``scrollLeft``).
 */
export function bandRect(band: Band, geo: Geometry, scrollTop = 0, scrollLeft = 0): Rect {
  const clampX = (x: number): number => Math.max(scrollLeft + KEYS_WIDTH, Math.min(geo.width, x))
  const clampY = (y: number): number => Math.max(scrollTop + TOP, Math.min(geo.height, y))
  const left = clampX(Math.min(band.x0, band.x1))
  const top = clampY(Math.min(band.y0, band.y1))
  return { x: left, y: top, width: clampX(Math.max(band.x0, band.x1)) - left, height: clampY(Math.max(band.y0, band.y1)) - top }
}

/** The notes a selection frame touches (a note needs to overlap it, not to lie inside it). */
export function notesInRect(notes: readonly RollNote[], rect: Rect, geo: Geometry): RollNote[] {
  if (rect.width <= 0 || rect.height <= 0) return []
  return notes.filter((note) => {
    const box = noteRect(note, geo)
    return box.x < rect.x + rect.width && box.x + box.width > rect.x && box.y < rect.y + rect.height && box.y + box.height > rect.y
  })
}

/**
 * The chord symbols a selection frame takes: when it reaches into the chord lane (it started there or
 * was pulled up into it), every chord whose box it overlaps along the bars.
 */
export function chordsInBand(
  chords: readonly ModelChord[],
  band: Band,
  geo: Geometry,
  scrollTop = 0,
  scrollLeft = 0
): ModelChord[] {
  if (Math.min(band.y0, band.y1) >= scrollTop + TOP) return []
  const rect = bandRect(band, geo, scrollTop, scrollLeft)
  if (rect.width <= 0) return []
  return chords.filter((chord, index) => {
    const left = xOf(chord.onset, geo)
    return left < rect.x + rect.width && left + chordWidth(chord, chords[index + 1], geo) > rect.x
  })
}

// --- gestures ---------------------------------------------------------------------------------

export type Drag =
  | { kind: 'move'; notes: RollNote[]; anchor: RollNote; fromUnit: number; fromPitch: number; delta: number; semitones: number }
  | { kind: 'resize'; note: RollNote; end: number; overwrite: boolean }
  | { kind: 'draw'; track: Track; start: number; end: number; pitch: number }
  | { kind: 'chord'; chord: ModelChord; fromUnit: number; to: number }

export function startMove(notes: RollNote[], anchor: RollNote, unit: number, pitch: number): Drag {
  return { kind: 'move', notes, anchor, fromUnit: unit, fromPitch: pitch, delta: 0, semitones: 0 }
}

export function startResize(note: RollNote): Drag {
  return { kind: 'resize', note, end: note.onset + note.duration, overwrite: false }
}

export function startDraw(track: Track, unit: number, pitch: number, geo: Geometry): Drag {
  const start = Math.max(0, Math.min(snapFloor(unit, geo.snap), geo.total - 1))
  return { kind: 'draw', track, start, end: Math.min(geo.total, start + geo.snap), pitch }
}

/** Dragging a chord symbol grabbed at ``unit`` (it moves by the pointer's way, on the grid). */
export function startChord(chord: ModelChord, unit: number = chord.onset): Drag {
  return { kind: 'chord', chord, fromUnit: unit, to: chord.onset }
}

const clamp = (value: number, low: number, high: number): number => Math.max(low, Math.min(high, value))

/** The gesture after the pointer moved to ``unit`` (fractional) and ``pitch``. */
export function dragTo(drag: Drag, unit: number, pitch: number, geo: Geometry, modifiers: { alt: boolean }): Drag {
  switch (drag.kind) {
    case 'move': {
      const raw = drag.anchor.onset + (unit - drag.fromUnit)
      const earliest = Math.min(...drag.notes.map((n) => n.onset))
      const latest = Math.max(...drag.notes.map((n) => n.onset + n.duration))
      const delta = clamp(snapRound(raw, geo.snap) - drag.anchor.onset, -earliest, geo.total - latest)
      const lowest = Math.min(...drag.notes.map((n) => n.pitch))
      const highest = Math.max(...drag.notes.map((n) => n.pitch))
      const semitones = clamp(pitch - drag.fromPitch, -lowest, 127 - highest)
      return { ...drag, delta, semitones }
    }
    case 'resize': {
      const shortest = Math.min(geo.snap, geo.total - drag.note.onset)
      const end = clamp(snapRound(unit, geo.snap), drag.note.onset + Math.max(1, shortest), geo.total)
      return { ...drag, end, overwrite: modifiers.alt }
    }
    case 'draw': {
      const end = unit <= drag.start ? drag.start + geo.snap : Math.max(drag.start + geo.snap, snapRound(unit, geo.snap))
      return { ...drag, end: Math.min(geo.total, end) }
    }
    case 'chord':
      return { ...drag, to: clamp(snapRound(drag.chord.onset + unit - drag.fromUnit, geo.snap), 0, geo.total - 1) }
  }
}

/** The one canonical operation a finished gesture commits (``null``: nothing changed). */
export function dragOp(drag: Drag, resizeMode: ResizeMode): ScoreOperation | null {
  switch (drag.kind) {
    case 'move':
      if (!drag.delta && !drag.semitones) return null
      return { op: 'move_notes', ids: drag.notes.map((n) => n.id), delta: drag.delta, semitones: drag.semitones }
    case 'resize': {
      const duration = drag.end - drag.note.onset
      if (duration === drag.note.duration) return null
      return { op: 'resize_note', id: drag.note.id, duration, mode: drag.overwrite ? 'overwrite' : resizeMode }
    }
    case 'draw':
      return { op: 'insert_note', track: drag.track, onset: drag.start, duration: drag.end - drag.start, pitch: drag.pitch }
    case 'chord':
      return drag.to === drag.chord.onset ? null : { op: 'move_chord', onset: drag.chord.onset, to: drag.to }
  }
}

export interface Ghost {
  track: Track
  onset: number
  duration: number
  pitch: number
}

/** What the gesture would produce, drawn over the roll until the new view arrives. */
export function ghosts(drag: Drag | null): Ghost[] {
  if (!drag) return []
  switch (drag.kind) {
    case 'move':
      return drag.notes.map((n) => ({
        track: n.track,
        onset: n.onset + drag.delta,
        duration: n.duration,
        pitch: n.pitch + drag.semitones
      }))
    case 'resize':
      return [{ track: drag.note.track, onset: drag.note.onset, duration: drag.end - drag.note.onset, pitch: drag.note.pitch }]
    case 'draw':
      return [{ track: drag.track, onset: drag.start, duration: drag.end - drag.start, pitch: drag.pitch }]
    case 'chord':
      return []
  }
}

/** Notes (by id) that the gesture moves or changes (drawn dimmed under the ghost). */
export function draggedIds(drag: Drag | null): Set<string> {
  if (!drag) return new Set()
  if (drag.kind === 'move') return new Set(drag.notes.map((n) => n.id))
  if (drag.kind === 'resize') return new Set([drag.note.id])
  return new Set()
}

// --- keyboard ---------------------------------------------------------------------------------

/**
 * The operation of a key in the roll (plan §10.3): ↑/↓ semitone (Shift: octave), ←/→ move by the
 * snap step (Shift: a beat), Alt+←/→ shorter/longer, Delete/Backspace rest (Shift: close the gap).
 * ``undefined``: the roll does not handle the key; ``null``: handled, nothing to do.
 */
export function keyOp(
  key: string,
  modifiers: { shift: boolean; alt: boolean },
  selected: readonly RollNote[],
  chords: readonly ModelChord[],
  geo: Geometry,
  resizeMode: ResizeMode
): ScoreOperation | null | undefined {
  const ids = selected.map((n) => n.id)
  switch (key) {
    case 'ArrowUp':
    case 'ArrowDown': {
      if (!selected.length) return undefined
      const semitones = (modifiers.shift ? 12 : 1) * (key === 'ArrowUp' ? 1 : -1)
      const pitches = selected.map((n) => n.pitch + semitones)
      if (Math.min(...pitches) < 0 || Math.max(...pitches) > 127) return null
      return { op: 'set_note_pitch', ids, semitones }
    }
    case 'ArrowLeft':
    case 'ArrowRight': {
      if (!selected.length) return undefined
      const sign = key === 'ArrowRight' ? 1 : -1
      if (modifiers.alt) {
        const note = selected[0]
        const duration = note.duration + sign * geo.snap
        if (duration < 1 || note.onset + duration > geo.total) return null
        return { op: 'resize_note', id: note.id, duration, mode: resizeMode }
      }
      const step = modifiers.shift ? geo.drawLength : geo.snap
      const earliest = Math.min(...selected.map((n) => n.onset))
      const latest = Math.max(...selected.map((n) => n.onset + n.duration))
      const delta = clamp(sign * step, -earliest, geo.total - latest)
      return delta ? { op: 'move_notes', ids, delta } : null
    }
    case 'Delete':
    case 'Backspace': {
      const all = [...ids, ...chords.map((c) => c.id)]
      if (!all.length) return undefined
      return { op: modifiers.shift ? 'delete_close_gap' : 'delete', ids: all }
    }
    default:
      return undefined
  }
}

// --- selection shared with the staff ----------------------------------------------------------

const CANONICAL_NOTE = /^(vocal|ins):\d+$/

/** Canonical ids of the notes whose written segments (or own ids) are in ``ids``. */
export function selectedNoteIds(view: ScoreView | null, ids: readonly string[]): Set<string> {
  const tracks = view?.model?.tracks
  const result = new Set<string>()
  if (!tracks) return result
  const bySegment = new Map<string, string>()
  for (const note of [...tracks.vocal, ...tracks.ins]) for (const segment of note.segments) bySegment.set(segment, note.id)
  for (const id of ids) {
    if (CANONICAL_NOTE.test(id)) result.add(id)
    else {
      const note = bySegment.get(id)
      if (note) result.add(note)
    }
  }
  return result
}

export function selectedChordIds(ids: readonly string[]): Set<string> {
  return new Set(ids.filter((id) => id.startsWith('chord:')))
}

/** The selection for notes and chords of the roll: element ids of the notes' segments, chord ids. */
export function selectionFor(notes: readonly ModelNote[], chords: readonly ModelChord[] = []): string[] {
  return [...notes.flatMap((n) => (n.segments.length ? n.segments : [n.id])), ...chords.map((c) => c.id)]
}
