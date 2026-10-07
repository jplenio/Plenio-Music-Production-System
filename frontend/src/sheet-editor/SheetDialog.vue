<script setup lang="ts">
/**
 * The Song Sheet editor: the documents that condition the music model, one tab per kind.
 * Working copies are edited here and written to the node's sheet_state on Apply; the
 * backend resolves, validates and fingerprints them (the same function the node runs).
 */
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

import { type Fetcher, type GuideNote, PlenioApiError, getAsrNote, resolveSheet } from '../api/client'
import {
  type AsrNote,
  type Finding,
  arrangementLabel,
  type ScoreChange,
  type ScoreTarget,
  type SheetPayload,
  type WorkingDoc,
  nextState,
  normalize,
  sectionTimes,
  startSession,
  upstreamOf,
  withApproval
} from '../shared/sheetSession'
import { type DocumentKind, type SheetState, serializeState } from '../shared/sheetState'
import { SECTION_TAGS, withTag } from '../shared/lyricsTags'
import { LINE_BREAK, changedWords, wordDiff } from '../shared/wordDiff'
import {
  DIALOG_MARGIN,
  type DialogGeometry,
  beginDrag,
  clampDialog,
  loadGeometry,
  saveGeometry
} from './paneSizes'
import LyricsFit from './LyricsFit.vue'
import ScoreTab from './score/ScoreTab.vue'
import type { LyricsTarget } from './score/lyricsFollow'
import { sameGuide } from './score/tracks'
import { type LyricSpan, type SheetExtras, sameSpans } from './score/lyricPlacement'

const props = defineProps<{
  title: string
  state: SheetState
  payload: SheetPayload | null
  asrNote?: AsrNote | null
  owned: DocumentKind[]
  review: string
  fetcher: Fetcher
  /** The node's ``plenio_editor_layout`` property (the score editor's layout). */
  layout?: string | null
  /** The Guide notes of the node's ``plenio_guide`` property (playback and MIDI only). */
  guide?: GuideNote[]
  /** The lyrics lines placed by hand (the node's ``plenio_lyric_spans`` property). */
  lyricSpans?: LyricSpan[]
  /** How far the source recording is moved against the bars (the node's ``plenio_source_shift``). */
  sourceShift?: number
  /** The sheet that owns the context lyrics, when they can follow the score's sections. */
  lyricsTarget?: LyricsTarget | null
  /** The sheet that owns the context score (a cover's score sheet), when this sheet may edit it. */
  scoreTarget?: ScoreTarget | null
}>()
/**
 * ``lyrics``: the context lyrics arranged like the score, for the sheet that owns them (``null``:
 * unchanged); ``score``: the context score as edited here, for the sheet that owns it (``null``: unchanged).
 */
const emit = defineEmits<{
  /** ``approved``: Approve was pressed - the sheet is released for the next run now. */
  apply: [state: SheetState, guide: GuideNote[], lyrics: string | null, score: ScoreChange | null, approved: boolean, extras: SheetExtras]
  close: []
}>()

type Tab = 'lyrics' | 'score' | 'style' | 'details'
const TAB_OF: Record<DocumentKind, Tab> = {
  lyrics: 'lyrics',
  score: 'score',
  style: 'style',
  title: 'details',
  artwork_prompt: 'details'
}
const TAB_LABELS: Record<Tab, string> = { lyrics: 'Lyrics', score: 'Score', style: 'Style', details: 'Title & artwork' }
const BASE_LABELS: Record<DocumentKind, string> = {
  title: 'Title',
  style: 'Style',
  lyrics: 'Lyrics',
  score: 'Score (ABC)',
  artwork_prompt: 'Artwork prompt'
}
const ROWS: Record<DocumentKind, number> = { title: 1, style: 3, lyrics: 16, score: 18, artwork_prompt: 3 }

