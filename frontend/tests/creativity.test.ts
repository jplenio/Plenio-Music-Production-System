/** The brief's creativity in the player (owner's requests 2026-10-19 and 2026-10-31): on a song's page with the
 * sampling it gave, and as a filter - a row of its six levels and the search ``creativity:``. Since 1.5.0 it goes to
 * 200 and 100 is the default; up to 100 a value means what it meant in 1.4. */
import { describe, expect, it } from 'vitest'

import type { SongSummary } from '../src/player/api'
import { CREATIVITY_RANGES, creativityLevel, describeCreativity, describeSampling, isReference } from '../src/player/creativity'
import { FACETS, facetValues, filterRows, matching, parseQuery, score, suggest, toggleFilterChip } from '../src/player/search'
import { FIXED_NOTE, samplingFacts, songFacts } from '../src/player/songFacts'

function song(over: Partial<SongSummary> & { id: string }): SongSummary {
  return {
    title: over.id, created: '2026-10-19T10:00:00', year: '2026', seconds: 180, model: 'YuE2', kind: 'song', brief: {}, genre: 'pop', mood: '',
    language: 'English', vocals: 'sung', instrumental: false, arrangement: 'off', template: '', style: '', lyrics: '',
    loudness: { lufs: -14, true_peak: -1, range: 6 }, tags: {}, plenio: '1.0.1', folder: '', file: over.id, takes_key: '',
    has: { audio: true, original: false, cover: false, pdf: false, lines: false, notes: false, stems: false, timing: false, score: false }, seeds: {}, writer: '',
    ...over,
  } // prettier-ignore
}

const made = (id: string, creativity: number | undefined, extra: Partial<SongSummary> = {}): SongSummary =>
  song({ id, brief: { kind: 'song', creativity, sources: { creativity: creativity === 50 ? 'default' : 'typed' } }, ...extra })

const SONGS = [
  made('steady', 10),
  made('old', 50), // made before the slider: the library reads 50, the reference
  made('varied', 75),
  made('bold', 100), // the default since 1.5.0
  made('wild', 180),
  song({ id: 'other', other: true, model: '' }), // other music: no brief, no creativity
]
const context = { favorites: new Set<string>() }
const find = (query: string): string[] => SONGS.filter((s) => score(s, parseQuery(query), context) > 0).map((s) => s.id)

