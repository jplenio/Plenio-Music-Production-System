/**
 * The visuals: Winamp's classics (the spectrum bars with falling caps, the oscilloscope, the stereo
 * vectorscope, AVS fire) and MilkDrop-like feedback scenes (tunnel, kaleidoscope), plus a few of Plenio's
 * own. Each draws one frame on a 2D canvas from the music's ``Frame``; the scene keeps what it needs
 * between frames (caps, particles, the feedback buffer). Then Plenio Drop (drop/): MilkDrop-style visuals on
 * WebGL2, its built-in presets and the listener's own; and Plenio Nova (nova/): scenes the graphics card works out
 * for every pixel - offered only where it can draw them, and smoothly (gpu.ts).
 */
import type { Frame } from './analysis'
import { MORE_CLASSIC } from './classics'
import { buffer, fade, logBins, pixels } from './draw'
import { DROP_PRESETS, myPresets } from './drop'
import type { PresetFile } from './drop/format'
import { NOVA_PRESETS } from './nova'

export type Scheme = 'song' | 'winamp' | 'neon' | 'mono' | 'sunset'

export interface Colors {
  hue: number
  scheme: Scheme
  time: number
  /** A colour along the scheme (0 low/quiet .. 1 high/loud). */
  at(t: number, alpha?: number): string
  /** 256 colours along the scheme as RGB (for the pixel scenes). */
  lut(): Uint8ClampedArray
  /** 256 bright colours of the scheme as RGB, going round (0 and 1 meet): Plenio Drop's ``hue``. */
  palette(): Uint8ClampedArray
}

export interface Scene {
  draw(ctx: CanvasRenderingContext2D, frame: Frame, width: number, height: number, colors: Colors): void
}

/** How a scene is made: Plenio Drop's and Plenio Nova's visuals can draw with a renderer of their own (a video made
 * while the player shows visuals too, the previews) at a quality of their own. */
export interface SceneOptions {
  drop?: { renderer: () => import('./drop/renderer').DropRenderer | null; scale: number }
  nova?: { renderer: () => import('./nova/renderer').NovaRenderer | null; scale: number }
}

export interface Preset {
  id: string
  name: string
  blurb: string
  /** What music it suits: energetic, calm, acoustic, electronic, dark. */
  suits: string[]
  create(options?: SceneOptions): Scene
  /** A Plenio Drop preset (``source``: built in, or one of the listener's; ``file``: its preset file), or a Plenio
   * Nova scene. */
  kind?: 'drop' | 'nova'
  source?: 'builtin' | 'mine'
  file?: PresetFile
}

// --- colours ------------------------------------------------------------------------------------------

function hsl(h: number, s: number, l: number, a = 1): string {
  return `hsla(${((h % 360) + 360) % 360} ${s}% ${l}% / ${a})`
}

function rgbOf(h: number, s: number, l: number): [number, number, number] {
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)]
}

