/**
 * Party songs (owner's request 2026-10-25, docs/design/party-songs.md): the simple form's logic - a style template
 * fills every field, each field offers every value the templates have (or one of one's own), the fields a song's
 * vocals or a cover do not ask are left out - and how a song in the making is told: in line, being made, ready.
 * Pure: the player's page and the party guests' page use it alike.
 */

export type Kind = 'song' | 'cover'
/** What is made again from a song: a new take of it, a new song like it, a cover of it. */
export type Again = 'take' | 'song' | 'cover'

export interface StyleTemplate {
  id: string
  name: string
  group: string
  fields: Record<string, string>
}

export interface FormData {
  source: 'studio' | 'package'
  templates: StyleTemplate[]
  values: Record<string, string[]>
  song: { fields: string[]; choices: { length: string[]; vocals: string[] }; defaults: { length?: string; vocals?: string } }
  cover: { fields: string[]; choices: { vocals: string[] }; defaults: { vocals?: string } }
  limits: { description: number; lyrics?: number; text: number; source_mb: number; max_length: string; documents?: Record<string, number> }
  covers: boolean
  /** The whole studio (the admin, the player in your network): the Song API's fields of each template. */
  studio?: StudioForm
}

/** A field of the Song API (``GET /plenio/api/v1/templates/<id>``). */
export interface ApiField {
  id: string
  label: string
  type: 'text' | 'string' | 'integer' | 'number' | 'boolean' | 'choice' | 'upload'
  default: unknown
  description: string
  group: string
  node?: { id: number; type: string; title: string }
  choices?: string[]
  minimum?: number
  maximum?: number
  step?: number
  when?: Record<string, string[]>
  fixed?: boolean
  required?: boolean
  advanced?: boolean
}

export interface StudioSpec {
  template: string
  fields: ApiField[]
  release: ApiField[]
  documents: string[]
}

export interface StudioForm {
  song?: StudioSpec
  cover?: StudioSpec
  defaults?: { fields: Record<string, unknown>; release: Record<string, unknown> }
  /** Why the fields cannot show (ComfyUI is not running). */
  unavailable?: string
}

export interface StudioValues {
  fields: Record<string, unknown>
  release: Record<string, unknown>
}

export interface SongDocuments {
  title: string
  style: string
  lyrics: string
}

/** What the form starts from to make a song again (``GET /api/make/from/<song id>``). */
export interface Remake {
  song: { id: string; title: string; genre: string; seconds: number; cover: boolean; other: boolean; model: string; kind: string }
  can: Record<Again, boolean>
  why: Record<Again, string>
  start: Again | ''
  kind: Kind
  fields: Record<string, string>
  documents: SongDocuments
  studio: (StudioValues & { template: string; warnings: string[] }) | null
}

export interface Source {
  id: string
  name: string
  title: string
  seconds: number
}

export interface Draft {
  kind: Kind
  fields: Record<string, string>
  source: Source | null
  /** Made again from a song (``null``: a song of its own). */
  again?: Again | null
  base?: Remake['song'] | null
  /** A new take's title, style and lyrics (as changed). */
  documents?: SongDocuments
  /** The whole studio's values. */
  studio?: StudioValues
}

export interface Stage {
  group: string
  text: string
  index?: number | null
  of?: number | null
}

export interface MakeJob {
  id: string
  kind: Kind
  status: 'waiting' | 'sending' | 'queued' | 'running' | 'done' | 'failed' | 'cancelled'
  owner: { kind: string; name: string }
  mine: boolean
  label: string
  description: string
  created: number
  started: number | null
  finished: number | null
  position: number | null
  eta: number | null
  starts: number | null
  estimate: number
  stage: Stage | null
  progress: { nodes_done?: number; nodes?: number; step?: number; steps?: number } | null
  result: { title?: string; record?: string; song?: string } | null
  error: string
  note: string
  /** Waiting to be released (owner's request 2026-10-29): for its maker to hear it first, for an admin to approve it;
   * or released, not released by its maker, not approved. */
  release?: Release | null
  can: { edit: boolean; up: boolean; down: boolean; delete: boolean; listen?: boolean; release?: boolean; discard?: boolean }
  fields?: Record<string, string>
  source?: Source | null
  again?: Again | null
  from?: { song: string; title: string; seconds: number } | null
  documents?: Partial<SongDocuments>
  studio?: StudioValues | null
  /** Several takes or songs ordered at once: their group, this one's number, how many. */
  group?: string
  number?: number | null
  of?: number | null
  /** Takes that follow when this song is made. */
  takes_left?: number
}

