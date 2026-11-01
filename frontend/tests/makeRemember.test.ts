/** The song form remembers what one chose (owner's request 2026-11-01): the last song's values and configuration,
 * checked against the form as it is now; *release at once* in the request; and section tags of one's own for one's own
 * lyrics (a user's request of the same day). */
import { describe, expect, it } from 'vitest'

import { LYRICS_IDEA, OWN_LYRICS, requestOf, retryRequest, type Draft, type FormData, type MakeJob, type StyleTemplate } from '../src/player/make/form'
import { rememberOf, rememberedOf, restoredFields, restoredKind } from '../src/player/make/remember'
import { MAX_OWN_TAGS, SECTION_TAGS, insertTag, ownTag, ownTags } from '../src/shared/lyricsTags'

const LENGTHS = ['very short (about 1:00)', 'short (about 1:30)', 'about 2:00', 'standard (about 3:00)', 'about 4:00']
const SYNTH: StyleTemplate = {
  id: 'electronic/synthwave',
  name: 'Synthwave',
  group: 'Electronic',
  fields: { genre: 'synthwave', tempo: '110 BPM', length: 'about 4:00', vocals: 'sung', voice: 'warm female vocal', lyrics: 'About neon nights.' }
}
const FORM: FormData = {
  source: 'package',
  templates: [SYNTH],
  values: { genre: ['synthwave'], mood: ['warm'] },
  song: { fields: [], choices: { length: LENGTHS, vocals: ['sung', 'sparse vocals', 'instrumental'] }, defaults: { length: 'short (about 1:30)', vocals: 'sung' } },
  cover: { fields: [], choices: { vocals: ['original lyrics', 'new lyrics', 'instrumental'] }, defaults: { vocals: 'original lyrics' } },
  limits: { description: 1500, text: 120, source_mb: 100, max_length: 'about 4:00' },
  covers: true
}

function ordered(): Draft {
  return {
    kind: 'song',
    fields: { template: 'electronic/synthwave', genre: 'synthwave', mood: 'my own mood', length: 'about 4:00', vocals: 'sung', lyrics_from: OWN_LYRICS, lyrics: '[Verse]\nOne\n\n[Violin Rise]', description: 'Bright' },
    source: null,
    again: null,
    studio: { fields: { 'finish.cover_art': false }, release: { mp3: true } }
  }
}

describe('the song form remembers', () => {
  it('the last song ordered: its fields and its configuration', () => {
    const kept = rememberOf(ordered(), { preset: 'party', count: 3, several: 'takes', releaseNow: true })
    expect(kept).toMatchObject({ kind: 'song', preset: 'party', count: 3, several: 'takes', releaseNow: true })
    expect(kept.fields.mood).toBe('my own mood')
    expect(kept.studio).toEqual({ fields: { 'finish.cover_art': false }, release: { mp3: true } })
    // one song: no count kept
    expect(rememberOf(ordered(), { preset: '', count: 1, several: 'takes', releaseNow: false })).not.toHaveProperty('count')
  })

  it('made again from a song only its configuration - the fields were that song’s', () => {
    const before = rememberOf(ordered(), { preset: '', count: 1, several: 'takes', releaseNow: false })
    const again: Draft = { ...ordered(), again: 'song', fields: { genre: 'polka' }, studio: { fields: { 'finish.cover_art': true }, release: {} } }
    const kept = rememberOf(again, { preset: 'best', count: 1, several: 'takes', releaseNow: false }, before)
    expect(kept.fields.genre).toBe('synthwave')
    expect(kept.studio?.fields).toEqual({ 'finish.cover_art': true })
    expect(kept.preset).toBe('best')
  })

  it('opens with them as far as the form offers them now', () => {
    const kept = rememberedOf(JSON.parse(JSON.stringify(rememberOf(ordered(), { preset: '', count: 1, several: 'takes', releaseNow: false }))))
    expect(kept).not.toBeNull()
    const fields = restoredFields(kept!, 'song', FORM)
    expect(fields).toMatchObject({ template: 'electronic/synthwave', genre: 'synthwave', mood: 'my own mood', lyrics_from: OWN_LYRICS, description: 'Bright', voice: 'warm female vocal' })
    expect(fields.lyrics).toBe('[Verse]\nOne\n\n[Violin Rise]')
    // the host allows shorter songs now: the longest offered
    const shorter: FormData = { ...FORM, song: { ...FORM.song, choices: { ...FORM.song.choices, length: LENGTHS.slice(0, 3) } } }
    expect(restoredFields(kept!, 'song', shorter).length).toBe('about 2:00')
    // a style the templates no longer have: none, the remembered values stay
    const gone = restoredFields(kept!, 'song', { ...FORM, templates: [] })
    expect(gone).toMatchObject({ template: 'none', genre: 'synthwave', mood: 'my own mood' })
    // a vocals choice the form does not offer: the form's
    const odd = rememberedOf({ kind: 'song', fields: { vocals: 'yodel', lyrics_from: 'whatever' } })!
    expect(restoredFields(odd, 'song', FORM)).toMatchObject({ vocals: 'sung', lyrics_from: LYRICS_IDEA })
  })

  it('a cover only while the host allows covers, and nothing of what it does not know', () => {
    const cover = rememberedOf({ kind: 'cover', fields: { genre: 'jazz', bogus: 'x', vocals: 7 }, count: 9, preset: 3 })!
    expect(restoredKind(cover, FORM)).toBe('cover')
    expect(restoredKind(cover, { ...FORM, covers: false })).toBe('song')
    expect(cover.fields).toEqual({ genre: 'jazz' })
    expect(cover).not.toHaveProperty('count')
    expect(cover).not.toHaveProperty('preset')
    expect(rememberedOf(null)).toBeNull()
    expect(rememberedOf('text')).toBeNull()
  })
})

describe('release at once', () => {
  it('goes with the request where the form asks it, and with a song ordered again', () => {
    const draft = { ...ordered(), releaseNow: true }
    expect(requestOf(draft).release_now).toBe(true)
    expect(requestOf({ ...ordered(), releaseNow: false }).release_now).toBe(false)
    expect(requestOf(ordered())).not.toHaveProperty('release_now')
    const job = { fields: { genre: 'jazz' }, release_now: true } as unknown as MakeJob
    expect(retryRequest(job).release_now).toBe(true)
  })
})

describe('section tags of one’s own', () => {
  it('are kept as typed, one line without brackets, each once', () => {
    expect(ownTag('[Violin Rise]')).toBe('Violin Rise')
    expect(ownTag('  Instrument -\n Violin   Rise ')).toBe('Instrument - Violin Rise')
    expect(ownTag('[]')).toBeNull()
    expect(ownTag('x'.repeat(60))).toHaveLength(40)
    expect(ownTags(['Violin Rise', 'violin rise', 'Chorus', 7, '[Breakdown]'], SECTION_TAGS)).toEqual(['Violin Rise', 'Breakdown'])
    expect(ownTags(Array.from({ length: 40 }, (_, i) => `Tag ${i}`))).toHaveLength(MAX_OWN_TAGS)
    expect(ownTags('nope')).toEqual([])
  })

  it('YuE2’s own sections are offered first, Interlude among them', () => {
    expect(SECTION_TAGS).toEqual(['Intro', 'Verse', 'Pre-Chorus', 'Chorus', 'Bridge', 'Interlude', 'Instrumental', 'Outro'])
    expect(insertTag('[Verse]\nOne', 'Violin Rise').text).toBe('[Verse]\nOne\n\n[Violin Rise]\n')
  })
})
