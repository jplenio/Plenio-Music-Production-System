/**
 * Saved workflows of older Plenio versions, brought to the current widget layout before a node is
 * configured (the frontend assigns saved values position by position).
 *
 * 0.2.2 made the work mode the first widget of Song Brief and Cover Brief. A node saved before has
 * one value less, starting with the template. It gets the careful mode: its old behaviour - the
 * documents stay cached and every run is a new take - and its Song Sheets keep their saved review.
 *
 * The predecessor toolkit's placeholder ``custom`` ("let the model decide", arriving through
 * *Reuse parameters* of old jobs) is cleared from the text fields here as well: the backend treats
 * it as empty with a note, and the widget should not show a word the writer never sees (plan §8.3).
 *
 * Renamed combo values are set to their new name once the node is configured (0.5.0: the briefs'
 * *arrangement* "simple" of the pre-release is "off"; the backend still reads the old name).
 *
 * 1.0.0 added the tag field *lyrics* at the end of Export Release's *tags* option: an export saved before
 * in that mode has one value less there, so an empty lyrics tag goes in after *composer* - otherwise every
 * value after it would move one widget on (the sheet music option landed in the lyrics).
 *
 * 1.5.0 gave a sung Song Brief (and one with sparse vocals) the choice *lyrics* and the field *lyrics idea or text*
 * after its theme: a brief saved before has two values less there, so the idea choice and an empty field go in.
 */
import type { ComfyNodeDef } from '../shared/comfy'
import { TEXT_FIELDS, isLegacyPlaceholder, WIDGET_OF } from './briefTemplate'

export const MODE_BEFORE_0_2_2: Readonly<Record<string, string>> = {
  PlenioSongBrief: 'one song, stop to review',
  PlenioCoverBrief: 'one cover, stop to review'
}

/** Names of the brief's text widgets (by widget name; the vocals group's children are prefixed). */
const TEXT_WIDGETS: ReadonlySet<string> = new Set(TEXT_FIELDS.map((field) => WIDGET_OF[field]))

/** The fields a saved workflow carried as the legacy ``custom`` placeholder. */
export function legacyPlaceholderFields(name: string, values: unknown): string[] {
  if (!(name in MODE_BEFORE_0_2_2) || !values || typeof values !== 'object' || Array.isArray(values)) return []
  return Object.entries(values as Record<string, unknown>)
    .filter(([widget, value]) => TEXT_WIDGETS.has(widget) && isLegacyPlaceholder(value))
    .map(([widget]) => widget)
}

/** The Song Brief's *lyrics* choices (`core.brief.LYRICS_FROM`): the writer's from an idea, or one's own. */
export const LYRICS_FROM = ['written from the idea below', 'my own, sung as written below'] as const
/** The Song Brief's vocals widget: mode, template, description, genre, mood, tempo and length come first. */
const SONG_VOCALS_INDEX = 7
/** Where the lyrics choice is: after a sung song's language, voice and theme. */
const LYRICS_INDEX = SONG_VOCALS_INDEX + 4

/** A sung Song Brief (or one with sparse vocals) saved before 1.5.0: the lyrics choice and field go in after its
 * theme (the writer writes the lyrics from the template's idea, as it did). */
export function migrateSongLyrics(values: unknown[]): unknown[] {
  if (!['sung', 'sparse vocals'].includes(String(values[SONG_VOCALS_INDEX]))) return values
  if ((LYRICS_FROM as readonly unknown[]).includes(values[LYRICS_INDEX])) return values
  return [...values.slice(0, LYRICS_INDEX), LYRICS_FROM[0], '', ...values.slice(LYRICS_INDEX)]
}

/** The options of a combo input of a node definition (V3 `["COMBO", {options}]` or the older list form). */
export function comboOptions(nodeData: ComfyNodeDef, name: string): unknown[] {
  for (const section of Object.values(nodeData.input ?? {})) {
    const spec = (section as Record<string, unknown> | undefined)?.[name]
    if (!Array.isArray(spec)) continue
    if (Array.isArray(spec[0])) return spec[0] as unknown[]
    const options = (spec[1] as { options?: unknown } | undefined)?.options
    return Array.isArray(options) ? options : []
  }
  return []
}