// The engine names the style document (MiniMax Music 3: a multi-line caption); the editor knows no engines.
const caption = computed(() => props.payload?.style_label === 'caption')
const LABELS = computed<Record<DocumentKind, string>>(() => ({ ...BASE_LABELS, style: caption.value ? 'Caption' : 'Style' }))
const tabLabel = (tab: Tab) => (tab === 'style' && caption.value ? 'Caption' : TAB_LABELS[tab])
const rowsOf = (kind: DocumentKind) => (kind === 'style' && caption.value ? 14 : ROWS[kind])

const working = reactive<WorkingDoc[]>(startSession(props.state, props.payload, props.owned))
const result = ref<SheetPayload | null>(props.payload)
const error = ref<string | null>(null)
const busy = ref(false)
const confirmClose = ref(false)
// The score's commit gate, as the score tab last reported it for a text (the tab unmounts when
// another tab is shown; the gate holds while the text is unchanged).
const scoreGate = ref<{ text: string; reason: string | null } | null>(null)
const scoreBlock = computed(() => {
  const doc = working.find((d) => d.kind === 'score')
  const gate = scoreGate.value
  return doc && gate?.reason && gate.text === doc.text ? gate.reason : null
})
const fetchedNote = ref<AsrNote | null>(null)
const revision = ref(0)
let timer: ReturnType<typeof setTimeout> | undefined

const contextScore = computed(() => props.payload?.context?.score ?? null)
const contextDoc = reactive<WorkingDoc>({ kind: 'score', text: contextScore.value ?? '', intent: 'keep' })
// --- the other sheet's score, edited here (a cover's text sheet; owner's request 2026-10-02) ---
/** The context score may be edited: Apply writes it into the sheet that owns it. */
const scoreEditable = computed(
  () => !working.some((d) => d.kind === 'score') && !!contextScore.value && !!props.scoreTarget && !props.scoreTarget.blocked
)
const contextGate = ref<{ text: string; reason: string | null } | null>(null)
const contextBlock = computed(() => {
  const gate = contextGate.value
  return scoreEditable.value && gate?.reason && gate.text === contextDoc.text ? gate.reason : null
})
/** The context score as edited here, when it changed. */
const changedScore = computed(() =>
  scoreEditable.value && contextScore.value && normalize(contextDoc.text) !== normalize(contextScore.value) ? contextDoc.text : null
)
/**
 * A changed score and the lyrics shown with it are one pair: the lyrics are kept as they are now
 * (manual), so the next run does not replace them with a draft made for the old score.
 */
function keepLyricsWithScore(): void {
  if (!changedScore.value) return
  const lyrics = working.find((d) => d.kind === 'lyrics')
  if (lyrics && lyrics.intent !== 'auto') lyrics.intent = 'manual'
}
const tabs = computed<Tab[]>(() => {
  const present = new Set<Tab>(working.map((doc) => TAB_OF[doc.kind]))
  for (const kind of Object.keys(props.payload?.context ?? {})) {
    if (kind in TAB_OF) present.add(TAB_OF[kind as DocumentKind])
  }
  return (['score', 'lyrics', 'style', 'details'] as Tab[]).filter((tab) => present.has(tab))
})
const firstOwnedTab = working[0] ? TAB_OF[working[0].kind] : 'lyrics'
const tab = ref<Tab>(firstOwnedTab)

const docInfo = (kind: DocumentKind) => props.payload?.docs[kind] ?? null
const draftOf = (kind: DocumentKind) => docInfo(kind)?.upstream ?? null
const isConflict = (kind: DocumentKind) => docInfo(kind)?.status === 'conflict'
const docsOf = (which: Tab) => working.filter((doc) => TAB_OF[doc.kind] === which)
const scoreDoc = computed(() => working.find((doc) => doc.kind === 'score') ?? null)
const scoreText = computed(() => scoreDoc.value?.text ?? contextScore.value ?? null)
/** The lyrics next to the score: this sheet's lyrics, else the text sheet's (context). */
const lyricsText = computed(
  () => working.find((doc) => doc.kind === 'lyrics')?.text ?? props.payload?.context?.lyrics ?? null
)
/** The song's title: the MIDI export takes its file name from it. */
const songTitle = computed(
  () => working.find((doc) => doc.kind === 'title')?.text ?? props.payload?.context?.title ?? null
)
const timeline = computed(() => sectionTimes(props.payload?.timeline))
const asr = computed(() => {
  const note = props.asrNote ?? fetchedNote.value
  return note && note.draft_sha256 === docInfo('lyrics')?.upstream_sha256 ? note : null
})
const diffOf = (doc: WorkingDoc) => wordDiff(draftOf(doc.kind) ?? '', doc.text)

