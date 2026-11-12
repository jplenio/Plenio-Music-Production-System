/** Choosing visuals (phase 7.8): every visual has a theme and a poster; settings of 1.6.0 load into Fine-tune
 * unchanged; Energy maps to its three settings by a table; Show and the collections steer the choice. */
import { describe, expect, it } from 'vitest'

import { COLLECTIONS, ENERGY, THEMES, energyOf, energySettings, inCollection, showOf, showSettings, themesOf } from '../src/player/visuals/collections'
import { DEFAULT_VISUALS, chooseVisual, withDefaults } from '../src/player/visuals/chooser'
import { setGpuSupport } from '../src/player/visuals/gpu'
import { PRESETS } from '../src/player/visuals/presets'
import { posterOf } from '../src/player/visuals/posters'
import sheet from '../src/player/public/posters.json'

describe('collections', () => {
  it('every visual has a theme of a collection, and no theme names a visual that is gone', () => {
    const themes = new Set(COLLECTIONS.map((c) => c.id))
    for (const p of PRESETS) {
      expect(themesOf(p.id).length, p.id).toBeGreaterThan(0)
      for (const t of themesOf(p.id)) expect(themes.has(t)).toBe(true)
    }
    for (const id of Object.keys(THEMES)) expect(PRESETS.some((p) => p.id === id), id).toBe(true)
    for (const c of COLLECTIONS) expect(inCollection(c.id, PRESETS.map((p) => p.id)).length, c.id).toBeGreaterThan(2)
  })

  it('every visual has a poster in the sheet', () => {
    for (const p of PRESETS) expect(posterOf(p.id, sheet, './'), p.id).not.toBeNull()
    expect(posterOf('nope', sheet)).toBeNull()
    expect(posterOf(PRESETS[11].id, sheet)?.backgroundPosition).toBe(`-${sheet.width}px -${sheet.height}px`)
  })
})

describe('Energy', () => {
  it('sets sensitivity, how often it changes and the crossfade by its table', () => {
    const table: [number, string, number, string, string][] = [
      [0, 'calm', 0.75, 'song', 'melt'],
      [0.2, 'calm', 0.75, 'song', 'melt'],
      [0.5, 'lively', 1, 'section', 'blend'],
      [0.8, 'intense', 1.35, 'drop', 'flash'],
      [1, 'intense', 1.35, 'drop', 'flash'],
    ]
    for (const [value, , sensitivity, switchOn, fade] of table) expect(energySettings(value)).toMatchObject({ sensitivity, switchOn, fade })
    expect(ENERGY.map((l) => l.name)).toEqual(['calm', 'lively', 'intense'])
    expect(energyOf({ ...DEFAULT_VISUALS, ...energySettings(1) })).toBe(1)
    expect(energyOf({ ...DEFAULT_VISUALS, ...energySettings(0) })).toBe(0)
  })
})

describe('Show and Fine-tune', () => {
  it('settings saved by 1.6.0 load with every value they had', () => {
    const old = { enabled: true, mode: 'cycle', pool: ['bars', 'plasma'], fixed: 'tunnel', switchOn: 'interval', interval: 45, scheme: 'winamp', sensitivity: 1.3, songs: { s1: 'bars' }, lyrics: false, titles: true, dropScale: 0.5, dropsOffered: true, moreOffered: true, novaOffered: true, fade: 'zoom', fadeSeconds: 5 }
    const loaded = withDefaults(old)
    for (const [key, value] of Object.entries(old)) expect(loaded[key as keyof typeof loaded], key).toEqual(value)
    expect(loaded.collection).toBe('')
    expect(loaded.favourites).toEqual([])
    expect(showOf(loaded)).toBe('all')
  })

  it('Show sets the mode, the collection or none', () => {
    for (const show of ['director', 'one', 'off', 'space', 'all'] as const) {
      const v = { ...DEFAULT_VISUALS, ...showSettings(show) }
      expect(showOf(v)).toBe(show)
    }
  })

  it('a collection keeps the choice to its visuals', () => {
    setGpuSupport({ webgl: false, float: false, why: '', card: '' })
    const v = { ...DEFAULT_VISUALS, collection: 'retro' }
    for (let turn = 0; turn < 12; turn++) expect(themesOf(chooseVisual({ settings: v, song: null, turn }))).toContain('retro')
    const fav = { ...DEFAULT_VISUALS, collection: 'favourites', favourites: ['plasma'] }
    expect(chooseVisual({ settings: fav, song: null })).toBe('plasma')
  })
})
