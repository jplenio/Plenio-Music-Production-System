<script setup lang="ts">
// A new song or cover: a style (it fills the brief), the brief, how many takes, stems. Plenio makes it at once.
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'

import { call } from '../bridge'
import { fromStyle, grouped, missing, moreStart, request, summary, surprise, type Kind, type Values } from '../form'
import { act, loadBriefs, loadTemplate, online, store } from '../store'
import type { Brief, TemplateDetail } from '../types'
import BriefForm from './BriefForm.vue'
import Icon from './Icon.vue'

const props = defineProps<{ cover: boolean }>()
const emit = defineEmits<{ close: [] }>()

const kind = ref<Kind>(props.cover ? 'cover' : 'song')
const template = ref<TemplateDetail | null>(null)
const styles = ref<Brief[]>([])
const values = ref<Record<string, string[]>>({})
const simple = reactive<Values>({})
const more = reactive<Values>({})
const title = ref('')
const source = ref('')
const takes = ref(store.settings?.takesPerRun ?? 1)
const stems = ref(store.settings?.stems ?? false)
const query = ref('')
const loading = ref(true)
const sending = ref(false)

const groups = computed(() => grouped(styles.value, query.value))
const lacking = computed(() => missing(kind.value, simple, source.value))
const line = computed(() => summary(kind.value, simple))
const sourceName = computed(() => source.value.split(/[\\/]/).pop() ?? '')
const styleName = computed(() => styles.value.find((s) => s.id === simple.template)?.name ?? '')

function replace(target: Values, next: Values): void {
  for (const k of Object.keys(target)) delete target[k]
  Object.assign(target, next)
}

async function load(): Promise<void> {
  loading.value = true
  const [detail, briefs] = await Promise.all([loadTemplate(kind.value === 'cover' ? 'yue2-cover' : 'yue2-song'), loadBriefs(kind.value)])
  template.value = detail
  styles.value = briefs.briefs
  values.value = briefs.values
  replace(more, moreStart(detail))
  // the template's own style first (as the workflow has it), else none
  const current = String(simple.template ?? '')
  const preset = current || String(detail?.fields.find((f) => f.id === 'template')?.default ?? '')
  pick(styles.value.find((s) => s.id === preset) ?? null)
  loading.value = false
  await nextTick()
  document.getElementById(`style-${String(simple.template)}`)?.scrollIntoView({ block: 'center' })
}

function pick(style: Brief | null): void {
  replace(simple, fromStyle(style, kind.value, template.value, { ...simple }))
}

