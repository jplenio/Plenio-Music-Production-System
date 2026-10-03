/**
 * A small WebAudio player for the editor: the notes in each track's sound (``instruments.ts``: plain
 * tones, piano, strings, pad ...), scheduled a little ahead of time, and - for a cover - the source
 * recording on the same clock (``SourceSegment``s of a decoded buffer), each with its own level so that
 * A/B switches at once. No samples or soundfonts are downloaded - it works offline and never leaves the
 * machine.
 */
import { type SourceSegment, type ToneEvent, frequency } from '../../shared/playback'
import { type InstrumentId, type Sounds, type Voice, defaultSounds, startVoice } from './instruments'

const LOOKAHEAD_S = 0.25
const TICK_MS = 30
const LEVEL: Record<ToneEvent['part'], number> = {
  Vocal: 0.22,
  Ins: 0.16,
  chord: 0.045,
  click: 0.1,
  guide: 0.1
}
/** Fade at the edges of a source piece (a jump back to the chorus must not click). */
const SOURCE_FADE_S = 0.006

/** The levels of the two layers: the tones (notes, chords, clicks, Guide) and the source recording. */
export interface Levels {
  tones: number
  source: number
}

export interface PlaySource {
  buffer: AudioBuffer
  segments: SourceSegment[]
}


export class TonePlayer {
  private context: AudioContext | null = null
  private master: GainNode | null = null
  private tones: GainNode | null = null
  private sourceGain: GainNode | null = null
  private sources: AudioBufferSourceNode[] = []
  private levels: Levels = { tones: 1, source: 1 }
  private events: ToneEvent[] = []
  private next = 0
  private startedAt = 0
  private timer: ReturnType<typeof setInterval> | null = null
  private voices: { voice: Voice; end: number }[] = []
  private clicks: OscillatorNode[] = []
  private sounds: Sounds = defaultSounds()
  private onTick: ((elapsed: number) => void) | null = null
  private onEnd: (() => void) | null = null
  private length = 0

  get playing(): boolean {
    return this.timer !== null
  }

