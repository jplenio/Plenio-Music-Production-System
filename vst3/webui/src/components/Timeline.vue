<script setup lang="ts">
// The song on one timeline with the project: its bars (as measured in the take), song form, takes, stems, sung lines,
// chords and notes. Click the ruler to listen from there while the DAW stands; scroll with the wheel, zoom with Ctrl.
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

import { call } from '../bridge'
import { act, jobText, store } from '../store'
import { dragToDaw } from '../drag'
import { lengthSeconds } from '../form'
import { formatTime, secondsAt, secondsToTick, tickToSeconds, view, x, zoom } from '../timeline'
import ChordPicker from './ChordPicker.vue'
import Icon from './Icon.vue'
import PianoRoll from './PianoRoll.vue'
import Waveform from './Waveform.vue'

const HEADER = 156
const song = computed(() => store.song!)
const lanes = ref<HTMLDivElement | null>(null)
const part = ref<'melody' | 'instrument'>('melody')
const gridName = ref<'1/4' | '1/8' | '1/16'>('1/8')
const rollHeight = ref(200)
const notesLane = ref<HTMLDivElement | null>(null)
const stems = reactive<Record<string, { muted: boolean; soloed: boolean }>>({})
const showStems = ref(true)
const picker = ref<{ index: number; name: string; left: number; top: number; tick: number } | null>(null)

const ppq = computed(() => song.value.score?.ppq ?? 480)
const grid = computed(() => ({ '1/4': ppq.value, '1/8': ppq.value / 2, '1/16': ppq.value / 4 })[gridName.value])
const measures = computed(() => song.value.measures ?? [])
const active = computed(() => song.value.takes[song.value.activeTake])
const songEnd = computed(() => {
  let end = 8
  for (const t of song.value.takes) end = Math.max(end, (t.audioAt ?? 0) + t.seconds)
  if (song.value.takes.length === 0 && song.value.jobs.length) end = Math.max(end, (lengthSeconds(String(song.value.fields.length ?? '')) || 90) + 4)
  const last = measures.value[measures.value.length - 1]
  return Math.max(end, last?.end ?? 0)
})

const bars = computed(() => {
  const out: { number: number; start: number; end: number; lead: boolean }[] = []
  for (const m of song.value.leadIn ?? []) out.push({ ...m, lead: true })
  for (const m of measures.value) out.push({ number: m.number, start: m.start, end: m.end, lead: false })
  return out
})

const barStep = computed(() => {
  const avg = bars.value.length ? (bars.value[bars.value.length - 1].end - bars.value[0].start) / bars.value.length : 2.5
  const px = avg * view.pxPerSecond
  return px > 48 ? 1 : px > 24 ? 2 : px > 12 ? 4 : 8
})

const COLORS = ['#ff5aa0', '#a05cff', '#5c8dff', '#2fc3a8', '#ffb23e', '#ff7a59']
const sections = computed(() => {
  const s = song.value.score
  if (!s) return []
  const ms = measures.value
  const list = s.sections.map(([tick, name], i) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    start: tickToSeconds(ms, tick),
    end: i + 1 < s.sections.length ? tickToSeconds(ms, s.sections[i + 1][0]) : tickToSeconds(ms, s.endTick),
    color: COLORS[i % COLORS.length]
  }))
  return list
})

const chords = computed(() => {
  const s = song.value.score
  if (!s) return []
  const ms = measures.value
  return s.chords.map(([tick, name], i) => ({
    index: i,
    tick,
    name,
    start: tickToSeconds(ms, tick),
    end: i + 1 < s.chords.length ? tickToSeconds(ms, s.chords[i + 1][0]) : tickToSeconds(ms, s.endTick)
  }))
})

const playheadX = computed(() => x(store.position))

// where a take in the making will lie: where the active take lies, else from the song's start for its length
const pendingSpan = computed(() => {
  const at = active.value?.audioAt ?? song.value.layout?.audioAt ?? 0
  const seconds = active.value?.seconds ?? (lengthSeconds(String(song.value.fields.length ?? '')) || 90)
  return { left: `${x(at)}px`, width: `${Math.max(8, seconds * view.pxPerSecond)}px` }
})