export function makeColors(hue: number, scheme: Scheme, time: number): Colors {
  let table: Uint8ClampedArray | null = null
  const at = (t: number, alpha = 1): string => {
    const x = Math.max(0, Math.min(1, t))
    switch (scheme) {
      case 'winamp':
        // green at the bottom, yellow, red at the top - the classic bars
        return x < 0.55 ? hsl(120 - x * 60 / 0.55, 100, 45, alpha) : hsl(60 - (x - 0.55) * 60 / 0.45, 100, 50, alpha)
      case 'neon':
        return hsl(hue + time * 25 + x * 140, 100, 58, alpha)
      case 'mono':
        return hsl(hue, 12, 35 + x * 55, alpha)
      case 'sunset':
        return hsl(280 + x * 120, 90, 45 + x * 15, alpha)
      default:
        return hsl(hue + x * 70, 88, 40 + x * 25, alpha)
    }
  }
  const lut = (): Uint8ClampedArray => {
    if (table) return table
    table = new Uint8ClampedArray(256 * 3)
    for (let i = 0; i < 256; i++) {
      const x = i / 255
      let rgb: [number, number, number]
      if (scheme === 'winamp') rgb = rgbOf(x < 0.55 ? 120 - (x * 60) / 0.55 : 60 - ((x - 0.55) * 60) / 0.45, 1, 0.08 + x * 0.45)
      else if (scheme === 'mono') rgb = rgbOf(hue, 0.12, x * 0.9)
      else if (scheme === 'neon') rgb = rgbOf(hue + time * 25 + x * 140, 1, Math.min(0.6, x * 0.75))
      else if (scheme === 'sunset') rgb = rgbOf(280 + x * 120, 0.9, x * 0.6)
      else rgb = rgbOf(hue + x * 70, 0.88, x * 0.62)
      table.set(rgb, i * 3)
    }
    return table
  }
  let round: Uint8ClampedArray | null = null
  const palette = (): Uint8ClampedArray => {
    if (round) return round
    round = new Uint8ClampedArray(256 * 3)
    for (let i = 0; i < 256; i++) {
      // there and back, so that the hue can run on (time * 0.05) without a jump
      const t = 1 - Math.abs((i / 255) * 2 - 1)
      let rgb: [number, number, number]
      if (scheme === 'winamp') rgb = rgbOf(120 - t * 120, 1, 0.5)
      else if (scheme === 'mono') rgb = rgbOf(hue, 0.15, 0.45 + t * 0.4)
      else if (scheme === 'neon') rgb = rgbOf(hue + time * 25 + t * 200, 1, 0.58)
      else if (scheme === 'sunset') rgb = rgbOf(270 + t * 140, 0.95, 0.55)
      else rgb = rgbOf(hue - 30 + t * 150, 0.9, 0.56)
      round.set(rgb, i * 3)
    }
    return round
  }
  return { hue, scheme, time, at, lut, palette }
}

// --- the scenes ---------------------------------------------------------------------------------------

const bars: Preset = {
  id: 'bars',
  name: 'Classic Bars',
  blurb: 'Winamp’s spectrum: bars with caps that fall slowly, mirrored on the floor.',
  suits: ['energetic', 'electronic', 'any'],
  create() {
    const caps = new Float32Array(64)
    return {
      draw(ctx, f, w, h, c) {
        fade(ctx, w, h, 1, '6,8,12')
        const n = 48
        const v = logBins(f.freq, n)
        const gap = Math.max(2, w / n / 6)
        const bw = w / n - gap
        const floor = h * 0.78
        for (let i = 0; i < n; i++) {
          const height = Math.pow(v[i], 1.4) * floor * 0.95
          caps[i] = Math.max(caps[i] - f.dt * floor * 0.55, height)
          const x = i * (bw + gap) + gap / 2
          const gradient = ctx.createLinearGradient(0, floor, 0, floor - floor * 0.95)
          gradient.addColorStop(0, c.at(0))
          gradient.addColorStop(0.6, c.at(0.6))
          gradient.addColorStop(1, c.at(1))
          ctx.fillStyle = gradient
          // segmented like the original: small blocks
          const block = Math.max(4, h / 90)
          for (let y = 0; y < height; y += block + 2) ctx.fillRect(x, floor - y - block, bw, block)
          ctx.fillStyle = c.at(1)
          ctx.fillRect(x, floor - caps[i] - block * 1.6, bw, block * 0.7)
          // the reflection
          ctx.globalAlpha = 0.18
          ctx.fillStyle = c.at(0.3)
          ctx.fillRect(x, floor + 4, bw, height * 0.25)
          ctx.globalAlpha = 1
        }
      },
    }
  },
}

const scope: Preset = {
  id: 'scope',
  name: 'Oscilloscope',
  blurb: 'The waveform as a glowing line with afterglow - the classic scope, in colour.',
  suits: ['acoustic', 'calm', 'any'],
  create() {
    return {
      draw(ctx, f, w, h, c) {
        fade(ctx, w, h, 0.22)
        const mid = h / 2
        const amp = h * 0.42 * (0.7 + f.bass * 0.8)
        ctx.lineJoin = 'round'
        for (const [pass, width, alpha] of [[0, 9, 0.12], [1, 3, 0.95]] as const) {
          ctx.beginPath()
          const step = Math.max(1, Math.floor(f.wave.length / w))
          for (let x = 0, i = 0; i < f.wave.length; i += step, x += w / (f.wave.length / step)) {
            const y = mid + ((f.wave[i] - 128) / 128) * amp
            if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }
          ctx.strokeStyle = c.at(0.4 + f.level * 0.6 + pass * 0.1, alpha)
          ctx.lineWidth = width
          ctx.stroke()
        }
      },
    }
  },
}

