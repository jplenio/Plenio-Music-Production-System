/** The lyrics tag helpers and the "lyrics: yours (manual)" line of the state summary (M3/D7). */
import { describe, expect, it } from 'vitest'

import { SECTION_TAGS, insertTag } from '../src/shared/lyricsTags'
import { summarize } from '../src/shared/sheetState'

describe('lyrics section tags', () => {
  it('appends a tag as its own line without a cursor', () => {
    expect(insertTag('', 'Verse')).toEqual({ text: '[Verse]\n', caret: 8 })
    expect(insertTag('City lights are fading', 'Chorus').text).toBe('City lights are fading\n\n[Chorus]\n')
    expect(insertTag('a\n\n[Verse]\nb\n', 'Verse').text).toBe('a\n\n[Verse]\nb\n\n[Verse]\n') // a second verse
    expect(insertTag('a\n\n', 'Bridge').text).toBe('a\n\n[Bridge]\n') // the blank line is already there
    expect(SECTION_TAGS).toContain('Pre-Chorus')
    expect(SECTION_TAGS).toContain('Instrumental')
  })

  it('inserts at the cursor (GitHub issue #3), the caret where the first line of the section goes', () => {
    const text = '[Verse]\nfirst line\nsecond line\n\n[Outro]\nlast line\n'
    // at the start of a line: the tag goes before it, after a blank line
    const start = insertTag(text, 'Chorus', text.indexOf('second'))
    expect(start.text).toBe('[Verse]\nfirst line\n\n[Chorus]\nsecond line\n\n[Outro]\nlast line\n')
    expect(start.text.slice(start.caret)).toMatch(/^second line/)
    // on the blank line between sections
    const gap = insertTag(text, 'Instrumental', text.indexOf('\n[Outro]'))
    expect(gap.text).toBe('[Verse]\nfirst line\nsecond line\n\n[Instrumental]\n[Outro]\nlast line\n')
    // at the end of a line: a new section after it
    const end = insertTag(text, 'Bridge', text.indexOf('\n\n[Outro]'))
    expect(end.text).toBe('[Verse]\nfirst line\nsecond line\n\n[Bridge]\n\n[Outro]\nlast line\n')
    expect(end.text.slice(end.caret)).toBe('\n[Outro]\nlast line\n')
    // inside a line: it is broken there
    expect(insertTag('hello world', 'Chorus', 5).text).toBe('hello\n\n[Chorus]\nworld')
    // at the very start
    expect(insertTag(text, 'Intro', 0).text).toBe('[Intro]\n' + text)
  })

  it('says that the lyrics are yours in the state summary', () => {
    const state = {
      schema: 'plenio.sheet_state/1' as const,
      docs: { lyrics: { state: 'manual' as const, text: 'x' } }
    }
    expect(summarize(state)).toBe('lyrics: yours (manual)')
    expect(summarize({ ...state, docs: { lyrics: { state: 'edited' as const, text: 'x' } } })).toBe('lyrics edited')
  })
})