// --- sizing, scrolling, zooming ---

let observer: ResizeObserver | null = null
let fitted = ''

function fit(): void {
  view.pxPerSecond = Math.max(4, (view.width - 24) / Math.max(10, songEnd.value + 2))
  view.scroll = -0.5
}

onMounted(() => {
  observer = new ResizeObserver(() => {
    if (lanes.value) view.width = Math.max(100, lanes.value.clientWidth - HEADER)
    if (notesLane.value) rollHeight.value = Math.max(120, notesLane.value.clientHeight)
  })
  if (lanes.value) observer.observe(lanes.value)
  if (notesLane.value) observer.observe(notesLane.value)
  if (lanes.value) view.width = Math.max(100, lanes.value.clientWidth - HEADER)
  fit()
  fitted = song.value.id
  document.addEventListener('mousedown', closePicker)
})
onBeforeUnmount(() => {
  observer?.disconnect()
  document.removeEventListener('mousedown', closePicker)
})

watch(
  () => song.value.id,
  (id) => {
    if (id !== fitted) {
      fitted = id
      fit()
    }
  }
)
// the first take shows the song's real length
watch(
  () => song.value.takes.length,
  (n, before) => {
    if (before === 0 && n > 0) fit()
  }
)

watch(
  () => store.position,
  (p) => {
    if (!view.follow || (!store.playing && !store.preview)) return
    const px = x(p)
    if (px > view.width * 0.88 || px < 0) view.scroll = p - (view.width * 0.12) / view.pxPerSecond
  }
)

function wheel(e: WheelEvent): void {
  if ((e.target as HTMLElement).closest('.side-scroll')) return
  e.preventDefault()
  const rect = lanes.value!.getBoundingClientRect()
  const px = e.clientX - rect.left - HEADER
  if (e.ctrlKey || e.metaKey) zoom(e.deltaY < 0 ? 1.15 : 1 / 1.15, Math.max(0, px))
  else {
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
    view.scroll = Math.max(-2, Math.min(songEnd.value, view.scroll + d / view.pxPerSecond))
  }
}

function rulerClick(e: MouseEvent): void {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const seconds = Math.max(0, secondsAt(e.clientX - rect.left))
  void call('player.preview', { seconds })
}

// --- takes and stems ---

function choose(index: number): void {
  if (index !== song.value.activeTake) void act('take.select', { index })
}

function listen(index: number): void {
  choose(index)
  const t = song.value.takes[index]
  void call('player.preview', { seconds: Math.max(0, t.audioAt ?? 0) })
}

function stem(name: string): { muted: boolean; soloed: boolean } {
  if (!stems[name]) stems[name] = { muted: false, soloed: false }
  return stems[name]
}

const STEM_ORDER = ['vocals', 'drums', 'bass', 'other', 'rest']
function toggleStem(name: string, what: 'muted' | 'soloed'): void {
  const s = stem(name)
  s[what] = !s[what]
  void call('player.stem', { index: STEM_ORDER.indexOf(name), [what]: s[what] })
}

// --- chords ---

function openChord(index: number, e: MouseEvent): void {
  const c = chords.value[index]
  const host = lanes.value!.getBoundingClientRect()
  picker.value = { index, name: c.name, left: Math.min(e.clientX - host.left, host.width - 330), top: e.clientY - host.top + 14, tick: c.tick }
}

function addChord(e: MouseEvent): void {
  if (!song.value.score) return
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const tick = Math.max(0, Math.round(secondsToTick(measures.value, secondsAt(e.clientX - rect.left)) / ppq.value) * ppq.value)
  const before = [...chords.value].reverse().find((c) => c.tick <= tick)
  const host = lanes.value!.getBoundingClientRect()
  picker.value = { index: -1, name: before?.name ?? 'C', left: Math.min(e.clientX - host.left, host.width - 330), top: e.clientY - host.top + 14, tick }
}

