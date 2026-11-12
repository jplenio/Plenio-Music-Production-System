/** Nova's quality (phase 7.2): the governor lowers the quality before the pixels and gives them back in the other
 * order; the tiers; every march loop of every scene follows Q. */
import { describe, expect, it } from 'vitest'

import { Governor, TIERS, medianTiming, tierOf, NOVA_FLOOR, NOVA_FRAME_MS } from '../src/player/visuals/gpu'
import { HEADER } from '../src/player/visuals/nova/glsl'
import { NOVA } from '../src/player/visuals/nova'

function run(g: Governor, ms: number, seconds: number): void {
  for (let t = 0; t < seconds; t += ms / 1000) g.note(ms / 1000)
}

describe('the governor', () => {
  it('takes quality first, then pixels; gives back pixels first, then quality', () => {
    const g = new Governor()
    run(g, 16.7, 3)
    const seen: string[] = []
    const watch = (ms: number, seconds: number) => {
      for (let t = 0; t < seconds; t += ms / 1000) {
        const before = [g.quality, g.factor]
        g.note(ms / 1000)
        if (g.quality < before[0]) seen.push('quality down')
        if (g.factor < before[1]) seen.push('pixels down')
        if (g.factor > before[1]) seen.push('pixels up')
        if (g.quality > before[0]) seen.push('quality up')
      }
    }
    watch(40, 12)
    watch(16.7, 40)
    const order = seen.filter((s, i) => s !== seen[i - 1])
    expect(order).toEqual(['quality down', 'pixels down', 'pixels up', 'quality up'])
    expect(g.quality).toBe(1)
    expect(g.factor).toBe(1)
  })

  it('starts each tier at its own quality and never above it', () => {
    const g = new Governor()
    g.use(TIERS.C)
    g.fresh()
    expect(g.quality).toBe(TIERS.C.quality)
    run(g, 16.7, 30)
    expect(g.quality).toBe(TIERS.C.quality)
  })
})

describe('the tiers', () => {
  it('a phone is C, a slow card B, a fast one A', () => {
    const slow = ((NOVA_FRAME_MS * 0.8) * 1e6) / NOVA_FLOOR
    const fast = ((NOVA_FRAME_MS * 0.2) * 1e6) / NOVA_FLOOR
    expect(tierOf(fast, { touch: true, width: 400 }).id).toBe('C')
    expect(tierOf(slow, { touch: false, width: 1920 }).id).toBe('B')
    expect(tierOf(fast, { touch: false, width: 1920 }).id).toBe('A')
    expect(tierOf(null, { touch: false, width: 1920 }).id).toBe('A')
    expect(medianTiming({ a: 3, b: -1, c: 1, d: 2 })).toBe(2)
    expect(TIERS.C.fps).toBe(30)
  })
})

describe('the scenes', () => {
  it('every long loop follows the quality, and the header declares it', () => {
    expect(HEADER).toContain('uniform float Q;')
    for (const def of NOVA) {
      const code = [def.image, def.state?.code ?? ''].join('\n')
      for (const m of code.matchAll(/for \(int (\w+) = 0; \1 < (\d+); \1\+\+\) \{([^\n]*)/g)) {
        if (Number(m[2]) >= 8) expect(m[3], `${def.id}: a loop of ${m[2]}`).toContain(`QSTEPS(${m[2]})`)
      }
    }
  })
})
