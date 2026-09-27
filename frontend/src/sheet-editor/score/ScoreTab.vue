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
 */
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import {
  type Fetcher,
  type GuideNote,
  type MidiImportResult,
  type ScoreOperation,
  exportMidi,
  viewUrl
} from '../../api/client'
import type { VoiceSwitches } from '../../shared/playback'
import {
  describe,
  elementAtSource,
  elementById,
  firstElementOfBar,
  neighbour,
  nextDuration,
  otherVoice
} from '../../shared/scoreView'
import type { SheetPayload, WorkingDoc } from '../../shared/sheetSession'
import LyricsFit from '../LyricsFit.vue'
import AbcEditor from './AbcEditor.vue'
import Inspector from './Inspector.vue'
import MidiDialog from './MidiDialog.vue'
import NotationView from './NotationView.vue'
import PianoRoll from './PianoRoll.vue'
import ScoreNavigator from './ScoreNavigator.vue'
import ScorePalette from './ScorePalette.vue'
import ScoreTransport from './ScoreTransport.vue'
import { type Layout, focusOf, initialLayout } from './inspector'
import { downloadBytes, fromBase64, toBase64 } from './midiImport'
import { loadPrefs, savePrefs } from './prefs'
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
}>()
const emit = defineEmits<{
  edited: []
  /** The commit gate for ``text``: why it cannot be applied/approved (``null``: it can). */
  gate: [text: string, reason: string | null]
  /** The Guide notes an import brought in (stored in the node's properties). */
  guideChange: [guide: GuideNote[]]
}>()

const session = useScoreSession(props.doc, { fetcher: props.fetcher, onEdit: () => emit('edited') })
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
const review = computed(() => layout.value === 'review')
const showRoll = computed(() => review.value && prefs.value.roll && !!(shown.value?.model || shown.value?.model_error))
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

const rollZoom = computed<number>({
  get: () => prefs.value.rollZoom,
  set: (value) => (prefs.value = { ...prefs.value, rollZoom: value })
})

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

/** Replace the score with the imported one (one undo step) and take its Guide notes over. */
function insertMidi(result: MidiImportResult, keepGuide: boolean): void {
  if (props.readonly) return
  const name = midiRequest.value?.filename ?? 'file'
  session.replaceText(result.abc, `import MIDI (${name})`, result.analysis)
  if (keepGuide && props.guide !== undefined && result.guide.length) emit('guideChange', result.guide)
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
  if (isTextTarget(event.target) || mod) return
  const view = shown.value
  const primary = session.primary
  if (event.key === ' ') {
    event.preventDefault()
    transport.value?.toggle()
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
          :aria-checked="review"
          :class="{ active: review }"
          title="Piano roll, notation and inspector; the ABC text under Advanced"
          @click="chooseLayout('review')"
        >
          Review
        </button>
        <button
          role="radio"
          :aria-checked="!review"
          :class="{ active: !review }"
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
      <span class="midi-tools" role="group" aria-label="MIDI">
        <button
          :disabled="midiBusy || !!midiBlock"
          :title="midiBlock ?? 'Download this score as a standard MIDI file (Vocal, Instrument, Chords and the Guide track)'"
          @click="exportScore"
        >
          Export MIDI
        </button>
        <button
          :disabled="readonly"
          :title="readonly ? 'This score belongs to the other sheet.' : 'Read a MIDI file as the score (the report is shown before anything is replaced)'"
          @click="chooseMidi"
        >
          Import MIDI…
        </button>
        <input
          ref="midiFile"
          class="hidden-file"
          type="file"
          accept=".mid,.midi,audio/midi,audio/x-midi"
          aria-label="MIDI file"
          @change="onMidiFile"
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
      :view="shown"
      :selection="session.selection"
      :playing="cursor"
      :operate="operateRoll"
      :readonly="readonly"
      :stale="invalid"
      :busy="session.busy"
      resize-mode="rests"
      @select="selectFromRoll"
    />
    <div
      class="score-main"
      :class="{ 'with-roll': showRoll && !!shown?.model, 'with-inspector': review }"
      :data-layout="layout"
      :data-text="review ? (prefs.advanced ? 'shown' : 'hidden') : 'main'"
    >
      <div class="side">
        <ScoreNavigator
          :view="shown"
          :bar="selectedBar"
          :error-bars="errorBars"
          :source-starts="sourceStarts"
          :readonly="readonly"
          @goto="goto"
          @operate="operate"
        />
        <details v-if="review && lyrics" class="fit-panel">
          <summary>Lyrics fit</summary>
          <LyricsFit
            :lyrics="lyrics"
            :abc="doc.text"
            :fetcher="fetcher"
            :engine="payload?.engine ?? null"
            :instrumental="payload?.instrumental ?? false"
          />
        </details>
      </div>
      <div class="score-views">
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
      :bar="selectedBar"
      :reference="reference"
      :timeline-bars="timelineBars"
      @cursor="(ids: string[]) => (cursor = ids)"
    />
    <p class="status" aria-live="polite">
      <span>{{ session.selection.length > 1 ? `${session.selection.length} selected · ` : '' }}{{ describe(session.primary, unit) }}</span>
      <span v-for="(note, index) in session.notes" :key="index" class="change">{{ note }}</span>
    </p>
    <p v-if="session.error" class="error" role="alert">{{ session.error }}</p>
    <p v-if="midiError" class="error" role="alert">MIDI: {{ midiError }}</p>
    <MidiDialog
      v-if="midiRequest"
      :fetcher="fetcher"
      :data="midiRequest.data"
      :filename="midiRequest.filename"
      :view="shown"
      :keeps-guide="keepsGuide"
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