function pickChord(name: string): void {
  const p = picker.value
  const s = song.value.score
  picker.value = null
  if (!p || !s) return
  const list = s.chords.map((c) => [...c] as [number, string])
  if (p.index >= 0) list[p.index][1] = name
  else {
    const same = list.findIndex((c) => c[0] === p.tick)
    if (same >= 0) list[same][1] = name
    else list.push([p.tick, name])
  }
  list.sort((a, b) => a[0] - b[0])
  void act('song.chords', { chords: list })
}

function removeChord(): void {
  const p = picker.value
  const s = song.value.score
  picker.value = null
  if (!p || !s || p.index < 0) return
  void act('song.chords', { chords: s.chords.filter((_, i) => i !== p.index) })
}

function closePicker(e: MouseEvent): void {
  if (picker.value && !(e.target as HTMLElement).closest('.picker')) picker.value = null
}

</script>

<template>
  <div class="timeline">
    <div class="toolbar">
      <span class="label">Timeline</span>
      <span class="muted small">bars as Plenio measured them in the take: the DAW's tempo map follows them</span>
      <div class="spacer" />
      <button class="btn small ghost icon" title="Zoom out" @click="zoom(1 / 1.4, view.width / 2)"><Icon name="zoom-out" :size="15" /></button>
      <button class="btn small ghost icon" title="Zoom in" @click="zoom(1.4, view.width / 2)"><Icon name="zoom-in" :size="15" /></button>
      <button class="btn small ghost" title="Show the whole song" @click="fit">Fit</button>
      <button class="btn small ghost" :class="{ on: view.follow }" title="Follow the playhead" @click="view.follow = !view.follow">
        <Icon name="follow" :size="14" />Follow
      </button>
      <button v-if="store.preview" class="btn small" @click="call('player.stop')"><Icon name="stop" :size="11" />Stop</button>
    </div>

    <div ref="lanes" class="lanes" @wheel="wheel">
      <!-- ruler -->
      <div class="row ruler">
        <div class="head"><span class="time">{{ formatTime(store.position) }}</span></div>
        <div class="lane" @mousedown="rulerClick">
          <template v-for="(b, i) in bars" :key="`b${i}`">
            <div v-if="(b.number - 1) % barStep === 0" class="bar" :class="{ lead: b.lead }" :style="{ left: `${x(b.start)}px` }">
              <span>{{ b.number }}</span>
            </div>
          </template>
        </div>
      </div>
      <!-- song form -->
      <div class="row form">
        <div class="head"><span class="name">Form</span></div>
        <div class="lane">
          <div
            v-for="(s, i) in sections"
            :key="`s${i}`"
            class="section"
            :style="{ left: `${x(s.start)}px`, width: `${Math.max(2, x(s.end) - x(s.start) - 2)}px`, '--c': s.color }"
            :title="s.name"
          >
            {{ s.name }}
          </div>
        </div>
      </div>
      <!-- takes -->
      <div
        v-for="t in song.takes"
        :key="`t${t.number}`"
        class="row take"
        :class="{ active: t.index === song.activeTake }"
        @click="choose(t.index)"
      >
        <div class="head">
          <button
            class="play"
            :class="{ art: t.cover }"
            :style="t.cover ? { backgroundImage: `url('${t.cover}')` } : undefined"
            title="Listen from the take's start"
            @click.stop="listen(t.index)"
          >
            <Icon name="play" :size="11" />
          </button>
          <div class="take-name">
            <b>Take {{ t.number }}</b>
            <span class="muted">{{ formatTime(t.seconds) }}<template v-if="t.stars !== undefined"> · <Icon name="star" :size="10" class="star" />{{ t.stars }}</template></span>
          </div>
          <span class="drag-take" title="Drag this take onto your DAW" @pointerdown.stop="dragToDaw($event, { index: t.index, what: 'take' })" @click.stop>
            <Icon name="drag" :size="13" />
          </span>
          <button class="del" title="Remove this take from the song (its files stay in the library)" @click.stop="act('take.delete', { index: t.index })">
            <Icon name="trash" :size="12" />
          </button>
        </div>
        <div class="lane">
          <Waveform :peaks="store.peaks[t.number]" :start="t.audioAt ?? 0" :seconds="t.seconds" :active="t.index === song.activeTake" :height="46" />
          <span v-if="!t.hasAudio" class="missing">audio not in the library</span>
        </div>
      </div>
      <div v-for="job in song.jobs" :key="`j${job.number}`" class="row take pending">
        <div class="head">
          <div class="take-name">
            <b>Take {{ job.number }}</b>
            <span class="muted">{{ jobText(job, song.jobs) }}</span>
          </div>
        </div>
        <div class="lane">
          <div class="shimmer" :style="pendingSpan"><div class="fill" :style="{ width: `${Math.round(job.progress * 100)}%` }" /></div>
        </div>
      </div>
      <!-- stems of the active take -->
      <template v-if="active && active.stems.length">
        <div class="row stem stems-head" @click="showStems = !showStems">
          <div class="head">
            <Icon :name="showStems ? 'chevron-down' : 'chevron-right'" :size="13" />
            <span class="stem-name">Stems</span>
            <span v-if="!showStems" class="muted small">{{ active.stems.length }}</span>
          </div>
          <div class="lane" />
        </div>
        <div v-for="name in showStems ? active.stems : []" :key="`st${name}`" class="row stem">
          <div class="head">
            <span class="stem-name">{{ name }}</span>
            <button class="ms" :class="{ on: stem(name).muted }" title="Mute" @click="toggleStem(name, 'muted')">M</button>
            <button class="ms solo" :class="{ on: stem(name).soloed }" title="Solo" @click="toggleStem(name, 'soloed')">S</button>
          </div>
          <div class="lane"><div class="stem-span" :style="{ left: `${x(active.audioAt ?? 0)}px`, width: `${active.seconds * view.pxPerSecond}px` }" /></div>
        </div>
      </template>
      <!-- sung lines -->
      <div class="row lyrics">
        <div class="head"><span class="name">Lyrics</span></div>
        <div class="lane">
          <div
            v-for="(l, i) in song.lines ?? []"
            :key="`l${i}`"
            class="line"
            :style="{ left: `${x(l.start)}px`, width: `${Math.max(4, x(l.end) - x(l.start))}px` }"
            :title="l.text"
            @click="call('player.preview', { seconds: l.start })"
          >
            {{ l.text }}
          </div>
        </div>
      </div>
      <!-- chords -->
      <div class="row chords">
        <div class="head"><span class="name">Chords</span><span v-if="song.edited.chords" class="dot" title="changed" /></div>
        <div class="lane" @dblclick.self="addChord">
          <div
            v-for="c in chords"
            :key="`c${c.index}`"
            class="chord"
            :style="{ left: `${x(c.start)}px`, width: `${Math.max(3, x(c.end) - x(c.start) - 2)}px` }"
            :title="c.name"
            @click.stop="openChord(c.index, $event)"
          >
            {{ c.name }}
          </div>
        </div>
      </div>
      <!-- notes -->
      <div class="row notes">
        <div class="head notes-head">
          <div class="segmented vertical">
            <button :class="{ on: part === 'melody' }" @click="part = 'melody'">Melody</button>
            <button :class="{ on: part === 'instrument' }" @click="part = 'instrument'">Instrument</button>
          </div>
          <div class="segmented grid">
            <button v-for="g in ['1/4', '1/8', '1/16'] as const" :key="g" :class="{ on: gridName === g }" @click="gridName = g">{{ g }}</button>
          </div>
          <span v-if="song.edited.melody || song.edited.instrument" class="edited">
            notes changed
            <button class="btn small ghost" title="Back to the take's notes and chords" @click="act('song.resetEdits')"><Icon name="undo" :size="12" /></button>
          </span>
          <span v-else class="hint muted">double-click: a note · drag: move · edge: length · Del · ↑↓</span>
        </div>
        <div ref="notesLane" class="lane">
          <PianoRoll v-if="song.score" :part="part" :grid="grid" :height="rollHeight" />
          <div v-else class="empty muted">The notes come with the first take.</div>
        </div>
      </div>
      <!-- the playhead over every lane -->
      <div v-if="playheadX >= 0 && playheadX <= view.width" class="playhead" :class="{ moving: store.playing || store.preview }" :style="{ left: `${HEADER + playheadX}px` }" />
      <ChordPicker v-if="picker" :name="picker.name" :left="picker.left" :top="picker.top" @pick="pickChord" @remove="removeChord" @close="picker = null" />
    </div>
  </div>
