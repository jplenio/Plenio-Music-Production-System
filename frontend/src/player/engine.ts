/**
 * The Plenio Player's sound: two decks for gapless crossfades, each with its song's unmastered take beside
 * it for A/B (switched in step, without a gap), playback speed, a master volume, and the analysers the
 * visuals read (the mix, and left and right for the stereo scope). Built on audio elements fed into Web
 * Audio, so the browser streams the files.
 */
import { BeatDetector, band, type Frame, quietFrame } from './visuals/analysis'

interface Deck {
  main: HTMLAudioElement
  alt: HTMLAudioElement
  gain: GainNode
  mainGain: GainNode
  altGain: GainNode
  id: string | null
}

export interface DeckSource {
  id: string
  url: string
  original?: string | null
}

type Listener = () => void

/** The heard time from the playing time, the reported latency and the listener's offset (never below 0). */
export function heardTime(current: number, latency: number, offset: number): number {
  const lag = Number.isFinite(latency) && latency > 0 ? latency : 0
  return Math.max(0, current - lag - (Number.isFinite(offset) ? offset : 0))
}

export class Engine {
  private ctx: AudioContext | null = null
  private decks: Deck[] = []
  private current = 0
  private master: GainNode | null = null
  private analyser: AnalyserNode | null = null
  private left: AnalyserNode | null = null
  private right: AnalyserNode | null = null
  private freq = new Uint8Array(1024)
  private wave = new Uint8Array(2048)
  private waveL = new Uint8Array(2048)
  private waveR = new Uint8Array(2048)
  private beats = new BeatDetector()
  private started = performance.now()
  private lastFrame = performance.now()
  private listeners = new Set<Listener>()
  private endListeners = new Set<Listener>()
  /** A jump waiting for a song's length to be known (a song started at a moment): one per player, dropped
   * when the next song is loaded before it came - else that song would start at the old moment. */
  private pendingSeek = new Map<HTMLAudioElement, () => void>()
  private fading: number | null = null
  ab = false
  rate = 1
  volume = 0.85
  sensitivity = 1

  private build(): void {
    if (this.ctx) return
    const ctx = new AudioContext({ latencyHint: 'playback' })
    this.ctx = ctx
    this.master = ctx.createGain()
    this.master.gain.value = this.volume
    this.analyser = ctx.createAnalyser()
    this.analyser.fftSize = 2048
    this.analyser.smoothingTimeConstant = 0.72
    const splitter = ctx.createChannelSplitter(2)
    this.left = ctx.createAnalyser()
    this.right = ctx.createAnalyser()
    this.left.fftSize = this.right.fftSize = 2048
    this.master.connect(ctx.destination)
    this.master.connect(this.analyser)
    this.master.connect(splitter)
    splitter.connect(this.left, 0)
    splitter.connect(this.right, 1)
    for (let k = 0; k < 2; k++) this.decks.push(this.deck(ctx))
  }

  private deck(ctx: AudioContext): Deck {
    const make = () => {
      const el = new Audio()
      el.preload = 'auto'
      el.crossOrigin = 'anonymous'
      ;(el as HTMLAudioElement & { preservesPitch?: boolean }).preservesPitch = true
      return el
    }
    const main = make()
    const alt = make()
    const gain = ctx.createGain()
    const mainGain = ctx.createGain()
    const altGain = ctx.createGain()
    altGain.gain.value = 0
    ctx.createMediaElementSource(main).connect(mainGain).connect(gain)
    ctx.createMediaElementSource(alt).connect(altGain).connect(gain)
    gain.connect(this.master as GainNode)
    for (const el of [main, alt]) {
      for (const type of ['timeupdate', 'play', 'pause', 'ended', 'loadedmetadata', 'waiting', 'playing'] as const) {
        el.addEventListener(type, () => this.emit())
      }
    }
    // the song that plays came to its end (not one fading out under the next)
    main.addEventListener('ended', () => {
      if (this.deckNow?.main === main) for (const listener of this.endListeners) listener()
    })
    return { main, alt, gain, mainGain, altGain, id: null }
  }

  /** When the song that plays ends - also in a tab in the background, where the page's frames stop. */
  onEnded(listener: Listener): () => void {
    this.endListeners.add(listener)
    return () => this.endListeners.delete(listener)
  }

