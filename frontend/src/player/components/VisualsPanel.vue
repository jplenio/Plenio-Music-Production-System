<script setup lang="ts">
/**
 * The visuals' settings: the mode (auto, random from a choice, cycle, fixed), when it changes, the colours,
 * the sensitivity - and a visual of its own for this song or for the playlist that plays. Plenio Drop's and Nova's
 * quality, and the listener's own Drop presets: the folder, the files that do not work and why, a copy of a
 * preset to edit.
 *
 * The visuals to choose from in a compact overview (owner's request 2026-10-29: many visuals, yet easy to oversee):
 * a search and the moods they suit, the groups folded with how many are ticked, each visual a small chip (what it
 * shows on hovering) - its name shows it now (with *Fixed*: for good), its tick lets the mode choose it. Only what
 * this device can draw smoothly is offered (owner's request 2026-10-30); what is not, and why, is said under its
 * group, and the lists of one visual show it greyed with the reason (a Nova visual still being timed, too heavy).
 */
import { COLLECTIONS, type Show, energyLevel, energyOf, energySettings, inCollection, showOf, showSettings } from '../visuals/collections'
import { loadPosters, posterOf, posterSheet } from '../visuals/posters'
import { computed, nextTick, onMounted, ref } from 'vue'

import { guestStatus } from '../guests'
import { current, queueSource, say, settings, state } from '../store'
import { CLASSIC, PRESETS, presetById, type Preset, type Scheme } from '../visuals/presets'
import type { SwitchOn, VisualMode } from '../visuals/chooser'
import { FADE_STYLES } from '../visuals/mixer'
import { copyToMyPresets, myPresetErrors, myPresetFile, myPresetFolder, myPresets, openMyPresetFolder, playingFile } from '../visuals/drop'
import { gpuSupport, leftOut, novaSmooth, novaTimings, offered, takeBackLeftOut } from '../visuals/gpu'
import Icon from './Icon.vue'
import { isPortable } from '../portable'

const props = defineProps<{ active: string }>()
const emit = defineEmits<{ close: []; next: []; play: [id: string]; fullscreen: [] }>()

const GUIDE = 'https://github.com/jplenio/Plenio-Music-Production-System/blob/main/docs/user/concepts/player-visuals.md'
const QUALITY: [number, string][] = [
  [0.5, 'Fast - for a slow computer'],
  [0.75, 'Balanced'],
  [1, 'Sharp - finest'],
]
const support = gpuSupport()

interface Group {
  id: string
  label: string
  /** Every visual of the group, and the ones offered here. */
  all: Preset[]
  offered: Preset[]
  /** What is not offered here, and why. */
  notes: string[]
  /** The visuals not offered here, each with why: greyed in the lists of one visual. */
  unavailable: { preset: Preset; why: string }[]
}

function names(list: Preset[]): string {
  return list.map((p) => shortName(p.name)).join(', ')
}

const GROUPS = computed<Group[]>(() => {
  const drop = PRESETS.filter((p) => p.kind === 'drop')
  const nova = PRESETS.filter((p) => p.kind === 'nova')
  const groups: Group[] = []
  const out = (list: Preset[]) => list.filter((p) => leftOut.value.has(p.id))
  groups.push({ id: 'classic', label: 'Classic', all: CLASSIC, offered: CLASSIC.filter(offered), notes: [], unavailable: [] })
  if (support.webgl) {
    groups.push({ id: 'drop', label: 'Plenio Drop', all: drop, offered: drop.filter(offered), notes: [], unavailable: [] })
    {
      const waiting = nova.filter((p) => novaTimings.value[p.id] === undefined)
      const heavy = nova.filter((p) => novaSmooth(p.id) === false && novaTimings.value[p.id] !== -1)
      const broken = nova.filter((p) => novaTimings.value[p.id] === -1)
      const notes: string[] = []
      if (waiting.length) notes.push(`Timing them on this graphics card … ${nova.length - waiting.length} of ${nova.length} done - offered once they play smoothly here.`)
      if (heavy.length) notes.push(`Too heavy to play smoothly on this graphics card, so not offered here: ${names(heavy)} (timed again each time the player opens).`)
      if (broken.length) notes.push(`Not working in this browser: ${names(broken)}.`)
      const unavailable = [
        ...waiting.map((preset) => ({ preset, why: 'being timed on this graphics card …' })),
        ...heavy.map((preset) => ({ preset, why: 'too heavy for this graphics card' })),
        ...broken.map((preset) => ({ preset, why: 'not working in this browser' })),
      ]
      groups.push({ id: 'nova', label: 'Plenio Nova', all: nova, offered: nova.filter(offered), notes, unavailable })
    }
    if (myPresets.value.length) groups.push({ id: 'mine', label: 'My presets', all: myPresets.value, offered: myPresets.value.filter(offered), notes: [], unavailable: [] })
  }
  for (const g of groups) {
    const gone = out(g.all)
    if (gone.length) g.notes.push(`Left out for now - they did not keep up here: ${names(gone)}.`)
    for (const preset of gone) if (!g.unavailable.some((u) => u.preset === preset)) g.unavailable.push({ preset, why: 'left out for now - did not keep up' })
  }
  return groups
})
const offeredAll = computed(() => GROUPS.value.flatMap((g) => g.offered))
const activePreset = computed(() => presetById(props.active))
const copying = ref(false)

