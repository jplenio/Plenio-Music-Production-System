/**
 * Model Choice in the graph: the file *auto* takes on this computer, shown beside *auto*; files a loader would
 * refuse, marked with the reason; and a run that stops because a model file is missing, said in a notice.
 *
 * The facts come from ``/plenio/models/files`` (per component: the folder's files with what keeps one from loading,
 * and the plan's ``pick``). The field shows them through the combo's ``getOptionLabel`` - the value stays the file's
 * name, so saved workflows, the API prompt and the Song API are unchanged. ComfyUI copies an inner widget's options
 * to a block's promoted field when the lists are refreshed (R); the block fields of a workflow just loaded get the
 * labels here directly. A frontend without ``getOptionLabel`` shows the plain names.
 */
import type { Fetcher } from '../api/client'
import type { ComfyNode, ComfyWidget } from '../shared/comfy'

export const MODEL_CHOICE = 'PlenioModelChoice'
export const MISSING_EVENT = 'plenio.models_missing'
export const AUTO = 'auto'
const FILE_WIDGET = 'component.file'

export interface ModelPick {
  file: string
  reason: string
  warning?: string
  installed: boolean
  source: string
}

export interface ComponentFiles {
  folder: string
  /** File name -> why a loader would refuse it (``null``: it would not). */
  files: Record<string, string | null>
  pick?: ModelPick | null
}

export type ModelFiles = Record<string, ComponentFiles>

/** A model file's name without its extension, as the plan names it in a sentence. */
export function stem(file: string): string {
  return file.replace(/\.(safetensors|ckpt|bin|gguf|pt|pth)$/i, '')
}

/** What the plan's reason says about the card, shortly: ``16.0 GB of graphics memory: runs on the card, installed``
 * -> ``runs on the card``. */
export function shortReason(reason: string): string {
  const after = reason.includes(': ') ? reason.slice(reason.indexOf(': ') + 2) : reason
  return after.split(',')[0].trim()
}

/** How a Model Choice field shows ``value``: *auto* with the plan's file and why; a file a loader would refuse with
 * the reason; any other file as it is. */
export function optionLabel(value: string | null | undefined, info: ComponentFiles | undefined): string {
  const text = String(value ?? '')
  if (text === AUTO) {
    const pick = info?.pick
    if (!pick?.file) return AUTO
    const how = pick.source === 'config' ? 'pinned in config.toml' : shortReason(pick.reason)
    return `${AUTO} · ${stem(pick.file)} · ${how}${pick.installed ? '' : ' · to download'}`
  }
  const problem = info?.files?.[text]
  return problem ? `${text} · does not fit: ${problem}` : text
}

export interface MissingDetail {
  component?: string
  file?: string
  folder?: string
  url?: string | null
  variant?: string | null
}

/** The notice for a run that stopped at a missing model file (``plenio.models_missing``). Plenio Setup downloads
 * catalogue files once it is there; until then the notice names the folder and the address. */
export function missingNotice(detail: MissingDetail): { summary: string; detail: string } {
  const file = detail.file || 'a model file'
  const folder = detail.folder ? `models/${detail.folder}` : 'its model folder'
  const where = detail.url
    ? `Download it from ${detail.url} into ${folder}, then run again.`
    : `It is a file of your own: put it into ${folder}, or set the field to auto.`
  return { summary: `Model missing: ${file}`, detail: where }
}

/** The component a Model Choice node is set to. */
/** Whether a Model Choice set to ``value`` has no file to give: *auto* whose plan file is not installed, or a
 * file that is not in its folder. Unknown (nothing read yet): ``false``. */
export function lacksFile(value: unknown, info: ComponentFiles | undefined): boolean {
  if (!info) return false
  const text = String(value ?? '')
  if (text === AUTO) return info.pick ? !info.pick.installed : false
  return !(text in info.files)
}

export function componentOf(node: ComfyNode): string {
  return String(node.widgets?.find((w) => w.name === 'component')?.value ?? '')
}

function labelWidget(widget: ComfyWidget, info: () => ComponentFiles | undefined): void {
  widget.options = { ...widget.options, getOptionLabel: (value?: string | null) => optionLabel(value, info()) }
}

/** The facts of every component (empty when the server has no such route: an older Plenio). */
export async function loadModelFiles(fetcher: Fetcher): Promise<ModelFiles> {
  try {
    const response = await fetcher.fetchApi('/plenio/models/files')
    if (!response.ok) return {}
    const data = (await response.json()) as { components?: ModelFiles }
    return data.components ?? {}
  } catch {
    return {}
  }
}

/** Keeps the facts and puts the labels on Model Choice fields - the nodes' own and the blocks' promoted ones. */
export class ModelChoiceLabels {
  private files: ModelFiles = {}

  constructor(private readonly fetcher: Fetcher) {}

  info(component: string): ComponentFiles | undefined {
    return this.files[component]
  }

  async refresh(): Promise<void> {
    this.files = await loadModelFiles(this.fetcher)
  }

  /** The node's file field shows the labels of its current component (its child widget is made anew when the
   * component changes: called again then). */
  label(node: ComfyNode): void {
    const widget = node.widgets?.find((w) => w.name === FILE_WIDGET)
    if (widget) labelWidget(widget, () => this.info(componentOf(node)))
  }

  /** A block's promoted fields that show a Model Choice inside it: the field whose list is that node's list. */
  labelBlock(block: ComfyNode & { subgraph?: { nodes?: ComfyNode[] } }): void {
    const inner = (block.subgraph?.nodes ?? []).filter((n) => n.type === MODEL_CHOICE || n.comfyClass === MODEL_CHOICE)
    const taken = new Set<ComfyWidget>()
    for (const choice of inner) {
      const own = choice.widgets?.find((w) => w.name === FILE_WIDGET)
      const values = own?.options?.values
      if (!Array.isArray(values)) continue
      const host = (block.widgets ?? []).find(
        (w) => !taken.has(w) && w.type === 'combo' && sameList(w.options?.values, values)
      )
      if (!host) continue
      taken.add(host)
      const component = componentOf(choice)
      labelWidget(host, () => this.info(component))
    }
  }
}

function sameList(a: unknown, b: unknown[]): boolean {
  return Array.isArray(a) && a.length === b.length && a.every((value, index) => value === b[index])
}
