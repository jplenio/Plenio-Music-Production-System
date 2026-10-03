/**
 * The sounds of the editor's playback (owner's request 2026-10-03: piano, strings, pad ... per track).
 *
 * Every instrument is synthesized with Web Audio nodes - oscillators, custom waveforms, filters and
 * envelopes - so nothing is downloaded, it works offline and the latency stays that of a plain tone
 * (samples would mean a soundfont of several MB per instrument; VST plugins cannot run in a browser).
 * They are sketches of the real instruments, meant to tell the voices apart and to hear the music's
 * character - YuE2 renders the song itself.
 *
 * ``startVoice`` starts one note at a time ``at`` and returns a ``Voice``: ``release(when)`` lets it go
 * (the player knows the end in advance, a MIDI key does not) and ``stop()`` silences it at once.
 * Levels: every instrument is scaled to about the loudness of the plain tone (``GAIN``, measured with an
 * OfflineAudioContext: RMS of a held C4), so switching sounds keeps the mix.
 */
import { frequency } from '../../shared/playback'

export const INSTRUMENT_IDS = [
  'plain',
  'soft',
  'piano',
  'epiano',
  'strings',
  'pad',
  'organ',
  'flute',
  'voice',
  'pluck',
  'lead',
  'bass',
  'mallets'
] as const
export type InstrumentId = (typeof INSTRUMENT_IDS)[number]

export const INSTRUMENTS: Record<InstrumentId, { label: string; hint: string }> = {
  plain: { label: 'Plain', hint: 'a plain sine tone (the editor’s classic sound)' },
  soft: { label: 'Soft lead', hint: 'a soft triangle tone' },
  piano: { label: 'Piano', hint: 'a struck string that fades and darkens' },
  epiano: { label: 'Electric piano', hint: 'a bell-like electric piano (FM)' },
  strings: { label: 'Strings', hint: 'a string section: slow bow, vibrato' },
  pad: { label: 'Pad', hint: 'a slow, wide synth pad' },
  organ: { label: 'Organ', hint: 'drawbar organ' },
  flute: { label: 'Flute', hint: 'a breathy flute with vibrato' },
  voice: { label: 'Voice “ah”', hint: 'a sung “ah” (formants) - good for the Vocal track' },
  pluck: { label: 'Pluck', hint: 'a plucked string, like a guitar' },
  lead: { label: 'Synth lead', hint: 'a bright synth lead' },
  bass: { label: 'Bass', hint: 'a round bass' },
  mallets: { label: 'Mallets', hint: 'marimba / vibraphone (FM)' }
}

export function isInstrument(value: unknown): value is InstrumentId {
  return typeof value === 'string' && (INSTRUMENT_IDS as readonly string[]).includes(value)
}

/** The playing tracks and their sounds. */
export interface Sounds {
  Vocal: InstrumentId
  Ins: InstrumentId
  chord: InstrumentId
  guide: InstrumentId
}

export function defaultSounds(): Sounds {
  // the sounds of 0.4.3 and before: a triangle for the melody, sine tones for the rest
  return { Vocal: 'soft', Ins: 'plain', chord: 'plain', guide: 'plain' }
}

export function soundsOf(value: unknown): Sounds {
  const defaults = defaultSounds()
  const data = (typeof value === 'object' && value !== null ? value : {}) as Partial<Record<keyof Sounds, unknown>>
  return {
    Vocal: isInstrument(data.Vocal) ? data.Vocal : defaults.Vocal,
    Ins: isInstrument(data.Ins) ? data.Ins : defaults.Ins,
    chord: isInstrument(data.chord) ? data.chord : defaults.chord,
    guide: isInstrument(data.guide) ? data.guide : defaults.guide
  }
}

export interface Voice {
  /** Let the note go at context time ``when`` (its release follows). */
  release(when: number): void
  /** Silence it now (playback stopped). */
  stop(): void
}

/**
 * Loudness of each instrument relative to the plain tone (RMS of a held C4 at velocity 0.8, rendered
 * with an OfflineAudioContext - see docs/design/score-editor-sounds-export.md).
 */