function surpriseMe(): void {
  const s = surprise(styles.value, kind.value)
  if (s) {
    pick(s)
    document.getElementById(`style-${s.id}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }
}

async function chooseSource(): Promise<void> {
  const file = await call<string | null>('file.chooseAudio')
  if (file) source.value = file
}

async function make(): Promise<void> {
  if (lacking.value.length || sending.value) return
  sending.value = true
  const ok = await act('song.new', {
    kind: kind.value,
    fields: request(kind.value, simple, more, template.value),
    title: title.value.trim(),
    sourceFile: source.value,
    takesPerRun: takes.value,
    stems: stems.value
  })
  sending.value = false
  if (ok) emit('close')
}

watch(kind, () => void load())
onMounted(load)

function key(e: KeyboardEvent): void {
  if (e.key === 'Escape') emit('close')
}
</script>

<template>
  <div class="overlay" @mousedown.self="emit('close')" @keydown="key">
    <div class="dialog new-song" role="dialog" aria-modal="true">
      <header>
        <h2>{{ kind === 'cover' ? 'New cover' : 'New song' }}</h2>
        <div class="segmented">
          <button :class="{ on: kind === 'song' }" @click="kind = 'song'"><Icon name="sparkle" :size="13" /> Song</button>
          <button :class="{ on: kind === 'cover' }" @click="kind = 'cover'"><Icon name="cover" :size="13" /> Cover</button>
        </div>
        <button class="btn ghost icon" title="Close" @click="emit('close')"><Icon name="close" :size="16" /></button>
      </header>

      <div class="columns">
        <aside class="styles">
          <div class="search">
            <input v-model="query" class="input" type="search" placeholder="Find a style …" spellcheck="false" />
            <button class="btn icon" title="Surprise me" @click="surpriseMe"><Icon name="sparkle" :size="15" /></button>
          </div>
          <div class="list">
            <button class="style none" :class="{ on: simple.template === 'none' }" @click="pick(null)">
              <b>No style</b><span>only what you write</span>
            </button>
            <template v-for="[group, list] in groups" :key="group">
              <div class="group">{{ group }}</div>
              <button
                v-for="s in list"
                :id="`style-${s.id}`"
                :key="s.id"
                class="style"
                :class="{ on: simple.template === s.id }"
                @click="pick(s)"
              >
                {{ s.name }}
              </button>
            </template>
            <p v-if="!loading && styles.length === 0" class="muted empty">The styles come from Plenio once ComfyUI runs.</p>
          </div>
        </aside>

        <div class="form">
          <div v-if="kind === 'cover'" class="source" :class="{ chosen: source }">
            <Icon name="wave" :size="18" />
            <div class="what">
              <b>{{ source ? sourceName : 'The original recording' }}</b>
              <span class="muted">{{ source ? 'Plenio keeps a copy with the song' : 'WAV, FLAC, MP3, OGG, M4A …' }}</span>
            </div>
            <button class="btn small" @click="chooseSource">{{ source ? 'Another …' : 'Choose …' }}</button>
          </div>
          <div class="chosen-style">
            <span class="field-label">Style</span>
            <b>{{ styleName || 'No style' }}</b>
            <span class="muted">{{ styleName ? 'fills the fields below: change any of them' : 'write what you want below' }}</span>
          </div>
          <div class="field">
            <label class="field-label" for="new-title">Title <span class="muted">(optional)</span></label>
            <input id="new-title" v-model="title" class="input" type="text" placeholder="Plenio finds one" spellcheck="false" />
          </div>
          <div v-if="loading" class="muted">Loading the form …</div>
          <BriefForm v-else-if="template" :kind="kind" :template="template" :values="values" :simple="simple" :more="more" />
          <p v-else class="muted">Plenio's form comes once ComfyUI with Plenio has run once.</p>
        </div>
      </div>

      <footer>
        <div class="runs">
          <span class="field-label">Takes</span>
          <div class="segmented" title="How many takes one run makes: all land on this track">
            <button v-for="n in 4" :key="n" :class="{ on: takes === n }" @click="takes = n">{{ n }}</button>
          </div>
          <label class="toggle" title="Split every take into vocals, drums, bass, other and the rest (about half a minute more per take)">
            <input v-model="stems" type="checkbox" />
            <span class="track" />stems
          </label>
        </div>
        <div class="state">
          <span v-if="lacking.length" class="lacking">Still missing: {{ lacking.join(', ') }}</span>
          <span v-else class="muted line">{{ line }}</span>
        </div>
        <button class="btn" @click="emit('close')">Cancel</button>
        <button class="btn primary make" :disabled="lacking.length > 0 || sending || !online() || loading" @click="make">
          <Icon name="sparkle" :size="15" />{{ takes > 1 ? `Make ${takes} takes` : 'Make it' }}
        </button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.new-song {
  width: min(980px, calc(100vw - 32px));
  height: min(720px, calc(100vh - 32px));
}
header .segmented button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.columns {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr);
  border-top: 1px solid var(--line);
}
.styles {
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-right: 1px solid var(--line);
  background: var(--bg-sunken);
}
.search {
  display: flex;
  gap: 6px;
  padding: 12px;
}
.list {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.group {
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--text-faint);
  font-weight: 650;
  padding: 12px 8px 5px;
}
.style {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  border: none;
  background: transparent;
  padding: 6px 9px;
  border-radius: 7px;
  cursor: pointer;
  color: var(--text-dim);
  font-size: 12.5px;
}
.style:hover {
  background: var(--bg-hover);
  color: var(--text);
}
.style.on {
  background: var(--accent-soft);
  color: white;
  box-shadow: inset 2px 0 0 var(--accent);
}
.style.none span {
  font-size: 11px;
  color: var(--text-faint);
}
.empty {
  padding: 12px 8px;
  font-size: 12px;
}
.form {
  overflow-y: auto;
  padding: 16px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.field-label {
  font-size: 12px;
  color: var(--text-dim);
  font-weight: 550;
}
.source {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px dashed #5a4b85;
  background: rgba(255, 178, 62, 0.05);
  color: var(--amber);
}
.source.chosen {
  border-style: solid;
  border-color: var(--line-strong);
  color: var(--text);
}
.source .what {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.source .what b {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text);
}
.source .muted {
  font-size: 11.5px;
}
.runs {
  display: flex;
  align-items: center;
  gap: 10px;
}
.state {
  flex: 1;
  min-width: 0;
  text-align: right;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.lacking {
  color: var(--amber);
}
.make {
  min-width: 130px;
}
.chosen-style {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding-bottom: 2px;
}
.chosen-style b {
  font-size: 15px;
}
.chosen-style .muted {
  font-size: 12px;
}
</style>
