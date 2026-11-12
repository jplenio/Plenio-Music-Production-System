/**
 * A song as an MP4 video (owner's request 2026-10-16): every frame drawn here - the visual from the song's
 * own sound (offline.ts), the lyrics, the notation, a title card, the song in a corner, a progress bar - then
 * encoded as H.264 by the browser (WebCodecs, on the graphics card where it can) and sent to the player's
 * server in pieces, which puts it together with the song's sound into an MP4 (plenio/player/video.py).
 *
 * And more to choose (owner's request 2026-10-18): the cover always in the picture - in its place, size and
 * shape (also a spinning record), pulsing with the beat; the lyrics word by word, in a place of their own or a
 * new place every line, coming in with a fade, a rise, a zoom, a drop, a blur, a wipe or a glitch - in one
 * beat when they follow it; and the title, the lyrics and the cover drawn into a Plenio Drop visual's smoke.
 *
 * And the visuals planned over the video (owner's request 2026-10-25, plan.ts): one all the way, a new one at
 * every section or every so many seconds - each chosen, or one at random from a seed - changing on the beat if
 * wished; and looks (looks.ts): the cover glowing from behind, the picture breathing with the beat, a vignette,
 * grain, cinema bars, the section's name, fades from and to black, an end card, colours that change with the
 * visual, how strongly the visuals react.
 */
import { api, media, type SongDetail, type SongSummary } from '../api'
import { paletteFrom, songHue } from '../colors'
import { fontOf, litColor, lyricsWithDefaults, type LyricsStyle } from '../lyricsStyle'
import { linesFor, type LyricsVersion, versionOf } from '../lyricsVersion'
import { settings } from '../store'
import { lineAt, sectionAt, sectionName, sectionsInSong, songAnchors, type TimedSection } from '../timing'
import { chooseVisual, songMoods } from '../visuals/chooser'
import { DropRenderer } from '../visuals/drop/renderer'
import { gpuSupport, offeredForVideo } from '../visuals/gpu'
import { NovaRenderer } from '../visuals/nova/renderer'
import { storySprites, tellRenderer, textPicture } from '../visuals/drop/story'
import { SceneMixer, fadeWithDefaults, type FadeStyle } from '../visuals/mixer'
import { allPresets, makeColors, presetById, type Scheme } from '../visuals/presets'
import { DEFAULT_LOOK, LookCache, barHeight, drawBackdrop, drawBars, drawBeatZoom, drawBlack, drawEndCard, drawGrain, drawSectionName, drawVignette, endCardSeconds, fadeAt, lookWithDefaults, type Look } from './looks'
import { NotationStrip } from './notationStrip'
import { OfflineAnalysis } from './offline'
import { resolvePlan, slotAt, slotsOf, type RandomFrom, type Slot } from './plan'
import { drawCorner, drawCoverBadge, drawCredit, drawMovingLyrics, drawProgress, drawTitleCard, drawWords, type CoverLook, type Entrance, type LyricsLook, type LyricsPlace, type TitleInfo } from './overlay'

export interface VideoOptions {
  width: number
  height: number
  fps: number
  /** The part of the song: from ``start`` for ``length`` seconds (0: to the end). */
  start: number
  length: number
  take: 'master' | 'original'
  /** A visual (its id), or ``''``: as the visuals' settings choose for this song. */
  visual: string
  /** Another visual: never, at every section of the song, or every ``interval`` seconds. */
  change: 'never' | 'section' | 'interval'
  interval: number
  /** The visual chosen for each section or span (by its place; ``''``: at random) - kept per song. */
  picks: string[]
  /** Where the random ones come from: the visuals ticked in the visuals' settings, every visual, or those that suit
   * the song; and the seed they are drawn with (the same seed, the same visuals). */
  randomFrom: RandomFrom
  seed: number
  /** Sections of one name (every chorus) show the same visual. */
  repeats: boolean
  /** A change waits for the next beat (at most a second and a half). */
  changeOnBeat: boolean
  /** More for the look (looks.ts). */
  look: Look
  /** How one visual turns into the next, and over how many seconds (owner's request 2026-10-18: softly). */
  fade: FadeStyle
  fadeSeconds: number
  scheme: Scheme
  lyrics: 'off' | 'subtitles' | 'karaoke' | 'words'
  /** The lyrics' font, colour, size and effect (at first the player's own). */
  lyricsStyle: LyricsStyle
  /** The lyrics as written, or as the take sings them (at first what the song shows in the player). */
  lyricsVersion: LyricsVersion
  /** Where the lyrics stand (``random``: a new place every line), how each line comes in, and whether it comes
   * in one beat and pulses with the beat. */
  lyricsPlace: LyricsPlace
  lyricsIn: Entrance
  onBeat: boolean
  /** The cover always in the picture: whether, where, how large, its shape, a pulse on the beat. */
  cover: CoverLook & { show: boolean }
  /** Drawn into a Plenio Drop visual's smoke (melting and swirling with it): the title at the start, the line
   * sung, the cover; over another visual, as a glow. */
  into: { title: boolean; lyrics: boolean; cover: boolean }
  notation: boolean
  title: boolean
  corner: boolean
  progress: boolean
  credit: boolean
  /** How much picture per second (owner's request 2026-10-29: more steps, a bitrate of one's own): a level, or
   * ``custom`` - ``bitrate`` Mbit/s, kept the same all the way with ``constant``. */
  quality: Quality
  bitrate: number
  constant: boolean
  /** A full picture every so many seconds (between them only what changed): shorter seeks better, longer is
   * smaller. */
  keyframes: number
  /** The browser's encoder: as it likes, the graphics card's, or the processor's. */
  encoder: 'auto' | 'hardware' | 'software'
  /** The sound as AAC, kbit/s. */
  audio: number
}

