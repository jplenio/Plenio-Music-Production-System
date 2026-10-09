<script setup lang="ts">
/**
 * Piano roll with chord lane (next-release plan §9.8, §10.3; milestone M1, task D1).
 *
 * Draws ``view.model`` - both voices in one roll (Vocal blue, Ins orange; new notes go into the
 * active track), the chord symbols in a lane above, bar numbers and sections in the header.
 * Every gesture is drawn as a ghost and commits exactly one canonical operation on release
 * through ``operate``; the backend checks it and returns the new view. A refused operation
 * removes the ghost (the Score tab shows the backend's message). Only the visible part of a long
 * score is drawn.
 *
 * The pane scrolls both ways: horizontally through the bars, vertically through the whole piano range
 * (the notes' range is centred when the roll opens). The pitch column stays on the left and the header
 * with the chord lane stays on top while it scrolls; a drag near the top or bottom edge scrolls along.
 *
 * Two modes decide what a drag on the empty grid does: *draw* (a new note - the roll always opens in
 * it) or *select* (a frame that selects every note it touches; with Shift the frame adds to the
 * selection). A click on a note selects it and a drag moves it (with the other selected notes) in
 * both modes. The selection is shared with the staff, so the framed notes are marked there too.
 *
 * The cursor (Cubase: project cursor, docs/design/score-arrange-design.md §2) is a line through the
 * roll with a marker in the ruler: a click or a drag in the ruler (the bar numbers) puts it on the
 * grid. Playback starts there; while it plays a second line follows the music and the pane pages along.
 *
 * With lyrics, a lyrics lane under the chord lane shows every line over the Vocal phrase it is sung on
 * and each syllable over its note (backend ``lyric_layout``); a double-click in the lane edits the line
 * there (``lyricEdit``: the Score tab changes the lyrics, the view follows). The lines are handled like
 * notes: a click selects one (Ctrl / Shift: more), a drag moves them, a drag at a line's start or end
 * makes it longer or shorter (``lyricPlace``), Del deletes them (``lyricDelete``), ← / → move them by the
 * grid; copy and paste go through the Score tab's clipboard (``lyricPlacement``).
 *
 * DAW habits (owner's request 2026-10-03): in draw mode a click on the empty grid inserts a note of the
 * last drawn length, Shift+drag pulls a frame; Alt+drag copies notes; a note's end stops at the next
 * note (Alt: over it); Ctrl+wheel zooms around the pointer, G / H zoom out / in; a click on the keyboard
 * plays its pitch, and a drawn, grabbed or moved note is heard (``audition``). A cover's source
 * recording (``source``) is drawn as a waveform lane, bar by bar where the transcription puts it.
 *
 * The clipboard buttons (Cubase: key editor - Copy, Cut, Paste, Paste Time) ask the Score tab, which
 * owns the clipboard and the cursor (``clipboard`` event); a frame that reaches into the chord lane
 * also selects the chord symbols there, and Ctrl+A selects all notes and chord symbols.
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import type { ClipAction } from './clipboard'
import { pitchName } from './inspector'
import { lineKey } from './lyricPlacement'
import { positionLabel, rulerUnit } from './locator'
import type { InstrumentId } from './instruments'
import { audition as hearPitch } from './player'
import { type SourceEnvelope, waveColumns } from './sourceAudio'
import { type SungCurve, curveRuns } from './sungPitch'

import type { ScoreOperation } from '../../api/client'
import type { LyricLayoutView, ModelChord, ScoreView } from '../../shared/scoreView'
import {
  type Band,
  type Drag,
  HEADER,
  KEYS_WIDTH,
  LANE,
  LYRICS_LANE,
  MOVE_THRESHOLD_PX,
  ROW_MAX,
  ROW_MIN,
  SOURCE_LANE,
  type ResizeMode,
  type RollMode,
  type RollNote,
  type SnapChoice,
  TOP,
  type Track,
  bandInLane,
  bandRect,
  chordWidth,
  chordsInBand,
  dragOp,
  dragTo,
  draggedIds,
  geometry,
  ghosts,
  gridLines,
  hitTest,
  isBlackKey,
  keyOp,
  noteRect,
  notesInRect,
  notesOf,
  pitchAt,
  pitchLabel,
  scrollTopFor,
  scrollTopToShow,
  selectedChordIds,
  selectedNoteIds,
  selectionFor,
  snapFloor,
  startChord,
  startDraw,
  startMove,
  startResize,
  unitAt,
  unitDenominator,
  xOf,
  yOf
} from './pianoRoll'

const props = withDefaults(
  defineProps<{
    view: ScoreView | null
    selection: string[]
    /** Commits one canonical operation; resolves ``false`` when it was refused. */
    operate: (operation: ScoreOperation) => Promise<boolean>
    playing?: string[]
    readonly?: boolean
    stale?: boolean
    busy?: boolean
    resizeMode?: ResizeMode
    height?: number
    /** The cursor in units of L (``null``: none shown). */
    locator?: number | null
    /** Where playback is, in units of L (``null``: stopped). */
    playhead?: number | null
    /** What the clipboard holds (``3 notes``), ``null`` when it is empty. */
    clip?: string | null
    /** Where the lyrics are sung (``null``: no lyrics lane). */
    lyrics?: LyricLayoutView | null
    /** The lyrics lane edits lines (also on a read-only score: the lyrics may be this sheet's). */
    lyricsEditable?: boolean
    /** A cover's source recording: its envelope and the source's seconds of every score bar. */
    source?: { envelope: SourceEnvelope; bars: readonly ([number, number, string] | null)[] | undefined } | null
    /**
     * A cover's sung pitch (node Sung Pitch): the curve, the source's seconds of every score bar and the
     * octaves that bring it onto the notes - or why there is none.
     */
    sung?: {
      problem: string | null
      curve: SungCurve | null
      offset: number
      bars: readonly ([number, number, string] | null)[] | undefined
    } | null
    /** The sound a drawn, grabbed or moved note is heard in (the draw-into track's). */
    sound?: InstrumentId
    /** A MIDI take while it is played: its notes so far (drawn red over the roll). */
    recorded?: { track: Track; notes: readonly { onset: number; duration: number; pitch: number }[] } | null
  }>(),
  {
    playing: () => [],
    readonly: false,
    stale: false,
    busy: false,
    resizeMode: 'rests',
    height: 280,
    locator: null,
    playhead: null,
    clip: null,
    lyrics: null,
    lyricsEditable: false,
    source: null,
    sung: null,
    recorded: null
  }
)
/** A line of the lyrics changed in the lane (``text`` empty: the line goes). */
export interface LyricEdit {
  block: number
  line: number
  text: string
  /** Where the line is (a new one: the start of its phrase), in units of L. */
  at?: number
}

/** A lyrics line placed anew in the lane: its key (``block:line``) and its span in units of L. */
export interface LyricPlace {
  key: string
  start: number
  end: number
}
const emit = defineEmits<{
  select: [ids: string[]]
  locate: [unit: number]
  clipboard: [action: ClipAction]
  lyricEdit: [edit: LyricEdit]
  lyricPlace: [moves: LyricPlace[]]
  lyricDelete: [keys: string[]]
}>()
/** The lyrics lines selected in the lane (``block:line``; the Score tab copies and pastes them). */
const lyricSelection = defineModel<string[]>('lyricSelection', { default: () => [] })
/** Pixels per quarter note (the roll's horizontal zoom). */
const zoom = defineModel<number>('zoom', { default: 48 })
/** Hear the pitch of a drawn, grabbed or moved note and of a clicked key. */
const audition = defineModel<boolean>('audition', { default: true })
/** Pixels per key row (the roll's vertical zoom). */
const rowHeight = defineModel<number>('rowHeight', { default: 12 })
/** The roll pages along with the playback line (Cubase: autoscroll). */
const follow = defineModel<boolean>('follow', { default: true })
/** Draw the sung pitch (when the sheet has one). */
const sungVisible = defineModel<boolean>('sungVisible', { default: true })
/** Show the source's waveform lane (a cover; off for a cover far from the original). */
const waveVisible = defineModel<boolean>('waveVisible', { default: true })
/** The source lane is drawn (a cover's recording, switched on). */
const sourceShown = computed(() => !!props.source && waveVisible.value)

