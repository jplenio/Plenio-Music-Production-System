/**
 * The library's search: free words over title, genre, mood, style, lyrics, the brief and your tags, plus field
 * filters - ``genre:pop``, ``mood:warm``, ``bpm:>100``, ``bpm:90-120``, ``key:Am``, ``model:yue2``,
 * ``year:2026``, ``lang:german``, ``vocals:instrumental``, ``mode:jazz`` (the creative mode), ``len:<3``
 * (minutes), ``creativity:>60`` (or ``creativity:varied``), ``tag:party`` (or ``#party``), ``is:fav``, ``is:unplayed``, ``has:pdf``,
 * ``stars:>=4`` (your stars; ``stars:none``: not rated yet), ``measured:<2`` (the measured stars) - and ``"quoted phrases"``;
 * ``-`` in front keeps out what matches. Every word must match; the best matches come first. The filter chips
 * (``chipFilter``): several in one row are alternatives, the rows must all match.
 */
import type { SongSummary } from './api'
import { CREATIVITY_LEVELS, CREATIVITY_RANGES, creativityLevel } from './creativity'

export interface Term {
  field: string
  value: string
  negate: boolean
}

const FIELDS: Record<string, string> = {
  genre: 'genre', g: 'genre', mood: 'mood', bpm: 'bpm', tempo: 'bpm', key: 'key', model: 'model', m: 'model',
  year: 'year', lang: 'language', language: 'language', vocals: 'vocals', mode: 'mode', arrangement: 'mode',
  len: 'len', length: 'len', is: 'is', has: 'has', title: 'title', lyrics: 'lyrics', style: 'style', artist: 'artist', album: 'album',
  plenio: 'plenio', version: 'plenio',
  template: 'template', writer: 'writer', meter: 'meter', tag: 'tag', tags: 'tag', kind: 'kind',
  creativity: 'creativity', creative: 'creativity',
  stars: 'stars', rating: 'stars', rated: 'stars', measured: 'measured', auto: 'measured',
}  // prettier-ignore

export function parseQuery(query: string): Term[] {
  const terms: Term[] = []
  const pattern = /(-)?(?:(\w+):)?(?:"([^"]*)"|(\S+))/g
  for (const match of query.matchAll(pattern)) {
    const [, minus, rawField, quoted, bare] = match
    const value = (quoted ?? bare ?? '').trim()
    if (!value) continue
    // #party: the tag "party"
    if (!rawField && !quoted && value.length > 1 && value.startsWith('#')) {
      terms.push({ field: 'tag', value: value.slice(1), negate: !!minus })
      continue
    }
    const field = rawField && FIELDS[rawField.toLowerCase()] ? FIELDS[rawField.toLowerCase()] : ''
    terms.push({ field, value: field ? value : rawField ? `${rawField}:${value}` : value, negate: !!minus })
  }
  return terms
}

export const fold = (s: string): string =>
  s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()

function numberTest(value: string, actual: number | null | undefined): boolean {
  if (actual === null || actual === undefined || !Number.isFinite(actual)) return false
  const range = value.match(/^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)$/)
  if (range) return actual >= Number(range[1]) && actual <= Number(range[2])
  const compare = value.match(/^(<=|>=|<|>|=)?\s*(\d+(?:\.\d+)?)$/)
  if (!compare) return false
  const n = Number(compare[2])
  switch (compare[1]) {
    case '<': return actual < n
    case '<=': return actual <= n
    case '>': return actual > n
    case '>=': return actual >= n
    default: return Math.abs(actual - n) < 0.5
  }
}  // prettier-ignore

export interface Context {
  favorites: Set<string>
  /** The listener's own tags per song (``tag:``, ``#``, and free words). */
  tags?: Record<string, string[]>
  /** Plays per song (``is:played``, ``is:unplayed``). */
  plays?: Record<string, number>
  /** The listener's own stars per song, 0 to 5 in halves (``stars:``). */
  ratings?: Record<string, number>
  /** The measured stars per song (``measured:``; ``null``: measured, without stars). */
  measured?: Record<string, number | null>
}