export type Quality = 'low' | 'medium' | 'standard' | 'high' | 'very-high' | 'best' | 'custom'

/** The quality levels: bits per pixel and frame of the H.264 stream (the encoder aims at that rate on average). */
export const QUALITIES: { id: Quality; label: string; factor: number }[] = [
  { id: 'low', label: 'Low - the smallest file', factor: 0.035 },
  { id: 'medium', label: 'Medium', factor: 0.055 },
  { id: 'standard', label: 'Standard', factor: 0.085 },
  { id: 'high', label: 'High', factor: 0.15 },
  { id: 'very-high', label: 'Very high', factor: 0.25 },
  { id: 'best', label: 'Best - the largest file', factor: 0.4 },
  { id: 'custom', label: 'A bitrate of your own …', factor: 0 },
]
export const BITRATE_LIMITS = { min: 0.5, max: 200 }
export const KEYFRAMES = [1, 2, 4, 8]
export const AUDIO_RATES = [128, 192, 256, 320]

/** The video's bitrate in bit/s: from the level, or the one chosen. */
export function videoBitrate(options: Pick<VideoOptions, 'width' | 'height' | 'fps' | 'quality' | 'bitrate'>): number {
  if (options.quality === 'custom') return Math.round(Math.min(BITRATE_LIMITS.max, Math.max(BITRATE_LIMITS.min, options.bitrate)) * 1e6)
  const factor = QUALITIES.find((q) => q.id === options.quality)?.factor ?? 0.085
  return Math.round(options.width * options.height * options.fps * factor)
}

/** About how large the MP4 gets (bytes): a variable rate stays below its aim on average, a constant one keeps it. */
export function videoSize(options: Pick<VideoOptions, 'width' | 'height' | 'fps' | 'quality' | 'bitrate' | 'constant' | 'audio'>, seconds: number): number {
  const constant = options.quality === 'custom' && options.constant
  return ((videoBitrate(options) * (constant ? 1 : 0.75) + options.audio * 1000) * seconds) / 8
}

const ENTRANCE_IDS: Entrance[] = ['none', 'fade', 'rise', 'zoom', 'drop', 'blur', 'wipe', 'glitch', 'random']
export const COVER_PLACES: CoverLook['place'][] = ['top-left', 'top', 'top-right', 'left', 'center', 'right', 'bottom-left', 'bottom', 'bottom-right', 'drift']

export const SIZES: { id: string; label: string; width: number; height: number }[] = [
  { id: '1080p', label: '1920 × 1080 - Full HD, 16:9', width: 1920, height: 1080 },
  { id: '720p', label: '1280 × 720 - HD, 16:9', width: 1280, height: 720 },
  { id: '1440p', label: '2560 × 1440 - QHD, 16:9', width: 2560, height: 1440 },
  { id: '4k', label: '3840 × 2160 - 4K, 16:9', width: 3840, height: 2160 },
  { id: 'square', label: '1080 × 1080 - square', width: 1080, height: 1080 },
  { id: 'square-4k', label: '2160 × 2160 - square, 4K', width: 2160, height: 2160 },
  { id: 'portrait', label: '1080 × 1350 - 4:5 (an Instagram post)', width: 1080, height: 1350 },
  { id: 'vertical', label: '1080 × 1920 - upright (Shorts, Reels, TikTok)', width: 1080, height: 1920 },
  { id: 'vertical-720', label: '720 × 1280 - upright, small', width: 720, height: 1280 },
  { id: 'vertical-4k', label: '2160 × 3840 - upright, 4K', width: 2160, height: 3840 },
]

