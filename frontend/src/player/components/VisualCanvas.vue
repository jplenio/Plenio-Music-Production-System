<script setup lang="ts">
/**
 * The visual in motion: picks the scene (visuals/chooser.ts), draws it every frame from the music
 * (engine.frame), and changes it with the song, the section, the interval or a drop - as the settings say -
 * softly: both play on while the new one fades, zooms or slides in, or comes with a flash on the beat, over
 * the time set (visuals/mixer.ts; owner's request 2026-10-18). ``mini`` draws the player bar's little square
 * (``miniScene``).
 *
 * Smooth (owner's request 2026-10-30): the governor (visuals/gpu.ts) takes pixels away while frames come late and
 * gives them back; a visual that still does not keep up - after one that did, so that a busy computer does not leave
 * out one visual after the other - is left out for the session and another one comes. Plenio Nova's visuals are timed
 * on this graphics card once, a little after the visual first shows.
 */
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'

import { mediaReady } from '../api'
import { songHue } from '../colors'
import { engine } from '../engine'
import { videosAtWork } from '../jobs'
import { lines } from '../now'
import { current, say, settings } from '../store'
import type { Frame } from '../visuals/analysis'
import { chooseVisual } from '../visuals/chooser'
import { dropOptions, dropRenderer } from '../visuals/drop/renderer'
import { myPresets } from '../visuals/drop'
import { tellRenderer } from '../visuals/drop/story'
import { governor, leaveOut, loadTimings, medianTiming, novaTimings, tierOf } from '../visuals/gpu'
import { cueAt, loadTrack, trackOf } from '../visuals/conductor'
import { finisher, finishes } from '../visuals/finish'
import { type Change, changeAt, changeDue, directorPlan } from '../visuals/director'
import { isPortable, portablePage } from '../portable'
import { type FadeStyle, SceneMixer } from '../visuals/mixer'
import { NOVA_VERSION, checkNova, novaOptions, novaScaleFor } from '../visuals/nova'
import { makeColors, miniScene, presetById, type Scene } from '../visuals/presets'

const props = defineProps<{ section?: string; playlistVisual?: string; mini?: boolean; force?: string }>()
const emit = defineEmits<{ change: [id: string] }>()

const canvas = ref<HTMLCanvasElement | null>(null)
const presetId = ref('')
/** The player bar's square draws on its own; the big visual through the mixer. */
let mini: Scene | null = null
const mixer = new SceneMixer((preset) => preset.create())
let raf = 0
let turn = 0
let lastSwitch = performance.now()
let quiet = 0
/** Whether the visual before this one played smoothly, and how long this one has so far. */
let smoothBefore = true
let smoothFor = 0
let checkAfter = 0

const hue = computed(() => (current.value ? songHue(current.value.id, current.value.genre) : 200))
/** The song's cover as a picture for the Drop visuals that draw it (owner's request 2026-10-18). */
const cover = shallowRef<HTMLImageElement | null>(null)
watch(
  () => current.value?.id,
  async () => {
    cover.value = null
    const song = current.value
    if (props.mini || !song?.has.cover) return
    const image = new Image()
    image.onload = () => {
      if (current.value?.id === song.id) cover.value = image
    }
    image.src = await mediaReady(song.id, 'cover')
  },
  { immediate: true }
)

/** Play a visual (``again``: the same one anew - a preset file saved while it plays): the change as the
 * visuals' settings say (a crossfade of so many seconds, a zoom, a slide, a flash on the beat, a cut). */
function use(id: string, again = false, fade?: { style: FadeStyle; seconds: number }): void {
  const preset = presetById(id) ?? presetById('bars')
  if (!preset || (preset.id === presetId.value && !again)) return
  smoothBefore = !presetId.value || smoothFor > 5
  smoothFor = 0
  governor.fresh()
  mixer.use(preset, fade ?? { style: settings.visuals.fade, seconds: settings.visuals.fadeSeconds }, again)
  presetId.value = preset.id
  lastSwitch = performance.now()
  if (!props.mini) emit('change', preset.id)
}

/** The visual by the rules (``newTurn``: the song's next change); ``asked``: N or *next* - another one now,
 * even where the song, the playlist or *fixed* keep one (the rules take over again at the next change). */
