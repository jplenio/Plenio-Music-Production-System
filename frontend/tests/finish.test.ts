/** One light (phase 7.7): over every visual but a Nova scene alone (already finished); the shader keeps its uniforms;
 * an old saved setting reads as on. */
import { describe, expect, it } from 'vitest'

import { FINISH_FS, ONE_LIGHT, finishes } from '../src/player/visuals/finish'
import { withDefaults } from '../src/player/visuals/chooser'

describe('one light', () => {
  it('finishes the classics and Drop, and Nova only while it mixes with another', () => {
    expect(finishes(true, 'classic', false)).toBe(true)
    expect(finishes(true, 'drop', false)).toBe(true)
    expect(finishes(true, 'nova', false)).toBe(false)
    expect(finishes(true, 'nova', true)).toBe(true)
    expect(finishes(false, 'drop', false)).toBe(false)
  })

  it('is on for settings saved before it, off when switched off', () => {
    expect(withDefaults({}).finish).toBe(true)
    expect(withDefaults({ finish: false }).finish).toBe(false)
  })

  it('the shader has the look’s three uniforms; the shoulder leaves the picture below near white alone', () => {
    for (const name of ['glow', 'vignette', 'grain']) expect(FINISH_FS).toContain(name)
    const shoulder = (c: number) => Math.min(c, 0.8) + 0.2 * (1 - Math.exp(-Math.max(c - 0.8, 0) / 0.2))
    expect(shoulder(0.5)).toBe(0.5)
    expect(shoulder(1) ** (1 / 2.2)).toBeGreaterThan(0.96)
    expect(shoulder(5)).toBeLessThan(1)
    expect(ONE_LIGHT.glow).toBeLessThan(1)
  })
})