function badge(doc: WorkingDoc): string {
  if (doc.intent === 'auto') return 'auto'
  if (doc.intent === 'manual') return 'manual'
  if (doc.intent === 'rebase') return 'edited (merged)'
  if (isConflict(doc.kind)) return 'conflict'
  const stored = props.state.docs[doc.kind]?.state ?? 'auto'
  const draft = normalize(draftOf(doc.kind) ?? '')
  if (stored === 'auto' && normalize(doc.text) !== draft) return draft || !props.payload ? 'edited' : 'manual'
  return stored
}

function useDraft(doc: WorkingDoc) {
  doc.intent = 'auto'
  doc.text = draftOf(doc.kind) ?? ''
}
/**
 * *Make manual* - for the lyrics *Use my own lyrics* (plan §7): the writer is not consulted any more
 * and the text reaches YuE2 verbatim. The text in the editor (a draft or the user's own words) stays
 * as it is - nothing is replaced, and the editor's checks keep running.
 */
function makeManual(doc: WorkingDoc) {
  doc.intent = 'manual'
}

/** Append a section tag as its own line (YuE2 sings section by section; see Score). */
function insertTag(doc: WorkingDoc, tag: string): void {
  doc.text = withTag(doc.text, tag)
  onInput(doc)
}
function keepEdit(doc: WorkingDoc) {
  doc.intent = 'manual'
}
function merge(doc: WorkingDoc) {
  doc.intent = 'rebase'
}
function onInput(doc: WorkingDoc) {
  if (doc.intent === 'auto') doc.intent = 'keep'
}

/** Discard all working edits of this session. */
function revert(): void {
  const fresh = startSession(props.state, props.payload, props.owned)
  fresh.forEach((doc, index) => Object.assign(working[index], doc))
  guide.value = [...(props.guide ?? [])]
  lyricSpans.value = [...(props.lyricSpans ?? [])]
  sourceShift.value = props.sourceShift ?? 0
  contextDoc.text = contextScore.value ?? ''
  revision.value++
}

const unresolvedConflicts = computed(() =>
  working.filter((doc) => isConflict(doc.kind) && doc.intent === 'keep').map((doc) => doc.kind)
)
const pending = computed(() => nextState(props.state, props.payload, working))
const guide = ref<GuideNote[]>([...(props.guide ?? [])])
function setGuide(next: GuideNote[]): void {
  guide.value = next
}
const lyricSpans = ref<LyricSpan[]>([...(props.lyricSpans ?? [])])
function setLyricSpans(next: LyricSpan[]): void {
  lyricSpans.value = next
}
const sourceShift = ref<number>(props.sourceShift ?? 0)
function setSourceShift(next: number): void {
  sourceShift.value = next
}
function extras(): SheetExtras {
  return { lyricSpans: lyricSpans.value, sourceShift: sourceShift.value }
}
// --- the lyrics in the score editor: this sheet's own (Lyrics tab) or another sheet's (written on Apply) ---
const followText = ref<string | null>(null)
const ownLyrics = computed(() => working.find((doc) => doc.kind === 'lyrics') ?? null)
const OWN_LYRICS: LyricsTarget = { title: 'the Lyrics tab', blocked: null, replans: false, own: true }
/** Where lyrics edited in the score editor go. */
const lyricsTarget = computed(() => (ownLyrics.value ? OWN_LYRICS : (props.lyricsTarget ?? null)))
/** The other sheet's lyrics as edited or arranged here, when they changed (written on Apply). */
const followedLyrics = computed(() => {
  const base = props.payload?.context?.lyrics
  const text = followText.value
  if (ownLyrics.value || !lyricsTarget.value || lyricsTarget.value.blocked || !text || !base) return null
  return normalize(text) !== normalize(base) ? text : null
})

