<script setup lang="ts">
// Beside the timeline: the words (lyrics and the sound), the song's brief, and how the song gets into the project.
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'

import { call } from '../bridge'
import { dragToDaw, type DragWhat } from '../drag'
import { fromStyle, moreGroups, request, type Values } from '../form'
import { act, loadBriefs, loadTemplate, store, toast } from '../store'
import type { Brief, TemplateDetail } from '../types'
import BriefForm from './BriefForm.vue'
import DawGuide from './DawGuide.vue'
import Icon from './Icon.vue'

type Tab = 'words' | 'brief' | 'daw'
const wanted = new URLSearchParams(location.search).get('tab') // the demo's pictures (`?tab=daw`)
const tab = ref<Tab>(wanted === 'brief' || wanted === 'daw' ? wanted : 'words')
const collapsed = ref(false)
const song = computed(() => store.song!)

// --- the words ---

const lyrics = ref('')
const style = ref('')
let lyricsTimer = 0
let styleTimer = 0

function syncWords(): void {
  if (!lyricsTimer) lyrics.value = song.value.documents.lyrics?.text ?? ''
  if (!styleTimer) style.value = song.value.documents.style?.text ?? ''
}
watch(() => [song.value.id, song.value.documents.lyrics?.text, song.value.documents.style?.text], syncWords, { immediate: true })

function typedLyrics(): void {
  window.clearTimeout(lyricsTimer)
  lyricsTimer = window.setTimeout(() => {
    lyricsTimer = 0
    if (lyrics.value !== (song.value.documents.lyrics?.text ?? '')) void act('song.document', { kind: 'lyrics', text: lyrics.value })
  }, 700)
}
function typedStyle(): void {
  window.clearTimeout(styleTimer)
  styleTimer = window.setTimeout(() => {
    styleTimer = 0
    if (style.value !== (song.value.documents.style?.text ?? '')) void act('song.document', { kind: 'style', text: style.value })
  }, 700)
}
onBeforeUnmount(() => {
  window.clearTimeout(lyricsTimer)
  window.clearTimeout(styleTimer)
})

const lyricsChanged = computed(() => song.value.changes.includes('lyrics'))
const styleChanged = computed(() => song.value.changes.includes('style'))
const noTake = computed(() => song.value.takes.length === 0)

// --- the brief ---

const template = ref<TemplateDetail | null>(null)
const styles = ref<Brief[]>([])
const values = ref<Record<string, string[]>>({})
const simple = reactive<Values>({})
const more = reactive<Values>({})
let briefTimer = 0

async function loadBrief(): Promise<void> {
  const kind = song.value.kind
  const [detail, briefs] = await Promise.all([loadTemplate(kind === 'cover' ? 'yue2-cover' : 'yue2-song'), loadBriefs(kind)])
  template.value = detail
  styles.value = briefs.briefs
  values.value = briefs.values
  fillBrief()
}

function fillBrief(): void {
  const f = song.value.fields as Values
  const moreIds = new Set(moreGroups(template.value).flatMap((g) => g.fields.map((x) => x.id)))
  for (const k of Object.keys(simple)) delete simple[k]
  for (const k of Object.keys(more)) delete more[k]
  for (const [k, v] of Object.entries(f)) (moreIds.has(k) ? more : simple)[k] = v
  for (const g of moreGroups(template.value)) for (const x of g.fields) if (!(x.id in more)) more[x.id] = x.default as string | number | boolean
}

watch(
  tab,
  (t) => {
    if (t === 'brief' && !template.value) void loadBrief()
  },
  { immediate: true }
)
watch(
  () => song.value.id,
  () => {
    template.value = null
    if (tab.value === 'brief') void loadBrief()
  }
)
watch(
  () => song.value.fields,
  () => {
    if (!briefTimer && template.value) fillBrief()
  }
)

function briefChanged(): void {
  window.clearTimeout(briefTimer)
  briefTimer = window.setTimeout(() => {
    briefTimer = 0
    void act('song.fields', { fields: request(song.value.kind, simple, more, template.value) })
  }, 600)
}

function pickStyle(id: string): void {
  const s = styles.value.find((x) => x.id === id) ?? null
  const next = fromStyle(s, song.value.kind, template.value, { ...simple })
  for (const k of Object.keys(simple)) delete simple[k]
  Object.assign(simple, next)
  briefChanged()
}

const briefChangedNow = computed(() => song.value.changes.includes('brief'))

// --- the DAW ---

const midiOut = ref(true)
function setMidiOut(on: boolean): void {
  midiOut.value = on
  void call('player.midiOut', { on })
}

