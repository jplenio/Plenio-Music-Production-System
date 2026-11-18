/**
 * The order of the songs in a shared player (Share as a player): an album keeps its running order. The songs
 * go into the file in this order, and the shared player lists and plays them so (``ordered`` in its data).
 */
import type { SongSummary } from './api'

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })

/** The song's track number from its tags (``7`` of ``7/12``); ``Infinity`` without one. */
export function trackOf(song: SongSummary): number {
  const found = /^\s*(\d+)/.exec(String(song.tags?.track ?? song.tags?.tracknumber ?? ''))
  return found ? Number(found[1]) : Infinity
}

/** The song's album: its tag, or what the file of other music says. */
export function albumOf(song: SongSummary): string {
  return String(song.tags?.album ?? song.album ?? '').trim()
}

export type Arrangement = 'album' | 'title' | 'reverse'

/** ``ids`` arranged: by album, then track number (songs without one after, by title); by title (numbers as
 * numbers: "2" before "10"); or the other way round. A song not known keeps its place at the end. */
export function arranged(ids: string[], songs: Map<string, SongSummary>, how: Arrangement): string[] {
  if (how === 'reverse') return [...ids].reverse()
  const known = ids.filter((id) => songs.has(id))
  const rest = ids.filter((id) => !songs.has(id))
  const title = (id: string): string => songs.get(id)?.title ?? ''
  const sorted = [...known].sort((a, b) => {
    if (how === 'album') {
      const x = songs.get(a) as SongSummary
      const y = songs.get(b) as SongSummary
      const byAlbum = collator.compare(albumOf(x), albumOf(y))
      if (byAlbum) return byAlbum
      const byTrack = trackOf(x) - trackOf(y)
      if (byTrack && Number.isFinite(byTrack)) return byTrack
      if (trackOf(x) !== trackOf(y)) return Number.isFinite(trackOf(x)) ? -1 : 1
    }
    return collator.compare(title(a), title(b))
  })
  return [...sorted, ...rest]
}

/** ``ids`` with the one at ``from`` moved to ``to`` (both clamped to the list). */
export function moved(ids: string[], from: number, to: number): string[] {
  if (from < 0 || from >= ids.length) return ids
  const target = Math.max(0, Math.min(ids.length - 1, to))
  if (target === from) return ids
  const next = [...ids]
  const [id] = next.splice(from, 1)
  next.splice(target, 0, id)
  return next
}
