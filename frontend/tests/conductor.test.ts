/** The cue (phase 7.5): table tests on a hand-made track - the beat's phase, anticipation rising before an onset,
 * impact at it, tension before a louder section - and a visual that ignores the cue draws as before. */
import { describe, expect, it } from 'vitest'

import { type Analysis, NO_CUE, cueAt, readAnalysis, upperBound } from '../src/player/visuals/conductor'
import { quietFrame } from '../src/player/visuals/analysis'
import { CLASSIC } from '../src/player/visuals/presets'

const RATE = 50
function track(): Analysis {
  const n = 20 * RATE
  const low = new Uint8Array(n).fill(20)
  // a kick at every onset: the low band jumps there
  const onsets = [2, 4, 6, 8, 10, 12, 14, 16, 18]
  for (const t of onsets) for (let k = 0; k < 5; k++) low[Math.round(t * RATE) + k] = 220
  for (let i = 12 * RATE; i < n; i++) low[i] = Math.max(low[i], 120) // the chorus is louder
  return {
    schema: 'plenio.analysis/1',
    rate: RATE,
    seconds: 20,
    confidence: 1,
    beats: Array.from({ length: 40 }, (_, k) => k * 0.5),
    downbeats: Array.from({ length: 10 }, (_, k) => k * 2),
    sections: [
      { name: 'verse', start: 0, end: 12, energy: 0.3 },
      { name: 'chorus', start: 12, end: 20, energy: 0.8 },
    ],
    bands: { low, mid: new Uint8Array(n).fill(40), high: new Uint8Array(n).fill(30) },
    onsets: { low: onsets, high: [] },
    peaks: [],
  }
}

describe('cueAt', () => {
  const a = track()

  it('the beat and the bar go round', () => {
    expect(cueAt(a, 1.0).beatPhase).toBeCloseTo(0, 6)
    expect(cueAt(a, 1.25).beatPhase).toBeCloseTo(0.5, 6)
    expect(cueAt(a, 3.0).barPhase).toBeCloseTo(0.5, 6)
    expect(cueAt(a, 5.0).section).toBe('verse')
    expect(cueAt(a, 13.0).section).toBe('chorus')
    expect(cueAt(a, 6.0).sectionProgress).toBeCloseTo(0.5, 6)
  })

  it('anticipation rises in the 180 ms before an onset; impact lands on it and decays', () => {
    const before = [3.7, 3.85, 3.95, 3.99].map((t) => cueAt(a, t).anticipation)
    expect(before[0]).toBe(0)
    for (let k = 1; k < before.length; k++) expect(before[k]).toBeGreaterThan(before[k - 1])
    const at = cueAt(a, 4.0).impact
    expect(at).toBeGreaterThan(0.5)
    expect(cueAt(a, 4.12).impact).toBeCloseTo(at / Math.E, 2)
    expect(cueAt(a, 5.0).impact).toBeLessThan(0.01)
  })

  it('tension builds across the two bars before the louder chorus and is gone in it', () => {
    expect(cueAt(a, 7.0).tension).toBe(0)
    const build = [8.5, 10, 11, 11.9].map((t) => cueAt(a, t).tension)
    for (let k = 1; k < build.length; k++) expect(build[k]).toBeGreaterThan(build[k - 1])
    expect(build[build.length - 1]).toBeGreaterThan(0.9)
    expect(cueAt(a, 12.5).tension).toBe(0)
  })

  it('the energy looks a little ahead', () => {
    expect(cueAt(a, 11.95).energy).toBeGreaterThan(cueAt(a, 11.0).energy)
  })

  it('reads the server’s track and refuses anything else', () => {
    const raw = { schema: 'plenio.analysis/1', rate: 50, seconds: 1, confidence: 0.5, beats: [0.5, 'x'], downbeats: [], sections: [], bands: { low: btoa('\x01\x02'), mid: '', high: '' }, onsets: { low: [0.5] }, peaks: [] }
    const found = readAnalysis(raw)
    expect(found?.beats).toEqual([0.5])
    expect(Array.from(found?.bands.low ?? [])).toEqual([1, 2])
    expect(readAnalysis({ schema: 'other' })).toBeNull()
    expect(upperBound([1, 2, 2, 3], 2)).toBe(3)
  })
})

/** A canvas context that records every call, so two drawings can be compared. */
function recorder(): { ctx: CanvasRenderingContext2D; calls: string[] } {
  const calls: string[] = []
  const handler: ProxyHandler<Record<string, unknown>> = {
    get(target, key) {
      if (key in target) return target[key as string]
      return (...args: unknown[]) => {
        calls.push(`${String(key)}(${args.map((x) => (typeof x === 'number' ? x.toFixed(4) : typeof x)).join(',')})`)
        return key === 'createLinearGradient' || key === 'createRadialGradient' ? { addColorStop: () => undefined } : key === 'measureText' ? { width: 10 } : undefined
      }
    },
    set(target, key, value) {
      calls.push(`${String(key)}=${typeof value === 'number' ? value.toFixed(4) : String(value)}`)
      target[key as string] = value
      return true
    },
  }
  return { ctx: new Proxy({ canvas: { width: 320, height: 180 } } as Record<string, unknown>, handler) as unknown as CanvasRenderingContext2D, calls }
}

describe('a visual that ignores the cue', () => {
  it('draws exactly as before', () => {
    const preset = CLASSIC.find((p) => p.id === 'bars') ?? CLASSIC[0]
    const colors = { palette: () => new Uint8ClampedArray(256 * 4), at: () => '#fff', hue: 0 } as never
    const draw = (cue: boolean): string[] => {
      const { ctx, calls } = recorder()
      const scene = preset.create()
      const frame = { ...quietFrame(), time: 1, dt: 1 / 60, bass: 0.5, mid: 0.3, treble: 0.2, level: 0.4, playing: true }
      for (let k = 0; k < 3; k++) scene.draw(ctx, cue ? { ...frame, cue: { ...NO_CUE, impact: 1, tension: 0.7 } } : frame, 320, 180, colors)
      return calls
    }
    const plain = draw(false)
    expect(plain.length).toBeGreaterThan(10)
    expect(draw(true)).toEqual(plain)
  })
})