const vector: Preset = {
  id: 'vector',
  name: 'Stereo Vectorscope',
  blurb: 'Left against right: the stereo picture of the music, drawn in light with a long afterglow.',
  suits: ['acoustic', 'calm', 'dark'],
  create() {
    // the loudest recent sample: the figure fills the screen however loud the song is
    let peak = 0.3
    return {
      draw(ctx, f, w, h, c) {
        fade(ctx, w, h, 0.1)
        const cx = w / 2
        const cy = h / 2
        let loudest = 0
        for (let i = 0; i < f.left.length; i += 4) loudest = Math.max(loudest, Math.abs(f.left[i] - 128), Math.abs(f.right[i] - 128))
        peak = Math.max(0.08, loudest / 128 > peak ? loudest / 128 : peak * (1 - f.dt * 0.6))
        const r = (Math.min(w, h) * 0.44 * (0.9 + f.pulse * 0.2)) / peak
        // the figure turns slowly: a mono line sweeps round like a radar, stereo opens it into a cloud
        const turn = f.time * 0.12
        const cos = Math.cos(turn)
        const sin = Math.sin(turn)
        ctx.globalCompositeOperation = 'lighter'
        ctx.beginPath()
        for (let i = 0; i < f.left.length; i += 2) {
          const l = (f.left[i] - 128) / 128
          const rr = (f.right[i] - 128) / 128
          // mid/side: a mono sound is a vertical line, wide stereo spreads sideways
          const sx = ((l - rr) / Math.SQRT2) * r
          const sy = ((l + rr) / Math.SQRT2) * r
          const x = cx + sx * cos - sy * sin
          const y = cy - (sx * sin + sy * cos)
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.lineWidth = 6
        ctx.strokeStyle = c.at(0.2 + f.mid, 0.12)
        ctx.stroke()
        ctx.lineWidth = 1.8
        ctx.strokeStyle = c.at(0.35 + f.treble, 0.6)
        ctx.stroke()
        ctx.globalCompositeOperation = 'source-over'
      },
    }
  },
}

const radial: Preset = {
  id: 'radial',
  name: 'Radial Bloom',
  blurb: 'The spectrum as petals around a pulsing core, slowly turning.',
  suits: ['calm', 'electronic', 'any'],
  create() {
    let turn = 0
    return {
      draw(ctx, f, w, h, c) {
        fade(ctx, w, h, 0.35)
        const cx = w / 2
        const cy = h / 2
        const size = Math.min(w, h)
        const core = size * (0.14 + f.pulse * 0.03 + f.bass * 0.04)
        turn += f.dt * (0.15 + f.mid * 0.6)
        const n = 96
        const v = logBins(f.freq, n / 2)
        ctx.lineCap = 'round'
        for (let i = 0; i < n; i++) {
          const k = i < n / 2 ? i : n - 1 - i
          const len = Math.pow(v[k], 1.3) * size * 0.34
          const angle = turn + (i / n) * Math.PI * 2
          ctx.strokeStyle = c.at(k / (n / 2) * 0.8 + v[k] * 0.2)
          ctx.lineWidth = Math.max(2, (size / n) * 1.2)
          ctx.beginPath()
          ctx.moveTo(cx + Math.cos(angle) * core, cy + Math.sin(angle) * core)
          ctx.lineTo(cx + Math.cos(angle) * (core + len), cy + Math.sin(angle) * (core + len))
          ctx.stroke()
        }
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, core)
        glow.addColorStop(0, c.at(1, 0.9))
        glow.addColorStop(1, c.at(0.2, 0))
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(cx, cy, core, 0, Math.PI * 2)
        ctx.fill()
      },
    }
  },
}

