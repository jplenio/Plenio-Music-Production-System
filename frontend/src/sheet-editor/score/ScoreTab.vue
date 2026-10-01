<script setup lang="ts">
/**
 * The Score tab of the Song Sheet editor: piano roll, notation, inspector, ABC text, navigator,
 * operations, playback and validation for one score document. It knows nothing about templates
 * or engines - only the native score dialect and the backend's operations. The piano roll, the
 * staff, the inspector and the ABC text share one selection (element ids of written segments;
 * the roll and the inspector map them to canonical notes) and every edit goes through the one
 * score session.
 *
 * Layouts (plan §10.3): *review* - piano roll, notation, inspector, navigator (lyrics fit), the
 * ABC text under *Advanced*; *text* - the ABC text and the notation. A sheet opens in the layout
 * of its node property ``plenio_editor_layout`` (a template's choice), else in the viewer's last.
 *
 * The cursor (``locator``, units of L - Cubase: project cursor) is where playback starts and where a
 * clip is pasted. The roll's ruler sets it, a section or bar in the navigator puts it at the bar's
 * start, Home / End at the start / end of the score; without the roll it follows the selected bar.
 *
 * The clipboard (Cubase: key editor; docs/design/score-arrange-design.md §3) works wherever the score
 * has the focus and no text field does: Ctrl+C / Ctrl+X copy / cut the selected notes and chord
 * symbols, Ctrl+V pastes at the cursor overwriting, Ctrl+Shift+V inserts at the cursor (Paste Time:
 * what follows moves later by whole bars), Ctrl+D duplicates the selection right after itself. A
 * read-only score can be copied from.
 *
 * The lyrics (``lyrics``) go with the score to the backend, which says where they are sung: the roll
 * shows them over the Vocal phrases and the notation under the notes. With ``lyricsTarget`` they can
 * be edited in the roll's lyrics lane, and when they matched the score's sections every arrangement
 * lays them onto the new sections (a copied chorus copies its words, see ``lyricsFollow``).
 * ``lyricsChange`` reports them: the dialog writes them into their sheet on Apply (*Song Sheet · Text*)
 * or at once into its own Lyrics tab (``own``). Like the Guide notes, they are part of the undo steps.
 *
 * Files: *Export MIDI* and *Import MIDI…* (the score and the Guide notes), *Export MusicXML* (the sheet
 * music with the lyrics, for notation programs) and the project file - *Save project* writes the score,
 * the Guide notes and the lyrics into one file, *Open project…* brings them back (one undo step).
 */
import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue'

import {
  type Fetcher,
  type GuideNote,
  type MidiImportResult,
  type ScoreOperation,
  exportMidi,
  exportMusicXml,
  viewUrl
} from '../../api/client'
import type { VoiceSwitches } from '../../shared/playback'
import {
  type ModelChord,
  type ModelNote,
  describe,
  elementAtSource,
  elementById,
  firstElementOfBar,
  neighbour,
  nextDuration,
  otherVoice
} from '../../shared/scoreView'
import { type SheetPayload, type WorkingDoc, normalize } from '../../shared/sheetSession'
import LyricsFit from '../LyricsFit.vue'
import AbcEditor from './AbcEditor.vue'
import Inspector from './Inspector.vue'
import MidiDialog from './MidiDialog.vue'
import NotationView from './NotationView.vue'
import PianoRoll from './PianoRoll.vue'
import ScoreNavigator from './ScoreNavigator.vue'
import ScorePalette from './ScorePalette.vue'
import ScoreTransport from './ScoreTransport.vue'
import TrackPanel from './TrackPanel.vue'
import { type Layout, focusOf, initialLayout } from './inspector'
import { downloadBytes, fromBase64, toBase64 } from './midiImport'
import { loadPrefs, savePrefs } from './prefs'
import {
  NOTATION_MAX,
  NOTATION_MIN,
  ROLL_MAX,
  ROLL_MIN,
  SIDE_MAX,
  SIDE_MIN,
  beginDrag,
  rollHeightAfter,
  shareAfter,
  shareValue,
  sideWidthAfter
} from '../paneSizes'
import { type ClipAction, clipOfSelection, clipboard, pasteOperation } from './clipboard'
import {
  type LyricBlock,
  type LyricsFollow,
  type LyricsTarget,
  followEdit,
  followOf,
  followReplace,
  followText,
  parseLyrics,
  replaceLine
} from './lyricsFollow'
import type { LyricEdit } from './PianoRoll.vue'
import { barOfUnit, positionLabel, secondsOfUnit, unitOfBar, unitOfSeconds } from './locator'
import { selectedChordIds, selectedNoteIds } from './pianoRoll'
import { type ScoreProject, PROJECT_EXTENSION, buildProject, parseProject, projectFilename } from './projectFile'
import { guideNotes, remapGuide, sameGuide } from './tracks'
import { describeError, useScoreSession } from './useScoreSession'

const props = defineProps<{
  doc: WorkingDoc
  fetcher: Fetcher
  payload: SheetPayload | null
  readonly: boolean
  /** The node's ``plenio_editor_layout`` (``review``, ``text``; ``daw`` opens *review* for now). */
  layoutDefault?: string | null
  /** The song's lyrics (this sheet's or the other sheet's), for the lyrics fit next to the sections. */
  lyrics?: string | null
  /** The sheet's title document: the MIDI export takes its file name from it. */
  title?: string | null
  /** The Guide notes kept in the node's properties; ``undefined``: this sheet keeps none. */
  guide?: GuideNote[]
  /** Where edited lyrics go (another sheet on Apply, or this sheet's Lyrics tab); ``null``: shown only. */
  lyricsTarget?: LyricsTarget | null
  /** The lyrics as they were when this tab was last closed (the dialog keeps them until Apply). */
  lyricsPending?: string | null
}>()
const emit = defineEmits<{
  edited: []
  /** The commit gate for ``text``: why it cannot be applied/approved (``null``: it can). */
  gate: [text: string, reason: string | null]
  /** The Guide notes an import brought in (stored in the node's properties). */
  guideChange: [guide: GuideNote[]]
  /** The lyrics as they are now - arranged with the sections, edited in the roll (``null``: none). */
  lyricsChange: [text: string | null]
}>()

