<script setup lang="ts">
/**
 * Plenio Setup in ComfyUI's sidebar (PD 4.1): this computer, what the user wants, the plan of files, the
 * downloads, the test song, and where to go next. Setup proposes and the user confirms: nothing is fetched
 * before *Download all* (or a row's *Download*), and every step can be left and taken up again.
 */
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

import { type Fetcher, PlenioApiError } from '../api/client'
import AccessDialog from './AccessDialog.vue'
import { type FindingsAnswer, setupApi } from './api'
import {
  type DownloadView,
  EXTRAS,
  type FolderView,
  type PlanView,
  type RowAction,
  STEPS,
  STEP_TITLES,
  type SetupState,
  type Step,
  formatBytes,
  planRows,
  planTotals,
  rowView,
  startStep,
  type TestJob,
  testView,
  wantedTemplates
} from './model'

const props = defineProps<{
  fetcher: Fetcher
  /** Subscribe to ``plenio.download`` events; returns the unsubscribe. */
  onDownloads: (listener: (download: DownloadView) => void) => () => void
  /** Open a template by its title (Home and step 6). */
  openTemplate: (title: string) => void
  openPlayer: () => void
  /** A component to show first (a run stopped at its missing file). */
  focus?: string | null
}>()

const state = ref<SetupState | null>(null)
const version = ref('')
const plan = ref<PlanView | null>(null)
const findings = ref<FindingsAnswer | null>(null)
const folders = ref<Record<string, FolderView[]>>({})
const target = reactive<Record<string, string>>({})
const choices = reactive<Record<string, string>>({})
const downloads = reactive<Record<string, DownloadView>>({})
const step = ref<Step>('computer')
const error = ref<string | null>(null)
const busy = ref(false)
const access = ref<string | null>(null)
/** Files that arrived while the page is open (the plan says so once it is read again). */
const arrived = reactive(new Set<string>())
let unsubscribe: (() => void) | null = null
const testJob = ref<TestJob | null>(null)
const testRefused = ref<{ message: string; hint?: string | null } | null>(null)
const testing = ref(false)
const test = computed(() => testView(testJob.value, testRefused.value))
let following = true

/** Queue the test song and follow its job until it ends (the API answers when something changes). */
async function runTest(): Promise<void> {
  testing.value = true
  testRefused.value = null
  testJob.value = null
  try {
    let job = await setupApi.testSong(props.fetcher)
    testJob.value = job
    while (following && !['succeeded', 'failed', 'cancelled'].includes(job.status)) {
      job = await setupApi.job(props.fetcher, job.id)
      testJob.value = job
    }
  } catch (reason) {
    testRefused.value =
      reason instanceof PlenioApiError ? { message: reason.message, hint: reason.hint } : { message: message(reason) }
  } finally {
    testing.value = false
  }
}

function message(reason: unknown): string {
  if (reason instanceof PlenioApiError) return reason.hint ? `${reason.message} ${reason.hint}` : reason.message
  return reason instanceof Error ? reason.message : String(reason)
}

const templates = computed(() => (state.value ? wantedTemplates(state.value) : []))
const rows = computed(() =>
  plan.value && state.value ? planRows(plan.value, templates.value, state.value.extras, choices) : []
)
const totals = computed(() => planTotals(rows.value))
const allTemplates = computed(() => (plan.value?.templates ?? []).map((t) => t.template))
const blocked = computed(() => plan.value?.policy.offline || plan.value?.policy.downloads === 'off')

async function load(): Promise<void> {
  try {
    const [answer, view, found, where] = await Promise.all([
      setupApi.state(props.fetcher),
      setupApi.plan(props.fetcher),
      setupApi.findings(props.fetcher),
      setupApi.folders(props.fetcher)
    ])
    state.value = answer.state
    version.value = answer.version
    plan.value = view
    findings.value = found
    folders.value = where.folders
    for (const item of view.downloads) downloads[item.id] = item
    step.value = props.focus ? 'plan' : startStep(answer.state, rows.value)
    error.value = null
  } catch (reason) {
    error.value = message(reason)
  }
}

async function refreshPlan(): Promise<void> {
  try {
    plan.value = await setupApi.plan(props.fetcher)
  } catch (reason) {
    error.value = message(reason)
  }
}

async function save(change: Partial<SetupState>): Promise<void> {
  try {
    const answer = await setupApi.saveState(props.fetcher, change)
    state.value = answer.state
  } catch (reason) {
    error.value = message(reason)
  }
}

function go(next: Step): void {
  step.value = next
  void save({ step: next, ...(next === 'go' ? { done: true } : {}) })
}

function toggleTemplate(title: string, on: boolean): void {
  if (!state.value) return
  const current = new Set(wantedTemplates(state.value))
  if (on) current.add(title)
  else current.delete(title)
  void save({ templates: allTemplates.value.filter((t) => current.has(t)) })
}

function toggleExtra(id: string, on: boolean): void {
  if (!state.value) return
  const current = new Set(state.value.extras)
  if (on) current.add(id)
  else current.delete(id)
  void save({ extras: EXTRAS.map((e) => e.id).filter((e) => current.has(e)) })
}