export type Release = 'maker' | 'admin' | 'released' | 'discarded' | 'rejected'

/** Who made a party song, while it plays: not shown, large at its moments with a badge between, or floating
 * across the picture all the way (``plenio.player.maker.CREDITS``). */
export type Credit = 'off' | 'spotlight' | 'drift'
export const CREDITS: { value: Credit; label: string }[] = [
  { value: 'off', label: 'Not shown' },
  { value: 'spotlight', label: 'Spotlight - large as it begins, at every new section and as it ends; a badge between' },
  { value: 'drift', label: 'Drift - the name floats across the picture all the way, glowing with the beat' },
]

/** Who made a party song, from its tags: the album *Party-Song <date>* (made by the player's party songs), the
 * artist the user's name or *Guest*; ``null`` for every other song. */
export function partyMaker(tags: Record<string, string> | undefined): string | null {
  if (!/^Party-Song \d{4}-\d{2}-\d{2}$/.test((tags?.album ?? '').trim())) return null
  return (tags?.artist ?? '').trim() || 'Guest'
}

/** When a party song's party was: its date, always (owner's request 2026-10-28: not "this party" - a song of
 * another night says which) - ``''`` for another song. */
export function partyWhen(tags: Record<string, string> | undefined): string {
  const found = /^Party-Song (\d{4})-(\d{2})-(\d{2})$/.exec((tags?.album ?? '').trim())
  if (!found) return ''
  const day = new Date(Number(found[1]), Number(found[2]) - 1, Number(found[3]))
  return `on ${day.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}`
}

export type CreditMoment = { kind: 'intro' | 'section' | 'outro'; label: string } | null

/** What the credit shows at ``time`` of a song of ``duration`` seconds: the opening (its first 7 s), a new
 * section (4 s from each section after the first), the ending (its last 8 s) - else ``null``, the badge. */
export function creditMoment(time: number, duration: number, sections: { at: number; label: string }[]): CreditMoment {
  if (time < 7) return { kind: 'intro', label: '' }
  if (duration > 20 && time > duration - 8) return { kind: 'outro', label: '' }
  for (const s of sections) if (s.at > 1 && time >= s.at && time < s.at + 4) return { kind: 'section', label: s.label }
  return null
}

/** Where the drifting name is at ``time``: a slow figure over the picture (per cent of its width and height),
 * the same at the same moment of the song. */
export function driftAt(time: number): { x: number; y: number; tilt: number } {
  return {
    x: 50 + 33 * Math.sin(time * 0.071),
    y: 46 + 27 * Math.sin(time * 0.053 + 1.1),
    tilt: 4 * Math.sin(time * 0.11),
  }
}

export interface MakeStatus {
  on: boolean
  may: boolean
  why: string
  me: { kind: 'admin' | 'user' | 'guest'; name: string; full?: boolean; remote?: boolean }
  admin: boolean
  settings: { on?: boolean; users?: boolean; guests?: boolean; per_person: number; max_length: string; covers: boolean; credit?: Credit; remote?: boolean; listen_first?: boolean; approve?: boolean }
  studio: { reachable: boolean; error: string }
  line: { waiting: number; making: boolean; free: number }
  jobs: MakeJob[]
  /** The songs waiting for an admin's approval - everybody's (the admins' answer only). */
  approvals?: MakeJob[]
}

export const SONG_FIELDS = ['template', 'description', 'genre', 'mood', 'tempo', 'length', 'vocals', 'language', 'voice', 'theme', 'lyrics_from', 'lyrics', 'key', 'meter'] as const
export const COVER_FIELDS = ['template', 'description', 'genre', 'mood', 'vocals', 'language', 'voice', 'theme'] as const
/** The fields shown as lists (all but the template, picked on its own, and the description, a text). */
export const LIST_FIELDS = ['genre', 'mood', 'tempo', 'length', 'vocals', 'language', 'voice', 'theme', 'key', 'meter'] as const