export const DEFAULT_VIDEO: VideoOptions = {
  width: 1920,
  height: 1080,
  fps: 30,
  start: 0,
  length: 0,
  take: 'master',
  visual: '',
  change: 'never',
  interval: 20,
  picks: [],
  randomFrom: 'pool',
  seed: 1,
  repeats: true,
  changeOnBeat: true,
  look: DEFAULT_LOOK,
  fade: 'blend',
  fadeSeconds: 3,
  scheme: 'song',
  lyrics: 'subtitles',
  lyricsStyle: lyricsWithDefaults(null),
  lyricsVersion: 'written',
  lyricsPlace: 'bottom',
  lyricsIn: 'fade',
  onBeat: true,
  cover: { show: false, place: 'bottom-right', size: 0.2, shape: 'rounded', pulse: true },
  into: { title: false, lyrics: false, cover: false },
  notation: false,
  title: true,
  corner: true,
  progress: true,
  credit: true,
  quality: 'standard',
  bitrate: 12,
  constant: false,
  keyframes: 2,
  encoder: 'auto',
  audio: 192,
}

/** Saved video settings, checked. */
export function videoWithDefaults(raw: unknown, lyrics?: unknown, version?: unknown): VideoOptions {
  const given = (raw && typeof raw === 'object' ? raw : {}) as Partial<VideoOptions> & { eachSection?: boolean }
  const out = { ...DEFAULT_VIDEO, ...given, start: 0, length: 0 }
  // settings of before: a new visual at every section
  if (given.change === undefined && given.eachSection) out.change = 'section'
  delete (out as { eachSection?: boolean }).eachSection
  if (!['never', 'section', 'interval'].includes(out.change)) out.change = 'never'
  out.interval = Math.min(600, Math.max(3, Number(out.interval) || 20))
  out.picks = Array.isArray(given.picks) ? given.picks.map((p) => (typeof p === 'string' ? p : '')).slice(0, 400) : []
  if (!['pool', 'all', 'match'].includes(out.randomFrom)) out.randomFrom = 'pool'
  out.seed = Number.isInteger(out.seed) && out.seed >= 0 ? out.seed : 1
  out.repeats = out.repeats !== false
  out.changeOnBeat = out.changeOnBeat !== false
  out.look = lookWithDefaults(given.look)
  const fade = fadeWithDefaults(out.fade, out.fadeSeconds)
  out.fade = fade.style
  out.fadeSeconds = fade.seconds
  out.lyricsStyle = lyricsWithDefaults(given.lyricsStyle ?? lyrics)
  out.lyricsVersion = versionOf(given.lyricsVersion ?? version)
  if (!SIZES.some((s) => s.width === out.width && s.height === out.height)) Object.assign(out, { width: 1920, height: 1080 })
  if (![24, 25, 30, 50, 60].includes(out.fps)) out.fps = 30
  if (!['off', 'subtitles', 'karaoke', 'words'].includes(out.lyrics)) out.lyrics = 'subtitles'
  if (!['bottom', 'middle', 'top', 'random'].includes(out.lyricsPlace)) out.lyricsPlace = 'bottom'
  if (!ENTRANCE_IDS.includes(out.lyricsIn)) out.lyricsIn = 'fade'
  out.onBeat = out.onBeat !== false
  const cover = { ...DEFAULT_VIDEO.cover, ...(given.cover && typeof given.cover === 'object' ? given.cover : {}) }
  if (!COVER_PLACES.includes(cover.place)) cover.place = 'bottom-right'
  if (!['square', 'rounded', 'round', 'record'].includes(cover.shape)) cover.shape = 'rounded'
  cover.size = Math.min(0.6, Math.max(0.08, Number(cover.size) || 0.2))
  cover.show = !!cover.show
  cover.pulse = cover.pulse !== false
  out.cover = cover
  const into = (given.into && typeof given.into === 'object' ? given.into : {}) as Partial<VideoOptions['into']>
  out.into = { title: !!into.title, lyrics: !!into.lyrics, cover: !!into.cover }
  if (!QUALITIES.some((q) => q.id === out.quality)) out.quality = 'standard'
  out.bitrate = Math.min(BITRATE_LIMITS.max, Math.max(BITRATE_LIMITS.min, Number(out.bitrate) || DEFAULT_VIDEO.bitrate))
  out.constant = out.constant === true
  if (!KEYFRAMES.includes(out.keyframes)) out.keyframes = DEFAULT_VIDEO.keyframes
  if (!['auto', 'hardware', 'software'].includes(out.encoder)) out.encoder = 'auto'
  if (!AUDIO_RATES.includes(out.audio)) out.audio = DEFAULT_VIDEO.audio
  return out
}

// --- the song's sound ------------------------------------------------------------------------------------

export interface Sound {
  left: Float32Array
  right: Float32Array
  rate: number
  duration: number
}

let decoded: { key: string; sound: Sound } | null = null