function onLyricsChange(text: string | null): void {
  const own = ownLyrics.value
  if (!own) {
    followText.value = text
  } else if (text !== null && normalize(text) !== normalize(own.text)) {
    own.text = text // this sheet's lyrics change at once (the Lyrics tab shows them)
    onInput(own)
  }
}
/**
 * When the music model plans this score from those lyrics (*1 · YuE2 · Song*), new lyrics plan a new
 * score on the next run: the arranged score is kept as the user's (manual), so it is used and does not
 * turn into a conflict with the new plan. The approval is unaffected (it covers the texts).
 */
function keepScoreWhenReplanned(): void {
  if (!followedLyrics.value || !lyricsTarget.value?.replans) return
  const doc = working.find((d) => d.kind === 'score')
  if (doc && doc.intent === 'keep') doc.intent = 'manual'
}
const dirty = computed(
  () =>
    serializeState(pending.value) !== serializeState(props.state) ||
    !sameGuide(guide.value, props.guide ?? []) ||
    !sameSpans(lyricSpans.value, props.lyricSpans ?? []) ||
    sourceShift.value !== (props.sourceShift ?? 0) ||
    followedLyrics.value !== null ||
    changedScore.value !== null
)
/** What the creative mode did to the score's draft (Apply Arrangement), shown above the findings. */
const arrangement = computed(() => {
  const value = props.payload?.arrangement
  return value && value.status !== 'skipped' ? value : null
})
const findings = computed<Finding[]>(() => (result.value?.findings ?? []).filter((f) => f.severity !== 'info'))
const infos = computed<Finding[]>(() => (result.value?.findings ?? []).filter((f) => f.severity === 'info'))
const hasErrors = computed(() => findings.value.some((f) => f.severity === 'error'))
const canApprove = computed(
  () =>
    !busy.value &&
    !hasErrors.value &&
    !unresolvedConflicts.value.length &&
    !scoreBlock.value &&
    !contextBlock.value &&
    !!result.value?.fingerprint
)
const applyBlock = computed(() =>
  unresolvedConflicts.value.length ? 'Resolve the conflicts first.' : (scoreBlock.value ?? contextBlock.value)
)
const statusIcon = computed(() => {
  if (unresolvedConflicts.value.length) return '⇄ conflict'
  if (hasErrors.value) return '✖ errors'
  if (findings.value.length) return '⚠ warnings'
  if (result.value?.waiting && !dirty.value) return '⏸ waiting for approval'
  return result.value ? '✓ valid' : 'not run yet'
})

async function validate() {
  if (!props.payload) return
  busy.value = true
  error.value = null
  try {
    result.value = await resolveSheet(props.fetcher, {
      sheet_state: pending.value,
      upstream: upstreamOf(props.payload),
      owned: props.owned,
      review: props.review,
      engine: props.payload.engine,
      instrumental: props.payload.instrumental,
      // the lyrics are checked against the score as edited here
      context: changedScore.value ? { ...props.payload.context, score: changedScore.value } : props.payload.context,
      target_seconds: props.payload.target_seconds ?? null,
      // a series: the same rule as the node (an edit belongs to its song)
      brief_mode: props.payload.brief_mode ?? null
    })
  } catch (e) {
    error.value = e instanceof PlenioApiError ? `${e.message}${e.hint ? ` — ${e.hint}` : ''}` : String(e)
  } finally {
    busy.value = false
  }
}

