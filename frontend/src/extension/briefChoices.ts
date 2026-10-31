/**
 * The briefs' text fields as lists to choose from - with a value of one's own (owner's request 2026-10-31: free
 * text fields were hard to fill; the player's form already lists what the style templates have).
 *
 * The lists come from the Song API's ``/briefs`` (every value the style templates have for a field), and a few fields
 * get the common values besides (keys, meters, languages). The backend keeps the fields as text: only the frontend
 * shows them as lists (the input specs are changed before the node type is registered), so saved workflows, the Song
 * API and the player read and send exactly what they did. Choosing *✎ type your own …* asks for a value; a value that
 * is not in the list - typed, or saved in a workflow - is added to it so that it shows.
 */
import type { Fetcher } from '../api/client'
import type { ComfyNode, ComfyNodeDef, ComfyNodeType, ComfyWidget } from '../shared/comfy'
import { chain } from '../shared/comfy'

export const OWN_VALUE = '✎ type your own …'

/** The fields shown as lists (top-level widgets and a vocals choice's inputs alike, by their own name). */
export const LIST_FIELDS = ['genre', 'mood', 'tempo', 'key', 'meter', 'language', 'voice', 'theme', 'lead_instrument'] as const

const KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'F', 'Bb', 'Eb', 'Ab', 'Db'].flatMap((root) => [`${root} major`])
const MINOR_KEYS = ['A', 'E', 'B', 'F#', 'C#', 'G#', 'D', 'G', 'C', 'F', 'Bb', 'Eb'].map((root) => `${root} minor`)

/** Common values besides the templates' (a field the templates rarely fill). */
export const EXTRA_VALUES: Readonly<Record<string, readonly string[]>> = {
  key: [...KEYS, ...MINOR_KEYS],
  meter: ['4/4', '3/4', '6/8', '2/4', '12/8', '5/4', '7/8'],
  language: ['English', 'German', 'Spanish', 'French', 'Italian', 'Portuguese', 'Dutch', 'Japanese', 'Korean', 'Chinese'],
  tempo: ['60 BPM', '80 BPM', '90 BPM', '100 BPM', '110 BPM', '120 BPM', '128 BPM', '140 BPM', '174 BPM'],
}

export type FieldValues = Record<string, string[]>

/** A field's list: an empty choice first (the template's value then applies), then *type your own*, then the values -
 * the templates' and the common ones, once each, as the templates spell them. */
export function listOptions(field: string, values: FieldValues): string[] {
  const seen = new Map<string, string>()
  for (const value of [...(values[field] ?? []), ...(EXTRA_VALUES[field] ?? [])]) {
    const text = String(value).replace(/\s+/g, ' ').trim()
    if (text && !seen.has(text.toLowerCase())) seen.set(text.toLowerCase(), text)
  }
  const sorted = [...seen.values()].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
  return ['', OWN_VALUE, ...sorted]
}

type Spec = [unknown, Record<string, unknown>?]

/** ``["STRING", {...}]`` as a list (``["COMBO", {options}]``); anything else (a multiline text, a list already) stays. */
export function asList(spec: unknown, options: string[]): unknown {
  if (!Array.isArray(spec) || spec[0] !== 'STRING') return spec
  const config = (spec[1] ?? {}) as Record<string, unknown>
  if (config.multiline) return spec
  return ['COMBO', { ...config, options, default: typeof config.default === 'string' ? config.default : '' }]
}

/** The input specs of a node definition with its list fields as lists - also a DynamicCombo's inputs (V3: each option
 * has ``inputs`` with ``required``/``optional``). Changes ``nodeData`` in place; returns the fields it changed. */
export function listBriefFields(nodeData: ComfyNodeDef, values: FieldValues): string[] {
  const changed: string[] = []
  const visit = (section: Record<string, unknown> | undefined, prefix: string): void => {
    if (!section) return
    for (const [name, spec] of Object.entries(section)) {
      if ((LIST_FIELDS as readonly string[]).includes(name)) {
        const list = asList(spec, listOptions(name, values))
        if (list !== spec) {
          section[name] = list
          changed.push(prefix + name)
        }
        continue
      }
      // a DynamicCombo: its options' inputs
      const config = Array.isArray(spec) ? ((spec as Spec)[1] as Record<string, unknown> | undefined) : undefined
      const options = config?.options
      if (Array.isArray(options)) {
        for (const option of options) {
          const inputs = (option as { inputs?: Record<string, Record<string, unknown>> })?.inputs
          visit(inputs?.required, `${name}.`)
          visit(inputs?.optional, `${name}.`)
        }
      }
    }
  }
  visit(nodeData.input?.required, '')
  visit(nodeData.input?.optional, '')
  return [...new Set(changed)]
}