/** Why Plenio Drop or Nova are not offered at all here. */
const gpuNote = computed(() => {
  if (!support.webgl) return `Plenio Drop and Plenio Nova are not offered here: ${support.why}`
  if (!support.float) return 'Plenio Nova draws its light in eight bits here (this graphics card has no pictures in half floats): its glow is a little coarser.'
  return ''
})

// --- finding one ----------------------------------------------------------------------------------------------------

const query = ref('')
const mood = ref('')
const MOODS = ['energetic', 'calm', 'electronic', 'acoustic', 'dark']
const opened = ref(new Set<string>([presetById(props.active)?.kind === 'nova' ? 'nova' : presetById(props.active)?.kind === 'drop' ? 'drop' : 'classic']))
const filtering = computed(() => !!query.value.trim() || !!mood.value)

function matches(p: Preset): boolean {
  const words = query.value.toLowerCase().split(/\s+/).filter(Boolean)
  const text = `${p.name} ${p.blurb} ${p.suits.join(' ')}`.toLowerCase()
  if (!words.every((w) => text.includes(w))) return false
  return !mood.value || p.suits.includes(mood.value) || p.suits.includes('any')
}
const shown = computed(() => GROUPS.value.map((g) => ({ ...g, shown: g.offered.filter(matches), ticked: g.offered.filter((p) => v.pool.includes(p.id)).length })))