/**
 * What else belongs to an undo step: the Guide notes (a MIDI import, bars that moved) and the lyrics
 * laid onto the sections. A step has only what it changed; undo and redo restore what is there.
 */
interface SideState {
  guide?: GuideNote[]
  /** The lyrics laid onto the sections (while they match them) ... */
  lyrics?: LyricsFollow | null
  /** ... or as a text of their own (when they do not). */
  looseLyrics?: string | null
}

function isSideState(value: unknown): value is SideState {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** The lyrics laid onto the score's sections while they match them ... */
const follow = shallowRef<LyricsFollow | null>(null)
/** ... else the lyrics as a text (edited line by line, not arranged). */
const loose = ref<string | null>(null)
/** The lyrics as they are now (``null``: nothing to edit; then ``lyrics`` is shown as it is). */
const lyricsNow = ref<string | null>(null)

/** The lyrics of the sections an *Insert* brings in: the ones copied with them. */
function insertedLyrics(operation: ScoreOperation): (unit: number) => LyricBlock | null {
  const sent = operation.op === 'paste' && operation.mode === 'insert' && Array.isArray(operation.sections) ? (operation.sections as { onset: number }[]) : []
  const at = typeof operation.at === 'number' ? operation.at : 0
  const clip = clipboard.value
  return (unit) => {
    let index = -1
    sent.forEach((section, i) => {
      if (section.onset <= unit - at) index = i
    })
    const block = index >= 0 ? clip?.sections[index]?.lyrics : null
    return block ? { tag: block.tag, lines: [...block.lines] } : null
  }
}

const session = useScoreSession(props.doc, {
  fetcher: props.fetcher,
  onEdit: () => emit('edited'),
  lyrics: () => lyricsNow.value ?? props.lyrics ?? null,
  // an undo or redo brings the Guide notes and the lyrics of that step back with its text
  onRestore: (extra) => {
    if (!isSideState(extra)) return
    if (Array.isArray(extra.guide) && props.guide !== undefined && !sameGuide(extra.guide, props.guide)) {
      emit('guideChange', [...extra.guide])
    }
    if ('lyrics' in extra) follow.value = extra.lyrics ?? null
    if ('looseLyrics' in extra) loose.value = extra.looseLyrics ?? null
  },
  // bars that moved (arranged sections, Insert at the cursor, inserted, deleted or duplicated bars)
  // take their Guide notes along, and the lyrics follow the sections - in the same undo step as the text
  onTransform: (result, operation) => {
    const before: SideState = {}
    const after: SideState = {}
    const guide = props.guide
    if (guide?.length && result.time_map?.length) {
      const moved = remapGuide(guide, result.time_map)
      if (!sameGuide(moved, guide)) {
        emit('guideChange', moved)
        before.guide = [...guide]
        after.guide = moved
      }
    }
    const lyrics = follow.value
    const from = shown.value?.model
    const to = result.analysis.model
    if (lyrics && from && to) {
      const next = followEdit(lyrics, from, to, result.time_map, insertedLyrics(operation))
      follow.value = next
      before.lyrics = lyrics
      after.lyrics = next
    }
    return Object.keys(after).length ? { before, after } : undefined
  }
})
watch(
  () => [props.doc.text, session.commitBlock] as const,
  ([text, reason]) => {
    if (!props.readonly) emit('gate', text, reason)
  },
  { immediate: true }
)
const prefs = ref(loadPrefs())
const layout = ref<Layout>(initialLayout(props.layoutDefault, prefs.value.layout))

function chooseLayout(value: Layout): void {
  layout.value = value
  prefs.value = { ...prefs.value, layout: value }
}
const cursor = ref<string[]>([])
/** The cursor in units of L, and where playback is (``null``: stopped). */
const locator = ref(0)
const playhead = ref<number | null>(null)
const revealRange = ref<[number, number] | null>(null)
const transport = ref<InstanceType<typeof ScoreTransport> | null>(null)

watch(prefs, (value) => savePrefs(value), { deep: true })
onBeforeUnmount(() => session.dispose())

const shown = computed(() => session.lastValid)
const invalid = computed(() => !!session.view && !session.view.ok)
const diagnostics = computed(() => session.view?.diagnostics ?? [])
const errorBars = computed(() =>
  diagnostics.value.filter((d) => d.severity === 'error' && d.bar).map((d) => d.bar as number)
)
/** The bar in focus: of the selected note, rest or chord symbol (roll, notation or inspector). */
const selectedBar = computed(
  () => focusOf(shown.value, session.selection, session.primary?.bar ?? null).measure?.n ?? session.primary?.bar ?? null
)
const review = computed(() => layout.value !== 'text')
const daw = computed(() => layout.value === 'daw')
const guide = computed(() => props.guide ?? [])
const guideSeconds = computed(() => guideNotes(props.guide, shown.value?.model))
/** The Guide notes are played with the score when the track panel's switch is on. */
const playGuide = computed(() => (daw.value ? (prefs.value.voices.guide ?? true) : false))
const transportGuide = computed(() => (playGuide.value ? guideSeconds.value : []))
const showRoll = computed(() => review.value && prefs.value.roll && !!(shown.value?.model || shown.value?.model_error))
const model = computed(() => shown.value?.model ?? null)
/** The cursor's bar (without a model - a score outside the editor's subset - the selected bar). */
const locatorBar = computed(() => (model.value ? barOfUnit(model.value, locator.value) : selectedBar.value))
const locatorSeconds = computed(() => (shown.value && model.value ? secondsOfUnit(shown.value, locator.value) : null))
const locatorLabel = computed(() => (model.value ? positionLabel(model.value, locator.value) : ''))
// a shorter score keeps the cursor inside it
watch(
  () => model.value?.total,
  (total) => {
    if (total !== undefined && locator.value > total) locator.value = total
  }
)
// --- the lyrics: shown where they are sung, edited in the roll, arranged with the sections ---
/** The text the lyrics state was started from (``lyrics``, or what this tab itself reported). */
let lyricsBase: string | null = null
let lyricsReported: string | null = null
/** The state is laid onto a model (until one is there, the text is used as it is). */
let lyricsLaid = false
watch(
  () => [props.lyricsTarget, props.lyrics, model.value] as const,
  ([target, lyrics, current]) => {
    if (!target || !lyrics?.trim()) {
      follow.value = null
      loose.value = null
      lyricsBase = null
      lyricsLaid = false
      return
    }
    const same = lyrics === lyricsBase || lyrics === lyricsReported
    lyricsBase = lyrics
    if (same && (lyricsLaid || !current)) {
      // an edit in the ABC text that changed the number of sections: the lyrics no longer follow them
      if (follow.value && current && follow.value.blocks.length !== current.sections.length) {
        loose.value = lyricsNow.value
        follow.value = null
      }
      return
    }
    const start = (!lyricsLaid && props.lyricsPending) || lyrics
    follow.value = current ? followOf(start, current) : null
    loose.value = follow.value ? null : start
    lyricsLaid = !!current
  },
  { immediate: true }
)
watch(
  [follow, loose, model],
  () => {
    const laid = follow.value
    const current = model.value
    // while an undo waits for its view the blocks and the sections differ: keep the last text
    if (laid) {
      if (current && laid.blocks.length === current.sections.length) lyricsNow.value = followText(laid, current)
    } else lyricsNow.value = loose.value
  },
  { immediate: true }
)
watch(
  lyricsNow,
  (text, previous) => {
    lyricsReported = text
    emit('lyricsChange', text)
    if (previous !== undefined && text !== previous) session.refreshLyrics()
  },
  { immediate: true }
)
const lyricsEditable = computed(
  () => !!props.lyricsTarget && !props.lyricsTarget.blocked && (!!props.lyricsTarget.own || !props.readonly)
)
const lyricsChanged = computed(
  () => !!lyricsNow.value && !props.lyricsTarget?.own && normalize(lyricsNow.value) !== normalize(props.lyrics ?? '')
)
const lyricsTags = computed(() => (lyricsNow.value ? parseLyrics(lyricsNow.value).blocks.map((b) => b.tag).join(' · ') : ''))
/** The lyrics the fit panel checks: as they will be written. */
const fitLyrics = computed(() => lyricsNow.value ?? props.lyrics ?? null)

function lyricsState(): SideState {
  return { lyrics: follow.value, looseLyrics: loose.value }
}

/** A line edited in the roll's lyrics lane: one undo step of its own. */
function onLyricEdit(edit: LyricEdit): void {
  const current = model.value
  const before = lyricsState()
  if (follow.value && current) follow.value = followReplace(follow.value, current, edit.section, edit.line, edit.text)
  else if (loose.value !== null) loose.value = replaceLine(loose.value, edit.block, edit.line, edit.text)
  else return
  if (!props.readonly) session.recordSide(`lyrics: ${edit.text || 'line removed'}`, before, lyricsState())
}

/** Back to the lyrics as their sheet has them (one undo step). */
function revertLyrics(): void {
  const base = props.lyrics
  const current = model.value
  if (!base) return
  const before = lyricsState()
  follow.value = current ? followOf(base, current) : null
  loose.value = follow.value ? null : base
  if (!props.readonly) session.recordSide('lyrics reverted', before, lyricsState())
}

// an opened project's lyrics follow the sections of its score when they match them
watch(model, (current) => {
  if (!relayLyrics || !current || loose.value === null) return
  relayLyrics = false
  const laid = followOf(loose.value, current)
  if (laid) {
    follow.value = laid
    loose.value = null
  }
})

// without the roll there is no ruler: the cursor follows the selected bar, as playback always did
watch(selectedBar, (bar) => {
  if (!showRoll.value && bar && model.value) locator.value = unitOfBar(model.value, bar)
})
const metronome = computed<boolean>({
  get: () => prefs.value.metronome,
  set: (value) => (prefs.value = { ...prefs.value, metronome: value })
})
const reference = computed(() => (props.payload?.reference_audio ? viewUrl(props.fetcher, props.payload.reference_audio) : null))
const timelineBars = computed(() => props.payload?.timeline?.bars)
const sourceStarts = computed(() => timelineBars.value?.map((bar) => bar[0]) ?? null)
const unit = computed(() => shown.value?.header?.unit ?? '1/16')
const voices = computed<VoiceSwitches>({
  get: () => prefs.value.voices,
  set: (value) => (prefs.value = { ...prefs.value, voices: value })
})
const speed = computed<number>({
  get: () => prefs.value.speed,
  set: (value) => (prefs.value = { ...prefs.value, speed: value })
})

function select(id: string, additive = false, from: 'notation' | 'text' | 'keys' = 'notation'): void {
  const ids = additive
    ? session.selection.includes(id)
      ? session.selection.filter((x) => x !== id)
      : [...session.selection, id]
    : [id]
  session.select(ids)
  const element = elementById(shown.value, ids[0])
  revealRange.value = from !== 'text' && element ? [element.source[0], element.source[1]] : revealRange.value
}

function onCursor(offset: number): void {
  if (!shown.value || invalid.value) return
  const element = elementAtSource(shown.value, offset)
  if (element) select(element.id, false, 'text')
}

function goto(bar: number): void {
  if (!shown.value) return
  if (shown.value.model) locator.value = unitOfBar(shown.value.model, bar)
  const element = firstElementOfBar(shown.value, bar)
  if (element) select(element.id, false, 'keys')
}

async function operate(operation: ScoreOperation): Promise<void> {
  if (props.readonly) return
  await session.operate(operation)
}

/** The piano roll's commit: one canonical operation; ``false`` when refused (the ghost goes away). */
function operateRoll(operation: ScoreOperation): Promise<boolean> {
  return props.readonly ? Promise.resolve(false) : session.operate(operation)
}

function selectFromRoll(ids: string[]): void {
  session.select(ids)
  const element = elementById(shown.value, ids[0])
  if (element) revealRange.value = [element.source[0], element.source[1]]
}

// --- the clipboard (Cubase: key editor) ---

/** The selected notes and chord symbols of the model (the roll, the staff and the inspector share the selection). */
function selectedEvents(): { notes: ModelNote[]; chords: ModelChord[] } {
  const m = model.value
  if (!m) return { notes: [], chords: [] }
  const noteIds = selectedNoteIds(shown.value, session.selection)
  const chordIds = selectedChordIds(session.selection)
  return {
    notes: [...m.tracks.vocal, ...m.tracks.ins].filter((n) => noteIds.has(n.id)),
    chords: m.tracks.chords.filter((c) => chordIds.has(c.id))
  }
}

function copySelection(): boolean {
  const m = model.value
  const events = selectedEvents()
  const clip = m ? clipOfSelection(m, events.notes, events.chords) : null
  if (!clip) {
    session.error = 'Select notes or chord symbols first (in the roll, the notation or the inspector).'
    return false
  }
  clipboard.value = clip
  session.error = null
  session.notes = [`copied ${clip.label} - Ctrl+V pastes it at the cursor, Ctrl+Shift+V inserts it there`]
  return true
}

async function onClipboard(action: ClipAction): Promise<void> {
  const m = model.value
  if (action === 'copy') {
    copySelection()
    return
  }
  if (props.readonly || !m) return
  if (action === 'cut') {
    const events = selectedEvents()
    if (!copySelection()) return
    await operate({ op: 'delete', ids: [...events.notes.map((n) => n.id), ...events.chords.map((c) => c.id)] })
    return
  }
  if (action === 'duplicate') {
    // Cubase: the copy goes right after the selection, the clipboard stays as it is
    const events = selectedEvents()
    const clip = clipOfSelection(m, events.notes, events.chords)
    if (!clip) {
      session.error = 'Select notes or chord symbols to duplicate first.'
      return
    }
    const start = Math.min(...events.notes.map((n) => n.onset), ...events.chords.map((c) => c.onset))
    const operation = pasteOperation(clip, m, start + clip.span, 'overwrite')
    if (typeof operation === 'string') session.error = 'There is no room after the selection to duplicate it.'
    else await operate(operation)
    return
  }
  const clip = clipboard.value
  if (!clip) {
    session.error = 'The clipboard is empty: copy notes, chord symbols or sections first.'
    return
  }
  const operation = pasteOperation(clip, m, locator.value, action === 'insert' ? 'insert' : 'overwrite')
  if (typeof operation === 'string') session.error = operation
  else await operate(operation)
}

/** The clipboard command of a key with Ctrl (Cmd) held, if it is one. */
function clipKey(event: KeyboardEvent): ClipAction | null {
  if (event.altKey) return null
  switch (event.key.toLowerCase()) {
    case 'c':
      return 'copy'
    case 'x':
      return 'cut'
    case 'v':
      return event.shiftKey ? 'insert' : 'paste'
    case 'd':
      return 'duplicate'
    default:
      return null
  }
}

function onPlayTime(seconds: number | null): void {
  playhead.value = seconds === null || !shown.value ? null : unitOfSeconds(shown.value, seconds)
}

function clearGuide(): void {
  if (props.readonly || !props.guide?.length) return
  emit('guideChange', [])
}

const rollZoom = computed<number>({
  get: () => prefs.value.rollZoom,
  set: (value) => (prefs.value = { ...prefs.value, rollZoom: value })
})

// --- pane sizes (owner's request, 2026-09-28): drag the roll, the notation split and the side column
const mainStyle = computed(() => ({
  '--plenio-side-w': `${prefs.value.sideWidth}px`,
  '--plenio-notation-fr': `${prefs.value.notationShare}fr`,
  '--plenio-text-fr': `${Math.round((1 - prefs.value.notationShare) * 1000) / 1000}fr`
}))

function startRollDrag(event: PointerEvent): void {
  event.preventDefault()
  const start = prefs.value.rollHeight
  beginDrag(event, ({ dy }) => (prefs.value = { ...prefs.value, rollHeight: rollHeightAfter(start, dy) }))
}

function nudgeRoll(event: KeyboardEvent): void {
  const step = event.key === 'ArrowUp' ? -16 : event.key === 'ArrowDown' ? 16 : 0
  if (!step) return
  event.preventDefault()
  prefs.value = { ...prefs.value, rollHeight: rollHeightAfter(prefs.value.rollHeight, step) }
}

function startNotationDrag(event: PointerEvent): void {
  event.preventDefault()
  const start = prefs.value.notationShare
  const container = (event.currentTarget as HTMLElement).parentElement
  const height = container?.clientHeight ?? 0
  beginDrag(event, ({ dy }) => (prefs.value = { ...prefs.value, notationShare: shareAfter(start, dy, height) }))
}

function nudgeNotation(event: KeyboardEvent): void {
  // ArrowDown moves the divider down (the notation grows), like dragging it
  const step = event.key === 'ArrowDown' ? 0.03 : event.key === 'ArrowUp' ? -0.03 : 0
  if (!step) return
  event.preventDefault()
  prefs.value = { ...prefs.value, notationShare: shareValue(prefs.value.notationShare + step) }
}

function startSideDrag(event: PointerEvent): void {
  event.preventDefault()
  const start = prefs.value.sideWidth
  beginDrag(event, ({ dx }) => (prefs.value = { ...prefs.value, sideWidth: sideWidthAfter(start, dx) }))
}

function nudgeSide(event: KeyboardEvent): void {
  const step = event.key === 'ArrowLeft' ? -16 : event.key === 'ArrowRight' ? 16 : 0
  if (!step) return
  event.preventDefault()
  prefs.value = { ...prefs.value, sideWidth: sideWidthAfter(prefs.value.sideWidth, step) }
}

// --- MIDI (next-release plan §10.4 / D3): export the score, import a file as a new score ---
const midiFile = ref<HTMLInputElement | null>(null)
const midiRequest = ref<{ data: string; filename: string } | null>(null)
const midiError = ref<string | null>(null)
const midiBusy = ref(false)
const keepsGuide = computed(() => props.guide !== undefined)
const midiBlock = computed(() => {
  if (props.readonly) return 'This score belongs to the other sheet.'
  if (session.commitBlock) return session.commitBlock
  return props.doc.text.trim() ? null : 'There is no score to export yet.'
})

/** The score (and the Guide notes) as a standard MIDI file, downloaded under the title's name. */
async function exportScore(): Promise<void> {
  const block = midiBlock.value
  if (block) {
    midiError.value = block
    return
  }
  midiBusy.value = true
  midiError.value = null
  try {
    const file = await exportMidi(props.fetcher, {
      abc: props.doc.text,
      title: props.title ?? '',
      guide: props.guide ?? []
    })
    downloadBytes(file.filename, fromBase64(file.data))
  } catch (e) {
    midiError.value = describeError(e)
  } finally {
    midiBusy.value = false
  }
}

/** The sheet music as MusicXML (both voices, chord symbols, sections and the lyrics under the notes). */
async function exportSheet(): Promise<void> {
  const block = midiBlock.value
  if (block) {
    midiError.value = block
    return
  }
  midiBusy.value = true
  midiError.value = null
  try {
    const file = await exportMusicXml(props.fetcher, {
      abc: props.doc.text,
      title: props.title ?? '',
      lyrics: lyricsNow.value ?? props.lyrics ?? null
    })
    downloadBytes(file.filename, new TextEncoder().encode(file.data), file.type)
  } catch (e) {
    midiError.value = describeError(e)
  } finally {
    midiBusy.value = false
  }
}

// --- the project file: the score, the Guide notes and the lyrics, to go on later ---
const projectFile = ref<HTMLInputElement | null>(null)

/** Everything this editor holds, as one file - also an unfinished score (its text is kept as it is). */
function saveProject(): void {
  const project = buildProject({
    title: props.title,
    score: props.doc.text,
    guide: props.guide ?? [],
    lyrics: lyricsNow.value ?? props.lyrics ?? null
  })
  downloadBytes(projectFilename(props.title), new TextEncoder().encode(`${JSON.stringify(project, null, 1)}\n`), 'application/json')
  midiError.value = null
  session.notes = [`saved the project: score${project.guide.length ? `, ${guideCount(project.guide.length)}` : ''}${project.lyrics ? ', lyrics' : ''}`]
}

function chooseProject(): void {
  midiError.value = null
  projectFile.value?.click()
}

async function onProjectFile(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  const project = parseProject(await file.text())
  if (typeof project === 'string') midiError.value = project
  else openProject(project, file.name)
}

const guideCount = (count: number): string => (count === 1 ? '1 Guide note' : `${count} Guide notes`)

/** Lyrics laid onto the sections of the next view (the opened score's) when they match them. */
let relayLyrics = false

/**
 * The project's score replaces this one - with its Guide notes and its lyrics, in one undo step. Parts
 * this sheet cannot hold are left out, and the status line says which.
 */
function openProject(project: ScoreProject, name: string): void {
  if (props.readonly) {
    midiError.value = 'This score belongs to the other sheet; open the project in that sheet.'
    return
  }
  const opened = ['score']
  const left: string[] = []
  const before: SideState = lyricsState()
  const after: SideState = {}
  const guideBefore = props.guide
  if (guideBefore !== undefined) {
    before.guide = [...guideBefore]
    after.guide = [...project.guide]
    if (project.guide.length) opened.push(guideCount(project.guide.length))
  } else if (project.guide.length) left.push('the Guide notes (only the DAW sheet keeps a Guide track)')
  if (project.lyrics && lyricsEditable.value) {
    follow.value = null
    loose.value = project.lyrics
    relayLyrics = true
    opened.push('lyrics')
  } else if (project.lyrics) left.push('the lyrics (this sheet cannot change them here)')
  Object.assign(after, lyricsState())
  const label = `open project (${name})`
  // the same score: the step holds the Guide notes and the lyrics alone
  if (!session.replaceText(project.score, label, null, { before, after })) session.recordSide(label, before, after)
  if (after.guide && guideBefore !== undefined && !sameGuide(after.guide, guideBefore)) emit('guideChange', after.guide)
  midiError.value = null
  session.notes = [
    `opened ${name}: ${opened.join(', ')}${project.title ? ` ("${project.title}")` : ''}`,
    ...left.map((part) => `not opened: ${part}`)
  ]
}

function chooseMidi(): void {
  midiError.value = null
  midiFile.value?.click()
}

async function onMidiFile(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = '' // the same file can be chosen again
  if (!file) return
  try {
    midiRequest.value = { data: toBase64(new Uint8Array(await file.arrayBuffer())), filename: file.name }
  } catch (e) {
    midiError.value = describeError(e)
  }
}

/**
 * Replace the score with the imported one and its Guide notes with the file's - one undo step for
 * both. The sheet's old Guide notes were timed to the replaced score, so they go with it (an undo
 * brings both back); unticking *keep the Guide notes* leaves the new score without any.
 */
function insertMidi(result: MidiImportResult, keepGuide: boolean): void {
  if (props.readonly) return
  const name = midiRequest.value?.filename ?? 'file'
  const before = props.guide
  const after = before === undefined ? undefined : keepGuide ? [...result.guide] : []
  const state = before === undefined || after === undefined ? undefined : { before: { guide: [...before] }, after: { guide: after } }
  session.replaceText(result.abc, `import MIDI (${name})`, result.analysis, state)
  if (after !== undefined && before !== undefined && !sameGuide(after, before)) emit('guideChange', after)
  midiRequest.value = null
  midiError.value = null
}

function isTextTarget(target: EventTarget | null): boolean {
  const element = target as HTMLElement | null
  if (!element) return false
  return !!element.closest('input, textarea, select, .cm-editor')
}

function onKey(event: KeyboardEvent): void {
  const mod = event.ctrlKey || event.metaKey
  if (mod && !props.readonly && (event.key === 'z' || event.key === 'Z' || event.key === 'y')) {
    if (isTextTarget(event.target) && !(event.target as HTMLElement).closest('.cm-editor')) return
    event.preventDefault()
    if (event.key === 'y' || (event.key.toLowerCase() === 'z' && event.shiftKey)) session.redo()
    else session.undo()
    return
  }
  const action = mod && !isTextTarget(event.target) ? clipKey(event) : null
  if (action) {
    event.preventDefault()
    event.stopPropagation()
    void onClipboard(action)
    return
  }
  if (isTextTarget(event.target) || mod) return
  const view = shown.value
  const primary = session.primary
  if (event.key === ' ') {
    event.preventDefault()
    transport.value?.toggle()
    return
  }
  if ((event.key === 'Home' || event.key === 'End') && model.value) {
    // Cubase: to the start / the end of the project
    event.preventDefault()
    locator.value = event.key === 'Home' ? 0 : model.value.total
    return
  }
  if (!view || !primary) return
  const handled = (() => {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowLeft': {
        const next = neighbour(view, primary.id, event.key === 'ArrowRight' ? 1 : -1)
        if (next) select(next.id, event.shiftKey, 'keys')
        return true
      }
      case 'ArrowUp':
      case 'ArrowDown': {
        if (event.altKey) {
          const other = otherVoice(view, primary.id)
          if (other) select(other.id, false, 'keys')
          return true
        }
        if (props.readonly) return false
        const notes = session.selection.filter((id) => elementById(view, id)?.kind === 'note')
        if (!notes.length) return true
        const step = (event.shiftKey ? 12 : 1) * (event.key === 'ArrowUp' ? 1 : -1)
        void operate({ op: 'shift_pitch', ids: notes, semitones: step })
        return true
      }
      case '[':
      case ']': {
        if (props.readonly || primary.kind !== 'note') return false
        const units = nextDuration(primary.units, event.key === ']' ? 1 : -1)
        if (units) void operate({ op: 'set_duration', id: primary.id, units })
        return true
      }
      case 'r':
      case 'Delete':
      case 'Backspace':
        if (props.readonly) return false
        if (primary.kind === 'note') void operate({ op: 'note_to_rest', ids: session.selection })
        return true
      case 'n':
        if (props.readonly) return false
        if (primary.kind !== 'note') void operate({ op: 'rest_to_note', id: primary.id })
        return true
      case 'Escape':
        if (session.selection.length) {
          session.select([])
          return true
        }
        return false
      default:
        return false
    }
  })()
  if (handled) {
    event.preventDefault()
    event.stopPropagation()
  }
}
</script>