/** How well ``song`` matches ``terms`` (0: not at all). Title hits weigh most, lyrics least. */
export function score(song: SongSummary, terms: Term[], context: Context): number {
  let total = 1
  for (const term of terms) {
    const hit = matches(song, term, context)
    if (term.negate ? hit > 0 : hit === 0) return 0
    if (!term.negate) total += hit
  }
  return total
}

/** The filter chips facets offer one of: *from 0.8.0* already holds every newer version, so two make no
 * sense. Every other row takes several (``chipFilter``). */
export const SINGLE_CHOICE_FACETS = new Set(['plenio'])

/** The filter chips after a click on ``key:"value"``: a chip that is on goes off; a new one is added - and in
 * a facet of one choice it takes the place of the one chosen before. ``exclude``: the chip keeps those songs
 * out (``-key:"value"``); a chip of the other kind for the same value gives way to it. */
export function toggleFilterChip(chips: string[], key: string, value: string, exclude = false): string[] {
  const chip = `${exclude ? '-' : ''}${key}:"${value}"`
  if (chips.includes(chip)) return chips.filter((c) => c !== chip)
  const opposite = `${exclude ? '' : '-'}${key}:"${value}"`
  let kept = chips.filter((c) => c !== opposite)
  if (SINGLE_CHOICE_FACETS.has(key) && !exclude) kept = kept.filter((c) => !c.startsWith(`${key}:"`))
  return [...kept, chip]
}

/** A chip's parts: ``-genre:"jazz"`` -> ``{ key: 'genre', value: 'jazz', exclude: true }``. */
export function chipParts(chip: string): { key: string; value: string; exclude: boolean } | null {
  const match = /^(-)?(\w+):"(.*)"$/.exec(chip)
  return match ? { key: match[2], value: match[3], exclude: !!match[1] } : null
}

/** ``1.0.0`` -> ``[1, 0, 0]`` (``null``: no version - other music, or a record from before versions). */
export function versionOf(text: string | undefined): number[] | null {
  const match = /^(\d+)\.(\d+)(?:\.(\d+))?/.exec(text ?? '')
  return match ? [Number(match[1]), Number(match[2]), Number(match[3] ?? 0)] : null
}

export function compareVersions(a: number[], b: number[]): number {
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] - b[i]
  return 0
}

/** A song's Plenio version against ``>=0.8``, ``from 0.8.0``, ``>0.7``, ``<0.8``, ``0.6-0.7`` or ``1.0.0``
 * (that version; ``0.8``: any 0.8.x). A song without a version never matches. */
export function versionTest(query: string, version: string | undefined): boolean {
  const have = versionOf(version)
  if (!have) return false
  const q = query.trim().replace(/^from\s+/i, '>=')
  const range = /^(\d+\.\d+(?:\.\d+)?)\s*-\s*(\d+\.\d+(?:\.\d+)?)$/.exec(q)
  if (range) {
    const low = versionOf(range[1]) as number[]
    const high = versionOf(range[2]) as number[]
    const highParts = range[2].split('.').length
    return compareVersions(have, low) >= 0 && (highParts === 2 ? compareVersions(have.slice(0, 2).concat(0), high) <= 0 : compareVersions(have, high) <= 0)
  }
  const op = /^(>=|<=|>|<|=)?\s*(\d+\.\d+(?:\.\d+)?)$/.exec(q)
  if (!op) return false
  const want = versionOf(op[2]) as number[]
  const c = compareVersions(have, want)
  switch (op[1]) {
    case '>=': return c >= 0
    case '<=': return c <= 0
    case '>': return c > 0
    case '<': return c < 0
    default: return op[2].split('.').length === 2 ? have[0] === want[0] && have[1] === want[1] : c === 0
  }
} // prettier-ignore

/** ``has:pdf`` (or ``sheet``), ``has:timing`` (timed lyrics, measured or from subtitle files), ``has:lyrics``,
 * ``has:score``, ``has:original``, ``has:cover``, ``has:stems``. */
function hasTest(song: SongSummary, v: string): boolean {
  if (v === 'lyrics') return !!song.lyrics
  if (v === 'timing') return song.has.timing || song.has.lines
  return !!(song.has as Record<string, boolean>)[v === 'sheet' ? 'pdf' : v]
}

