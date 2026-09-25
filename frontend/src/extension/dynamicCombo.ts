/**
 * Workaround for a widget-restore defect of ComfyUI frontend 1.53.6.
 *
 * When a saved node is loaded, the frontend assigns the saved values position by position while a
 * DynamicCombo inserts or removes its child widgets. For a node whose DynamicCombo comes first
 * and whose default option has no children, the child's value lands in the combo itself: Score
 * Tools saved as `fit length` / 75 s came back as `operation = 75` (Phase 4B, measured). The
 * native Start Loop loses the widget after its combo the same way.
 *
 * The saved values are copied before the node is configured and applied again afterwards: by
 * name when the workflow has `widgets_values_named`, otherwise in save order. Setting a combo
 * inserts its children directly after it, so they take the following values - the order in which
 * the node was serialised. `onConfigure` cannot be used: it already sees the overwritten values.
 */
import type { ComfyNode, ComfyWidget } from '../shared/comfy'

export const DYNAMIC_COMBO = 'COMFY_DYNAMICCOMBO_V3'

export type SavedValues = unknown[] | Record<string, unknown>

interface ConfigureInfo {
  widgets_values?: unknown
  widgets_values_named?: unknown
}

/** A copy of the saved widget values of a node's configure data (named values preferred). */
export function savedWidgetValues(info: ConfigureInfo | undefined): SavedValues | undefined {
  const named = info?.widgets_values_named
  if (named && typeof named === 'object' && !Array.isArray(named)) return { ...(named as Record<string, unknown>) }
  return Array.isArray(info?.widgets_values) ? [...info.widgets_values] : undefined
}

function serializable(node: ComfyNode): ComfyWidget[] {
  return (node.widgets ?? []).filter((widget) => widget.serialize !== false)
}

function matches(node: ComfyNode, saved: SavedValues): boolean {
  const widgets = serializable(node)
  if (Array.isArray(saved)) {
    return widgets.length === saved.length && widgets.every((widget, index) => widget.value === saved[index])
  }
  return widgets.every((widget) => !(widget.name in saved) || widget.value === saved[widget.name])
}

function offers(widget: ComfyWidget, value: unknown): boolean {
  const options = (widget.options?.values as unknown[] | undefined) ?? []
  return options.includes(value)
}

/**
 * Apply ``saved`` again when the restored widgets differ from it. Returns true when the node was
 * repaired. A combo value the node does not offer stops the repair (the frontend reports it).
 */
export function restoreWidgetValues(
  node: ComfyNode,
  saved: SavedValues | undefined,
  combos: ReadonlySet<string>
): boolean {
  if (!saved || !node.widgets || matches(node, saved)) return false
  let index = 0
  // the list grows while it is walked: a combo inserts its children right after itself
  for (let position = 0; position < node.widgets.length; position++) {
    const widget = node.widgets[position]
    if (widget.serialize === false) continue
    let value: unknown
    if (Array.isArray(saved)) {
      if (index >= saved.length) break
      value = saved[index++]
    } else if (widget.name in saved) {
      value = saved[widget.name]
    } else {
      continue
    }
    if (combos.has(widget.name) && !offers(widget, value)) return true
    if (widget.value !== value) widget.value = value
  }
  return true
}

/** Names of the DynamicCombo inputs of a node definition. */
export function dynamicComboNames(input: Record<string, Record<string, unknown>> | undefined): Set<string> {
  const names = new Set<string>()
  for (const section of Object.values(input ?? {})) {
    for (const [name, spec] of Object.entries(section ?? {})) {
      if (Array.isArray(spec) && spec[0] === DYNAMIC_COMBO) names.add(name)
    }
  }
  return names
}
