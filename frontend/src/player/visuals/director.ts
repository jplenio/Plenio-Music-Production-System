/**
 * The Director (phase 7.6, PD §9.4): a visual mode that knows the song's form from its analysis track.
 *
 * - One visual per **kind of section**: every chorus the same, every verse another (the track's sections by name,
 *   or - found from the audio alone - by being a loud or a quiet part).
 * - The change falls **on the section's downbeat**, known in advance: the crossfade starts early enough to be half
 *   through at the downbeat.
 * - A drop gets the strongest transition (*Flash on the beat*, starting on the downbeat), the quietest section after
 *   the start the slowest (*Melt*), every other one a blend.
 * - Below ``DIRECTOR_CONFIDENCE`` the track's beats are not sure enough: the Director gives way to *Match the music*.
 */
import type { Analysis, Section } from './conductor'
import type { FadeStyle } from './mixer'

export const DIRECTOR_CONFIDENCE = 0.4

export interface Change {
  /** The downbeat the change belongs to (seconds of the song). */
  at: number
  /** When the crossfade starts (``at`` minus half of it; a flash starts on the downbeat). */
  start: number
  seconds: number
  style: FadeStyle
  /** The kind of section, the visual's key: sections of one kind share their visual. */
  key: string
  preset: string
}

/** A section's kind: its name (verse, chorus ...), or for a part found from the audio alone, loud or quiet. */
export function sectionKey(s: Section): string {
  return s.name && !/^part \d+$/.test(s.name) ? s.name : (s.kind ?? 'part')
}

/** The downbeat nearest ``t`` within half a bar (``t`` itself where none is that near). */
export function snap(t: number, downbeats: number[]): number {
  let best = t
  let gap = Infinity
  for (const d of downbeats) {
    const g = Math.abs(d - t)
    if (g < gap) {
      gap = g
      best = d
    }
  }
  const bar = downbeats.length > 1 ? (downbeats[downbeats.length - 1] - downbeats[0]) / (downbeats.length - 1) : 2
  return gap <= bar / 2 ? best : t
}

/** The changes for a song (``null``: the track is not sure enough, or has no sections). ``choose`` gives the visual
 * for a kind of section (its key, its energy, the visuals taken by the other kinds). */
export function directorPlan(a: Analysis, choose: (key: string, energy: number, taken: Set<string>) => string, fade = 2): Change[] | null {
  if (a.confidence < DIRECTOR_CONFIDENCE || !a.sections.length) return null
  const byKey = new Map<string, string>()
  const quietest = Math.min(...a.sections.slice(1).map((s) => s.energy))
  const changes: Change[] = []
  a.sections.forEach((s, k) => {
    const key = sectionKey(s)
    let preset = byKey.get(key)
    if (!preset) {
      preset = choose(key, s.energy, new Set(byKey.values()))
      byKey.set(key, preset)
    }
    const at = k === 0 ? 0 : snap(s.start, a.downbeats)
    const drop = a.peaks.some((p) => p.kind === 'drop' && Math.abs(p.t - at) < 0.5)
    const style: FadeStyle = k === 0 ? 'cut' : drop ? 'flash' : s.energy <= quietest && a.sections.length > 2 ? 'melt' : 'blend'
    const seconds = style === 'cut' ? 0 : style === 'flash' ? 0.6 : style === 'melt' ? fade * 2 : fade
    const start = style === 'blend' || style === 'melt' ? Math.max(0, at - seconds / 2) : at
    // a section of the same kind as the one before keeps its visual: no change
    if (changes.length && changes[changes.length - 1].preset === preset) return
    changes.push({ at, start, seconds, style, key, preset })
  })
  return changes
}

/** The change whose start falls after ``before`` and up to ``now`` (the frame that crosses it), if any. */
export function changeDue(plan: Change[], before: number, now: number): Change | null {
  if (now < before) return null // a seek back: the next frame finds its place
  return plan.find((c) => c.start > before && c.start <= now) ?? null
}

/** The change in force at ``t`` (after a seek, or when the visual opens mid-song). */
export function changeAt(plan: Change[], t: number): Change | null {
  let found: Change | null = null
  for (const c of plan) if (c.start <= t) found = c
  return found ?? plan[0] ?? null
}