/** Combo values renamed since they were saved: node type -> widget -> old value -> new value. */
export const RENAMED_VALUES: Readonly<Record<string, Readonly<Record<string, Readonly<Record<string, string>>>>>> = {
  PlenioSongBrief: { arrangement: { simple: 'off' } },
  PlenioCoverBrief: { arrangement: { simple: 'off' } }
}

/** Gives the widgets of a configured node that hold a renamed value the new one; returns their names. */
export function renameWidgetValues(type: string, widgets: readonly { name: string; value: unknown }[] | undefined): string[] {
  const renamed = RENAMED_VALUES[type]
  if (!renamed) return []
  const changed: string[] = []
  for (const widget of widgets ?? []) {
    const value = renamed[widget.name]?.[String(widget.value)]
    if (value === undefined) continue
    widget.value = value
    changed.push(widget.name)
  }
  return changed
}

/** Export Release's widgets before its *tags* option's fields: folder, naming, collision, flac, mp3, wav. */
const TAGS_INDEX = 6
/** The tag fields of the *tags* option before 1.0.0 (artist ... composer). */
const TAG_FIELDS_BEFORE_0_8_1 = 8
/** The most values an Export Release saved in *tags* mode before 1.0.0 (0.8.0; the current layout has 20). */
const EXPORT_VALUES_BEFORE_0_8_1 = 18

/** An Export Release saved in *tags* mode before 1.0.0, with an empty lyrics tag after its composer. */
export function migrateExportTags(values: unknown[]): unknown[] {
  if (values[TAGS_INDEX] !== 'tags' || values.length > EXPORT_VALUES_BEFORE_0_8_1) return values
  const at = TAGS_INDEX + 1 + TAG_FIELDS_BEFORE_0_8_1
  return [...values.slice(0, at), '', ...values.slice(at)]
}

/** ``info`` with the work mode added in front when it was saved without one (and an older Export
 * Release's tags brought to the current fields); otherwise ``info`` itself. */
export function migrateWidgetValues(
  nodeData: ComfyNodeDef,
  info: Record<string, unknown>
): Record<string, unknown> {
  if (nodeData.name === 'PlenioExportRelease' && info && Array.isArray(info.widgets_values)) {
    const values = migrateExportTags(info.widgets_values)
    return values === info.widgets_values ? info : { ...info, widgets_values: values }
  }
  const legacy = MODE_BEFORE_0_2_2[nodeData.name]
  if (!legacy || !info) return info
  const modes = comboOptions(nodeData, 'mode')
  const values = info.widgets_values
  const named = info.widgets_values_named
  let migrated = info
  if (Array.isArray(values) && values.length && !modes.includes(values[0])) {
    migrated = { ...migrated, widgets_values: [legacy, ...values] }
  }
  if (named && typeof named === 'object' && !Array.isArray(named) && !('mode' in named)) {
    migrated = { ...migrated, widgets_values_named: { mode: legacy, ...(named as Record<string, unknown>) } }
  }
  // the legacy placeholder goes; left alone where a value would have to be guessed from a position
  const cleared = legacyPlaceholderFields(nodeData.name, migrated.widgets_values_named)
  if (cleared.length) {
    const named = { ...(migrated.widgets_values_named as Record<string, unknown>) }
    for (const widget of cleared) named[widget] = ''
    migrated = { ...migrated, widgets_values_named: named }
  }
  if (nodeData.name === 'PlenioSongBrief' && Array.isArray(migrated.widgets_values)) {
    const lyrics = migrateSongLyrics(migrated.widgets_values)
    if (lyrics !== migrated.widgets_values) migrated = { ...migrated, widgets_values: lyrics }
  }
  return migrated
}
