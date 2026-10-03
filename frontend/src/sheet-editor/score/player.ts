/**
 * A small WebAudio player for the editor: simple tones, scheduled a little ahead of time, and - for a
 * cover - the source recording on the same clock (``SourceSegment``s of a decoded buffer), each with its
 * own level so that A/B switches at once. No samples or soundfonts are downloaded - it works offline
 * and never leaves the machine.
 */
import { type SourceSegment, type ToneEvent, frequency } from '../../shared/playback'

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

const WAVE: Record<ToneEvent['part'], OscillatorType> = {
  Vocal: 'triangle',
  Ins: 'sine',
  chord: 'sine',
  click: 'square',
  guide: 'sine'
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
  private voices: OscillatorNode[] = []
  private onTick: ((elapsed: number) => void) | null = null
  private onEnd: (() => void) | null = null
  private length = 0

  get playing(): boolean {
    return this.timer !== null
  }

  play(
    events: ToneEvent[],
    options: { onTick?: (elapsed: number) => void; onEnd?: () => void; source?: PlaySource | null; levels?: Levels } = {}
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
    this.tones = context.createGain()
    this.tones.gain.value = this.levels.tones
    this.tones.connect(this.master)
    this.events = events
    this.length = events.reduce((end, e) => Math.max(end, e.at + e.duration), 0)
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
    for (const voice of this.voices) {
      try {
        voice.stop()
      } catch {
        // already stopped
      }
    }
    this.voices = []
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
    const oscillator = context.createOscillator()
    oscillator.type = WAVE[event.part]
    oscillator.frequency.value = frequency(event.midi)
    const gain = context.createGain()
    const level = LEVEL[event.part]
    gain.gain.setValueAtTime(0, start)
    gain.gain.linearRampToValueAtTime(level, start + (event.part === 'click' ? 0.002 : 0.012))
    gain.gain.setValueAtTime(level * 0.8, Math.max(start + 0.013, stop - 0.04))
    gain.gain.linearRampToValueAtTime(0, stop)
    oscillator.connect(gain).connect(this.tones ?? this.master)
    oscillator.start(start)
    oscillator.stop(stop + 0.02)
    oscillator.onended = () => {
      this.voices = this.voices.filter((v) => v !== oscillator)
      gain.disconnect()
    }
    this.voices.push(oscillator)
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

/** One short tone to hear a pitch (a drawn or moved note, a key of the roll's keyboard). */
let auditionContext: AudioContext | null = null
export function audition(midi: number, seconds = 0.35): void {
  const Context = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Context) return
  try {
    auditionContext ??= new Context()
    const context = auditionContext
    void context.resume()
    const start = context.currentTime + 0.01
    const oscillator = context.createOscillator()
    oscillator.type = 'triangle'
    oscillator.frequency.value = frequency(midi)
    const gain = context.createGain()
    gain.gain.setValueAtTime(0, start)
    gain.gain.linearRampToValueAtTime(0.2, start + 0.01)
    gain.gain.setValueAtTime(0.16, start + seconds - 0.06)
    gain.gain.linearRampToValueAtTime(0, start + seconds)
    oscillator.connect(gain).connect(context.destination)
    oscillator.start(start)
    oscillator.stop(start + seconds + 0.02)
    oscillator.onended = () => gain.disconnect()
  } catch {
    // hearing a pitch is a convenience
  }
}