const tunnel: Preset = {
  id: 'tunnel',
  name: 'Feedback Tunnel',
  blurb: 'MilkDrop-style feedback: each frame zooms and turns the last, the waveform draws new rings.',
  suits: ['electronic', 'dark', 'calm'],
  create() {
    let back: HTMLCanvasElement | undefined
    let turn = 0
    return {
      draw(ctx, f, w, h, c) {
        back = buffer(w, h, back)
        const b = back.getContext('2d') as CanvasRenderingContext2D
        b.clearRect(0, 0, w, h)
        b.drawImage(ctx.canvas, 0, 0)
        fade(ctx, w, h, 1)
        const zoom = 1.025 + f.bass * 0.05 + f.pulse * 0.02
        turn = 0.004 + f.mid * 0.012
        ctx.save()
        ctx.translate(w / 2, h / 2)
        ctx.rotate(turn)
        ctx.scale(zoom, zoom)
        ctx.globalAlpha = 0.93
        ctx.drawImage(back, -w / 2, -h / 2)
        ctx.restore()
        ctx.globalAlpha = 1
        // the new ring: the waveform bent into a circle
        const r = Math.min(w, h) * (0.08 + f.level * 0.08)
        ctx.beginPath()
        const n = 180
        for (let i = 0; i <= n; i++) {
          const s = f.wave[Math.floor((i % n) / n * f.wave.length)]
          const rr = r * (1 + ((s - 128) / 128) * 0.6)
          const a = (i / n) * Math.PI * 2
          const x = w / 2 + Math.cos(a) * rr
          const y = h / 2 + Math.sin(a) * rr
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.strokeStyle = c.at(0.5 + f.treble * 0.5)
        ctx.lineWidth = 2.5
        ctx.stroke()
      },
    }
  },
}

const stars: Preset = {
  id: 'stars',
  name: 'Hyperspace',
  blurb: 'A starfield that rushes with the bass and glows with the highs.',
  suits: ['energetic', 'electronic', 'any'],
  create() {
    const count = 700
    const x = new Float32Array(count)
    const y = new Float32Array(count)
    const z = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      x[i] = Math.random() * 2 - 1
      y[i] = Math.random() * 2 - 1
      z[i] = Math.random()
    }
    return {
      draw(ctx, f, w, h, c) {
        fade(ctx, w, h, 0.3)
        const cx = w / 2
        const cy = h / 2
        const speed = (0.12 + f.bass * 1.6 + f.pulse * 0.8) * f.dt
        ctx.lineCap = 'round'
        for (let i = 0; i < count; i++) {
          const pz = z[i]
          z[i] -= speed
          if (z[i] <= 0.02) {
            x[i] = Math.random() * 2 - 1
            y[i] = Math.random() * 2 - 1
            z[i] = 1
            continue
          }
          const sx = cx + (x[i] / z[i]) * cx
          const sy = cy + (y[i] / z[i]) * cy
          const px = cx + (x[i] / pz) * cx
          const py = cy + (y[i] / pz) * cy
          const light = 1 - z[i]
          ctx.strokeStyle = c.at(0.3 + light * 0.4 + f.treble * 0.3, light)
          ctx.lineWidth = light * 3
          ctx.beginPath()
          ctx.moveTo(px, py)
          ctx.lineTo(sx, sy)
          ctx.stroke()
        }
      },
    }
  },
}

const plasma: Preset = {
  id: 'plasma',
  name: 'Plasma',
  blurb: 'Flowing colour fields that move faster and brighter with the music.',
  suits: ['calm', 'electronic', 'any'],
  create() {
    const W = 160
    const H = 90
    const p = pixels(W, H)
    let t = 0
    return {
      draw(ctx, f, w, h, c) {
        t += f.dt * (0.5 + f.mid * 2.5 + f.pulse)
        const lut = c.lut()
        const data = p.image.data
        const gain = 0.55 + f.level * 0.6
        for (let yy = 0; yy < H; yy++) {
          for (let xx = 0; xx < W; xx++) {
            const dx = xx - W / 2
            const dy = yy - H / 2
            const v =
              Math.sin(xx * 0.06 + t) + Math.sin(yy * 0.09 - t * 1.3) + Math.sin((xx + yy) * 0.045 + t * 0.7) + Math.sin(Math.sqrt(dx * dx + dy * dy) * 0.11 - t * 2)
            const index = Math.max(0, Math.min(255, Math.floor(((v + 4) / 8) * 255 * gain + f.pulse * 40)))
            const o = (yy * W + xx) * 4
            data[o] = lut[index * 3]
            data[o + 1] = lut[index * 3 + 1]
            data[o + 2] = lut[index * 3 + 2]
            data[o + 3] = 255
          }
        }
        p.ctx.putImageData(p.image, 0, 0)
        ctx.imageSmoothingEnabled = true
        ctx.drawImage(p.canvas, 0, 0, w, h)
      },
    }
  },
}

