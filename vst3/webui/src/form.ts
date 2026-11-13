// The song brief as a form: ported from Plenio's own make form (frontend/src/player/make/form.ts, Apache-2.0). A style
// fills every field; the fields a song's vocals or a cover do not ask are left out; the rest of the template's
// fields ("More") start from the template's values.

import type { Brief, Field, TemplateDetail } from './types'

export type Kind = 'song' | 'cover'

export const SONG_FIELDS = ['template', 'description', 'genre', 'mood', 'tempo', 'length', 'vocals', 'language', 'voice', 'theme', 'lyrics_from', 'lyrics', 'key', 'meter'] as const
export const COVER_FIELDS = ['template', 'description', 'genre', 'mood', 'vocals', 'language', 'voice', 'theme'] as const
/** The short fields, shown two by two. */
export const LIST_FIELDS = ['genre', 'mood', 'tempo', 'length', 'vocals', 'language', 'voice', 'theme', 'key', 'meter'] as const

export const LABELS: Record<string, { label: string; hint: string; placeholder: string }> = {
  description: { label: 'Description', hint: 'The sound and the idea, in your words: what Plenio starts from', placeholder: 'e.g. dreamy synthwave about a night drive through a rainy city' },
  genre: { label: 'Genre', hint: 'The kind of music: indie pop, synthwave, salsa …', placeholder: 'e.g. synthwave' },
  mood: { label: 'Mood', hint: 'How it should feel', placeholder: 'e.g. warm, hopeful' },
  tempo: { label: 'Tempo', hint: 'How fast: a feel or beats per minute', placeholder: 'e.g. 110 BPM, upbeat' },
  length: { label: 'Length', hint: 'About how long the song is', placeholder: '' },
  vocals: { label: 'Vocals', hint: 'Sung, only a few phrases, or no singing at all', placeholder: '' },
  language: { label: 'Language', hint: 'The language of the lyrics', placeholder: 'e.g. English' },
  voice: { label: 'Voice', hint: 'Who sings, and how', placeholder: 'e.g. warm female vocal' },
  theme: { label: 'Theme', hint: 'What the lyrics are about', placeholder: 'e.g. a summer night' },
  key: { label: 'Key', hint: 'Optional: the key it is in', placeholder: 'e.g. A minor' },
  meter: { label: 'Meter', hint: 'Optional: the beats in a bar', placeholder: 'e.g. 4/4, 6/8' }
}

export const VOCALS_TEXT: Record<string, string> = {
  sung: 'Sung: a song with lyrics',
  'sparse vocals': 'Mostly music, a few sung phrases',
  instrumental: 'Instrumental: no singing',
  'original lyrics': 'The original lyrics, sung anew',
  'new lyrics': 'New lyrics on the original melody'
}

const SUNG = new Set(['sung', 'sparse vocals', 'original lyrics', 'new lyrics'])
export const LYRICS_IDEA = 'written from the idea below'
export const OWN_LYRICS = 'my own, sung as written below'

const SONG_LENGTHS = ['very short (about 1:00)', 'short (about 1:30)', 'about 2:00', 'about 2:30', 'standard (about 3:00)', 'about 3:30', 'about 4:00']

export type Values = Record<string, string | number | boolean>

/** Whether a simple field is asked: a cover keeps the original's tempo, length, key and meter; an instrumental has no
 * language, voice or theme; a cover's theme and language belong to new lyrics. */
export function applies(name: string, kind: Kind, values: Values): boolean {
  const list: readonly string[] = kind === 'cover' ? COVER_FIELDS : SONG_FIELDS
  if (!list.includes(name)) return false
  const vocals = String(values.vocals || (kind === 'cover' ? 'original lyrics' : 'sung'))
  if (['language', 'voice', 'theme', 'lyrics_from', 'lyrics'].includes(name) && !SUNG.has(vocals)) return false
  if (kind === 'cover' && (name === 'theme' || name === 'language') && vocals !== 'new lyrics') return false
  return true
}