/** The song's audio, decoded (the last one is kept: the preview and the video use it again). */
export async function soundOf(song: SongSummary, take: 'master' | 'original'): Promise<Sound> {
  const kind = take === 'original' && song.has.original ? 'original' : 'audio'
  const key = `${song.id}/${kind}`
  if (decoded?.key === key) return decoded.sound
  const response = await fetch(media(song.id, kind))
  if (!response.ok) throw new Error(`the song's audio could not be read (${response.status})`)
  const data = await response.arrayBuffer()
  const context = new OfflineAudioContext(2, 1, 48000)
  const buffer = await context.decodeAudioData(data)
  const left = buffer.getChannelData(0)
  const right = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : left
  const sound = { left, right, rate: buffer.sampleRate, duration: buffer.duration }
  decoded = { key, sound }
  return sound
}

// --- the frames ------------------------------------------------------------------------------------------

function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = url
  })
}

/** Draws the video's frames, one after the other (the visuals have memory: trails, beats). */
export class Composer {
  readonly canvas: HTMLCanvasElement
  private readonly ctx: CanvasRenderingContext2D
  private readonly analysis: OfflineAnalysis
  private readonly mixer: SceneMixer
  private drop: DropRenderer | null | undefined
  private nova: NovaRenderer | null | undefined
  /** The slot whose visual shows, and when it changed (the visual's clock). */
  private slot = -1
  private readonly look: { stack: string; weight: number; lit: string }
  private readonly sections: TimedSection[]
  /** The plan: the slots of the part and each one's visual. */
  readonly slots: Slot[]
  readonly plan: string[]
  private readonly looks = new LookCache()
  /** The lines drawn: as written or as sung; the sections and the notation follow the written ones. */
  private readonly shown: SongDetail['lines']
  private readonly hue: number
  private readonly accent: string
  readonly length: number

  private constructor(
    private readonly song: SongSummary,
    detail: SongDetail,
    private readonly sound: Sound,
    readonly options: VideoOptions,
    private readonly strip: NotationStrip | null,
    private readonly info: TitleInfo,
    width: number,
    height: number
  ) {
    this.canvas = document.createElement('canvas')
    this.canvas.width = width
    this.canvas.height = height
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D
    this.analysis = new OfflineAnalysis(sound, options.fps, settings.visuals.sensitivity * options.look.reactivity)
    this.mixer = new SceneMixer((preset) =>
      preset.create({ drop: { renderer: () => this.dropRenderer(), scale: 1 }, nova: { renderer: () => this.novaRenderer(), scale: 1 } })
    )
    this.sections = sectionsInSong(detail.notation.sections, songAnchors(detail.lines, detail.notation), detail.notation.warp, sound.duration)
    this.shown = linesFor(detail, options.lyricsVersion)
    this.hue = songHue(song.id, song.genre)
    this.accent = paletteFrom(this.hue).accent
    const font = fontOf(options.lyricsStyle)
    this.look = { ...font, lit: litColor(options.lyricsStyle, this.accent) }
    const rest = Math.max(0, sound.duration - options.start)
    this.length = options.length > 0 ? Math.min(options.length, rest) : rest
    const plan = planOf(song, options, this.sections, this.length)
    this.slots = plan.slots
    this.plan = plan.visuals
  }

  /** ``scale``: smaller than the video, for a preview. */
  static async create(song: SongSummary, detail: SongDetail, sound: Sound, options: VideoOptions, scale = 1): Promise<Composer> {
    const width = Math.round((options.width * scale) / 2) * 2
    const height = Math.round((options.height * scale) / 2) * 2
    const upright = height > width * 1.2
    const strip = options.notation && detail.notation.abc ? await NotationStrip.create(detail.notation, detail.lines, upright ? 760 : 1100) : null
    // the cover for the title card, the corner, the visual's pictures
    const cover = song.has.cover ? await loadImage(media(song.id, 'cover')) : null
    const subtitle = song.other
      ? [song.artist, song.album].filter(Boolean).join(' · ') || 'Other music'
      : [song.genre.split(',')[0], song.model || 'Plenio'].filter(Boolean).join(' · ')
    const info: TitleInfo = { title: song.title, subtitle, cover: options.title ? cover : null, accent: paletteFrom(songHue(song.id, song.genre)).accent, image: cover }
    return new Composer(song, detail, sound, options, strip, info, width, height)
  }

  get total(): number {
    return Math.max(1, Math.ceil(this.length * this.options.fps))
  }

  private disposed = false

  /** Give back what the frames needed - the Drop and Nova renderers' graphics memory, the mixer's pictures, the
   * canvas - when the video or the preview is done (owner's report 2026-10-28: "out of memory" now and then). */
  dispose(): void {
    this.disposed = true
    this.drop?.dispose()
    this.drop = null
    this.nova?.dispose()
    this.nova = null
    this.mixer.dispose()
    this.canvas.width = 0
    this.canvas.height = 0
  }

