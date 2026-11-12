/**
 * Plenio Nova as visuals: one for every scene (space.ts, worlds.ts, matter.ts), drawn by the player's own renderer -
 * or, in a video and in the previews, by the renderer they pass. The live picture gets as many pixels as the visual's
 * timing on this graphics card allows (gpu.ts); every visual is timed once in the background, which also compiles it
 * ahead, so that it starts at once when it comes.
 */
import { NOVA_FLOOR, NOVA_FRAME_MS, gpuSupport, keepTiming, loadTimings, novaPixels, novaTimings } from '../gpu'
import type { Preset, Scene, SceneOptions } from '../presets'
import { MATTER } from './matter'
import { MAX_SUPERSAMPLE, NovaMusic, NovaRenderer, type NovaDef } from './renderer'
import { SPACE } from './space'
import { WORLDS } from './worlds'

export const NOVA: NovaDef[] = [...SPACE, ...WORLDS, ...MATTER]

/** Changes whenever a visual does: their timings are taken again. */
export const NOVA_VERSION = String(NOVA.reduce((h, def) => (h * 31 + [...def.image, ...(def.state?.code ?? '')].reduce((a, c) => (a * 33 + c.charCodeAt(0)) | 0, 7)) | 0, 17))

/** How the live picture is drawn: ``scale`` is its size against the screen's, each way, at most (novaScaleFor). */
export const novaOptions = { scale: 1 }

/** The live picture's size for the visuals' quality setting (0.5, 0.75, 1): *Fast* half the screen's each way,
 * *Balanced* the screen's own, *Sharp* finer still and scaled down (smoother edges) - always within what this card
 * draws smoothly (gpu.ts). */
export function novaScaleFor(quality: number): number {
  if (quality <= 0.5) return 0.5
  return quality < 1 ? 1 : MAX_SUPERSAMPLE
}

/** A video's picture at most (4K is drawn larger from it). */
const VIDEO_PIXELS = 2560 * 1440

let shared: NovaRenderer | null | undefined
/** The renderer every live Nova visual shares (``null``: this browser cannot draw them). */
export function novaRenderer(): NovaRenderer | null {
  if (shared?.lost) shared = undefined
  if (shared === undefined) {
    try {
      shared = gpuSupport().webgl ? new NovaRenderer(true) : null
    } catch (error) {
      console.warn('Plenio Nova:', error)
      shared = null
    }
  }
  return shared
}

function asVisual(def: NovaDef): Preset {
  return {
    id: def.id,
    name: `Nova · ${def.name}`,
    blurb: def.blurb,
    suits: def.suits,
    kind: 'nova',
    create(options?: SceneOptions): Scene {
      const music = new NovaMusic()
      const slot = {}
      return {
        draw(ctx, frame, width, height, colors) {
          const own = options?.nova
          const renderer = own ? own.renderer() : novaRenderer()
          music.update(frame, def.speed)
          const screen = width * height
          const pixels = own ? Math.min(VIDEO_PIXELS, screen * own.scale * own.scale) : novaPixels(def.id, screen * novaOptions.scale * novaOptions.scale)
          const picture = renderer?.render(def, music, colors.palette(), width, height, slot, pixels) ?? null
          if (!picture) {
            ctx.fillStyle = '#05040a'
            ctx.fillRect(0, 0, width, height)
            return
          }
          // scaled up or down with the browser's best filter (a picture drawn finer than the screen is smoothed so)
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          ctx.drawImage(picture.canvas, 0, picture.canvas.height - picture.height, picture.width, picture.height, 0, 0, width, height)
        },
      }
    },
  }
}

export const NOVA_PRESETS: Preset[] = NOVA.map(asVisual)

// --- timing them here ----------------------------------------------------------------------------------------------

let checking = false
/** The visuals timed again in this session (once each). */
const retimed = new Set<string>()

/** Whether the Nova visuals are being timed on this graphics card now (the settings say so). */
export function novaChecking(): boolean {
  return checking
}

/** The Nova visuals to time now: those not timed yet on this card - and, once a session, those timed too heavy here
 * (a card busy with something else then, a song being made on it, made one look slower than it is). */
export function toTime(defs: NovaDef[], timings: Record<string, number>, again: ReadonlySet<string>): NovaDef[] {
  const heavy = (ns: number) => ns > 0 && (ns * NOVA_FLOOR) / 1e6 > NOVA_FRAME_MS
  return defs.filter((def) => timings[def.id] === undefined || (heavy(timings[def.id]) && !again.has(def.id)))
}

/**
 * Time every Nova visual not timed yet on this graphics card, one at a time between the page's own work (each a few
 * frames at 640 x 360 - which also compiles it ahead), and the ones that were too heavy here once more; a visual keeps
 * its faster timing. ``palette``: the colours to draw them with. Starts once; does nothing where the graphics cannot
 * draw them.
 */
export function checkNova(palette: Uint8ClampedArray): void {
  if (checking || !gpuSupport().webgl) return
  loadTimings(NOVA_VERSION)
  const waiting = toTime(NOVA, novaTimings.value, retimed)
  if (!waiting.length) return
  checking = true
  const renderer = novaRenderer()
  if (!renderer) {
    checking = false
    return
  }
  // compiling starts for all of them at once (in the background where the browser can), the timing one by one
  for (const def of waiting) renderer.prepare(def)
  const next = (): void => {
    const def = waiting[0]
    if (!def || renderer.lost) {
      checking = false
      return
    }
    const ns = renderer.measure(def, palette)
    if (ns !== null) {
      const before = novaTimings.value[def.id]
      keepTiming(def.id, before !== undefined && before > 0 && ns > 0 ? Math.min(before, ns) : ns)
      retimed.add(def.id)
      waiting.shift()
    }
    setTimeout(next, ns === null ? 120 : 30)
  }
  setTimeout(next, 30)
}
