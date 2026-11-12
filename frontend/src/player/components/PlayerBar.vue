<script setup lang="ts">
/** The bar at the bottom: the song, the controls, the waveform, Winamp's little bars, A/B, speed, volume. */
import { computed } from 'vue'

import { engine } from '../engine'
import { lineIndex, lines, lyricsVersion, paletteStyle, section, sections, toggleLyrics } from '../now'
import { sungOf } from '../lyricsVersion'
import {
  ab,
  current,
  detail,
  duration,
  go,
  isFavorite,
  muted,
  next,
  nowPlayingOpen,
  openNowPlaying,
  openCurrentPage,
  playing,
  previous,
  setVolume,
  settings,
  sleep,
  sleepLeft,
  time,
  toggleAB,
  toggleFavorite,
  toggleMute,
} from '../store'
import { formatTime, sectionName } from '../timing'
import CoverArt from './CoverArt.vue'
import Icon from './Icon.vue'
import VisualCanvas from './VisualCanvas.vue'
import Waveform from './Waveform.vue'

/** What the repeat button does now - and a click goes on to the next of the three. */
const REPEAT_TITLES = {
  all: 'Repeat the whole playlist (the queue starts again) - click: repeat this song (R)',
  one: 'Repeat this song - click: no repeat (R)',
  off: 'No repeat: the music stops after the last song - click: repeat the whole playlist (R)',
} as const
const emit = defineEmits<{ queue: []; visual: [] }>()
const RATES = [0.75, 0.85, 1, 1.1, 1.25]

const line = computed(() => (lineIndex.value >= 0 && time.value <= (lines.value[lineIndex.value]?.end ?? 0) + 0.3 ? lines.value[lineIndex.value].text : ''))

function cycleRepeat(): void {
  settings.repeat = settings.repeat === 'all' ? 'one' : settings.repeat === 'one' ? 'off' : 'all'
}
function cycleRate(): void {
  const at = RATES.indexOf(settings.rate)
  settings.rate = RATES[(at + 1) % RATES.length]
  engine.setRate(settings.rate)
}
function volume(event: Event): void {
  setVolume(Number((event.target as HTMLInputElement).value))
}
</script>

<template>
  <footer class="bar" :style="paletteStyle">
    <div class="song" v-if="current">
      <button class="art" title="Now playing (F)" @click="openNowPlaying(($event.currentTarget as Element).querySelector('.cover, img, canvas, div') ?? ($event.currentTarget as Element))">
        <CoverArt :song="current" :live="playing" rounded :size="56" />
        <span class="open"><Icon name="expand" :size="18" /></span>
      </button>
      <div class="meta">
        <a class="title" @click="go(`/song/${current.id}`)">{{ current.title }}</a>
        <div class="sub">
          <span v-if="section" class="sec">{{ sectionName(section.label) }}</span>
          <Transition name="lyric" mode="out-in"><span :key="line" class="line">{{ line || current.genre }}</span></Transition>
        </div>
      </div>
      <button class="icon-btn" title="The song's page: lyrics, notation, details (I)" @click="openCurrentPage"><Icon name="info" /></button>
      <button class="icon-btn" :class="{ on: isFavorite(current.id) }" title="Favourite" @click="toggleFavorite(current.id)">
        <Icon name="heart" :filled="isFavorite(current.id)" />
      </button>
    </div>
    <div v-else class="song empty">Choose a song: ▶ on its cover plays it, a click on it opens its page.</div>

    <div class="centre">
      <div class="controls">
        <button class="icon-btn" :class="{ on: settings.shuffle }" title="Shuffle (S)" @click="settings.shuffle = !settings.shuffle"><Icon name="shuffle" /></button>
        <button class="icon-btn" title="Previous" @click="previous()"><Icon name="prev" /></button>
        <button class="play" :class="{ playing }" title="Play / pause (Space)" @click="engine.toggle()">
          <Icon :name="playing ? 'pause' : 'play'" :size="22" />
        </button>
        <button class="icon-btn" title="Next" @click="next()"><Icon name="next" /></button>
        <button class="icon-btn repeat" :class="{ on: settings.repeat !== 'off' }" :title="REPEAT_TITLES[settings.repeat]" @click="cycleRepeat">
          <Icon name="repeat" /><i v-if="settings.repeat === 'one'">1</i>
        </button>
      </div>
      <div class="progress">
        <span class="t">{{ formatTime(time) }}</span>
        <Waveform :song-id="current?.id ?? null" :time="time" :duration="duration" :sections="sections" :lines="lines" />
        <span class="t">{{ formatTime(duration) }}</span>
      </div>
    </div>

    <div class="right">
      <button v-if="settings.live.on" class="live-pill" title="Live Play: new songs from ComfyUI join as they are made" @click="go('/live')">LIVE</button>
      <div class="mini" title="Now playing (F)" @click="nowPlayingOpen = true">
        <VisualCanvas mini />
        <button class="mini-full" title="The visual, full screen (Shift+F)" @click.stop="emit('visual')"><Icon name="expand" :size="14" /></button>
      </div>
      <button v-if="current?.has.original" class="chip" :class="{ on: ab }" title="A/B: the unmastered take, in step (B)" @click="toggleAB">
        {{ ab ? 'B · original' : 'A · master' }}
      </button>
      <button v-if="sungOf(detail)" class="chip" :class="{ on: lyricsVersion === 'sung' }" title="Lyrics as written, or as the take sings them - kept for this song (W)" @click="toggleLyrics">
        {{ lyricsVersion === 'sung' ? 'Lyrics · as sung' : 'Lyrics · as written' }}
      </button>
      <button class="chip speed" title="Speed (keeps the pitch)" @click="cycleRate">{{ settings.rate }}×</button>
      <div class="vol">
        <button class="icon-btn" :title="muted ? 'Sound on (M)' : 'Mute (M)'" @click="toggleMute">
          <Icon :name="muted || settings.volume === 0 ? 'mute' : 'volume'" />
        </button>
        <input type="range" min="0" max="1" step="0.01" :value="muted ? 0 : settings.volume" @input="volume" />
      </div>
      <span v-if="sleep" class="sleep" title="Sleep timer (in the queue)"><Icon name="timer" :size="16" />{{ sleep === 'song' ? 'song' : formatTime(sleepLeft) }}</span>
      <button class="icon-btn" title="Queue (Q)" @click="emit('queue')"><Icon name="queue" /></button>
    </div>
  </footer>
