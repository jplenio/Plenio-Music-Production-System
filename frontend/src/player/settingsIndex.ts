/**
 * The Settings page's index (phase 6.4, PD §9.2): its sections as tabs, a search over every setting's label, and
 * *Basic* - eight settings most people change - beside *Everything*. And where every setting the player keeps can be
 * changed, so that none of 1.6.0's is lost on the way (a test reads the components for each).
 */

export interface SettingLabel {
  /** The section of the Settings page (its element id), or another place of the player. */
  section: string
  label: string
  /** More words a search finds it by. */
  words?: string
}

/** The Settings page's sections, in its order: id and tab name. */
export const SECTIONS: [string, string][] = [
  ['basic', 'Basic'],
  ['people', 'People & access'],
  ['kept', 'Kept'],
  ['studio', 'The studio'],
  ['comfyui', 'ComfyUI'],
  ['songs', 'Songs'],
  ['sound', 'Sound'],
  ['tags', 'Tags'],
  ['lyrics', 'Lyrics'],
  ['shared', 'Shared players'],
  ['videos', 'Videos'],
  ['player', 'The player'],
]

/** Every label of the Settings page, by section (a test checks each against the page's source). */
export const LABELS: SettingLabel[] = [
  { section: 'basic', label: 'Crossfade between songs', words: 'fade blend gap seconds' },
  { section: 'basic', label: 'Shuffle', words: 'random order' },
  { section: 'basic', label: 'Repeat', words: 'loop again' },
  { section: 'basic', label: 'Volume', words: 'loud quiet' },
  { section: 'basic', label: 'Play the MP3 where a song has one', words: 'data network phone' },
  { section: 'basic', label: 'Show the sidebar', words: 'menu navigation' },
  { section: 'basic', label: 'Now playing opens with', words: 'stage lyrics notation visual view' },
  { section: 'basic', label: 'Live Play: where a new song goes', words: 'live next end random party' },
  { section: 'people', label: 'People & access', words: 'accounts users login password invite party guests network devices phone qr code party songs make songs approve' },
  { section: 'kept', label: 'Download a backup', words: 'back up backup restore start afresh playlists favourites state' },
  { section: 'studio', label: 'The studio', words: 'start comfyui from the player port' },
  { section: 'comfyui', label: 'ComfyUI', words: 'address open in comfyui url' },
  { section: 'songs', label: 'Songs', words: 'folders folder add remove other music look for new songs' },
  { section: 'sound', label: 'Sound', words: 'mp3 crossfade speed volume' },
  { section: 'tags', label: 'Tags', words: 'rename delete tag' },
  { section: 'lyrics', label: 'Lyrics', words: 'font size colour effect look' },
  { section: 'shared', label: 'Shared players', words: 'share package zip html' },
  { section: 'videos', label: 'Videos', words: 'video mp4 folder' },
  { section: 'player', label: 'The player', words: 'stop quit version' },
]

/** The sections a search finds (every word in a label or its words; empty: all). */
export function searchSettings(query: string, labels: SettingLabel[] = LABELS): Set<string> {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (!words.length) return new Set(SECTIONS.map(([id]) => id))
  return new Set(labels.filter((l) => words.every((w) => `${l.label} ${l.words ?? ''}`.toLowerCase().includes(w))).map((l) => l.section))
}

/**
 * Where each setting the player keeps is changed (``Settings`` of store.ts): a component that has the control, or
 * *kept by itself* with what keeps it. A setting of 1.6.0 that has no place here fails the test.
 */
export const SETTING_HOMES: Record<string, { component: string } | { kept: string }> = {
  volume: { component: 'PlayerBar' },
  crossfade: { component: 'SettingsView' },
  rate: { component: 'PlayerBar' },
  sort: { component: 'LibraryView' },
  view: { component: 'LibraryView' },
  repeat: { component: 'PlayerBar' },
  shuffle: { component: 'PlayerBar' },
  visuals: { component: 'NowPlaying' },
  resume: { kept: 'the queue and the place in the song, when the page closes' },
  sidebar: { component: 'SettingsView' },
  npView: { component: 'NowPlaying' },
  songTab: { component: 'SongView' },
  comfyui: { component: 'SettingsView' },
  filters: { kept: 'the search and filter chips of each list, as left' },
  live: { component: 'LiveView' },
  video: { kept: 'the last choices of Save as a video' },
  lyrics: { component: 'SettingsView' },
  lyricsChoice: { component: 'LyricsVersionSwitch' },
  lyricsFor: { kept: 'the version of the lyrics chosen for single songs' },
  lyricsView: { component: 'SongView' },
  mp3: { component: 'SettingsView' },
  notationShift: { kept: 'where the notation cursor was moved, per song' },
  savedFilters: { component: 'Sidebar' },
  moreFilters: { component: 'LibraryView' },
  welcomed: { component: 'LibraryView' },
  phoneView: { component: 'LibraryView' },
  makePresets: { kept: 'presets of one’s own, made on Make a song' },
  makeLast: { kept: 'the last song’s values for Make a song' },
  makeTags: { kept: 'section tags of one’s own for own lyrics' },
  party: { component: 'PeopleView' },
}