  private dropRenderer(): DropRenderer | null {
    // a context the graphics card took back is made anew (the next frames draw again)
    if (this.drop?.lost && !this.disposed) this.drop = undefined
    if (this.drop === undefined) {
      try {
        this.drop = new DropRenderer()
        // a change of Drop preset glides as long as the video's crossfade
        this.drop.blendSeconds = this.options.fade === 'cut' ? 0.05 : this.options.fadeSeconds
      } catch {
        this.drop = null
      }
    }
    return this.drop
  }

  /** The video's own Nova renderer (it compiles a visual at once: no frame waits for it). */
  private novaRenderer(): NovaRenderer | null {
    if (this.nova?.lost && !this.disposed) this.nova = undefined
    if (this.nova === undefined) {
      try {
        this.nova = gpuSupport().webgl ? new NovaRenderer() : null
      } catch {
        this.nova = null
      }
    }
    return this.nova
  }

  /** The visual for this moment, as planned: a new slot changes it - on the next beat when wished (at most a second
   * and a half after the slot's start). */
  private pick(t: number, beat: boolean): void {
    const due = Math.max(0, slotAt(this.slots, t))
    if (due === this.slot && this.mixer.preset) return
    const late = t - (this.slots[due]?.start ?? t)
    if (this.mixer.preset && this.options.changeOnBeat && !beat && late < 1.5) return
    this.slot = due
    const id = this.plan[due] || this.plan[0]
    // the change as the video's crossfade says: both visuals play on while the new one comes in
    const preset = presetById(id)
    this.mixer.use(preset && offeredForVideo(preset) ? preset : allPresets().find(offeredForVideo) ?? allPresets()[0], { style: this.options.fade, seconds: this.options.fadeSeconds })
  }

  /** The colours now: the scheme chosen - or another one at every change of the visual. */
  private scheme(): Scheme {
    if (!this.options.look.cycleColors || this.slot <= 0) return this.options.scheme
    const start = SCHEMES.indexOf(this.options.scheme)
    return SCHEMES[(Math.max(0, start) + this.slot) % SCHEMES.length]
  }

  /** Over a visual that is not Plenio Drop, the song's title, line and cover chosen into it - as a glow (the
   * classic visuals draw no smoke to melt them into). */
  private glowInto(ctx: CanvasRenderingContext2D, t: number, elapsed: number, w: number, h: number, pulse: number): void {
    const unit = Math.min(w, h)
    ctx.save()
    ctx.globalCompositeOperation = 'screen'
    if (this.options.into.cover && this.info.image) {
      const s = unit * (0.34 + 0.04 * pulse)
      ctx.globalAlpha = 0.28
      ctx.drawImage(this.info.image, w / 2 - s / 2, h / 2 - s / 2, s, s)
    }
    const picture = (text: string, size: number, y: number, alpha: number) => {
      const p = textPicture(text)
      const ph = size
      const pw = Math.min(w * 0.9, (p.width / p.height) * ph)
      ctx.globalAlpha = alpha
      ctx.drawImage(p, w / 2 - pw / 2, y - ph / 2, pw, (pw / ((p.width / p.height) * ph)) * ph)
    }
    if (this.options.into.title) {
      const alpha = Math.min(1, elapsed / 0.8) * Math.max(0, 1 - elapsed / 8)
      if (alpha > 0) picture(this.song.title, unit * 0.16, h * 0.42, alpha * 0.5)
    }
    if (this.options.into.lyrics) {
      const i = lineAt(this.shown, t)
      const line = i >= 0 ? this.shown[i] : null
      if (line && t <= line.end + 0.3) picture(line.text, unit * 0.09, h * 0.72, 0.35)
    }
    ctx.restore()
  }

