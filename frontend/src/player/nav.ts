/**
 * The player's five places (phase 6.4, PD §9.2): **Songs**, **Playlists** (the smart lists and saved filters
 * inside), **Live** (Live Play and the party), **Make**, **More** (People & access, In the making, Help, Settings) -
 * the same five in the sidebar of a desktop and in the tab bar of a phone. Every route belongs to one place.
 */

export type Place = 'songs' | 'playlists' | 'live' | 'make' | 'more'

export interface PlaceDef {
  id: Place
  label: string
  icon: string
  path: string
}

export const PLACES: PlaceDef[] = [
  { id: 'songs', label: 'Songs', icon: 'music', path: '/' },
  { id: 'playlists', label: 'Playlists', icon: 'playlist', path: '/playlists' },
  { id: 'live', label: 'Live', icon: 'live', path: '/live' },
  { id: 'make', label: 'Make', icon: 'wand', path: '/make' },
  { id: 'more', label: 'More', icon: 'list', path: '/people' },
]

/** The smart lists, inside Playlists. */
export const SMART_LISTS: [string, string, string][] = [
  ['/favorites', 'Favourites', 'heart'],
  ['/top', 'Most played', 'star'],
  ['/recent', 'Recently played', 'clock'],
]

/** What *More* holds. */
export const MORE: [string, string, string][] = [
  ['/people', 'People & access', 'guests'],
  ['/jobs', 'In the making', 'layers'],
  ['/help', 'Help & tutorials', 'help'],
  ['/settings', 'Settings', 'gear'],
]

/** The place a route belongs to. */
export function placeOf(route: string): Place {
  const first = route.split('/')[1] ?? ''
  if (first === '' || first === 'song' || first === 'record') return 'songs'
  if (first === 'playlists' || first === 'playlist' || first === 'favorites' || first === 'top' || first === 'recent') return 'playlists'
  if (first === 'live') return 'live'
  if (first === 'make') return 'make'
  return 'more'
}

/** The settings sections that moved to People & access (their old addresses lead there). */
export const MOVED_TO_PEOPLE = new Set(['accounts', 'network', 'party'])

/** A route of before 2.0 that now lives elsewhere (``null``: it stays). */
export function movedRoute(route: string): string | null {
  const [, first = '', second = ''] = route.split('/')
  return first === 'settings' && MOVED_TO_PEOPLE.has(second) ? '/people' : null
}
