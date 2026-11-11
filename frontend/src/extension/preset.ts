/**
 * The templates' *Preset* field (PD 7.1): choosing one of the six presets sets the template's fields in the page -
 * visible widget changes, one undo step - from ``/plenio/presets?template=<API id>`` (``core/presets.py:
 * template_changes``), which names per field the node and its input, or the switch.
 */
import type { Fetcher } from '../api/client'
import type { ComfyNode } from '../shared/comfy'

export const PRESET_NODE = 'PlenioPreset'
export const NONE = 'none'

export interface PresetChange {
  field: string
  node?: number
  input?: string
  switch?: string
  value: unknown
}

export interface GraphLike {
  getNodeById?(id: number): ComfyNode | null | undefined
  nodes?: ComfyNode[]
}

/** Set the changes on the graph: widgets by node and input, switches through ``setSwitch``. Returns the fields that
 * changed (a node or widget the open workflow no longer has is left out). */
export function applyChanges(
  graph: GraphLike,
  changes: PresetChange[],
  setSwitch: (name: string, on: boolean) => void
): string[] {
  const changed: string[] = []
  for (const change of changes) {
    if (change.switch) {
      setSwitch(change.switch, Boolean(change.value))
      changed.push(change.field)
      continue
    }
    if (change.node === undefined || !change.input) continue
    const node = graph.getNodeById?.(change.node) ?? graph.nodes?.find((n) => n.id === change.node)
    const widget = node?.widgets?.find((w) => w.name === change.input)
    if (!widget) continue
    if (widget.value === change.value) continue
    widget.value = change.value
    ;(widget as { callback?: (value: unknown) => void }).callback?.(change.value)
    changed.push(change.field)
  }
  return changed
}

const cache = new Map<string, Promise<Record<string, PresetChange[]>>>()

/** What each preset changes in the template of API id ``template`` (read once per page). */
export function changesFor(fetcher: Fetcher, template: string): Promise<Record<string, PresetChange[]>> {
  let found = cache.get(template)
  if (!found) {
    found = fetcher
      .fetchApi(`/plenio/presets?template=${encodeURIComponent(template)}`)
      .then(async (response) => (response.ok ? ((await response.json()).changes ?? {}) : {}))
    cache.set(template, found)
    found.catch(() => cache.delete(template))
  }
  return found
}