  /** Draw frame ``k`` (``k / fps`` seconds into the part). */
  draw(k: number): void {
    const { fps } = this.options
    const elapsed = k / fps
    const t = this.options.start + elapsed
    const w = this.canvas.width
    const h = this.canvas.height
    const ctx = this.ctx
    const frame = this.analysis.frame(t, 1 / fps, elapsed)
    this.pick(t, frame.beat)
    const colors = makeColors(this.hue, this.scheme(), elapsed)
    const style = this.options.look
    const into = this.options.into
    const lines = this.shown
    if (this.mixer.preset?.kind === 'drop') {
      // the song for the pictures of the Drop visual, and the title, line and cover chosen into its smoke
      const renderer = this.dropRenderer()
      if (renderer) {
        tellRenderer(renderer, { id: this.song.id, title: this.song.title, cover: this.info.image ?? null, lines }, t)
        renderer.extraSprites = storySprites(into, elapsed, frame.pulse, renderer.story.lineOn)
      }
    }
    this.mixer.draw(ctx, frame, w, h, colors)
    if (this.mixer.preset?.kind !== 'drop' && (into.title || into.lyrics || into.cover)) this.glowInto(ctx, t, elapsed, w, h, frame.pulse)
    // the looks of the picture itself: the cover from behind, the beat's breath, the vignette, the grain, the bars
    if (style.backdrop > 0 && this.info.image) drawBackdrop(ctx, this.looks, this.info.image, style.backdrop, elapsed, w, h, frame.pulse)
    if (style.zoom > 0) drawBeatZoom(ctx, this.looks, style.zoom, frame.pulse, w, h)
    if (style.vignette) drawVignette(ctx, this.looks, w, h)
    if (style.grain > 0) drawGrain(ctx, this.looks, style.grain, w, h)
    if (style.bars) drawBars(ctx, w, h)
    const bars = style.bars ? barHeight(w, h) : 0
    // what is drawn over it
    const upright = h > w * 1.2
    const stripH = Math.round(h * (upright ? 0.16 : 0.25))
    const stripY = h - stripH - Math.round(h * 0.045)
    if (this.strip) this.strip.draw(ctx, t, Math.round(w * 0.03), stripY, Math.round(w * 0.94), stripH, this.accent, settings.notationShift[this.song.id] ?? 0)
    // after the title card: the cover in its place, the lyrics
    const after = this.options.title ? Math.min(1, Math.max(0, (elapsed - 4) / 0.8)) : 1
    const cover = this.options.cover
    if (cover.show && this.info.image) drawCoverBadge(ctx, this.info.image, cover, w, h, elapsed, frame.pulse, this.accent, after)
    // the lyrics come in as the title card goes
    const lyricsAlpha = this.options.title ? Math.min(1, Math.max(0, (elapsed - 3.4) / 0.8)) : 1
    const look: LyricsLook = { ...this.look, effect: this.options.lyricsStyle.effect, clock: elapsed, pulse: this.options.onBeat ? frame.pulse : 0 }
    const size = this.options.lyricsStyle.size
    // a line comes in in one beat when it follows the beat (the song's tempo), else in four tenths of a second
    const beat = this.song.bpm ? 60 / this.song.bpm : 0.5
    const span = this.options.onBeat ? Math.min(0.9, Math.max(0.25, beat)) : 0.4
    const floor = this.strip ? stripY - h * 0.02 : h * 0.9
    if (lines.length && lyricsAlpha > 0) {
      if (this.options.lyrics === 'words') {
        ctx.save()
        ctx.globalAlpha = lyricsAlpha
        const centre = this.options.lyricsPlace === 'top' ? h * 0.3 : this.options.lyricsPlace === 'bottom' ? Math.min(h * 0.7, floor - h * 0.12) : this.strip ? floor / 2 : h / 2
        drawWords(ctx, lines, t, w, h, look, size, this.options.onBeat ? Math.min(0.32, beat / 2) : 0.22, centre)
        ctx.restore()
      } else if (this.options.lyrics !== 'off') {
        const place = this.options.lyrics === 'karaoke' && this.options.lyricsPlace === 'bottom' ? 'middle' : this.options.lyricsPlace
        drawMovingLyrics(ctx, this.options.lyrics, lines, t, w, h, place, this.options.lyricsIn, span, lyricsAlpha, look, size, this.options.lyrics === 'karaoke' && this.strip ? floor / 2 : floor, this.hue)
      }
    }
    // the song's name in the corner keeps clear of a cover there
    const nudge = cover.show && this.info.image && cover.place === 'top-left' ? Math.min(w, h) * (cover.size + 0.06) : 0
    if (this.options.corner) drawCorner(ctx, this.info, w, h, after, nudge)
    if (this.options.credit) drawCredit(ctx, w, h)
    if (this.options.progress) drawProgress(ctx, t, this.sound.duration, this.sections, this.accent, w, h)
    if (style.sections) {
      const section = sectionAt(this.sections, t)
      if (section && section.at > this.options.start + 0.5) drawSectionName(ctx, sectionName(section.label), t - section.at, this.accent, w, h, bars + (this.options.corner ? Math.min(w, h) * 0.08 : 0))
    }
    if (this.options.title) drawTitleCard(ctx, this.info, elapsed, w, h)
    if (style.endCard) drawEndCard(ctx, this.info, this.byline, this.length - elapsed, endCardSeconds(this.length), w, h)
    if (style.fades) drawBlack(ctx, fadeAt(elapsed, this.length), w, h)
  }

  /** Who made the song, for the end card: its artist and album tags (a party song's *Guest*, *Party-Song …*). */
  private get byline(): string {
    const tags = this.song.tags ?? {}
    return [tags.artist || this.song.artist, tags.album || this.song.album].filter(Boolean).join(' · ') || this.info.subtitle
  }
}

const SCHEMES: Scheme[] = ['song', 'neon', 'sunset', 'winamp', 'mono']

/** The visuals of a video: its slots (one, each section, each span of seconds) and each one's visual - the one
 * chosen, else at random from the seed (or, for one visual, as the visuals' settings choose for the song). */