export const LABELS: Record<string, { label: string; hint: string; placeholder: string }> = {
  genre: { label: 'Genre', hint: 'The kind of music - indie pop, synthwave, salsa …', placeholder: 'e.g. synthwave' },
  mood: { label: 'Mood', hint: 'How it should feel', placeholder: 'e.g. warm, hopeful' },
  tempo: { label: 'Tempo', hint: 'How fast: a feel or beats per minute', placeholder: 'e.g. 110 BPM, upbeat' },
  length: { label: 'Length', hint: 'About how long the song is', placeholder: 'e.g. 2:30' },
  vocals: { label: 'Vocals', hint: 'Sung, only a few phrases, or no singing at all', placeholder: '' },
  language: { label: 'Language', hint: 'The language of the lyrics', placeholder: 'e.g. English' },
  voice: { label: 'Voice', hint: 'Who sings, and how', placeholder: 'e.g. warm female vocal' },
  theme: { label: 'Theme', hint: 'What the lyrics are about', placeholder: 'e.g. a summer night' },
  key: { label: 'Key', hint: 'Optional: the key it is in', placeholder: 'e.g. A minor' },
  meter: { label: 'Meter', hint: 'Optional: the beats in a bar', placeholder: 'e.g. 4/4, 6/8' },
}

/** What a vocals choice means, in a listener's words. */
export const VOCALS_TEXT: Record<string, string> = {
  sung: 'Sung - a song with lyrics',
  'sparse vocals': 'Mostly music - a few sung phrases',
  instrumental: 'Instrumental - no singing',
  'original lyrics': 'The original lyrics, sung anew',
  'new lyrics': 'New lyrics on the original melody',
}

const SUNG = new Set(['sung', 'sparse vocals', 'original lyrics', 'new lyrics'])

/** A song's lyrics (1.5.0, ``core.brief.LYRICS_FROM``): written from an idea, or one's own, sung as written. */
export const LYRICS_IDEA = 'written from the idea below'
export const OWN_LYRICS = 'my own, sung as written below'

/** Whether a field is asked: a cover keeps the original's tempo, length, key and meter; an instrumental has no
 * language, voice or theme; a cover's theme belongs to new lyrics, and its language is the original's unless the
 * lyrics are new. */
export function applies(name: string, draft: Draft): boolean {
  const list = draft.kind === 'cover' ? (COVER_FIELDS as readonly string[]) : (SONG_FIELDS as readonly string[])
  if (!list.includes(name)) return false
  const vocals = draft.fields.vocals || (draft.kind === 'cover' ? 'original lyrics' : 'sung')
  if (['language', 'voice', 'theme', 'lyrics_from', 'lyrics'].includes(name) && !SUNG.has(vocals)) return false
  if (draft.kind === 'cover' && name === 'theme' && vocals !== 'new lyrics') return false
  if (draft.kind === 'cover' && name === 'language' && vocals !== 'new lyrics') return false
  return true
}

/** The fields a style template fills (all of them: a field the template leaves open is emptied). A song's length
 * and vocals keep their default when the template has none or one this form does not offer; a cover takes the
 * template's sound, and a sung template means the original's lyrics. */