describe('the creativity', () => {
  it('has the writer\'s levels', () => {
    expect([0, 19, 20, 39, 40, 60, 61, 80, 81, 150, 151, 200].map(creativityLevel)).toEqual([
      'steady', 'steady', 'restrained', 'restrained', 'balanced', 'balanced', 'varied', 'varied', 'experimental', 'experimental', 'adventurous', 'adventurous',
    ]) // prettier-ignore
    expect(describeCreativity(100)).toBe('100 - experimental, the default')
    expect(describeCreativity(50)).toBe('50 - balanced, the reference')
    expect(describeCreativity(75)).toBe('75 - varied')
  })

  it('shows on a song\'s page with the sampling it gave, the reference marked', () => {
    const varied = made('v', 75, {
      arrangement: 'varied',
      sampling: {
        writer: { temperature: 0.9 },
        arrangement: { temperature: 0.8 },
        plan: { temperature: 0.81, top_p: 0.925, top_k: 40 },
        take: { temperature: 1.05, top_p: 0.96, top_k: 125 },
      },
    })
    varied.brief.arrangement = 'varied'
    const facts = songFacts(varied)
    expect(facts.find((f) => f.label === 'Creativity')).toEqual({ label: 'Creativity', value: '75 - varied', note: '' })
    expect(facts.find((f) => f.label === 'YuE2 plan sampling')?.value).toBe('temperature 0.81 · top-p 0.925 · top-k 40')
    expect(facts.find((f) => f.label === 'Writer temperature')).toEqual({ label: 'Writer temperature', value: '0.9', note: '' })
    expect(facts.find((f) => f.label === 'Arrangement temperature')?.value).toBe('0.8')
    // before the model: the facts of the brief, then how it was sampled
    const labels = facts.map((f) => f.label)
    expect(labels.indexOf('Creativity')).toBeLessThan(labels.indexOf('YuE2 take sampling'))
    expect(labels.indexOf('YuE2 take sampling')).toBeLessThan(labels.indexOf('Model'))

    const reference = made('r', 50, {
      sampling: { writer: { temperature: 0.8 }, arrangement: { temperature: 0.7 }, plan: { temperature: 0.7, top_p: 0.9, top_k: 30 }, take: { temperature: 1, top_p: 0.95, top_k: 100 } },
    })
    expect(songFacts(reference).find((f) => f.label === 'Creativity')).toEqual({ label: 'Creativity', value: '50 - balanced, the reference', note: 'default' })
    const sampled = samplingFacts(reference)
    expect(sampled.map((f) => f.label)).toEqual(['Writer temperature', 'YuE2 plan sampling', 'YuE2 take sampling']) // no creative mode: no arrangement temperature
    expect(sampled.every((f) => f.note === 'the reference')).toBe(true)
    expect(isReference('take', { temperature: 1.1, top_p: 0.97, top_k: 150 })).toBe(false)
    expect(describeSampling({ temperature: 0.9 })).toBe('temperature 0.9')
    // other music and recordings: nothing of it
    expect(songFacts(SONGS[5]).some((f) => f.label === 'Creativity')).toBe(false)
  })

  it('says where the workflow had the sampling fixed while the brief asked for another creativity', () => {
    // owner's report 2026-10-20: a workflow saved before 1.0.2 - the slider at 100, its blocks' numbers fixed
    const fixed = {
      writer: { temperature: 0.8, fixed: true },
      plan: { temperature: 0.7, top_p: 0.9, top_k: 30, fixed: true },
      take: { temperature: 1.05, top_p: 0.96, top_k: 125 },
    }
    const notes = samplingFacts(made('f', 100, { sampling: fixed })).map((f) => [f.label, f.note])
    expect(notes).toEqual([
      ['Writer temperature', FIXED_NOTE],
      ['YuE2 plan sampling', FIXED_NOTE],
      ['YuE2 take sampling', ''],
    ])
    // at 50 the fixed numbers are the reference: a song made before the slider was made as 50 makes it now
    expect(samplingFacts(made('o', 50, { sampling: fixed })).map((f) => f.note)).toEqual(['the reference', 'the reference', ''])
  })

  it('filters by a level, by numbers and by name; other music is never in it', () => {
    const row = FACETS.find((f) => f.id === 'creativity')!
    expect(row.fixed).toBe(CREATIVITY_RANGES)
    expect(facetValues(SONGS, row, context)).toEqual([['0-19', 1], ['40-60', 1], ['61-80', 1], ['81-150', 1], ['151-200', 1]])
    expect(find('creativity:"61-80"')).toEqual(['varied'])
    expect(find('creativity:>60')).toEqual(['varied', 'bold', 'wild'])
    expect(find('creativity:varied')).toEqual(['varied'])
    expect(find('creativity:adventurous')).toEqual(['wild'])
    expect(find('creativity:50')).toEqual(['old'])
    expect(find('-creativity:balanced')).toEqual(['steady', 'varied', 'bold', 'wild', 'other'])
    // several levels at a time: the songs of either
    let chips = toggleFilterChip([], 'creativity', '81-150')
    chips = toggleFilterChip(chips, 'creativity', '151-200')
    expect(chips).toEqual(['creativity:"81-150"', 'creativity:"151-200"'])
    expect(matching(SONGS, '', chips, context).map((s) => s.id)).toEqual(['bold', 'wild'])
    const rows = filterRows(SONGS, '', chips, context)
    expect(rows.find((r) => r.key === 'creativity')?.all.map(([v]) => v)).toEqual(['0-19', '40-60', '61-80', '81-150', '151-200'])
  })

  it('is offered while typing', () => {
    expect(suggest('creat', SONGS, context).some((s) => s.query.startsWith('creativity:'))).toBe(true)
    const values = suggest('creativity:', SONGS, context).map((s) => s.query)
    expect(values).toEqual(['creativity:0-19 ', 'creativity:20-39 ', 'creativity:40-60 ', 'creativity:61-80 ', 'creativity:81-150 ', 'creativity:151-200 '])
  })
})
