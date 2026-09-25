/**
 * The small part of the ComfyUI frontend API that Plenio uses (R11: documented
 * extension hooks, widgets and node callbacks only). The official type package
 * is not usable (published empty), so the shapes are declared here.
 */

export interface ComfyWidget {
  name: string
  type: string
  value: unknown
  options: Record<string, unknown>
  serialize?: boolean
  element?: HTMLElement
  callback?: (value: unknown) => void
  computeSize?: (width: number) => [number, number]
}

export interface DOMWidgetOptions {
  getValue?: () => unknown
  setValue?: (value: unknown) => void
  serialize?: boolean
  hideOnZoom?: boolean
  getMinHeight?: () => number
  getMaxHeight?: () => number
}

export interface ComfyNode {
  id: number | string
  type: string
  title: string
  comfyClass?: string
  widgets?: ComfyWidget[]
  properties: Record<string, unknown>
  addDOMWidget(name: string, type: string, element: HTMLElement, options?: DOMWidgetOptions): ComfyWidget
  setDirtyCanvas?(foreground: boolean, background?: boolean): void
  onExecuted?: (output: Record<string, unknown>) => void
  configure?: (info: Record<string, unknown>) => unknown
}

export interface ComfyNodeType {
  prototype: ComfyNode
  comfyClass?: string
}

export interface ComfyNodeDef {
  name: string
  display_name?: string
  category?: string
  input?: Record<string, Record<string, unknown>>
}

export type InputSpec = [string, Record<string, unknown>?]

export type WidgetConstructor = (
  node: ComfyNode,
  inputName: string,
  inputData: InputSpec,
  app: ComfyApp
) => { widget: ComfyWidget; minWidth?: number; minHeight?: number }

export interface ComfyExtension {
  name: string
  getCustomWidgets?: (app: ComfyApp) => Record<string, WidgetConstructor>
  beforeRegisterNodeDef?: (nodeType: ComfyNodeType, nodeData: ComfyNodeDef, app: ComfyApp) => void | Promise<void>
  nodeCreated?: (node: ComfyNode, app: ComfyApp) => void
  setup?: (app: ComfyApp) => void | Promise<void>
}

export interface ComfyApp {
  registerExtension(extension: ComfyExtension): void
  graph?: unknown
}

/** Chain a new callback onto an existing optional node callback. */
export function chain<T extends unknown[]>(
  original: ((...args: T) => void) | undefined,
  added: (...args: T) => void
): (...args: T) => void {
  return function (this: unknown, ...args: T) {
    original?.apply(this, args)
    added.apply(this, args)
  }
}
