<script setup lang="ts">
/**
 * Now playing, full screen: the visual behind everything, and four ways to watch - Stage (the cover and
 * the lyrics), Lyrics (karaoke, large), Notation (the sheet following the music) and Visual (only the
 * visual, the lyrics as subtitles, the controls fading away while the mouse rests). Sections are chips to
 * jump to; a title card greets every song, and in its last seconds *Up next* says which one follows (a big screen
 * at a party: everyone sees what comes).
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { engine } from '../engine'
import { lineIndex, lines, paletteStyle, playlistVisual, section, sections, writtenLines } from '../now'
import { current, detail, duration, go, isFavorite, next, nowPlayingOpen, openCurrentPage, playing, previous, settings, heard, time, toggleFavorite, upNext } from '../store'
import { WAY_IN_SIDES } from '../liveSettings'
import { formatTime, sectionName } from '../timing'
import { partyMaker, partyWhen } from '../make/form'
import { isPhone } from '../layout'
import BottomSheet from './BottomSheet.vue'
import { makeStatus } from '../make/state'
import CoverArt from './CoverArt.vue'
import GuestWayIn from './GuestWayIn.vue'
import Icon from './Icon.vue'
import Karaoke from './Karaoke.vue'
import LyricLine from './LyricLine.vue'
import LyricsPanel from './LyricsPanel.vue'
import LyricsVersionSwitch from './LyricsVersionSwitch.vue'
import MakerCredit from './MakerCredit.vue'
import Notation from './Notation.vue'
import VisualCanvas from './VisualCanvas.vue'
import VisualsPanel from './VisualsPanel.vue'
import Waveform from './Waveform.vue'

type View = 'stage' | 'lyrics' | 'notation' | 'visual'
// the view it opens in is kept with the other settings (on the player's server)
const view = computed<View>({ get: () => settings.npView, set: (v) => (settings.npView = v) })
const panel = ref(false)
const lyricsPanel = ref(false)
watch(panel, (open) => open && (lyricsPanel.value = false))
watch(lyricsPanel, (open) => open && (panel.value = false))
const visual = ref<InstanceType<typeof VisualCanvas> | null>(null)
/** A phone's ⋯: the song's page, how the lyrics look, the visuals, the whole screen. */
const phoneMenu = ref(false)
const VIEW_LABELS = { stage: 'Stage', lyrics: 'Lyrics', notation: 'Notes', visual: 'Visual' } as const
// a swipe down on a phone closes Now playing (from the top half, so the lyrics and the waveform keep their gestures)
const pull = ref(0)
let pullStart: { x: number; y: number } | null = null
function pullDown(event: PointerEvent): void {
  if (!isPhone.value || event.pointerType === 'mouse' || event.clientY > window.innerHeight * 0.55) return
  pullStart = { x: event.clientX, y: event.clientY }
}
function pullMove(event: PointerEvent): void {
  if (!pullStart) return
  const dy = event.clientY - pullStart.y
  if (dy > 0 && dy > Math.abs(event.clientX - pullStart.x)) pull.value = dy
}
function pullUp(): void {
  if (!pullStart) return
  pullStart = null
  if (pull.value > 110) nowPlayingOpen.value = false
  pull.value = 0
}
const activeVisual = ref('')
const idle = ref(false)
const card = ref(false)
let idleTimer: number | undefined

// a party song: who made it, when the admin shows it (Settings > Party songs)
const credit = computed(() => {
  const mode = makeStatus.value?.settings.credit ?? 'off'
  const name = mode !== 'off' && current.value ? partyMaker(current.value.tags) : null
  return name && mode !== 'off' ? { name, mode, when: partyWhen(current.value?.tags) } : null
})

/** *Up next* shows in a song's last seconds - not on a phone (the lyrics need the room), not for a short song -
 * and goes as the next one begins (with a crossfade, a little earlier). */
const UP_NEXT_S = 15
const upNextShown = computed(() => {
  const left = duration.value - time.value
  return !isPhone.value && settings.visuals.titles && !!upNext.value && duration.value > 40 && left <= UP_NEXT_S && left > settings.crossfade + 0.8
})
const upNextBy = computed(() => {
  const song = upNext.value
  if (!song) return ''
  const maker = (makeStatus.value?.settings.credit ?? 'off') !== 'off' ? partyMaker(song.tags) : null
  return maker ? `a party song by ${maker} · ${partyWhen(song.tags).replace(/^on /, '')}` : [song.other ? song.artist : song.genre, formatTime(song.seconds)].filter(Boolean).join(' · ')
})
// over the visual the corner the guests' QR code leaves free
const upNextLeft = computed(() => view.value === 'visual' && settings.live.on && settings.live.overVisual && settings.live.wayInCorner === 'bottom-right')

