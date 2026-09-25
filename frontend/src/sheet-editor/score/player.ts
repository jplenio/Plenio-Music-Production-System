/**
 * A small WebAudio player for the editor: simple tones, scheduled a little ahead of time.
 * No samples or soundfonts are downloaded - it works offline and never leaves the machine.
 */
import { type ToneEvent, frequency } from '../../shared/playback'

const LOOKAHEAD_S = 0.25
const TICK_MS = 30
const LEVEL: Record<ToneEvent['part'], number> = { Vocal: 0.22, Ins: 0.16, chord: 0.045 }
const WAVE: Record<ToneEvent['part'], OscillatorType> = { Vocal: 'triangle', Ins: 'sine', chord: 'sine' }

export class TonePlayer {
  private context: AudioContext | null = null
  private master: GainNode | null = null
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

  play(events: ToneEvent[], options: { onTick?: (elapsed: number) => void; onEnd?: () => void } = {}): void {
    this.stop()
    const Context = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Context) throw new Error('This browser cannot play audio (no Web Audio).')
    this.context ??= new Context()
    void this.context.resume()
    this.master = this.context.createGain()
    this.master.gain.value = 0.8
    this.master.connect(this.context.destination)
    this.events = events
    this.length = events.reduce((end, e) => Math.max(end, e.at + e.duration), 0)
    this.next = 0
    this.startedAt = this.context.currentTime + 0.05
    this.onTick = options.onTick ?? null
    this.onEnd = options.onEnd ?? null
    this.timer = setInterval(() => this.tick(), TICK_MS)
    this.tick()
  }

  stop(): void {
    if (this.timer !== null) clearInterval(this.timer)
    this.timer = null
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
    gain.gain.linearRampToValueAtTime(level, start + 0.012)
    gain.gain.setValueAtTime(level * 0.8, Math.max(start + 0.013, stop - 0.04))
    gain.gain.linearRampToValueAtTime(0, stop)
    oscillator.connect(gain).connect(this.master)
    oscillator.start(start)
    oscillator.stop(stop + 0.02)
    oscillator.onended = () => {
      this.voices = this.voices.filter((v) => v !== oscillator)
      gain.disconnect()
    }
    this.voices.push(oscillator)
  }
}