</template>

<style scoped>
.bar {
  grid-area: bar;
  display: grid;
  /* the right column takes what its buttons need; the song and the progress share the rest */
  grid-template-columns: minmax(170px, 1fr) minmax(300px, 2fr) auto;
  align-items: center;
  gap: 18px;
  padding: 10px 18px 16px;
  background: linear-gradient(180deg, rgba(14, 13, 22, 0.88), rgba(9, 8, 14, 0.98));
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(18px);
  position: relative;
  z-index: 20;
}
.bar::before {
  content: '';
  position: absolute;
  inset: -1px 0 auto;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent), var(--accent2), transparent);
  opacity: 0.6;
}
.song {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.song.empty {
  color: var(--muted);
  font-size: 13px;
}
.art {
  position: relative;
  width: 56px;
  flex: none;
  border: 0;
  padding: 0;
  background: none;
  cursor: pointer;
  border-radius: 12px;
  box-shadow: 0 6px 20px var(--glow);
}
.art .open {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #fff;
  background: rgba(0, 0, 0, 0.45);
  opacity: 0;
  border-radius: 12px;
  transition: opacity 0.2s;
}
.art:hover .open {
  opacity: 1;
}
.meta {
  min-width: 0;
  flex: 1;
}
.title {
  display: block;
  font: 600 14px var(--font);
  color: #fff;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.title:hover {
  text-decoration: underline;
}
.sub {
  display: flex;
  gap: 8px;
  font: 12px var(--font);
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
}
.sec {
  color: var(--accent);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 0.6px;
  padding-top: 1px;
}
.line {
  overflow: hidden;
  text-overflow: ellipsis;
}
.centre {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 14px;
}
.play {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 0;
  display: grid;
  place-items: center;
  color: #0b0a12;
  background: linear-gradient(135deg, #fff, #dcd6ff);
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.3s;
  box-shadow: 0 0 0 0 var(--glow);
}
.play:hover {
  transform: scale(1.07);
}
.play.playing {
  box-shadow: 0 0 24px 2px var(--glow);
}
.progress {
  display: flex;
  align-items: center;
  gap: 10px;
}
.progress > :deep(.wave) {
  flex: 1;
}
.t {
  font: 11px var(--mono);
  color: var(--muted);
  width: 38px;
  text-align: center;
}
.repeat {
  position: relative;
}
.repeat i {
  position: absolute;
  right: 0;
  bottom: 2px;
  font: 700 9px var(--font);
  font-style: normal;
}
.right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}
.live-pill {
  border: 0;
  border-radius: 6px;
  padding: 3px 8px;
  background: #e5484d;
  color: #fff;
  font: 700 11px var(--font);
  letter-spacing: 0.6px;
  cursor: pointer;
}
/* square at any window size, and bright (owner's request 2026-10-17) */
.mini {
  position: relative;
  flex: none;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  background: #0a0816;
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 0 18px color-mix(in srgb, var(--accent) 35%, transparent);
  transition: transform 0.15s, box-shadow 0.15s;
}
.mini:hover {
  transform: scale(1.06);
  box-shadow: 0 0 24px color-mix(in srgb, var(--accent) 55%, transparent);
}
.mini-full {
  position: absolute;
  right: 2px;
  top: 2px;
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s;
}
.mini:hover .mini-full,
.mini-full:focus-visible {
  opacity: 1;
}
.vol {
  display: flex;
  align-items: center;
  gap: 4px;
}
.vol input {
  width: 90px;
  accent-color: var(--accent);
}
.lyric-enter-active,
.lyric-leave-active {
  transition: opacity 0.25s, transform 0.25s;
}
.lyric-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.lyric-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
.sleep {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font: 12px var(--mono);
  color: var(--accent);
}
/* less room: the volume keeps its button, the speed goes (Now playing and the keys still have it) */
@media (max-width: 1280px) {
  .vol input {
    width: 60px;
  }
}
@media (max-width: 1100px) {
  .vol input,
  .speed {
    display: none;
  }
}
@media (max-width: 980px) {
  .bar {
    grid-template-columns: minmax(0, 1fr);
  }
  .right {
    justify-content: center;
  }
}
</style>