export function planOf(song: SongSummary, options: VideoOptions, sections: TimedSection[], length: number): { slots: Slot[]; visuals: string[] } {
  const slots = slotsOf(options.change, options.interval, sections, options.start, length, sectionName)
  // only what this browser can draw (owner's request 2026-10-30: no WebGL visual where there is none)
  const exists = (id: string): boolean => {
    const preset = presetById(id)
    return !!preset && offeredForVideo(preset)
  }
  if (options.change === 'never') {
    const id = options.visual && exists(options.visual) ? options.visual : chooseVisual({ settings: settings.visuals, song, previous: null, turn: 0 })
    return { slots, visuals: [id] }
  }
  const all = allPresets().filter(offeredForVideo)
  let pool: string[]
  if (options.randomFrom === 'all') pool = all.map((p) => p.id)
  else if (options.randomFrom === 'match') {
    const moods = songMoods(song)
    const fitting = all.filter((p) => !moods.length || p.suits.some((s) => moods.includes(s)))
    pool = (fitting.length ? fitting : all).map((p) => p.id)
  } else {
    const ticked = settings.visuals.pool.filter(exists)
    pool = ticked.length ? ticked : all.map((p) => p.id)
  }
  return { slots, visuals: resolvePlan(slots, options.picks, pool, options.seed, options.repeats, exists) }
}

/** One frame of the video at ``at`` seconds into the song, small - after a few seconds drawn before it, so
 * that the visual has its trails. */
export async function preview(song: SongSummary, detail: SongDetail, options: VideoOptions, at: number, width = 640): Promise<HTMLCanvasElement> {
  const sound = await soundOf(song, options.take)
  const composer = await Composer.create(song, detail, sound, options, width / options.width)
  try {
    const target = Math.max(0, Math.round((at - options.start) * options.fps))
    for (let k = Math.max(0, target - options.fps * 3); k <= target; k++) composer.draw(k)
    // a copy: the composer's graphics memory goes back at once (a preview is made at every change of a setting)
    const still = document.createElement('canvas')
    still.width = composer.canvas.width
    still.height = composer.canvas.height
    still.getContext('2d')?.drawImage(composer.canvas, 0, 0)
    return still
  } finally {
    composer.dispose()
  }
}

// --- the encoder -----------------------------------------------------------------------------------------

/** The H.264 level the frame size and rate need (macroblocks per frame and per second). */
export function levels(width: number, height: number, fps: number): string[] {
  const frame = Math.ceil(width / 16) * Math.ceil(height / 16)
  const rate = frame * fps
  const all: [string, number, number][] = [
    ['28', 8192, 245760],
    ['2A', 8704, 522240],
    ['32', 22080, 589824],
    ['33', 36864, 983040],
    ['34', 36864, 2073600],
  ]
  return all.filter(([, maxFrame, maxRate]) => frame <= maxFrame && rate <= maxRate).map(([level]) => level)
}

const ACCELERATION: Record<VideoOptions['encoder'], HardwareAcceleration> = {
  auto: 'no-preference',
  hardware: 'prefer-hardware',
  software: 'prefer-software',
}

/** The H.264 encoder's settings as the browser takes them: the best profile it has at the size and rate, the
 * bitrate of the level (or the one chosen), constant where asked and the browser can - else variable. */
export async function encoderConfig(options: VideoOptions): Promise<VideoEncoderConfig> {
  if (typeof VideoEncoder === 'undefined') throw new Error('This browser cannot encode video (WebCodecs): use a current Chrome or Edge.')
  const { width, height, fps } = options
  const bitrate = videoBitrate(options)
  const modes: VideoEncoderBitrateMode[] = options.quality === 'custom' && options.constant ? ['constant', 'variable'] : ['variable']
  const accelerations: HardwareAcceleration[] = options.encoder === 'auto' ? ['no-preference'] : [ACCELERATION[options.encoder], 'no-preference']
  for (const hardwareAcceleration of accelerations) {
    for (const bitrateMode of modes) {
      for (const level of levels(width, height, fps)) {
        for (const profile of ['6400', '4D00', '42E0']) {
          const config: VideoEncoderConfig = {
            codec: `avc1.${profile}${level}`,
            width,
            height,
            bitrate,
            framerate: fps,
            bitrateMode,
            latencyMode: 'quality',
            hardwareAcceleration,
            avc: { format: 'annexb' },
          }
          const answer = await VideoEncoder.isConfigSupported(config)
          if (answer.supported) return answer.config ?? config
        }
      }
    }
  }
  throw new Error(`This browser cannot encode H.264 at ${width} × ${height}, ${fps} frames a second.`)
}

// --- pauses a tab in the background does not stretch --------------------------------------------------------

const channel = typeof MessageChannel !== 'undefined' ? new MessageChannel() : null
const resumes: (() => void)[] = []
if (channel) channel.port1.onmessage = () => resumes.shift()?.()

