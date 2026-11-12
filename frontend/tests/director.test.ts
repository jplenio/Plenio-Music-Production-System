/** The Director (phase 7.6): a song of verse, chorus, verse, chorus, bridge played frame by frame - five changes,
 * each half through within a frame of its section's downbeat, both choruses the same visual; a drop flashes; a
 * track that is not sure gives way to Match the music. */
import { describe, expect, it } from 'vitest'

import type { Analysis } from '../src/player/visuals/conductor'
import { DIRECTOR_CONFIDENCE, changeAt, changeDue, directorPlan, sectionKey, snap } from '../src/player/visuals/director'

const FRAME = 1 / 60
const BAR = 2

function song(confidence = 0.9): Analysis {
  const downbeats = Array.from({ length: 41 }, (_, k) => 0.24 + k * BAR)
  // sections a little off their downbeats, as found
  const sections = [
    { name: 'verse', start: 0, end: 16.3, energy: 0.4 },
    { name: 'chorus', start: 16.3, end: 32.2, energy: 0.85 },
    { name: 'verse', start: 32.2, end: 48.3, energy: 0.42 },
    { name: 'chorus', start: 48.3, end: 64.25, energy: 0.88 },
    { name: 'bridge', start: 64.25, end: 80, energy: 0.25 },
  ]
  return {
    schema: 'plenio.analysis/1', rate: 50, seconds: 80, confidence,
    beats: Array.from({ length: 160 }, (_, k) => 0.24 + k * 0.5), downbeats, sections,
    bands: { low: new Uint8Array(4000), mid: new Uint8Array(4000), high: new Uint8Array(4000) },
    onsets: { low: [], high: [] }, peaks: [],
  } // prettier-ignore
}

const visuals: Record<string, string> = {}
function choose(key: string, _energy: number, taken: Set<string>): string {
  const id = visuals[key] ?? `visual-${Object.keys(visuals).length + 1}`
  expect(taken.has(id)).toBe(false)
  visuals[key] = id
  return id
}

describe('the Director', () => {
  it('changes five times, each half through on its downbeat, the choruses alike', () => {
    const a = song()
    const plan = directorPlan(a, choose, 2)
    expect(plan).not.toBeNull()
    // played frame by frame, the changes that fire
    const fired: { t: number; preset: string; seconds: number; at: number }[] = []
    let before = 0 // the first is the one in force at the start (changeAt)
    for (let t = 0; t <= 80; t += FRAME) {
      const due = changeDue(plan!, before, t)
      if (due) fired.push({ t, preset: due.preset, seconds: due.seconds, at: due.at })
      before = t
    }
    const first = changeAt(plan!, 0)
    const all = [{ t: 0, preset: first!.preset, seconds: 0, at: 0 }, ...fired]
    expect(all).toHaveLength(5)
    for (const c of all.slice(1)) {
      expect(a.downbeats.some((d) => Math.abs(d - c.at) < 1e-9)).toBe(true)
      // half through at the downbeat, to the frame
      expect(Math.abs(c.t + c.seconds / 2 - c.at)).toBeLessThanOrEqual(FRAME)
    }
    expect(all[1].preset).toBe(all[3].preset)
    expect(all[0].preset).toBe(all[2].preset)
    expect(new Set(all.map((c) => c.preset)).size).toBe(3)
    expect(plan!.find((c) => c.key === 'bridge')?.style).toBe('melt')
  })

  it('a drop flashes on its downbeat', () => {
    const a = song()
    a.peaks = [{ t: 48.24, kind: 'drop', strength: 0.9 }]
    const plan = directorPlan(a, (key) => `v-${key}`)!
    const drop = plan.find((c) => Math.abs(c.at - 48.24) < 1e-9)!
    expect(drop.style).toBe('flash')
    expect(drop.start).toBe(drop.at)
  })

  it('gives way to Match the music where the track is not sure', () => {
    expect(directorPlan(song(DIRECTOR_CONFIDENCE - 0.01), (key) => key)).toBeNull()
    const none = song()
    none.sections = []
    expect(directorPlan(none, (key) => key)).toBeNull()
  })

  it('sections found from the audio pair by being loud or quiet', () => {
    expect(sectionKey({ name: 'part 3', start: 0, end: 1, energy: 0.9, kind: 'high' })).toBe('high')
    expect(sectionKey({ name: 'chorus', start: 0, end: 1, energy: 0.9 })).toBe('chorus')
    expect(snap(16.3, [14.24, 16.24, 18.24])).toBeCloseTo(16.24, 9)
    expect(snap(5, [0, 2, 10])).toBe(5) // no downbeat within half a bar
  })
})