const subtitle = computed(() => {
  const i = lineIndex.value
  if (i < 0) return null
  const line = lines.value[i]
  return heard.value <= line.end + 0.3 ? line : null
})

watch(view, () => wake())
function wake(): void {
  idle.value = false
  clearTimeout(idleTimer)
  idleTimer = window.setTimeout(() => (idle.value = view.value === 'visual' && !panel.value), 2800)
}

watch(
  () => current.value?.id,
  () => {
    if (!settings.visuals.titles) return
    card.value = true
    window.setTimeout(() => (card.value = false), 3800)
  },
  { immediate: true }
)

function fullscreen(): void {
  if (document.fullscreenElement) void document.exitFullscreen()
  else void document.documentElement.requestFullscreen().catch(() => {})
}
/** Only the visual, on the whole screen (Shift+F, a double-click on it, the Visuals panel); again: back. */
function visualFullscreen(): void {
  if (view.value === 'visual' && document.fullscreenElement) {
    void document.exitFullscreen()
    return
  }
  view.value = 'visual'
  panel.value = false
  if (!settings.visuals.enabled) settings.visuals.enabled = true
  if (!document.fullscreenElement) void document.documentElement.requestFullscreen().catch(() => {})
}

onMounted(() => {
  wake()
  window.addEventListener('mousemove', wake)
})
onBeforeUnmount(() => {
  window.removeEventListener('mousemove', wake)
  clearTimeout(idleTimer)
})
defineExpose({ nextVisual: () => visual.value?.next(), setView: (v: View) => (view.value = v), togglePanel: () => (panel.value = !panel.value), visualFullscreen })
</script>