<template>
  <div class="score-tab" @keydown="onKey">
    <ScorePalette
      v-if="!readonly"
      :view="shown"
      :selection="session.selection"
      :primary="session.primary"
      :busy="session.busy"
      :can-undo="session.canUndo"
      :can-redo="session.canRedo"
      :undo-label="session.undoLabel"
      :redo-label="session.redoLabel"
      @operate="operate"
      @undo="session.undo"
      @redo="session.redo"
    />
    <div class="view-tools" role="group" aria-label="View">
      <span class="layouts" role="radiogroup" aria-label="Layout">
        <button
          role="radio"
          :aria-checked="layout === 'review'"
          :class="{ active: layout === 'review' }"
          title="Piano roll, notation and inspector; the ABC text under Advanced"
          @click="chooseLayout('review')"
        >
          Review
        </button>
        <button
          role="radio"
          :aria-checked="daw"
          :class="{ active: daw }"
          title="Review plus the track headers: Vocal, Instrument, Chords and the Guide track (never sent to YuE2)"
          @click="chooseLayout('daw')"
        >
          DAW
        </button>
        <button
          role="radio"
          :aria-checked="layout === 'text'"
          :class="{ active: layout === 'text' }"
          title="The ABC text with its diagnostics, and the notation"
          @click="chooseLayout('text')"
        >
          Text
        </button>
      </span>
      <template v-if="review">
        <label title="The piano roll and chord lane above the notation">
          <input v-model="prefs.roll" type="checkbox" aria-label="Show the piano roll" />
          piano roll
        </label>
        <label title="Show the ABC text under the notation">
          <input v-model="prefs.advanced" type="checkbox" aria-label="Show the ABC text (advanced)" />
          ABC text (advanced)
        </label>
      </template>
      <label title="Zoom of the notation">
        zoom
        <input v-model.number="prefs.zoom" type="range" min="0.6" max="1.8" step="0.1" aria-label="Notation zoom" />
      </label>
      <span class="midi-tools" role="group" aria-label="Files">
        <button
          :disabled="midiBusy || !!midiBlock"
          :title="midiBlock ?? 'Download this score as a standard MIDI file (Vocal, Instrument, Chords and the Guide track)'"
          @click="exportScore"
        >
          Export MIDI
        </button>
        <button
          :disabled="midiBusy || !!midiBlock"
          :title="midiBlock ?? 'Download the sheet music as MusicXML for notation programs (MuseScore, Sibelius, Finale, Dorico, Cubase): both voices, chord symbols, sections and the lyrics'"
          @click="exportSheet"
        >
          Export MusicXML
        </button>
        <button
          :disabled="!doc.text.trim()"
          title="Save the score, the Guide notes and the lyrics in one project file, to go on later (Open project…)"
          @click="saveProject"
        >
          Save project
        </button>
        <button
          :disabled="readonly"
          :title="readonly ? 'This score belongs to the other sheet.' : 'Read a MIDI file as the score (the report is shown before anything is replaced)'"
          @click="chooseMidi"
        >
          Import MIDI…
        </button>
        <button
          :disabled="readonly"
          :title="readonly ? 'This score belongs to the other sheet.' : 'Open a project file: its score, Guide notes and lyrics replace these (one undo step)'"
          @click="chooseProject"
        >
          Open project…
        </button>
        <input
          ref="midiFile"
          class="hidden-file"
          type="file"
          accept=".mid,.midi,audio/midi,audio/x-midi"
          aria-label="MIDI file"
          @change="onMidiFile"
        />
        <input
          ref="projectFile"
          class="hidden-file"
          type="file"
          :accept="`${PROJECT_EXTENSION},.json,application/json`"
          aria-label="Project file"
          @change="onProjectFile"
        />
      </span>
      <span v-if="session.pending" class="facts">checking…</span>
      <span v-else-if="session.view?.ok" class="facts ok">✓ valid</span>
      <span v-else-if="invalid" class="facts bad">✖ {{ diagnostics.length }} error(s)</span>
      <span v-if="readonly" class="badge">read-only: owned by the other sheet</span>
    </div>
    <p v-if="invalid && !readonly" class="gate" role="status">
      The ABC text has errors: the notation shows the last valid score, and Apply and Approve are off until
      the text is valid again.
      <button v-if="session.canRevert" @click="session.revertToLastValid()">Revert to last valid</button>
      <button v-if="review && !prefs.advanced" @click="prefs.advanced = true">Show the ABC text</button>
    </p>
    <p v-else-if="session.view?.ok && session.view.model_error && !readonly" class="gate" role="status">
      This score is valid for YuE2 but outside the editor's supported subset ({{ session.view.model_error.message }});
      edit it as ABC text.
    </p>
    <PianoRoll
      v-if="showRoll"
      v-model:zoom="rollZoom"
      :height="prefs.rollHeight"
      :view="shown"
      :selection="session.selection"
      :playing="cursor"
      :operate="operateRoll"
      :readonly="readonly"
      :stale="invalid"
      :busy="session.busy"
      :locator="model ? locator : null"
      :playhead="playhead"
      :clip="clipboard?.label ?? null"
      :lyrics="shown?.lyrics ?? null"
      :lyrics-editable="lyricsEditable"
      resize-mode="rests"
      @select="selectFromRoll"
      @locate="(unit: number) => (locator = unit)"
      @clipboard="onClipboard"
      @lyric-edit="onLyricEdit"
    />
    <div
      v-if="showRoll && shown?.model"
      class="splitter horizontal"
      role="separator"
      tabindex="0"
      aria-label="Resize the piano roll"
      :aria-valuenow="prefs.rollHeight"
      :aria-valuemin="ROLL_MIN"
      :aria-valuemax="ROLL_MAX"
      title="Drag to resize the piano roll (arrow keys work too)"
      @pointerdown="startRollDrag"
      @keydown="nudgeRoll"
    />
    <div
      class="score-main"
      :class="{ 'with-roll': showRoll && !!shown?.model, 'with-inspector': review }"
      :data-layout="layout"
      :data-text="review ? (prefs.advanced ? 'shown' : 'hidden') : 'main'"
      :style="mainStyle"
    >
      <div class="side">
        <TrackPanel
          v-if="daw"
          v-model:voices="voices"
          :view="shown"
          :guide-count="guide.length"
          :keeps-guide="keepsGuide"
          :readonly="readonly"
          @clear-guide="clearGuide"
        />
        <ScoreNavigator
          :view="shown"
          :bar="selectedBar"
          :error-bars="errorBars"
          :source-starts="sourceStarts"
          :readonly="readonly"
          :section-lyrics="follow?.blocks ?? null"
          @goto="goto"
          @operate="operate"
          @notice="(text: string) => (session.notes = [text])"
        />
        <div v-if="lyricsTarget && lyricsNow !== null" class="lyrics-follow" role="group" aria-label="Lyrics">
          <strong>Lyrics</strong>
          <p v-if="lyricsTarget.blocked" class="hint">{{ lyricsTarget.blocked }}</p>
          <template v-else>
            <p v-if="lyricsChanged" class="hint changed">
              Apply writes the changed lyrics into {{ lyricsTarget.title }}: {{ lyricsTags }}. That sheet then asks for
              approval again.
              <template v-if="lyricsTarget.replans">
                The planner reads those lyrics and plans again on the next run; this score is kept as yours (manual)
                and used.
              </template>
            </p>
            <p v-else class="hint">
              {{ lyricsTarget.own ? 'This sheet\'s lyrics' : `The lyrics of ${lyricsTarget.title}` }}: double-click the
              lyrics lane over the notes to edit a line where it is sung.
              <template v-if="follow && !readonly">Duplicating, moving or deleting sections arranges them too.</template>
            </p>
            <button v-if="lyricsChanged" title="Back to the lyrics as their sheet has them (one undo step)" @click="revertLyrics">
              Revert the lyrics
            </button>
          </template>
        </div>
        <details v-if="review && fitLyrics" class="fit-panel">
          <summary>Lyrics fit</summary>
          <LyricsFit
            :lyrics="fitLyrics"
            :abc="doc.text"
            :fetcher="fetcher"
            :engine="payload?.engine ?? null"
            :instrumental="payload?.instrumental ?? false"
          />
        </details>
      </div>
      <div
        class="splitter vertical"
        role="separator"
        tabindex="0"
        aria-label="Resize the side column"
        :aria-valuenow="prefs.sideWidth"
        :aria-valuemin="SIDE_MIN"
        :aria-valuemax="SIDE_MAX"
        title="Drag to resize the navigator column (arrow keys work too)"
        @pointerdown="startSideDrag"
        @keydown="nudgeSide"
      />
      <div class="score-views" :class="{ split: review && prefs.advanced }">
        <AbcEditor
          v-if="!review"
          :text="doc.text"
          :diagnostics="diagnostics"
          :reveal="revealRange"
          :readonly="readonly"
          @change="session.typed"
          @cursor="onCursor"
        />
        <NotationView
          :view="shown"
          :stale="invalid"
          :selection="session.selection"
          :playing="cursor"
          :zoom="prefs.zoom"
          tabindex="0"
          @select="(id: string, additive: boolean) => select(id, additive)"
        />
        <div
          v-if="review && prefs.advanced"
          class="splitter horizontal"
          role="separator"
          tabindex="0"
          aria-label="Resize the ABC text"
          :aria-valuenow="prefs.notationShare"
          :aria-valuemin="NOTATION_MIN"
          :aria-valuemax="NOTATION_MAX"
          title="Drag to give the notation or the ABC text more room (arrow keys work too)"
          @pointerdown="startNotationDrag"
          @keydown="nudgeNotation"
        />
        <AbcEditor
          v-if="review && prefs.advanced"
          :text="doc.text"
          :diagnostics="diagnostics"
          :reveal="revealRange"
          :readonly="readonly"
          @change="session.typed"
          @cursor="onCursor"
        />
      </div>
      <Inspector
        v-if="review"
        :view="shown"
        :selection="session.selection"
        :operate="operateRoll"
        :fallback-bar="session.primary?.bar ?? null"
        :readonly="readonly"
        :stale="invalid"
        :busy="session.busy"
        resize-mode="rests"
      />
    </div>
    <ScoreTransport
      ref="transport"
      v-model:voices="voices"
      v-model:speed="speed"
      v-model:metronome="metronome"
      :view="shown"
      :bar="locatorBar"
      :from="locatorSeconds"
      :position="locatorLabel"
      :reference="reference"
      :timeline-bars="timelineBars"
      :guide="transportGuide"
      @cursor="(ids: string[]) => (cursor = ids)"
      @time="onPlayTime"
    />
    <p class="status" aria-live="polite">
      <span>{{ session.selection.length > 1 ? `${session.selection.length} selected · ` : '' }}{{ describe(session.primary, unit) }}</span>
      <span v-for="(note, index) in session.notes" :key="index" class="change">{{ note }}</span>
    </p>
    <p v-if="session.error" class="error" role="alert">{{ session.error }}</p>
    <p v-if="midiError" class="error" role="alert">{{ midiError }}</p>
    <MidiDialog
      v-if="midiRequest"
      :fetcher="fetcher"
      :data="midiRequest.data"
      :filename="midiRequest.filename"
      :view="shown"
      :keeps-guide="keepsGuide"
      :current-guide="guide.length"
      @close="midiRequest = null"
      @insert="insertMidi"
    />
    <ul v-if="diagnostics.length" class="diagnostics">
      <li v-for="(d, index) in diagnostics" :key="index" :data-severity="d.severity">
        <strong>{{ d.severity }}</strong>
        <button v-if="d.bar" class="link" :title="`Go to bar ${d.bar}`" @click="goto(d.bar)">bar {{ d.bar }}</button>
        <span v-else-if="d.line" class="where">line {{ d.line }}</span>
        {{ d.message }}
      </li>
    </ul>
  </div>
</template>
