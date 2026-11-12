/**
 * Twelve more classic visuals (owner's request 2026-10-23: hypnotic and rhythmic, unusual, or very harmonious):
 * the hi-fi's instruments (an LED wall, VU meters, a spectrogram waterfall, a turning record that writes the
 * music into its grooves), demo-scene and screen-saver classics (digital rain, a lava lamp, fireworks, a
 * honeycomb), harmonious figures (a spirograph, a harmonograph) and depth (a tunnel of waveforms, a galaxy).
 * Each draws on a 2D canvas, as the first classics (presets.ts).
 */
import type { Frame } from './analysis'
import { buffer, fade, logBins, pixels } from './draw'
import type { Colors, Preset, Scene } from './presets'

const TAU = Math.PI * 2

function scene(draw: (ctx: CanvasRenderingContext2D, f: Frame, w: number, h: number, c: Colors) => void): Scene {
  return { draw }
}

// --- digital rain -------------------------------------------------------------------------------------------

const GLYPHS = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789:=+*<>'

const matrix: Preset = {
  id: 'matrix',
  name: 'Digital Rain',
  blurb: 'Glyphs falling in columns - faster with the highs, brighter where the spectrum is loud.',
  suits: ['electronic', 'energetic', 'dark'],
  create() {
    let heads = new Float32Array(0)
    let speeds = new Float32Array(0)
    let size = 0
    const glyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
    return scene((ctx, f, w, h, c) => {
      const cell = Math.max(14, Math.round(h / 36))
      const columns = Math.ceil(w / cell)
      if (columns !== heads.length || cell !== size) {
        size = cell
        heads = Float32Array.from({ length: columns }, () => Math.random() * -40)
        speeds = Float32Array.from({ length: columns }, () => 0.6 + Math.random() * 0.8)
        fade(ctx, w, h, 1)
      }
      fade(ctx, w, h, 0.05 + f.pulse * 0.03)
      const v = logBins(f.freq, columns)
      ctx.font = `${cell}px "MS Gothic", "Osaka", monospace`
      ctx.textAlign = 'center'
      const rows = h / cell
      for (let i = 0; i < columns; i++) {
        heads[i] += f.dt * speeds[i] * (9 + f.treble * 22 + f.pulse * 10)
        const y = Math.floor(heads[i])
        if (y >= 0) {
          const x = i * cell + cell / 2
          const glow = 0.35 + v[i] * 0.65
          ctx.fillStyle = c.at(0.25 + v[i] * 0.55, 0.75 * glow)
          ctx.fillText(glyph(), x, (y - 1) * cell)
          ctx.fillStyle = `rgba(235,255,240,${0.55 + 0.45 * glow})`
          ctx.fillText(glyph(), x, y * cell)
        }
        if (y > rows + 8 && Math.random() < 0.05) heads[i] = Math.random() * -12
      }
    })
  },
}

// --- the LED wall -----------------------------------------------------------------------------------------

const ledwall: Preset = {
  id: 'ledwall',
  name: 'LED Wall',
  blurb: 'A hi-fi’s dot matrix: every band a column of lights, a peak light that sinks slowly.',
  suits: ['energetic', 'electronic', 'any'],
  create() {
    const COLS = 32
    const ROWS = 18
    const peaks = new Float32Array(COLS)
    const levels = new Float32Array(COLS)
    return scene((ctx, f, w, h, c) => {
      fade(ctx, w, h, 1, '5,6,10')
      const v = logBins(f.freq, COLS)
      const pitch = Math.min((w * 0.86) / COLS, (h * 0.78) / ROWS)
      const r = pitch * 0.36
      const left = (w - pitch * COLS) / 2 + pitch / 2
      const bottom = (h + pitch * ROWS) / 2 - pitch / 2
      ctx.globalCompositeOperation = 'lighter'
      for (let i = 0; i < COLS; i++) {
        levels[i] = Math.max(levels[i] - f.dt * 1.8, Math.pow(v[i], 1.2))
        peaks[i] = Math.max(peaks[i] - f.dt * 0.35, levels[i])
        const lit = Math.round(levels[i] * ROWS)
        const peak = Math.min(ROWS - 1, Math.round(peaks[i] * ROWS))
        for (let k = 0; k < ROWS; k++) {
          const x = left + i * pitch
          const y = bottom - k * pitch
          const on = k < lit || (k === peak && peak > 0)
          ctx.fillStyle = on ? c.at(k / (ROWS - 1), k === peak ? 1 : 0.9) : c.at(k / (ROWS - 1), 0.06)
          ctx.beginPath()
          ctx.arc(x, y, r, 0, TAU)
          ctx.fill()
          if (on) {
            ctx.fillStyle = c.at(k / (ROWS - 1), 0.12)
            ctx.beginPath()
            ctx.arc(x, y, r * 2.1, 0, TAU)
            ctx.fill()
          }
        }
      }
      ctx.globalCompositeOperation = 'source-over'
    })
  },
}

