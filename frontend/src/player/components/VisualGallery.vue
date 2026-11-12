<script setup lang="ts">
/**
 * The visuals to choose from, each in a little window playing to the song (owner's request 2026-10-25): for one
 * section or span of the video - or the whole video - the visual chosen, or *At random*. The previews are drawn
 * with the music of that moment (video/previews.ts); the windows in sight first.
 *
 * Compact (owner's request 2026-10-29: many visuals, yet easy to oversee): small windows with their names (larger
 * ones with what each shows, to switch), a search, the moods they suit, and a jump to each group. Only visuals this
 * browser can draw are offered (owner's request 2026-10-30).
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

import { myPresets } from '../visuals/drop'
import { gpuSupport, offeredForVideo } from '../visuals/gpu'
import { CLASSIC, PRESETS, presetById, type Preset } from '../visuals/presets'
import { PREVIEW_FPS, type PreviewMaker, showFrame } from '../video/previews'
import Icon from './Icon.vue'

const props = defineProps<{
  maker: PreviewMaker | null
  /** The song time the previews play (the middle of the slot). */
  at: number
  title: string
  chosen: string
  /** What the first tile means: ``random`` (a slot) or ``auto`` (one visual for the whole video). */
  first: 'random' | 'auto'
  /** The visual a random slot came to (shown on the first tile). */
  randomNow?: string
  repeats?: number
}>()
const emit = defineEmits<{ pick: [id: string]; close: [] }>()

const query = ref('')
const mood = ref('')
const MOODS = ['energetic', 'calm', 'electronic', 'acoustic', 'dark']
const LARGE = 'plenio.gallery.large'
/** Larger windows with what each visual shows (remembered in this browser). */
const large = ref(readLarge())
function readLarge(): boolean {
  try {
    return localStorage.getItem(LARGE) === '1'
  } catch {
    return false
  }
}
function toggleLarge(): void {
  large.value = !large.value
  try {
    localStorage.setItem(LARGE, large.value ? '1' : '0')
  } catch {
    // only for this time
  }
}
const sections = new Map<string, HTMLElement>()
function keepSection(label: string, el: unknown): void {
  if (el instanceof HTMLElement) sections.set(label, el)
}
function jump(label: string): void {
  sections.get(label)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
/** Why Plenio Drop or Nova are not in the gallery here. */
const gpuNote = (() => {
  const support = gpuSupport()
  if (!support.webgl) return `Plenio Drop and Plenio Nova are not offered here: ${support.why}`
  return ''
})()
/** A visual's name in its group. */
const shortName = (name: string): string => name.replace(/^(Drop|Nova|My) · /, '')
const grid = ref<HTMLElement | null>(null)
const tiles = new Map<string, HTMLCanvasElement>()
const visible = new Set<string>()
let observer: IntersectionObserver | null = null
let timer = 0
let tick = 0

const groups = computed<[string, Preset[]][]>(() => {
  const words = query.value.toLowerCase().split(/\s+/).filter(Boolean)
  const keep = (p: Preset) =>
    offeredForVideo(p) &&
    (!words.length || words.every((w) => `${p.name} ${p.blurb} ${p.suits.join(' ')}`.toLowerCase().includes(w))) &&
    (!mood.value || p.suits.includes(mood.value) || p.suits.includes('any'))
  return (
    [
      ['Classic', CLASSIC.filter(keep)],
      ['Plenio Drop', PRESETS.filter((p) => p.kind === 'drop').filter(keep)],
      ['Plenio Nova', PRESETS.filter((p) => p.kind === 'nova').filter(keep)],
      ['My presets', myPresets.value.filter(keep)],
    ] as [string, Preset[]][]
  ).filter(([, list]) => list.length)
})

function register(id: string, el: unknown): void {
  if (el instanceof HTMLCanvasElement) {
    if (tiles.get(id) !== el) {
      tiles.set(id, el)
      el.dataset.visual = id
      observer?.observe(el)
    }
  } else tiles.delete(id)
}

function request(): void {
  const maker = props.maker
  if (!maker) return
  // the windows in sight first, then the rest in order
  const ids = [...tiles.keys()]
  ids.sort((a, b) => Number(!visible.has(a)) - Number(!visible.has(b)))
  ids.forEach((id, k) => void maker.get(id, props.at, undefined, visible.has(id) ? k : 1000 + k))
}

function paint(): void {
  tick += 1
  const maker = props.maker
  if (!maker) return
  for (const id of visible) {
    const canvas = tiles.get(id)
    const preview = maker.ready(id, props.at)
    if (canvas && preview) showFrame(canvas, preview, tick)
  }
}

onMounted(async () => {
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const id = (entry.target as HTMLElement).dataset.visual ?? ''
        if (entry.isIntersecting) visible.add(id)
        else visible.delete(id)
      }
      request()
    },
    { root: grid.value, rootMargin: '120px' }
  )
  await nextTick()
  for (const el of tiles.values()) observer.observe(el)
  timer = window.setInterval(paint, 1000 / PREVIEW_FPS)
})
onBeforeUnmount(() => {
  observer?.disconnect()
  window.clearInterval(timer)
  props.maker?.forget()
})

