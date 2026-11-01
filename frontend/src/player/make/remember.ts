/**
 * The song form remembers what one chose (owner's request 2026-11-01): the fields of the last song ordered, the
 * configuration - the preset, the whole studio's values, how many takes or songs - and *release at once*; the form
 * opens with them until one changes them. The player keeps them with the settings (each account its own, on the
 * player's server), the guests' page on the guest's phone.
 *
 * Kept values are checked against the form as it is now: a style the templates no longer have, a length longer
 * than the host allows now, covers the host turned off - each falls back to what the form offers.
 */
import { COVER_FIELDS, LYRICS_IDEA, OWN_LYRICS, SONG_FIELDS, fromTemplate, nearestLength } from './form'
import type { Draft, FormData, Kind, StudioValues } from './form'

export interface Remembered {
  kind: Kind
  fields: Record<string, string>
  /** The whole studio's values (the Song API's field ids), as chosen. */
  studio?: StudioValues
  /** The preset chosen last (its id). */
  preset?: string
  /** Takes of one song or songs of the form (the whole studio). */
  count?: number
  several?: 'takes' | 'songs'
  /** Released at once: its maker does not hear it first. */
  releaseNow?: boolean
}

/** The longest text a remembered field keeps (the description and the lyrics are the longest the form takes). */
const FIELD_LIMIT = 20000

/** What the form remembers of a song just ordered. Made again from a song, only the configuration is kept: the
 * fields were that song's. */
export function rememberOf(
  draft: Draft,
  choice: { preset: string; count: number; several: 'takes' | 'songs'; releaseNow: boolean },
  before: Remembered | null = null
): Remembered {
  const fresh = !draft.again
  const out: Remembered = {
    kind: fresh ? draft.kind : (before?.kind ?? 'song'),
    fields: fresh ? { ...draft.fields } : { ...(before?.fields ?? {}) },
    releaseNow: choice.releaseNow
  }
  if (draft.studio && (Object.keys(draft.studio.fields).length || Object.keys(draft.studio.release).length)) {
    out.studio = { fields: { ...draft.studio.fields }, release: { ...draft.studio.release } }
  }
  if (choice.preset) out.preset = choice.preset
  if (choice.count > 1) {
    out.count = choice.count
    out.several = choice.several
  }
  return out
}

/** Remembered values as kept, checked (a state file edited by hand, an older version): ``null`` when there are none. */
export function rememberedOf(raw: unknown): Remembered | null {
  if (!raw || typeof raw !== 'object') return null
  const value = raw as Record<string, unknown>
  const kind: Kind = value.kind === 'cover' ? 'cover' : 'song'
  const fields: Record<string, string> = {}
  const names = new Set<string>([...SONG_FIELDS, ...COVER_FIELDS])
  if (value.fields && typeof value.fields === 'object') {
    for (const [name, text] of Object.entries(value.fields as Record<string, unknown>)) {
      if (names.has(name) && typeof text === 'string') fields[name] = text.slice(0, FIELD_LIMIT)
    }
  }
  const out: Remembered = { kind, fields, releaseNow: value.releaseNow === true }
  const studio = value.studio as { fields?: unknown; release?: unknown } | undefined
  if (studio && typeof studio === 'object') {
    const part = (raw: unknown): Record<string, unknown> => (raw && typeof raw === 'object' ? { ...(raw as Record<string, unknown>) } : {})
    out.studio = { fields: part(studio.fields), release: part(studio.release) }
  }
  if (typeof value.preset === 'string' && value.preset) out.preset = value.preset.slice(0, 40)
  if (typeof value.count === 'number' && Number.isInteger(value.count) && value.count >= 2 && value.count <= 5) {
    out.count = value.count
    out.several = value.several === 'songs' ? 'songs' : 'takes'
  }
  return out
}

/** The fields the form opens with: the remembered ones where the form offers them now, else the form's own. */
export function restoredFields(remembered: Remembered, kind: Kind, form: FormData): Record<string, string> {
  const kept = remembered.fields
  const template = form.templates.find((t) => t.id === kept.template) ?? null
  // the form's start (from the remembered style, when the templates still have it), then each remembered value
  const out = fromTemplate(template, kind, form)
  const names: readonly string[] = kind === 'cover' ? COVER_FIELDS : SONG_FIELDS
  for (const name of names) {
    const value = kept[name]
    if (value === undefined || name === 'template') continue
    if (name === 'length') {
      if (kind === 'song' && value) out.length = nearestLength(value, form.song.choices.length)
      continue
    }
    if (name === 'vocals') {
      const choices = kind === 'cover' ? form.cover.choices.vocals : form.song.choices.vocals
      if (choices.includes(value)) out.vocals = value
      continue
    }
    if (name === 'lyrics_from') {
      if (value === LYRICS_IDEA || value === OWN_LYRICS) out.lyrics_from = value
      continue
    }
    out[name] = value
  }
  return out
}

/** The kind the form opens with: a cover only while the host allows covers. */
export function restoredKind(remembered: Remembered, form: FormData): Kind {
  return remembered.kind === 'cover' && form.covers ? 'cover' : 'song'
}
