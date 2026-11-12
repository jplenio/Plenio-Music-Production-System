/**
 * The cue (phase 7.5, PD §9.4): what a visual knows of the music at the time the listener hears it - from the song's
 * analysis track (plenio/player/analysis.py), besides the live spectrum, which stays for fine texture.
 *
 * Every visual may read it (``frame.cue``; Nova's and Drop's shaders as uniforms), none must: a visual that ignores
 * it draws as before.
 */
import { shallowRef } from 'vue'

export interface Section {
  name: string
  start: number
  end: number
  energy: number
  kind?: 'high' | 'low'
}

export interface Analysis {
  schema: string
  rate: number
  seconds: number
  confidence: number
  beats: number[]
  downbeats: number[]
  sections: Section[]
  /** The bands' envelopes, 0..255 at ``rate`` (decoded from the track's base64 once). */
  bands: { low: Uint8Array; mid: Uint8Array; high: Uint8Array }
  onsets: { low: number[]; high: number[] }
  peaks: { t: number; kind: string; strength: number }[]
}

export interface Cue {
  /** 0 at a beat, rising to 1 at the next. */
  beatPhase: number
  barPhase: number
  section: string
  sectionProgress: number
  sectionEnergy: number
  /** The bands, smoothed over the next 120 ms as well as the last 80. */
  energy: number
  /** 0..1, rising in the 180 ms before a strong onset: the camera leans in. */
  anticipation: number
  /** 1 at the onset, decaying with 120 ms: the hit lands on the sound. */
  impact: number
  /** 0..1 across the two bars before a section with more energy: the build-up. */
  tension: number
}

export const NO_CUE: Cue = { beatPhase: 0, barPhase: 0, section: '', sectionProgress: 0, sectionEnergy: 0.5, energy: 0, anticipation: 0, impact: 0, tension: 0 }

const clamp01 = (x: number): number => (x < 0 ? 0 : x > 1 ? 1 : Number.isFinite(x) ? x : 0)
const easeIn = (x: number): number => clamp01(x) * clamp01(x)

/** The index of the first element greater than ``t`` (the list sorted). */
export function upperBound(list: number[], t: number): number {
  let lo = 0
  let hi = list.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (list[mid] <= t) lo = mid + 1
    else hi = mid
  }
  return lo
}

export function sectionAt(a: Analysis, t: number): Section {
  const found = a.sections.find((s) => t >= s.start && t < s.end)
  return found ?? a.sections[a.sections.length - 1] ?? { name: '', start: 0, end: a.seconds || 1, energy: 0.5 }
}

export function barSeconds(a: Analysis, t: number): number {
  const i = Math.max(0, upperBound(a.downbeats, t) - 1)
  const d0 = a.downbeats[i]
  const d1 = a.downbeats[i + 1]
  if (d0 !== undefined && d1 !== undefined && d1 > d0) return d1 - d0
  const beats = a.beats
  return beats.length > 1 ? 4 * ((beats[beats.length - 1] - beats[0]) / (beats.length - 1)) : 2
}

export function barPhaseAt(a: Analysis, t: number): number {
  const i = upperBound(a.downbeats, t) - 1
  if (i < 0) return 0
  return clamp01((t - a.downbeats[i]) / barSeconds(a, t))
}

/** The mean of the three bands from ``t + from`` to ``t + to`` seconds, 0..1. */
export function lookAheadMean(a: Analysis, t: number, from: number, to: number): number {
  const lo = Math.max(0, Math.floor((t + from) * a.rate))
  const hi = Math.min(a.bands.low.length, Math.ceil((t + to) * a.rate) + 1)
  if (hi <= lo) return 0
  let sum = 0
  for (let i = lo; i < hi; i++) sum += a.bands.low[i] + a.bands.mid[i] + a.bands.high[i]
  return sum / ((hi - lo) * 3 * 255)
}