function pick(newTurn = false, asked = false): void {
  if (props.mini) {
    mini = mini ?? miniScene()
    return
  }
  if (props.force) return use(props.force)
  if (newTurn) turn += 1
  const v = settings.visuals
  // the Director: the change of the song's form in force now (its track not there or not sure: Match the music)
  const plan = directorFor()
  if (plan && !asked) {
    const now = changeAt(plan, engine.heard(settings.syncOffset / 1000))
    if (now) return use(now.preset, false, { style: 'cut', seconds: 0 })
  }
  use(
    chooseVisual({
      settings: asked ? { ...v, songs: {}, mode: v.mode === 'fixed' ? 'cycle' : v.mode } : v,
      song: current.value,
      playlist: asked ? '' : props.playlistVisual,
      previous: presetId.value || null,
      turn,
    })
  )
}

function resize(): void {
  const el = canvas.value
  if (!el) return
  // the classics draw every pixel of the canvas: fewer while frames come late (Drop and Nova draw at their own size)
  const gpu = mixer.preset?.kind === 'drop' || mixer.preset?.kind === 'nova'
  const ratio = Math.min(props.mini ? 2 : governor.tier.ratio, window.devicePixelRatio || 1) * (props.mini || gpu ? 1 : Math.max(0.6, Math.sqrt(governor.factor)))
  const w = Math.max(1, Math.floor(el.clientWidth * ratio))
  const h = Math.max(1, Math.floor(el.clientHeight * ratio))
  if (el.width !== w || el.height !== h) {
    el.width = w
    el.height = h
  }
}

let drawnAt = 0
/** The Director's plan for the song that plays (``null``: another mode, no track, or not sure enough). */
let directed: { id: string; plan: Change[] | null } | null = null
let heardBefore = 0
function directorFor(): Change[] | null {
  const song = current.value
  const known = trackOf.value
  if (props.mini || props.force || settings.visuals.mode !== 'director' || !song || !known?.analysis || known.id !== song.id) return null
  if (directed?.id !== song.id) {
    const v = settings.visuals
    const kinds: string[] = []
    directed = {
      id: song.id,
      plan: directorPlan(known.analysis, (key, _energy, taken) => {
        kinds.push(key)
        // as Match the music would choose, a turn for each kind of section, never a visual another kind has
        for (let k = 0; k < 24; k++) {
          const id = chooseVisual({ settings: { ...v, mode: 'auto', songs: {} }, song, turn: kinds.length - 1 + k * 7 })
          if (!taken.has(id)) return id
        }
        return chooseVisual({ settings: { ...v, mode: 'auto', songs: {} }, song, turn: kinds.length })
      }, settings.visuals.fadeSeconds),
    }
  }
  return directed.plan
}
/** The frame with the cue of the song's track at the heard time (phase 7.5): the visuals may read it. */
function withCue(frame: Frame): Frame {
  const song = current.value
  const known = trackOf.value
  if (!song || !known || known.id !== song.id || !known.analysis) return frame
  return { ...frame, cue: cueAt(known.analysis, engine.heard(settings.syncOffset / 1000)) }
}
async function fetchTrack(id: string): Promise<unknown> {
  if (isPortable) return (await portablePage(id))?.analysis ?? null
  const answer = await fetch(`/api/analysis/${encodeURIComponent(id)}`)
  return answer.ok ? answer.json() : null
}
function loop(now: number = performance.now()): void {
  raf = requestAnimationFrame(loop)
  const el = canvas.value
  if (!el || (props.mini ? !mini : !mixer.preset)) return
  // the tier's frame cap (a phone draws 30 a second: the music needs no more, the battery thanks it)
  const cap = props.mini ? 0 : governor.tier.fps
  if (cap && now - drawnAt < 1000 / cap - 2) return
  drawnAt = now
  resize()
  const ctx = el.getContext('2d')
  if (!ctx) return
  engine.sensitivity = settings.visuals.sensitivity
  dropOptions.scale = settings.visuals.dropScale * Math.sqrt(governor.factor)
  novaOptions.scale = novaScaleFor(settings.visuals.dropScale)
  const frame = withCue(engine.frame())
  // the Director's changes, each started so that it is half through on its section's downbeat
  const plan = directorFor()
  const heardNow = engine.heard(settings.syncOffset / 1000)
  if (plan) {
    const due = changeDue(plan, heardBefore, heardNow)
    if (due) use(due.preset, false, { style: due.style, seconds: due.seconds })
  }
  heardBefore = heardNow
  const colors = makeColors(hue.value, props.mini ? 'song' : settings.visuals.scheme, frame.time)
  if (props.mini && mini) {
    ctx.save()
    mini.draw(ctx, frame, el.width, el.height, colors)
    ctx.restore()
    return
  }
  // a change of Drop preset glides as long as the crossfade
  const renderer = mixer.preset?.kind === 'drop' ? dropRenderer() : null
  if (renderer) {
    renderer.blendSeconds = settings.visuals.fade === 'cut' ? 0.05 : settings.visuals.fadeSeconds
    // the song for the pictures some presets draw: its cover, its title, the line and word sung
    const song = current.value
    tellRenderer(renderer, song ? { id: song.id, title: song.title, cover: cover.value, lines: lines.value } : null, engine.heard(settings.syncOffset / 1000))
  }
  mixer.draw(ctx, frame, el.width, el.height, colors)
  // one light (finish.ts): the finishing of Nova over every visual, Nova's own scenes already have it
  if (!props.mini && finishes(settings.visuals.finish, mixer.preset?.kind, mixer.changing)) {
    const done = finisher()?.finish(el, el.width, el.height)
    if (done) ctx.drawImage(done, 0, 0, el.width, el.height)
  }
  keepSmooth(frame, colors.palette())
  if (props.force) return
  // the switches during a song: every N seconds, or when the music drops in after a quiet passage
  const v = settings.visuals
  const since = (performance.now() - lastSwitch) / 1000
  if (v.switchOn === 'interval' && frame.playing && since > Math.max(5, v.interval)) pick(true)
  if (v.switchOn === 'drop' && frame.playing) {
    quiet = frame.level < 0.12 ? quiet + frame.dt : Math.max(0, quiet - frame.dt * 0.5)
    if (quiet > 1.5 && frame.bass > 0.45 && frame.beat && since > 6) {
      quiet = 0
      pick(true)
    }
  }
}

