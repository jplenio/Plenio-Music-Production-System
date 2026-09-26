import { chain, type ComfyNode, type ComfyNodeType } from '../shared/comfy'
import { renderMarkdown } from '../shared/markdown'

export const SUMMARY_KEY = 'plenio_summary'
const WIDGET_NAME = 'plenio_summary'

interface Summary {
  markdown?: string
  status?: string
}

function summaryElement(node: ComfyNode): HTMLElement {
  const existing = node.widgets?.find((widget) => widget.name === WIDGET_NAME)
  if (existing?.element) return existing.element
  const element = document.createElement('div')
  element.className = 'plenio-summary'
  const widget = node.addDOMWidget(WIDGET_NAME, 'plenio_summary', element, { serialize: false, getValue: () => '', setValue: () => {} })
  widget.serialize = false // display only: not part of the saved widget values
  return element
}

function show(node: ComfyNode, item: Summary): void {
  if (!item.markdown) return
  const element = summaryElement(node)
  element.dataset.status = item.status ?? ''
  element.innerHTML = renderMarkdown(item.markdown)
  node.setDirtyCanvas?.(true, true)
}

/** Show the `plenio_summary` UI payload of an executed Plenio node as rendered Markdown.
 *
 * The last summary is kept in the node's properties, so it is back after a page reload, a tab
 * switch or App mode (the node is re-created then); every run replaces it - also for cached nodes,
 * whose summary the backend re-sends (`has_intermediate_output`). */
export function addSummaryDisplay(nodeType: ComfyNodeType): void {
  nodeType.prototype.onExecuted = chain(nodeType.prototype.onExecuted, function (this: ComfyNode, output) {
    const items = output?.[SUMMARY_KEY] as Summary[] | undefined
    const item = items?.[items.length - 1]
    if (!item?.markdown) return
    this.properties = this.properties ?? {}
    this.properties[SUMMARY_KEY] = { markdown: item.markdown, status: item.status ?? '' }
    show(this, item)
  })
  nodeType.prototype.onConfigure = chain(nodeType.prototype.onConfigure, function (this: ComfyNode) {
    const saved = this.properties?.[SUMMARY_KEY] as Summary | undefined
    if (saved?.markdown) show(this, saved)
  })
}