// --- VU meters ---------------------------------------------------------------------------------------------

function rms(samples: Uint8Array): number {
  let sum = 0
  for (let i = 0; i < samples.length; i += 2) {
    const x = (samples[i] - 128) / 128
    sum += x * x
  }
  return Math.sqrt(sum / Math.max(1, samples.length / 2))
}

const vumeter: Preset = {
  id: 'vumeter',
  name: 'VU Meters',
  blurb: 'Two needles on warm-lit dials, left and right - swinging as a tape machine’s do.',
  suits: ['acoustic', 'calm', 'any'],
  create() {
    const needle = [0, 0]
    const peakLight = [0, 0]
    return scene((ctx, f, w, h, c) => {
      fade(ctx, w, h, 1, '12,10,9')
      const levels = [rms(f.left), rms(f.right)]
      const mw = Math.min(w * 0.42, h * 0.95)
      const mh = mw * 0.62
      for (let side = 0; side < 2; side++) {
        // VU ballistics: about 300 ms to rise and to fall
        const db = 20 * Math.log10(Math.max(1e-4, levels[side] * 3.2))
        const target = Math.min(1.08, Math.max(0, (db + 20) / 23))
        needle[side] += (target - needle[side]) * Math.min(1, f.dt * 7)
        peakLight[side] = target > 0.9 ? 1 : Math.max(0, peakLight[side] - f.dt * 2)
        const x0 = side === 0 ? w / 2 - mw - w * 0.02 : w / 2 + w * 0.02
        const y0 = (h - mh) / 2
        // the face, lit from behind in the scheme's warmth
        const face = ctx.createRadialGradient(x0 + mw / 2, y0 + mh * 0.95, mh * 0.1, x0 + mw / 2, y0 + mh * 0.6, mw * 0.8)
        face.addColorStop(0, '#fff3d6')
        face.addColorStop(0.55, '#f2d9a6')
        face.addColorStop(1, '#a87b45')
        ctx.fillStyle = '#2a2420'
        ctx.fillRect(x0 - mw * 0.03, y0 - mw * 0.03, mw * 1.06, mh + mw * 0.06)
        ctx.fillStyle = face
        ctx.fillRect(x0, y0, mw, mh)
        // a signature (phase 7.9): the dial's lamp glows warmer as a louder part comes, and flares on the hit
        ctx.fillStyle = c.at(0.6, 0.12 + 0.1 * f.pulse + 0.12 * (f.cue?.tension ?? 0) + 0.15 * (f.cue?.impact ?? 0))
        ctx.fillRect(x0, y0, mw, mh)
        const cx = x0 + mw / 2
        const cy = y0 + mh * 1.02
        const radius = mh * 0.86
        const from = -Math.PI * 0.8
        const to = -Math.PI * 0.2
        // the scale: -20 .. 0 black, 0 .. +3 red
        ctx.lineWidth = Math.max(2, mw / 140)
        for (const [a, b, color] of [[0, 20 / 23, '#2b2018'], [20 / 23, 1, '#c0261d']] as const) {
          ctx.strokeStyle = color
          ctx.beginPath()
          ctx.arc(cx, cy, radius, from + (to - from) * a, from + (to - from) * b)
          ctx.stroke()
        }
        ctx.font = `600 ${Math.round(mw / 26)}px system-ui, sans-serif`
        ctx.textAlign = 'center'
        for (const [mark, label] of [[-20, '20'], [-10, '10'], [-7, '7'], [-5, '5'], [-3, '3'], [-1, '1'], [0, '0'], [1, '1'], [3, '3']] as const) {
          const t = (mark + 20) / 23
          const angle = from + (to - from) * t
          const inner = radius * 0.92
          ctx.strokeStyle = mark > 0 ? '#c0261d' : '#2b2018'
          ctx.beginPath()
          ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner)
          ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius)
          ctx.stroke()
          ctx.fillStyle = mark > 0 ? '#c0261d' : '#2b2018'
          ctx.fillText(label, cx + Math.cos(angle) * radius * 1.09, cy + Math.sin(angle) * radius * 1.09)
        }
        ctx.fillStyle = '#2b2018'
        ctx.font = `700 ${Math.round(mw / 14)}px Georgia, serif`
        ctx.fillText('VU', cx, y0 + mh * 0.72)
        ctx.font = `600 ${Math.round(mw / 30)}px system-ui, sans-serif`
        ctx.fillText(side === 0 ? 'LEFT' : 'RIGHT', cx, y0 + mh * 0.86)
        // the needle and its shadow
        const angle = from + (to - from) * Math.min(1.04, needle[side])
        for (const [dx, color, width] of [[mw * 0.012, 'rgba(0,0,0,0.25)', 3], [0, '#151010', 2.2]] as const) {
          ctx.strokeStyle = color
          ctx.lineWidth = Math.max(1.5, (mw / 260) * width)
          ctx.beginPath()
          ctx.moveTo(cx + dx, cy)
          ctx.lineTo(cx + dx + Math.cos(angle) * radius * 1.02, cy + Math.sin(angle) * radius * 1.02)
          ctx.stroke()
        }
        // the peak light
        ctx.fillStyle = `rgba(255,${60 + 40 * (1 - peakLight[side])},40,${0.25 + 0.75 * peakLight[side]})`
        ctx.beginPath()
        ctx.arc(x0 + mw * 0.88, y0 + mh * 0.14, mw * 0.022, 0, TAU)
        ctx.fill()
      }
    })
  },
}

