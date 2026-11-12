<script setup lang="ts">
/**
 * The slim player at the bottom of a phone or a tablet (owner's request 2026-10-26: the full bar took a third of a
 * phone's screen): the song's cover, its title and the line sung now, play and next - the progress a thin line along
 * its top. A tap opens Now playing; a swipe sideways goes to the next or the previous song, a swipe up opens Now
 * playing. On a tablet it also has previous, favourite, the visual and the queue.
 */
import { computed, ref } from 'vue'

import { engine } from '../engine'
import { isPhone } from '../layout'
import { lineIndex, lines, paletteStyle } from '../now'
import { current, duration, isFavorite, next, nowPlayingOpen, openNowPlaying, playing, previous, settings, time, toggleFavorite } from '../store'
import CoverArt from './CoverArt.vue'
import Icon from './Icon.vue'
import VisualCanvas from './VisualCanvas.vue'

const emit = defineEmits<{ queue: [] }>()

const line = computed(() => (lineIndex.value >= 0 && time.value <= (lines.value[lineIndex.value]?.end ?? 0) + 0.3 ? lines.value[lineIndex.value].text : ''))
const progress = computed(() => (duration.value > 0 ? Math.min(1, time.value / duration.value) : 0))

// a swipe: sideways the next or the previous song, up Now playing; the card follows the finger a little
const shift = ref(0)
const art = ref<HTMLElement | null>(null)
/** The next song comes in from the side the finger swiped from. */
const arriving = ref<'' | 'from-left' | 'from-right'>('')
let start: { x: number; y: number; at: number } | null = null
function down(event: PointerEvent): void {
  if (event.pointerType === 'mouse') return
  start = { x: event.clientX, y: event.clientY, at: performance.now() }
}
function move(event: PointerEvent): void {
  if (!start) return
  const dx = event.clientX - start.x
  if (Math.abs(dx) > Math.abs(event.clientY - start.y)) shift.value = Math.max(-90, Math.min(90, dx * 0.6))
}
function up(event: PointerEvent): void {
  if (!start) return
  const dx = event.clientX - start.x
  const dy = event.clientY - start.y
  start = null
  shift.value = 0
  if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.4) {
    arriving.value = dx < 0 ? 'from-right' : 'from-left'
    window.setTimeout(() => (arriving.value = ''), 300)
    void (dx < 0 ? next() : previous())
  } else if (dy < -50 && Math.abs(dy) > Math.abs(dx)) nowPlayingOpen.value = true
}
function open(): void {
  if (Math.abs(shift.value) < 4) openNowPlaying(art.value)
}
</script>

<template>
  <footer v-if="current" class="mini" :class="{ phone: isPhone }" :style="paletteStyle">
    <i class="progress" :style="{ transform: `scaleX(${progress})` }" />
    <div
      class="song"
      :class="arriving"
      :style="{ transform: shift ? `translateX(${shift}px)` : '' }"
      role="button"
      tabindex="0"
      title="Now playing"
      @pointerdown="down"
      @pointermove="move"
      @pointerup="up"
      @pointercancel="start = null; shift = 0"
      @click="open"
      @keydown.enter="nowPlayingOpen = true"
    >
      <span ref="art" class="art"><CoverArt :song="current" :live="playing" rounded :size="48" /></span>
      <span class="meta">
        <b>{{ current.title }}</b>
        <Transition name="lyric" mode="out-in"><small :key="line">{{ line || current.genre || current.style.split(',')[0] }}</small></Transition>
      </span>
    </div>
    <button v-if="!isPhone" class="icon-btn" title="Previous" @click="previous()"><Icon name="prev" /></button>
    <button v-if="!isPhone" class="icon-btn" :class="{ on: isFavorite(current.id) }" title="Favourite" @click="toggleFavorite(current.id)"><Icon name="heart" :filled="isFavorite(current.id)" /></button>
    <button class="play" :class="{ playing }" :title="playing ? 'Pause' : 'Play'" @click="engine.toggle()"><Icon :name="playing ? 'pause' : 'play'" :size="22" /></button>
    <button class="icon-btn" title="Next" @click="next()"><Icon name="next" /></button>
    <div v-if="!isPhone && settings.visuals.enabled" class="visual" title="The visual" @click="nowPlayingOpen = true"><VisualCanvas mini /></div>
    <button v-if="!isPhone" class="icon-btn" title="Queue" @click="emit('queue')"><Icon name="queue" /></button>
  </footer>
</template>

<style scoped>
.mini {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 8px;
  padding: 7px 8px 7px 7px;
  border-radius: 16px;
  background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 24%, rgba(20, 17, 30, 0.92)), rgba(16, 14, 24, 0.94));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  overflow: hidden;
  transition: background 0.8s;
}
.progress {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  transform-origin: left;
  background: linear-gradient(90deg, var(--accent), var(--accent2));
  transition: transform 0.25s linear;
}
.song {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  /* both swipes are the page's: sideways the next song, up Now playing (with pan-y the browser took the swipe up) */
  touch-action: none;
  transition: transform 0.18s;
}
.song.from-left {
  animation: from-left 0.3s ease-out;
}
.song.from-right {
  animation: from-right 0.3s ease-out;
}
.art {
  width: 44px;
  flex: none;
  border-radius: 10px;
  box-shadow: 0 4px 14px var(--glow);
}
.meta {
  min-width: 0;
  display: grid;
}
.meta b {
  font: 600 14px/1.25 var(--font);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.meta small {
  font: 12px/1.3 var(--font);
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.play {
  flex: none;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 0;
  display: grid;
  place-items: center;
  color: #0b0a12;
  background: #fff;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.3s;
}
.play.playing {
  box-shadow: 0 0 22px var(--glow);
}
.play:active {
  transform: scale(0.92);
}
.icon-btn {
  width: 40px;
  height: 40px;
}
.visual {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  overflow: hidden;
  flex: none;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.12);
}
.lyric-enter-active,
.lyric-leave-active {
  transition: opacity 0.25s, transform 0.25s;
}
.lyric-enter-from {
  opacity: 0;
  transform: translateY(5px);
}
.lyric-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
@keyframes from-left {
  from {
    transform: translateX(-60px);
    opacity: 0.2;
  }
}
@keyframes from-right {
  from {
    transform: translateX(60px);
    opacity: 0.2;
  }
}
</style>