</template>

<style scoped>
.timeline {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.toolbar {
  flex: none;
  display: flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 10px 0 14px;
  border-bottom: 1px solid var(--line);
}
.toolbar .small {
  font-size: 11.5px;
  margin-left: 6px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.toolbar .btn.on {
  color: var(--accent);
}
.spacer {
  flex: 1;
}
.lanes {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}
.row {
  display: flex;
  flex: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}
.head {
  width: 156px;
  flex: none;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  border-right: 1px solid var(--line);
  background: var(--bg-panel);
  position: relative;
  z-index: 2;
}
.lane {
  flex: 1;
  position: relative;
  overflow: hidden;
}
.name {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-faint);
  font-weight: 600;
}
.ruler {
  height: 26px;
  background: var(--bg-sunken);
}
.ruler .lane {
  cursor: pointer;
}
.time {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--text-dim);
}
.bar {
  position: absolute;
  top: 0;
  bottom: 0;
  border-left: 1px solid #4a4260;
  padding-left: 4px;
  font-size: 10.5px;
  color: var(--text-dim);
  display: flex;
  align-items: center;
}
.bar.lead {
  color: var(--text-faint);
  border-left-style: dashed;
}
.form {
  height: 26px;
}
.section {
  position: absolute;
  top: 4px;
  bottom: 4px;
  border-radius: 5px;
  background: color-mix(in srgb, var(--c) 22%, transparent);
  border: 1px solid color-mix(in srgb, var(--c) 55%, transparent);
  color: color-mix(in srgb, var(--c) 60%, white);
  font-size: 11px;
  font-weight: 600;
  padding: 0 7px;
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
}
.take {
  height: 52px;
  cursor: pointer;
}
.take .head {
  gap: 8px;
}
.take.active .head {
  background: linear-gradient(90deg, rgba(176, 92, 255, 0.16), var(--bg-panel));
  box-shadow: inset 3px 0 0 var(--accent);
}
.take:hover .head {
  background-color: #1c1828;
}
.play {
  width: 24px;
  height: 24px;
  flex: none;
  border-radius: 50%;
  border: 1px solid var(--line-strong);
  background: var(--bg-raised);
  display: grid;
  place-items: center;
  cursor: pointer;
  color: var(--text-dim);
}
.play:hover {
  color: white;
  border-color: var(--accent);
}
/* a take with cover art: the cover is the button, the play sign shows on hover */
.play.art {
  width: 34px;
  height: 34px;
  border-radius: 7px;
  background-size: cover;
  background-position: center;
  color: transparent;
}
.play.art:hover {
  color: white;
  box-shadow: inset 0 0 0 40px rgba(10, 8, 16, 0.5);
}
.take-name {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
  flex: 1;
  min-width: 0;
}
.take-name .muted {
  font-size: 11.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.star {
  color: var(--amber);
  vertical-align: -1px;
}
.drag-take {
  position: absolute;
  right: 32px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0;
  color: var(--text-faint);
  cursor: grab;
  padding: 4px 3px;
  border-radius: 5px;
  display: grid;
  place-items: center;
  background: #1c1828;
}
.take:hover .drag-take {
  opacity: 1;
}
.drag-take:hover {
  color: var(--text);
  background: var(--bg-hover);
}
.del {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0;
  border: none;
  background: #1c1828;
  color: var(--text-faint);
  cursor: pointer;
  padding: 4px;
  border-radius: 5px;
}
.take:hover .del {
  opacity: 1;
}
.del:hover {
  color: var(--danger);
  background: var(--bg-hover);
}
.missing {
  position: absolute;
  left: 12px;
  top: 16px;
  font-size: 11.5px;
  color: var(--amber);
}
.pending .shimmer {
  position: absolute;
  top: 8px;
  bottom: 8px;
  overflow: hidden;
  border-radius: 6px;
  background: rgba(176, 92, 255, 0.06);
  border: 1px dashed rgba(176, 92, 255, 0.3);
}
.pending .shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.06), transparent);
  background-size: 40% 100%;
  background-repeat: no-repeat;
  animation: shimmer 1.8s linear infinite;
}
.pending .fill {
  height: 100%;
  background: linear-gradient(90deg, rgba(255, 90, 160, 0.45), rgba(160, 92, 255, 0.55));
  transition: width 0.6s;
}
@keyframes shimmer {
  from {
    background-position: -40% 0;
  }
  to {
    background-position: 140% 0;
  }
}
.stem {
  height: 26px;
}
.stems-head {
  cursor: pointer;
}
.stems-head .head {
  gap: 5px;
  color: var(--text-dim);
}
.stems-head .small {
  font-size: 11px;
}
.stem:not(.stems-head) .head {
  padding-left: 28px;
}
.stem-name {
  flex: 1;
  font-size: 12px;
  color: var(--text-dim);
  text-transform: capitalize;
}
.ms {
  width: 22px;
  height: 18px;
  border-radius: 4px;
  border: 1px solid var(--line-strong);
  background: transparent;
  font-size: 10px;
  font-weight: 700;
  color: var(--text-faint);
  cursor: pointer;
}
.ms.on {
  background: #d9a23a;
  border-color: #d9a23a;
  color: #1a1408;
}
.ms.solo.on {
  background: #4fd1a5;
  border-color: #4fd1a5;
}
.stem-span {
  position: absolute;
  top: 7px;
  bottom: 7px;
  border-radius: 4px;
  background: rgba(160, 120, 255, 0.14);
}
.lyrics {
  height: 32px;
}
.line {
  position: absolute;
  top: 5px;
  bottom: 5px;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.09);
  font-size: 11.5px;
  padding: 0 7px;
  display: flex;
  align-items: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: pointer;
  color: #ddd6ee;
}
.line:hover {
  border-color: rgba(176, 92, 255, 0.6);
}
.chords {
  height: 32px;
}
.chords .lane {
  cursor: copy;
}
.chord {
  position: absolute;
  top: 5px;
  bottom: 5px;
  border-radius: 5px;
  background: rgba(92, 141, 255, 0.14);
  border: 1px solid rgba(92, 141, 255, 0.4);
  color: #cfdcff;
  font-weight: 650;
  font-size: 11.5px;
  padding: 0 4px;
  display: flex;
  align-items: center;
  overflow: hidden;
  white-space: nowrap;
  cursor: pointer;
}
.chord:hover {
  background: rgba(92, 141, 255, 0.26);
}
.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--amber);
}
.notes {
  flex: 1 0 auto;
  min-height: 170px;
}
.notes .lane :deep(canvas) {
  position: absolute;
  top: 0;
  left: 0;
}
.notes-head {
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  padding: 10px;
  gap: 8px;
}
.segmented.vertical {
  flex-direction: column;
}
.segmented.vertical button {
  text-align: left;
}
.segmented.grid button {
  flex: 1;
  min-width: 0;
  padding: 0 4px;
  font-size: 11.5px;
}
.edited {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11.5px;
  color: var(--amber);
}
.hint {
  font-size: 10.5px;
  line-height: 1.5;
}
.empty {
  padding: 20px;
}
.playhead {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: rgba(255, 255, 255, 0.55);
  pointer-events: none;
  z-index: 5;
}
.playhead.moving {
  background: #fff;
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.6);
}
</style>
