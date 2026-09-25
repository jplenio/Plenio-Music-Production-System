<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

import { type Fetcher, PlenioApiError, resolveSheet } from '../api/client'
import {
  type Finding,
  type SheetPayload,
  type WorkingDoc,
  nextState,
  normalize,
  startSession,
  upstreamOf,
  withApproval
} from '../shared/sheetSession'
import { type DocumentKind, type SheetState } from '../shared/sheetState'

const props = defineProps<{
  title: string
  state: SheetState
  payload: SheetPayload | null
  owned: DocumentKind[]
  review: string
  fetcher: Fetcher
}>()
const emit = defineEmits<{ apply: [state: SheetState]; close: [] }>()

const LABELS: Record<DocumentKind, string> = {
  title: 'Title',
  style: 'Style',
  lyrics: 'Lyrics',
  score: 'Score (ABC)',
  artwork_prompt: 'Artwork prompt'
}
const ROWS: Record<DocumentKind, number> = { title: 1, style: 3, lyrics: 14, score: 18, artwork_prompt: 3 }

const working = reactive<WorkingDoc[]>(startSession(props.state, props.payload, props.owned))
const result = ref<SheetPayload | null>(props.payload)
const error = ref<string | null>(null)
const busy = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

const docInfo = (kind: DocumentKind) => props.payload?.docs[kind] ?? null
const draftOf = (kind: DocumentKind) => docInfo(kind)?.upstream ?? null
const isConflict = (kind: DocumentKind) => docInfo(kind)?.status === 'conflict'

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
function makeManual(doc: WorkingDoc) {
  doc.intent = 'manual'
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

const unresolvedConflicts = computed(() =>
  working.filter((doc) => isConflict(doc.kind) && doc.intent === 'keep').map((doc) => doc.kind)
)
const pending = computed(() => nextState(props.state, props.payload, working))
const findings = computed<Finding[]>(() => (result.value?.findings ?? []).filter((f) => f.severity !== 'info'))
const infos = computed<Finding[]>(() => (result.value?.findings ?? []).filter((f) => f.severity === 'info'))
const hasErrors = computed(() => findings.value.some((f) => f.severity === 'error'))
const canApprove = computed(
  () => !busy.value && !hasErrors.value && !unresolvedConflicts.value.length && !!result.value?.fingerprint
)

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
  emit('apply', withApproval(pending.value, props.state.review?.approved_fingerprint ?? null))
}
async function approve() {
  await validate()
  if (canApprove.value) emit('apply', withApproval(pending.value, result.value?.fingerprint ?? null))
}
function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}
onMounted(() => {
  window.addEventListener('keydown', onKey)
  if (props.payload) void validate()
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  clearTimeout(timer)
})
</script>

<template>
  <div class="plenio-overlay" @mousedown.self="emit('close')">
    <div class="plenio-dialog" role="dialog" aria-modal="true" :aria-label="title">
      <header>
        <h2>{{ title }}</h2>
        <span class="status" :class="{ bad: hasErrors || unresolvedConflicts.length }">{{
          result?.status ?? 'not run yet'
        }}</span>
        <button class="icon" title="Close (Esc)" @click="emit('close')">×</button>
      </header>
      <p v-if="!payload" class="hint">
        This sheet has not run yet, so there are no drafts to show. Run the workflow once, or enter text and use
        <em>Make manual</em>.
      </p>
      <div class="body">
        <section v-for="doc in working" :key="doc.kind" class="doc">
          <div class="doc-head">
            <h3>{{ LABELS[doc.kind] }}</h3>
            <span class="badge" :data-state="badge(doc)">{{ badge(doc) }}</span>
            <span class="spacer" />
            <button :disabled="draftOf(doc.kind) === null" @click="useDraft(doc)">Use draft</button>
            <button @click="makeManual(doc)">Make manual</button>
          </div>
          <div v-if="isConflict(doc.kind) && doc.intent === 'keep'" class="conflict">
            The draft changed after you edited this document ({{ docInfo(doc.kind)?.reason }}).
            <button @click="keepEdit(doc)">Keep my edit (manual)</button>
            <button @click="useDraft(doc)">Use the new draft</button>
            <button @click="merge(doc)">Merge by hand</button>
          </div>
          <textarea
            v-model="doc.text"
            :rows="ROWS[doc.kind]"
            :class="{ mono: doc.kind === 'score' }"
            spellcheck="false"
            @input="onInput(doc)"
          />
          <details v-if="draftOf(doc.kind) !== null && normalize(draftOf(doc.kind) ?? '') !== normalize(doc.text)">
            <summary>Current draft</summary>
            <pre>{{ draftOf(doc.kind) }}</pre>
          </details>
        </section>
        <section v-for="(text, kind) in payload?.context ?? {}" :key="'context-' + kind" class="doc context">
          <div class="doc-head">
            <h3>{{ LABELS[kind as DocumentKind] ?? kind }}</h3>
            <span class="badge">from the text sheet (read-only)</span>
          </div>
          <pre>{{ text }}</pre>
        </section>
      </div>
      <section class="findings">
        <p v-if="error" class="error">{{ error }}</p>
        <p v-if="unresolvedConflicts.length" class="error">
          Resolve the conflict in: {{ unresolvedConflicts.join(', ') }}.
        </p>
        <ul>
          <li v-for="(f, i) in findings" :key="i" :data-severity="f.severity">
            <strong>{{ f.severity }}</strong> <span class="where">{{ f.where }}</span> {{ f.message }}
          </li>
          <li v-for="(f, i) in infos" :key="'i' + i" data-severity="info">{{ f.message }}</li>
        </ul>
      </section>
      <footer>
        <span class="facts" v-if="owned.includes('score') && result">
          render: {{ result.planning_mode }}, ceiling {{ Math.round(result.score_seconds) }} s
        </span>
        <span class="spacer" />
        <button @click="emit('close')">Cancel</button>
        <button class="primary" :disabled="!!unresolvedConflicts.length" @click="apply">Apply</button>
        <button v-if="review === 'stop for review'" class="primary" :disabled="!canApprove" @click="approve">
          Approve
        </button>
      </footer>
    </div>
  </div>
</template>