// --- the spectrogram waterfall -------------------------------------------------------------------------------

const waterfall: Preset = {
  id: 'waterfall',
  name: 'Spectrogram',
  blurb: 'The music’s spectrum as it passes - the bass on the left, a waterfall of colour rising.',
  suits: ['calm', 'electronic', 'any'],
  create() {
    const W = 256
    const H = 150
    const p = pixels(W, H)
    const row = p.ctx.createImageData(W, 1)
    return scene((ctx, f, w, h, c) => {
      const v = logBins(f.freq, W)
      const lut = c.lut()
      for (let x = 0; x < W; x++) {
        const i = Math.min(255, Math.floor(Math.pow(v[x], 1.3) * 255))
        row.data[x * 4] = lut[i * 3]
        row.data[x * 4 + 1] = lut[i * 3 + 1]
        row.data[x * 4 + 2] = lut[i * 3 + 2]
        row.data[x * 4 + 3] = 255
      }
      p.ctx.drawImage(p.canvas, 0, -1)
      p.ctx.putImageData(row, 0, H - 1)
      ctx.imageSmoothingEnabled = true
      ctx.drawImage(p.canvas, 0, 0, w, h)
      // the newest line, bright, as the spectrum now
      ctx.beginPath()
      for (let x = 0; x < W; x++) ctx.lineTo((x / (W - 1)) * w, h - Math.pow(v[x], 1.3) * h * 0.22 - 2)
      ctx.strokeStyle = c.at(1, 0.85)
      ctx.lineWidth = 2
      ctx.stroke()
    })
  },
}

// --- the spirograph ------------------------------------------------------------------------------------------

