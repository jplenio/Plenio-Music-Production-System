/** The twelve signature visuals (phase 7.9): they exist, each answers the Director's cue, a new player shows them
 * first, and a device that draws fewer than three of them chooses from the whole pool. */
import { describe, expect, it } from 'vitest'

import { SIGNATURES, inCollection } from '../src/player/visuals/collections'
import { BUILTIN } from '../src/player/visuals/drop/builtin'
import { NOVA } from '../src/player/visuals/nova'
import { PRESETS } from '../src/player/visuals/presets'
import { withDefaults } from '../src/player/visuals/chooser'
import presetsSource from '../src/player/visuals/presets.ts?raw'
import classicsSource from '../src/player/visuals/classics.ts?raw'

const slug = (name: string): string => `drop-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`

describe('the signature twelve', () => {
  it('are twelve visuals that exist, across the three engines', () => {
    expect(SIGNATURES).toHaveLength(12)
    for (const id of SIGNATURES) expect(PRESETS.some((p) => p.id === id), id).toBe(true)
    const kinds = new Set(SIGNATURES.map((id) => PRESETS.find((p) => p.id === id)?.kind ?? 'classic'))
    expect([...kinds].sort()).toEqual(['classic', 'drop', 'nova'])
    expect(SIGNATURES).not.toContain('nova-black-hole')
    expect(SIGNATURES).not.toContain('nova-outrun')
  })

  it('each answers the cue: Nova by its weights, Drop in its formulas, the classics in their drawing', () => {
    for (const id of SIGNATURES.filter((x) => x.startsWith('nova-'))) {
      const cue = NOVA.find((d) => d.id === id)?.cue
      expect(cue, id).toBeDefined()
      expect(cue!.lean + cue!.flash + cue!.build).toBeGreaterThan(0)
    }
    for (const id of SIGNATURES.filter((x) => x.startsWith('drop-'))) {
      const file = BUILTIN.find((f) => slug(f.name) === id)
      expect(file, id).toBeDefined()
      const text = JSON.stringify(file)
      for (const word of ['anticipation', 'impact', 'tension']) expect(text, `${id}: ${word}`).toContain(word)
    }
    expect(presetsSource).toMatch(/cue\?\.impact/)
    expect(classicsSource).toMatch(/f\.cue\?\.tension/)
    // the other Nova scenes keep their light as it was
    expect(NOVA.filter((d) => !SIGNATURES.includes(d.id)).every((d) => !d.cue)).toBe(true)
  })

  it('a new player shows them first; a saved one keeps what it had', () => {
    expect(withDefaults(null).collection).toBe('signature')
    expect(withDefaults({ mode: 'auto' }).collection).toBe('')
    expect(inCollection('signature', PRESETS.map((p) => p.id))).toEqual(PRESETS.map((p) => p.id).filter((id) => SIGNATURES.includes(id)))
  })
})
