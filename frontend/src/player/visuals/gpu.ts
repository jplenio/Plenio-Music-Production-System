/**
 * What this device's graphics can do for the visuals (owner's request 2026-10-30: no WebGL visual offered where it
 * cannot be drawn, and none chosen that would not play smoothly).
 *
 * - **Can it draw at all**: Plenio Drop and Plenio Nova need WebGL2 drawn by the graphics card. A browser without it,
 *   or one that draws it with the processor (a software stand-in, far too slow), gets neither of them offered; Nova
 *   also needs pictures in half floats (its light above white).
 * - **Is it smooth here**: every Nova visual is timed once on this graphics card, in the background, and the timings
 *   are kept for that card in this browser (nanoseconds per pixel). One that needs more than its share of a frame
 *   even at the smallest picture allowed is not offered here; the others get as many pixels as keep them within it.
 * - **While it plays**: the governor takes pixels away while frames come late (the card busy with something else, a
 *   heavy moment) and gives them back; a visual that still does not keep up is left out for the rest of the session
 *   (VisualCanvas.vue).
 */
import { shallowRef } from 'vue'

import type { Preset } from './presets'

export interface GpuSupport {
  /** WebGL2 drawn by the graphics card: Plenio Drop's visuals can play. */
  webgl: boolean
  /** ... and pictures in half floats: Plenio Nova's can. */
  float: boolean
  /** Why not, said in the settings (``''``: they can). */
  why: string
  /** The graphics card as the browser names it: the timings are kept for it. */
  card: string
}

/** What a visual draws its light into (phase 7.1): half floats where the card renders them - ``EXT_color_buffer_float``
 * on a desktop, ``EXT_color_buffer_half_float`` on many phones - else bytes, with the light stored as its square
 * root and dithered, so that glow above white and dark gradients survive eight bits. */
export type DrawFormat = 'half' | 'bytes'

export function drawFormat(gl: Pick<WebGL2RenderingContext, 'getExtension'>): DrawFormat {
  return gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float') ? 'half' : 'bytes'
}

const SOFTWARE = /swiftshader|llvmpipe|softpipe|basic render|software|mesa offscreen/i
const NONE: GpuSupport = { webgl: false, float: false, why: 'This browser has no WebGL2.', card: '' }
let probed: GpuSupport | null = null

function cardOf(gl: WebGL2RenderingContext): string {
  const named = String(gl.getParameter(gl.RENDERER) ?? '')
  if (named && !/^webkit/i.test(named)) return named
  const info = gl.getExtension('WEBGL_debug_renderer_info')
  return String((info && gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) || named)
}

/** What this browser's graphics can do - found out once, with a WebGL2 context made and let go at once. */
export function gpuSupport(): GpuSupport {
  if (probed) return probed
  probed = NONE
  if (typeof document === 'undefined') return probed
  try {
    const gl = document.createElement('canvas').getContext('webgl2', { failIfMajorPerformanceCaveat: true })
    if (!gl) {
      const slow = document.createElement('canvas').getContext('webgl2')
      if (slow) {
        probed = { ...NONE, why: 'This browser draws WebGL with the processor, not the graphics card - too slow to play smoothly.', card: cardOf(slow) }
        slow.getExtension('WEBGL_lose_context')?.loseContext()
      }
      return probed
    }
    const card = cardOf(gl)
    probed = SOFTWARE.test(card)
      ? { ...NONE, why: 'This browser draws WebGL with the processor, not the graphics card - too slow to play smoothly.', card }
      : { webgl: true, float: drawFormat(gl) === 'half', why: '', card }
    gl.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    probed = NONE
  }
  return probed
}

/** For the tests: as if the graphics could do this (``null``: find out again). */
export function setGpuSupport(support: GpuSupport | null): void {
  probed = support
}

// --- how long each Nova visual takes here ---------------------------------------------------------------------------

