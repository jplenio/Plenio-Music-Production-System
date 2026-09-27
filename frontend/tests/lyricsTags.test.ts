/** The lyrics tag helpers and the "lyrics: yours (manual)" line of the state summary (M3/D7). */
import { describe, expect, it } from 'vitest'

import { SECTION_TAGS, withTag } from '../src/shared/lyricsTags'
import { summarize } from '../src/shared/sheetState'

describe('lyrics section tags', () => {
  it('appends a tag as its own line', () => {
    expect(withTag('', 'Verse')).toBe('[Verse]\n')
    expect(withTag('City lights are fading', 'Chorus')).toBe('City lights are fading\n\n[Chorus]\n')
    expect(withTag('a\n\n[Verse]\nb\n', 'Verse')).toBe('a\n\n[Verse]\nb\n') // already there
    expect(withTag('a\n\n[Verse]\nb\n', 'Bridge')).toBe('a\n\n[Verse]\nb\n\n[Bridge]\n')
    expect(SECTION_TAGS).toContain('Pre-Chorus')
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