const spirograph: Preset = {
  id: 'spirograph',
  name: 'Spirograph',
  blurb: 'Three gear-drawn roses turning into one another - their reach breathing with the music.',
  suits: ['calm', 'acoustic', 'any'],
  create() {
    const GEARS: [number, number][] = [[7, 3], [12, 5], [9, 2]]
    let turn = 0
    return scene((ctx, f, w, h, c) => {
      fade(ctx, w, h, 0.16)
      turn += f.dt * (0.08 + f.mid * 0.25)
      const size = Math.min(w, h) * 0.46
      ctx.globalCompositeOperation = 'lighter'
      ctx.lineWidth = 1.4
      GEARS.forEach(([big, small], k) => {
        const R = 1
        const r = small / big
        const d = 0.35 + 0.3 * Math.sin(f.time * 0.11 + k * 2) + [f.bass, f.mid, f.treble][k] * 0.35
        const scale = size / (R - r + d)
        ctx.beginPath()
        const steps = 900
        for (let s = 0; s <= steps; s++) {
          const t = (s / steps) * TAU * small
          const x = (R - r) * Math.cos(t) + d * Math.cos(((R - r) / r) * t)
          const y = (R - r) * Math.sin(t) - d * Math.sin(((R - r) / r) * t)
          const a = turn * (k % 2 ? -1 : 1) + k * 0.7
          const px = w / 2 + (x * Math.cos(a) - y * Math.sin(a)) * scale
          const py = h / 2 + (x * Math.sin(a) + y * Math.cos(a)) * scale
          if (s === 0) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        }
        ctx.strokeStyle = c.at(0.2 + k * 0.35 + f.pulse * 0.1, 0.32)
        ctx.stroke()
      })
      ctx.globalCompositeOperation = 'source-over'
    })
  },
}

// --- the lava lamp -------------------------------------------------------------------------------------------

const lava: Preset = {
  id: 'lava',
  name: 'Lava Lamp',
  blurb: 'Warm blobs rising, melting into one another and parting again - swelling with the bass.',
  suits: ['calm', 'dark'],
  create() {
    const W = 120
    const H = 160
    const p = pixels(W, H)
    const BLOBS = 7
    const seeds = Array.from({ length: BLOBS }, (_, k) => ({ phase: k * 1.7, speed: 0.12 + (k % 3) * 0.05, x: 0.2 + ((k * 37) % 60) / 100, size: 0.11 + (k % 4) * 0.025 }))
    let t = 0
    return scene((ctx, f, w, h, c) => {
      t += f.dt * (0.6 + f.mid * 0.8)
      const lut = c.lut()
      const blobs = seeds.map((b, k) => ({
        x: (b.x + 0.12 * Math.sin(t * 0.7 + b.phase)) * W,
        y: (0.5 + 0.42 * Math.sin(t * b.speed * 2 + b.phase)) * H,
        r2: Math.pow((b.size + f.bass * 0.03 + (k === 0 ? f.pulse * 0.02 : 0)) * W, 2),
      }))
      const data = p.image.data
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          let field = 0
          for (const b of blobs) {
            const dx = x - b.x
            const dy = y - b.y
            field += b.r2 / (dx * dx + dy * dy + 1)
          }
          const glow = Math.min(1, field * 0.5)
          const solid = field > 1 ? 1 : 0
          const index = Math.min(255, Math.floor((0.15 + glow * 0.45 + solid * 0.4 * (0.7 + Math.min(1, (field - 1) * 0.3))) * 255))
          const o = (y * W + x) * 4
          data[o] = lut[index * 3]
          data[o + 1] = lut[index * 3 + 1]
          data[o + 2] = lut[index * 3 + 2]
          data[o + 3] = 255
        }
      }
      p.ctx.putImageData(p.image, 0, 0)
      ctx.imageSmoothingEnabled = true
      fade(ctx, w, h, 1)
      // the lamp's glass, as tall as the picture
      const lw = Math.min(w * 0.42, h * 0.62)
      ctx.drawImage(p.canvas, (w - lw) / 2, 0, lw, h)
      const shine = ctx.createLinearGradient((w - lw) / 2, 0, (w + lw) / 2, 0)
      shine.addColorStop(0, 'rgba(0,0,0,0.55)')
      shine.addColorStop(0.25, 'rgba(255,255,255,0.08)')
      shine.addColorStop(0.5, 'rgba(0,0,0,0)')
      shine.addColorStop(1, 'rgba(0,0,0,0.6)')
      ctx.fillStyle = shine
      ctx.fillRect((w - lw) / 2, 0, lw, h)
      // its light on the wall
      const wall = ctx.createRadialGradient(w / 2, h / 2, lw * 0.4, w / 2, h / 2, w * 0.7)
      wall.addColorStop(0, c.at(0.7, 0.18 + 0.1 * f.bass))
      wall.addColorStop(1, c.at(0.2, 0))
      ctx.fillStyle = wall
      ctx.fillRect(0, 0, (w - lw) / 2, h)
      ctx.fillRect((w + lw) / 2, 0, (w - lw) / 2, h)
    })
  },
}

