/**
 * What the visuals see of the music, once per frame: the spectrum, the waveform (both channels), three
 * bands, the level, and beats - an onset of the bass energy above its recent average (as Winamp's AVS
 * "beat detection" does), with a short refractory time so one kick is one beat.
 */
import type { Cue } from './conductor'

export interface Frame {
  /** 0..255 per frequency bin (the analyser's byte spectrum). */
  freq: Uint8Array
  /** 0..255 around 128: the mix, and the left and right channel. */
  wave: Uint8Array
  left: Uint8Array
  right: Uint8Array
  bass: number
  mid: number
  treble: number
  level: number
  beat: boolean
  /** 1 right at a beat, falling to 0 (for pulses that decay). */
  pulse: number
  /** Seconds since the visual started, and since the last frame. */
  time: number
  dt: number
  playing: boolean
  /** What the song's analysis track says now (conductor.ts), when the song has one. */
  cue?: Cue
}

export class BeatDetector {
  private history: number[] = []
  private last = -1
  pulse = 0

  constructor(private readonly sensitivity = 1.35, private readonly refractory = 0.24) {}

  step(energy: number, time: number, dt: number): boolean {
    const average = this.history.length ? this.history.reduce((a, b) => a + b, 0) / this.history.length : energy
    this.history.push(energy)
    if (this.history.length > 43) this.history.shift()
    const beat = energy > 0.08 && energy > average * this.sensitivity && time - this.last > this.refractory
    if (beat) {
      this.last = time
      this.pulse = 1
    } else this.pulse = Math.max(0, this.pulse - dt * 3.2)
    return beat
  }
}

/** The mean of ``data[from..to)`` as 0..1. */
export function band(data: Uint8Array, from: number, to: number): number {
  let sum = 0
  const end = Math.min(to, data.length)
  for (let i = from; i < end; i++) sum += data[i]
  return end > from ? sum / (end - from) / 255 : 0
}

/** A silent frame (before the first sound, or with the music paused): the visuals idle gently. */
export function quietFrame(bins = 1024, size = 2048): Frame {
  const flat = new Uint8Array(size).fill(128)
  return {
    freq: new Uint8Array(bins),
    wave: flat,
    left: flat,
    right: flat,
    bass: 0,
    mid: 0,
    treble: 0,
    level: 0,
    beat: false,
    pulse: 0,
    time: 0,
    dt: 0,
    playing: false,
  }
}