const fire: Preset = {
  id: 'fire',
  name: 'Inferno',
  blurb: 'AVS fire: the spectrum feeds the flames from below.',
  suits: ['energetic', 'dark'],
  create() {
    const W = 180
    const H = 110
    const heat = new Float32Array(W * (H + 2))
    const p = pixels(W, H)
    const palette = new Uint8ClampedArray(256 * 3)
    for (let i = 0; i < 256; i++) {
      const x = i / 255
      palette[i * 3] = Math.min(255, x * 3 * 255)
      palette[i * 3 + 1] = Math.max(0, Math.min(255, (x * 3 - 1) * 255))
      palette[i * 3 + 2] = Math.max(0, Math.min(255, (x * 3 - 2) * 255))
    }
    return {
      draw(ctx, f, w, h, c) {
        const v = logBins(f.freq, W)
        for (let x = 0; x < W; x++) {
          const fuel = Math.pow(v[x], 1.2) * (0.8 + f.pulse * 0.6)
          heat[(H + 1) * W + x] = Math.random() < 0.6 + fuel * 0.4 ? 1 * (0.4 + fuel) : 0
          heat[H * W + x] = heat[(H + 1) * W + x] * (0.8 + Math.random() * 0.2)
        }
        for (let y = 0; y < H; y++) {
          for (let x = 0; x < W; x++) {
            const l = x > 0 ? x - 1 : x
            const r = x < W - 1 ? x + 1 : x
            const below = (y + 1) * W
            const v2 = (heat[below + l] + heat[below + x] + heat[below + r] + heat[Math.min(H + 1, y + 2) * W + x]) / 4.06
            heat[y * W + x] = Math.max(0, v2 - 0.004)
          }
        }
        const lut = c.scheme === 'song' || c.scheme === 'winamp' ? palette : c.lut()
        const data = p.image.data
        for (let i = 0; i < W * H; i++) {
          const index = Math.min(255, Math.floor(heat[i] * 255))
          data[i * 4] = lut[index * 3]
          data[i * 4 + 1] = lut[index * 3 + 1]
          data[i * 4 + 2] = lut[index * 3 + 2]
          data[i * 4 + 3] = 255
        }
        p.ctx.putImageData(p.image, 0, 0)
        ctx.imageSmoothingEnabled = true
        ctx.drawImage(p.canvas, 0, 0, w, h)
      },
    }
  },
}

const kaleido: Preset = {
  id: 'kaleido',
  name: 'Kaleidoscope',
  blurb: 'The waveform and floating lights, mirrored into twelve turning slices.',
  suits: ['calm', 'acoustic', 'electronic'],
  create() {
    let source: HTMLCanvasElement | undefined
    let turn = 0
    const dots = Array.from({ length: 14 }, () => ({ a: Math.random() * 6.28, r: Math.random(), s: 0.2 + Math.random() }))
    return {
      draw(ctx, f, w, h, c) {
        source = buffer(w, h, source)
        const s = source.getContext('2d') as CanvasRenderingContext2D
        s.globalCompositeOperation = 'source-over'
        s.fillStyle = 'rgba(0,0,0,0.18)'
        s.fillRect(0, 0, w, h)
        const cx = w / 2
        const cy = h / 2
        const size = Math.min(w, h) / 2
        turn += f.dt * (0.1 + f.mid * 0.5)
        s.globalCompositeOperation = 'lighter'
        for (const d of dots) {
          d.a += f.dt * d.s * (0.3 + f.level)
          const r = size * (0.2 + d.r * 0.75)
          const x = cx + Math.cos(d.a) * r
          const y = cy + Math.sin(d.a * 0.7) * r * 0.5
          const radius = 6 + f.bass * 30 * d.s + f.pulse * 10
          const g = s.createRadialGradient(x, y, 0, x, y, radius)
          g.addColorStop(0, c.at(d.r, 0.9))
          g.addColorStop(1, c.at(d.r, 0))
          s.fillStyle = g
          s.beginPath()
          s.arc(x, y, radius, 0, 6.29)
          s.fill()
        }
        s.beginPath()
        for (let i = 0; i < 128; i++) {
          const v = (f.wave[i * 8] - 128) / 128
          const x = cx + (i / 128) * size
          const y = cy + v * size * 0.35
          if (i === 0) s.moveTo(x, y)
          else s.lineTo(x, y)
        }
        s.strokeStyle = c.at(0.8, 0.8)
        s.lineWidth = 2
        s.stroke()
        // the mirror: twelve slices of the source, every second one flipped
        fade(ctx, w, h, 1)
        const slices = 12
        for (let k = 0; k < slices; k++) {
          ctx.save()
          ctx.translate(cx, cy)
          ctx.rotate(turn + (k * Math.PI * 2) / slices)
          if (k % 2) ctx.scale(1, -1)
          ctx.beginPath()
          ctx.moveTo(0, 0)
          ctx.arc(0, 0, Math.hypot(cx, cy), 0, (Math.PI * 2) / slices + 0.01)
          ctx.closePath()
          ctx.clip()
          ctx.drawImage(source, -cx, -cy)
          ctx.restore()
        }
      },
    }
  },
}

