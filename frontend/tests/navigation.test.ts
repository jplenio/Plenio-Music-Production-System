/** The five places, the Settings page's search and index, the first-time explanations (phase 6.4). */
import { describe, expect, it } from 'vitest'

import { movedRoute, PLACES, placeOf } from '../src/player/nav'
import { LABELS, SECTIONS, searchSettings, SETTING_HOMES } from '../src/player/settingsIndex'
import { INTRO_TIMES, introShown } from '../src/player/intro'
import { settings } from '../src/player/store'

const sources = import.meta.glob('../src/player/components/*.vue', { query: '?raw', import: 'default', eager: true }) as Record<string, string>
const source = (name: string): string => sources[`../src/player/components/${name}.vue`] ?? ''

describe('the five places', () => {
  it('every route belongs to one', () => {
    const cases: [string, string][] = [
      ['/', 'songs'], ['/song/abc', 'songs'], ['/record/x', 'songs'],
      ['/playlists', 'playlists'], ['/playlist/p1', 'playlists'], ['/favorites', 'playlists'], ['/top', 'playlists'], ['/recent', 'playlists'],
      ['/live', 'live'], ['/make', 'make'], ['/make/abc', 'make'],
      ['/people', 'more'], ['/jobs', 'more'], ['/help', 'more'], ['/settings/sound', 'more'],
    ] // prettier-ignore
    for (const [route, place] of cases) expect(placeOf(route), route).toBe(place)
    expect(PLACES.map((p) => p.label)).toEqual(['Songs', 'Playlists', 'Live', 'Make', 'More'])
  })

  it('the moved settings lead to People & access', () => {
    expect(['/settings/accounts', '/settings/network', '/settings/party'].map(movedRoute)).toEqual(['/people', '/people', '/people'])
    expect(movedRoute('/settings/sound')).toBeNull()
    expect(movedRoute('/people')).toBeNull()
  })
})

describe('the settings', () => {
  it('a search finds the section of a label or its words', () => {
    expect([...searchSettings('crossfade')].sort()).toEqual(['basic', 'sound'])
    expect([...searchSettings('invite')]).toEqual(['people'])
    expect([...searchSettings('backup')]).toEqual(['kept'])
    expect(searchSettings('nothing like this').size).toBe(0)
    expect(searchSettings('').size).toBe(SECTIONS.length)
  })

  it('every label is on the page, every section has an id there', () => {
    const page = (source('SettingsView') + source('SyncSetting')).replaceAll('&amp;', '&')
    for (const { label } of LABELS) expect(page, label).toContain(label)
    for (const [id] of SECTIONS) {
      if (id === 'studio') expect(source('StudioSettings')).toContain('id="studio"')
      else expect(page, id).toContain(`id="${id}"`)
    }
  })

  it('every setting of the player has a place where it changes, and the place has it', () => {
    for (const key of Object.keys(settings)) {
      const home = SETTING_HOMES[key]
      expect(home, `${key} has no place`).toBeDefined()
      if (home && 'component' in home) expect(source(home.component), `${key} in ${home.component}`).toMatch(new RegExp(`settings\\.${key}\\b|\\b${key}\\b`))
    }
  })
})

it('explains a page the first three times', () => {
  const kept = new Map<string, string>()
  const storage = { getItem: (k: string) => kept.get(k) ?? null, setItem: (k: string, v: string) => void kept.set(k, v) }
  const shown = Array.from({ length: INTRO_TIMES + 2 }, () => introShown('live', storage))
  expect(shown).toEqual([true, true, true, false, false])
  expect(introShown('nowhere', storage)).toBe(false)
})