/** A widget's field name: ``vocals.voice`` -> ``voice``. */
export const fieldOf = (widget: ComfyWidget): string => widget.name.split('.').pop() ?? widget.name

function isList(widget: ComfyWidget): boolean {
  return (LIST_FIELDS as readonly string[]).includes(fieldOf(widget)) && Array.isArray(widget.options?.values)
}

/** The current value in the widget's list, so that it shows (a value of one's own, or saved before). */
export function showValue(widget: ComfyWidget): void {
  const values = widget.options.values as unknown[]
  const value = typeof widget.value === 'string' ? widget.value : ''
  if (value && value !== OWN_VALUE && !values.includes(value)) values.splice(2, 0, value)
}

type Ask = (field: string, current: string) => Promise<string | null>

/** Every list field of a node: its value shown, and *type your own* asking for one (once per widget). */
export function installOwnValues(node: ComfyNode, ask: Ask): void {
  asks.set(node, ask)
  const done = installed.get(node) ?? new WeakSet<ComfyWidget>()
  installed.set(node, done)
  for (const widget of node.widgets ?? []) {
    if (!isList(widget)) continue
    showValue(widget)
    if (done.has(widget)) continue
    done.add(widget)
    let previous = typeof widget.value === 'string' && widget.value !== OWN_VALUE ? widget.value : ''
    const original = widget.callback
    widget.callback = function (this: unknown, value: unknown) {
      if (value !== OWN_VALUE) {
        previous = typeof value === 'string' ? value : ''
        original?.call(this, value)
        return
      }
      // the list's own entry is no value: back to the one before while the user types
      widget.value = previous
      void ask(fieldOf(widget), previous).then((typed) => {
        const text = typed?.replace(/\s+/g, ' ').trim()
        if (!text) return
        widget.value = text
        showValue(widget)
        // the whole chain: the frontend, and whatever listens to the field (the template panel)
        widget.callback?.(text)
        node.setDirtyCanvas?.(true, true)
      })
    }
  }
}

const installed = new WeakMap<ComfyNode, WeakSet<ComfyWidget>>()
const asks = new WeakMap<ComfyNode, Ask>()

/** The list fields a node has now (a vocals choice makes its fields anew) - for a node with lists only. */
export function refreshOwnValues(node: ComfyNode): void {
  const ask = asks.get(node)
  if (ask) installOwnValues(node, ask)
}

let lists: Promise<FieldValues> | null = null

/** How long the node registration waits for the lists (the fields stay text fields without them). */
const LISTS_WAIT_MS = 8000

/** The values the style templates have, per field (once; none when the answer fails or takes too long). */
export function briefLists(fetcher: Fetcher): Promise<FieldValues> {
  const answer = fetcher
    .fetchApi('/plenio/api/v1/briefs')
    .then(async (response) => (response.ok ? (((await response.json()) as { values?: FieldValues }).values ?? {}) : {}))
    .catch(() => ({}))
  lists ??= Promise.race([answer, new Promise<FieldValues>((resolve) => setTimeout(() => resolve({}), LISTS_WAIT_MS))])
  return lists
}

/** A brief node type with lists: its specs changed before it is registered, its widgets taught *type your own*. */
export async function installBriefLists(
  nodeType: ComfyNodeType,
  nodeData: ComfyNodeDef,
  fetcher: Fetcher,
  ask: Ask
): Promise<void> {
  const values = await briefLists(fetcher)
  if (!Object.keys(values).length) return
  listBriefFields(nodeData, values)
  const prototype = nodeType.prototype as ComfyNode & { onNodeCreated?: () => void }
  prototype.onNodeCreated = chain(prototype.onNodeCreated, function (this: ComfyNode) {
    installOwnValues(this, ask)
  })
  prototype.onConfigure = chain(prototype.onConfigure, function (this: ComfyNode) {
    installOwnValues(this, ask)
  })
}