  on(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private emit(): void {
    for (const listener of this.listeners) listener()
  }

  private get deckNow(): Deck | undefined {
    return this.decks[this.current]
  }

  get element(): HTMLAudioElement | null {
    return this.deckNow?.main ?? null
  }

  get time(): number {
    return this.deckNow?.main.currentTime ?? 0
  }

  /** How long the sound takes from the page to the ears, as the browser reports it (seconds; 0: nothing reported).
   * A Bluetooth speaker or a television adds 100 to 250 ms that the spectrum and the playing time do not know. */
  latency(): number {
    const ctx = this.ctx
    return ctx ? Number(ctx.outputLatency || ctx.baseLatency || 0) : 0
  }

  /** The time of the song the listener hears now (phase 7.4): the lyrics, the notation's cursor and the visuals' cue
   * follow it. ``offset``: the listener's own correction, seconds (Settings › Sound › Picture and sound together). */
  heard(offset = 0): number {
    return heardTime(this.time, this.latency(), offset)
  }

  get duration(): number {
    const d = this.deckNow?.main.duration ?? 0
    return Number.isFinite(d) ? d : 0
  }

  get paused(): boolean {
    return this.deckNow?.main.paused ?? true
  }

  get songId(): string | null {
    return this.deckNow?.id ?? null
  }

  /** Load a song on the current deck (or, with ``crossfade`` seconds, on the other one, fading over). */
  async load(source: DeckSource, { autoplay = true, crossfade = 0, at = 0 } = {}): Promise<void> {
    this.build()
    const ctx = this.ctx as AudioContext
    if (ctx.state === 'suspended') await ctx.resume()
    const previous = this.deckNow as Deck
    const fade = crossfade > 0 && !previous.main.paused && previous.id !== null
    if (fade) this.current = 1 - this.current
    const deck = this.deckNow as Deck
    const waiting = this.pendingSeek.get(deck.main)
    if (waiting) deck.main.removeEventListener('loadedmetadata', waiting)
    this.pendingSeek.delete(deck.main)
    deck.id = source.id
    deck.main.src = source.url
    deck.main.playbackRate = this.rate
    deck.alt.removeAttribute('src')
    deck.alt.dataset.src = source.original ?? ''
    deck.altGain.gain.value = 0
    deck.mainGain.gain.value = 1
    if (this.ab && source.original) this.prepareAlt(deck)
    if (at > 0) {
      const jump = () => {
        this.pendingSeek.delete(deck.main)
        deck.main.currentTime = at
      }
      this.pendingSeek.set(deck.main, jump)
      deck.main.addEventListener('loadedmetadata', jump, { once: true })
    }
    const now = ctx.currentTime
    if (fade) {
      deck.gain.gain.setValueAtTime(0, now)
      deck.gain.gain.linearRampToValueAtTime(1, now + crossfade)
      previous.gain.gain.setValueAtTime(previous.gain.gain.value, now)
      previous.gain.gain.linearRampToValueAtTime(0, now + crossfade)
      if (this.fading) clearTimeout(this.fading)
      this.fading = window.setTimeout(() => {
        previous.main.pause()
        previous.alt.pause()
        previous.id = null
      }, crossfade * 1000 + 100)
    } else {
      deck.gain.gain.cancelScheduledValues(now)
      deck.gain.gain.setValueAtTime(1, now)
      for (const other of this.decks) if (other !== deck) {
        other.main.pause()
        other.alt.pause()
      }
    }
    if (autoplay) await this.play()
    this.emit()
  }

  private prepareAlt(deck: Deck): void {
    const src = deck.alt.dataset.src
    if (!src) return
    if (!deck.alt.getAttribute('src')) deck.alt.src = src
    deck.alt.playbackRate = this.rate
    deck.alt.currentTime = deck.main.currentTime
    if (!deck.main.paused) void deck.alt.play().catch(() => {})
  }

  /** Let go of a song's files (before they are moved or deleted): its deck stops and forgets them. */
  release(id: string): void {
    for (const deck of this.decks) {
      if (deck.id !== id) continue
      for (const element of [deck.main, deck.alt]) {
        element.pause()
        element.removeAttribute('src')
        element.load()
      }
      deck.id = null
    }
    this.emit()
  }

  hasOriginal(): boolean {
    return !!this.deckNow?.alt.dataset.src
  }

  /** A/B: the unmastered take in step with the master, switched in 30 ms. */
  setAB(on: boolean): void {
    this.ab = on
    const deck = this.deckNow
    if (!deck || !this.ctx) return
    const now = this.ctx.currentTime
    if (on) this.prepareAlt(deck)
    deck.mainGain.gain.setTargetAtTime(on ? 0 : 1, now, 0.01)
    deck.altGain.gain.setTargetAtTime(on && deck.alt.dataset.src ? 1 : 0, now, 0.01)
    if (!on) deck.alt.pause()
    this.emit()
  }

  async play(): Promise<void> {
    this.build()
    if (this.ctx?.state === 'suspended') await this.ctx.resume()
    const deck = this.deckNow
    if (!deck?.main.getAttribute('src')) return
    await deck.main.play().catch(() => {})
    if (this.ab && deck.alt.getAttribute('src')) {
      deck.alt.currentTime = deck.main.currentTime
      await deck.alt.play().catch(() => {})
    }
  }

  pause(): void {
    for (const deck of this.decks) {
      deck.main.pause()
      deck.alt.pause()
    }
  }

  async toggle(): Promise<void> {
    if (this.paused) await this.play()
    else this.pause()
  }

  seek(seconds: number): void {
    const deck = this.deckNow
    if (!deck) return
    const t = Math.max(0, Math.min(seconds, this.duration || seconds))
    deck.main.currentTime = t
    if (deck.alt.getAttribute('src')) deck.alt.currentTime = t
    this.emit()
  }

  setVolume(value: number): void {
    this.volume = Math.max(0, Math.min(1, value))
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.02)
    this.emit()
  }