const GAIN: Record<InstrumentId, number> = {
  plain: 1,
  soft: 1,
  piano: 1.35,
  epiano: 1.2,
  strings: 0.8,
  pad: 0.75,
  organ: 1.1,
  flute: 0.95,
  voice: 4.1,
  pluck: 0.8,
  lead: 0.75,
  bass: 0.8,
  mallets: 1.15
}

interface Recipe {
  /** Seconds of the attack ramp. */
  attack: number
  /** The level the note decays to while held (0: it fades out, a struck or plucked note). */
  sustain: number
  /** Time constant of the decay towards ``sustain`` (s). */
  decay: number
  /** Time constant of the release (s). */
  release: number
  /** Builds the sources into ``into`` (the envelope's input); returns the scheduled sources. */
  build(ctx: BaseAudioContext, into: AudioNode, f: number, at: number, velocity: number, midi: number): AudioScheduledSourceNode[]
}

// --- shared pieces ---------------------------------------------------------------------------------

const waves = new WeakMap<BaseAudioContext, Map<string, PeriodicWave>>()
/** A custom waveform from harmonic amplitudes (index 0: the fundamental), cached per context. */
function harmonics(ctx: BaseAudioContext, name: string, amplitudes: readonly number[]): PeriodicWave {
  let cache = waves.get(ctx)
  if (!cache) waves.set(ctx, (cache = new Map()))
  let wave = cache.get(name)
  if (!wave) {
    const real = new Float32Array(amplitudes.length + 1)
    const imag = new Float32Array(amplitudes.length + 1)
    amplitudes.forEach((a, i) => (imag[i + 1] = a))
    wave = ctx.createPeriodicWave(real, imag)
    cache.set(name, wave)
  }
  return wave
}

const noises = new WeakMap<BaseAudioContext, AudioBuffer>()
/** One second of white noise, cached per context. */
function noise(ctx: BaseAudioContext): AudioBuffer {
  let buffer = noises.get(ctx)
  if (!buffer) {
    buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let seed = 1
    for (let i = 0; i < data.length; i++) {
      // a fixed pseudo-random sequence: the same sound every time
      seed = (seed * 16807) % 2147483647
      data[i] = (seed / 2147483647) * 2 - 1
    }
    noises.set(ctx, buffer)
  }
  return buffer
}

function osc(ctx: BaseAudioContext, type: OscillatorType | PeriodicWave, f: number, cents = 0): OscillatorNode {
  const node = ctx.createOscillator()
  if (typeof type === 'string') node.type = type as OscillatorType
  else node.setPeriodicWave(type)
  node.frequency.value = f
  node.detune.value = cents
  return node
}

function gainOf(ctx: BaseAudioContext, value: number): GainNode {
  const node = ctx.createGain()
  node.gain.value = value
  return node
}

function filter(ctx: BaseAudioContext, type: BiquadFilterType, f: number, q = 0.7): BiquadFilterNode {
  const node = ctx.createBiquadFilter()
  node.type = type
  node.frequency.value = Math.min(f, ctx.sampleRate / 2 - 100)
  node.Q.value = q
  return node
}

/** Vibrato on ``targets`` (their detune, in cents), fading in after ``delay``. */
function vibrato(ctx: BaseAudioContext, targets: OscillatorNode[], at: number, rate: number, cents: number, delay: number): OscillatorNode {
  const lfo = osc(ctx, 'sine', rate)
  const depth = ctx.createGain()
  depth.gain.setValueAtTime(0, at)
  depth.gain.setValueAtTime(0, at + delay)
  depth.gain.linearRampToValueAtTime(cents, at + delay + 0.4)
  lfo.connect(depth)
  for (const target of targets) depth.connect(target.detune)
  return lfo
}

/** A short noise burst through a band-pass (a hammer, a key click, a pluck). */
function burst(ctx: BaseAudioContext, into: AudioNode, at: number, centre: number, level: number, length: number): AudioBufferSourceNode {
  const source = ctx.createBufferSource()
  source.buffer = noise(ctx)
  const band = filter(ctx, 'bandpass', centre, 1.2)
  const env = ctx.createGain()
  env.gain.setValueAtTime(level, at)
  env.gain.setTargetAtTime(0, at, length)
  source.connect(band).connect(env).connect(into)
  return source
}