<template>
  <div
    class="np"
    :class="[`view-${view}`, { idle, phone: isPhone }]"
    :style="[paletteStyle, pull ? { transform: `translateY(${pull}px)`, opacity: String(1 - Math.min(0.5, pull / 600)) } : {}]"
    @pointerdown="pullDown"
    @pointermove="pullMove"
    @pointerup="pullUp"
    @pointercancel="pullUp"
  >
    <div class="backdrop">
      <CoverArt v-if="current" :song="current" class="blur" :size="128" />
      <div class="tint" />
    </div>
    <div v-if="settings.visuals.enabled" class="visual" :class="{ dim: view !== 'visual' }">
      <VisualCanvas ref="visual" :section="section?.label" :playlist-visual="playlistVisual" @change="activeVisual = $event" />
    </div>

    <header class="top">
      <button class="icon-btn" title="Close (Esc)" @click="nowPlayingOpen = false"><Icon :name="isPhone ? 'chevron' : 'back'" /></button>
      <nav class="views">
        <button v-for="v in (['stage', 'lyrics', 'notation', 'visual'] as const)" :key="v" :class="{ on: view === v }" @click="view = v">
          {{ isPhone ? VIEW_LABELS[v] : { stage: 'Stage', lyrics: 'Lyrics', notation: 'Notation', visual: 'Visual' }[v] }}
        </button>
      </nav>
      <button v-if="isPhone" class="icon-btn" title="More" @click="phoneMenu = true"><Icon name="more" /></button>
      <div v-else class="tools">
        <button class="icon-btn" title="The song's page: lyrics, notation, details (I)" @click="openCurrentPage"><Icon name="info" /></button>
        <button class="icon-btn" :class="{ on: lyricsPanel }" title="How the lyrics look: font, colour, effect" @click="lyricsPanel = !lyricsPanel"><Icon name="mic" /></button>
        <button class="icon-btn" :class="{ on: panel }" title="Visuals (V)" @click="panel = !panel"><Icon name="sparkles" /></button>
        <button class="icon-btn" title="Full screen (Shift+F: only the visual)" @click="fullscreen"><Icon name="expand" /></button>
      </div>
    </header>

    <!-- the guests' way in; over the visual only when Live Play's settings say so, in their corner and size -->
    <GuestWayIn
      v-if="!panel && !lyricsPanel && (view !== 'visual' || settings.live.overVisual)"
      class="way-in"
      :class="view === 'visual' ? [settings.live.wayInCorner, `size-${settings.live.wayInSize}`] : []"
      :side="view === 'visual' ? WAY_IN_SIDES[settings.live.wayInSize] : 104"
    />
    <Transition name="panel"><VisualsPanel v-if="panel" class="vpanel" :active="activeVisual" @close="panel = false" @next="visual?.next()" @play="visual?.show($event)" @fullscreen="visualFullscreen" /></Transition>
    <Transition name="panel">
      <aside v-if="lyricsPanel" class="vpanel lpanel">
        <header><h3><Icon name="mic" /> Lyrics</h3><button class="icon-btn" title="Close" @click="lyricsPanel = false"><Icon name="close" /></button></header>
        <LyricsVersionSwitch :detail="detail" details />
        <LyricsPanel compact />
      </aside>
    </Transition>

    <main v-if="current" class="stage" title="" @dblclick.self="visualFullscreen">
      <section v-if="view === 'stage'" class="cover-col">
        <div class="cover-wrap" :class="{ playing }">
          <CoverArt :song="current" :live="playing" rounded :size="420" />
        </div>
        <h1 @click="go(`/song/${current.id}`); nowPlayingOpen = false">{{ current.title }}</h1>
        <p class="facts">
          <span v-if="current.genre">{{ current.genre }}</span><span v-if="current.mood">{{ current.mood }}</span><span v-if="current.bpm">{{ current.bpm }} BPM</span><span v-if="current.score_key">{{ current.score_key }}</span><span>{{ current.other ? current.artist || 'other music' : current.model || 'recording' }}</span>
        </p>
      </section>
      <section v-if="view === 'stage' || view === 'lyrics'" class="lyrics-col">
        <Karaoke :lines="lines" :time="heard" :plain="detail?.lyrics_raw ? current.lyrics : ''" />
      </section>
      <section v-if="view === 'notation'" class="notation-col">
        <Notation v-if="detail" :notation="detail.notation" :lines="writtenLines" :time="heard" :following="true" :song-id="detail.id" />
      </section>
      <section v-if="view === 'notation'" class="side-lyrics">
        <Karaoke :lines="lines" :time="heard" :plain="current.lyrics" compact />
      </section>
    </main>

    <div v-if="view === 'visual' && settings.visuals.lyrics && subtitle" class="subtitle">
      <LyricLine :line="subtitle" :time="heard" :effect="settings.lyrics.effect" />
    </div>

    <MakerCredit
      v-if="credit && !panel && !lyricsPanel"
      :name="credit.name"
      :when="credit.when"
      :mode="credit.mode"
      :time="time"
      :duration="duration"
      :sections="sections"
      :over-visual="view === 'visual'"
      :avoid="settings.live.on && settings.live.overVisual ? settings.live.wayInCorner : ''"
    />

    <Transition name="card">
      <div v-if="card && current" class="title-card">
        <small>{{ (current.other ? [current.artist || 'Other music', current.album] : [current.model || 'Plenio', current.genre]).filter(Boolean).join(' · ') }}</small>
        <h2>{{ current.title }}</h2>
      </div>
    </Transition>

    <Transition name="upnext">
      <div v-if="upNextShown && upNext" :key="upNext.id" class="up-next" :class="{ left: upNextLeft }">
        <div class="thumb"><CoverArt :song="upNext" rounded :size="80" /></div>
        <div class="text">
          <small>Up next</small>
          <b>{{ upNext.title }}</b>
          <span>{{ upNextBy }}</span>
        </div>
      </div>
    </Transition>

    <BottomSheet v-if="phoneMenu" :title="current?.title" @close="phoneMenu = false">
      <div class="np-menu">
        <button class="ghost" @click="phoneMenu = false; openCurrentPage()"><Icon name="info" :size="18" /> The song's page</button>
        <button class="ghost" @click="phoneMenu = false; lyricsPanel = true"><Icon name="mic" :size="18" /> How the lyrics look</button>
        <button class="ghost" @click="phoneMenu = false; panel = true"><Icon name="sparkles" :size="18" /> Visuals</button>
        <button class="ghost" @click="phoneMenu = false; visual?.next()"><Icon name="dice" :size="18" /> Another visual</button>
        <button class="ghost" @click="phoneMenu = false; visualFullscreen()"><Icon name="expand" :size="18" /> Only the visual, whole screen</button>
      </div>
    </BottomSheet>

    <footer class="dock">
      <div class="chips">
        <button v-for="s in sections" :key="s.at" class="chip" :class="{ on: section?.at === s.at }" @click="engine.seek(s.at)">{{ sectionName(s.label) }}</button>
      </div>
      <Waveform :song-id="current?.id ?? null" :time="time" :duration="duration" :sections="sections" :lines="lines" tall />
      <div v-if="isPhone" class="times"><span>{{ formatTime(time) }}</span><span>{{ formatTime(duration) }}</span></div>
      <div class="row">
        <span class="t">{{ formatTime(time) }}</span>
        <div class="controls">
          <button class="icon-btn" :class="{ on: settings.shuffle }" @click="settings.shuffle = !settings.shuffle"><Icon name="shuffle" /></button>
          <button class="icon-btn" @click="previous()"><Icon name="prev" :size="24" /></button>
          <button class="play" @click="engine.toggle()"><Icon :name="playing ? 'pause' : 'play'" :size="28" /></button>
          <button class="icon-btn" @click="next()"><Icon name="next" :size="24" /></button>
          <button v-if="current" class="icon-btn" :class="{ on: isFavorite(current.id) }" @click="toggleFavorite(current.id)"><Icon name="heart" :filled="isFavorite(current.id)" /></button>
          <button class="icon-btn repeat" :class="{ on: settings.repeat !== 'off' }" :title="{ all: 'Repeat the whole playlist (R)', one: 'Repeat this song (R)', off: 'No repeat (R)' }[settings.repeat]" @click="settings.repeat = settings.repeat === 'all' ? 'one' : settings.repeat === 'one' ? 'off' : 'all'">
            <Icon name="repeat" /><i v-if="settings.repeat === 'one'">1</i>
          </button>
        </div>
        <span class="t">{{ formatTime(duration) }}</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.np {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  /* minmax(0, ...): a wide child (the sections, the waveform) never widens the page beyond the screen */
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: auto minmax(0, 1fr) auto;
  color: #fff;
  overflow: hidden;
  background: #05040a;
}
.backdrop,
.visual {
  position: absolute;
  inset: 0;
}
.backdrop .blur {
  position: absolute;
  inset: -10%;
  width: 120%;
  filter: blur(60px) saturate(1.4);
  opacity: 0.55;
  animation: pan 30s ease-in-out infinite alternate;
}
.tint {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 20%, transparent, var(--deep) 75%), linear-gradient(180deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.75));
}
.visual {
  transition: opacity 0.8s;
}
.visual.dim {
  opacity: 0.24;
  mix-blend-mode: screen;
}
.view-notation .visual.dim {
  opacity: 0.12;
}
.lpanel {
  width: 360px;
  max-height: calc(100% - 40px);
  overflow-y: auto;
  padding: 16px 18px 20px;
  border-radius: 18px;
  background: rgba(14, 12, 22, 0.94);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(20px);
}
.lpanel header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.lpanel h3 {
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 0;
  font: 600 16px var(--font);
}
.repeat {
  position: relative;
}
.repeat i {
  position: absolute;
  right: 2px;
  bottom: 2px;
  font: 700 9px var(--font);
  font-style: normal;
}
/* the guests' way in: top right, under the tools; it stays when the controls fade (the room needs it) */
.way-in {
  position: absolute;
  top: 70px;
  right: 22px;
  z-index: 4;
}
/* over the visual: in the corner chosen; at the bottom above the controls while they show */
.view-visual .way-in.top-left {
  right: auto;
  left: 22px;
}
.view-visual .way-in.bottom-right,
.view-visual .way-in.bottom-left {
  top: auto;
  bottom: 190px;
  transition: bottom 0.6s;
}
.view-visual.idle .way-in.bottom-right,
.view-visual.idle .way-in.bottom-left {
  bottom: 24px;
}
.view-visual .way-in.bottom-left {
  right: auto;
  left: 22px;
}
.view-visual .way-in.size-l :deep(.text b) {
  font-size: 17px;
}
/* a narrower window: the QR code alone, so the song's title keeps its room */
@media (max-width: 1300px) {
  .way-in :deep(.text) {
    display: none;
  }
}
.top {
  grid-row: 1;
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  transition: opacity 0.6s;
}
.views {
  display: flex;
  gap: 4px;
  background: rgba(0, 0, 0, 0.35);
  padding: 4px;
  border-radius: 99px;
  backdrop-filter: blur(12px);
}
.views button {
  border: 0;
  background: none;
  color: rgba(255, 255, 255, 0.7);
  font: 600 13px var(--font);
  padding: 7px 16px;
  border-radius: 99px;
  cursor: pointer;
}
.views button.on {
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
}
.tools {
  display: flex;
  gap: 6px;
}
.vpanel {
  position: absolute;
  right: 20px;
  top: 64px;
  bottom: 170px;
  z-index: 6;
}
.stage {
  grid-row: 2;
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: minmax(280px, 0.9fr) 1.1fr;
  gap: 5vw;
  padding: 0 6vw;
  min-height: 0;
  align-items: center;
}
.view-lyrics .stage {
  grid-template-columns: 1fr;
  padding: 0 14vw;
}
.view-notation .stage {
  grid-template-columns: 1fr 320px;
  gap: 24px;
  padding: 0 3vw;
}
.view-visual .stage {
  visibility: hidden;
}
.cover-col {
  text-align: left;
}
.cover-wrap {
  width: min(38vh, 100%);
  border-radius: 18px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6), 0 0 60px var(--glow);
  transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.cover-wrap.playing {
  animation: float 6s ease-in-out infinite;
}
h1 {
  font: 800 clamp(26px, 3.4vw, 50px) / 1.05 var(--font);
  margin: 26px 0 10px;
  letter-spacing: -0.5px;
  cursor: pointer;
}
.facts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
}
.facts span {
  font: 12px var(--font);
  padding: 4px 10px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.8);
}
.lyrics-col,
.notation-col,
.side-lyrics {
  height: 100%;
  max-height: calc(100vh - 260px);
  min-height: 0;
}
.lyrics-col,
.side-lyrics {
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.55);
}
.view-lyrics .lyrics-col :deep(.line) {
  font-size: clamp(26px, 3.4vw, 52px);
  text-align: center;
  transform-origin: center;
}
.subtitle {
  position: absolute;
  z-index: 3;
  left: 0;
  right: 0;
  bottom: 190px;
  text-align: center;
  font-family: var(--lyrics-font, var(--font));
  font-weight: var(--lyrics-weight, 800);
  font-size: calc(clamp(24px, 3vw, 46px) * var(--lyrics-scale, 1));
  line-height: 1.2;
  padding: 0 8vw;
  text-shadow: 0 4px 30px rgba(0, 0, 0, 0.8);
}
.title-card {
  position: absolute;
  z-index: 4;
  left: 6vw;
  top: 18vh;
  pointer-events: none;
}
.title-card small {
  font: 600 14px var(--font);
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 2px;
}
.title-card h2 {
  font: 900 clamp(40px, 6vw, 96px) / 1 var(--font);
  margin: 6px 0 0;
  letter-spacing: -1px;
  text-shadow: 0 10px 50px rgba(0, 0, 0, 0.6);
}
.view-stage .title-card,
.view-notation .title-card {
  display: none;
}
/* Up next: a lower third above the controls, at the bottom of the visual when they hide */
.up-next {
  position: absolute;
  z-index: 4;
  right: 6vw;
  bottom: 200px;
  display: flex;
  align-items: center;
  gap: 14px;
  max-width: min(460px, 42vw);
  padding: 12px 20px 12px 12px;
  border-radius: 18px;
  background: rgba(12, 10, 22, 0.62);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.45);
  pointer-events: none;
  transition: bottom 0.6s;
}
.up-next.left {
  right: auto;
  left: 6vw;
}
.view-visual.idle .up-next {
  bottom: 36px;
}
.up-next .thumb {
  width: 72px;
  flex: none;
}
.up-next .text {
  min-width: 0;
}
.up-next small {
  display: block;
  font: 700 11px var(--font);
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--accent);
}
.up-next b {
  display: block;
  font: 800 20px/1.25 var(--font);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.up-next span {
  display: block;
  font-size: 13px;
  color: var(--muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.upnext-enter-active,
.upnext-leave-active {
  transition: opacity 0.5s, transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.upnext-enter-from {
  opacity: 0;
  transform: translateX(40px);
}
.up-next.left.upnext-enter-from {
  transform: translateX(-40px);
}
.upnext-leave-to {
  opacity: 0;
  transform: translateY(14px);
}
.dock {
  grid-row: 3;
  position: relative;
  z-index: 3;
  padding: 10px 6vw 22px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.55));
  transition: opacity 0.6s, transform 0.6s;
}
.chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
}
.controls {
  display: flex;
  align-items: center;
  gap: 18px;
}
.play {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 0;
  display: grid;
  place-items: center;
  background: #fff;
  color: #0b0a12;
  cursor: pointer;
  box-shadow: 0 0 40px var(--glow);
  transition: transform 0.15s;
}
.play:hover {
  transform: scale(1.06);
}
.t {
  font: 12px var(--mono);
  color: rgba(255, 255, 255, 0.7);
}
.idle .top,
.idle .dock {
  opacity: 0;
}
.idle .dock {
  transform: translateY(20px);
}
.idle {
  cursor: none;
}
.panel-enter-active,
.panel-leave-active,
.card-enter-active,
.card-leave-active {
  transition: opacity 0.5s, transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.card-enter-from {
  opacity: 0;
  transform: translateY(30px);
}
.card-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.98);
}
@keyframes pan {
  from {
    transform: scale(1.05) translate(-2%, -1%);
  }
  to {
    transform: scale(1.15) translate(2%, 2%);
  }
}
@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(-0.3deg);
  }
  50% {
    transform: translateY(-10px) rotate(0.3deg);
  }
}
@media (max-width: 900px) {
  .stage {
    grid-template-columns: 1fr;
  }
  .cover-col {
    display: none;
  }
}
/* a phone: the cover above the title and the lyrics (Stage), the views as one bar, the sections in one row that
   scrolls, the controls large - and the screen's rounded corners and its home bar kept free */
