/**
 * Little moving previews of the visuals with the song's own music (owner's request 2026-10-25: every visual in a
 * small window, playing to the piece the video is made of). A preview is drawn ahead, offline, from the decoded
 * song - a second of warming up (trails, feedback), then a short loop - into one strip of small frames, which a
 * tile then plays cheaply. One preview is drawn at a time, between the page's own work (it yields after every few
 * frames); the ones the listener sees are drawn first. The last ones are kept.
 */
import type { SongDetail, SongSummary } from '../api'
import { songHue } from '../colors'
import { linesFor } from '../lyricsVersion'
import { settings } from '../store'
import { DropRenderer } from '../visuals/drop/renderer'
import { gpuSupport } from '../visuals/gpu'
import { NovaRenderer } from '../visuals/nova/renderer'
import { tellRenderer } from '../visuals/drop/story'
import { makeColors, presetById, type Scheme } from '../visuals/presets'
import { nextTask, type Sound } from './make'
import { OfflineAnalysis } from './offline'

export const PREVIEW_FPS = 10
export const PREVIEW_FRAMES = 14
const WARM_UP_S = 1.2
const KEPT = 110

export interface Preview {
  /** The frames side by side: frame ``k`` at ``k * width``. */
  strip: HTMLCanvasElement
  width: number
  height: number
  frames: number
}

interface Wanted {
  key: string
  id: string
  at: number
  frames: number
  priority: number
  resolve: (preview: Preview | null) => void
  promises: ((preview: Preview | null) => void)[]
}

/** The previews of one song, at one size (the video's shape). */
export class PreviewMaker {
  private readonly kept = new Map<string, Preview>()
  private readonly queue: Wanted[] = []
  private running = false
  private stopped = false
  private drop: DropRenderer | null | undefined
  private nova: NovaRenderer | null | undefined
  private readonly hue: number
  readonly width: number
  readonly height: number

  constructor(
    private readonly song: SongSummary,
    private readonly detail: SongDetail,
    private readonly sound: Sound,
    aspect: number,
    private readonly scheme: Scheme = 'song',
    private readonly cover: HTMLImageElement | null = null,
    private readonly sensitivity = settings.visuals.sensitivity
  ) {
    this.hue = songHue(song.id, song.genre)
    // 128 x 72 for 16:9; an upright video gets upright previews
    const side = 128
    this.width = aspect >= 1 ? side : Math.max(40, Math.round(side * aspect * 0.75))
    this.height = aspect >= 1 ? Math.max(40, Math.round(side / aspect)) : Math.round(side * 0.75)
  }

  private renderer(): DropRenderer | null {
    if (this.stopped) return null
    // a context the graphics card took back is made anew
    if (this.drop?.lost) this.drop = undefined
    if (this.drop === undefined) {
      try {
        this.drop = new DropRenderer()
        this.drop.blendSeconds = 0.05
      } catch {
        this.drop = null
      }
    }
    return this.drop
  }

  private novaRenderer(): NovaRenderer | null {
    if (this.stopped) return null
    if (this.nova?.lost) this.nova = undefined
    if (this.nova === undefined) {
      try {
        this.nova = gpuSupport().webgl ? new NovaRenderer() : null
      } catch {
        this.nova = null
      }
    }
    return this.nova
  }

  /** A preview drawn already (``null``: not yet). */
  ready(id: string, at: number, frames = PREVIEW_FRAMES): Preview | null {
    return this.kept.get(keyOf(id, at, frames)) ?? null
  }

  /** The preview of visual ``id`` at song time ``at`` (``frames``: 1 for a still); ``priority``: lower first. */
  get(id: string, at: number, frames = PREVIEW_FRAMES, priority = 0): Promise<Preview | null> {
    const key = keyOf(id, at, frames)
    const found = this.kept.get(key)
    if (found) {
      // used again: kept longer
      this.kept.delete(key)
      this.kept.set(key, found)
      return Promise.resolve(found)
    }
    return new Promise((resolve) => {
      const waiting = this.queue.find((w) => w.key === key)
      if (waiting) {
        waiting.priority = Math.min(waiting.priority, priority)
        waiting.promises.push(resolve)
        return
      }
      this.queue.push({ key, id, at, frames, priority, resolve, promises: [] })
      void this.work()
    })
  }

