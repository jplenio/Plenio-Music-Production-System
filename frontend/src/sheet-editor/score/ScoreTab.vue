<script setup lang="ts">
/**
 * The Score tab of the Song Sheet editor: notation, ABC text, navigator, operations,
 * playback and validation for one score document. It knows nothing about templates or
 * engines - only the native score dialect and the backend's operations.
 */
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import { type Fetcher, type ScoreOperation, viewUrl } from '../../api/client'
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
import AbcEditor from './AbcEditor.vue'
import NotationView from './NotationView.vue'
import ScoreNavigator from './ScoreNavigator.vue'
import ScorePalette from './ScorePalette.vue'
import ScoreTransport from './ScoreTransport.vue'
import { loadPrefs, savePrefs } from './prefs'
import { useScoreSession } from './useScoreSession'

const props = defineProps<{
  doc: WorkingDoc
  fetcher: Fetcher
  payload: SheetPayload | null
  readonly: boolean
}>()
const emit = defineEmits<{ edited: [] }>()

const session = useScoreSession(props.doc, { fetcher: props.fetcher, onEdit: () => emit('edited') })
const prefs = ref(loadPrefs())
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
const selectedBar = computed(() => session.primary?.bar ?? null)
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
      <label>
        show
        <select v-model="prefs.layout" aria-label="Views to show">
          <option value="both">notation and ABC</option>
          <option value="notation">notation</option>
          <option value="text">ABC text</option>
        </select>
      </label>
      <label title="Zoom of the notation">
        zoom
        <input v-model.number="prefs.zoom" type="range" min="0.6" max="1.8" step="0.1" aria-label="Notation zoom" />
      </label>
      <span v-if="session.pending" class="facts">checking…</span>
      <span v-else-if="session.view?.ok" class="facts ok">✓ valid</span>
      <span v-else-if="invalid" class="facts bad">✖ {{ diagnostics.length }} error(s)</span>
      <span v-if="readonly" class="badge">read-only: owned by the other sheet</span>
    </div>
    <div class="score-main" :data-layout="prefs.layout">
      <ScoreNavigator
        :view="shown"
        :bar="selectedBar"
        :error-bars="errorBars"
        :source-starts="sourceStarts"
        :readonly="readonly"
        @goto="goto"
        @operate="operate"
      />
      <div class="score-views">
        <NotationView
          v-if="prefs.layout !== 'text'"
          :view="shown"
          :stale="invalid"
          :selection="session.selection"
          :playing="cursor"
          :zoom="prefs.zoom"
          tabindex="0"
          @select="(id: string, additive: boolean) => select(id, additive)"
        />
        <AbcEditor
          v-if="prefs.layout !== 'notation'"
          :text="doc.text"
          :diagnostics="diagnostics"
          :reveal="revealRange"
          :readonly="readonly"
          @change="session.typed"
          @cursor="onCursor"
        />
      </div>
    </div>
    <ScoreTransport
      ref="transport"
      v-model:voices="voices"
      v-model:speed="speed"
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