// --- the tunnel of waveforms ---------------------------------------------------------------------------------

const wavetunnel: Preset = {
  id: 'wavetunnel',
  name: 'Wave Tunnel',
  blurb: 'Every moment’s waveform a ring, flying away into a twisting tunnel - shaken by the kick.',
  suits: ['electronic', 'dark', 'energetic'],
  create() {
    const POINTS = 96
    const DEPTH = 42
    const rings: Float32Array[] = []
    let tick = 0
    let shake = 0
    return scene((ctx, f, w, h, c) => {
      tick += f.dt
      if (tick > 1 / 30 || !rings.length) {
        tick = 0
        const ring = new Float32Array(POINTS)
        const step = Math.floor(f.wave.length / POINTS)
        for (let i = 0; i < POINTS; i++) ring[i] = (f.wave[i * step] - 128) / 128
        rings.unshift(ring)
        if (rings.length > DEPTH) rings.pop()
      }
      shake = f.beat ? 1 : shake * 0.9
      fade(ctx, w, h, 1)
      const cx = w / 2 + Math.sin(f.time * 0.7) * w * 0.04 + (Math.random() - 0.5) * shake * w * 0.01
      const cy = h / 2 + Math.cos(f.time * 0.5) * h * 0.04
      const base = Math.min(w, h) * 0.55
      ctx.globalCompositeOperation = 'lighter'
      for (let r = rings.length - 1; r >= 0; r--) {
        const z = 1 + r * 0.32
        const radius = base / z
        const twist = r * 0.09 + f.time * 0.2
        const ring = rings[r]
        ctx.beginPath()
        for (let i = 0; i <= POINTS; i++) {
          const k = i % POINTS
          const a = (k / POINTS) * TAU + twist
          const rr = radius * (1 + ring[k] * 0.35)
          const x = cx + Math.cos(a) * rr
          const y = cy + Math.sin(a) * rr
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        const near = 1 - r / DEPTH
        ctx.strokeStyle = c.at(near * 0.9 + f.pulse * 0.1, Math.pow(near, 1.5) * 0.85)
        ctx.lineWidth = 1 + near * 2.5
        ctx.stroke()
      }
      ctx.globalCompositeOperation = 'source-over'
    })
  },
}

// --- fireworks -----------------------------------------------------------------------------------------------

interface Spark {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  tint: number
  rocket: boolean
}

const fireworks: Preset = {
  id: 'fireworks',
  name: 'Fireworks',
  blurb: 'Every beat sends a rocket up; it bursts into a sphere of colour that falls slowly.',
  suits: ['energetic', 'any'],
  create() {
    const sparks: Spark[] = []
    let quiet = 0
    return scene((ctx, f, w, h, c) => {
      fade(ctx, w, h, 0.12, '4,3,10')
      quiet += f.dt
      if ((f.beat || quiet > 1.2) && sparks.length < 3000) {
        quiet = 0
        // one rocket, on a loud beat two; they burst between the top fifth and the middle of the screen
        for (let k = f.bass > 1.3 ? 2 : 1; k > 0; k--) {
          sparks.push({ x: w * (0.15 + Math.random() * 0.7), y: h, vx: (Math.random() - 0.5) * w * 0.08, vy: -h * (0.8 + Math.random() * 0.25 + Math.min(f.bass, 1.5) * 0.06), life: 0.6 + Math.random() * 0.3, tint: Math.random(), rocket: true })
        }
      }
      const gravity = h * 0.55
      ctx.globalCompositeOperation = 'lighter'
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]
        s.vy += gravity * f.dt * (s.rocket ? 0.6 : 0.35)
        if (!s.rocket) {
          s.vx *= 1 - f.dt * 1.2
          s.vy *= 1 - f.dt * 1.2
        }
        s.x += s.vx * f.dt
        s.y += s.vy * f.dt
        s.life -= f.dt * (s.rocket ? 1 : 0.5)
        if (s.rocket && (s.life <= 0 || s.vy > -h * 0.05)) {
          const count = 140 + Math.floor(f.level * 120)
          const speed = Math.min(w, h) * (0.34 + f.bass * 0.15)
          const flash = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, speed * 0.45)
          flash.addColorStop(0, c.at(s.tint % 1, 0.55))
          flash.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = flash
          ctx.fillRect(s.x - speed * 0.45, s.y - speed * 0.45, speed * 0.9, speed * 0.9)
          for (let k = 0; k < count; k++) {
            const a = (k / count) * TAU + Math.random() * 0.1
            const v = speed * (0.6 + Math.random() * 0.4)
            sparks.push({ x: s.x, y: s.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, tint: s.tint + (Math.random() - 0.5) * 0.15, rocket: false })
          }
          sparks.splice(i, 1)
          continue
        }
        if (s.life <= 0) {
          sparks.splice(i, 1)
          continue
        }
        const size = s.rocket ? 3.5 : 2 + s.life * 2.8
        ctx.fillStyle = s.rocket ? 'rgba(255,240,200,0.95)' : c.at(((s.tint % 1) + 1) % 1, Math.min(1, s.life * 1.6))
        ctx.fillRect(s.x - size / 2, s.y - size / 2, size, size)
        // a white-hot core while the spark is young
        if (!s.rocket && s.life > 0.7) {
          ctx.fillStyle = `rgba(255,250,235,${(s.life - 0.7) * 1.5})`
          ctx.fillRect(s.x - 0.75, s.y - 0.75, 1.5, 1.5)
        }
      }
      ctx.globalCompositeOperation = 'source-over'
    })
  },
}