async function start(variants: string[]): Promise<void> {
  if (!variants.length) return
  busy.value = true
  try {
    const answer = await setupApi.download(props.fetcher, variants, { ...target })
    for (const item of answer.downloads) downloads[item.id] = item
    error.value = null
    if (step.value === 'plan') go('downloads')
  } catch (reason) {
    error.value = message(reason)
  } finally {
    busy.value = false
  }
}

async function act(action: RowAction, variant: string): Promise<void> {
  try {
    if (action === 'download' || action === 'retry') return await start([variant])
    if (action === 'access') {
      access.value = variant
      return
    }
    const call = { pause: setupApi.pause, resume: setupApi.resume, cancel: setupApi.cancel }[action]
    const answer = await call(props.fetcher, variant)
    downloads[answer.download.id] = answer.download
  } catch (reason) {
    error.value = message(reason)
  }
}

const ACTION_LABELS: Record<RowAction, string> = {
  download: 'Download',
  pause: 'Pause',
  resume: 'Resume',
  cancel: 'Cancel',
  retry: 'Try again',
  access: 'What to do'
}

/** A row as it stands: installed by the plan or by a download of this visit - a download the manager remembers
 * as installed counts only while its file is there, which the plan says. */
function view(row: { variant: { id: string; installed: boolean } }) {
  const download = downloads[row.variant.id]
  const installed = row.variant.installed || arrived.has(row.variant.id)
  return rowView(installed, download?.state === 'installed' ? undefined : download)
}

function cardLine(): string {
  const computer = findings.value?.computer
  const gpu = (computer?.devices ?? []).filter((d) => d.kind !== 'cpu').sort((a, b) => (b.total_bytes ?? 0) - (a.total_bytes ?? 0))[0]
  const parts = [
    gpu ? `${gpu.name} · ${formatBytes(gpu.total_bytes ?? 0)}` : 'no graphics card',
    computer?.ram_total_bytes ? `${formatBytes(computer.ram_total_bytes)} RAM` : '',
    computer?.disk_free_bytes != null ? `${formatBytes(computer.disk_free_bytes)} free on the models drive` : ''
  ]
  return parts.filter(Boolean).join(' · ')
}

const attention = computed(() => (findings.value?.findings ?? []).filter((f) => f.severity !== 'ok'))
const allInstalled = computed(() => rows.value.length > 0 && rows.value.every((r) => r.variant.installed || arrived.has(r.variant.id)))

function copy(text: string): void {
  void navigator.clipboard?.writeText(text)
}

watch(
  () => Object.values(downloads).map((d) => d.state).join(','),
  (now, before) => {
    if (now !== before && now.includes('installed')) void refreshPlan()
  }
)

onMounted(() => {
  unsubscribe = props.onDownloads((item) => {
    downloads[item.id] = item
    if (item.state === 'installed') arrived.add(item.id)
    else arrived.delete(item.id)
  })
  void load()
})
onBeforeUnmount(() => {
  following = false
  unsubscribe?.()
})
</script>