/** ``is:fav``, ``is:cover``, ``is:other``, ``is:plenio``, ``is:played``, ``is:unplayed``, ``is:tagged``,
 * ``is:untagged``, ``is:instrumental``. */
function isTest(song: SongSummary, v: string, context: Context): boolean {
  switch (v) {
    case 'fav': case 'favorite': case 'favourite': return context.favorites.has(song.id)
    case 'cover': return song.kind === 'cover'
    case 'other': return !!song.other
    case 'plenio': return !song.other
    case 'played': return (context.plays?.[song.id] ?? 0) > 0
    case 'unplayed': case 'never': return !(context.plays?.[song.id] ?? 0)
    case 'tagged': return (context.tags?.[song.id] ?? []).length > 0
    case 'untagged': return !(context.tags?.[song.id] ?? []).length
    case 'instrumental': return song.instrumental
    default: return false
  }
} // prettier-ignore

/** ``creativity:>60``, ``creativity:40-60``, ``creativity:75`` or a level, ``creativity:varied`` (other music has
 * none). */
function creativityTest(value: string, creativity: number | null | undefined): boolean {
  if (creativity === null || creativity === undefined) return false
  const level = fold(value)
  if (CREATIVITY_LEVELS.some(([, name]) => name === level)) return creativityLevel(creativity) === level
  return numberTest(value, creativity)
}

/** ``stars:>=4``, ``stars:3-4``, ``stars:5`` - or ``stars:none``: no stars (not rated, not measured yet). */
function starsTest(value: string, stars: number | null | undefined): boolean {
  if (fold(value) === 'none') return stars === null || stars === undefined
  return numberTest(value, stars)
}

/** Every text of a song folded once (a library of thousands of songs folded its lyrics again for every song at every
 * key typed: 140 ms a key for 2958 songs). The summaries of a library do not change, so they are kept by the object. */
const foldedTexts = new WeakMap<SongSummary, Map<string | undefined, string>>()
function foldedOf(song: SongSummary, text: string | undefined): string {
  let known = foldedTexts.get(song)
  if (!known) {
    known = new Map()
    foldedTexts.set(song, known)
  }
  let found = known.get(text)
  if (found === undefined) {
    found = text ? fold(text) : ''
    known.set(text, found)
  }
  return found
}

function matches(song: SongSummary, term: Term, context: Context): number {
  const v = fold(term.value)
  const has = (text: string | undefined): boolean => !!text && foldedOf(song, text).includes(v)
  switch (term.field) {
    case 'genre': return has(song.genre) ? 3 : 0
    case 'mood': return has(song.mood) ? 3 : 0
    case 'bpm': return numberTest(term.value, song.bpm) ? 2 : 0
    case 'key': return fold(song.score_key ?? '') === v || fold(song.brief.key ?? '').startsWith(v) ? 2 : 0
    case 'model': return has(song.model) || (v === 'master' && !song.model && !song.other) ? 2 : 0
    case 'year': return song.year === term.value ? 2 : 0
    case 'language': return has(song.language) ? 2 : 0
    case 'vocals': return has(song.vocals) || (v === 'sung' && !song.instrumental && !!song.vocals && song.vocals !== 'sparse vocals') ? 2 : 0
    case 'mode': return has(song.arrangement) ? 2 : 0
    case 'len': return numberTest(term.value, song.seconds / 60) ? 2 : 0
    case 'creativity': return creativityTest(term.value, song.brief.creativity) ? 2 : 0
    case 'stars': return starsTest(term.value, context.ratings?.[song.id]) ? 2 : 0
    case 'measured': return starsTest(term.value, context.measured?.[song.id]) ? 2 : 0
    case 'meter': return has(song.score_meter) || has(song.brief.meter) ? 2 : 0
    case 'is': return isTest(song, v, context) ? 2 : 0
    case 'plenio': return versionTest(term.value, song.plenio) ? 2 : 0
    case 'artist': return has(song.artist) || has(song.tags.artist) ? 3 : 0
    case 'album': return has(song.album) || has(song.tags.album) ? 3 : 0
    case 'has': return hasTest(song, v) ? 2 : 0
    case 'title': return has(song.title) ? 5 : 0
    case 'lyrics': return has(song.lyrics) ? 2 : 0
    case 'style': return has(song.style) ? 2 : 0
    case 'template': return has(song.template) ? 2 : 0
    case 'writer': return has(song.writer) ? 2 : 0
    case 'kind': return fold(song.other ? 'other' : song.kind) === v ? 2 : 0
    case 'tag': return (context.tags?.[song.id] ?? []).some((t) => fold(t) === v) ? 4 : 0
    default: {
      if (has(song.title)) return 6
      if (has(song.genre) || has(song.mood) || has(song.artist) || has(song.album) || has(song.tags.artist) || has(song.tags.album)) return 4
      if ((context.tags?.[song.id] ?? []).some((t) => fold(t).includes(v))) return 4
      if (has(song.style) || has(song.template) || has(song.brief.description) || has(song.brief.theme)) return 3
      if (has(song.language) || has(song.model) || has(song.arrangement)) return 2
      if (has(song.lyrics)) return 1
      return 0
    }
  }
}  // prettier-ignore

