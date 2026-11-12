/**
 * A poster of every visual (phase 7.8): a still drawn from a fixed piece of made-up music, for the gallery where a
 * visual cannot play live (a phone, a Nova scene not timed yet), and for the docs and the films. ``tools/
 * visual_posters.mjs`` opens the player at ``#/posters``, which calls ``renderPosters`` and gathers the stills into
 * a sprite sheet (``posters.jpg`` and ``posters.json`` beside the page). The player reads the sheet with
 * ``posterOf``.
 */
import { shallowRef } from 'vue'

import type { Frame } from './analysis'
import { PRESETS, makeColors } from './presets'

export const POSTER = { width: 192, height: 108 }

/** Frame ``k`` of the fixed music: a kick every half second, a melody in the mids, hiss in the highs. */
export function posterFrame(k: number): Frame {
  const t = k / 60
  const beatAt = t % 0.5
  const kick = Math.exp(-beatAt / 0.08)
  const bins = 1024
  const freq = new Uint8Array(bins)
  for (let i = 0; i < bins; i++) {
    const x = i / bins
    const shape = x < 0.02 ? 0.95 * kick + 0.2 : x < 0.2 ? 0.55 + 0.25 * Math.sin(t * 3 + i * 0.05) : 0.25 * (1 - x) + 0.08 * Math.sin(i * 0.7 + t * 9)
    freq[i] = Math.max(0, Math.min(255, Math.round(255 * shape)))
  }
  const wave = new Uint8Array(2048)
  for (let i = 0; i < wave.length; i++) wave[i] = 128 + Math.round(90 * Math.sin(i * 0.04 + t * 6) * (0.4 + 0.6 * kick))
  return {
    freq, wave, left: wave, right: wave,
    bass: 0.3 + 0.6 * kick, mid: 0.5 + 0.2 * Math.sin(t * 3), treble: 0.35, level: 0.55 + 0.3 * kick,
    beat: beatAt < 1 / 60, pulse: kick, time: t, dt: 1 / 60, playing: true,
  } // prettier-ignore
}

/** Each visual drawn for ``frames`` frames of the fixed music, its last one as a JPEG data URL. */
export async function renderPosters(frames = 150, ids: string[] = PRESETS.map((p) => p.id)): Promise<{ id: string; image: string }[]> {
  const out: { id: string; image: string }[] = []
  for (const id of ids) {
    const preset = PRESETS.find((p) => p.id === id)
    if (!preset) continue
    const canvas = document.createElement('canvas')
    canvas.width = POSTER.width * 2
    canvas.height = POSTER.height * 2
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    try {
      const scene = preset.create()
      // a Nova scene compiles in the background and a Drop preset may wait for its pictures: drawn on, a frame at a
      // time, until it shows something (at most about fifteen seconds)
      const waits = preset.kind === 'nova' || preset.kind === 'drop'
      let shown = -1
      for (let k = 0; k < frames * 6; k++) {
        const frame = posterFrame(k)
        scene.draw(ctx, frame, canvas.width, canvas.height, makeColors(270, 'song', frame.time))
        if (waits) {
          await new Promise((r) => setTimeout(r, 16))
          if (shown < 0 && k % 10 === 9 && !blank(ctx, canvas.width, canvas.height)) shown = k
          if (shown >= 0 && k - shown >= frames / 2) break
        } else {
          if (k % 30 === 29) await new Promise((r) => setTimeout(r, 0))
          if (k >= frames - 1) break
        }
      }
    } catch {
      ctx.fillStyle = '#05040a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    const small = document.createElement('canvas')
    small.width = POSTER.width
    small.height = POSTER.height
    const s = small.getContext('2d') as CanvasRenderingContext2D
    s.imageSmoothingQuality = 'high'
    s.drawImage(canvas, 0, 0, POSTER.width, POSTER.height)
    out.push({ id, image: small.toDataURL('image/jpeg', 0.82) })
  }
  return out
}

/** Whether a picture is (nearly) black all over (a scene still compiling). */
function blank(ctx: CanvasRenderingContext2D, w: number, h: number): boolean {
  const data = ctx.getImageData(0, 0, w, h).data
  let lit = 0
  for (let i = 0; i < data.length; i += 4 * 37) if (data[i] + data[i + 1] + data[i + 2] > 60) lit += 1
  return lit < 3
}

interface Sheet {
  width: number
  height: number
  columns: number
  ids: string[]
}

export const posterSheet = shallowRef<Sheet | null>(null)

/** The sheet's map, read once (``null``: a player built without posters). */
export async function loadPosters(base = './'): Promise<void> {
  if (posterSheet.value) return
  try {
    const answer = await fetch(`${base}posters.json`)
    if (answer.ok) posterSheet.value = (await answer.json()) as Sheet
  } catch {
    posterSheet.value = null
  }
}

/** CSS for a visual's poster from the sheet (``null``: none). */
export function posterOf(id: string, sheet: Sheet | null = posterSheet.value, base = './'): Record<string, string> | null {
  const at = sheet ? sheet.ids.indexOf(id) : -1
  if (!sheet || at < 0) return null
  const x = (at % sheet.columns) * sheet.width
  const y = Math.floor(at / sheet.columns) * sheet.height
  return {
    backgroundImage: `url(${base}posters.jpg)`,
    backgroundPosition: `-${x}px -${y}px`,
    width: `${sheet.width}px`,
    height: `${sheet.height}px`,
  }
}