// --- the honeycomb -------------------------------------------------------------------------------------------

const honeycomb: Preset = {
  id: 'honeycomb',
  name: 'Honeycomb',
  blurb: 'A field of hexagons lit from the middle out - bass at the heart, highs at the edge, a ring on every beat.',
  suits: ['electronic', 'energetic'],
  create() {
    let wave = 2
    return scene((ctx, f, w, h, c) => {
      fade(ctx, w, h, 1, '6,6,12')
      const v = logBins(f.freq, 48)
      const size = Math.max(16, Math.min(w, h) / 18)
      const hw = Math.sqrt(3) * size
      const reach = Math.hypot(w, h) / 2
      wave = f.beat ? 0 : Math.min(2, wave + f.dt * 0.9)
      for (let row = -1; row * size * 1.5 < h + size; row++) {
        for (let col = -1; col * hw < w + hw; col++) {
          const x = col * hw + (row % 2 ? hw / 2 : 0)
          const y = row * size * 1.5
          const d = Math.hypot(x - w / 2, y - h / 2) / reach
          const bin = Math.min(47, Math.floor(d * 47))
          const ring = Math.max(0, 1 - Math.abs(d - wave) * 6)
          const light = Math.min(1, Math.pow(v[bin], 1.6) * 1.2 + ring * 0.6)
          ctx.beginPath()
          for (let k = 0; k < 6; k++) {
            const a = (k / 6) * TAU + Math.PI / 6
            const px = x + Math.cos(a) * size * 0.9
            const py = y + Math.sin(a) * size * 0.9
            if (k === 0) ctx.moveTo(px, py)
            else ctx.lineTo(px, py)
          }
          ctx.closePath()
          ctx.fillStyle = c.at(d * 0.8 + light * 0.2, 0.06 + light * 0.8)
          ctx.fill()
          ctx.strokeStyle = c.at(d, 0.12 + light * 0.3)
          ctx.lineWidth = 1
          ctx.stroke()
        }
      }
    })
  },
}

// --- the record ----------------------------------------------------------------------------------------------