export type SortKey = 'newest' | 'oldest' | 'title' | 'length' | 'bpm' | 'loudness' | 'plays' | 'recent' | 'relevance'

export interface Facts {
  plays: Record<string, number>
  lastPlayed: Record<string, string>
}

export function sortSongs(songs: SongSummary[], key: SortKey, facts: Facts, relevance?: Map<string, number>): SongSummary[] {
  const list = [...songs]
  const by = (f: (s: SongSummary) => number | string, desc = false) =>
    list.sort((a, b) => {
      const x = f(a)
      const y = f(b)
      const order = x < y ? -1 : x > y ? 1 : 0
      return desc ? -order : order
    })
  switch (key) {
    case 'oldest': return by((s) => s.created)
    case 'title': return by((s) => fold(s.title))
    case 'length': return by((s) => s.seconds, true)
    case 'bpm': return by((s) => s.bpm ?? 0, true)
    case 'loudness': return by((s) => s.loudness.lufs ?? -99, true)
    case 'plays': return by((s) => facts.plays[s.id] ?? 0, true)
    case 'recent': return by((s) => facts.lastPlayed[s.id] ?? '', true)
    case 'relevance': return relevance ? by((s) => relevance.get(s.id) ?? 0, true) : by((s) => s.created, true)
    default: return by((s) => s.created, true)
  }
}  // prettier-ignore

/** Where a free word occurs in the lyrics: a short excerpt around it (for the result card). */
export function lyricsSnippet(song: SongSummary, terms: Term[]): string | null {
  const words = terms.filter((t) => !t.field && !t.negate).map((t) => fold(t.value))
  if (!words.length || !song.lyrics) return null
  const lines = song.lyrics.split('\n')
  for (const line of lines) {
    const folded = fold(line)
    if (words.some((w) => folded.includes(w)) && !words.every((w) => fold(song.title).includes(w))) return line.trim()
  }
  return null
}

/** The values that occur most often for a facet (genre words, moods, models ...), for the filter chips. */
export function topValues(songs: SongSummary[], pick: (s: SongSummary) => string[], limit = 12): [string, number][] {
  const counts = new Map<string, number>()
  for (const song of songs) for (const value of pick(song)) if (value) counts.set(value, (counts.get(value) ?? 0) + 1)
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, limit)
}

export const words = (text: string): string[] =>
  fold(text)
    .split(/[,;/]+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 1)

// --- the filters: every value of a facet, with how many songs have it --------------------------------------

/** A row of filter chips: the search field its chips set, how a song's values are read, how many show before
 * *more* - and, for ranges and marks, fixed values with their labels, in their order. */
export interface FacetDef {
  id: string
  key: string
  label: string
  values: (song: SongSummary, context: Context) => string[]
  top: number
  fixed?: [string, string][]
}