const root = ref<HTMLDivElement | null>(null)
const scroller = ref<HTMLDivElement | null>(null)
const svg = ref<SVGSVGElement | null>(null)
const chordInput = ref<HTMLInputElement | null>(null)
/** The voice new notes go into (drawn, recorded, entered step by step). */
const track = defineModel<Track>('track', { default: 'vocal' })
/** Draw or select: not a preference - the roll always opens in draw mode. */
const mode = ref<RollMode>('draw')
const snapChoice = ref<SnapChoice>('auto')
const drag = ref<Drag | null>(null)
/** The selection frame while it is pulled, with the note ids it keeps (Shift: the selection before). */
const band = ref<(Band & { keep: string[]; keepChords: string[] }) | null>(null)
const committing = ref(false)
const scrollLeft = ref(0)
const scrollTop = ref(0)
const viewportWidth = ref(0)
const viewportHeight = ref(0)
/** The roll opened on the notes once (again after the model was missing, e.g. a new score). */
let centred = false
const chordEdit = ref<{ onset: number; name: string; original: string | null } | null>(null)
const lyricInput = ref<HTMLInputElement | null>(null)
const lyricEdit = ref<(LyricEdit & { original: string; start: number }) | null>(null)
/** Esc was pressed: the blur that follows does not commit. */
let lyricCancelled = false
/** A lyrics line dragged in the lane: moved (with the other selected ones), or at its start or end. */
interface LyricDrag {
  kind: 'move' | 'start' | 'end'
  key: string
  keys: string[]
  origin: number
  delta: number
}
const lyricDrag = ref<LyricDrag | null>(null)
/** Pixels at a line's start or end that grab its edge instead of the whole line. */
const LYRIC_EDGE_PX = 5
interface Press {
  x: number
  y: number
  start: Drag | null
  started: boolean
  clear: boolean
  /** Set when the press pulls a selection frame: the selection it keeps. */
  keep: { notes: string[]; chords: ModelChord[] } | null
  /** The pane's scroll when the press started (a frame keeps its start there). */
  from?: { scrollTop: number; scrollLeft: number }
  /** A press in the ruler: it moves the cursor while the button is held. */
  ruler?: boolean
  /** A press on a lyrics line: it may become a drag of lines. */
  lyric?: LyricDrag
  /** A click (no drag) on the empty grid in draw mode inserts a note (nothing was selected). */
  insert?: boolean
}
let press: Press | null = null
let observer: ResizeObserver | null = null

const model = computed(() => props.view?.model ?? null)
const notes = computed<RollNote[]>(() => (model.value ? notesOf(model.value) : []))
const chords = computed<ModelChord[]>(() => model.value?.tracks.chords ?? [])
const geo = computed(() =>
  model.value
    ? geometry(model.value, {
        pxPerQuarter: zoom.value,
        snap: snapChoice.value,
        lyrics: !!props.lyrics,
        source: sourceShown.value,
        rowHeight: rowHeight.value
      })
    : null
)
/** The length of the last drawn or resized note: a click in draw mode inserts one this long (FL, Cubase). */
const lastLength = ref<number | null>(null)

function hear(pitch: number): void {
  if (audition.value) hearPitch(pitch, 0.35, props.sound)
}
const editable = computed(() => !props.readonly && !props.stale && !props.busy && !committing.value)
const selectedNotes = computed(() => selectedNoteIds(props.view, props.selection))
const selectedChords = computed(() => selectedChordIds(props.selection))
const playingNotes = computed(() => selectedNoteIds(props.view, props.playing))
const dragged = computed(() => draggedIds(drag.value))
const ghostNotes = computed(() => ghosts(drag.value))
/**
 * The frame's rectangle and the notes and chord symbols it would select - shown as selected while it is
 * pulled; ``lane``: it reaches into the chord lane (drawn there too).
 */
const banded = computed(() => {
  const g = geo.value
  const current = band.value
  if (!g || !current) return null
  const rect = bandRect(current, g, scrollTop.value, scrollLeft.value)
  const ids = new Set(current.keep)
  for (const note of notesInRect(notes.value, rect, g)) ids.add(note.id)
  const chordIds = new Set(current.keepChords)
  for (const chord of chordsInBand(chords.value, current, g, scrollTop.value, scrollLeft.value)) chordIds.add(chord.id)
  const lane = bandInLane(current, scrollTop.value) // the chord lane (not the lyrics lane)
  return { rect, ids, chords: chordIds, lane }
})
const hint = computed(() =>
  mode.value === 'draw'
    ? 'click: a note (the last length) · drag: draw · Shift+drag: frame · drag a note: move (↕ pitch, Alt: copy) · ' +
      'drag its end: length (stops at the next note, Alt: over it) · double-click the lane: chord · Del: rest · ' +
      'Shift+Del: close the gap · Ctrl+wheel or G / H: zoom'
    : 'drag: frame the notes to select (Shift: add) · click: note (Shift: add or remove) · drag a selected note: move them all ' +
      '(Alt: copy) · into the chord lane: chords too · Ctrl+A: all · ↑↓←→: move · Del: rest · Shift+Del: close the gap · ' +
      'Ctrl+C / Ctrl+X: copy / cut · Ctrl+V: paste at the cursor · Ctrl+Shift+V: insert · Ctrl+D: duplicate · Ctrl+wheel or G / H: zoom'
)
const lyricsHint = computed(() =>
  props.lyrics && props.lyricsEditable
    ? ' · lyrics lane: double-click: edit the words · drag a line: move · drag its start or end: longer / shorter · Del · Ctrl+C / Ctrl+V'
    : ''
)
const position = computed(() => (model.value && props.locator !== null ? positionLabel(model.value, props.locator) : ''))

// --- the lyrics lane ---
const LETTER_PX = 6.2
/** Where a line is while a drag is pulled (the line itself elsewhere). */
function draggedSpan(key: string, start: number, end: number): [number, number] {
  const current = lyricDrag.value
  if (!current || !current.delta) return [start, end]
  if (current.kind === 'move' && current.keys.includes(key)) return [start + current.delta, end + current.delta]
  if (current.key !== key) return [start, end]
  if (current.kind === 'start') return [Math.min(start + current.delta, end - 1), end]
  if (current.kind === 'end') return [start, Math.max(end + current.delta, start + 1)]
  return [start, end]
}
function isDragged(key: string): boolean {
  const current = lyricDrag.value
  if (!current?.delta) return false
  return current.kind === 'move' ? current.keys.includes(key) : current.key === key
}
/**
 * The lines with words over their phrases: the box is the line's span (a drag at its ends changes it),
 * the words are cut to the room before the next line.
 */
