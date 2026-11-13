import { describe, expect, it } from 'vitest'

import { BRIEFS, COVER_TEMPLATE, SONG_TEMPLATE } from '../src/mock/data'
import { LYRICS_IDEA, OWN_LYRICS, applies, fieldApplies, fromStyle, grouped, missing, moreGroups, moreStart, nearestLength, request, type Values } from '../src/form'

const synthwave = BRIEFS.find((b) => b.id === 'electronic/synth-pop-vocal')!

describe('the brief form', () => {
  it('fills every simple field from a style and keeps one’s own lyrics', () => {
    const own = fromStyle(synthwave, 'song', SONG_TEMPLATE, { lyrics_from: OWN_LYRICS, lyrics: 'my words' })
    expect(own.template).toBe(synthwave.id)
    expect(own.lyrics_from).toBe(OWN_LYRICS)
    expect(own.lyrics).toBe('my words')
    const idea = fromStyle(synthwave, 'song', SONG_TEMPLATE)
    expect(idea.lyrics_from).toBe(LYRICS_IDEA)
    // a length the template offers
    expect(SONG_TEMPLATE.fields.find((f) => f.id === 'length')?.choices).toContain(idea.length)
  })

  it('asks a cover neither tempo nor length, and its language only for new lyrics', () => {
    expect(applies('tempo', 'cover', { vocals: 'original lyrics' })).toBe(false)
    expect(applies('language', 'cover', { vocals: 'original lyrics' })).toBe(false)
    expect(applies('language', 'cover', { vocals: 'new lyrics' })).toBe(true)
    expect(applies('voice', 'song', { vocals: 'instrumental' })).toBe(false)
    expect(applies('lyrics', 'song', { vocals: 'sung', lyrics_from: LYRICS_IDEA })).toBe(true)
  })

  it('sends only the fields that apply', () => {
    const simple: Values = { ...fromStyle(synthwave, 'song', SONG_TEMPLATE), vocals: 'instrumental' }
    const more = moreStart(SONG_TEMPLATE)
    const body = request('song', simple, more, SONG_TEMPLATE)
    expect(body.voice).toBeUndefined()
    expect(body.genre).toBe(simple.genre)
    expect(body['finish.cover_art']).toBe(false) // the plug-in's default: no cover art
    // the instrumental's own fields (when: vocals = instrumental) go along
    expect('melody' in body).toBe(true)
  })

  it('evaluates a field’s when against the choices made', () => {
    const melody = SONG_TEMPLATE.fields.find((f) => f.id === 'melody')!
    expect(fieldApplies(melody, { vocals: 'sung' }, SONG_TEMPLATE)).toBe(false)
    expect(fieldApplies(melody, { vocals: 'instrumental' }, SONG_TEMPLATE)).toBe(true)
  })

  it('groups More: the studio first, a cover’s excerpt last', () => {
    const song = moreGroups(SONG_TEMPLATE).map((g) => g.title)
    expect(song[0]).toBe('The studio')
    const cover = moreGroups(COVER_TEMPLATE)
    expect(cover[cover.length - 1].title).toBe('An excerpt of the original')
    expect(cover.flatMap((g) => g.fields).some((f) => f.type === 'upload')).toBe(false)
  })

  it('shows a studio switch a newer Plenio brings, after the known ones', () => {
    const newer = { ...SONG_TEMPLATE, fields: [...SONG_TEMPLATE.fields, { ...SONG_TEMPLATE.fields.find((f) => f.id === 'finish.cover_art')!, id: 'finish.loudness', label: 'Loudness' }] }
    const studio = moreGroups(newer)[0]
    expect(studio.title).toBe('The studio')
    expect(studio.fields.map((f) => f.id)).toContain('finish.loudness')
    expect(studio.fields[0].id).toBe('finish.cover_art')
  })

  it('says what is missing', () => {
    expect(missing('cover', { template: 'none' }, '')).toEqual(['the original recording', 'a style, a genre or a description'])
    expect(missing('song', { template: synthwave.id, vocals: 'sung', lyrics_from: OWN_LYRICS, lyrics: ' ' }, '')).toEqual(['your lyrics'])
    expect(missing('song', { template: synthwave.id }, '')).toEqual([])
  })

  it('finds the nearest length and searches styles by every word', () => {
    expect(nearestLength('about 2:10', ['short (about 1:30)', 'about 2:00', 'about 2:30'])).toBe('about 2:00')
    const found = grouped(BRIEFS, 'synth pop')
    expect(found.flatMap(([, list]) => list).some((b) => b.id === synthwave.id)).toBe(true)
    expect(grouped(BRIEFS, 'no-such-style-at-all')).toEqual([])
  })
})