/** The smallest live picture a Nova visual is given (below it, it looks blurred), and its share of a frame: one that
 * needs more than that even this small is not offered here. */
export const NOVA_FLOOR = 640 * 360
export const NOVA_FRAME_MS = 7
/** The time a live Nova picture may take on the card while it plays: its pixels are as many as fit (the governor
 * takes some away when frames come late all the same). */
export const NOVA_DRAW_MS = 10
/** The most a live Nova picture gets, however fast the card (the screen hardly shows more). */
const NOVA_CEILING = 2560 * 1440

const KEY = 'plenio.nova.timings'

/** Nanoseconds per pixel of each Nova visual on this graphics card (-1: it does not compile here). */
export const novaTimings = shallowRef<Record<string, number>>({})
let timingsOf = ''

/** The timings kept for this card and these visuals (``version`` changes when a visual does). */
export function loadTimings(version: string): void {
  const of = `${gpuSupport().card}|${version}`
  if (timingsOf === of) return
  timingsOf = of
  let kept: Record<string, number> = {}
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null') as { of?: string; timings?: Record<string, number> } | null
    if (saved?.of === of && saved.timings && typeof saved.timings === 'object') kept = saved.timings
  } catch {
    kept = {}
  }
  novaTimings.value = kept
}

export function keepTiming(id: string, nanoseconds: number): void {
  novaTimings.value = { ...novaTimings.value, [id]: nanoseconds }
  try {
    localStorage.setItem(KEY, JSON.stringify({ of: timingsOf, timings: novaTimings.value }))
  } catch {
    // a browser that keeps nothing measures again next time
  }
}

/** Whether a Nova visual plays smoothly here (``null``: not timed yet). */
export function novaSmooth(id: string): boolean | null {
  const ns = novaTimings.value[id]
  if (ns === undefined) return null
  return ns > 0 && (ns * NOVA_FLOOR) / 1e6 <= NOVA_FRAME_MS
}

/** How many pixels the live picture of Nova visual ``id`` gets when it may have ``screen`` at most (the screen's, or
 * more where it is drawn finer than the screen): as many as stay within its time - fewer while the governor says
 * frames come late. */
export function novaPixels(id: string, screen: number): number {
  const ns = novaTimings.value[id]
  const affordable = ns && ns > 0 ? (NOVA_DRAW_MS * 1e6) / ns : NOVA_FLOOR
  return Math.max(NOVA_FLOOR * 0.6, Math.min(screen, NOVA_CEILING, affordable) * governor.factor)
}

// --- while it plays ---------------------------------------------------------------------------------------------------

/** How hard a device is asked (phase 7.2): its Nova quality to start with, the most frames a second the live visual
 * draws (0: as the screen comes) and the most device pixels per CSS pixel. */
export interface Tier {
  id: 'A' | 'B' | 'C'
  quality: number
  fps: number
  ratio: number
}

export const QUALITY_LOW = 0.5
export const TIERS: Record<Tier['id'], Tier> = {
  A: { id: 'A', quality: 1, fps: 0, ratio: 1.5 },
  B: { id: 'B', quality: 0.8, fps: 60, ratio: 1.25 },
  C: { id: 'C', quality: 0.6, fps: 30, ratio: 1 },
}

/**
 * Keeps the live visual smooth: ``factor`` (0.35 .. 1) of the pixels a visual may have comes down while frames come
 * late, and goes back up when they come in time again. Late is measured against the screen's own pace lately (the best
 * the frames came), so a 144 Hz screen is not held to 60 Hz and a 60 Hz one is not late. ``struggling``: seconds that
 * frames have come late with the fewest pixels already - the visual is too much for this device.
 */
export class Governor {
  factor = 1
  /** Nova's quality (march steps, octaves), 0.5 .. 1: it gives way first, the pixels after it (phase 7.2). */
  quality = 1
  struggling = 0
  /** The tier this device plays in: where quality starts and the caps of frames and pixel ratio. */
  tier: Tier = TIERS.A
  private ema = 16.7
  private best = 16.7
  private wait = 0