const vinyl: Preset = {
  id: 'vinyl',
  name: 'Vinyl',
  blurb: 'A turning record that writes the music into its grooves as the needle passes - a ring of a song.',
  suits: ['acoustic', 'calm', 'any'],
  create() {
    let surface: HTMLCanvasElement | undefined
    let turn = 0
    return scene((ctx, f, w, h, c) => {
      const S = Math.round(Math.min(w, h) * 0.86)
      const fresh = !surface || surface.width !== S
      surface = buffer(S, S, surface)
      const s = surface.getContext('2d') as CanvasRenderingContext2D
      if (fresh) {
        s.fillStyle = '#0b0b0d'
        s.beginPath()
        s.arc(S / 2, S / 2, S / 2, 0, TAU)
        s.fill()
      }
      // 33 1/3 turns a minute, slowed down to a turn every ten seconds: one ring holds ten seconds of music
      const step = f.dt * (TAU / 10)
      turn += step
      const needle = -Math.PI / 2
      const inner = S * 0.17
      const outer = S * 0.48
      const bins = 72
      const v = logBins(f.freq, bins)
      s.save()
      s.translate(S / 2, S / 2)
      s.rotate(needle - turn)
      const width = Math.max(1.5, ((outer + inner) / 2) * step * 1.3)
      for (let k = 0; k < bins; k++) {
        const r0 = inner + ((outer - inner) * k) / bins
        const r1 = inner + ((outer - inner) * (k + 1)) / bins
        s.fillStyle = v[k] > 0.04 ? c.at(k / bins, Math.min(1, 0.15 + v[k] * 1.1)) : '#0b0b0d'
        s.fillRect(r0, -width / 2, r1 - r0 - 0.6, width)
      }
      s.restore()
      fade(ctx, w, h, 1, '10,9,12')
      const cx = w / 2
      const cy = h / 2
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(turn)
      ctx.drawImage(surface, -S / 2, -S / 2)
      ctx.restore()
      // the grooves' shine and the label
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'
      ctx.lineWidth = 1
      for (let r = inner; r < outer; r += 6) {
        ctx.beginPath()
        ctx.arc(cx, cy, r, -0.6, 0.6)
        ctx.stroke()
      }
      const label = ctx.createRadialGradient(cx, cy, 2, cx, cy, inner * 0.92)
      label.addColorStop(0, c.at(1))
      label.addColorStop(1, c.at(0.45))
      ctx.fillStyle = label
      ctx.beginPath()
      ctx.arc(cx, cy, inner * 0.92, 0, TAU)
      ctx.fill()
      ctx.fillStyle = '#0b0b0d'
      ctx.beginPath()
      ctx.arc(cx, cy, S * 0.012, 0, TAU)
      ctx.fill()
      // the tonearm resting on the needle's groove
      const tip = { x: cx + Math.cos(needle) * outer * 0.98, y: cy + Math.sin(needle) * outer * 0.98 }
      ctx.strokeStyle = '#c9ccd2'
      ctx.lineWidth = Math.max(3, S / 120)
      ctx.beginPath()
      ctx.moveTo(cx + S * 0.55, cy - S * 0.42)
      ctx.lineTo(tip.x + S * 0.04, tip.y - S * 0.02)
      ctx.lineTo(tip.x, tip.y)
      ctx.stroke()
      ctx.fillStyle = c.at(0.9, 0.6 + 0.4 * f.pulse)
      ctx.beginPath()
      ctx.arc(tip.x, tip.y, S / 110, 0, TAU)
      ctx.fill()
    })
  },
}

// --- the harmonograph ----------------------------------------------------------------------------------------