const fountain: Preset = {
  id: 'fountain',
  name: 'Beat Fountain',
  blurb: 'Every beat throws a burst of sparks into the air.',
  suits: ['energetic', 'any'],
  create() {
    const max = 2500
    const px = new Float32Array(max)
    const py = new Float32Array(max)
    const vx = new Float32Array(max)
    const vy = new Float32Array(max)
    const life = new Float32Array(max)
    const tint = new Float32Array(max)
    let next = 0
    const emit = (n: number, w: number, h: number, power: number, color: number) => {
      for (let i = 0; i < n; i++) {
        const k = next++ % max
        px[k] = w / 2 + (Math.random() - 0.5) * w * 0.1
        py[k] = h * 0.95
        const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.1
        const v = h * (0.5 + Math.random() * 0.7) * power
        vx[k] = Math.cos(a) * v
        vy[k] = Math.sin(a) * v
        life[k] = 1
        tint[k] = color + Math.random() * 0.25
      }
    }
    return {
      draw(ctx, f, w, h, c) {
        fade(ctx, w, h, 0.25)
        if (f.beat) emit(160, w, h, 0.9 + f.bass, Math.random() * 0.7)
        emit(Math.floor(f.level * 14), w, h, 0.5 + f.mid * 0.5, 0.2)
        ctx.globalCompositeOperation = 'lighter'
        for (let k = 0; k < max; k++) {
          if (life[k] <= 0) continue
          vy[k] += h * 0.9 * f.dt
          px[k] += vx[k] * f.dt
          py[k] += vy[k] * f.dt
          life[k] -= f.dt * 0.55
          ctx.fillStyle = c.at(tint[k], Math.max(0, life[k]))
          const size = 1.5 + life[k] * 3
          ctx.fillRect(px[k] - size / 2, py[k] - size / 2, size, size)
        }
        ctx.globalCompositeOperation = 'source-over'
      },
    }
  },
}

const mountains: Preset = {
  id: 'mountains',
  name: 'Spectrum Ridges',
  blurb: 'The spectrum’s recent past as glowing ridges - like a famous album cover.',
  suits: ['calm', 'dark', 'acoustic'],
  create() {
    const rows: Float32Array[] = []
    let tick = 0
    return {
      draw(ctx, f, w, h, c) {
        tick += f.dt
        if (tick > 0.06 || !rows.length) {
          tick = 0
          rows.unshift(logBins(f.freq, 96))
          if (rows.length > 36) rows.pop()
        }
        fade(ctx, w, h, 1)
        const left = w * 0.18
        const width = w * 0.64
        for (let r = rows.length - 1; r >= 0; r--) {
          const row = rows[r]
          const base = h * 0.18 + (h * 0.72 * (rows.length - r)) / rows.length
          ctx.beginPath()
          ctx.moveTo(left, base)
          for (let i = 0; i < row.length; i++) {
            const centre = 1 - Math.abs(i / (row.length - 1) - 0.5) * 2
            const lift = Math.pow(row[i], 1.5) * h * 0.22 * (0.25 + centre * 0.75)
            ctx.lineTo(left + (i / (row.length - 1)) * width, base - lift)
          }
          ctx.lineTo(left + width, base)
          ctx.closePath()
          ctx.fillStyle = '#000'
          ctx.fill()
          ctx.strokeStyle = c.at(1 - r / rows.length, 0.25 + 0.75 * (1 - r / rows.length))
          ctx.lineWidth = r === 0 ? 2.2 : 1.3
          ctx.stroke()
        }
      },
    }
  },
}