export function fromTemplate(template: StyleTemplate | null, kind: Kind, form: FormData, keep: Record<string, string> = {}): Record<string, string> {
  const given = template?.fields ?? {}
  const out: Record<string, string> = { template: template?.id ?? 'none' }
  const names = kind === 'cover' ? COVER_FIELDS : SONG_FIELDS
  // one line each, as the lists have them (the description keeps its lines)
  for (const name of names) if (name !== 'template') out[name] = name === 'description' ? (given[name] ?? '').trim() : (given[name] ?? '').split(/\s+/).join(' ').trim()
  if (kind === 'song') {
    // one's own lyrics stay when another style is chosen; else the template's idea
    if (keep.lyrics_from === OWN_LYRICS) Object.assign(out, { lyrics_from: OWN_LYRICS, lyrics: keep.lyrics ?? '' })
    else out.lyrics_from = LYRICS_IDEA
    const lengths = form.song.choices.length
    if (!lengths.includes(out.length)) out.length = keep.length && lengths.includes(keep.length) ? keep.length : nearestLength(out.length || form.song.defaults.length || '', lengths)
    if (!form.song.choices.vocals.includes(out.vocals)) out.vocals = form.song.defaults.vocals || 'sung'
  } else {
    out.vocals = given.vocals === 'instrumental' ? 'instrumental' : keep.vocals && form.cover.choices.vocals.includes(keep.vocals) ? keep.vocals : 'original lyrics'
  }
  return out
}

/** ``standard (about 3:00)`` -> 180 seconds (``0`` when it names no time). */
export function lengthSeconds(option: string): number {
  const match = /(\d+):(\d{2})/.exec(option)
  return match ? Number(match[1]) * 60 + Number(match[2]) : 0
}

/** The offered length nearest to ``wanted`` (a choice the form no longer offers - longer than the host allows -
 * becomes the longest offered). */
export function nearestLength(wanted: string, lengths: string[]): string {
  if (lengths.includes(wanted)) return wanted
  const seconds = lengthSeconds(wanted)
  if (!lengths.length) return wanted
  if (!seconds) return lengths.find((l) => l.startsWith('standard')) ?? lengths[Math.min(4, lengths.length - 1)]
  return lengths.reduce((best, l) => (Math.abs(lengthSeconds(l) - seconds) < Math.abs(lengthSeconds(best) - seconds) ? l : best), lengths[0])
}

/** A field's list: the choices of length and vocals; for the other fields every value the templates have - the
 * value given now first when the list does not have it. */
export function optionsFor(name: string, draft: Draft, form: FormData): string[] {
  let list: string[]
  if (name === 'length') list = form.song.choices.length
  else if (name === 'vocals') list = draft.kind === 'cover' ? form.cover.choices.vocals : form.song.choices.vocals
  else list = form.values[name] ?? []
  return list
}

/** Whether a field may take a value of one's own (the vocals are one of their choices). */
export const ownAllowed = (name: string): boolean => name !== 'vocals'

/** The templates by group, in the order the server gives them. */
export function grouped(templates: StyleTemplate[], query = ''): [string, StyleTemplate[]][] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  const groups = new Map<string, StyleTemplate[]>()
  for (const t of templates) {
    const text = `${t.name} ${t.group} ${t.fields.genre ?? ''} ${t.fields.mood ?? ''}`.toLowerCase()
    if (words.length && !words.every((w) => text.includes(w))) continue
    groups.set(t.group, [...(groups.get(t.group) ?? []), t])
  }
  return [...groups]
}

/** A template at random (for *Surprise me*): one of those that fit a cover when it is a cover - any for a song. */
export function surprise(templates: StyleTemplate[], kind: Kind, random: () => number = Math.random): StyleTemplate | null {
  const pool = kind === 'cover' ? templates.filter((t) => t.fields.vocals !== 'instrumental' || random() < 0.3) : templates
  if (!pool.length) return null
  return pool[Math.floor(random() * pool.length)]
}

/** What is still missing before the song can be made (an empty list: nothing). */
export function missing(draft: Draft): string[] {
  const out: string[] = []
  if (draft.again === 'take') return draft.documents?.title.trim() ? out : ['a title']
  if (draft.kind === 'cover' && !draft.source && draft.again !== 'cover') out.push('the original recording')
  const template = draft.fields.template
  if ((!template || template === 'none') && !draft.fields.genre?.trim() && !draft.fields.description?.trim()) out.push('a style, a genre or a description')
  if (draft.fields.lyrics_from === OWN_LYRICS && applies('lyrics', draft) && !draft.fields.lyrics?.trim()) out.push('your lyrics')
  return out
}

export interface MakeRequest {
  fields: Record<string, string>
  source?: string
  from?: { song: string; as: Again }
  documents?: Partial<SongDocuments>
  studio?: StudioValues
  /** Takes of the song (the whole studio: 1-4). */
  takes?: number
  /** Songs of this form (the whole studio: 1-5). */
  copies?: number
}

