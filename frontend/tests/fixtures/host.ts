/**
 * A minimal ComfyUI node for the widget tests: named widgets, the element the panel draws into and a
 * no-op canvas. The panels only read ``widgets`` and call ``addDOMWidget``/``setDirtyCanvas``.
 */
import type { ComfyNode, ComfyWidget } from '../../src/shared/comfy'

export interface Host {
  node: ComfyNode
  /** The element the panel handed to ``addDOMWidget``. */
  readonly root: HTMLElement
  value: (name: string) => string
}

export function host(values: Record<string, string>): Host {
  const widgets: ComfyWidget[] = Object.entries(values).map(([name, value]) => ({
    name,
    type: 'string',
    value,
    options: {}
  }))
  const held: { root: HTMLElement } = { root: document.createElement('div') }
  const node = {
    id: 1,
    type: 'PlenioTest',
    title: 'Plenio Test',
    widgets,
    properties: {},
    addDOMWidget: (_name: string, _type: string, element: HTMLElement) => {
      held.root = element
      return { name: 'panel', type: 'panel', value: '', options: {} }
    },
    setDirtyCanvas: () => {}
  } as unknown as ComfyNode
  return {
    node,
    get root() {
      return held.root
    },
    value: (name: string) => String(widgets.find((widget) => widget.name === name)?.value ?? '')
  }
}