/** The simple fields a style fills (all of them: a field the style leaves open is emptied). One's own lyrics stay;
 * a length or vocals the template does not offer becomes the nearest it does. */
export function fromStyle(style: Brief | null, kind: Kind, template: TemplateDetail | null, keep: Values = {}): Values {
  const given = (style?.fields ?? {}) as Record<string, unknown>
  const out: Values = { template: style?.id ?? 'none' }
  const names = kind === 'cover' ? COVER_FIELDS : SONG_FIELDS
  for (const name of names) {
    if (name === 'template') continue
    const v = given[name]
    const text = typeof v === 'string' ? v : v === undefined || v === null ? '' : String(v)
    out[name] = name === 'description' ? text.trim() : text.split(/\s+/).join(' ').trim()
  }
  if (kind === 'song') {
    // one's own lyrics stay when another style is chosen; else the style's idea for the lyrics
    if (keep.lyrics_from === OWN_LYRICS) Object.assign(out, { lyrics_from: OWN_LYRICS, lyrics: keep.lyrics ?? '' })
    else out.lyrics_from = LYRICS_IDEA
    const lengths = choicesOf(template, 'length', SONG_LENGTHS)
    if (!lengths.includes(String(out.length))) out.length = nearestLength(String(out.length || keep.length || ''), lengths)
    const vocals = choicesOf(template, 'vocals', ['sung', 'sparse vocals', 'instrumental'])
    if (!vocals.includes(String(out.vocals))) out.vocals = 'sung'
  } else {
    const keepVocals = String(keep.vocals ?? '')
    out.vocals = given.vocals === 'instrumental' ? 'instrumental' : ['original lyrics', 'new lyrics'].includes(keepVocals) ? keepVocals : 'original lyrics'
  }
  return out
}

export function choicesOf(template: TemplateDetail | null, id: string, fallback: string[]): string[] {
  const field = template?.fields.find((f) => f.id === id)
  return field?.choices?.length ? field.choices : fallback
}

export function lengthSeconds(option: string): number {
  const m = /(\d+):(\d{2})/.exec(option)
  return m ? Number(m[1]) * 60 + Number(m[2]) : 0
}

export function nearestLength(wanted: string, lengths: string[]): string {
  if (lengths.includes(wanted) || lengths.length === 0) return wanted || lengths[1] || ''
  const seconds = lengthSeconds(wanted)
  if (!seconds) return lengths.find((l) => l.startsWith('short')) ?? lengths[0]
  return lengths.reduce((best, l) => (Math.abs(lengthSeconds(l) - seconds) < Math.abs(lengthSeconds(best) - seconds) ? l : best), lengths[0])
}

/** The styles by group, in the order Plenio gives them; a search keeps those that have every word. */
export function grouped(styles: Brief[], query = ''): [string, Brief[]][] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  const groups = new Map<string, Brief[]>()
  for (const s of styles) {
    const f = (s.fields ?? {}) as Record<string, unknown>
    const text = `${s.name} ${s.group ?? ''} ${f.genre ?? ''} ${f.mood ?? ''}`.toLowerCase()
    if (words.length && !words.every((w) => text.includes(w))) continue
    const g = s.group || 'Other'
    groups.set(g, [...(groups.get(g) ?? []), s])
  }
  return [...groups]
}

export function surprise(styles: Brief[], kind: Kind): Brief | null {
  const pool = kind === 'cover' ? styles.filter((s) => (s.fields as Record<string, unknown> | undefined)?.vocals !== 'instrumental') : styles
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null
}

// --- the rest of the template ("More") ---

/** The fields the simple form asks itself, and those the plug-in sets: not again under More. */
const OWN = new Set<string>(['mode', 'template', 'description', 'genre', 'mood', 'tempo', 'length', 'vocals', 'language', 'voice', 'theme', 'lyrics_from', 'lyrics', 'key', 'meter', 'source.audio', 'title'])
const STUDIO_FIRST = ['finish.cover_art', 'finish.hq_mastering', 'writer.model']