  setRate(value: number): void {
    this.rate = value
    for (const deck of this.decks) {
      deck.main.playbackRate = value
      deck.alt.playbackRate = value
    }
    this.emit()
  }

  /** Keep the unmastered take in step (the elements drift apart a little over minutes). */
  keepInStep(): void {
    const deck = this.deckNow
    if (!deck || !this.ab || deck.main.paused || !deck.alt.getAttribute('src')) return
    if (Math.abs(deck.alt.currentTime - deck.main.currentTime) > 0.06) deck.alt.currentTime = deck.main.currentTime
  }

  private cached: Frame | null = null
  private cachedAt = 0

  /** What the visuals see now (one analysis per animation frame, however many visuals ask). */
  frame(): Frame {
    const now = performance.now()
    if (this.cached && now - this.cachedAt < 6) return this.cached
    this.cachedAt = now
    this.cached = this.analyse(now)
    return this.cached
  }

  private analyse(now: number): Frame {
    const dt = Math.min(0.1, (now - this.lastFrame) / 1000)
    this.lastFrame = now
    const time = (now - this.started) / 1000
    if (!this.analyser || !this.left || !this.right) return { ...quietFrame(), time, dt }
    this.analyser.getByteFrequencyData(this.freq)
    this.analyser.getByteTimeDomainData(this.wave)
    this.left.getByteTimeDomainData(this.waveL)
    this.right.getByteTimeDomainData(this.waveR)
    const s = this.sensitivity
    if (s !== 1) for (let i = 0; i < this.freq.length; i++) this.freq[i] = Math.min(255, this.freq[i] * s)
    const bass = Math.min(1, band(this.freq, 1, 10) * s)
    const mid = Math.min(1, band(this.freq, 10, 90) * s)
    const treble = Math.min(1, band(this.freq, 90, 500) * s * 1.4)
    const playing = !this.paused
    const beat = playing && this.beats.step(bass, time, dt)
    if (!playing) this.beats.pulse = Math.max(0, this.beats.pulse - dt * 3)
    return {
      freq: this.freq,
      wave: this.wave,
      left: this.waveL,
      right: this.waveR,
      bass,
      mid,
      treble,
      level: (bass + mid + treble) / 3,
      beat,
      pulse: this.beats.pulse,
      time,
      dt,
      playing,
    }
  }
}

export const engine = new Engine()