/** Seconds a struck note rings: longer for low notes (as on a piano). */
const ring = (midi: number, base: number): number => Math.min(base * 2.5, Math.max(base * 0.3, base * 2 ** ((60 - midi) / 24)))

// --- the instruments --------------------------------------------------------------------------------

const RECIPES: Record<InstrumentId, Recipe> = {
  plain: {
    attack: 0.012,
    sustain: 0.85,
    decay: 0.4,
    release: 0.015,
    build: (ctx, into, f) => [connect(osc(ctx, 'sine', f), into)]
  },
  soft: {
    attack: 0.012,
    sustain: 0.85,
    decay: 0.4,
    release: 0.015,
    build: (ctx, into, f) => [connect(osc(ctx, 'triangle', f), into)]
  },
  piano: {
    attack: 0.003,
    sustain: 0,
    decay: 1.4,
    release: 0.09,
    build(ctx, into, f, at, velocity, midi) {
      const wave = harmonics(ctx, 'piano', [1, 0.62, 0.36, 0.27, 0.16, 0.12, 0.07, 0.06, 0.035, 0.02, 0.012, 0.008])
      // the tone darkens as it fades: a low-pass falling towards the low partials
      const tone = filter(ctx, 'lowpass', Math.min(f * (5 + 7 * velocity), 14000), 0.5)
      tone.frequency.setTargetAtTime(Math.max(f * 2.2, 400), at + 0.01, ring(midi, 0.35))
      tone.connect(into)
      const a = osc(ctx, wave, f, -1.5)
      const b = osc(ctx, wave, f, 1.5) // the string pair, slightly apart
      const pair = gainOf(ctx, 0.5)
      a.connect(pair)
      b.connect(pair)
      pair.connect(tone)
      const hammer = burst(ctx, into, at, Math.min(f * 6, 7000), 0.12 * velocity, 0.008)
      return [a, b, hammer]
    }
  },
  epiano: {
    attack: 0.002,
    sustain: 0,
    decay: 1.6,
    release: 0.12,
    build(ctx, into, f, at, velocity, midi) {
      // two-operator FM (the classic tine piano): the modulator's index falls quickly - a bright attack,
      // a round, bell-like tail
      const carrier = osc(ctx, 'sine', f)
      const modulator = osc(ctx, 'sine', f)
      const index = ctx.createGain()
      const peak = f * (1.2 + 2.2 * velocity)
      index.gain.setValueAtTime(peak, at)
      index.gain.setTargetAtTime(f * 0.25, at, ring(midi, 0.25))
      modulator.connect(index).connect(carrier.frequency)
      // at 1:1 one sideband falls on 0 Hz: a high-pass takes that offset away (as hardware FM pianos do)
      const clean = filter(ctx, 'highpass', 25, 0.7)
      clean.connect(into)
      const tine = osc(ctx, 'sine', f * 4)
      const tineLevel = ctx.createGain()
      tineLevel.gain.setValueAtTime(0.18 * velocity, at)
      tineLevel.gain.setTargetAtTime(0, at, 0.06)
      tine.connect(tineLevel).connect(clean)
      carrier.connect(clean)
      return [carrier, modulator, tine]
    }
  },
  strings: {
    attack: 0.22,
    sustain: 0.9,
    decay: 0.6,
    release: 0.2,
    build(ctx, into, f, at) {
      const tone = filter(ctx, 'lowpass', Math.min(f * 5 + 800, 6000), 0.6)
      tone.connect(into)
      const voices = [-9, 0, 8].map((cents) => osc(ctx, 'sawtooth', f, cents))
      for (const v of voices) v.connect(tone)
      const lfo = vibrato(ctx, voices, at, 5.3, 7, 0.3)
      return [...voices, lfo]
    }
  },
  pad: {
    attack: 0.5,
    sustain: 0.95,
    decay: 1,
    release: 0.45,
    build(ctx, into, f, at) {
      const cutoff = Math.min(f * 3 + 500, 4500)
      const tone = filter(ctx, 'lowpass', cutoff, 0.8)
      tone.connect(into)
      // the filter breathes slowly
      const sweep = osc(ctx, 'sine', 0.25)
      const sweepDepth = gainOf(ctx, cutoff * 0.3)
      sweep.connect(sweepDepth).connect(tone.frequency)
      const voices = [osc(ctx, 'sawtooth', f, -12), osc(ctx, 'sawtooth', f, 11), osc(ctx, 'triangle', f / 2)]
      for (const v of voices) v.connect(tone)
      void at
      return [...voices, sweep]
    }
  },
  organ: {
    attack: 0.006,
    sustain: 1,
    decay: 1,
    release: 0.025,
    build(ctx, into, f, at) {
      // drawbars 8', 4', 2 2/3', 2', 1 3/5' and a little of the higher ones
      const wave = harmonics(ctx, 'organ', [1, 0.75, 0.55, 0.5, 0.18, 0.3, 0, 0.22, 0, 0.08, 0, 0.1])
      const tone = osc(ctx, wave, f)
      const sub = osc(ctx, 'sine', f / 2) // 16'
      const subLevel = gainOf(ctx, 0.35)
      sub.connect(subLevel).connect(into)
      tone.connect(into)
      const lfo = vibrato(ctx, [tone, sub], at, 6.6, 4, 0)
      const click = burst(ctx, into, at, 3000, 0.05, 0.004)
      return [tone, sub, lfo, click]
    }
  },
  flute: {
    attack: 0.07,
    sustain: 0.85,
    decay: 0.5,
    release: 0.06,
    build(ctx, into, f, at) {
      const wave = harmonics(ctx, 'flute', [1, 0.13, 0.06, 0.02])
      const tone = osc(ctx, wave, f)
      tone.connect(into)
      const breath = ctx.createBufferSource()
      breath.buffer = noise(ctx)
      breath.loop = true
      const band = filter(ctx, 'bandpass', Math.min(f * 2, 8000), 1.5)
      const air = gainOf(ctx, 0.06)
      breath.connect(band).connect(air).connect(into)
      const lfo = vibrato(ctx, [tone], at, 4.9, 9, 0.25)
      return [tone, breath, lfo]
    }
  },
  voice: {
    attack: 0.08,
    sustain: 0.9,
    decay: 0.5,
    release: 0.09,
    build(ctx, into, f, at) {
      // a buzz through the formants of an open "ah" (about 800, 1150 and 2900 Hz)
      const source = osc(ctx, 'sawtooth', f)
      const smooth = filter(ctx, 'lowpass', 5000, 0.5)
      source.connect(smooth)
      for (const [centre, q, level] of [
        [800, 6, 1],
        [1150, 8, 0.55],
        [2900, 12, 0.18]
      ] as const) {
        const band = filter(ctx, 'bandpass', centre, q)
        const amount = gainOf(ctx, level)
        smooth.connect(band).connect(amount).connect(into)
      }
      const body = gainOf(ctx, 0.15) // a little of the buzz itself: chest
      smooth.connect(body).connect(into)
      const lfo = vibrato(ctx, [source], at, 5.4, 18, 0.22)
      return [source, lfo]
    }
  },
  pluck: {
    attack: 0.002,
    sustain: 0,
    decay: 0.7,
    release: 0.07,
    build(ctx, into, f, at, velocity, midi) {
      const tone = filter(ctx, 'lowpass', Math.min(f * (6 + 6 * velocity), 9000), 0.9)
      tone.frequency.setTargetAtTime(Math.max(f * 1.5, 250), at + 0.005, ring(midi, 0.12))
      tone.connect(into)
      const a = osc(ctx, 'sawtooth', f)
      const b = osc(ctx, 'triangle', f, 4)
      a.connect(tone)
      b.connect(tone)
      const pick = burst(ctx, into, at, Math.min(f * 8, 8000), 0.1 * velocity, 0.005)
      return [a, b, pick]
    }
  },
  lead: {
    attack: 0.01,
    sustain: 0.8,
    decay: 0.3,
    release: 0.06,
    build(ctx, into, f, at) {
      const tone = filter(ctx, 'lowpass', Math.min(f * 8, 7000), 2)
      tone.frequency.setTargetAtTime(Math.min(f * 4, 4000), at + 0.02, 0.2)
      tone.connect(into)
      const a = osc(ctx, 'square', f)
      const b = osc(ctx, 'sawtooth', f, 6)
      a.connect(tone)
      b.connect(tone)
      const lfo = vibrato(ctx, [a, b], at, 5.6, 10, 0.3)
      return [a, b, lfo]
    }
  },
  bass: {
    attack: 0.004,
    sustain: 0.45,
    decay: 0.5,
    release: 0.06,
    build(ctx, into, f, at) {
      const round = osc(ctx, 'sine', f)
      const body = osc(ctx, 'triangle', f)
      const bodyLevel = gainOf(ctx, 0.5)
      round.connect(into)
      body.connect(bodyLevel).connect(into)
      const edge = osc(ctx, 'sawtooth', f)
      const edgeTone = filter(ctx, 'lowpass', Math.min(f * 6, 2500), 1)
      edgeTone.frequency.setTargetAtTime(f * 2, at + 0.01, 0.12)
      const edgeLevel = gainOf(ctx, 0.25)
      edge.connect(edgeTone).connect(edgeLevel).connect(into)
      return [round, body, edge]
    }
  },
  mallets: {
    attack: 0.002,
    sustain: 0,
    decay: 0.8,
    release: 0.1,
    build(ctx, into, f, at, velocity, midi) {
      // FM with an inharmonic ratio: the struck bar
      const carrier = osc(ctx, 'sine', f)
      const modulator = osc(ctx, 'sine', f * 3.5)
      const index = ctx.createGain()
      index.gain.setValueAtTime(f * (1 + 1.5 * velocity), at)
      index.gain.setTargetAtTime(0, at, 0.05)
      modulator.connect(index).connect(carrier.frequency)
      carrier.connect(into)
      void midi
      return [carrier, modulator]
    }
  }
}