const lyricLines = computed(() => {
  const g = geo.value
  const layout = props.lyrics
  if (!g || !layout) return []
  const all = layout.parts
    .flatMap((p) =>
      p.lines
        .filter((l) => l.text)
        .map((l) => {
          const key = lineKey(l.block, l.line)
          const [start, end] = draggedSpan(key, l.start, l.end)
          return { ...l, start, end, key }
        })
    )
    .sort((a, b) => a.start - b.start || a.line - b.line)
  const selected = new Set(lyricSelection.value)
  return all
    .map((line, index) => {
      const x = xOf(line.start, g)
      const next = all.slice(index + 1).find((l) => l.start > line.start)
      const room = next ? xOf(next.start, g) - x - 2 : 640
      const width = Math.max(16, xOf(line.end, g) - x)
      const chars = Math.max(1, Math.floor((Math.max(width, Math.min(room, line.text.length * LETTER_PX + 8)) - 8) / LETTER_PX))
      const shown = line.text.length > chars ? `${line.text.slice(0, Math.max(1, chars - 1))}…` : line.text
      return { ...line, x, width, shown, selected: selected.has(line.key), dragged: isDragged(line.key) }
    })
    .filter((line) => inWindow(line.start, Math.max(line.end, line.start + 64)))
})

/** The lyrics line under ``x`` in the lane and which part of it was grabbed. */
function lyricAt(x: number): { key: string; start: number; end: number; part: LyricDrag['kind'] } | null {
  const hits = lyricLines.value.filter((l) => x >= l.x - LYRIC_EDGE_PX && x <= l.x + l.width + LYRIC_EDGE_PX)
  const line = hits.find((l) => x >= l.x && x <= l.x + l.width) ?? hits[0]
  if (!line) return null
  const part = x >= line.x + line.width - LYRIC_EDGE_PX ? 'end' : x <= line.x + LYRIC_EDGE_PX && line.width > 3 * LYRIC_EDGE_PX ? 'start' : 'move'
  return { key: line.key, start: line.start, end: line.end, part }
}

/** The new spans of the dragged (or nudged) lines. */
function lyricMoves(current: LyricDrag): LyricPlace[] {
  const moves: LyricPlace[] = []
  for (const line of props.lyrics?.parts.flatMap((p) => p.lines.map((l) => ({ ...l, key: lineKey(l.block, l.line) }))) ?? []) {
    const moved = current.kind === 'move' ? current.keys.includes(line.key) : line.key === current.key
    if (!moved) continue
    const end = Math.max(line.end, line.start + 1)
    let span: [number, number] = [line.start, end]
    if (current.kind === 'move') span = [line.start + current.delta, end + current.delta]
    else if (current.kind === 'start') span = [Math.min(line.start + current.delta, end - 1), end]
    else span = [line.start, Math.max(end + current.delta, line.start + 1)]
    moves.push({ key: line.key, start: Math.max(0, span[0]), end: Math.max(1, span[1]) })
  }
  return moves
}
/** The syllable of every Vocal note that has one (``-``: the word goes on). */
const syllables = computed(() => {
  const map = new Map<number, string>()
  for (const part of props.lyrics?.parts ?? [])
    for (const line of part.lines) for (const s of line.syllables) map.set(s.onset, s.end_of_word ? s.text : `${s.text}-`)
  return map
})
/** The pitch in every note wide enough to hold it (Cubase's key editor shows note names). */
const NAME_MIN_PX = 26
const noteNames = computed(() => {
  const g = geo.value
  if (!g) return []
  return visibleNotes.value
    .map((n) => ({ n, rect: noteRect(n, g) }))
    .filter(({ rect }) => rect.width >= NAME_MIN_PX)
    .map(({ n, rect }) => ({ key: n.id, x: rect.x + 2, y: rect.y + rect.height - 2.5, text: pitchName(n.pitch) }))
})
const visibleSyllables = computed(() => {
  const g = geo.value
  if (!g || !syllables.value.size) return []
  return visibleNotes.value
    .filter((n) => n.track === 'vocal' && syllables.value.has(n.onset))
    .map((n) => {
      const rect = noteRect(n, g)
      return { key: n.id, x: rect.x + 1, y: rect.y - 2, text: syllables.value.get(n.onset) as string }
    })
})

/** The line to edit at ``unit``: the one sung there, a new one for a phrase without words, or the one before. */
function lyricTargetAt(unit: number): (LyricEdit & { original: string; start: number }) | null {
  const layout = props.lyrics
  const part = layout?.parts.find((p) => unit >= p.start && unit < p.end)
  if (!part) return null
  const count = part.lines.length ? Math.max(...part.lines.map((l) => l.line)) + 1 : 0
  const at = part.lines.find((l) => l.text && unit >= l.start && unit < Math.max(l.end, l.start + 1))
  const target = (line: { line: number; text: string; start: number }) => ({
    block: part.block,
    line: line.line,
    text: line.text,
    original: line.text,
    start: line.start
  })
  if (at) return target(at)
  const phrase = part.phrases.find(([a, b]) => unit >= a && unit < b)
  if (phrase && !part.lines.some((l) => l.syllables.length && l.start < phrase[1] && l.end > phrase[0])) {
    return target({ line: count, text: '', start: phrase[0] }) // words for a phrase that has none
  }
  const before = [...part.lines].reverse().find((l) => l.text && l.start <= unit)
  return target(before ?? { line: count, text: '', start: part.start })
}

function startLyricEdit(unit: number): void {
  const target = lyricTargetAt(unit)
  if (!target) return
  lyricCancelled = false
  lyricEdit.value = target
  void nextTick(() => {
    lyricInput.value?.focus()
    lyricInput.value?.select()
  })
}

function commitLyric(): void {
  const edit = lyricEdit.value
  lyricEdit.value = null
  if (!edit || lyricCancelled) {
    lyricCancelled = false
    return
  }
  root.value?.focus({ preventScroll: true })
  if (edit.text.trim() === edit.original.trim()) return
  emit('lyricEdit', { block: edit.block, line: edit.line, text: edit.text.trim(), at: edit.start })
}

function cancelLyric(): void {
  lyricCancelled = true
  lyricEdit.value = null
  root.value?.focus({ preventScroll: true })
}
const snapLabel = computed(() => (model.value ? `1/${Math.round(unitDenominator(model.value) / (geo.value?.snap ?? 1))}` : ''))

/** The visible units (with a margin) - only this part of a long score is drawn. */
const window_ = computed<[number, number]>(() => {
  const g = geo.value
  if (!g) return [0, 0]
  const width = viewportWidth.value || 100000
  return [unitAt(scrollLeft.value - 200, g), unitAt(scrollLeft.value + width + 200, g)]
})
const inWindow = (start: number, end: number): boolean => end >= window_.value[0] && start <= window_.value[1]
const visibleNotes = computed(() => notes.value.filter((n) => inWindow(n.onset, n.onset + n.duration)))
const visibleChords = computed(() =>
  chords.value.map((chord, index) => ({ chord, next: chords.value[index + 1] })).filter(({ chord }) => inWindow(chord.onset, chord.onset + 64))
)
const visibleLines = computed(() => (model.value ? gridLines(model.value).filter((l) => inWindow(l.unit, l.unit)) : []))
const rows = computed(() => {
  const g = geo.value
  if (!g) return []
  return Array.from({ length: g.high - g.low + 1 }, (_, i) => g.high - i)
})
const sectionStarts = computed(() => {
  const m = model.value
  if (!m) return []
  return m.sections
    .filter((s) => !s.implicit)
    .map((s) => ({ label: s.label, unit: m.measures[s.first_bar - 1]?.onset ?? 0 }))
    .filter((s) => inWindow(s.unit, s.unit + 64))
})

function local(event: MouseEvent): [number, number] {
  const rect = svg.value?.getBoundingClientRect()
  return [event.clientX - (rect?.left ?? 0), event.clientY - (rect?.top ?? 0)]
}

