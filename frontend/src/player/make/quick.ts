/**
 * *Make a song*, short first (phase 6.5, PD §9.2): one field - what the song should be about - the style chips and
 * *Generate*. A chip takes a template of its group (one with singing first); the song then has every value of that
 * template, as the full form fills them, and the words become the idea its lyrics are written from (for an
 * instrumental style: the start of its description). *More options* keeps today's form.
 */
import { type FormData, fromTemplate, LYRICS_IDEA, type MakeRequest, requestOf, type StyleTemplate } from './form'

/** The style chips: the templates' groups, in the server's order. */
export function styleGroups(templates: StyleTemplate[]): string[] {
  return [...new Set(templates.map((t) => t.group))]
}

/** A template of ``group``: one that sings first; another one than ``not`` when there is one. */
export function templateOf(group: string, templates: StyleTemplate[], not = '', random: () => number = Math.random): StyleTemplate | null {
  const all = templates.filter((t) => t.group === group)
  const sung = all.filter((t) => t.fields.vocals !== 'instrumental')
  const pool = (sung.length ? sung : all).filter((t) => t.id !== not)
  const list = pool.length ? pool : all
  return list.length ? list[Math.floor(random() * list.length)] : null
}

/** The request of the short form: the template's values (or none), with the words as the song's idea. */
export function quickRequest(about: string, template: StyleTemplate | null, form: FormData): MakeRequest {
  const words = about.trim()
  const fields = fromTemplate(template, 'song', form)
  if (!template) fields.description = words
  else if (fields.vocals === 'instrumental') fields.description = [words, fields.description].filter(Boolean).join(' - ')
  else if (words) Object.assign(fields, { lyrics_from: LYRICS_IDEA, lyrics: words })
  // the fields that apply, as the full form sends them
  return requestOf({ kind: 'song', fields, source: null })
}

/** What the short form still needs (an empty text: ready). */
export function quickMissing(about: string, template: StyleTemplate | null): string {
  return about.trim() || template ? '' : 'a few words, or a style'
}