watch(
  () => [...working.map((doc) => doc.text + doc.intent), changedScore.value ?? ''].join('\u0000'),
  () => {
    clearTimeout(timer)
    timer = setTimeout(validate, 300)
  }
)

function scoreChange(approved: boolean): ScoreChange | null {
  return changedScore.value ? { text: changedScore.value, approved } : null
}
function apply() {
  if (applyBlock.value) return
  keepScoreWhenReplanned()
  keepLyricsWithScore()
  emit(
    'apply',
    withApproval(pending.value, props.state.review?.approved_fingerprint ?? null),
    guide.value,
    followedLyrics.value,
    scoreChange(false),
    false,
    extras()
  )
}
async function approve() {
  keepScoreWhenReplanned()
  keepLyricsWithScore()
  await validate()
  if (canApprove.value) {
    emit(
      'apply',
      withApproval(pending.value, result.value?.fingerprint ?? null),
      guide.value,
      followedLyrics.value,
      scoreChange(true),
      true,
      extras()
    )
  }
}
function close() {
  if (dirty.value) confirmClose.value = true
  else emit('close')
}

// --- the window (resizable, fills the browser window on request; owner's request, 2026-09-28) -----
const geometry = reactive<DialogGeometry>(loadGeometry())
// the viewport is reactive so a browser resize re-renders the dialog (and re-clamps the stored size)
const viewport = reactive({ width: window.innerWidth, height: window.innerHeight })

const dialogStyle = computed(() => {
  // --plenio-dialog-h feeds the panes' calc() heights in dialog.css, so they follow the window
  const height = geometry.maximized ? viewport.height - 2 * DIALOG_MARGIN : geometry.height
  if (geometry.maximized) {
    return {
      width: `${viewport.width - 2 * DIALOG_MARGIN}px`,
      height: `${height}px`,
      '--plenio-dialog-h': `${height}px`
    }
  }
  return { width: `${geometry.width}px`, height: `${geometry.height}px`, '--plenio-dialog-h': `${height}px` }
})

/** A smaller browser window shrinks the dialog with it (it is never larger than the window). */
function onWindowResize(): void {
  viewport.width = window.innerWidth
  viewport.height = window.innerHeight
  const size = clampDialog({ width: geometry.width, height: geometry.height }, viewport)
  if (size.width !== geometry.width || size.height !== geometry.height) {
    geometry.width = size.width
    geometry.height = size.height
    saveGeometry(geometry)
  }
}

function toggleMaximize(): void {
  geometry.maximized = !geometry.maximized
  saveGeometry(geometry)
}

/** Drag the corner: the window follows the pointer, clamped to the minimum and to the viewport. */
function startResize(event: PointerEvent): void {
  event.preventDefault()
  event.stopPropagation()
  const start = { width: geometry.width, height: geometry.height }
  beginDrag(
    event,
    ({ dx, dy }) => {
      const size = clampDialog(
        { width: start.width + dx, height: start.height + dy },
        { width: window.innerWidth, height: window.innerHeight }
      )
      geometry.width = size.width
      geometry.height = size.height
    },
    () => saveGeometry(geometry)
  )
}
function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape' && !event.defaultPrevented) {
    event.preventDefault()
    if (confirmClose.value) confirmClose.value = false
    else close()
  }
}
onMounted(() => {
  window.addEventListener('keydown', onKey)
  window.addEventListener('resize', onWindowResize)
  if (props.payload) void validate()
  const draft = docInfo('lyrics')?.upstream_sha256
  if (!props.asrNote && draft) {
    // stored by Transcribe Lyrics; also found after a reload when ComfyUI served everything from its cache
    getAsrNote(props.fetcher, draft)
      .then((note) => (fetchedNote.value = note))
      .catch(() => undefined)
  }
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('resize', onWindowResize)
  clearTimeout(timer)
})
</script>