function isOpen(id: string, count: number): boolean {
  return filtering.value ? count > 0 : opened.value.has(id)
}
function toggleOpen(id: string): void {
  const next = new Set(opened.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  opened.value = next
}
/** A visual's name in its group (without "Drop · ", "Nova · ", "My · "). */
function shortName(name: string): string {
  return name.replace(/^(Drop|Nova|My) · /, '')
}

// --- the settings -------------------------------------------------------------------------------------------------

const v = settings.visuals
const show = computed(() => showOf(v))
onMounted(() => void loadPosters())
const showName = computed(() => COLLECTIONS.find((c) => c.id === show.value)?.name ?? (show.value === 'favourites' ? 'My favourites' : 'every visual'))
/** The visuals of the collection shown, by picture (posters.ts): click one to see it now. */
const pictures = computed(() => {
  const ids = offeredAll.value.map((p) => p.id)
  const chosen = show.value === 'director' || show.value === 'all' || show.value === 'one' || show.value === 'off' ? ids : inCollection(show.value, ids, v.favourites)
  return offeredAll.value.filter((p) => chosen.includes(p.id) && posterSheet.value?.ids.includes(p.id))
})
const energy = computed(() => energyOf(v))
const energyName = computed(() => energyLevel(energy.value).name.replace(/^./, (c) => c.toUpperCase()))
function setShow(next: Show): void {
  Object.assign(v, showSettings(next))
  emit('next')
}
function setEnergy(value: number): void {
  Object.assign(v, energySettings(value))
}
/** ♥: more of this - it joins My favourites (and the visuals to choose from). */
function love(id: string): void {
  v.favourites = v.favourites.includes(id) ? v.favourites.filter((x) => x !== id) : [...v.favourites, id]
  if (!v.pool.includes(id)) v.pool = [...v.pool, id]
}
/** ✕: never this one - it leaves the pool, and another visual comes. */
function never(id: string): void {
  v.pool = v.pool.filter((x) => x !== id)
  v.favourites = v.favourites.filter((x) => x !== id)
  emit('next')
}
const MODES: [VisualMode, string, string][] = [
  ['auto', 'Match the music', 'A visual that suits the song’s genre, mood and tempo'],
  ['director', 'Director', 'One visual per kind of section - every chorus the same - changing on the downbeat; a drop flashes'],
  ['random', 'Random', 'From the visuals ticked below'],
  ['cycle', 'Cycle', 'Through the ticked visuals in turn'],
  ['fixed', 'Fixed', 'Always the same visual'],
]
const SWITCHES: [SwitchOn, string][] = [
  ['song', 'With every song'],
  ['section', 'At every section (verse, chorus …)'],
  ['interval', 'Every few seconds - also within a song'],
  ['drop', 'When the music drops in'],
]
const SCHEMES: [Scheme, string][] = [
  ['song', 'The song’s colours'],
  ['winamp', 'Winamp classic'],
  ['neon', 'Neon'],
  ['sunset', 'Sunset'],
  ['mono', 'Monochrome'],
]

const playlist = computed(() => state.playlists.find((p) => p.id === queueSource.value) ?? null)
const songOwn = computed(() => (current.value ? v.songs[current.value.id] ?? '' : ''))
/** A visual chosen before that this device does not draw (another computer's choice): shown, not offered. */
const notHere = (id: string | undefined): Preset | null => {
  const preset = id ? presetById(id) : undefined
  return preset && !offeredAll.value.includes(preset) ? preset : null
}

/** A visual's name clicked: shown now - with *Fixed* the fixed one from now on, else until the next change. Shown
 * once the new fixed one has been taken up: a song's or a playlist's own visual comes before it, not before a click. */
function play(id: string): void {
  if (v.mode === 'fixed') v.fixed = id
  void nextTick(() => emit('play', id))
}
function togglePool(id: string): void {
  const at = v.pool.indexOf(id)
  if (at >= 0 && v.pool.length > 1) v.pool.splice(at, 1)
  else if (at < 0) v.pool.push(id)
}
function setSong(id: string): void {
  if (!current.value) return
  if (id) v.songs[current.value.id] = id
  else delete v.songs[current.value.id]
}
function setPlaylist(id: string): void {
  if (playlist.value) playlist.value.visual = id
}
/** Tick or untick a whole group (at least one visual stays ticked). */
function tickGroup(list: Preset[], on: boolean): void {
  for (const p of list) {
    const at = v.pool.indexOf(p.id)
    if (on && at < 0) v.pool.push(p.id)
    if (!on && at >= 0 && v.pool.length > 1) v.pool.splice(at, 1)
  }
}
async function editCopy(): Promise<void> {
  const file = playingFile.value ?? activePreset.value?.file
  if (!file || copying.value) return
  copying.value = true
  try {
    const saved = await copyToMyPresets(file)
    say(`Saved as ${saved} in your visuals folder (Open my folder) - edit it, save, and it changes on screen.`, 7000)
  } catch (error) {
    say(error instanceof Error ? error.message : String(error), 6000)
  } finally {
    copying.value = false
  }
}
</script>

<template>
  <aside class="panel">
    <header>
      <h3><Icon name="sparkles" /> Visuals</h3>
      <button class="icon-btn" title="Close" @click="emit('close')"><Icon name="close" /></button>
    </header>
    <div class="now">
      Now: <b>{{ activePreset?.name ?? '-' }}</b>
      <button class="chip" title="Another visual (N)" @click="emit('next')"><Icon name="dice" :size="14" /> next</button>
      <button v-if="activePreset" class="chip" :class="{ on: v.favourites.includes(activePreset.id) }" title="More of this: it joins My favourites" @click="love(activePreset.id)">♥</button>
      <button v-if="activePreset" class="chip" title="Never this one: it leaves the visuals to choose from" @click="never(activePreset.id)">✕</button>
      <button class="chip" title="Only the visual, on the whole screen (Shift+F, or double-click the visual)" @click="emit('fullscreen')"><Icon name="expand" :size="14" /> full screen</button>
    </div>

    <h4>Show</h4>
    <select :value="show" aria-label="What the visuals show" @change="setShow(($event.target as HTMLSelectElement).value as Show)">
      <option value="director">Director - one visual per kind of section</option>
      <option value="all">Every visual, matching the music</option>
      <option v-for="c in COLLECTIONS" :key="c.id" :value="c.id">{{ c.name }}</option>
      <option v-if="v.favourites.length" value="favourites">My favourites ({{ v.favourites.length }})</option>
      <option value="one">One visual</option>
      <option value="off">Off</option>
    </select>
    <label class="row energy">Energy <span class="ends">calm</span><input type="range" min="0" max="1" step="0.01" :value="energy" aria-label="Energy, calm to intense" @input="setEnergy(Number(($event.target as HTMLInputElement).value))" /><span class="ends">intense</span></label>
    <p class="note tight">{{ energyName }}: sensitivity, how often it changes and the crossfade, together.</p>

    <div v-if="pictures.length" class="pictures" :aria-label="`The visuals of ${showName}, by picture`">
      <button v-for="p in pictures" :key="p.id" class="picture" :class="{ on: p.id === activePreset?.id }" :title="p.name" @click="play(p.id)">
        <span class="still" :style="posterOf(p.id) ?? {}" />
        <small>{{ shortName(p.name) }}</small>
      </button>
    </div>

    <details class="fine">
    <summary>Fine-tune</summary>
    <label class="row switch"><input v-model="v.enabled" type="checkbox" /> Visuals on</label>

    <h4>Mode</h4>
    <div class="modes">
      <button v-for="[id, label, hint] in MODES" :key="id" class="mode" :class="{ on: v.mode === id }" :title="hint" @click="v.mode = id">
        {{ label }}<small>{{ hint }}</small>
      </button>
    </div>

    <template v-if="v.mode === 'fixed'">
      <h4>The visual</h4>
      <select v-model="v.fixed">
        <option v-if="notHere(v.fixed)" :value="v.fixed" disabled>{{ notHere(v.fixed)?.name }} - not on this device</option>
        <optgroup v-for="g in GROUPS" :key="g.id" :label="g.label">
          <option v-for="p in g.offered" :key="p.id" :value="p.id">{{ shortName(p.name) }}</option>
          <option v-for="u in g.unavailable" :key="u.preset.id" :value="u.preset.id" disabled>{{ shortName(u.preset.name) }} - {{ u.why }}</option>
        </optgroup>
      </select>
      <p class="note tight">Or click a visual's name below.</p>
    </template>

    <template v-if="v.mode !== 'fixed'">
      <h4>Change</h4>
      <select v-model="v.switchOn">
        <option v-for="[id, label] in SWITCHES" :key="id" :value="id">{{ label }}</option>
      </select>
      <div v-if="v.switchOn === 'interval'" class="row">
        every <input v-model.number="v.interval" type="number" min="5" max="600" /> seconds
        <button v-for="s in [10, 20, 30, 60]" :key="s" class="chip" :class="{ on: v.interval === s }" @click="v.interval = s">{{ s }} s</button>
      </div>
    </template>

    <h4>Crossfade</h4>
    <select v-model="v.fade" title="How one visual turns into the next - with a new song, a new section, or N">
      <option v-for="[id, label, hint] in FADE_STYLES" :key="id" :value="id" :title="hint">{{ label }}</option>
    </select>
    <label v-if="v.fade !== 'cut'" class="row" :title="v.fade === 'flash' ? 'How long the flash fades' : 'How long the change takes'">
      {{ v.fade === 'flash' ? 'Flash' : 'Over' }} <input v-model.number="v.fadeSeconds" type="range" min="0.5" max="8" step="0.5" /> {{ v.fadeSeconds }} s
    </label>
    <p class="note tight">{{ FADE_STYLES.find(([id]) => id === v.fade)?.[2] }}. Both visuals play on while it changes; from one Plenio Drop preset to another the picture stays and its motion turns into the new one.</p>

    <h4>{{ v.mode === 'auto' ? 'Choose from' : v.mode === 'fixed' ? 'All visuals' : 'Ticked visuals' }} <small class="count">{{ offeredAll.filter((p) => v.pool.includes(p.id)).length }} of {{ offeredAll.length }}</small></h4>
    <p class="note tight">Click a name to see it now{{ v.mode === 'fixed' ? ' - it stays' : '' }}; tick it to let {{ v.mode === 'fixed' ? 'the other modes' : 'the mode' }} choose it.</p>
    <input v-model="query" class="find" type="search" placeholder="Find a visual …" aria-label="Find a visual" />
    <div class="moods" role="group" aria-label="The visuals that suit">
      <button v-for="m in MOODS" :key="m" class="mood" :class="{ on: mood === m }" :title="`Only the visuals that suit ${m} music`" @click="mood = mood === m ? '' : m">{{ m }}</button>
    </div>
    <p v-if="gpuNote" class="note tight gpu">{{ gpuNote }}</p>
    <section v-for="g in shown" :key="g.id" class="group" :class="{ open: isOpen(g.id, g.shown.length) }">
      <div class="head">
        <button class="fold" :aria-expanded="isOpen(g.id, g.shown.length)" @click="toggleOpen(g.id)">
          <Icon name="chevron" :size="12" class="arrow" />
          <span class="label">{{ g.label }}</span>
          <span class="count">{{ g.ticked }}/{{ g.offered.length }}</span>
        </button>
        <button class="link" :title="`Tick every ${g.label} visual`" @click="tickGroup(g.offered, true)">all</button>
        <button class="link" :title="`Untick every ${g.label} visual`" @click="tickGroup(g.offered, false)">none</button>
      </div>
      <div v-if="isOpen(g.id, g.shown.length)" class="chips">
        <div v-for="p in g.shown" :key="p.id" class="pick" :class="{ on: v.pool.includes(p.id), now: p.id === active }" :title="`${p.name} - ${p.blurb}`">
          <input type="checkbox" :checked="v.pool.includes(p.id)" :aria-label="`Let the mode choose ${shortName(p.name)}`" @change="togglePool(p.id)" />
          <button class="name" :aria-label="`Show ${shortName(p.name)} now`" @click="play(p.id)">{{ shortName(p.name) }}</button>
        </div>
        <span v-if="!g.shown.length" class="none">none {{ filtering ? 'found' : 'here' }}</span>
      </div>
      <p v-for="n in g.notes" :key="n" class="note tight">{{ n }}</p>
    </section>
    <button v-if="leftOut.size" class="chip again" title="Offer the visuals left out in this session again" @click="takeBackLeftOut()"><Icon name="dice" :size="14" /> Try again</button>

    <template v-if="support.webgl">
      <h4>Plenio Drop and Nova</h4>
      <label class="row">Quality
        <select v-model.number="v.dropScale" title="How finely Plenio Drop and Nova draw: Fast draws a quarter of the pixels, and every computer keeps up. Balanced draws Nova at the screen's own size, Sharp finer still and smoothed down - each Nova visual as far as this graphics card keeps it smooth.">
          <option v-for="[scale, label] in QUALITY" :key="scale" :value="scale">{{ label }}</option>
        </select>
      </label>
      <p class="note">Plenio Drop: MilkDrop-style visuals, drawn by Plenio itself. Write your own: a preset is a short JSON file - <a :href="GUIDE" target="_blank" rel="noopener">the guide</a>. Plenio Nova: scenes the graphics card works out for every pixel - offered where they play smoothly.</p>
      <div v-if="!isPortable" class="drop-tools">
        <button class="chip" :disabled="!activePreset?.file || copying" :title="activePreset?.file ? `A copy of ${activePreset.name} in your visuals folder, to change` : 'Play a Plenio Drop visual to copy it'" @click="editCopy">
          <Icon name="edit" :size="14" /> Edit a copy
        </button>
        <button class="chip" title="Your visuals folder: every .json file there is a visual of your own" @click="openMyPresetFolder"><Icon name="folder" :size="14" /> Open my folder</button>
      </div>
      <p v-if="myPresetFile(active)" class="note">Playing your file <code>{{ myPresetFile(active) }}</code> - save it and it changes here.</p>
      <p v-if="myPresetFolder" class="note path">{{ myPresetFolder }}</p>
      <div v-for="e in myPresetErrors" :key="e.file" class="bad"><b>{{ e.file }}</b> {{ e.error }}</div>
    </template>

    <h4>This song</h4>
    <select :value="songOwn" @change="setSong(($event.target as HTMLSelectElement).value)">
      <option value="">As the mode says</option>
      <option v-if="notHere(songOwn)" :value="songOwn" disabled>Always {{ notHere(songOwn)?.name }} - not on this device</option>
      <optgroup v-for="g in GROUPS" :key="g.id" :label="g.label">
        <option v-for="p in g.offered" :key="p.id" :value="p.id">Always {{ shortName(p.name) }}</option>
        <option v-for="u in g.unavailable" :key="u.preset.id" :value="u.preset.id" disabled>{{ shortName(u.preset.name) }} - {{ u.why }}</option>
      </optgroup>
    </select>
    <template v-if="playlist">
      <h4>The playlist “{{ playlist.name }}”</h4>
      <select :value="playlist.visual ?? ''" @change="setPlaylist(($event.target as HTMLSelectElement).value)">
        <option value="">As the mode says</option>
        <option v-if="notHere(playlist.visual)" :value="playlist.visual" disabled>Always {{ notHere(playlist.visual)?.name }} - not on this device</option>
        <optgroup v-for="g in GROUPS" :key="g.id" :label="g.label">
          <option v-for="p in g.offered" :key="p.id" :value="p.id">Always {{ shortName(p.name) }}</option>
          <option v-for="u in g.unavailable" :key="u.preset.id" :value="u.preset.id" disabled>{{ shortName(u.preset.name) }} - {{ u.why }}</option>
        </optgroup>
      </select>
    </template>

    <h4>Look</h4>
    <select v-model="v.scheme">
      <option v-for="[id, label] in SCHEMES" :key="id" :value="id">{{ label }}</option>
    </select>
    <label class="row">Sensitivity <input v-model.number="v.sensitivity" type="range" min="0.5" max="2" step="0.05" /></label>
    <label class="row switch"><input v-model="v.lyrics" type="checkbox" /> Lyrics over the visual</label>
    <label class="row switch"><input v-model="v.titles" type="checkbox" /> Title card when a song starts</label>
    <label class="row switch" title="Plenio Nova's glow, tone curve, vignette and grain over every visual - the classics, Drop and Nova alike"><input v-model="v.finish" type="checkbox" /> One light over every visual</label>
    <label v-if="guestStatus?.on" class="row switch" title="The QR code and address of the live playlist over the visual (its corner and size: Live Play > Guests)"><input v-model="settings.live.overVisual" type="checkbox" /> The guests' way in over the visual</label>
    <p class="note">A song’s own visual wins, then the playlist’s, then the mode.</p>
    </details>
  </aside>
</template>

<style scoped>
.now {
  flex-wrap: wrap;
}
.pictures {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  max-height: 260px;
  overflow-y: auto;
  margin: 8px 0;
}
.picture {
  display: grid;
  gap: 2px;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 8px;
  background: none;
  color: inherit;
  cursor: pointer;
  overflow: hidden;
}
.picture.on {
  border-color: var(--accent);
}
.picture .still {
  display: block;
  zoom: 0.5;
  border-radius: 8px;
}
.picture small {
  font-size: 10px;
  opacity: 0.75;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.energy {
  gap: 8px;
}
.energy input {
  flex: 1;
}
.ends {
  font-size: 11px;
  opacity: 0.6;
}
.fine summary {
  margin: 14px 0 6px;
  cursor: pointer;
  font-weight: 600;
}
.panel {
  width: 340px;
  max-height: 100%;
  overflow-y: auto;
  background: rgba(14, 12, 22, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  padding: 16px 18px 20px;
  backdrop-filter: blur(20px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
  font: 13px var(--font);
  color: #ddd;
}
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
h3 {
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 0;
  font: 600 16px var(--font);
  color: #fff;
}
h4 {
  margin: 14px 0 6px;
  font: 600 11px var(--font);
  text-transform: uppercase;
  letter-spacing: 0.7px;
  color: var(--muted);
}
h4 .count {
  float: right;
  text-transform: none;
  letter-spacing: 0;
  font-weight: 400;
}
.now {
  margin: 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}
.now b {
  color: var(--accent);
}
.modes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}
.mode {
  text-align: left;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  color: #eee;
  border-radius: 10px;
  padding: 8px 10px;
  cursor: pointer;
  font: 600 12px var(--font);
}
.mode small {
  display: block;
  font-weight: 400;
  color: var(--muted);
  font-size: 11px;
  margin-top: 2px;
}
.mode.on {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 18%, transparent);
}
select,
input[type='number'],
input.find {
  width: 100%;
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 6px 8px;
  font: 13px var(--font);
}
input[type='number'] {
  width: 70px;
}
.row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
}
.row input[type='range'] {
  flex: 1;
  accent-color: var(--accent);
}
.moods {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin: 6px 0 4px;
}
.mood {
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: transparent;
  color: var(--muted);
  border-radius: 999px;
  padding: 2px 9px;
  font: 11px var(--font);
  cursor: pointer;
}
.mood.on {
  border-color: var(--accent);
  color: #fff;
  background: color-mix(in srgb, var(--accent) 22%, transparent);
}
.group {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding: 4px 0;
}
.head {
  display: flex;
  align-items: center;
  gap: 10px;
}
.fold {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 0;
  background: none;
  border: 0;
  color: #fff;
  cursor: pointer;
  font: 600 12px var(--font);
  text-align: left;
}
.fold .arrow {
  transition: transform 0.15s;
  transform: rotate(-90deg);
  opacity: 0.7;
}
.group.open .fold .arrow {
  transform: rotate(0deg);
}
.fold .label {
  flex: 1;
}
.fold .count {
  color: var(--muted);
  font-weight: 400;
  font-variant-numeric: tabular-nums;
}
.chips {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3px;
  padding: 2px 0 6px;
}
.pick {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  padding: 3px 6px;
  border-radius: 7px;
  border: 1px solid transparent;
  font-size: 12px;
  color: var(--muted);
}
.pick .name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: none;
  border: 0;
  padding: 0;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.pick .name:hover,
.pick .name:focus-visible {
  color: #fff;
  text-decoration: underline;
}
.pick input {
  cursor: pointer;
}
.pick:hover {
  background: rgba(255, 255, 255, 0.05);
}
.pick.on {
  color: #fff;
}
.pick.now {
  border-color: color-mix(in srgb, var(--accent) 60%, transparent);
}
.pick input {
  margin: 0;
  accent-color: var(--accent);
  flex: none;
}
.none {
  grid-column: span 2;
  color: var(--muted);
  font-size: 11px;
  padding: 2px 6px;
}
.again {
  margin-top: 6px;
}
.note {
  color: var(--muted);
  font-size: 11px;
  margin-top: 14px;
}
.note a {
  color: var(--accent);
}
.note.tight {
  margin-top: 2px;
}
.note.gpu {
  margin: 4px 0;
  color: #f0c78a;
}
.note.path {
  margin-top: 4px;
  word-break: break-all;
}
.link {
  background: none;
  border: 0;
  padding: 0;
  color: var(--accent);
  cursor: pointer;
  font: 12px var(--font);
}
.drop-tools {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}
.chip:disabled {
  opacity: 0.45;
  cursor: default;
}
.bad {
  margin-top: 6px;
  padding: 6px 8px;
  border-radius: 8px;
  background: rgba(255, 90, 90, 0.12);
  color: #ffb4b4;
  font-size: 11px;
  word-break: break-word;
}
.bad b {
  color: #fff;
  margin-right: 4px;
}
</style>
