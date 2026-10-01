/**
 * The lyrics follow the score's sections (docs/design/score-arrange-design.md §4): the lyric blocks
 * are laid onto the sections and follow real edits of the backend (models and time maps in
 * fixtures/arrange-edits.json, kept current by tests/unit/test_score_arrange.py).
 */
import { describe, expect, it } from 'vitest'

import type { ScoreModelView } from '../src/shared/scoreView'
import {
  followEdit,
  followOf,
  followText,
  parseLyrics,
  sectionKey,
  tagFor
} from '../src/sheet-editor/score/lyricsFollow'
import fixture from './fixtures/arrange-edits.json'

const BEFORE = fixture.before as unknown as ScoreModelView
const edit = (name: string) => {
  const found = fixture.edits.find((e) => e.name === name)
  if (!found) throw new Error(name)
  return { after: found.after as unknown as ScoreModelView, timeMap: found.time_map as number[][] | null }
}
const followed = (name: string, inserted?: Parameters<typeof followEdit>[4]): string => {
  const { after, timeMap } = edit(name)
  return followText(followEdit(followOf(fixture.lyrics, BEFORE)!, BEFORE, after, timeMap, inserted), after)
}
const tags = (text: string): string[] => parseLyrics(text).blocks.map((b) => b.tag)

describe('lyric blocks', () => {
  it('reads tags and lines as the backend does', () => {
    const lyrics = parseLyrics('a note\n\n[Verse 1]\n  one  \n\n\ntwo\n[Chorus]\r\nthree')
    expect(lyrics.preamble).toEqual(['a note'])
    expect(lyrics.blocks).toEqual([
      { tag: 'Verse 1', lines: ['one', 'two'] },
      { tag: 'Chorus', lines: ['three'] }
    ])
  })

  it('compares tags without numbers and writes new ones from the label', () => {
    expect(sectionKey('[Verse 2]')).toBe('verse')
    expect(sectionKey('Pre-Chorus')).toBe('pre-chorus')
    expect(tagFor('verse', { tag: 'Verse 2', lines: [] })).toBe('Verse 2')
    expect(tagFor('pre-chorus', null)).toBe('Pre-Chorus')
    expect(tagFor('chorus 2', { tag: 'Verse', lines: [] })).toBe('Chorus 2')
  })

  it('follows only lyrics whose sections match the score', () => {
    expect(followOf(fixture.lyrics, BEFORE)?.blocks.map((b) => b?.tag)).toEqual(['Intro', 'Verse 1', 'Chorus', 'Verse 2', 'Chorus', 'Outro'])
    expect(followText(followOf(fixture.lyrics, BEFORE)!, BEFORE)).toBe(fixture.lyrics)
    expect(followOf(fixture.lyrics.replace('[Verse 2]', '[Bridge]'), BEFORE)).toBeNull()
    expect(followOf('[Intro]\n\n[Verse]\nla', BEFORE)).toBeNull()
    expect(followOf('[instrumental]', BEFORE)).toBeNull()
    expect(followOf('', BEFORE)).toBeNull()
  })
})

describe('the lyrics follow real edits', () => {
  it('copy a duplicated chorus with its words', () => {
    expect(tags(followed('duplicate the first chorus'))).toEqual(['Intro', 'Verse 1', 'Chorus', 'Chorus', 'Verse 2', 'Chorus', 'Outro'])
    expect(parseLyrics(followed('duplicate the first chorus')).blocks[3].lines).toEqual(['chorus a', 'chorus b'])
  })

  it('move with a moved section and lose a deleted one', () => {
    expect(tags(followed('move the first chorus up'))).toEqual(['Intro', 'Chorus', 'Verse 1', 'Verse 2', 'Chorus', 'Outro'])
    expect(tags(followed('delete the second verse and chorus'))).toEqual(['Intro', 'Verse 1', 'Chorus', 'Outro'])
  })

  it('join the words of a joined section, and give a split-off part none', () => {
    const joined = parseLyrics(followed('join the first chorus to its verse')).blocks
    expect(joined.map((b) => b.tag)).toEqual(['Intro', 'Verse 1', 'Verse 2', 'Chorus', 'Outro'])
    expect(joined[1].lines).toEqual(['verse one a', 'verse one b', 'chorus a', 'chorus b'])
    const split = parseLyrics(followed('split the first verse')).blocks
    expect(split.map((b) => b.tag)).toEqual(['Intro', 'Verse 1', 'Bridge', 'Chorus', 'Verse 2', 'Chorus', 'Outro'])
    expect(split[2].lines).toEqual([])
    expect(split[1].lines).toEqual(['verse one a', 'verse one b'])
  })

  it('keep a section whose first bars were deleted, and ignore bars inserted inside a section', () => {
    const cut = parseLyrics(followed('delete bars across the chorus start')).blocks
    expect(cut.map((b) => b.tag)).toEqual(['Intro', 'Verse 1', 'Chorus', 'Verse 2', 'Chorus', 'Outro'])
    expect(cut[2].lines).toEqual(['chorus a', 'chorus b'])
    expect(followed('insert bars in the first verse')).toBe(fixture.lyrics)
  })

  it('take the new name of a renamed section', () => {
    expect(followed('rename the outro')).toContain('[Ending]\noutro a')
  })

  it('give an inserted section the words copied with it', () => {
    const chorus = { tag: 'Chorus', lines: ['chorus a', 'chorus b'] }
    const text = followed('insert a copied chorus before the second verse', (unit) => (unit === 464 ? chorus : null))
    expect(tags(text)).toEqual(['Intro', 'Verse 1', 'Chorus', 'Chorus', 'Verse 2', 'Chorus', 'Outro'])
    expect(parseLyrics(text).blocks[3].lines).toEqual(['chorus a', 'chorus b'])
    // without words in the clip the new section has none
    expect(parseLyrics(followed('insert a copied chorus before the second verse')).blocks[3].lines).toEqual([])
  })
})