const TEMPOS: [string, string][] = [['<90', 'slow, below 90'], ['90-119', '90-119'], ['120-139', '120-139'], ['>=140', 'fast, 140 and up']]
const LENGTHS: [string, string][] = [['<3', 'under 3 min'], ['3-5', '3-5 min'], ['>5', 'over 5 min']]
const HAS: [string, string][] = [['timing', 'timed lyrics'], ['pdf', 'sheet music'], ['score', 'notation'], ['original', 'unmastered take'], ['cover', 'a cover picture']]
const PLAYED: [string, string][] = [['fav', 'favourites'], ['played', 'played'], ['unplayed', 'never played'], ['untagged', 'no tags yet']]
const MADE: [string, string][] = [['plenio', 'Plenio'], ['other', 'other music']]
/** The stars in steps (both kinds come in halves). */
const STARS: [string, string][] = [['5', '★ 5'], ['4-4.5', '★ 4-4½'], ['3-3.5', '★ 3-3½'], ['2-2.5', '★ 2-2½'], ['<2', '★ below 2']]
const MY_STARS: [string, string][] = [...STARS, ['none', 'not rated yet']]
const MEASURED_STARS: [string, string][] = [...STARS, ['none', 'not measured yet']]
const starSteps = (stars: number | null | undefined): string[] =>
  stars === null || stars === undefined ? ['none'] : STARS.filter(([r]) => numberTest(r, stars)).map(([r]) => r)

/** The filters' rows, in their order (Tags first when there are any). */
export const FACETS: FacetDef[] = [
  { id: 'tag', key: 'tag', label: 'Tags', top: 14, values: (s, c) => c.tags?.[s.id] ?? [] },
  { id: 'genre', key: 'genre', label: 'Genre', top: 12, values: (s) => words(s.genre) },
  { id: 'mood', key: 'mood', label: 'Mood', top: 8, values: (s) => words(s.mood) },
  { id: 'made', key: 'is', label: 'Made with', top: 2, fixed: MADE, values: (s) => [s.other ? 'other' : 'plenio'] },
  { id: 'model', key: 'model', label: 'Model', top: 4, values: (s) => [s.other ? '' : s.model ? s.model.toLowerCase().split(' ')[0] : 'master'] },
  { id: 'vocals', key: 'vocals', label: 'Vocals', top: 3, values: (s) => [s.instrumental ? 'instrumental' : s.vocals === 'sparse vocals' ? 'sparse' : s.vocals ? 'sung' : ''] },
  { id: 'lang', key: 'lang', label: 'Language', top: 6, values: (s) => [s.language.toLowerCase()] },
  { id: 'bpm', key: 'bpm', label: 'Tempo (BPM)', top: 4, fixed: TEMPOS, values: (s) => TEMPOS.filter(([r]) => numberTest(r, s.bpm)).map(([r]) => r) },
  { id: 'len', key: 'len', label: 'Length', top: 3, fixed: LENGTHS, values: (s) => LENGTHS.filter(([r]) => numberTest(r, s.seconds / 60)).map(([r]) => r) },
  { id: 'key', key: 'key', label: 'Key', top: 10, values: (s) => [s.score_key || s.brief.key || ''] },
  { id: 'mode', key: 'mode', label: 'Creative mode', top: 8, values: (s) => [s.arrangement && s.arrangement !== 'off' ? s.arrangement : ''] },
  { id: 'creativity', key: 'creativity', label: 'Creativity', top: 5, fixed: CREATIVITY_RANGES, values: (s) => CREATIVITY_RANGES.filter(([r]) => numberTest(r, s.brief.creativity)).map(([r]) => r) },
  { id: 'template', key: 'template', label: 'Template', top: 6, values: (s) => [s.template] },
  { id: 'year', key: 'year', label: 'Year', top: 4, values: (s) => [s.year] },
  { id: 'has', key: 'has', label: 'Has', top: 5, fixed: HAS, values: (s) => HAS.filter(([v]) => hasTest(s, v)).map(([v]) => v) },
  { id: 'played', key: 'is', label: 'Listening', top: 4, fixed: PLAYED, values: (s, c) => PLAYED.filter(([v]) => isTest(s, v, c)).map(([v]) => v) },
  { id: 'stars', key: 'stars', label: 'My stars', top: 6, fixed: MY_STARS, values: (s, c) => starSteps(c.ratings?.[s.id]) },
  { id: 'measured', key: 'measured', label: 'Measured stars', top: 6, fixed: MEASURED_STARS, values: (s, c) => starSteps(c.measured?.[s.id]) },
]  // prettier-ignore