const harmonograph: Preset = {
  id: 'harmonograph',
  name: 'Harmonograph',
  blurb: 'Two pendulums drawing in harmony - slowly drifting ratios, the music swaying the pen.',
  suits: ['calm', 'acoustic'],
  create() {
    const RATIOS: [number, number][] = [[2, 3], [3, 4], [3, 5], [4, 5], [1, 2], [5, 6]]
    let phase = 0
    return scene((ctx, f, w, h, c) => {
      fade(ctx, w, h, 0.22)
      phase += f.dt * (0.05 + f.mid * 0.12)
      const [a, b] = RATIOS[Math.floor(f.time / 24) % RATIOS.length]
      const detune = 0.004 * Math.sin(f.time * 0.05)
      const size = Math.min(w, h) * 0.4 * (0.92 + f.bass * 0.1)
      const steps = 2400
      ctx.globalCompositeOperation = 'lighter'
      ctx.lineWidth = 1.2
      let last: [number, number] | null = null
      for (let s = 0; s <= steps; s++) {
        const t = (s / steps) * 60
        const damp = Math.exp(-t * 0.035)
        const x = Math.sin(a * t + phase) * damp + 0.25 * Math.sin((b + detune) * t * 1.5 + phase * 2) * damp
        const y = Math.sin((b + detune) * t) * damp + 0.25 * Math.cos(a * t * 1.5 + phase) * damp
        const px = w / 2 + x * size
        const py = h / 2 + y * size
        if (last && s % 12 === 0) {
          ctx.strokeStyle = c.at(s / steps, 0.12 + 0.5 * damp)
          ctx.stroke()
        }
        if (!last || s % 12 === 0) {
          ctx.beginPath()
          ctx.moveTo(last ? last[0] : px, last ? last[1] : py)
        }
        ctx.lineTo(px, py)
        last = [px, py]
      }
      ctx.stroke()
      ctx.globalCompositeOperation = 'source-over'
    })
  },
}

// --- the galaxy ----------------------------------------------------------------------------------------------

const galaxy: Preset = {
  id: 'galaxy',
  name: 'Spiral Galaxy',
  blurb: 'Thousands of stars in spiral arms - the inner ones turning faster, the arms lit by the music.',
  suits: ['calm', 'electronic', 'dark'],
  create() {
    const N = 2400
    const ARMS = 3
    const radius = new Float32Array(N)
    const angle = new Float32Array(N)
    const tint = new Float32Array(N)
    for (let i = 0; i < N; i++) {
      radius[i] = Math.pow(Math.random(), 0.7)
      const arm = i % ARMS
      angle[i] = (arm / ARMS) * TAU + radius[i] * 4.2 + (Math.random() - 0.5) * (0.5 + radius[i] * 0.6)
      tint[i] = Math.random()
    }
    let spin = 0
    return scene((ctx, f, w, h, c) => {
      fade(ctx, w, h, 0.35, '2,2,8')
      spin += f.dt * (0.15 + f.mid * 0.35)
      const v = logBins(f.freq, 32)
      const size = Math.min(w, h) * 0.48
      const tilt = 0.55 + 0.1 * Math.sin(f.time * 0.07)
      const cx = w / 2
      const cy = h / 2
      ctx.globalCompositeOperation = 'lighter'
      for (let i = 0; i < N; i++) {
        const r = radius[i]
        // differential rotation: the middle turns faster
        const a = angle[i] + spin / Math.sqrt(r + 0.08)
        const light = v[Math.min(31, Math.floor(r * 31))]
        const x = cx + Math.cos(a) * r * size
        const y = cy + Math.sin(a) * r * size * tilt
        const dot = 1 + light * 2.4
        ctx.fillStyle = c.at(tint[i] * 0.5 + r * 0.5, 0.25 + light * 0.75)
        ctx.fillRect(x - dot / 2, y - dot / 2, dot, dot)
      }
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * (0.16 + f.bass * 0.06 + f.pulse * 0.03))
      core.addColorStop(0, 'rgba(255,248,230,0.95)')
      core.addColorStop(0.4, c.at(0.9, 0.5))
      core.addColorStop(1, c.at(0.5, 0))
      ctx.fillStyle = core
      ctx.beginPath()
      ctx.ellipse(cx, cy, size * 0.3, size * 0.3 * tilt, 0, 0, TAU)
      ctx.fill()
      ctx.globalCompositeOperation = 'source-over'
    })
  },
}

/** The second twelve classics (2026-10-23). */
export const MORE_CLASSIC: Preset[] = [matrix, ledwall, vumeter, waterfall, spirograph, lava, wavetunnel, fireworks, honeycomb, vinyl, harmonograph, galaxy]