/** Smooth or not: frames that come late take pixels away (the governor); a visual that does not keep up even so is
 * left out for this session and another one comes - unless the one before did not keep up either (then the computer
 * is busy, not the visual too heavy). The first time the visual shows, Plenio Nova's visuals are timed here. */
function keepSmooth(frame: Frame, palette: Uint8ClampedArray): void {
  if (document.hidden || videosAtWork.value) return
  if (!checkAfter) checkAfter = performance.now() + 2500
  else if (checkAfter > 0 && performance.now() > checkAfter) {
    checkAfter = -1
    checkNova(palette)
  }
  if (!frame.playing) return
  governor.note(frame.dt)
  if (!governor.struggling) smoothFor += frame.dt
  if (governor.struggling > 4 && smoothBefore && !mixer.changing && presetId.value && !props.force) {
    const name = presetById(presetId.value)?.name ?? 'This visual'
    leaveOut(presetId.value)
    say(`${name} does not play smoothly on this computer - another visual instead (Visuals: Try again).`, 6000)
    pick(true)
  }
}

watch(() => current.value?.id, (id) => {
  turn = 0
  pick()
  if (id && !props.mini) void loadTrack(id, fetchTrack).then(() => settings.visuals.mode === 'director' && pick())
}, { immediate: true })
watch(() => props.section, (now, before) => {
  if (now && before && now !== before && settings.visuals.switchOn === 'section') pick(true)
})
watch(() => [settings.visuals.mode, settings.visuals.fixed, props.playlistVisual, props.force, current.value ? settings.visuals.songs[current.value.id] : ''], () => pick())

// one of the listener's presets edited and saved while it plays: it changes on screen
watch(myPresets, () => {
  if (presetId.value.startsWith('my-')) use(presetId.value, true)
})

onMounted(() => {
  // the timings of Plenio Nova's visuals kept for this graphics card: which ones play smoothly here
  loadTimings(NOVA_VERSION)
  governor.use(tierOf(medianTiming(novaTimings.value), { touch: matchMedia?.('(pointer: coarse)').matches ?? false, width: window.innerWidth }))
  pick()
  raf = requestAnimationFrame(loop)
})
onBeforeUnmount(() => cancelAnimationFrame(raf))

// show: a visual chosen in the panel, now (the rules take over again at the next change)
defineExpose({ presetId, next: () => pick(true, true), show: (id: string) => use(id) })
</script>

<template>
  <canvas ref="canvas" class="visual-canvas" />
</template>

<style scoped>
.visual-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
