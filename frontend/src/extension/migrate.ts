/**
 * Saved workflows of older Plenio versions, brought to the current widget layout before a node is
 * configured (the frontend assigns saved values position by position).
 *
 * 0.2.2 made the work mode the first widget of Song Brief and Cover Brief. A node saved before has
 * one value less, starting with the template. It gets the careful mode: its old behaviour - the
 * documents stay cached and every run is a new take - and its Song Sheets keep their saved review.
 */
import type { ComfyNodeDef } from '../shared/comfy'

export const MODE_BEFORE_0_2_2: Readonly<Record<string, string>> = {
  PlenioSongBrief: 'one song, stop to review',
  PlenioCoverBrief: 'one cover, stop to review'
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
  return migrated
}