function noteClasses(note: RollNote): Record<string, boolean> {
  return {
    note: true,
    [note.track]: true,
    selected: (banded.value?.ids ?? selectedNotes.value).has(note.id),
    playing: playingNotes.value.has(note.id),
    dragged: dragged.value.has(note.id)
  }
}

function describeNote(note: RollNote): string {
  const voice = note.track === 'vocal' ? 'Vocal' : 'Ins'
  let bar = 1
  for (const measure of model.value?.measures ?? []) if (measure.onset <= note.onset) bar = measure.n
  return `${voice} bar ${bar}: ${note.name}, ${note.duration} units`
}

function select(ids: string[]): void {
  emit('select', ids)
}

function onPointerDown(event: PointerEvent): void {
  const g = geo.value
  if (!g || event.button !== 0) return
  root.value?.focus({ preventScroll: true })
  const [x, y] = local(event)
  const hit = hitTest(x, y, notes.value, chords.value, g, track.value, scrollTop.value, scrollLeft.value)
  if (hit.area === 'keys') {
    // the keyboard: hear the key's pitch (the selection stays)
    if (audition.value) hearPitch(hit.pitch, 0.35, props.sound)
    return
  }
  if (hit.area === 'header' || hit.area === 'source') {
    // the ruler (and the source's waveform): the cursor goes where it was clicked (on the grid) and
    // follows a drag; the selection stays
    emit('locate', rulerUnit(hit.unit, g.snap, g.total))
    press = { x, y, start: null, started: false, clear: false, keep: null, ruler: true }
    capture(event)
    return
  }
  const additive = event.shiftKey || event.ctrlKey || event.metaKey
  if (hit.area === 'lyrics') {
    // a lyrics line: selected like a note, dragged to move it or at its ends to change its length
    const line = lyricAt(x)
    if (!line) {
      if (!additive) lyricSelection.value = []
      return
    }
    if (props.selection.length) select([])
    const current = lyricSelection.value
    const already = current.includes(line.key)
    const picked = additive ? (already ? current.filter((k) => k !== line.key) : [...current, line.key]) : already ? current : [line.key]
    if (picked !== current) lyricSelection.value = picked
    if (props.lyricsEditable && (picked.includes(line.key) || line.part !== 'move')) {
      const keys = line.part === 'move' ? [...picked] : [line.key]
      press = { x, y, start: null, started: false, clear: false, keep: null, lyric: { kind: line.part, key: line.key, keys, origin: unitAt(x, g), delta: 0 } }
      capture(event)
    }
    return
  }
  if (lyricSelection.value.length && !additive) lyricSelection.value = []
  let start: Drag | null = null
  let clear = false
  let keep: Press['keep'] = null
  if (hit.area === 'note') {
    const already = selectedNotes.value.has(hit.note.id)
    let moving: RollNote[]
    if (additive) {
      const ids = new Set(selectedNotes.value)
      if (already) ids.delete(hit.note.id)
      else ids.add(hit.note.id)
      moving = notes.value.filter((n) => ids.has(n.id))
      select(selectionFor(moving, chords.value.filter((c) => selectedChords.value.has(c.id))))
    } else if (already) {
      moving = notes.value.filter((n) => selectedNotes.value.has(n.id))
    } else {
      moving = [hit.note]
      select(selectionFor(moving))
    }
    if (editable.value && moving.some((n) => n.id === hit.note.id)) {
      start =
        hit.edge === 'end' && moving.length === 1
          ? startResize(hit.note, notes.value, g.total)
          : startMove(moving, hit.note, unitAt(x, g), pitchAt(y, g))
    }
    hear(hit.note.pitch)
  } else if (hit.area === 'chord') {
    if (additive) {
      const ids = new Set(selectedChords.value)
      if (ids.has(hit.chord.id)) ids.delete(hit.chord.id)
      else ids.add(hit.chord.id)
      select([...props.selection.filter((id) => !id.startsWith('chord:')), ...ids])
    } else if (!selectedChords.value.has(hit.chord.id)) select([hit.chord.id])
    if (editable.value) start = startChord(hit.chord, unitAt(x, g))
  } else if ((hit.area === 'grid' || hit.area === 'lane') && (mode.value === 'select' || event.shiftKey)) {
    // a frame selects - also while the score cannot be edited; started in the lane it takes chord symbols;
    // in draw mode Shift+drag pulls one too (and adds to the selection)
    keep = additive
      ? { notes: [...selectedNotes.value], chords: chords.value.filter((c) => selectedChords.value.has(c.id)) }
      : { notes: [], chords: [] }
    clear = !additive
  } else if (hit.area === 'grid') {
    const nothingSelected = !props.selection.length && !lyricSelection.value.length
    if (editable.value && !additive) {
      start = startDraw(track.value, hit.unit, hit.pitch, g)
      hear(hit.pitch)
    }
    clear = !additive
    press = { x, y, start, started: false, clear, keep, insert: editable.value && !additive && nothingSelected }
    capture(event)
    return
  } else {
    clear = !additive
  }
  press = { x, y, start, started: false, clear, keep, from: { scrollTop: scrollTop.value, scrollLeft: scrollLeft.value } }
  capture(event)
}

function capture(event: PointerEvent): void {
  try {
    svg.value?.setPointerCapture?.(event.pointerId)
  } catch {
    // capture is a convenience; a synthetic event has no active pointer
  }
}

/** While a gesture runs, the pane scrolls along when the pointer reaches its top or bottom edge. */
function followEdge(event: PointerEvent): void {
  const el = scroller.value
  const g = geo.value
  if (!el || !g) return
  const box = el.getBoundingClientRect()
  if (!box.height) return
  const step = g.rowHeight
  if (event.clientY < box.top + g.top + 12) el.scrollTop = Math.max(0, el.scrollTop - step)
  else if (event.clientY > box.bottom - 16) el.scrollTop = el.scrollTop + step
  else return
  onScroll()
}

function onPointerMove(event: PointerEvent): void {
  const g = geo.value
  if (!press || (!press.start && !press.keep && !press.ruler && !press.lyric) || !g) return
  const [x, y] = local(event)
  if (press.ruler) {
    emit('locate', rulerUnit(unitAt(x, g), g.snap, g.total))
    return
  }
  if (press.lyric) {
    if (!press.started && Math.abs(x - press.x) < MOVE_THRESHOLD_PX) return
    press.started = true
    const delta = Math.round((unitAt(x, g) - press.lyric.origin) / g.snap) * g.snap
    lyricDrag.value = { ...press.lyric, delta }
    return
  }
  if (press.started) followEdge(event)
  if (!press.started && Math.hypot(x - press.x, y - press.y) < MOVE_THRESHOLD_PX) return
  press.started = true
  if (press.keep) {
    band.value = {
      x0: press.x,
      y0: press.y,
      x1: x,
      y1: y,
      from: press.from,
      keep: press.keep.notes,
      keepChords: press.keep.chords.map((c) => c.id)
    }
  } else if (press.start) {
    const before = drag.value
    const next = dragTo(press.start, unitAt(x, g), pitchAt(y, g), g, { alt: event.altKey })
    // a note moved to another pitch is heard there
    if (next.kind === 'move' && next.semitones !== (before?.kind === 'move' ? before.semitones : 0)) hear(next.anchor.pitch + next.semitones)
    drag.value = next
  }
}

async function commit(operation: ScoreOperation): Promise<void> {
  committing.value = true
  try {
    await props.operate(operation)
  } finally {
    committing.value = false
    drag.value = null
  }
}

