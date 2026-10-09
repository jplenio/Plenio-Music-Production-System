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

/** ``info`` with the work mode added in front when it was saved without one; otherwise ``info`` itself. */
export function migrateWidgetValues(
  nodeData: ComfyNodeDef,
  info: Record<string, unknown>
): Record<string, unknown> {
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
  return migrated
}