  /** Previews asked for but not drawn yet are not needed any more (the gallery closed). */
  forget(): void {
    for (const wanted of this.queue.splice(0)) for (const done of [wanted.resolve, ...wanted.promises]) done(null)
  }

  /** No more previews (the dialog closed, or another size or colour wants new ones): the strips and the Drop and
   * Nova renderers' graphics memory go back at once (owner's report 2026-10-28: "out of memory" now and then). */
  stop(): void {
    this.stopped = true
    this.forget()
    for (const preview of this.kept.values()) preview.strip.width = preview.strip.height = 0
    this.kept.clear()
    this.drop?.dispose()
    this.drop = null
    this.nova?.dispose()
    this.nova = null
  }

  private async work(): Promise<void> {
    if (this.running) return
    this.running = true
    try {
      while (this.queue.length && !this.stopped) {
        this.queue.sort((a, b) => a.priority - b.priority)
        const wanted = this.queue.shift() as Wanted
        let made: Preview | null = null
        try {
          made = await this.draw(wanted.id, wanted.at, wanted.frames)
        } catch {
          made = null
        }
        if (made) {
          this.kept.set(wanted.key, made)
          while (this.kept.size > KEPT) this.kept.delete(this.kept.keys().next().value as string)
        }
        for (const done of [wanted.resolve, ...wanted.promises]) done(made)
      }
    } finally {
      this.running = false
    }
  }

  private async draw(id: string, at: number, frames: number): Promise<Preview | null> {
    const preset = presetById(id)
    if (!preset) return null
    const { width, height } = this
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    const strip = document.createElement('canvas')
    strip.width = width * frames
    strip.height = height
    const out = strip.getContext('2d') as CanvasRenderingContext2D
    const renderer = preset.kind === 'drop' ? this.renderer() : null
    const nova = preset.kind === 'nova' ? this.novaRenderer() : null
    const scene = preset.create({ drop: { renderer: () => renderer, scale: 1 }, nova: { renderer: () => nova, scale: 1 } })
    const analysis = new OfflineAnalysis(this.sound, PREVIEW_FPS, this.sensitivity)
    const warm = Math.round(WARM_UP_S * PREVIEW_FPS)
    const start = Math.max(0, Math.min(this.sound.duration - 0.5, at) - WARM_UP_S)
    const lines = linesFor(this.detail, 'written')
    for (let k = 0; k < warm + frames; k++) {
      const elapsed = k / PREVIEW_FPS
      const t = start + elapsed
      const frame = analysis.frame(t, 1 / PREVIEW_FPS, elapsed)
      if (renderer) tellRenderer(renderer, { id: this.song.id, title: this.song.title, cover: this.cover, lines }, t)
      ctx.fillStyle = '#05040a'
      ctx.fillRect(0, 0, width, height)
      ctx.save()
      scene.draw(ctx, frame, width, height, makeColors(this.hue, this.scheme, elapsed))
      ctx.restore()
      if (k >= warm) out.drawImage(canvas, (k - warm) * width, 0)
      if (k % 6 === 5) await nextTask()
      if (this.stopped) return null
    }
    return { strip, width, height, frames }
  }
}

function keyOf(id: string, at: number, frames: number): string {
  return `${id}@${Math.round(at * 2) / 2}/${frames}`
}

/** Draw frame ``k`` of a preview (going round) into a tile's canvas. */
export function showFrame(target: HTMLCanvasElement, preview: Preview, k: number): void {
  const ctx = target.getContext('2d')
  if (!ctx) return
  if (target.width !== preview.width || target.height !== preview.height) {
    target.width = preview.width
    target.height = preview.height
  }
  const frame = ((k % preview.frames) + preview.frames) % preview.frames
  ctx.drawImage(preview.strip, frame * preview.width, 0, preview.width, preview.height, 0, 0, preview.width, preview.height)
}