export interface MoreGroup {
  title: string
  fields: Field[]
}

export function moreGroups(template: TemplateDetail | null): MoreGroup[] {
  if (!template) return []
  const own = template.fields.filter((f) => !OWN.has(f.id) && !f.fixed && f.type !== 'upload')
  const groups: MoreGroup[] = [
    // the studio's switches (cover art, mastering, the writer's model) first, then any a newer Plenio brings
    {
      title: 'The studio',
      fields: [
        ...STUDIO_FIRST.map((id) => own.find((f) => f.id === id)).filter((f): f is Field => !!f),
        ...own.filter((f) => f.id.includes('.') && !STUDIO_FIRST.includes(f.id) && !f.id.startsWith('excerpt.'))
      ]
    },
    { title: 'The song brief', fields: own.filter((f) => !STUDIO_FIRST.includes(f.id) && !f.id.includes('.')) },
    { title: 'An excerpt of the original', fields: own.filter((f) => f.id.startsWith('excerpt.')) }
  ]
  return groups.filter((g) => g.fields.length)
}

/** What the plug-in starts from: the template's values, but no cover art until it is asked for (it costs about a minute
 * per take; switched on, the song shows it and keeps it as cover.jpg). */
export function moreStart(template: TemplateDetail | null): Values {
  const out: Values = {}
  for (const g of moreGroups(template)) for (const f of g.fields) out[f.id] = f.default as string | number | boolean
  if ('finish.cover_art' in out) out['finish.cover_art'] = false
  return out
}

/** Whether a field applies to the choices made (its `when`). */
export function fieldApplies(field: Field, values: Values, template: TemplateDetail | null): boolean {
  for (const [parent, choices] of Object.entries(field.when ?? {})) {
    const sibling = template?.fields.find((f) => f.id === parent)
    const chosen = parent in values ? values[parent] : sibling?.default
    if (chosen !== undefined && chosen !== '' && !choices.includes(String(chosen))) return false
  }
  return true
}

/** The fields for Plenio: the simple ones that apply, and those of More that apply. */
export function request(kind: Kind, simple: Values, more: Values, template: TemplateDetail | null): Values {
  const out: Values = {}
  for (const [name, value] of Object.entries(simple)) if (name === 'template' || name === 'description' || applies(name, kind, simple)) out[name] = value
  const all = { ...simple, ...more }
  for (const g of moreGroups(template)) for (const f of g.fields) if (f.id in more && fieldApplies(f, all, template)) out[f.id] = more[f.id]
  return out
}

/** What is still missing before the song can be made (empty: nothing). */
export function missing(kind: Kind, simple: Values, source: string): string[] {
  const out: string[] = []
  if (kind === 'cover' && !source) out.push('the original recording')
  const template = String(simple.template ?? '')
  if ((!template || template === 'none') && !String(simple.genre ?? '').trim() && !String(simple.description ?? '').trim()) out.push('a style, a genre or a description')
  if (simple.lyrics_from === OWN_LYRICS && applies('lyrics', kind, simple) && !String(simple.lyrics ?? '').trim()) out.push('your lyrics')
  return out
}

/** A field's label as people read it ("lyrics closeness" -> "Lyrics closeness"). */
export function labelOf(field: Field): string {
  const known = LABELS[field.id]?.label
  if (known) return known
  const t = field.label || field.id
  return t.charAt(0).toUpperCase() + t.slice(1)
}

/** One line that says what the song will be. */
export function summary(kind: Kind, simple: Values): string {
  const parts = [String(simple.genre ?? '')]
  if (kind === 'song') parts.push(String(simple.length ?? '').replace(/^.*\(about ([^)]*)\).*$/, 'about $1'))
  if (applies('voice', kind, simple) && simple.voice) parts.push(String(simple.voice))
  else if (simple.vocals === 'instrumental') parts.push('instrumental')
  return parts.filter(Boolean).join(' · ')
}