/** How strong an onset at ``t`` is: the low band's rise there, 0..1. */
export function strengthAt(a: Analysis, t: number): number {
  if (!Number.isFinite(t)) return 0
  const i = Math.round(t * a.rate)
  const now = a.bands.low[Math.min(a.bands.low.length - 1, Math.max(0, i + 1))] ?? 0
  const before = a.bands.low[Math.max(0, i - 2)] ?? 0
  return clamp01((now - before) / 160 + 0.25)
}

export function cueAt(a: Analysis, t: number): Cue {
  const i = Math.max(0, upperBound(a.beats, t) - 1)
  const b0 = a.beats[i] ?? 0
  const b1 = a.beats[i + 1] ?? b0 + 0.5
  const k = upperBound(a.onsets.low, t)
  const next = a.onsets.low[k] ?? Infinity
  const last = a.onsets.low[k - 1] ?? -Infinity
  const s = sectionAt(a, t)
  const following = a.sections[a.sections.indexOf(s) + 1]
  const lead = 2 * barSeconds(a, t)
  const rising = !!following && following.energy > s.energy + 0.15 && following.start - t < lead && following.start > t
  return {
    beatPhase: clamp01((t - b0) / Math.max(1e-3, b1 - b0)),
    barPhase: barPhaseAt(a, t),
    section: s.name,
    sectionProgress: clamp01((t - s.start) / Math.max(1e-3, s.end - s.start)),
    sectionEnergy: s.energy,
    energy: lookAheadMean(a, t, -0.08, 0.12),
    anticipation: next - t < 0.18 ? easeIn(1 - (next - t) / 0.18) * strengthAt(a, next) : 0,
    impact: t >= last ? Math.exp(-(t - last) / 0.12) * strengthAt(a, last) : 0,
    tension: rising ? easeIn(1 - (following.start - t) / lead) : 0,
  }
}

function bytes(text: unknown): Uint8Array {
  if (typeof text !== 'string' || !text) return new Uint8Array(0)
  const raw = atob(text)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

/** A track as the server sends it (``plenio.analysis/1``), its bands decoded; ``null`` for anything else. */
export function readAnalysis(raw: unknown): Analysis | null {
  const data = raw as Record<string, unknown> | null
  if (!data || data.schema !== 'plenio.analysis/1') return null
  const nums = (x: unknown): number[] => (Array.isArray(x) ? x.filter((v): v is number => typeof v === 'number' && Number.isFinite(v)) : [])
  const bands = (data.bands ?? {}) as Record<string, unknown>
  const onsets = (data.onsets ?? {}) as Record<string, unknown>
  return {
    schema: 'plenio.analysis/1',
    rate: Number(data.rate) || 50,
    seconds: Number(data.seconds) || 0,
    confidence: Number(data.confidence) || 0,
    beats: nums(data.beats),
    downbeats: nums(data.downbeats),
    sections: (Array.isArray(data.sections) ? data.sections : []) as Section[],
    bands: { low: bytes(bands.low), mid: bytes(bands.mid), high: bytes(bands.high) },
    onsets: { low: nums(onsets.low), high: nums(onsets.high) },
    peaks: (Array.isArray(data.peaks) ? data.peaks : []) as Analysis['peaks'],
  }
}

/** The tracks read so far (song id -> track; ``null``: there is none). */
const tracks = new Map<string, Analysis | null>()
export const trackOf = shallowRef<{ id: string; analysis: Analysis | null } | null>(null)

/** The track of the song that plays: from the player's server (``/api/analysis/<id>``) or the shared player's page. */
export async function loadTrack(id: string, fetcher: (id: string) => Promise<unknown>): Promise<Analysis | null> {
  if (tracks.has(id)) {
    const known = tracks.get(id) ?? null
    trackOf.value = { id, analysis: known }
    return known
  }
  let found: Analysis | null = null
  try {
    found = readAnalysis(await fetcher(id))
  } catch {
    found = null
  }
  tracks.set(id, found)
  if (tracks.size > 64) tracks.delete(tracks.keys().next().value as string)
  trackOf.value = { id, analysis: found }
  return found
}