function onPointerUp(): void {
  const current = press
  press = null
  if (!current || current.ruler) return
  if (current.lyric) {
    const dragged = lyricDrag.value
    lyricDrag.value = null
    if (current.started && dragged?.delta) emit('lyricPlace', lyricMoves(dragged))
    return
  }
  if (!current.started) {
    drag.value = null
    if (current.insert && current.start?.kind === 'draw' && geo.value) {
      // draw mode: a click inserts a note of the last drawn length (a beat at first)
      const g = geo.value
      const length = Math.min(lastLength.value ?? g.drawLength, g.total - current.start.start)
      void commit({ op: 'insert_note', track: current.start.track, onset: current.start.start, duration: length, pitch: current.start.pitch })
      return
    }
    if (current.clear) select([])
    return
  }
  if (current.keep) {
    const ids = banded.value?.ids ?? new Set<string>()
    const chordIds = banded.value?.chords ?? new Set(current.keep.chords.map((c) => c.id))
    band.value = null
    select(selectionFor(notes.value.filter((n) => ids.has(n.id)), chords.value.filter((c) => chordIds.has(c.id))))
    return
  }
  const finished = drag.value
  const operation = finished ? dragOp(finished, props.resizeMode) : null
  if (!operation) {
    drag.value = null
    return
  }
  if (finished?.kind === 'draw') lastLength.value = finished.end - finished.start
  else if (finished?.kind === 'resize') lastLength.value = finished.end - finished.note.onset
  void commit(operation)
}

function onPointerCancel(): void {
  press = null
  drag.value = null
  band.value = null
  lyricDrag.value = null
}

function onDoubleClick(event: MouseEvent): void {
  const g = geo.value
  if (!g) return
  const [x, y] = local(event)
  const hit = hitTest(x, y, notes.value, chords.value, g, track.value, scrollTop.value, scrollLeft.value)
  if (hit.area === 'lyrics') {
    // the lyrics may be edited where the score may not (they can belong to this sheet)
    if (props.lyricsEditable) startLyricEdit(hit.unit)
    return
  }
  if (!editable.value) return
  if (hit.area === 'grid') {
    if (mode.value !== 'draw') return // select mode draws nothing
    const onset = Math.min(snapFloor(hit.unit, g.snap), g.total - 1)
    const duration = Math.min(g.drawLength, g.total - onset)
    void commit({ op: 'insert_note', track: track.value, onset, duration, pitch: hit.pitch })
  } else if (hit.area === 'lane' || hit.area === 'chord') {
    const chord = hit.area === 'chord' ? hit.chord : null
    const onset = hit.area === 'chord' ? hit.chord.onset : Math.min(snapFloor(hit.unit, g.snap), g.total - 1)
    chordEdit.value = { onset, name: chord?.name ?? '', original: chord?.name ?? null }
    void nextTick(() => {
      chordInput.value?.focus()
      chordInput.value?.select()
    })
  }
}

function commitChord(): void {
  const edit = chordEdit.value
  chordEdit.value = null
  root.value?.focus({ preventScroll: true })
  if (!edit) return
  const name = edit.name.trim()
  if (name === (edit.original ?? '')) return
  if (!name) {
    if (edit.original !== null) void commit({ op: 'delete_chord', onset: edit.onset })
    return
  }
  void commit({ op: 'put_chord', onset: edit.onset, name })
}

function cancelChord(): void {
  chordEdit.value = null
  root.value?.focus({ preventScroll: true })
}

function onKey(event: KeyboardEvent): void {
  const target = event.target as HTMLElement | null
  if (target?.closest('input, select, textarea')) return
  const g = geo.value
  if (!g) return
  if (lyricSelection.value.length && !event.ctrlKey && !event.metaKey) {
    // the selected lyrics lines: Del deletes them, the arrows move them by the grid, Esc lets them go
    const step = event.key === 'ArrowLeft' ? -g.snap : event.key === 'ArrowRight' ? g.snap : 0
    if (event.key === 'Delete' || event.key === 'Backspace' || step || event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      if (event.key === 'Escape') lyricSelection.value = []
      else if (!props.lyricsEditable) return
      else if (step) emit('lyricPlace', lyricMoves({ kind: 'move', key: '', keys: [...lyricSelection.value], origin: 0, delta: step }))
      else emit('lyricDelete', [...lyricSelection.value])
      return
    }
  }
  if (event.key === 'Escape') {
    if (press || drag.value || band.value) onPointerCancel()
    else if (props.selection.length) select([])
    else return
    event.preventDefault()
    event.stopPropagation()
    return
  }
  const lower = event.key.toLowerCase()
  if ((lower === 'g' || lower === 'h') && !event.ctrlKey && !event.metaKey && !event.altKey) {
    // Cubase: G zooms out, H zooms in (around the cursor); with Shift vertically
    event.preventDefault()
    event.stopPropagation()
    if (event.shiftKey) zoomRows(lower === 'h' ? 2 : -2)
    else zoomBy(lower === 'h' ? 1.25 : 1 / 1.25)
    return
  }
  if (lower === 'q' && !event.ctrlKey && !event.metaKey && !event.altKey) {
    // Cubase: Q quantizes the selected notes (all notes when none is selected) to the grid; Shift: lengths too
    event.preventDefault()
    event.stopPropagation()
    quantize(event.shiftKey)
    return
  }
  if (event.key.toLowerCase() === 'a' && (event.ctrlKey || event.metaKey) && !event.altKey) {
    // all notes of both voices and all chord symbols (Cubase: Select All)
    event.preventDefault()
    event.stopPropagation()
    select(selectionFor(notes.value, chords.value))
    return
  }
  const selected = notes.value.filter((n) => selectedNotes.value.has(n.id))
  const selectedChordList = chords.value.filter((c) => selectedChords.value.has(c.id))
  const operation = keyOp(
    event.key,
    { shift: event.shiftKey, alt: event.altKey },
    selected,
    selectedChordList,
    g,
    props.resizeMode
  )
  if (operation === undefined) return
  event.preventDefault()
  event.stopPropagation()
  if (operation && editable.value) void commit(operation)
}

function onScroll(): void {
  scrollLeft.value = scroller.value?.scrollLeft ?? 0
  scrollTop.value = scroller.value?.scrollTop ?? 0
  viewportWidth.value = scroller.value?.clientWidth ?? 0
  viewportHeight.value = scroller.value?.clientHeight ?? 0
}

/** Open on the notes: centre their range vertically (once per score shown). */
function centre(): void {
  const g = geo.value
  const el = scroller.value
  if (centred || !g || !el || !el.clientHeight) return
  centred = true
  el.scrollTop = scrollTopFor(g, el.clientHeight, g.focus[0], g.focus[1])
  onScroll()
}

/**
 * Scroll so that the (first) selected or playing note is visible - along the bars and in pitch. While
 * the playback line runs, it decides the bars (``alongBars`` false) and a note only scrolls the pitch.
 */
function reveal(ids: Set<string>, alongBars = true): void {
  const g = geo.value
  const el = scroller.value
  const note = notes.value.find((n) => ids.has(n.id))
  if (!g || !el || !note || !el.clientWidth) return
  const x = xOf(note.onset, g)
  if (alongBars && (x < el.scrollLeft + KEYS_WIDTH || x > el.scrollLeft + el.clientWidth - 40)) {
    el.scrollLeft = Math.max(0, x - el.clientWidth / 3)
  }
  const top = el.clientHeight ? scrollTopToShow(g, el.scrollTop, el.clientHeight, note.pitch) : null
  if (top !== null) el.scrollTop = top
  onScroll()
}

