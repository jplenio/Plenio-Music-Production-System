// The effects track of a tutorial: sounds synthesised from noise and sines (no samples, as in the README's
// spot), placed where the recording clicked, typed, moved the camera, approved a sheet or ended a run, and
// where the edit shows a card or starts a fast-forwarded wait. Written as a 48 kHz stereo WAV exactly as
// long as the video (render.mjs).

import fs from 'node:fs'

export const RATE = 48000

// --- a small DSP kit ------------------------------------------------------------------------------

// a seeded random source, so every render of a video has the same effects
function random(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const samples = (seconds) => Math.max(1, Math.round(seconds * RATE))

function noise(rng, seconds) {
  const x = new Float32Array(samples(seconds))
  for (let i = 0; i < x.length; i++) x[i] = rng() * 2 - 1
  return x
}

// an RBJ biquad band-pass whose centre may move: `centre(i)` gives the frequency at sample i
function bandpass(x, centre, q = 1.2) {
  const y = new Float32Array(x.length)
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0
  let b0 = 0, b2 = 0, a1 = 0, a2 = 0, a0 = 1
  for (let i = 0; i < x.length; i++) {
    if (i % 32 === 0) {
      const w = (2 * Math.PI * Math.min(RATE * 0.45, Math.max(20, centre(i)))) / RATE
      const alpha = Math.sin(w) / (2 * q)
      a0 = 1 + alpha
      b0 = alpha / a0
      b2 = -alpha / a0
      a1 = (-2 * Math.cos(w)) / a0
      a2 = (1 - alpha) / a0
    }
    const v = b0 * x[i] + b2 * x2 - a1 * y1 - a2 * y2
    x2 = x1; x1 = x[i]; y2 = y1; y1 = v
    y[i] = v
  }
  return y
}

// a one-pole low-pass (a gentle top cut)
function lowpass(x, hz) {
  const k = Math.exp((-2 * Math.PI * hz) / RATE)
  const y = new Float32Array(x.length)
  let v = 0
  for (let i = 0; i < x.length; i++) y[i] = v = (1 - k) * x[i] + k * v
  return y
}

function normalise(x, peak = 1) {
  let m = 0
  for (const v of x) m = Math.max(m, Math.abs(v))
  if (m > 0) for (let i = 0; i < x.length; i++) x[i] *= peak / m
  return x
}

// attack and release (seconds) with a curve
function shape(x, attack, release, power = 2) {
  const a = samples(attack), r = samples(release)
  for (let i = 0; i < x.length; i++) {
    let e = 1
    if (i < a) e *= Math.pow(i / a, power)
    const left = x.length - 1 - i
    if (left < r) e *= Math.pow(left / r, power)
    x[i] *= e
  }
  return x
}

const decay = (x, rate) => { for (let i = 0; i < x.length; i++) x[i] *= Math.exp((-rate * i) / RATE); return x }

// a sine (or a few partials) with a pitch that may glide: `freq(t)` in Hz
function tone(seconds, freq, partials = [[1, 1]]) {
  const x = new Float32Array(samples(seconds))
  const phase = partials.map(() => 0)
  for (let i = 0; i < x.length; i++) {
    const f = freq(i / RATE)
    let v = 0
    partials.forEach(([mult, gain], k) => {
      phase[k] += (2 * Math.PI * f * mult) / RATE
      v += Math.sin(phase[k]) * gain
    })
    x[i] = v
  }
  return x
}

const add = (a, b, gain = 1, at = 0) => {
  for (let i = 0; i < b.length && at + i < a.length; i++) a[at + i] += b[i] * gain
  return a
}

// --- the sounds --------------------------------------------------------------------------------------

export function makeSounds(seed = 2026) {
  const rng = random(seed)
  const jitter = (a, b) => a + (b - a) * rng()
  return {
    // a mouse button: a short, bright tick on a soft body
    click(soft = 1) {
      const x = bandpass(noise(rng, 0.03), () => jitter(3200, 4200), 1.6)
      decay(x, 260)
      const body = decay(tone(0.03, () => jitter(1500, 1800)), 320)
      return normalise(add(normalise(x), body, 0.35), 0.9 * soft)
    },
    // a key of a keyboard: a tap with a little wood in it
    key(level = 1) {
      const x = bandpass(noise(rng, 0.045), () => jitter(1800, 3400), 1.1)
      decay(x, jitter(140, 200))
      const thock = decay(tone(0.045, () => jitter(240, 320)), 120)
      return normalise(add(normalise(x), thock, 0.45), level)
    },
    // air moving past: a band of noise sweeping up (or down), its loudness an arch
    whoosh(seconds = 0.5, from = 400, to = 2400, q = 1.4) {
      const x = noise(rng, seconds)
      const n = x.length
      const y = bandpass(x, (i) => from * Math.pow(to / from, i / n), q)
      for (let i = 0; i < n; i++) y[i] *= Math.pow(Math.sin((Math.PI * i) / n), 1.7)
      return normalise(lowpass(y, 9000))
    },
    // a soft glint where something is pointed out
    glint() {
      const f = jitter(2600, 3100)
      const x = decay(tone(0.35, () => f, [[1, 1], [2.01, 0.25], [3.02, 0.08]]), 14)
      return normalise(shape(x, 0.006, 0.08, 1.5))
    },
    // a bell-like note (a few inharmonic partials, a long decay)
    bell(freq, seconds = 1.2, rate = 4) {
      const x = tone(seconds, () => freq, [[1, 1], [2, 0.32], [2.76, 0.12], [5.4, 0.05]])
      decay(x, rate)
      return normalise(shape(x, 0.004, 0.25, 1.5))
    },
    // a soft marimba note
    mallet(freq, seconds = 0.6) {
      const x = tone(seconds, () => freq, [[1, 1], [3.9, 0.18], [9.2, 0.05]])
      decay(x, 9)
      return normalise(shape(x, 0.003, 0.15, 1.5))
    },
    // a low, round thud
    thud(freq = 70, seconds = 0.5) {
      const x = tone(seconds, (t) => freq + 40 * Math.exp(-t * 30))
      decay(x, 9)
      const knock = decay(bandpass(noise(rng, 0.06), () => 900, 0.8), 70)
      return normalise(add(normalise(x), knock, 0.25))
    },
    // a short pop (a bubble): a pitch that falls fast
    pop() {
      const x = tone(0.09, (t) => 500 + 1300 * Math.exp(-t * 28))
      decay(x, 45)
      return normalise(add(x, decay(bandpass(noise(rng, 0.09), () => 3000, 1), 70), 0.25))
    },
    // a sparkle: many small high pings
    sparkle(seconds = 0.9, count = 18) {
      const out = new Float32Array(samples(seconds))
      for (let k = 0; k < count; k++) {
        const at = samples(jitter(0, seconds * 0.65))
        const f = jitter(4200, 8800)
        const ping = decay(tone(jitter(0.08, 0.22), () => f), jitter(18, 40))
        add(out, ping, jitter(0.3, 1), at)
      }
      return normalise(out)
    },
    // tape speeding up: a short rising whirr where a wait starts to play faster
    zip(seconds = 0.32) {
      const x = noise(rng, seconds)
      const n = x.length
      const y = bandpass(x, (i) => 300 * Math.pow(12, i / n), 3)
      const whirr = tone(seconds, (t) => 90 * Math.pow(6, t / seconds))
      for (let i = 0; i < n; i++) {
        const e = Math.pow(i / n, 1.4) * Math.pow(1 - i / n, 0.6)
        y[i] = (y[i] * 0.8 + whirr[i] * 0.12) * e
      }
      return normalise(y)
    },
    // a big soft hit for the title card: a low boom with air, and a little room
    impact() {
      const n = samples(1.8)
      const boom = decay(tone(1.8, (t) => 38 + 30 * Math.exp(-t * 8)), 3)
      const air = decay(bandpass(noise(rng, 1.8), () => 5000, 0.6), 3.2)
      const body = decay(bandpass(noise(rng, 0.4), () => 300, 0.7), 12)
      const x = new Float32Array(n)
      add(x, boom, 1)
      add(x, air, 0.18)
      add(x, body, 0.5)
      return normalise(shape(x, 0.002, 0.4, 1.5))
    },
    // a slow shimmer under a card
    shimmer(seconds = 3) {
      const x = tone(seconds, () => 1, [[2637, 1], [3136, 0.7], [3951, 0.5], [5274, 0.25]].map(([f, g]) => [f, g]))
      const n = x.length
      for (let i = 0; i < n; i++) x[i] *= (0.6 + 0.4 * Math.sin((2 * Math.PI * 0.7 * i) / RATE)) * Math.exp((-0.9 * i) / RATE)
      return normalise(shape(x, 0.3, 1.0, 1.5))
    },
  }
}

// --- a room ---------------------------------------------------------------------------------------------

// a small Schroeder reverb (four combs, two all-passes) for the bell-like sounds
function reverb(x, seconds = 1.2, wet = 0.22) {
  const out = new Float32Array(x.length + samples(seconds))
  const combs = [1557, 1617, 1491, 1422].map((d) => ({ d, buf: new Float32Array(d), i: 0, fb: Math.pow(0.001, d / (seconds * RATE)) }))
  const alls = [225, 556].map((d) => ({ d, buf: new Float32Array(d), i: 0 }))
  for (let n = 0; n < out.length; n++) {
    const input = n < x.length ? x[n] : 0
    let s = 0
    for (const c of combs) {
      const v = c.buf[c.i]
      c.buf[c.i] = input + v * c.fb
      c.i = (c.i + 1) % c.d
      s += v
    }
    s /= combs.length
    for (const a of alls) {
      const v = a.buf[a.i]
      const y = -0.5 * s + v
      a.buf[a.i] = s + 0.5 * y
      a.i = (a.i + 1) % a.d
      s = y
    }
    out[n] = (n < x.length ? x[n] : 0) + s * wet
  }
  return out
}

// --- the mix ----------------------------------------------------------------------------------------------

// A stereo bus of `frames` samples; place(mono, t, gain, pan) adds a sound at t seconds.
export function bus(frames) {
  const left = new Float32Array(frames), right = new Float32Array(frames)
  const place = (sound, t, gain = 1, pan = 0) => {
    const at = Math.round(t * RATE)
    const l = Math.cos(((pan + 1) * Math.PI) / 4) * gain, r = Math.sin(((pan + 1) * Math.PI) / 4) * gain
    for (let i = Math.max(0, -at); i < sound.length && at + i < frames; i++) {
      left[at + i] += sound[i] * l
      right[at + i] += sound[i] * r
    }
  }
  return { left, right, place }
}

// every effect's level below is relative to MASTER: subtle under the voice (-16 LUFS), but heard
const MASTER = 6
const dB = (db) => Math.pow(10, (db + MASTER) / 20)

// The cue sheet: `events` are { t (edit time), kind, ... } (render.mjs maps the recording's sfx markers and
// adds the cards and the fast-forwarded waits). Returns the bus.
export function effects(events, duration, { seed = 2026 } = {}) {
  const frames = Math.round(duration * RATE)
  const out = bus(frames)
  const s = makeSounds(seed)
  const rng = random(seed + 1)
  const pan = () => (rng() - 0.5) * 0.5
  let lastClick = -1
  const sorted = [...events].sort((a, b) => a.t - b.t)
  for (const e of sorted) {
    const t = e.t
    switch (e.kind) {
      case 'click':
        out.place(s.click(), t, dB(-27), 0.15)
        if (e.count > 1) out.place(s.click(0.8), t + 0.09, dB(-28), 0.15)
        lastClick = t
        break
      case 'press':
        out.place(s.click(0.9), t, dB(-28), 0.15)
        lastClick = t
        break
      case 'release':
        out.place(s.click(0.7), t, dB(-30), 0.15)
        break
      case 'key':
        out.place(s.key(), t, dB(-25), 0.25)
        break
      case 'type': {
        const step = (e.delay ?? 45) / 1000 / (e.speed ?? 1)
        for (let i = 0; i < e.chars; i++) out.place(s.key(0.7 + rng() * 0.3), t + i * step + (rng() - 0.5) * step * 0.25, dB(-31), 0.25)
        break
      }
      case 'fly': {
        const seconds = Math.min(1.4, Math.max(0.45, (e.ms ?? 1000) / 1000 / (e.speed ?? 1)))
        out.place(s.whoosh(seconds, 300, 1600, 1.1), t, dB(-36), pan())
        break
      }
      case 'spot':
        if (t - lastClick > 0.5) out.place(s.glint(), t + 0.05, dB(-38), 0.3)
        break
      case 'open':
        out.place(s.whoosh(0.32, 500, 3200, 1.3), t - 0.12, dB(-32), 0)
        out.place(s.pop(), t + 0.12, dB(-32), 0)
        break
      case 'approve': {
        // a confirming stamp and two rising bell notes
        out.place(s.thud(80, 0.4), t + 0.02, dB(-26), 0)
        const a = reverb(s.bell(880, 1.0, 5), 1.1, 0.25), b = reverb(s.bell(1318.5, 1.3, 4), 1.2, 0.25)
        out.place(a, t + 0.04, dB(-28), -0.1)
        out.place(b, t + 0.16, dB(-29), 0.1)
        break
      }
      case 'stop': {
        // the run waits for review: two soft notes, falling
        out.place(reverb(s.mallet(784, 0.7), 1.0, 0.2), t, dB(-27), -0.1)
        out.place(reverb(s.mallet(587.3, 0.9), 1.0, 0.2), t + 0.18, dB(-27), 0.1)
        break
      }
      case 'done': {
        // the run is finished: three rising notes and a sparkle
        ;[1046.5, 1318.5, 1568].forEach((f, i) => out.place(reverb(s.bell(f, 1.2, 4.5), 1.2, 0.25), t + i * 0.11, dB(-29), -0.2 + i * 0.2))
        out.place(s.sparkle(1.0, 16), t + 0.3, dB(-36), 0)
        break
      }
      case 'ff':
        out.place(s.zip(), t - 0.05, dB(-34), 0)
        break
      case 'card-title':
        out.place(s.whoosh(0.7, 250, 2200, 1.0), t - 0.25, dB(-30), 0)
        out.place(s.impact(), t + 0.02, dB(-24), 0)
        out.place(s.shimmer(Math.min(4, Math.max(2, e.seconds - 1))), t + 0.6, dB(-40), 0)
        out.place(s.sparkle(1.2, 22), t + 0.55, dB(-38), 0)
        break
      case 'card-chapter': {
        out.place(s.whoosh(0.5, 400, 3000, 1.2), t - 0.05, dB(-30), -0.2)
        out.place(s.pop(), t + 0.3, dB(-30), 0)
        for (let i = 0; i < (e.steps ?? 0); i++) out.place(s.click(0.6), t + 0.95 + i * 0.12, dB(-33), -0.4 + (0.8 * i) / Math.max(1, e.steps - 1))
        break
      }
      case 'card-showcase': {
        // a soft whoosh with every picture, then the name rises in
        const step = e.step ?? 2.8
        for (let i = 0; i < (e.steps ?? 0); i++) out.place(s.whoosh(0.6, 300, 2600, 1.0), t + i * step - 0.15, dB(-33), i % 2 ? 0.25 : -0.25)
        const end = t + (e.steps ?? 0) * step
        out.place(s.impact(), end + 0.02, dB(-27), 0)
        out.place(s.shimmer(3), end + 0.4, dB(-41), 0)
        out.place(s.sparkle(1.2, 22), end + 0.35, dB(-38), 0)
        break
      }
      case 'card-overview': {
        out.place(s.whoosh(0.5, 400, 3000, 1.2), t - 0.05, dB(-30), 0)
        for (let i = 0; i < (e.steps ?? 0); i++) out.place(s.pop(), t + 0.9 + i * 0.45, dB(-32), -0.3 + (0.6 * i) / Math.max(1, e.steps - 1))
        break
      }
      case 'card-end':
        out.place(s.whoosh(0.6, 300, 2400, 1.1), t - 0.05, dB(-30), 0)
        ;[784, 1046.5, 1318.5, 1568].forEach((f, i) => out.place(reverb(s.bell(f, 1.4, 3.5), 1.4, 0.3), t + 0.35 + i * 0.14, dB(-31), -0.3 + i * 0.2))
        out.place(s.sparkle(1.4, 24), t + 0.6, dB(-37), 0)
        break
    }
  }
  return out
}

// a 24-bit WAV of the bus (or of a mono track: `right` null)
export function writeWav(file, left, right = null) {
  const channels = right ? 2 : 1
  const frames = left.length
  const data = Buffer.alloc(frames * channels * 3)
  let o = 0
  for (let i = 0; i < frames; i++) {
    for (let c = 0; c < channels; c++) {
      const v = Math.max(-1, Math.min(1, c === 0 ? left[i] : right[i]))
      const n = Math.round(v * 8388607)
      data.writeIntLE(n, o, 3)
      o += 3
    }
  }
  const head = Buffer.alloc(44)
  head.write('RIFF', 0)
  head.writeUInt32LE(36 + data.length, 4)
  head.write('WAVE', 8)
  head.write('fmt ', 12)
  head.writeUInt32LE(16, 16)
  head.writeUInt16LE(1, 20)
  head.writeUInt16LE(channels, 22)
  head.writeUInt32LE(RATE, 24)
  head.writeUInt32LE(RATE * channels * 3, 28)
  head.writeUInt16LE(channels * 3, 32)
  head.writeUInt16LE(24, 34)
  head.write('data', 36)
  head.writeUInt32LE(data.length, 40)
  fs.writeFileSync(file, Buffer.concat([head, data]))
}