const randomName = computed(() => (props.randomNow ? presetById(props.randomNow)?.name ?? '' : ''))
/** The windows have the video's shape. */
const shape = computed(() => (props.maker ? { aspectRatio: `${props.maker.width} / ${props.maker.height}` } : {}))
</script>

<template>
  <div class="veil" @click.self="emit('close')">
    <div class="gallery" role="dialog" :aria-label="`The visual for ${title}`">
      <header>
        <div>
          <h3><Icon name="sparkles" /> The visual for {{ title }}</h3>
          <p class="hint">Each window plays the visual to the music of this part.{{ repeats && repeats > 1 ? ` It is used for all ${repeats} parts of this kind.` : '' }}</p>
        </div>
        <input v-model="query" type="search" placeholder="Find a visual …" aria-label="Find a visual" />
        <button class="icon-btn" title="Close" @click="emit('close')"><Icon name="close" /></button>
      </header>
      <nav class="bar">
        <button v-for="[label, list] in groups" :key="label" class="jump" :title="`To ${label}`" @click="jump(label)">{{ label }} <small>{{ list.length }}</small></button>
        <span class="spacer" />
        <button v-for="m in MOODS" :key="m" class="mood" :class="{ on: mood === m }" :title="`Only the visuals that suit ${m} music`" @click="mood = mood === m ? '' : m">{{ m }}</button>
        <button class="jump" :title="large ? 'Small windows: more at a glance' : 'Larger windows, with what each visual shows'" @click="toggleLarge"><Icon :name="large ? 'grid' : 'list'" :size="13" /> {{ large ? 'small' : 'large' }}</button>
      </nav>
      <p v-if="gpuNote" class="gpu">{{ gpuNote }}</p>
      <div ref="grid" class="grid-scroll" :class="{ large }">
        <div class="tiles">
          <button class="tile special" :class="{ on: !chosen }" @click="emit('pick', '')">
            <span class="dice"><Icon name="dice" :size="34" /></span>
            <b>{{ first === 'random' ? 'At random' : 'As the visuals’ settings choose' }}</b>
            <small>{{ first === 'random' ? (randomName ? `now: ${randomName} - 🎲 shuffles` : 'a different one, by the dice') : 'for this song, as in the player' }}</small>
          </button>
        </div>
        <section v-for="[label, list] in groups" :key="label" :ref="(el) => keepSection(label, el)">
          <h4>{{ label }} <small>{{ list.length }}</small></h4>
          <div class="tiles">
            <button v-for="p in list" :key="p.id" class="tile" :class="{ on: chosen === p.id }" :title="`${p.name} - ${p.blurb}`" @click="emit('pick', p.id)">
              <canvas :ref="(el) => register(p.id, el)" class="window" :style="shape" />
              <b>{{ shortName(p.name) }}</b>
              <small v-if="large">{{ p.blurb }}</small>
            </button>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.veil {
  position: fixed;
  inset: 0;
  z-index: 85;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
}
.gallery {
  width: min(1180px, 96vw);
  height: min(860px, 92vh);
  display: flex;
  flex-direction: column;
  border-radius: 20px;
  background: #13101c;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.7);
}
header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
header > div {
  flex: 1;
  min-width: 0;
}
h3 {
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 0;
}
.hint {
  margin: 2px 0 0;
  color: var(--muted);
  font-size: 12px;
}
header input {
  width: 220px;
  height: 36px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font: 13px var(--font);
}
.grid-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 14px 18px 22px;
}
.bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
  padding: 8px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.bar .spacer {
  flex: 1;
}
.jump,
.mood {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  color: #ddd;
  border-radius: 999px;
  padding: 3px 10px;
  font: 12px var(--font);
  cursor: pointer;
}
.jump small {
  color: var(--muted);
}
.mood {
  color: var(--muted);
  background: transparent;
}
.mood.on {
  border-color: var(--accent);
  color: #fff;
  background: color-mix(in srgb, var(--accent) 22%, transparent);
}
.gpu {
  margin: 0;
  padding: 6px 18px;
  color: #f0c78a;
  font-size: 12px;
}
h4 {
  margin: 16px 0 8px;
  font-size: 13px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
}
h4 small {
  opacity: 0.7;
}
.tiles {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(124px, 1fr));
  gap: 8px;
}
.large .tiles {
  grid-template-columns: repeat(auto-fill, minmax(168px, 1fr));
  gap: 10px;
}
.tile {
  display: grid;
  gap: 4px;
  padding: 6px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  color: #fff;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s, transform 0.15s, background 0.15s;
}
.tile:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.25);
}
.tile.on {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 16%, transparent);
  box-shadow: 0 0 0 1px var(--accent);
}
.window {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 9px;
  background: linear-gradient(110deg, #0a0812 30%, #1b1630 50%, #0a0812 70%);
  background-size: 200% 100%;
  animation: wait 1.4s linear infinite;
}
@keyframes wait {
  to {
    background-position: -200% 0;
  }
}
.tile b {
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.large .tile b {
  font-size: 13px;
}
.tile small {
  color: var(--muted);
  font-size: 11px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.special .dice {
  display: grid;
  place-items: center;
  aspect-ratio: 16 / 9;
  border-radius: 9px;
  background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 45%, #1a1528), color-mix(in srgb, var(--accent2) 35%, #1a1528));
}
</style>