const ripples: Preset = {
  id: 'ripples',
  name: 'Ripples',
  blurb: 'Every beat drops a ring into still water.',
  suits: ['calm', 'energetic', 'any'],
  create() {
    const rings: { r: number; tint: number; width: number }[] = []
    return {
      draw(ctx, f, w, h, c) {
        fade(ctx, w, h, 0.28)
        const cx = w / 2
        const cy = h / 2
        if (f.beat) rings.push({ r: 10, tint: Math.random(), width: 2 + f.bass * 8 })
        const size = Math.hypot(cx, cy)
        for (let i = rings.length - 1; i >= 0; i--) {
          const ring = rings[i]
          ring.r += f.dt * size * (0.35 + f.level * 0.4)
          const life = 1 - ring.r / size
          if (life <= 0) {
            rings.splice(i, 1)
            continue
          }
          ctx.strokeStyle = c.at(ring.tint, life)
          ctx.lineWidth = ring.width * life + 1
          ctx.beginPath()
          ctx.arc(cx, cy, ring.r, 0, Math.PI * 2)
          ctx.stroke()
        }
        const core = Math.min(w, h) * (0.04 + f.bass * 0.08 + f.pulse * 0.04)
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, core * 2)
        g.addColorStop(0, c.at(0.9, 0.95))
        g.addColorStop(1, c.at(0.4, 0))
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(cx, cy, core * 2, 0, Math.PI * 2)
        ctx.fill()
        // the spectrum as dots on a circle
        const v = logBins(f.freq, 64)
        for (let i = 0; i < 64; i++) {
          const a = (i / 64) * Math.PI * 2 - Math.PI / 2
          const r = Math.min(w, h) * 0.32 + v[i] * Math.min(w, h) * 0.1
          ctx.fillStyle = c.at(i / 64, 0.4 + v[i] * 0.6)
          ctx.beginPath()
          ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 2 + v[i] * 5, 0, 6.29)
          ctx.fill()
        }
      },
    }
  },
}

const retro: Preset = {
  id: 'retro',
  name: 'Retro Grid',
  blurb: 'A synthwave horizon: the sun pulses, the grid races with the bass, the hills are the spectrum.',
  suits: ['electronic', 'energetic'],
  create() {
    let offset = 0
    return {
      draw(ctx, f, w, h, c) {
        const horizon = h * 0.58
        const sky = ctx.createLinearGradient(0, 0, 0, horizon)
        sky.addColorStop(0, '#05010f')
        sky.addColorStop(1, c.at(0.15, 1))
        ctx.fillStyle = sky
        ctx.fillRect(0, 0, w, horizon)
        // the sun with its stripes
        // a signature (phase 7.9): the sun swells on the hit and rises a little as a louder part comes
        const cue = f.cue
        const r = Math.min(w, h) * (0.2 + f.pulse * 0.015 + 0.03 * (cue?.impact ?? 0) + 0.025 * (cue?.tension ?? 0))
        const sun = ctx.createLinearGradient(0, horizon - r * 1.6, 0, horizon)
        sun.addColorStop(0, c.at(1))
        sun.addColorStop(1, c.at(0.55))
        ctx.save()
        ctx.beginPath()
        ctx.arc(w / 2, horizon - r * 0.35, r, 0, Math.PI * 2)
        ctx.clip()
        ctx.fillStyle = sun
        ctx.fillRect(w / 2 - r, horizon - r * 1.6, r * 2, r * 2)
        ctx.fillStyle = '#05010f'
        for (let k = 0; k < 7; k++) {
          const y = horizon - r * 0.35 + k * r * 0.13
          ctx.fillRect(w / 2 - r, y, r * 2, 2 + k * 1.6)
        }
        ctx.restore()
        // the hills: the spectrum, mirrored
        const v = logBins(f.freq, 64)
        ctx.beginPath()
        ctx.moveTo(0, horizon)
        for (let i = 0; i <= 64; i++) {
          const k = i <= 32 ? 32 - i : i - 32
          ctx.lineTo((i / 64) * w, horizon - Math.pow(v[Math.min(63, k * 2)], 1.4) * h * 0.18)
        }
        ctx.lineTo(w, horizon)
        ctx.fillStyle = '#0b0420'
        ctx.fill()
        ctx.strokeStyle = c.at(0.7)
        ctx.lineWidth = 2
        ctx.stroke()
        // the floor grid racing towards us
        ctx.fillStyle = '#05010f'
        ctx.fillRect(0, horizon, w, h - horizon)
        offset = (offset + f.dt * (0.4 + f.bass * 2.2)) % 1
        ctx.strokeStyle = c.at(0.8, 0.85)
        ctx.lineWidth = 1.5
        for (let k = 0; k < 16; k++) {
          const z = (k + offset) / 16
          const y = horizon + Math.pow(z, 2.2) * (h - horizon)
          ctx.globalAlpha = z
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(w, y)
          ctx.stroke()
        }
        ctx.globalAlpha = 1
        for (let k = -12; k <= 12; k++) {
          ctx.beginPath()
          ctx.moveTo(w / 2 + k * w * 0.01, horizon)
          ctx.lineTo(w / 2 + k * w * 0.12, h)
          ctx.stroke()
        }
      },
    }
  },
}