<template>
  <div class="plenio-overlay" @mousedown.self="close">
    <div
      class="plenio-dialog"
      role="dialog"
      aria-modal="true"
      :aria-label="title"
      :class="{ maximized: geometry.maximized }"
      :style="dialogStyle"
    >
      <header @dblclick.self="toggleMaximize">
        <h2>{{ title }}</h2>
        <span class="status" :class="{ bad: hasErrors || unresolvedConflicts.length }" :title="result?.status ?? ''">
          {{ statusIcon }}
        </span>
        <div class="tabs" role="tablist" aria-label="Documents">
          <button
            v-for="item in tabs"
            :key="item"
            role="tab"
            :aria-selected="tab === item"
            :class="{ active: tab === item }"
            @click="tab = item"
          >
            {{ tabLabel(item) }}
          </button>
        </div>
        <button
          class="icon"
          :title="geometry.maximized ? 'Restore the window size (double-click the header)' : 'Fill the browser window (double-click the header)'"
          :aria-label="geometry.maximized ? 'Restore' : 'Maximize'"
          :aria-pressed="geometry.maximized"
          @click="toggleMaximize"
        >
          {{ geometry.maximized ? '❐' : '⛶' }}
        </button>
        <button class="icon" title="Close (Esc)" aria-label="Close" @click="close">×</button>
      </header>
      <p v-if="!payload" class="hint">
        This sheet has not run yet, so there are no drafts to show. Run the workflow once, or enter text and use
        <em>Make manual</em>.
      </p>
      <div v-if="confirmClose" class="confirm" role="alertdialog" aria-label="Unapplied changes">
        You have changes that are not applied yet.
        <button class="primary" :disabled="!!applyBlock" :title="applyBlock ?? 'Save your documents into the node'" @click="apply">
          Apply
        </button>
        <button @click="emit('close')">Discard</button>
        <button @click="confirmClose = false">Keep editing</button>
      </div>
      <div class="body" role="tabpanel">
        <section v-for="doc in docsOf(tab)" :key="doc.kind + revision" class="doc" :class="{ wide: doc.kind === 'score' }">
          <div class="doc-head">
            <h3>{{ LABELS[doc.kind] }}</h3>
            <span class="badge" :data-state="badge(doc)">{{ badge(doc) }}</span>
            <span class="spacer" />
            <button :disabled="draftOf(doc.kind) === null" title="Discard your edit and use the draft" @click="useDraft(doc)">
              Use draft
            </button>
            <button
              v-if="doc.kind === 'lyrics'"
              :disabled="doc.intent === 'manual'"
              title="Keep exactly these words: the writer is not consulted any more (your lyrics reach YuE2 unchanged)"
              @click="makeManual(doc)"
            >
              Use my own lyrics
            </button>
            <button v-else title="Always use your text; the draft is no longer computed" @click="makeManual(doc)">
              Make manual
            </button>
          </div>
          <div v-if="isConflict(doc.kind) && doc.intent === 'keep'" class="conflict">
            The draft changed after you edited this document ({{ docInfo(doc.kind)?.reason }}).
            <button @click="keepEdit(doc)">Keep my edit (manual)</button>
            <button @click="useDraft(doc)">Use the new draft</button>
            <button @click="merge(doc)">Merge by hand</button>
          </div>
          <ScoreTab
            v-if="doc.kind === 'score'"
            :doc="doc"
            :fetcher="fetcher"
            :payload="payload"
            :readonly="false"
            :layout-default="layout ?? null"
            :lyrics="lyricsText"
            :title="songTitle"
            :guide="guide"
            :lyric-spans="lyricSpans"
            :source-shift="sourceShift"
            :lyrics-target="lyricsTarget"
            :lyrics-pending="ownLyrics ? null : followText"
            @edited="onInput(doc)"
            @guide-change="setGuide"
            @lyric-spans-change="setLyricSpans"
            @source-shift-change="setSourceShift"
            @lyrics-change="onLyricsChange"
            @gate="(text: string, reason: string | null) => (scoreGate = { text, reason })"
          />
          <textarea
            v-else
            v-model="doc.text"
            :rows="rowsOf(doc.kind)"
            spellcheck="false"
            :aria-label="LABELS[doc.kind]"
            @input="onInput(doc)"
          />
          <p v-if="doc.kind === 'lyrics'" class="tag-helpers">
            <span>Section tags (the model sings section by section):</span>
            <button v-for="tag in SECTION_TAGS" :key="tag" :title="`Add [${tag}]`" @click="insertTag(doc, tag)">
              [{{ tag }}]
            </button>
            <span v-if="doc.intent === 'manual'" class="facts">the writer is not consulted - these are your lyrics</span>
          </p>
          <p v-if="doc.kind === 'lyrics' && asr" class="asr">
            <span>Transcribed ({{ asr.language }}).</span>
            <span v-if="asr.low_confidence.length">
              Check these unsure words:
              <mark v-for="(word, index) in asr.low_confidence" :key="'low-' + index">{{ word }}</mark>
            </span>
            <span v-if="asr.left_out.length">Left out as not sung: <s>{{ asr.left_out.join(' ') }}</s></span>
          </p>
          <details v-if="draftOf(doc.kind) !== null && normalize(draftOf(doc.kind) ?? '') !== normalize(doc.text)">
            <summary>Changes against the draft ({{ changedWords(diffOf(doc)) }} words)</summary>
            <p v-if="doc.kind !== 'score'" class="diff">
              <template v-for="(part, index) in diffOf(doc)" :key="index">
                <br v-if="part.text === LINE_BREAK" />
                <ins v-else-if="part.op === 'added'">{{ part.text + ' ' }}</ins>
                <del v-else-if="part.op === 'removed'">{{ part.text + ' ' }}</del>
                <span v-else>{{ part.text + ' ' }}</span>
              </template>
            </p>
            <pre>{{ draftOf(doc.kind) }}</pre>
          </details>
          <LyricsFit
            v-if="doc.kind === 'lyrics'"
            :lyrics="doc.text"
            :abc="scoreText"
            :fetcher="fetcher"
            :engine="payload?.engine ?? null"
            :instrumental="payload?.instrumental ?? false"
          />
        </section>
        <section v-if="tab === 'score' && !scoreDoc && contextScore" class="doc context wide">
          <div class="doc-head">
            <h3>Score (ABC)</h3>
            <span v-if="scoreEditable" class="badge" :title="`The score belongs to ${scoreTarget?.title}`">
              from {{ scoreTarget?.title }}{{ changedScore ? ' · changed' : '' }}
            </span>
            <span v-else class="badge">from the other sheet (read-only)</span>
          </div>
          <p v-if="scoreEditable" class="hint score-owner">
            Changes to the score go into <strong>{{ scoreTarget?.title }}</strong> on Apply, and the lyrics are kept as
            you see them here (manual), so the two stay a pair. <strong>Approve</strong> approves the changed score in
            that sheet too; with Apply it asks for approval again on the next run.
          </p>
          <p v-else-if="scoreTarget?.blocked" class="hint">{{ scoreTarget.blocked }}</p>
          <!-- the other sheet's score: edited here when that sheet can take it back, else read-only; this
               sheet's lyrics are shown on it and edited there -->
          <ScoreTab
            :doc="contextDoc"
            :fetcher="fetcher"
            :payload="payload"
            :readonly="!scoreEditable"
            :layout-default="layout ?? null"
            :lyrics="lyricsText"
            :lyrics-target="ownLyrics ? lyricsTarget : null"
            :lyric-spans="lyricSpans"
            :source-shift="sourceShift"
            @lyric-spans-change="setLyricSpans"
            @source-shift-change="setSourceShift"
            @lyrics-change="onLyricsChange"
            @gate="(text: string, reason: string | null) => (contextGate = { text, reason })"
          />
        </section>
        <section v-if="tab === 'lyrics' && timeline.length" class="doc sections">
          <div class="doc-head">
            <h3>Sections of the source</h3>
            <span class="badge">from Transcribe Score</span>
          </div>
          <table>
            <thead>
              <tr><th>Section</th><th>Bars</th><th>From</th><th>To</th></tr>
            </thead>
            <tbody>
              <tr v-for="(section, index) in timeline" :key="index">
                <td>{{ section.label }}</td><td>{{ section.bars }}</td><td>{{ section.start }}</td><td>{{ section.end }}</td>
              </tr>
            </tbody>
          </table>
        </section>
        <template v-for="(text, kind) in payload?.context ?? {}" :key="'context-' + kind">
          <section v-if="kind !== 'score' && TAB_OF[kind as DocumentKind] === tab" class="doc context">
            <div class="doc-head">
              <h3>{{ LABELS[kind as DocumentKind] ?? kind }}</h3>
              <span class="badge">from the other sheet (read-only)</span>
            </div>
            <pre>{{ text }}</pre>
          </section>
        </template>
      </div>
      <section class="findings" aria-label="Validation">
        <div v-if="arrangement" class="arrangement" :data-status="arrangement.status">
          <p v-if="arrangement.status === 'fallback'">
            <strong>Arrangement not applied</strong> - {{ arrangementLabel(arrangement) }}:
            {{ arrangement.summary.replace(/^not applied: /, '') }}
          </p>
          <details v-else>
            <summary>
              <strong>Arrangement</strong> {{ arrangementLabel(arrangement) }}: {{ arrangement.summary }}
            </summary>
            <p v-if="arrangement.idea" class="idea">{{ arrangement.idea }}</p>
            <ul>
              <li v-for="section in arrangement.sections ?? []" :key="section.index">
                <strong>{{ section.index }} {{ section.label }}</strong>
                <span class="where">bars {{ section.bars }}</span>
                {{ section.applied.length ? section.applied.join('; ') : 'unchanged' }}
                <span v-if="section.kept.length" class="kept"> - kept: {{ section.kept.join('; ') }}</span>
              </li>
              <li v-for="(note, index) in arrangement.notes ?? []" :key="'note' + index" data-severity="info">
                {{ note }}
              </li>
            </ul>
          </details>
        </div>
        <p v-if="error" class="error">{{ error }}</p>
        <p v-if="unresolvedConflicts.length" class="error">
          Resolve the conflict in: {{ unresolvedConflicts.join(', ') }}.
        </p>
        <p v-if="scoreBlock" class="error">Score: {{ scoreBlock }}</p>
        <p v-else-if="contextBlock" class="error">Score: {{ contextBlock }}</p>
        <ul>
          <li v-for="(f, i) in findings" :key="i" :data-severity="f.severity">
            <strong>{{ f.severity }}</strong> <span class="where">{{ f.where }}</span> {{ f.message }}
          </li>
          <li v-for="(f, i) in infos" :key="'i' + i" data-severity="info">{{ f.message }}</li>
        </ul>
      </section>
      <footer>
        <span v-if="owned.includes('score') && result" class="facts">
          render: {{ result.planning_mode }}, ceiling {{ Math.round(result.score_seconds) }} s
        </span>
        <span class="spacer" />
        <button :disabled="!dirty" title="Discard every change made in this editor" @click="revert">Revert</button>
        <button @click="close">Close</button>
        <button class="primary" :disabled="!!applyBlock" :title="applyBlock ?? 'Save your documents into the node'" @click="apply">
          Apply
        </button>
        <button
          v-if="review === 'stop for review'"
          class="primary"
          :disabled="!canApprove"
          :title="scoreBlock ?? 'Release exactly these documents for the next run'"
          @click="approve"
        >
          Approve
        </button>
      </footer>
      <div
        v-if="!geometry.maximized"
        class="resize-handle"
        role="separator"
        aria-label="Resize the window"
        :aria-valuenow="geometry.width"
        :title="`Resize (${geometry.width} × ${geometry.height})`"
        @pointerdown="startResize"
      />
    </div>
  </div>
</template>