const active = computed(() => song.value.takes[song.value.activeTake])
const dawState = computed(() => active.value?.daw ?? '')

function prepare(): void {
  if (active.value) void call('daw.prepare', { index: active.value.index })
}

// the files are made when the tab shows and when another take plays while it shows
watch(
  () => [tab.value, active.value?.number, dawState.value] as const,
  ([t, number, state]) => {
    if (t === 'daw' && number !== undefined && state === '') prepare()
  },
  { immediate: true }
)

// --- REAPER: the song on the project's own tracks ---

const reaperTempo = ref(true)
const placing = ref(false)

async function placeInReaper(): Promise<void> {
  placing.value = true
  try {
    const r = await call<{ state: string }>('reaper.place', { tempo: reaperTempo.value })
    if (r.state === 'preparing') toast('Making the files for REAPER: the tracks follow in a moment.')
  } catch (error) {
    toast(error instanceof Error ? error.message : String(error), true)
  } finally {
    placing.value = false
  }
}

function drag(e: PointerEvent, what: DragWhat['what'], stem?: string): void {
  if (!active.value) return
  dragToDaw(e, { index: active.value.index, what, stem })
}
</script>

<template>
  <aside class="side" :class="{ collapsed }">
    <div class="tabs">
      <template v-if="!collapsed">
        <button :class="{ on: tab === 'words' }" @click="tab = 'words'"><Icon name="lyrics" :size="14" />Words</button>
        <button :class="{ on: tab === 'brief' }" @click="tab = 'brief'"><Icon name="sliders" :size="14" />Brief</button>
        <button :class="{ on: tab === 'daw' }" @click="tab = 'daw'"><Icon name="export" :size="14" />DAW</button>
      </template>
      <div class="spacer" />
      <button class="btn ghost small icon" :title="collapsed ? 'Show the panel' : 'Hide the panel'" @click="collapsed = !collapsed">
        <Icon :name="collapsed ? 'chevron-right' : 'chevron-down'" :size="14" :style="{ transform: collapsed ? '' : 'rotate(90deg)' }" />
      </button>
    </div>

    <div v-if="!collapsed" class="side-scroll">
      <!-- the words -->
      <section v-if="tab === 'words'" class="pane words">
        <div class="pane-head">
          <span class="label">Lyrics</span>
          <span v-if="lyricsChanged" class="chip">changed</span>
          <div class="spacer" />
          <button v-if="lyricsChanged" class="btn ghost small" title="Back to the lyrics of the take" @click="act('song.resetDocument', { kind: 'lyrics' })">
            <Icon name="undo" :size="12" />Undo
          </button>
        </div>
        <textarea
          v-model="lyrics"
          class="textarea lyrics"
          spellcheck="false"
          :placeholder="noTake ? 'The lyrics come with the first take. Or write your own here.' : ''"
          @input="typedLyrics"
        />
        <p class="tip muted">
          Change a word, a line, a part: the next take sings it. New words get new notes; the rest of the song stays.
        </p>
        <div class="pane-head">
          <span class="label">Sound</span>
          <span v-if="styleChanged" class="chip">changed</span>
          <div class="spacer" />
          <button v-if="styleChanged" class="btn ghost small" title="Back to the sound of the take" @click="act('song.resetDocument', { kind: 'style' })">
            <Icon name="undo" :size="12" />Undo
          </button>
        </div>
        <textarea v-model="style" class="textarea sound" rows="3" spellcheck="false" placeholder="genre, instruments, voice …" @input="typedStyle" />
      </section>

      <!-- the brief -->
      <section v-else-if="tab === 'brief'" class="pane">
        <p class="tip muted intro">
          What Plenio wrote the song from. Change it to have the song written anew: new words, new music.
        </p>
        <div v-if="briefChangedNow" class="notice"><Icon name="info" :size="13" />The next run writes the song anew.</div>
        <template v-if="template">
          <div class="field">
            <label class="field-label">Style</label>
            <select class="select" :value="String(simple.template ?? 'none')" @change="pickStyle(($event.target as HTMLSelectElement).value)">
              <option value="none">No style</option>
              <option v-for="s in styles" :key="s.id" :value="s.id">{{ s.group ? `${s.group} · ` : '' }}{{ s.name }}</option>
            </select>
          </div>
          <BriefForm :kind="song.kind" :template="template" :values="values" :simple="simple" :more="more" compact @changed="briefChanged" />
        </template>
        <p v-else class="muted">The brief's form comes from Plenio once ComfyUI has run once.</p>
      </section>

      <!-- the DAW -->
      <section v-else class="pane daw">
        <div v-if="song.reaper?.available" class="card reaper" :class="{ placed: song.reaper.placed }">
          <div class="card-head">
            <Icon :name="song.reaper.placed ? 'check' : 'library'" :size="15" />
            <b>{{ song.reaper.placed ? 'On REAPER’s tracks' : 'REAPER: the song on tracks' }}</b>
          </div>
          <p v-if="!song.reaper.placed" class="muted">
            Every take on one track as REAPER’s takes, the stems, the score as MIDI, the lyrics, the sections as regions.
            This instrument goes quiet while REAPER plays them.
          </p>
          <p v-else class="muted">
            The tracks follow the take you choose, here or on the Song track. This instrument is quiet while REAPER plays.
          </p>
          <label v-if="!song.reaper.placed" class="toggle tempo">
            <input v-model="reaperTempo" type="checkbox" />
            <span class="track" />The project’s tempo map from the song’s bars
          </label>
          <div class="buttons">
            <button class="btn primary small" :disabled="placing || !active" @click="placeInReaper">
              {{ song.reaper.placed ? 'Bring up to date' : 'Put on tracks' }}
            </button>
            <button v-if="song.reaper.placed" class="btn small ghost" title="The tracks stay, as ordinary tracks" @click="act('reaper.forget')">
              Let go
            </button>
          </div>
        </div>
        <template v-if="active">
          <div class="pane-head">
            <span class="label">Drag into your project · Take {{ active.number }}</span>
          </div>
          <p class="tip muted">Drop at the project's start (bar 1): every file starts there, the MIDI with the song's tempo map.</p>
          <div v-if="dawState === 'preparing' || dawState === ''" class="making"><span class="spinner" />Making the files for the DAW …</div>
          <div v-else-if="dawState === 'failed'" class="notice">
            <Icon name="warning" :size="13" />{{ store.daw[active.number]?.problem || 'The files could not be made.' }}
            <button class="btn small" @click="prepare">Again</button>
          </div>
          <div class="tiles" :class="{ waiting: dawState !== 'ready' }">
            <div class="tile" title="Drag onto a track" @pointerdown="drag($event, 'take')">
              <span class="grip"><Icon name="drag" :size="14" /></span>
              <Icon name="wave" :size="17" class="kind" />
              <span class="what"><b>Take {{ active.number }}</b><span class="muted">the song · WAV from bar 1</span></span>
            </div>
            <div v-if="active.stems.length" class="tile" title="Drag onto the DAW: one track each" @pointerdown="drag($event, 'stems')">
              <span class="grip"><Icon name="drag" :size="14" /></span>
              <Icon name="sliders" :size="17" class="kind" />
              <span class="what">
                <b>Stems</b>
                <span class="stems">
                  <span v-for="s in active.stems" :key="s" class="stem" title="Drag this stem alone" @pointerdown.stop="drag($event, 'stem', s)">{{ s }}</span>
                </span>
              </span>
            </div>
            <div class="tile" title="Drag onto a MIDI track" @pointerdown="drag($event, 'midi')">
              <span class="grip"><Icon name="drag" :size="14" /></span>
              <Icon name="music" :size="17" class="kind" />
              <span class="what"><b>MIDI</b><span class="muted">melody, instrument line, chords{{ song.edited.melody || song.edited.instrument || song.edited.chords ? ' · with your edits' : '' }}</span></span>
            </div>
            <div class="tile" title="Drag onto the DAW to take over the song's bars" @pointerdown="drag($event, 'tempo')">
              <span class="grip"><Icon name="drag" :size="14" /></span>
              <Icon name="follow" :size="17" class="kind" />
              <span class="what"><b>Tempo map</b><span class="muted">the song's bars for your project</span></span>
            </div>
            <div v-if="store.daw[active.number]?.click !== false" class="tile" title="Drag onto an audio track" @pointerdown="drag($event, 'click')">
              <span class="grip"><Icon name="drag" :size="14" /></span>
              <Icon name="play" :size="15" class="kind" />
              <span class="what"><b>Click</b><span class="muted">every beat, louder on the bar</span></span>
            </div>
          </div>
          <DawGuide />
          <button class="btn small ghost reveal" :disabled="dawState !== 'ready'" @click="call('daw.reveal', { index: active.index })">
            <Icon name="folder" :size="13" />Show the files
          </button>
        </template>
        <div class="card">
          <div class="card-head"><Icon name="music" :size="15" /><b>Plays in time</b></div>
          <p class="muted">
            This instrument plays the chosen take in time with your project, from bar {{ (song.layout?.leadInBars ?? 0) + 1 }}.
            Set the project's tempo map to the song's bars, and everything you add sits in the song's bars.
          </p>
        </div>
        <div class="card">
          <div class="card-head"><Icon name="wave" :size="15" /><b>Stems on their own channels</b></div>
          <p class="muted">
            Activate the outputs Vocals, Drums, Bass, Other and Rest in your DAW: each stem then plays there, and leaves the
            main output.
          </p>
        </div>
        <div class="card">
          <div class="card-head">
            <Icon name="music" :size="15" /><b>MIDI out</b>
            <div class="spacer" />
            <label class="toggle"><input type="checkbox" :checked="midiOut" @change="setMidiOut(($event.target as HTMLInputElement).checked)" /><span class="track" /></label>
          </div>
          <p class="muted">The melody (channel 1), the instrument line (2) and the chords (3) go out as MIDI: route them to another instrument.</p>
        </div>
        <button class="btn" @click="act('song.reveal')"><Icon name="folder" :size="14" />Show the song's files</button>
      </section>
    </div>
  </aside>