/** The request for the server: the fields that apply, the recording for a cover; made again from a song, the song
 * and what (a new take: its documents as changed against ``original``); the whole studio's values that apply. */
export function requestOf(draft: Draft, studio: StudioSpec | null = null, original: SongDocuments | null = null): MakeRequest {
  const fields: Record<string, string> = {}
  if (draft.again !== 'take') for (const [name, value] of Object.entries(draft.fields)) if (name === 'template' || name === 'description' || applies(name, draft)) fields[name] = value
  const body: MakeRequest = { fields }
  if (draft.again && draft.base) body.from = { song: draft.base.id, as: draft.again }
  else if (draft.kind === 'cover' && draft.source) body.source = draft.source.id
  if (draft.again === 'take' && draft.documents) {
    const changed: Partial<SongDocuments> = {}
    for (const key of ['title', 'style', 'lyrics'] as const) {
      const text = draft.documents[key].trim()
      if (text && text !== (original?.[key] ?? '').trim()) changed[key] = text
    }
    body.documents = changed
  }
  if (studio && draft.studio) body.studio = studioRequest(studio, draft.studio, draft)
  return body
}

/** A song that failed, ordered again as it was - made again from a song with its documents, the whole studio's
 * values, the recording of a cover. */
export function retryRequest(job: MakeJob): MakeRequest {
  const body: MakeRequest = { fields: job.fields ?? {} }
  if (job.again && job.from) body.from = { song: job.from.song, as: job.again }
  else if (job.source?.id) body.source = job.source.id
  if (job.documents && Object.keys(job.documents).length) body.documents = job.documents
  if (job.studio) body.studio = job.studio
  return body
}

// --- the whole studio ------------------------------------------------------------------------------------------

/** The fields the simple form asks itself (and the work mode, fixed): not again in the studio's. */
const OWN = new Set<string>(['mode', 'template', 'description', 'genre', 'mood', 'tempo', 'length', 'vocals', 'language', 'voice', 'theme', 'lyrics_from', 'lyrics', 'key', 'meter', 'source.audio'])
const STUDIO_FIRST = ['writer.model', 'finish.hq_mastering', 'finish.cover_art']

export interface StudioGroup {
  title: string
  part: 'fields' | 'release'
  fields: ApiField[]
}

/** The studio's fields by what they are about: the studio (the writer model, HQ mastering, Cover Art), the rest of
 * the brief, a cover's excerpt, the release (folder, formats, tags). */
export function studioGroups(spec: StudioSpec): StudioGroup[] {
  const own = spec.fields.filter((f) => !OWN.has(f.id) && !f.fixed && f.type !== 'upload')
  const groups: StudioGroup[] = [
    { title: 'The studio', part: 'fields', fields: STUDIO_FIRST.map((id) => own.find((f) => f.id === id)).filter((f): f is ApiField => !!f) },
    { title: 'The Song Brief', part: 'fields', fields: own.filter((f) => !STUDIO_FIRST.includes(f.id) && !f.id.includes('.')) },
    { title: 'An excerpt of the original', part: 'fields', fields: own.filter((f) => f.id.startsWith('excerpt.')) },
    { title: 'Export Release - folder, formats, tags', part: 'release', fields: spec.release.filter((f) => !f.fixed) },
  ]
  return groups.filter((g) => g.fields.length)
}

/** The value a field shows: as chosen, else the template's. */
export function studioValue(field: ApiField, values: Record<string, unknown>): unknown {
  return field.id in values ? values[field.id] : field.default
}

/** Whether a field applies to the choices made (``when``: a voice only for sung vocals, the tags' fields only with
 * tags) - the form's own choice first (the vocals), else the studio value, else the field's default. */
export function studioApplies(field: ApiField, values: Record<string, unknown>, draft: Draft | null, siblings: ApiField[] = []): boolean {
  for (const [parent, choices] of Object.entries(field.when ?? {})) {
    const sibling = siblings.find((f) => f.id === parent)
    const chosen =
      parent in values
        ? values[parent]
        : draft && parent in draft.fields
          ? draft.fields[parent]
          : sibling
            ? sibling.default
            : undefined
    if (chosen !== undefined && chosen !== '' && !choices.includes(String(chosen))) return false
  }
  return true
}