  play(
    events: ToneEvent[],
    options: {
      onTick?: (elapsed: number) => void
      onEnd?: () => void
      source?: PlaySource | null
      levels?: Levels
      length?: number
      sounds?: Sounds
    } = {}
  ): void {
    this.stop()
    const Context = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Context) throw new Error('This browser cannot play audio (no Web Audio).')
    this.context ??= new Context()
    void this.context.resume()
    const context = this.context
    this.master = context.createGain()
    this.master.gain.value = 0.8
    this.master.connect(context.destination)
    this.levels = options.levels ?? { tones: 1, source: 1 }
    this.sounds = options.sounds ?? this.sounds
    this.tones = context.createGain()
    this.tones.gain.value = this.levels.tones
    this.tones.connect(this.master)
    this.events = events
    this.length = events.reduce((end, e) => Math.max(end, e.at + e.duration), options.length ?? 0)
    this.next = 0
    this.startedAt = context.currentTime + 0.05
    const source = options.source
    if (source?.segments.length) {
      this.sourceGain = context.createGain()
      this.sourceGain.gain.value = this.levels.source
      this.sourceGain.connect(this.master)
      for (const segment of source.segments) this.playSegment(source.buffer, segment)
      this.length = Math.max(this.length, ...source.segments.map((s) => s.at + s.duration))
    }
    this.onTick = options.onTick ?? null
    this.onEnd = options.onEnd ?? null
    this.timer = setInterval(() => this.tick(), TICK_MS)
    this.tick()
  }

  /**
   * Seconds since playback started of a moment given in ``performance.now()`` milliseconds (a key of
   * a MIDI keyboard), as the listener heard it: the audio output's latency is taken out, so a key
   * played with a note one hears lands on that note.
   */
  elapsedAt(perfMs: number): number {
    const context = this.context
    if (!context) return 0
    const stamp = typeof context.getOutputTimestamp === 'function' ? context.getOutputTimestamp() : null
    if (stamp && typeof stamp.contextTime === 'number' && typeof stamp.performanceTime === 'number' && stamp.performanceTime > 0) {
      return stamp.contextTime + (perfMs - stamp.performanceTime) / 1000 - this.startedAt
    }
    const latency = (context as AudioContext & { outputLatency?: number }).outputLatency || context.baseLatency || 0
    return context.currentTime + (perfMs - performance.now()) / 1000 - latency - this.startedAt
  }

  /** The tracks' sounds from now on (the notes already scheduled keep theirs). */
  setSounds(sounds: Sounds): void {
    this.sounds = sounds
  }

  /** The layers' levels now (A/B while playing: one of them 0). */
  setLevels(levels: Levels): void {
    this.levels = levels
    const now = this.context?.currentTime ?? 0
    this.tones?.gain.setTargetAtTime(levels.tones, now, 0.01)
    this.sourceGain?.gain.setTargetAtTime(levels.source, now, 0.01)
  }

  stop(): void {
    if (this.timer !== null) clearInterval(this.timer)
    this.timer = null
    for (const node of this.sources) {
      try {
        node.stop()
      } catch {
        // not started yet or already stopped
      }
    }
    this.sources = []
    this.sourceGain?.disconnect()
    this.sourceGain = null
    this.tones?.disconnect()
    this.tones = null
    for (const { voice } of this.voices) voice.stop()
    this.voices = []
    for (const click of this.clicks) {
      try {
        click.stop()
      } catch {
        // already stopped
      }
    }
    this.clicks = []
    this.master?.disconnect()
    this.master = null
  }

  close(): void {
    this.stop()
    void this.context?.close()
    this.context = null
  }

  private tick(): void {
    const context = this.context
    if (!context || !this.master) return
    const elapsed = context.currentTime - this.startedAt
    while (this.next < this.events.length && this.events[this.next].at < elapsed + LOOKAHEAD_S) {
      this.sound(this.events[this.next])
      this.next++
    }
    this.onTick?.(Math.max(0, elapsed))
    if (elapsed > this.length + 0.1) {
      this.stop()
      this.onEnd?.()
    }
  }

  private sound(event: ToneEvent): void {
    const context = this.context
    if (!context || !this.master) return
    const start = this.startedAt + event.at
    const stop = start + Math.max(0.05, event.duration)
    const out = this.tones ?? this.master
    if (event.part !== 'click') {
      let voice: Voice
      try {
        voice = startVoice(context, out, this.sounds[event.part], event.midi, start, { level: LEVEL[event.part] })
      } catch {
        // a sound this browser cannot make: the plain tone, so the playback goes on
        try {
          voice = startVoice(context, out, 'plain', event.midi, start, { level: LEVEL[event.part] })
        } catch {
          return
        }
      }
      voice.release(stop)
      // forget the voices that have ended (they stop themselves)
      const now = context.currentTime
      this.voices = this.voices.filter((v) => v.end > now)
      this.voices.push({ voice, end: stop + 2 })
      return
    }
    const oscillator = context.createOscillator()
    oscillator.type = 'square'
    oscillator.frequency.value = frequency(event.midi)
    const gain = context.createGain()
    const level = LEVEL.click
    gain.gain.setValueAtTime(0, start)
    gain.gain.linearRampToValueAtTime(level, start + 0.002)
    gain.gain.setValueAtTime(level * 0.8, Math.max(start + 0.003, stop - 0.04))
    gain.gain.linearRampToValueAtTime(0, stop)
    oscillator.connect(gain).connect(out)
    oscillator.start(start)
    oscillator.stop(stop + 0.02)
    oscillator.onended = () => {
      this.clicks = this.clicks.filter((c) => c !== oscillator)
      gain.disconnect()
    }
    this.clicks.push(oscillator)
  }

  private playSegment(buffer: AudioBuffer, segment: SourceSegment): void {
    const context = this.context
    if (!context || !this.sourceGain || segment.duration <= 0) return
    const node = context.createBufferSource()
    node.buffer = buffer
    const fade = context.createGain()
    const start = this.startedAt + segment.at
    const stop = start + segment.duration
    fade.gain.setValueAtTime(0, start)
    fade.gain.linearRampToValueAtTime(1, start + SOURCE_FADE_S)
    fade.gain.setValueAtTime(1, Math.max(start + SOURCE_FADE_S, stop - SOURCE_FADE_S))
    fade.gain.linearRampToValueAtTime(0, stop)
    node.connect(fade).connect(this.sourceGain)
    node.start(start, Math.max(0, segment.offset), segment.duration)
    node.onended = () => {
      this.sources = this.sources.filter((n) => n !== node)
      fade.disconnect()
    }
    this.sources.push(node)
  }
}

/**
 * The keys of a MIDI keyboard, heard while they are held (many controllers have no sound of their own).
 * One tone per key; a key pressed again restarts its tone.
 */
export class KeyMonitor {
  private context: AudioContext | null = null
  private tones = new Map<number, Voice>()
  /** The sound of the keys: the recorded track's. */
  sound: InstrumentId = 'soft'

  on(midi: number, velocity = 100): void {
    const Context = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Context) return
    try {
      this.context ??= new Context()
      const context = this.context
      void context.resume()
      this.off(midi)
      this.tones.set(midi, startVoice(context, context.destination, this.sound, midi, context.currentTime, { velocity: Math.min(1, velocity / 127), level: 0.25 }))
    } catch {
      // hearing the keys is a convenience
    }
  }

  off(midi: number): void {
    const voice = this.tones.get(midi)
    const context = this.context
    if (!voice || !context) return
    this.tones.delete(midi)
    voice.release(context.currentTime)
  }

  allOff(): void {
    for (const midi of [...this.tones.keys()]) this.off(midi)
  }

  close(): void {
    for (const voice of this.tones.values()) voice.stop()
    this.tones.clear()
    void this.context?.close()
    this.context = null
  }
}

/** One short note to hear a pitch (a drawn or moved note, a key of the roll's keyboard), in ``sound``. */
let auditionContext: AudioContext | null = null
export function audition(midi: number, seconds = 0.35, sound: InstrumentId = 'soft'): void {
  const Context = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Context) return
  try {
    auditionContext ??= new Context()
    const context = auditionContext
    void context.resume()
    const start = context.currentTime + 0.01
    startVoice(context, context.destination, sound, midi, start, { level: 0.2 }).release(start + seconds)
  } catch {
    // hearing a pitch is a convenience
  }
}