</template>

<style scoped>
.side {
  width: 300px;
  flex: none;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--line);
  background: rgba(22, 19, 31, 0.55);
  min-height: 0;
  transition: width 0.15s;
}
.side.collapsed {
  width: 40px;
}
.tabs {
  height: 38px;
  flex: none;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 0 6px;
  border-bottom: 1px solid var(--line);
}
.tabs > button:not(.btn) {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border: none;
  border-radius: 7px;
  background: transparent;
  color: var(--text-dim);
  cursor: pointer;
  font-size: 12.5px;
}
.tabs > button:not(.btn):hover {
  color: var(--text);
}
.tabs > button.on {
  background: var(--bg-hover);
  color: var(--text);
}
.spacer {
  flex: 1;
}
.side-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
.pane {
  padding: 12px 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.pane-head {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 26px;
}
.words {
  height: 100%;
}
.lyrics {
  flex: 1;
  min-height: 260px;
  resize: none;
  line-height: 1.6;
  font-size: 13px;
}
.sound {
  min-height: 64px;
}
.tip {
  margin: 0;
  font-size: 11.5px;
  line-height: 1.5;
}
.intro {
  margin-bottom: 2px;
}
.notice {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 10px;
  border-radius: 8px;
  background: rgba(255, 178, 62, 0.08);
  border: 1px solid rgba(255, 178, 62, 0.25);
  color: #f3d7a6;
  font-size: 12px;
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
.making {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-dim);
}
.spinner {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid rgba(176, 92, 255, 0.3);
  border-top-color: var(--accent);
  animation: spin 0.8s linear infinite;
}
.tiles {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.tiles.waiting {
  opacity: 0.5;
}
.tile {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px 9px 6px;
  border-radius: 10px;
  background: linear-gradient(180deg, #1f1a2d, #1a1626);
  border: 1px solid var(--line-strong);
  cursor: grab;
  transition: border-color 0.12s, transform 0.08s;
}
.tile:hover {
  border-color: #5a4b85;
}
.tile:active {
  cursor: grabbing;
  transform: scale(0.99);
}
.grip {
  color: var(--text-faint);
  display: grid;
  place-items: center;
}
.kind {
  color: #c9a8ff;
  flex: none;
}
.what {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.3;
}
.what .muted {
  font-size: 11.5px;
}
.stems {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 3px;
}
.stem {
  font-size: 11px;
  padding: 1px 7px;
  border-radius: 9px;
  background: var(--bg-sunken);
  border: 1px solid var(--line);
  color: var(--text-dim);
  text-transform: capitalize;
  cursor: grab;
}
.stem:hover {
  border-color: var(--accent);
  color: var(--text);
}
.howto {
  font-size: 12px;
  color: var(--text-dim);
}
.howto summary {
  cursor: pointer;
  color: var(--text);
  font-weight: 550;
  padding: 4px 0;
}
.howto p {
  margin: 4px 0;
  line-height: 1.45;
}
.reveal {
  align-self: flex-start;
}
.card.reaper {
  border-color: rgba(176, 92, 255, 0.45);
  background: linear-gradient(180deg, rgba(138, 77, 255, 0.12), rgba(26, 23, 36, 0.9));
}
.card.reaper.placed {
  border-color: rgba(79, 209, 165, 0.4);
}
.card.reaper.placed .card-head svg {
  color: var(--ok);
}
.card .tempo {
  margin-top: 10px;
  font-size: 12px;
}
.card .buttons {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}
.card {
  padding: 12px;
  border-radius: 10px;
  background: var(--bg-raised);
  border: 1px solid var(--line);
}
.card-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.card p {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
}
</style>