.np.phone {
  grid-template-rows: auto minmax(0, 1fr) auto;
  padding: env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px);
  transition: transform 0.08s, opacity 0.08s;
  /* a swipe down is the page's (it closes Now playing), not the browser's - no pull-to-refresh, no pointercancel;
     the lyrics and the panels scroll in themselves, sideways the chips */
  touch-action: pan-x;
}
.phone .top {
  padding: 10px 10px 6px;
  gap: 6px;
}
.phone .views {
  flex: 1;
  justify-content: space-between;
  max-width: 330px;
}
.phone .views button {
  flex: 1;
  padding: 7px 4px;
  font-size: 12.5px;
}
.phone.view-stage .stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 8px 22px 0;
}
.phone.view-stage .cover-col {
  display: grid;
  justify-items: center;
  text-align: center;
  flex: none;
}
.phone .cover-wrap {
  width: min(64vw, 34vh);
}
.phone h1 {
  font-size: 24px;
  margin: 16px 0 6px;
  overflow-wrap: anywhere;
}
.phone .facts {
  justify-content: center;
}
.phone .facts span:nth-child(n + 4) {
  display: none;
}
.phone.view-stage .lyrics-col {
  width: 100%;
  flex: 1;
  min-height: 0;
  max-height: none;
}
.phone .lyrics-col :deep(.line) {
  font-size: clamp(18px, 5.4vw, 24px);
  text-align: center;
  overflow-wrap: anywhere;
}
.phone.view-lyrics .stage {
  padding: 0 18px;
}
.phone.view-lyrics .lyrics-col :deep(.line) {
  font-size: clamp(24px, 7vw, 34px);
}
.phone.view-notation .stage {
  grid-template-columns: minmax(0, 1fr);
  padding: 0 8px;
}
.phone.view-notation .side-lyrics {
  display: none;
}
.phone .subtitle {
  bottom: 200px;
  padding: 0 18px;
  font-size: calc(clamp(20px, 6vw, 30px) * var(--lyrics-scale, 1));
}
.phone .dock {
  padding: 6px 18px 14px;
}
.phone .chips {
  flex-wrap: nowrap;
  overflow-x: auto;
  margin: 0 -18px 8px;
  padding: 0 18px;
  scrollbar-width: none;
}
.phone .chips .chip {
  flex: none;
}
.phone .row {
  margin-top: 6px;
}
.phone .controls {
  gap: 10px;
}
.phone .controls .icon-btn {
  width: 44px;
  height: 44px;
}
.phone .play {
  width: 66px;
  height: 66px;
}
.phone .row .t {
  display: none;
}
.phone .row {
  justify-content: center;
}
.times {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  font: 11px var(--mono);
  color: rgba(255, 255, 255, 0.7);
}
.phone .way-in {
  display: none;
}
.phone .vpanel {
  left: 10px;
  right: 10px;
  top: 58px;
  bottom: 190px;
  width: auto;
}
.np-menu {
  display: grid;
  gap: 8px;
}
.np-menu .ghost {
  justify-content: flex-start;
  height: 50px;
}
</style>
