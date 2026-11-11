/**
 * Presets for making a song (owner's request 2026-10-26: configurations of every field, kept under a name, and some
 * ready-made - such as the best quality with cover art): the form's fields, the whole studio's values (HQ mastering,
 * cover art, lyrics fidelity, the formats …) and how many takes. A preset sets only what applies to the one who uses
 * it: the party's guests get its form fields (a length, the vocals), the whole studio everything.
 */
import makePresets from '../../../../resources/presets/make.json'
import { nearestLength, type Draft, type FormData, type StudioSpec } from './form'

export interface MakePreset {
  id: string
  name: string
  /** What it is for, in a few words. */
  text: string
  icon: string
  builtIn?: boolean
  /** The form's fields it sets (``length``, ``vocals``, ``genre`` …). */
  fields: Record<string, string>
  /** The whole studio's values it sets (the Song API's field ids). */
  studio?: { fields?: Record<string, unknown>; release?: Record<string, unknown> }
  /** Takes of the song (the whole studio). */
  takes?: number
}

/** The six ready-made presets: one file for the player, the Song API and the templates' preset field
 * (``resources/presets/make.json``). */
export const BUILT_IN_PRESETS: MakePreset[] = (makePresets.presets as unknown as Omit<MakePreset, 'builtIn'>[]).map((preset) => ({
  ...preset,
  builtIn: true
}))

/** The form's fields a preset keeps: every field of the form but the description (that is the song, not a setting). */
const KEPT_FIELDS = ['template', 'genre', 'mood', 'tempo', 'length', 'vocals', 'language', 'voice', 'theme', 'key', 'meter']

/** A preset of the form as it is now: its fields, the whole studio's values, the takes. */
export function presetOf(name: string, draft: Draft, takes = 1, id = `my-${Date.now().toString(36)}`): MakePreset {
  const fields: Record<string, string> = {}
  for (const key of KEPT_FIELDS) if (draft.fields[key]) fields[key] = draft.fields[key]
  return {
    id,
    name: name.trim().slice(0, 40) || 'My preset',
    text: '',
    icon: 'save',
    fields,
    studio: draft.studio ? { fields: { ...draft.studio.fields }, release: { ...draft.studio.release } } : undefined,
    takes: takes > 1 ? takes : undefined,
  }
}

/** The user's presets as kept, checked (a state file edited by hand, an older version). */
export function presetsOf(raw: unknown): MakePreset[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((p): p is MakePreset => !!p && typeof p === 'object' && typeof p.id === 'string' && typeof p.name === 'string')
    .slice(0, 40)
    .map((p) => ({
      id: p.id.slice(0, 40),
      name: p.name.slice(0, 40),
      text: typeof p.text === 'string' ? p.text.slice(0, 200) : '',
      icon: 'save',
      fields: Object.fromEntries(Object.entries(p.fields && typeof p.fields === 'object' ? p.fields : {}).filter(([k, v]) => KEPT_FIELDS.includes(k) && typeof v === 'string')),
      studio: p.studio && typeof p.studio === 'object' ? { fields: { ...(p.studio.fields ?? {}) }, release: { ...(p.studio.release ?? {}) } } : undefined,
      takes: typeof p.takes === 'number' && p.takes >= 1 && p.takes <= 4 ? Math.round(p.takes) : undefined,
    }))
}

export interface Applied {
  /** The fields it set (form and studio). */
  set: string[]
  /** Takes to make (1: one). */
  takes: number
}

/** Use a preset: the form's fields that apply and are values the form offers, the whole studio's values its fields
 * take (``spec``: the studio's fields, ``null`` without the whole studio), the takes when the whole studio has them. */
export function applyPreset(preset: MakePreset, draft: Draft, form: FormData, spec: StudioSpec | null): Applied {
  const set: string[] = []
  for (const [name, value] of Object.entries(preset.fields)) {
    let next = value
    if (name === 'length') {
      if (draft.kind === 'cover') continue
      next = nearestLength(value, form.song.choices.length)
      if (!next) continue
    }
    if (name === 'vocals') {
      const choices = draft.kind === 'cover' ? form.cover.choices.vocals : form.song.choices.vocals
      if (!choices.includes(value)) continue
    }
    if (name === 'template' && value !== 'none' && !form.templates.some((t) => t.id === value)) continue
    draft.fields[name] = next
    set.push(name)
  }
  // a field the vocals leave out (a voice for an instrumental) is kept in the form; the request leaves it out
  if (spec && draft.studio) {
    for (const part of ['fields', 'release'] as const) {
      const fields = part === 'fields' ? spec.fields : spec.release
      for (const [id, value] of Object.entries(preset.studio?.[part] ?? {})) {
        const field = fields.find((f) => f.id === id)
        if (!field || field.fixed) continue
        if (field.choices && !field.choices.includes(String(value))) continue
        if (field.type === 'boolean' && typeof value !== 'boolean') continue
        draft.studio[part][id] = value
        set.push(id)
      }
    }
  }
  return { set, takes: spec ? Math.max(1, Math.min(4, preset.takes ?? 1)) : 1 }
}

/** What of a preset stays when a style is chosen after it: how long the song is and how it is sung - the style fills
 * the rest (its genre, mood, tempo …). ``null`` when the preset sets neither. */
export const FORMAT_FIELDS = ['length', 'vocals']
export function formatOf(preset: MakePreset): MakePreset | null {
  const fields = Object.fromEntries(Object.entries(preset.fields).filter(([name]) => FORMAT_FIELDS.includes(name)))
  return Object.keys(fields).length ? { ...preset, fields, studio: undefined, takes: undefined } : null
}

/** Whether a preset does anything for this form: a field it may set, or the whole studio's values and takes. */
export function presetMatters(preset: MakePreset, draft: Draft, form: FormData, full: boolean): boolean {
  if (full && (preset.takes || Object.keys(preset.studio?.fields ?? {}).length || Object.keys(preset.studio?.release ?? {}).length)) return true
  return Object.entries(preset.fields).some(([name, value]) => {
    if (name === 'length') return draft.kind !== 'cover' && form.song.choices.length.length > 0
    if (name === 'vocals') return (draft.kind === 'cover' ? form.cover.choices.vocals : form.song.choices.vocals).includes(value)
    return true
  })
}