/** Every value of a facet among ``songs`` with its count - the most common first, or a fixed facet in its
 * own order; values none of them has are left out. */
export function facetValues(songs: SongSummary[], facet: FacetDef, context: Context): [string, number][] {
  // tags are one whatever their capitals (the first spelling shows)
  const keyOf = facet.id === 'tag' ? (v: string) => v.toLowerCase() : (v: string) => v
  const counts = new Map<string, [string, number]>()
  for (const song of songs) {
    for (const value of facet.values(song, context)) {
      if (!value) continue
      const known = counts.get(keyOf(value))
      counts.set(keyOf(value), known ? [known[0], known[1] + 1] : [value, 1])
    }
  }
  if (facet.fixed) return facet.fixed.filter(([v]) => counts.has(v)).map(([v]) => [v, counts.get(v)?.[1] ?? 0])
  return [...counts.values()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
}

/** "from 1.0.0", "from 0.8.0" ...: the versions the songs were made with (newest first), each with how many
 * songs are that version or newer - for an archive that still holds songs of older versions. */
export function versionSteps(songs: SongSummary[]): [string, number][] {
  const versions = new Map<string, number[]>()
  for (const song of songs) {
    const v = versionOf(song.plenio)
    if (v) versions.set(v.join('.'), v)
  }
  const sorted = [...versions.values()].sort((a, b) => compareVersions(b, a))
  return sorted.slice(0, 8).map((v) => [
    `from ${v.join('.')}`,
    songs.filter((s) => {
      const have = versionOf(s.plenio)
      return have !== null && compareVersions(have, v) >= 0
    }).length,
  ])
}

/** A row of filters as the page shows it: every value the songs have with how many have it, and every chip
 * that is on (with 0 when none of the songs has it - a value left out). */
export interface FilterRow {
  id: string
  key: string
  label: string
  top: number
  all: [string, number][]
  /** The songs the counts are of. */
  total: number
}

const PLENIO_ROW = { id: 'plenio', key: 'plenio', label: 'Plenio version', top: 8, values: null }

/** The filter chips as one filter: the chips of one row (``rowOf``) that keep songs are alternatives - two
 * genres keep the songs of either -, the rows must all match, and every chip that leaves songs out does. */
export interface ChipFilter {
  /** Per row, its chips' terms: a song matches one of them. */
  rows: Term[][]
  /** The chips that leave songs out (and a chip that is no ``key:"value"``): every one must hold. */
  every: Term[]
}

/** The row a chip belongs to: ``facetOf``'s (two rows set ``is:``), the key otherwise. */
export function rowOf(key: string, value: string): string {
  return facetOf(key, value)?.id ?? key
}

export function chipFilter(chips: string[]): ChipFilter {
  const rows = new Map<string, Term[]>()
  const every: Term[] = []
  for (const chip of chips) {
    const parts = chipParts(chip)
    const terms = parseQuery(chip)
    if (!parts || parts.exclude) {
      every.push(...terms)
      continue
    }
    const row = rowOf(parts.key, parts.value)
    rows.set(row, [...(rows.get(row) ?? []), ...terms])
  }
  return { rows: [...rows.values()], every }
}

/** ``score`` with the chips: 0 when a row has no chip the song matches; its best hit per row adds to the score. */
export function scoreWith(song: SongSummary, terms: Term[], filter: ChipFilter, context: Context): number {
  let total = score(song, [...terms, ...filter.every], context)
  if (!total) return 0
  for (const row of filter.rows) {
    const best = Math.max(0, ...row.map((term) => matches(song, term, context)))
    if (!best) return 0
    total += best
  }
  return total
}

/** The songs that match a search and chips. */
export function matching(songs: SongSummary[], query: string, chips: string[], context: Context): SongSummary[] {
  const terms = parseQuery(query)
  const filter = chipFilter(chips)
  return songs.filter((song) => scoreWith(song, terms, filter, context) > 0)
}

/** The filter rows for ``songs`` with a search and chips on (owner's request 2026-10-18: the numbers follow the
 * filters - after *from 1.0.0*, *instrumental* says how many of those songs are instrumental, and a value none
 * of them has is gone). The counts are of the songs that match everything else: a row counts without the chips
 * of its own that keep songs (they are alternatives), so its other values stay to add or switch to. Rows that
 * could not narrow the songs further are left out, unless a chip of theirs is on. ``found``: the songs that
 * match, when known. */
export function filterRows(songs: SongSummary[], query: string, chips: string[], context: Context, found = matching(songs, query, chips, context)): FilterRow[] {
  const rows: FilterRow[] = []
  for (const def of [...FACETS, PLENIO_ROW] as (FacetDef | typeof PLENIO_ROW)[]) {
    const own = chips.filter((chip) => {
      const parts = chipParts(chip)
      return !!parts && parts.key === def.key && !parts.exclude && rowOf(parts.key, parts.value) === def.id
    })
    const pool = own.length ? matching(songs, query, chips.filter((c) => !own.includes(c)), context) : found
    const all = def.values ? facetValues(pool, def as FacetDef, context) : versionSteps(pool)
    let on = false
    for (const chip of chips) {
      const parts = chipParts(chip)
      if (!parts || parts.key !== def.key || rowOf(parts.key, parts.value) !== def.id) continue
      on = true
      if (!all.some(([v]) => v === parts.value)) all.push([parts.value, 0])
    }
    if (on || all.length > 1 || (all.length === 1 && all[0][1] < pool.length)) rows.push({ id: def.id, key: def.key, label: def.label, top: def.top, all, total: pool.length })
  }
  return rows
}

/** How a chip reads: a range or a mark by its label, anything else as it is. */
export function valueLabel(facet: FacetDef | undefined, value: string): string {
  return facet?.fixed?.find(([v]) => v === value)?.[1] ?? value
}

/** The facet a chip belongs to (two rows set ``is:``). */
export function facetOf(key: string, value: string): FacetDef | undefined {
  return FACETS.find((f) => f.key === key && (!f.fixed || f.fixed.some(([v]) => v === value))) ?? FACETS.find((f) => f.key === key)
}

// --- suggestions while typing ------------------------------------------------------------------------------

export interface Suggestion {
  /** What the list shows, and a hint beside it (how many songs, what the field takes). */
  label: string
  hint: string
  /** The whole search with the suggestion taken. */
  query: string
}

const FIELD_HELP: [string, string][] = [
  ['genre', 'a genre'], ['mood', 'a mood'], ['tag', 'one of your tags (or #tag)'], ['bpm', 'tempo: >120, 90-110'], ['key', 'Am, C, F#m'],
  ['len', 'minutes: <3, 3-5'], ['lang', 'a language'], ['vocals', 'instrumental, sung'], ['model', 'yue2, minimax, master'],
  ['mode', 'a creative mode'], ['template', 'a brief template'], ['is', 'fav, unplayed, played, tagged, cover, other'],
  ['has', 'timing, pdf, score, original, cover'], ['year', '2026'], ['plenio', 'the Plenio version: >=1.0'], ['title', 'words in the title'],
  ['lyrics', 'words in the lyrics'], ['artist', 'other music: the artist'], ['album', 'other music: the album'], ['meter', '4/4, 3/4'],
  ['writer', 'the model that wrote it'], ['style', 'words in the style'], ['creativity', '0-100: >50, 20-30, adventurous'],
  ['stars', 'your stars: >=4, 3-4, none'], ['measured', 'the measured stars: >=4, <2, none'],
] // prettier-ignore

const FIXED_VALUES: Record<string, [string, string][]> = {
  is: [...PLAYED, ['tagged', 'with tags'], ['cover', 'cover songs'], ['other', 'other music'], ['plenio', 'made with Plenio'], ['instrumental', 'instrumentals']],
  has: [...HAS, ['lyrics', 'lyrics'], ['stems', 'stems']],
  bpm: TEMPOS,
  len: LENGTHS,
  creativity: CREATIVITY_RANGES,
  stars: MY_STARS,
  measured: MEASURED_STARS,
  vocals: [['instrumental', 'no singing'], ['sparse', 'only a few sung phrases'], ['sung', 'with singing']],
}

/** The values a field takes in this library, with counts. */
function valuesOf(field: string, songs: SongSummary[], context: Context): [string, number][] {
  const facet = FACETS.find((f) => f.key === field && !f.fixed)
  if (facet) return facetValues(songs, facet, context)
  const pick: Record<string, (s: SongSummary) => string[]> = {
    artist: (s) => [s.artist || s.tags.artist || ''],
    album: (s) => [s.album || s.tags.album || ''],
    meter: (s) => [s.score_meter || s.brief.meter || ''],
    writer: (s) => [s.writer],
    plenio: (s) => [versionOf(s.plenio)?.slice(0, 2).join('.') ?? ''],
  }
  return pick[field] ? topValues(songs, pick[field], 400) : []
}

const quote = (value: string): string => (/^[\w.<>=#&+-]+$/.test(value) ? value : `"${value}"`)

/** Suggestions for the word typed at the end of ``query``: a field and its values (``gen`` -> ``genre:``,
 * ``genre:ja`` -> ``genre:jazz``), your tags after ``#``, and the tags, genres and moods with that word. */
export function suggest(query: string, songs: SongSummary[], context: Context, limit = 8): Suggestion[] {
  const match = /(^|\s)(-?)(?:(\w+):)?"?([^"\s]*)$/.exec(query)
  if (!match || /\s$/.test(query)) return []
  const [, space, minus, rawField, partial] = match
  const head = query.slice(0, match.index) + space
  const songsWord = (n: number): string => `${n} ${n === 1 ? 'song' : 'songs'}`
  const want = fold(partial)
  // a value typed in full is not offered again (nothing left to complete)
  const rank = (list: [string, number][]): [string, number][] =>
    list
      .filter(([v]) => fold(v).includes(want) && fold(v) !== want)
      .sort((a, b) => Number(fold(b[0]).startsWith(want)) - Number(fold(a[0]).startsWith(want)) || b[1] - a[1] || a[0].localeCompare(b[0]))
  if (rawField !== undefined) {
    const field = FIELDS[rawField.toLowerCase()]
    if (!field) return []
    const key = field === 'language' ? 'lang' : field
    const fixed = FIXED_VALUES[key]
    const list: [string, number][] = fixed ? fixed.map(([v]) => [v, 0]) : valuesOf(key, songs, context)
    return rank(list)
      .slice(0, limit)
      .map(([v, n]) => ({ label: `${key}:${v}`, hint: fixed ? (fixed.find(([x]) => x === v)?.[1] ?? '') : songsWord(n), query: `${head}${minus}${key}:${quote(v)} ` }))
  }
  if (partial.startsWith('#')) {
    const tagWant = fold(partial.slice(1))
    return valuesOf('tag', songs, context)
      .filter(([v]) => fold(v).includes(tagWant) && fold(v) !== tagWant)
      .slice(0, limit)
      .map(([v, n]) => ({ label: `#${v}`, hint: songsWord(n), query: `${head}${minus}tag:${quote(v)} ` }))
  }
  if (want.length < 2) return []
  const fields = FIELD_HELP.filter(([name]) => name.startsWith(want) && name !== want).map(([name, help]) => ({ label: `${name}:`, hint: help, query: `${head}${minus}${name}:` }))
  const values: Suggestion[] = []
  for (const key of ['tag', 'genre', 'mood']) {
    for (const [v, n] of rank(valuesOf(key, songs, context)).slice(0, 4)) {
      values.push({ label: `${key === 'tag' ? '#' : `${key}:`}${v}`, hint: songsWord(n), query: `${head}${minus}${key}:${quote(v)} ` })
    }
  }
  return [...fields, ...values].slice(0, limit)
}
