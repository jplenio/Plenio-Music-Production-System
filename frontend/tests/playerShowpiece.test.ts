/** The player as a showpiece (owner's request 2026-10-26): the layout by screen width, the rail of a long list,
 * presets for making a song, the help's search, small covers and the guests' reactions. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { coverUrl, type SongSummary } from '../src/player/api'
import { embedUrl, searchHelp, searchTutorials, TOPICS, TUTORIALS } from '../src/player/help'
import { layoutOf, PHONE_MAX, TABLET_MAX } from '../src/player/layout'
import { indexMarks } from '../src/player/listIndex'
import type { Draft, FormData, StudioSpec } from '../src/player/make/form'
import { applyPreset, BUILT_IN_PRESETS, formatOf, presetMatters, presetOf, presetsOf } from '../src/player/make/presets'
import { cheerLine, cheers, flight, floating, MAX_FLOATING, receive, REACTION_EMOJI, spread } from '../src/player/reactions'
import { nextIdOf, playsToItsEnd } from '../src/player/store'

function song(title: string, created = '2026-10-01T10:00:00Z', seconds = 150, bpm?: number): SongSummary {
  return { id: title.toLowerCase().replace(/\W/g, '').padEnd(12, '0').slice(0, 12), title, created, year: created.slice(0, 4), seconds, bpm, model: 'YuE2', kind: 'song', brief: {}, genre: 'pop', mood: '', language: '', vocals: '', instrumental: false, arrangement: 'off', template: '', style: '', lyrics: '', loudness: { lufs: null, true_peak: null, range: null }, tags: {}, plenio: '1.4.0', folder: '', file: title, takes_key: '', has: { audio: true, original: false, cover: true, pdf: false, lines: false, notes: false, stems: false, timing: false, score: false }, seeds: {}, writer: '' } as SongSummary
}

describe('the layout', () => {
  it('is a phone below 700 px, a tablet below 1100 px, else a desktop', () => {
    expect(layoutOf(390)).toBe('phone')
    expect(layoutOf(PHONE_MAX - 1)).toBe('phone')
    expect(layoutOf(PHONE_MAX)).toBe('tablet')
    expect(layoutOf(TABLET_MAX - 1)).toBe('tablet')
    expect(layoutOf(TABLET_MAX)).toBe('desktop')
    expect(layoutOf(2560)).toBe('desktop')
  })
})

describe("a long list's rail", () => {
  it('has a mark per letter where its songs begin, signs and numbers under #', () => {
    const songs = ['99 Luftballons', 'Água', 'Alpha', 'Beta', 'Bravo', 'Écho'].map((t) => song(t))
    expect(indexMarks(songs, 'title').map((m) => [m.label, m.at, m.count])).toEqual([
      ['#', 0, 1],
      ['A', 1, 2],
      ['B', 3, 2],
      ['E', 5, 1],
    ])
  })

  it('has months by date - years when there are too many - and nothing for a sort without marks', () => {
    const months = Array.from({ length: 30 }, (_, k) => song(`S${k}`, `${2024 + Math.floor(k / 12)}-${String((k % 12) + 1).padStart(2, '0')}-05T10:00:00Z`)).reverse()
    expect(indexMarks(months.slice(0, 3), 'newest').map((m) => m.title)).toEqual(['June 2026', 'May 2026', 'April 2026'])
    expect(indexMarks(months, 'newest', 26).map((m) => m.label)).toEqual(['2026', '2025', '2024'])
    expect(indexMarks(months, 'random' as never)).toEqual([])
  })

  it('keeps every few marks when even those are too many, each holding the songs up to the next', () => {
    const songs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter) => song(`${letter}x`))
    const marks = indexMarks(songs, 'title', 10)
    expect(marks.length).toBeLessThanOrEqual(10)
    expect(marks.reduce((n, m) => n + m.count, 0)).toBe(26)
    expect(marks[0]).toMatchObject({ label: 'A', at: 0, count: 3 })
  })
})

const LENGTHS = ['very short (about 1:00)', 'short (about 1:30)', 'about 2:00', 'standard (about 3:00)', 'about 4:00']
const FORM: FormData = {
  source: 'studio',
  templates: [],
  values: {},
  song: { fields: [], choices: { length: LENGTHS, vocals: ['sung', 'sparse vocals', 'instrumental'] }, defaults: {} },
  cover: { fields: [], choices: { vocals: ['original lyrics', 'new lyrics', 'instrumental'] }, defaults: {} },
  limits: { description: 1500, text: 120, source_mb: 100, max_length: 'about 4:00' },
  covers: true,
}
const SPEC: StudioSpec = {
  template: 'yue2_song',
  fields: [
    { id: 'finish.hq_mastering', label: 'HQ', type: 'boolean', default: false, description: '', group: 'Finish' },
    { id: 'finish.cover_art', label: 'Cover art', type: 'boolean', default: true, description: '', group: 'Finish' },
    { id: 'lyrics_fidelity', label: 'Fidelity', type: 'choice', default: 'standard', description: '', group: 'Song', choices: ['standard', 'high - best of 2 takes', 'highest - best of 3 takes'] },
  ],
  release: [
    { id: 'flac', label: 'FLAC', type: 'boolean', default: true, description: '', group: 'Release' },
    { id: 'mp3', label: 'MP3', type: 'boolean', default: false, description: '', group: 'Release', fixed: true },
  ],
  documents: [],
}
const draft = (kind: 'song' | 'cover' = 'song', studio = true): Draft => ({
  kind,
  fields: { description: 'a night at the lake', length: 'about 2:00', vocals: kind === 'cover' ? 'original lyrics' : 'sung' },
  source: null,
  studio: studio ? { fields: {}, release: {} } : undefined,
})

describe('presets for making a song', () => {
  it('ship ready-made ones, among them the best quality with cover art', () => {
    const best = BUILT_IN_PRESETS.find((p) => p.id === 'best')
    expect(best?.studio?.fields).toMatchObject({ 'finish.hq_mastering': true, 'finish.cover_art': true })
    expect(new Set(BUILT_IN_PRESETS.map((p) => p.id)).size).toBe(BUILT_IN_PRESETS.length)
  })

  it('set the fields that apply - the nearest length, the studio values the template has, never a fixed one', () => {
    const d = draft()
    const party = BUILT_IN_PRESETS.find((p) => p.id === 'party')!
    const applied = applyPreset(party, d, FORM, SPEC)
    expect(d.fields.length).toBe('short (about 1:30)')
    expect(d.studio?.fields).toEqual({ 'finish.hq_mastering': false, 'finish.cover_art': true, lyrics_fidelity: 'standard' })
    expect(applied).toEqual({ set: ['length', 'finish.hq_mastering', 'finish.cover_art', 'lyrics_fidelity'], takes: 1 })
    const best = applyPreset(BUILT_IN_PRESETS.find((p) => p.id === 'best')!, d, FORM, SPEC)
    expect(best.set).toContain('flac')
    expect(best.set).not.toContain('mp3') // fixed by the template
    expect(applyPreset(BUILT_IN_PRESETS.find((p) => p.id === 'takes')!, d, FORM, SPEC).takes).toBe(3)
  })

  it('give a guest (no whole studio) only the form fields, and a cover no length', () => {
    const cover = draft('cover', false)
    const applied = applyPreset(BUILT_IN_PRESETS.find((p) => p.id === 'sketch')!, cover, FORM, null)
    expect(applied).toEqual({ set: [], takes: 1 })
    expect(cover.fields.length).toBe('about 2:00')
    const instrumental = BUILT_IN_PRESETS.find((p) => p.id === 'instrumental')!
    expect(presetMatters(instrumental, cover, FORM, false)).toBe(true) // a cover may be instrumental too
    expect(presetMatters(BUILT_IN_PRESETS.find((p) => p.id === 'best')!, cover, FORM, false)).toBe(false)
  })

  it('keep their length and vocals when a style is chosen after them - the style fills the rest', () => {
    const party = BUILT_IN_PRESETS.find((p) => p.id === 'party')!
    expect(formatOf(party)?.fields).toEqual({ length: 'short (about 1:30)' })
    expect(formatOf(party)?.studio).toBeUndefined()
    expect(formatOf(BUILT_IN_PRESETS.find((p) => p.id === 'instrumental')!)?.fields).toEqual({ vocals: 'instrumental' })
    expect(formatOf(BUILT_IN_PRESETS.find((p) => p.id === 'best')!)).toBeNull()
    // a style's template set a long song: the preset's length comes back
    const d = draft()
    d.fields.length = 'about 4:00'
    applyPreset(formatOf(party)!, d, FORM, null)
    expect(d.fields.length).toBe('short (about 1:30)')
  })

  it('of your own keep the form and the studio values under a name, and come back checked', () => {
    const d = draft()
    d.fields.genre = 'jazz'
    d.studio = { fields: { 'finish.cover_art': true }, release: { flac: true } }
    const mine = presetOf('  Late night jazz  ', d, 2, 'my-1')
    expect(mine).toMatchObject({ id: 'my-1', name: 'Late night jazz', fields: { genre: 'jazz', length: 'about 2:00', vocals: 'sung' }, takes: 2 })
    expect(mine.fields).not.toHaveProperty('description')
    const kept = presetsOf([mine, { id: 7 }, null, { id: 'x', name: 'Odd', fields: { description: 'no', genre: 'rock' }, takes: 9 }])
    expect(kept.map((p) => p.name)).toEqual(['Late night jazz', 'Odd'])
    expect(kept[1].fields).toEqual({ genre: 'rock' })
    expect(kept[1].takes).toBeUndefined()
    expect(presetsOf('nonsense')).toEqual([])
  })
})

describe("the player's help", () => {
  it('finds topics and lines by every word, accents and case aside', () => {
    expect(searchHelp('')).toBe(TOPICS)
    const party = searchHelp('QR code guests')
    expect(party.map((t) => t.id)).toContain('party')
    const lines = searchHelp('swipe')[0]
    expect(lines.body.every((line) => line.toLowerCase().includes('swipe'))).toBe(true)
    expect(searchHelp('zzzz-nothing')).toEqual([])
    expect(searchTutorials('cover').length).toBeGreaterThan(0)
  })

  it('plays tutorials from youtube-nocookie only, each one once', () => {
    expect(embedUrl('29W5kwvYgSU')).toMatch(/^https:\/\/www\.youtube-nocookie\.com\/embed\/29W5kwvYgSU\?/)
    expect(new Set(TUTORIALS.map((t) => t.id)).size).toBe(TUTORIALS.length)
    expect(TUTORIALS.every((t) => /^[\w-]{11}$/.test(t.id))).toBe(true)
  })
})

describe('small covers', () => {
  it('ask for the smallest picture sharp at the size shown and the screen', () => {
    vi.stubGlobal('devicePixelRatio', 1)
    expect(coverUrl('abc', 200)).toBe('/media/abc/cover?size=256')
    expect(coverUrl('abc', 40)).toBe('/media/abc/cover?size=128')
    expect(coverUrl('abc')).toBe('/media/abc/cover')
    vi.stubGlobal('devicePixelRatio', 3)
    expect(coverUrl('abc', 200)).toBe('/media/abc/cover?size=768')
    expect(coverUrl('abc', 400)).toBe('/media/abc/cover') // larger than any small one: the cover itself
    vi.unstubAllGlobals()
  })
})

describe("the guests' reactions", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    floating.value = []
    for (const id of Object.keys(cheers)) delete cheers[id]
  })
  afterEach(() => vi.useRealTimers())

  it('float up an edge, with a size and a time of their own - only the six kinds', () => {
    const fixed = flight('fire', () => 0.75)!
    expect(fixed).toMatchObject({ emoji: '🔥', side: 'right', drift: 15 })
    expect(fixed.x).toBeGreaterThanOrEqual(1)
    expect(fixed.x).toBeLessThanOrEqual(12)
    expect(flight('poop')).toBeNull()
    expect(Object.keys(REACTION_EMOJI)).toEqual(['fire', 'heart', 'party', 'clap', 'dance', 'laugh'])
  })

  it('are spread over the time until the next ones come, counted per song, and never more than fit', () => {
    expect(spread(4, 1400)).toEqual([0, 350, 700, 1050])
    expect(spread(0)).toEqual([])
    receive([
      { n: 1, kind: 'fire', id: 'song1' },
      { n: 2, kind: 'fire', id: 'song1' },
      { n: 3, kind: 'heart', id: 'song1' },
    ])
    expect(cheerLine(cheers.song1)).toBe('🔥 2 · ❤️ 1')
    vi.advanceTimersByTime(10)
    expect(floating.value).toHaveLength(1) // the first at once, the others spread out
    vi.advanceTimersByTime(1500)
    expect(floating.value).toHaveLength(3)
    vi.advanceTimersByTime(6000)
    expect(floating.value).toHaveLength(0) // gone when they reached the top
    receive(Array.from({ length: MAX_FLOATING + 20 }, (_, n) => ({ n, kind: 'party', id: 'song2' })))
    vi.advanceTimersByTime(1500)
    expect(floating.value).toHaveLength(MAX_FLOATING)
    expect(cheers.song2.party).toBe(MAX_FLOATING + 20)
    expect(cheerLine(undefined)).toBe('')
  })
})

describe('up next on the big screen', () => {
  it('names the song next plays: the one after, the first again with repeat or Live Play - none at the end', () => {
    const list = ['a', 'b', 'c']
    const off = { on: false, atEnd: 'again' }
    expect(nextIdOf(list, 0, 'off', off)).toBe('b')
    expect(nextIdOf(list, 2, 'off', off)).toBeNull()
    expect(nextIdOf(list, 2, 'all', off)).toBe('a')
    expect(nextIdOf(list, 0, 'one', off)).toBeNull() // the same song again
    expect(nextIdOf(list, 2, 'off', { on: true, atEnd: 'again' })).toBe('a')
    expect(nextIdOf(list, 2, 'off', { on: true, atEnd: 'wait' })).toBeNull() // waits for a new song
    expect(nextIdOf([], -1, 'all', off)).toBeNull()
  })

  it('lets the last song play to its very end - a crossfade only when a song follows', () => {
    const list = ['a', 'b', 'c']
    const off = { on: false, atEnd: 'again' }
    expect(playsToItsEnd(list, 2, 'off', off, false)).toBe(true) // the end of the list: stops at its own end
    expect(playsToItsEnd(list, 1, 'off', off, false)).toBe(false)
    expect(playsToItsEnd(list, 2, 'all', off, false)).toBe(false) // the first one fades in
    expect(playsToItsEnd(list, 2, 'one', off, false)).toBe(false) // starts again just before its end
    expect(playsToItsEnd(list, 2, 'off', { on: true, atEnd: 'wait' }, false)).toBe(true) // Live Play waits
    expect(playsToItsEnd(list, 0, 'all', off, true)).toBe(true) // the sleep timer stops after it
  })
})
