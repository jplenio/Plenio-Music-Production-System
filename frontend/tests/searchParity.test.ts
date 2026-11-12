/** The page's search and the Player API's (plenio/player/search.py) find the same songs in the same order: both
 * read the cases of tests/fixtures/player/search-cases.json. */
import { describe, expect, it } from 'vitest'

import type { SongSummary } from '../src/player/api'
import { type Context, parseQuery, score } from '../src/player/search'
import cases from '../../tests/fixtures/player/search-cases.json'

const songs = cases.songs as unknown as SongSummary[]
const context: Context = {
  favorites: new Set(cases.state.favorites),
  tags: cases.state.tags,
  plays: cases.state.plays,
  ratings: cases.state.ratings,
  measured: cases.measured as Record<string, number | null>,
}

/** The best first, then the newest - as the Player API answers. */
function found(query: string): string[] {
  const terms = parseQuery(query)
  return songs
    .map((song) => ({ song, hit: score(song, terms, context) }))
    .filter((s) => s.hit > 0)
    .sort((a, b) => b.hit - a.hit || b.song.created.localeCompare(a.song.created))
    .map((s) => s.song.id)
}

describe('the search of the page and of the Player API', () => {
  for (const { query, ids } of cases.cases) {
    it(`finds the same for ${JSON.stringify(query)}`, () => {
      expect(found(query)).toEqual(ids)
    })
  }
})
