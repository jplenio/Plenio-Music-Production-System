/** What plays now, in song time: its lines, sections, the current line and section, its colours. */
import { computed, ref, watch } from 'vue'

import { mediaReady } from './api'
import { coverHue, paletteFrom, songHue } from './colors'
import { fontOf, litColor } from './lyricsStyle'
import { chooseFor, linesFor, type LyricsVersion, sungOf, versionFor } from './lyricsVersion'
import { current, detail, duration, heard, queueSource, settings, state } from './store'
import { lineAt, sectionAt, sectionsInSong, songAnchors } from './timing'

/** The lyrics as written, timed: their syllables carry the score's times, so the notation follows them. */
export const writtenLines = computed(() => detail.value?.lines ?? [])
/** Which lyrics the song follows: as written, or as sung (the rule, or the listener's choice; lyricsVersion.ts). */
export const lyricsVersion = computed(() => versionFor(detail.value, settings))
/** The lines shown and followed. */
export const lines = computed(() => linesFor(detail.value, lyricsVersion.value))

/** The other lyrics for the song that plays (W, the player bar's switch); ``null`` when it has only one. */
export function toggleLyrics(): LyricsVersion | null {
  const song = detail.value
  if (!song || !sungOf(song)) return null
  const next = lyricsVersion.value === 'sung' ? 'written' : 'sung'
  chooseFor(song, next, settings)
  return next
}
export const anchors = computed(() => songAnchors(writtenLines.value, detail.value?.notation))
export const sections = computed(() =>
  sectionsInSong(detail.value?.notation.sections, anchors.value, detail.value?.notation.warp, duration.value || Infinity)
)
export const section = computed(() => sectionAt(sections.value, heard.value))
export const lineIndex = computed(() => lineAt(lines.value, heard.value))

/** The playlist the queue came from, for its visual. */
export const playlistVisual = computed(() => state.playlists.find((p) => p.id === queueSource.value)?.visual ?? '')

const coverHues = new Map<string, number | null>()
export const hue = ref(220)
watch(
  current,
  async (song) => {
    if (!song) return
    hue.value = songHue(song.id, song.genre)
    if (song.has.cover) {
      if (!coverHues.has(song.id)) coverHues.set(song.id, await coverHue(await mediaReady(song.id, 'cover')))
      const found = coverHues.get(song.id)
      if (found !== null && found !== undefined && current.value?.id === song.id) hue.value = found
    }
  },
  { immediate: true }
)
export const palette = computed(() => paletteFrom(hue.value))

/** The CSS custom properties of the song's colours - and of the lyrics' font, size and colour. */
export const paletteStyle = computed(() => {
  const font = fontOf(settings.lyrics)
  return {
    '--accent': palette.value.accent,
    '--accent2': palette.value.accent2,
    '--deep': palette.value.deep,
    '--glow': palette.value.glow,
    '--lyrics-font': font.stack,
    '--lyrics-weight': String(font.weight),
    '--lyrics-scale': String(settings.lyrics.size),
    '--lit': litColor(settings.lyrics, palette.value.accent),
  }
})

export const playCount = computed(() => (current.value ? state.plays[current.value.id] ?? 0 : 0))