/** What the studio starts from: the template's values, the party's (``defaults``: HQ mastering off, Cover Art on,
 * the party's folder), and a song's own when it is made again. */
export function studioStart(spec: StudioSpec, defaults: StudioForm['defaults'] | undefined, song: StudioValues | null = null): StudioValues {
  const fields: Record<string, unknown> = {}
  const release: Record<string, unknown> = {}
  for (const g of studioGroups(spec)) for (const f of g.fields) (g.part === 'fields' ? fields : release)[f.id] = f.default
  Object.assign(fields, pick(defaults?.fields, fields), pick(song?.fields, fields))
  Object.assign(release, pick(defaults?.release, release), pick(song?.release, release))
  return { fields, release }
}

/** The song's own values the studio starts from when it is made again: a new take keeps its settings and its release
 * (folder, album, artist); a new song like it keeps its settings, and its release is the party's, as for every new
 * song (so it is not credited to the one who made the first); a cover of it starts from the cover template. */
export function againStudio(mode: Again, remake: Remake): StudioValues | null {
  if (!remake.studio || mode === 'cover') return null
  return mode === 'take' ? remake.studio : { fields: remake.studio.fields, release: {} }
}

function pick(from: Record<string, unknown> | undefined, known: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(from ?? {}).filter(([k]) => k in known))
}

/** The studio's values for the request: those of the fields that apply. */
export function studioRequest(spec: StudioSpec, values: StudioValues, draft: Draft): StudioValues {
  const out: StudioValues = { fields: {}, release: {} }
  for (const g of studioGroups(spec)) {
    const own = values[g.part]
    for (const f of g.fields) if (studioApplies(f, own, draft, g.part === 'release' ? spec.release : spec.fields)) out[g.part][f.id] = studioValue(f, own)
  }
  return out
}

/** One line that says how the studio makes it: HQ mastering, cover art, the writer, the folder, the formats. */
export function studioSummary(values: StudioValues | undefined): string {
  if (!values) return ''
  const f = values.fields
  const r = values.release
  const formats = ['flac', 'mp3', 'wav'].filter((k) => r[k] === true).map((k) => k.toUpperCase())
  return [
    f['finish.hq_mastering'] === true ? 'HQ mastering on' : 'HQ mastering off',
    f['finish.cover_art'] === false ? 'no cover art' : 'cover art on',
    typeof f['writer.model'] === 'string' ? String(f['writer.model']).replace(/\.(gguf|safetensors)$/i, '') : '',
    typeof r.folder === 'string' ? `output/${r.folder}` : '',
    formats.join(' + '),
  ]
    .filter(Boolean)
    .join(' · ')
}

/** The form's fields from a song made again: the lists' values, a length the form offers. */
export function fieldsOf(remake: Remake, kind: Kind, form: FormData): Record<string, string> {
  if (kind === 'cover') return fromTemplate(null, 'cover', form)
  const out = { ...fromTemplate(null, 'song', form), ...remake.fields }
  out.template = remake.fields.template && form.templates.some((t) => t.id === remake.fields.template) ? remake.fields.template : 'none'
  out.length = nearestLength(out.length || form.song.defaults.length || '', form.song.choices.length)
  if (!form.song.choices.vocals.includes(out.vocals)) out.vocals = form.song.defaults.vocals || 'sung'
  return out
}

export const AGAIN_TEXT: Record<Again, { title: string; text: string }> = {
  take: { title: 'A new take', text: 'The same song - title, words, notes - sung and played anew' },
  song: { title: 'A new song like it', text: 'Its style and brief - new words and music' },
  cover: { title: 'A cover of it', text: 'Its melody, in another style' },
}

