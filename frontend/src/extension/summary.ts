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

/** Show the `plenio_summary` UI payload of an executed Plenio node as rendered Markdown. */
export function addSummaryDisplay(nodeType: ComfyNodeType): void {
  nodeType.prototype.onExecuted = chain(nodeType.prototype.onExecuted, function (this: ComfyNode, output) {
    const items = output?.[SUMMARY_KEY] as Summary[] | undefined
    const item = items?.[items.length - 1]
    if (!item?.markdown) return
    const element = summaryElement(this)
    element.dataset.status = item.status ?? ''
    element.innerHTML = renderMarkdown(item.markdown)
    this.setDirtyCanvas?.(true, true)
  })
}