/** A short pause for the page between frames. A tab in the background has its timers held back to once a second
 * (a video in the queue would crawl there); a message to itself is not held back. */
export function nextTask(): Promise<void> {
  if (!channel) return new Promise((resolve) => setTimeout(resolve, 0))
  return new Promise((resolve) => {
    resumes.push(resolve)
    channel.port2.postMessage(0)
  })
}

/** Until the encoder has taken a frame from its queue (its ``dequeue`` event; a short wait where it has none). */
function dequeued(encoder: VideoEncoder): Promise<void> {
  return new Promise((resolve) => {
    const done = (): void => {
      encoder.removeEventListener('dequeue', done)
      window.clearTimeout(timer)
      resolve()
    }
    const timer = window.setTimeout(done, 40)
    encoder.addEventListener('dequeue', done)
  })
}

export interface Progress {
  stage: string
  frame: number
  total: number
  /** Frames a second against the video's rate: 2 = twice as fast as it plays. */
  speed: number
  /** Seconds left. */
  left: number
}

/** Make the video: every frame drawn and encoded, sent to the player, put together there with the sound.
 * ``onFrame`` sees the canvas now and then (a live preview). */
export async function makeVideo(
  song: SongSummary,
  options: VideoOptions,
  onProgress: (progress: Progress) => void,
  signal: AbortSignal,
  onFrame?: (canvas: HTMLCanvasElement) => void
): Promise<{ file: string; size: number; folder: string }> {
  onProgress({ stage: 'Reading the song', frame: 0, total: 0, speed: 0, left: 0 })
  const detail = await api.song(song.id)
  const sound = await soundOf(song, options.take)
  const composer = await Composer.create(song, detail, sound, options)
  const config = await encoderConfig(options)
  const total = composer.total
  const { job } = await api.videoStart({
    song: song.id,
    take: options.take,
    start: options.start,
    length: composer.length,
    fps: options.fps,
    width: composer.canvas.width,
    height: composer.canvas.height,
    audio: options.audio,
  })
  let failure: unknown = null
  let pending: Uint8Array[] = []
  let pendingBytes = 0
  let uploading: Promise<unknown> = Promise.resolve()
  /** Bytes handed to the player and not yet taken: the drawing waits while there are many (a slow disk, a busy
   * computer) instead of piling the video up in the page. */
  let inFlight = 0
  const send = (): void => {
    if (!pendingBytes) return
    const data = new Uint8Array(pendingBytes)
    let at = 0
    for (const piece of pending) {
      data.set(piece, at)
      at += piece.length
    }
    pending = []
    pendingBytes = 0
    inFlight += data.length
    uploading = uploading
      .then(() => api.videoData(job, data))
      .catch((error) => (failure = failure ?? error))
      .finally(() => (inFlight -= data.length))
  }
  const encoder = new VideoEncoder({
    output: (chunk) => {
      const piece = new Uint8Array(chunk.byteLength)
      chunk.copyTo(piece)
      pending.push(piece)
      pendingBytes += piece.length
      if (pendingBytes > 2 * 2 ** 20) send()
    },
    error: (error) => (failure = failure ?? error),
  })
  encoder.configure(config)
  const began = performance.now()
  try {
    for (let k = 0; k < total; k++) {
      if (signal.aborted) throw new DOMException('stopped', 'AbortError')
      if (failure) throw failure
      composer.draw(k)
      const frame = new VideoFrame(composer.canvas, { timestamp: Math.round((k * 1e6) / options.fps), duration: Math.round(1e6 / options.fps) })
      encoder.encode(frame, { keyFrame: k % (options.fps * options.keyframes) === 0 })
      frame.close()
      while (encoder.encodeQueueSize > 6) await dequeued(encoder)
      if (inFlight > MAX_IN_FLIGHT) await uploading
      if (k % 15 === 0 || k === total - 1) {
        const seconds = (performance.now() - began) / 1000
        const rate = (k + 1) / Math.max(seconds, 0.001)
        onProgress({ stage: 'Drawing and encoding', frame: k + 1, total, speed: rate / options.fps, left: (total - k - 1) / rate })
        if (k % 60 === 0) onFrame?.(composer.canvas)
        await nextTask()
      }
    }
    await encoder.flush()
    send()
    await uploading
    if (failure) throw failure
    onProgress({ stage: 'Putting it together with the sound', frame: total, total, speed: 0, left: 0 })
    return await api.videoFinish(job, total)
  } catch (error) {
    void api.videoCancel(job).catch(() => {})
    throw error
  } finally {
    if (encoder.state !== 'closed') encoder.close()
    composer.dispose()
  }
}

/** At most so many bytes of video on their way to the player before the drawing waits. */
const MAX_IN_FLIGHT = 24 * 2 ** 20