/**
 * Zoom along the bars, keeping the point at ``clientX`` (default: the cursor, else the middle of the
 * pane) where it is on the screen.
 */
function zoomBy(factor: number, clientX?: number): void {
  const el = scroller.value
  const g = geo.value
  const next = Math.max(12, Math.min(240, Math.round(zoom.value * factor)))
  if (next === zoom.value) return
  if (!el || !g) {
    zoom.value = next
    return
  }
  const box = el.getBoundingClientRect()
  const cursorX = props.locator !== null ? xOf(props.locator, g) - el.scrollLeft : null
  const offset =
    clientX !== undefined ? clientX - box.left : cursorX !== null && cursorX >= KEYS_WIDTH && cursorX <= el.clientWidth ? cursorX : el.clientWidth / 2
  const unit = unitAt(el.scrollLeft + offset, g)
  zoom.value = next
  void nextTick(() => {
    const after = geo.value
    if (!after) return
    el.scrollLeft = Math.max(0, xOf(unit, after) - offset)
    onScroll()
  })
}

/**
 * Ctrl+wheel (Cmd+wheel): zoom along the bars around the pointer, never the page (DAWs do so);
 * Alt+wheel or Ctrl+Shift+wheel: zoom the rows.
 */
function onWheel(event: WheelEvent): void {
  const delta = event.deltaY || event.deltaX
  if (event.altKey || ((event.ctrlKey || event.metaKey) && event.shiftKey)) {
    event.preventDefault()
    zoomRows(delta < 0 ? 1 : -1, event.clientY)
    return
  }
  if (!event.ctrlKey && !event.metaKey) return
  event.preventDefault()
  zoomBy(delta < 0 ? 1.15 : 1 / 1.15, event.clientX)
}

/** The rows taller or lower by ``step`` pixels, keeping the pitch at ``clientY`` (default: the middle) in place. */
function zoomRows(step: number, clientY?: number): void {
  const el = scroller.value
  const g = geo.value
  const next = Math.max(ROW_MIN, Math.min(ROW_MAX, rowHeight.value + step))
  if (next === rowHeight.value) return
  if (!el || !g) {
    rowHeight.value = next
    return
  }
  const box = el.getBoundingClientRect()
  const offset = clientY !== undefined ? clientY - box.top : el.clientHeight / 2
  const pitch = g.high - (el.scrollTop + offset - g.top) / g.rowHeight
  rowHeight.value = next
  void nextTick(() => {
    const after = geo.value
    if (!after) return
    el.scrollTop = Math.max(0, after.top + (after.high - pitch) * after.rowHeight - offset)
    onScroll()
  })
}

/** Q: the selected notes (all when none is) on the snap grid; ``lengths``: their lengths too. */
function quantize(lengths: boolean): void {
  const g = geo.value
  if (!g || !editable.value) return
  const picked = selectedNotes.value.size ? notes.value.filter((n) => selectedNotes.value.has(n.id)) : notes.value
  if (!picked.length) return
  void commit({ op: 'quantize', ids: picked.map((n) => n.id), grid: g.snap, lengths })
}

/** The source's waveform of the visible bars: one path per bar, scaled to the recording's peak. */
const sourcePeak = computed(() => {
  const envelope = props.source?.envelope
  if (!envelope) return 1
  let peak = 0
  for (let i = 0; i < envelope.max.length; i++) peak = Math.max(peak, envelope.max[i], -envelope.min[i])
  return peak || 1
})
/** The sung pitch over the visible bars: one path per unbroken run. */
const sungPaths = computed(() => {
  const g = geo.value
  const m = model.value
  const sung = props.sung
  if (!g || !m || !sung?.curve || !sungVisible.value) return []
  const [from, to] = window_.value
  let first = 0
  let last = m.measures.length - 1
  m.measures.forEach((measure, index) => {
    if (measure.onset + measure.length < from) first = index + 1
    if (measure.onset <= to) last = index
  })
  const y = (midi: number): number => g.top + (g.high - midi) * g.rowHeight + g.rowHeight / 2
  return curveRuns(m, sung.bars, sung.curve, first, last, sung.offset).map((run, index) => ({
    key: `c${first}-${index}`,
    d: run.map(([unit, midi], i) => `${i ? 'L' : 'M'}${xOf(unit, g).toFixed(1)} ${y(midi).toFixed(1)}`).join('')
  }))
})
const sungLabel = computed(() => {
  const offset = props.sung?.offset ?? 0
  if (!offset) return 'sung'
  const octaves = Math.abs(offset / 12)
  return `sung ${offset > 0 ? '+' : '−'}${octaves > 1 ? octaves : ''}8va`
})
const sungTitle = computed(() => {
  const sung = props.sung
  if (!sung) return ''
  if (sung.problem) return `No sung pitch: ${sung.problem}`
  const offset = sung.offset
  const moved = offset
    ? ` - drawn ${Math.abs(offset / 12)} octave${Math.abs(offset) > 12 ? 's' : ''} ${offset > 0 ? 'higher' : 'lower'} than sung, where the transcription writes the melody`
    : ''
  return `The source's sung pitch over the notes (node Sung Pitch)${moved}`
})
const sourceWave = computed(() => {
  const g = geo.value
  const m = model.value
  const source = props.source
  if (!g || !m || !source || g.sourceTop === null) return []
  const middle = g.sourceTop + SOURCE_LANE / 2
  const scale = (SOURCE_LANE / 2 - 3) / sourcePeak.value
  const paths: { key: string; d: string; missing: boolean; x: number; width: number }[] = []
  m.measures.forEach((measure, index) => {
    if (!inWindow(measure.onset, measure.onset + measure.length)) return
    const x = xOf(measure.onset, g)
    const width = measure.length * g.pxPerUnit
    const bar = source.bars?.[index]
    if (!bar) {
      paths.push({ key: `w${index}`, d: '', missing: true, x, width })
      return
    }
    const columns = Math.max(1, Math.floor(width / 2))
    const parts: string[] = []
    waveColumns(source.envelope, bar[0], bar[1], columns).forEach(([low, high], c) => {
      const cx = (x + (c + 0.5) * (width / columns)).toFixed(1)
      parts.push(`M${cx} ${(middle - high * scale - 0.5).toFixed(1)}V${(middle - low * scale + 0.5).toFixed(1)}`)
    })
    paths.push({ key: `w${index}`, d: parts.join(''), missing: false, x, width })
  })
  return paths
})

/** Page along the bars when ``unit`` (the playback line or a cursor set elsewhere) leaves the view. */
function revealUnit(unit: number | null): void {
  const g = geo.value
  const el = scroller.value
  if (unit === null || !g || !el || !el.clientWidth) return
  const x = xOf(unit, g)
  if (x >= el.scrollLeft + KEYS_WIDTH && x <= el.scrollLeft + el.clientWidth - 24) return
  el.scrollLeft = Math.max(0, x - KEYS_WIDTH - 24)
  onScroll()
}

watch(selectedNotes, (ids) => reveal(ids))
watch(playingNotes, (ids) => {
  // while a take is recorded, the played keys decide the rows (below), not the notes playing along
  if (props.recorded && props.playhead !== null) return
  if (follow.value || props.playhead === null) reveal(ids, props.playhead === null)
})
watch(
  () => props.playhead,
  (unit) => {
    if (follow.value) revealUnit(unit)
  }
)
watch(() => props.locator, revealUnit)
// a recorded key out of the view: the roll scrolls to its pitch (the playback line pages along the bars)
watch(
  () => props.recorded?.notes.at(-1)?.pitch,
  (pitch) => {
    const g = geo.value
    const el = scroller.value
    if (pitch === undefined || !g || !el?.clientHeight) return
    const top = scrollTopToShow(g, el.scrollTop, el.clientHeight, pitch)
    if (top === null) return
    el.scrollTop = top
    onScroll()
  }
)
// the scroller exists only while there is a model: centre when it appears (a new or repaired score)
watch(
  () => !!model.value,
  (present) => {
    if (!present) centred = false
    else void nextTick(centre)
  }
)