/** One line that says what the song will be: style, length, voice. */
export function summary(draft: Draft): string {
  const f = draft.fields
  const parts = [f.genre, draft.kind === 'song' ? f.length?.replace(/^.*\(about ([^)]*)\).*$/, 'about $1') : `cover of ${draft.source?.title || 'your song'}`]
  if (applies('voice', draft) && f.voice) parts.push(f.voice)
  else if (f.vocals === 'instrumental') parts.push('instrumental')
  if (applies('language', draft) && f.language) parts.push(f.language)
  return parts.filter(Boolean).join(' · ')
}

// --- telling the songs in the making ---------------------------------------------------------------------

/** ``m:ss`` (``h:mm:ss`` from an hour). */
export function clock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const rest = String(s % 60).padStart(2, '0')
  return h ? `${h}:${String(m).padStart(2, '0')}:${rest}` : `${m}:${rest}`
}

/** A time of day, ``21:40`` (rounded to five minutes when ``rough``, never into the past). */
export function timeOfDay(epoch: number, rough = false, now = Date.now() / 1000): string {
  let t = epoch
  if (rough) t = Math.max(Math.ceil(now / 300) * 300, Math.round(epoch / 300) * 300)
  const date = new Date(t * 1000)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

/** About how long until ``epoch``: ``about 25 min``, ``about 1 h 10 min``, ``in a moment``. */
export function untilText(epoch: number, now: number): string {
  const minutes = Math.round((epoch - now) / 60)
  if (minutes <= 1) return 'in a moment'
  if (minutes < 60) return `about ${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = Math.round((minutes % 60) / 5) * 5
  return `about ${h} h${m ? ` ${m} min` : ''}`
}

export type Tone = 'wait' | 'busy' | 'done' | 'bad' | 'off'

/** How a song in the making is told: the state, the time, and its tone. */
export function stateOf(job: MakeJob, now: number): { title: string; detail: string; tone: Tone } {
  switch (job.status) {
    case 'waiting':
      return {
        title: job.position ? `#${job.position} in line` : 'In line',
        detail: job.eta ? `ready about ${timeOfDay(job.eta, true, now)}${job.note ? ` · ${job.note}` : ''}` : job.note,
        tone: 'wait',
      }
    case 'sending':
    case 'queued':
      return { title: 'Starting …', detail: job.eta ? `ready about ${timeOfDay(job.eta, true, now)}` : job.note || 'in the studio’s queue', tone: 'busy' }
    case 'running': {
      const elapsed = job.started ? now - job.started : 0
      const stage = job.stage?.text ? `${job.stage.text[0].toUpperCase()}${job.stage.text.slice(1)}` : 'Being made'
      return { title: `${stage} …`, detail: `${clock(elapsed)}${job.eta ? ` · ready about ${timeOfDay(job.eta, true, now)}` : ''}`, tone: 'busy' }
    }
    case 'done':
      if (job.release === 'maker') return { title: 'Ready - hear it first', detail: job.mine ? 'only you hear it now: release it, or not' : 'its maker hears it first', tone: 'done' }
      if (job.release === 'admin') return { title: 'Waiting for approval', detail: 'an admin hears it before everybody does', tone: 'wait' }
      if (job.release === 'discarded') return { title: 'Not released', detail: 'kept aside - nobody else hears it', tone: 'off' }
      if (job.release === 'rejected') return { title: 'Not approved', detail: 'kept aside - nobody else hears it', tone: 'off' }
      return { title: `Ready${job.finished ? ` ${timeOfDay(job.finished)}` : ''}`, detail: job.result?.song ? 'in the library - and at the party' : 'finding it in the library …', tone: 'done' }
    case 'failed':
      return { title: 'That did not work', detail: job.error || 'the studio stopped', tone: 'bad' }
    default:
      return { title: 'Stopped', detail: '', tone: 'off' }
  }
}

/** How far a song being made is, 0..1 - by the time it took against the estimate (never quite done before it is). */
export function progressOf(job: MakeJob, now: number): number {
  if (job.status === 'done') return 1
  if (job.status !== 'running' || !job.started) return 0
  return Math.min(0.96, Math.max(0.02, (now - job.started) / Math.max(30, job.estimate)))
}

/** The song's title once made, else what identifies it. */
export const titleOf = (job: MakeJob): string => job.result?.title || job.label
