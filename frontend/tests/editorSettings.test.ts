/**
 * The editor's settings as one unit (owner's request 2026-10-03): what a project file and a preset
 * carry, how a partial or broken set is read, the built-in presets, and the user's presets in ComfyUI's
 * user data - with this browser as the fallback when that store cannot be reached.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import type { Fetcher } from '../src/api/client'
import {
  BUILT_IN_PRESETS,
  PRESETS_FILE,
  loadUserPresets,
  parseSettings,
  saveUserPresets,
  settingsOf,
  withPreset,
  withSettings
} from '../src/sheet-editor/score/editorSettings'
import { isInstrument } from '../src/sheet-editor/score/instruments'
import { defaultPrefs } from '../src/sheet-editor/score/prefs'
import { buildProject, parseProject } from '../src/sheet-editor/score/projectFile'

beforeEach(() => window.localStorage.clear())
afterEach(() => window.localStorage.clear())

describe('the settings', () => {
  it('are taken from the preferences and given back, a partial set changing only what it names', () => {
    const prefs = { ...defaultPrefs(), metronome: true, wave: false }
    const settings = settingsOf(prefs)
    expect(settings).toMatchObject({ metronome: true, wave: false, sung: true, hear: 'both', paper: 'a4', notationSize: 'standard' })
    const next = withSettings(prefs, { sounds: { ...prefs.sounds, Vocal: 'voice' }, hear: 'notes' })
    expect(next.sounds.Vocal).toBe('voice')
    expect(next.hear).toBe('notes')
    expect(next.metronome).toBe(true) // not named: kept
    expect(next.layout).toBe(prefs.layout) // never part of the settings
  })

  it('reads only the valid fields of a file (any version)', () => {
    expect(parseSettings(null)).toEqual({})
    expect(
      parseSettings({ sounds: { Vocal: 'piano', Ins: 'harp' }, metronome: 'yes', hear: 'loud', sourceLevel: 7, wave: false, paper: 'a3', notationSize: 'huge', layout: 'text' })
    ).toEqual({ sounds: { Vocal: 'piano', Ins: 'plain', chord: 'plain', guide: 'plain' }, sourceLevel: 1, wave: false })
    expect(parseSettings({ notationSize: 'compact' })).toEqual({ notationSize: 'compact' })
    expect(parseSettings({ sounds: { Vocal: 'harp' } })).toEqual({}) // no known sound at all: no sounds
    expect(parseSettings({ record: { countIn: 2, quantize: 5 } }).record).toMatchObject({ countIn: 2, quantize: 16 })
  })

  it('go into the project file and come back; a file without them opens as before', () => {
    const settings = settingsOf({ ...defaultPrefs(), paper: 'letter', notationSize: 'smaller', sung: false })
    const project = buildProject({ score: 'X:1\n', settings })
    const again = parseProject(JSON.stringify(project))
    expect(typeof again === 'string' ? again : again.settings).toEqual(settings)
    const old = parseProject(JSON.stringify({ ...project, settings: undefined }))
    expect(typeof old === 'string' ? old : old.settings).toEqual({})
  })
})

describe('the presets', () => {
  it('are built in for kinds of songs, each with valid settings', () => {
    expect(BUILT_IN_PRESETS.length).toBeGreaterThanOrEqual(8)
    for (const preset of BUILT_IN_PRESETS) {
      expect(parseSettings(preset.settings)).toEqual(preset.settings) // nothing a reader would drop
      for (const id of Object.values(preset.settings.sounds ?? {})) expect(isInstrument(id)).toBe(true)
    }
    expect(BUILT_IN_PRESETS.find((p) => p.name.startsWith('Cover: free'))?.settings).toMatchObject({ wave: false, sung: false, hear: 'notes' })
  })

  it('of the user live in ComfyUI’s user data', async () => {
    const files = new Map<string, string>()
    const calls: string[] = []
    const fetcher: Fetcher = {
      fetchApi: async (route, init) => {
        calls.push(`${init?.method ?? 'GET'} ${route}`)
        const key = decodeURIComponent(route.replace(/^\/userdata\//, '').replace(/\?.*$/, ''))
        if (init?.method === 'POST') {
          files.set(key, String(init.body))
          return new Response('"ok"', { status: 200 })
        }
        return files.has(key) ? new Response(files.get(key), { status: 200 }) : new Response('', { status: 404 })
      }
    }
    expect(await loadUserPresets(fetcher)).toEqual({ presets: [], where: 'comfyui' }) // none yet
    const mine = withPreset([], { name: 'My band', builtIn: false, settings: { metronome: true } })
    expect(await saveUserPresets(fetcher, mine)).toBe('comfyui')
    expect(calls.at(-1)).toBe(`POST /userdata/${encodeURIComponent(PRESETS_FILE)}?overwrite=true`)
    expect(await loadUserPresets(fetcher)).toEqual({ presets: [{ name: 'My band', builtIn: false, settings: { metronome: true } }], where: 'comfyui' })
    // the same name again replaces it
    expect(withPreset(mine, { name: 'my BAND', builtIn: false, settings: {} })).toHaveLength(1)
  })

  it('are kept in this browser when ComfyUI’s user data cannot be reached', async () => {
    const offline: Fetcher = { fetchApi: () => Promise.reject(new Error('offline')) }
    const mine = [{ name: 'Draft', builtIn: false, settings: { wave: false } }]
    expect(await saveUserPresets(offline, mine)).toBe('browser')
    expect(await loadUserPresets(offline)).toEqual({ presets: mine, where: 'browser' })
    // a broken store: no presets, no error
    window.localStorage.setItem('plenio.score-editor.presets', '{broken')
    expect(await loadUserPresets(null)).toEqual({ presets: [], where: 'browser' })
  })
})