function connect<T extends AudioNode>(node: T, into: AudioNode): T {
  node.connect(into)
  return node
}

/**
 * Start a note of ``id`` at context time ``at`` into ``out``: ``level`` scales it (the track's mix),
 * ``velocity`` (0-1) shapes it (brighter and louder when struck harder).
 */
export function startVoice(
  ctx: BaseAudioContext,
  out: AudioNode,
  id: InstrumentId,
  midi: number,
  at: number,
  { velocity = 0.8, level = 1 }: { velocity?: number; level?: number } = {}
): Voice {
  const recipe = RECIPES[id] ?? RECIPES.plain
  const f = frequency(midi)
  // struck notes ring longer low down (the recipe's decay is for C4)
  const decay = recipe.sustain === 0 ? ring(midi, recipe.decay) : recipe.decay
  const peak = level * GAIN[id] * (0.55 + 0.45 * Math.max(0, Math.min(1, velocity)))
  const envelope = ctx.createGain()
  envelope.gain.setValueAtTime(0, at)
  envelope.gain.linearRampToValueAtTime(peak, at + recipe.attack)
  envelope.gain.setTargetAtTime(peak * recipe.sustain, at + recipe.attack, decay)
  envelope.connect(out)
  const sources = recipe.build(ctx, envelope, f, at, velocity, midi)
  for (const source of sources) source.start(at)
  let released = false
  let done = false
  const finish = (when: number) => {
    for (const source of sources) {
      try {
        source.stop(when)
      } catch {
        // already stopped
      }
    }
  }
  // the last source to end takes the envelope away
  sources[0].onended = () => {
    done = true
    envelope.disconnect()
  }
  if (recipe.sustain === 0) {
    // a struck or plucked note ends by itself even while it is held
    finish(at + recipe.attack + decay * 7)
  }
  return {
    release(when: number) {
      if (released || done) return
      released = true
      const from = Math.max(when, at + recipe.attack)
      envelope.gain.setTargetAtTime(0, from, recipe.release)
      finish(from + recipe.release * 7)
    },
    stop() {
      if (done) return
      done = true
      released = true
      const now = ctx.currentTime
      try {
        envelope.gain.cancelScheduledValues(now)
        envelope.gain.setValueAtTime(0, now)
      } catch {
        // a context that is closing
      }
      finish(now)
      envelope.disconnect()
    }
  }
}