<template>
  <div class="plenio-setup">
    <header>
      <h2>Plenio Setup</h2>
      <span class="version" v-if="version">{{ version }}</span>
    </header>
    <nav class="steps">
      <button
        v-for="(name, index) in STEPS"
        :key="name"
        :class="{ current: step === name }"
        @click="go(name)"
      >
        {{ index + 1 }} {{ STEP_TITLES[name] }}
      </button>
    </nav>
    <p v-if="error" class="error" role="alert">{{ error }}</p>
    <p v-if="!state && !error" class="hint">Reading this computer…</p>

    <section v-if="state && step === 'computer'">
      <p class="line">{{ cardLine() }}</p>
      <p class="hint">ComfyUI {{ findings?.computer.comfyui }} · {{ findings?.computer.platform }}</p>
      <ul class="findings" v-if="attention.length">
        <li v-for="item in attention" :key="item.id + item.text" :class="item.severity">
          <span>{{ item.text }}</span>
          <button v-if="item.fix?.action === 'copy'" @click="copy(item.fix.payload.text)">{{ item.fix.label }}</button>
          <a v-else-if="item.fix?.action === 'open_url'" :href="item.fix.payload.url" target="_blank" rel="noopener">{{ item.fix.label }}</a>
        </li>
      </ul>
      <p v-else class="ok">Nothing on this computer needs attention.</p>
      <button class="primary" @click="go('wants')">Next</button>
    </section>

    <section v-if="state && step === 'wants'">
      <p class="hint">Setup plans the files for what you tick. You can change it later.</p>
      <label v-for="title in allTemplates" :key="title" class="choice">
        <input type="checkbox" :checked="templates.includes(title)" @change="toggleTemplate(title, ($event.target as HTMLInputElement).checked)" />
        {{ title }}
      </label>
      <p class="hint">Optional parts of these templates:</p>
      <label v-for="extra in EXTRAS" :key="extra.id" class="choice">
        <input type="checkbox" :checked="state.extras.includes(extra.id)" @change="toggleExtra(extra.id, ($event.target as HTMLInputElement).checked)" />
        {{ extra.label }}
      </label>
      <button class="primary" @click="go('plan')">Next</button>
    </section>

    <section v-if="state && step === 'plan'">
      <p class="line">
        {{ rows.length }} files · {{ totals.files }} to download · {{ formatBytes(totals.bytes) }}
      </p>
      <p v-if="totals.nonCommercial.length" class="warn">Non-commercial licence: {{ totals.nonCommercial.join(', ') }}.</p>
      <p v-if="plan?.policy.offline" class="warn">Offline mode is on: Setup fetches nothing. Place the files as each row says.</p>
      <p v-else-if="plan?.policy.downloads === 'off'" class="warn">Downloads are switched off in config.toml ([models] downloads).</p>
      <div v-for="row in rows" :key="row.component" class="row" :class="{ focus: focus === row.component }">
        <div class="what">
          <strong>{{ row.title }}</strong>
          <select
            v-if="row.variants.length > 1"
            :value="row.variant.id"
            @change="choices[row.component] = ($event.target as HTMLSelectElement).value"
          >
            <option
              v-for="variant in row.variants"
              :key="variant.id"
              :value="variant.id"
            >
              {{ variant.file }} · {{ formatBytes(variant.bytes) }}{{ variant.id === row.planned ? ' (the plan)' : '' }}
            </option>
          </select>
          <span class="hint">{{ row.reason }}<template v-if="row.warning"> - {{ row.warning }}</template></span>
          <span class="hint">models/{{ row.folder }} · {{ row.variant.licence }} · {{ formatBytes(row.variant.bytes) }}</span>
        </div>
        <span class="state" :class="view(row).tone">
          {{ view(row).status }}
        </span>
      </div>
      <details v-if="Object.keys(folders).length" class="folders">
        <summary>Where the files go</summary>
        <label v-for="(list, kind) in folders" :key="kind" class="folder">
          <span>models/{{ kind }}</span>
          <select v-model="target[kind]">
            <option v-for="folder in list" :key="folder.path" :value="folder.path">
              {{ folder.path }}{{ folder.free_bytes != null ? ` · ${formatBytes(folder.free_bytes)} free` : '' }}
            </option>
          </select>
        </label>
      </details>
      <button
        class="primary"
        :disabled="busy || blocked || totals.files === 0"
        @click="start(rows.filter((r) => !r.variant.installed).map((r) => r.variant.id))"
      >
        Download all ({{ formatBytes(totals.bytes) }})
      </button>
      <button v-if="totals.files === 0" class="primary" @click="go('test')">Next</button>
    </section>

    <section v-if="state && step === 'downloads'">
      <div v-for="row in rows" :key="row.component" class="row">
        <div class="what">
          <strong>{{ row.title }}</strong>
          <span class="hint">{{ row.variant.file }}</span>
          <progress
            v-if="view(row).progress !== null"
            :value="view(row).progress ?? 0"
            max="1"
          />
          <span class="hint">{{ view(row).detail }}</span>
        </div>
        <span class="state" :class="view(row).tone">
          {{ view(row).status }}
        </span>
        <button
          v-for="action in view(row).actions"
          :key="action"
          :disabled="blocked && (action === 'download' || action === 'retry')"
          @click="act(action, row.variant.id)"
        >
          {{ ACTION_LABELS[action] }}
        </button>
      </div>
      <button class="primary" :disabled="!allInstalled" @click="go('test')">Next</button>
    </section>

    <section v-if="state && step === 'test'">
      <p>
        The test song makes a one-minute instrumental with 1 · YuE2 · Song and your files - no cover art, no HQ - so
        that a problem shows here, not in your first song.
      </p>
      <p v-if="test.text" :class="test.state === 'ok' ? 'ok' : test.state === 'failed' ? 'error' : 'hint'">{{ test.text }}</p>
      <audio v-if="test.audio" :src="test.audio" controls preload="none" />
      <ul v-if="test.finding" class="findings">
        <li :class="test.finding.severity">
          <span>{{ test.finding.text }}</span>
          <button v-if="test.finding.fix" @click="go('plan')">{{ test.finding.fix.label }}</button>
        </li>
      </ul>
      <button v-if="test.state !== 'running'" class="primary" :disabled="testing" @click="runTest">
        {{ test.state === 'idle' ? 'Make the test song' : 'Make it again' }}
      </button>
      <button @click="go('go')">{{ test.state === 'ok' ? 'Next' : 'Skip' }}</button>
    </section>

    <section v-if="state && step === 'go'">
      <div class="go">
        <button v-for="title in templates" :key="title" class="primary" @click="openTemplate(title)">{{ title }}</button>
        <button @click="openPlayer()">Open the player</button>
      </div>
    </section>

    <AccessDialog v-if="access" :fetcher="fetcher" :variant="access" @close="access = null" @ready="(v) => { access = null; void start([v]) }" />
  </div>
</template>