onMounted(() => {
  onScroll()
  centre()
  if (scroller.value && typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(() => {
      onScroll()
      centre()
    })
    observer.observe(scroller.value)
  }
})
onBeforeUnmount(() => observer?.disconnect())
defineExpose({ zoomBy, zoomRows })
</script>

<template>
  <div
    ref="root"
    class="roll"
    :class="{ stale, readonly, [`mode-${mode}`]: true }"
    tabindex="0"
    role="application"
    :aria-label="
      mode === 'draw'
        ? 'Piano roll, draw mode: drag to draw a note, drag a note to move it, drag its end to change its length'
        : 'Piano roll, select mode: drag a frame to select the notes in it, drag a selected note to move them all'
    "
    @keydown="onKey"
  >
    <div class="roll-tools" role="toolbar" aria-label="Piano roll">
      <span class="group" role="group" aria-label="Mode">
        <button
          class="mode draw"
          :class="{ active: mode === 'draw' }"
          :aria-pressed="mode === 'draw'"
          title="Draw notes: a drag on the empty grid draws a note"
          @click="mode = 'draw'"
        >
          <svg class="icon" viewBox="0 0 14 14" aria-hidden="true"><path d="M2.5 11.5 3 9 9.5 2.5l2 2L5 11z M8.5 3.5l2 2" /></svg>
          Draw
        </button>
        <button
          class="mode select"
          :class="{ active: mode === 'select' }"
          :aria-pressed="mode === 'select'"
          title="Select notes: a drag on the empty grid pulls a frame, every note it touches is selected (Shift: add)"
          @click="mode = 'select'"
        >
          <svg class="icon" viewBox="0 0 14 14" aria-hidden="true"><rect x="2" y="3" width="10" height="8" stroke-dasharray="2 1.5" /></svg>
          Select
        </button>
      </span>
      <span class="group" role="group" aria-label="Draw into">
        draw into
        <button :class="{ active: track === 'vocal' }" class="vocal" :aria-pressed="track === 'vocal'" @click="track = 'vocal'">
          Vocal
        </button>
        <button :class="{ active: track === 'ins' }" class="ins" :aria-pressed="track === 'ins'" @click="track = 'ins'">
          Ins
        </button>
      </span>
      <label title="Grid for drawing, moving and resizing">
        snap
        <select v-model="snapChoice" aria-label="Snap">
          <option value="auto">auto ({{ snapChoice === 'auto' ? snapLabel : 'score' }})</option>
          <option :value="4">1/4</option>
          <option :value="8">1/8</option>
          <option :value="16">1/16</option>
          <option :value="32">1/32</option>
        </select>
      </label>
      <span class="group clip-tools" role="group" aria-label="Clipboard">
        <button
          :disabled="!selection.length"
          title="Copy the selected notes and chord symbols (Ctrl+C)"
          @click="emit('clipboard', 'copy')"
        >
          Copy
        </button>
        <button
          :disabled="!selection.length || !editable"
          title="Cut: copy the selection, its notes become rests (Ctrl+X)"
          @click="emit('clipboard', 'cut')"
        >
          Cut
        </button>
        <button
          :disabled="!clip || !editable || locator === null"
          :title="
            clip
              ? `Paste ${clip} at the cursor, replacing what its voices play there (Ctrl+V)`
              : 'Paste at the cursor (Ctrl+V) - copy notes, chord symbols or sections first'
          "
          @click="emit('clipboard', 'paste')"
        >
          Paste
        </button>
        <button
          :disabled="!clip || !editable || locator === null"
          :title="
            clip
              ? `Insert ${clip} at the cursor: everything from the cursor on moves later by whole bars (Ctrl+Shift+V; Cubase: Paste Time)`
              : 'Insert at the cursor, moving what follows (Ctrl+Shift+V) - copy notes, chord symbols or sections first'
          "
          @click="emit('clipboard', 'insert')"
        >
          Insert
        </button>
      </span>
      <label title="Hear a note's pitch when it is drawn, grabbed or moved, and a key of the keyboard when it is clicked">
        <input v-model="audition" type="checkbox" aria-label="Hear the notes you edit" /> hear
      </label>
      <button
        :disabled="!editable"
        :title="`Quantize (Q): the selected notes - all notes when none is selected - to the grid (${snapLabel}); Shift+Q: their lengths too`"
        @click="quantize(false)"
      >
        Q
      </button>
      <span class="group" role="group" aria-label="Zoom">
        <button title="Zoom out along the bars (G, Ctrl+wheel)" aria-label="Zoom out" @click="zoomBy(1 / 1.25)">−</button>
        <button title="Zoom in along the bars (H, Ctrl+wheel)" aria-label="Zoom in" @click="zoomBy(1.25)">+</button>
        <button title="Lower rows (Shift+G, Alt+wheel)" aria-label="Lower rows" @click="zoomRows(-2)">↕−</button>
        <button title="Taller rows (Shift+H, Alt+wheel)" aria-label="Taller rows" @click="zoomRows(2)">↕+</button>
      </span>
      <label v-if="source" title="The source recording's waveform in a lane over the roll (untick it for a cover far from the original)">
        <input v-model="waveVisible" type="checkbox" aria-label="Show the source's waveform" /> wave
      </label>
      <label v-if="sung" :title="sungTitle" :class="{ unavailable: !!sung.problem }">
        <input v-model="sungVisible" type="checkbox" :disabled="!!sung.problem" aria-label="Show the sung pitch" /> {{ sungLabel }}
      </label>
      <label title="The roll pages along with the playback line">
        <input v-model="follow" type="checkbox" aria-label="Follow the playback" /> follow
      </label>
      <span class="hint">{{ hint }}{{ lyricsHint }}</span>
    </div>
    <p v-if="!model && view?.model_error" class="roll-note">{{ view.model_error.message }}</p>
    <div
      v-else-if="model && geo"
      ref="scroller"
      class="roll-scroll"
      :style="{ height: `${Math.min(height, geo.height + 16)}px` }"
      @scroll="onScroll"
      @wheel="onWheel"
    >
      <svg
        ref="svg"
        class="roll-svg"
        :width="geo.width"
        :height="geo.height"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerCancel"
        @dblclick="onDoubleClick"
      >
        <rect
          v-for="pitch in rows"
          :key="'row' + pitch"
          class="row"
          :class="{ black: isBlackKey(pitch), c: pitch % 12 === 0 }"
          :x="0"
          :y="yOf(pitch, geo)"
          :width="geo.width"
          :height="geo.rowHeight"
        />
        <line
          v-for="line in visibleLines"
          :key="'l' + line.unit"
          :class="line.kind"
          :x1="xOf(line.unit, geo)"
          :x2="xOf(line.unit, geo)"
          :y1="geo.top"
          :y2="geo.height"
        />
        <rect v-for="note in visibleNotes" :key="note.id" :class="noteClasses(note)" v-bind="noteRect(note, geo)" rx="2">
          <title>{{ describeNote(note) }}</title>
        </rect>
        <text v-for="item in noteNames" :key="'p' + item.key" class="note-name" :x="item.x" :y="item.y">{{ item.text }}</text>
        <text v-for="item in visibleSyllables" :key="'y' + item.key" class="syllable" :x="item.x" :y="item.y">{{ item.text }}</text>
        <path v-for="path in sungPaths" :key="path.key" class="sung-pitch" :d="path.d" />
        <template v-if="recorded">
          <rect
            v-for="(note, index) in recorded.notes"
            :key="'rec' + index"
            class="rec-note"
            v-bind="noteRect({ onset: note.onset, duration: Math.max(note.duration, 0.5), pitch: note.pitch }, geo)"
            rx="2"
          />
        </template>
        <rect v-for="(ghost, index) in ghostNotes" :key="'ghost' + index" class="ghost" :class="ghost.track" v-bind="noteRect(ghost, geo)" rx="2" />
        <rect v-if="banded && banded.rect.height > 0" class="band" v-bind="banded.rect" />
        <line v-if="locator !== null" class="locator" :x1="xOf(locator, geo)" :x2="xOf(locator, geo)" :y1="geo.top" :y2="geo.height" />
        <line v-if="playhead !== null" class="playhead" :x1="xOf(playhead, geo)" :x2="xOf(playhead, geo)" :y1="geo.top" :y2="geo.height" />
        <g class="keys" :transform="`translate(${scrollLeft} 0)`">
          <rect class="keys-bg" :x="0" :y="geo.top" :width="KEYS_WIDTH - 2" :height="geo.height - geo.top">
            <title>Click a key to hear its pitch</title>
          </rect>
          <text
            v-for="pitch in rows.filter((p) => p % 12 === 0)"
            :key="'k' + pitch"
            class="key-label"
            :x="4"
            :y="yOf(pitch, geo) + geo.rowHeight - 2"
          >
            {{ pitchLabel(pitch) }}
          </text>
        </g>
        <!-- the header (bar numbers, sections) and the chord lane stay on top while the pane scrolls -->
        <g class="roll-top" :transform="`translate(0 ${scrollTop})`">
          <rect class="top-bg" :x="0" :y="0" :width="geo.width" :height="geo.top" />
          <rect class="ruler" :x="KEYS_WIDTH" :y="0" :width="geo.width - KEYS_WIDTH" :height="HEADER">
            <title>Click or drag here to set the cursor - playback and paste start there</title>
          </rect>
          <rect class="lane" :x="0" :y="HEADER" :width="geo.width" :height="LANE" />
          <template v-if="source && geo.sourceTop !== null">
            <rect class="source-lane" :x="0" :y="geo.sourceTop" :width="geo.width" :height="SOURCE_LANE">
              <title>The source recording, bar by bar where the transcription puts it - click to set the cursor</title>
            </rect>
            <template v-for="wave in sourceWave" :key="wave.key">
              <rect v-if="wave.missing" class="source-missing" :x="wave.x" :y="geo.sourceTop + 2" :width="wave.width" :height="SOURCE_LANE - 4">
                <title>A bar the source does not have (inserted): silent while the source plays</title>
              </rect>
              <path v-else class="source-wave" :d="wave.d" />
            </template>
            <text class="source-label" :x="scrollLeft + 3" :y="geo.sourceTop + 11">source</text>
          </template>
          <template v-if="lyrics">
            <rect class="lyrics-lane" :x="0" :y="TOP" :width="geo.width" :height="LYRICS_LANE" />
            <g
              v-for="line in lyricLines"
              :key="line.key"
              class="lyric-line"
              :class="{ unsung: !line.syllables.length, selected: line.selected, dragged: line.dragged }"
            >
              <rect :x="line.x" :y="TOP + 3" :width="line.width" :height="LYRICS_LANE - 6" rx="3" />
              <rect v-if="lyricsEditable" class="edge" :x="line.x + line.width - 3" :y="TOP + 5" :width="3" :height="LYRICS_LANE - 10" />
              <text :x="line.x + 4" :y="TOP + LYRICS_LANE / 2 + 4">{{ line.shown }}</text>
              <title>
                {{ line.text }}{{
                  lyricsEditable ? ' - click: select · drag: move · drag its start or end: longer / shorter · double-click: edit the words' : ''
                }}
              </title>
            </g>
          </template>
          <line
            v-for="line in visibleLines.filter((l) => l.kind === 'bar')"
            :key="'t' + line.unit"
            class="bar"
            :x1="xOf(line.unit, geo)"
            :x2="xOf(line.unit, geo)"
            :y1="0"
            :y2="geo.top"
          />
          <text v-for="line in visibleLines.filter((l) => l.bar)" :key="'n' + line.unit" class="bar-number" :x="xOf(line.unit, geo) + 3" :y="12">
            {{ line.bar }}
          </text>
          <text v-for="section in sectionStarts" :key="'s' + section.unit" class="section-label" :x="xOf(section.unit, geo) + 22" :y="12">
            {{ section.label }}
          </text>
          <g
            v-for="{ chord, next } in visibleChords"
            :key="chord.id"
            class="chord"
            :class="{
              selected: (banded?.chords ?? selectedChords).has(chord.id),
              dragged: drag?.kind === 'chord' && drag.chord.id === chord.id
            }"
          >
            <rect :x="xOf(chord.onset, geo)" :y="HEADER + 3" :width="chordWidth(chord, next, geo)" :height="LANE - 6" rx="3" />
            <text :x="xOf(chord.onset, geo) + 4" :y="HEADER + LANE / 2 + 4">{{ chord.name }}</text>
            <title>chord {{ chord.name }} - drag to move, double-click to rename, Delete to remove</title>
          </g>
          <g v-if="drag?.kind === 'chord'" class="chord ghost">
            <rect :x="xOf(drag.to, geo)" :y="HEADER + 3" :width="chordWidth(drag.chord, undefined, geo)" :height="LANE - 6" rx="3" />
            <text :x="xOf(drag.to, geo) + 4" :y="HEADER + LANE / 2 + 4">{{ drag.chord.name }}</text>
          </g>
          <rect v-if="banded?.lane && banded.rect.width > 0" class="band" :x="banded.rect.x" :y="HEADER" :width="banded.rect.width" :height="LANE" />
          <line v-if="playhead !== null" class="playhead" :x1="xOf(playhead, geo)" :x2="xOf(playhead, geo)" :y1="0" :y2="geo.top" />
          <g v-if="locator !== null" class="locator-mark" :transform="`translate(${xOf(locator, geo)} 0)`">
            <line :x1="0" :x2="0" :y1="0" :y2="geo.top" />
            <path d="M-5 0 H5 L0 7 Z" />
            <title>Cursor at {{ position }} - click or drag in the ruler to move it</title>
          </g>
        </g>
      </svg>
      <input
        v-if="chordEdit"
        ref="chordInput"
        v-model="chordEdit.name"
        class="chord-edit"
        aria-label="Chord symbol (empty removes it)"
        placeholder="Am7"
        :style="{ left: `${xOf(chordEdit.onset, geo)}px`, top: `${HEADER + 1 + scrollTop}px` }"
        @keydown.enter.prevent="commitChord"
        @keydown.esc.prevent.stop="cancelChord"
        @blur="cancelChord"
      />
      <input
        v-if="lyricEdit"
        ref="lyricInput"
        v-model="lyricEdit.text"
        class="lyric-edit"
        aria-label="Lyrics line (empty removes it)"
        placeholder="the words of this phrase"
        :style="{ left: `${xOf(lyricEdit.start, geo)}px`, top: `${TOP + 1 + scrollTop}px` }"
        @keydown.enter.prevent="commitLyric"
        @keydown.esc.prevent.stop="cancelLyric"
        @blur="commitLyric"
      />
    </div>
  </div>
</template>
