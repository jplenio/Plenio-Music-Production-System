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
import { sameGuide } from './score/tracks'

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
}>()
const emit = defineEmits<{ apply: [state: SheetState, guide: GuideNote[]]; close: [] }>()

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
const dirty = computed(
  () => serializeState(pending.value) !== serializeState(props.state) || !sameGuide(guide.value, props.guide ?? [])
)
const findings = computed<Finding[]>(() => (result.value?.findings ?? []).filter((f) => f.severity !== 'info'))
const infos = computed<Finding[]>(() => (result.value?.findings ?? []).filter((f) => f.severity === 'info'))
const hasErrors = computed(() => findings.value.some((f) => f.severity === 'error'))
const canApprove = computed(
  () =>
    !busy.value &&
    !hasErrors.value &&
    !unresolvedConflicts.value.length &&
    !scoreBlock.value &&
    !!result.value?.fingerprint
)
const applyBlock = computed(() =>
  unresolvedConflicts.value.length ? 'Resolve the conflicts first.' : scoreBlock.value
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
      context: props.payload.context,
      target_seconds: props.payload.target_seconds ?? null
    })
  } catch (e) {
    error.value = e instanceof PlenioApiError ? `${e.message}${e.hint ? ` — ${e.hint}` : ''}` : String(e)
  } finally {
    busy.value = false
  }
}

watch(
  () => working.map((doc) => doc.text + doc.intent).join('\u0000'),
  () => {
    clearTimeout(timer)
    timer = setTimeout(validate, 300)
  }
)

function apply() {
  if (applyBlock.value) return
  emit('apply', withApproval(pending.value, props.state.review?.approved_fingerprint ?? null), guide.value)
}
async function approve() {
  await validate()
  if (canApprove.value) {
    emit('apply', withApproval(pending.value, result.value?.fingerprint ?? null), guide.value)
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
            @edited="onInput(doc)"
            @guide-change="setGuide"
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
            <span>Section tags (YuE2 sings section by section):</span>
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
            <span class="badge">from the other sheet (read-only)</span>
          </div>
          <ScoreTab :doc="contextDoc" :fetcher="fetcher" :payload="payload" :readonly="true" />
        </section>
        <section v-if="tab === 'lyrics' && timeline.length" class="doc sections">
          <div class="doc-head">
            <h3>Sections of the source</h3>
            <span class="badge">from Transcribe Score</span>
          </div>
          <table>
            <tr><th>Section</th><th>Bars</th><th>From</th><th>To</th></tr>
            <tr v-for="(section, index) in timeline" :key="index">
              <td>{{ section.label }}</td><td>{{ section.bars }}</td><td>{{ section.start }}</td><td>{{ section.end }}</td>
            </tr>
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
        <p v-if="error" class="error">{{ error }}</p>
        <p v-if="unresolvedConflicts.length" class="error">
          Resolve the conflict in: {{ unresolvedConflicts.join(', ') }}.
        </p>
        <p v-if="scoreBlock" class="error">Score: {{ scoreBlock }}</p>
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