  note(dt: number): void {
    const ms = Math.min(100, Math.max(1, dt * 1000))
    this.ema += (ms - this.ema) * 0.08
    // the screen's pace: the best lately, slowly forgotten
    this.best = Math.min(this.best + dt * 0.4, Math.max(4, this.ema))
    const late = this.ema > Math.max(22, this.best * 1.45)
    this.wait -= dt
    if (this.wait <= 0) {
      const easy = !late && this.ema < this.best * 1.2 + 1
      if (late && this.quality > QUALITY_LOW) {
        // fewer march steps first: the picture keeps its sharpness
        this.quality = Math.max(QUALITY_LOW, this.quality - 0.1)
        this.wait = 0.5
      } else if (late && this.factor > 0.35) {
        this.factor = Math.max(0.35, this.factor * 0.8)
        this.wait = 0.6
      } else if (easy && this.factor < 1) {
        // back in the other order: the pixels first, then the steps
        this.factor = Math.min(1, this.factor * 1.15)
        this.wait = 1
      } else if (easy && this.quality < this.tier.quality) {
        this.quality = Math.min(this.tier.quality, this.quality + 0.05)
        this.wait = 1
      }
    }
    this.struggling = late && this.factor <= 0.36 && this.ema > 28 ? this.struggling + dt : 0
  }

  /** A new visual: it starts with all its pixels again. */
  fresh(): void {
    this.factor = 1
    this.quality = this.tier.quality
    this.struggling = 0
    this.wait = 1
  }

  /** The device's tier (``tierOf``): quality starts there. */
  use(tier: Tier): void {
    this.tier = tier
    this.quality = Math.min(this.quality, tier.quality)
  }
}

export const governor = new Governor()

/** The tier by what a device is: a phone or tablet (touch, a small screen) is C; a computer whose Nova visuals take
 * more than half their share of a frame at the smallest picture (``ns`` per pixel, the median timed) is B; else A. */
export function tierOf(ns: number | null, device: { touch: boolean; width: number }): Tier {
  if (device.touch && device.width < 1100) return TIERS.C
  if (ns !== null && ns > 0 && (ns * NOVA_FLOOR) / 1e6 > NOVA_FRAME_MS / 2) return TIERS.B
  return TIERS.A
}

/** The median of the Nova timings here (``null``: none yet). */
export function medianTiming(timings: Record<string, number>): number | null {
  const found = Object.values(timings).filter((ns) => ns > 0).sort((x, y) => x - y)
  return found.length ? found[Math.floor(found.length / 2)] : null
}

/** Visuals that did not keep up here in this session (left out until the player is opened again, or *Try again*). */
export const leftOut = shallowRef<ReadonlySet<string>>(new Set())

export function leaveOut(id: string): void {
  leftOut.value = new Set([...leftOut.value, id])
}

export function takeBackLeftOut(): void {
  leftOut.value = new Set()
}

// --- what is offered ---------------------------------------------------------------------------------------------------

/** Whether a visual is offered for the live picture here: Drop and Nova only where the graphics can draw them, a Nova
 * one only once timed smooth here, none that did not keep up in this session. */
export function offered(preset: Preset): boolean {
  if (leftOut.value.has(preset.id)) return false
  if (preset.kind === 'drop') return gpuSupport().webgl
  if (preset.kind === 'nova') return gpuSupport().webgl && novaSmooth(preset.id) === true
  return true
}

/** Whether a visual is offered for a video: drawn ahead of time, so smoothness does not matter - only that the graphics
 * can draw it at all. */
export function offeredForVideo(preset: Preset): boolean {
  if (preset.kind === 'drop') return gpuSupport().webgl
  if (preset.kind === 'nova') return gpuSupport().webgl && novaTimings.value[preset.id] !== -1
  return true
}