/**
 * The player bar's little square (owner's request 2026-10-17: square and bright at any window size - the
 * classic bars were a dark strip there): a ring of the spectrum round a core that pulses with the bass, in
 * vivid colours of the song's hue over a glow. Paused, it breathes slowly, so it never goes dark.
 * Not one of the visuals to choose.
 */
export function miniScene(): Scene {
  const levels = new Float32Array(24)
  return {
    draw(ctx, f, w, h, c) {
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = '#0c0a1c'
      ctx.fillRect(0, 0, w, h)
      const n = levels.length
      const v = logBins(f.freq, n, 2, 360)
      for (let i = 0; i < n; i++) {
        const idle = 0.22 + 0.12 * Math.sin(c.time * 1.8 + i * 0.7)
        levels[i] = Math.max(levels[i] * 0.84, f.playing ? 0.12 + v[i] * 0.88 : idle)
      }
      const cx = w / 2
      const cy = h / 2
      const size = Math.min(w, h)
      const inner = size * (0.15 + 0.04 * f.pulse)
      // a soft glow behind, in the song's colour
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.5)
      glow.addColorStop(0, `hsla(${c.hue} 95% 62% / ${0.45 + 0.3 * f.bass})`)
      glow.addColorStop(1, `hsla(${c.hue + 30} 95% 50% / 0)`)
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, w, h)
      // the ring: the spectrum mirrored left and right, the low notes at the top
      ctx.lineCap = 'round'
      ctx.lineWidth = Math.max(1.5, size / 20)
      for (let i = 0; i < n * 2; i++) {
        const k = i < n ? i : n * 2 - 1 - i
        const level = levels[k]
        const angle = ((i + 0.5) / (n * 2)) * Math.PI * 2 - Math.PI / 2
        const length = size * 0.27 * level
        ctx.strokeStyle = `hsl(${c.hue + 40 + k * 6} 100% ${58 + level * 14}%)`
        ctx.beginPath()
        ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner)
        ctx.lineTo(cx + Math.cos(angle) * (inner + length), cy + Math.sin(angle) * (inner + length))
        ctx.stroke()
      }
      // the core
      ctx.fillStyle = `hsl(${c.hue} 100% ${76 + 14 * f.pulse}%)`
      ctx.beginPath()
      ctx.arc(cx, cy, inner * 0.62, 0, Math.PI * 2)
      ctx.fill()
    },
  }
}

/** The classic visuals, drawn on a 2D canvas. */
export const CLASSIC: Preset[] = [bars, scope, vector, radial, tunnel, stars, plasma, fire, kaleido, fountain, mountains, ripples, retro, ...MORE_CLASSIC]

export { logBins }

/** Every built-in visual: the classics, Plenio Drop's presets and Plenio Nova's scenes. */
export const PRESETS: Preset[] = [...CLASSIC, ...DROP_PRESETS, ...NOVA_PRESETS]

/** Every visual, the listener's own Drop presets included (they are read later, and again when edited). */
export function allPresets(): Preset[] {
  return [...PRESETS, ...myPresets.value]
}

export function presetById(id: string | null | undefined): Preset | undefined {
  return PRESETS.find((p) => p.id === id) ?? myPresets.value.find((p) => p.id === id)
}
