/** Share as a player in an order (an album keeps its running order): by album and track, by title, moved. */
import { describe, expect, it } from 'vitest'

import type { SongSummary } from '../src/player/api'
import { arranged, moved, trackOf } from '../src/player/shareOrder'
import { sortSongs } from '../src/player/search'

const song = (id: string, title: string, tags: Record<string, string> = {}): SongSummary => ({ id, title, tags, created: id }) as unknown as SongSummary
const SONGS = new Map(
  [
    song('a', 'Night Drive', { album: 'Lights', track: '3/4' }),
    song('b', 'Opening', { album: 'Lights', track: '1/4' }),
    song('c', 'Bonus'),
    song('d', 'Second Wave', { album: 'Lights', track: '2' }),
    song('e', 'Lights Out', { album: 'Lights' }),
  ].map((s) => [s.id, s]),
)

describe('the order of a shared player', () => {
  it('reads the track number of a tag such as 7/12', () => {
    expect(trackOf(song('x', 'x', { track: '7/12' }))).toBe(7)
    expect(trackOf(song('x', 'x', { tracknumber: ' 10' }))).toBe(10)
    expect(trackOf(song('x', 'x'))).toBe(Infinity)
  })

  it('arranges by album and track number, the songs without one after, by title', () => {
    // no album first ('' sorts first), then the album's tracks, then its song without a number
    expect(arranged(['a', 'b', 'c', 'd', 'e'], SONGS, 'album')).toEqual(['c', 'b', 'd', 'a', 'e'])
  })

  it('arranges by title with numbers as numbers, the other way round, and keeps an unknown song at the end', () => {
    const titled = new Map([song('x', '10 Ten'), song('y', '2 Two'), song('z', '1 One')].map((s) => [s.id, s]))
    expect(arranged(['x', 'gone', 'y', 'z'], titled, 'title')).toEqual(['z', 'y', 'x', 'gone'])
    expect(arranged(['x', 'y', 'z'], titled, 'reverse')).toEqual(['z', 'y', 'x'])
  })

  it('moves one song, clamped to the list', () => {
    expect(moved(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b'])
    expect(moved(['a', 'b', 'c'], 0, 9)).toEqual(['b', 'c', 'a'])
    expect(moved(['a', 'b', 'c'], 5, 0)).toEqual(['a', 'b', 'c'])
  })

  it('lists the songs as they came when sorted "shared"', () => {
    const list = ['b', 'a', 'e'].map((id) => SONGS.get(id) as SongSummary)
    expect(sortSongs(list, 'shared', { plays: {}, lastPlayed: {} }).map((s) => s.id)).toEqual(['b', 'a', 'e'])
  })
})
