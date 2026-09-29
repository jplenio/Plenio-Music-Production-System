import { chain, type ComfyNode, type ComfyNodeType } from '../shared/comfy'
import { renderMarkdown } from '../shared/markdown'

export const SUMMARY_KEY = 'plenio_summary'
const WIDGET_NAME = 'plenio_summary'
/**
 * The summary never gets less than about four lines (a headline and three notes): without a minimum
 * the frontend squeezed it into whatever height was left - one clipped line on Score Tools and the
 * EQ - and shrank the brief's description field to make room.
 */
export const SUMMARY_MIN_HEIGHT = 84
const LINE_HEIGHT = 18
const CHARS_PER_LINE = 55
const PADDING = 16

interface Summary {
  markdown?: string
  status?: string
}

/**
 * The height a summary's text needs, estimated from the Markdown (lines, long ones wrapped). The DOM
 * cannot tell while the node is off screen - its ``scrollHeight`` is 0 then, and the frontend kept the
 * minimum it computed at that moment even after the node came into view.
 */
export function estimatedHeight(markdown: string): number {
  const lines = markdown
    .split('\n')
    .filter((line) => line.trim())
    .reduce((sum, line) => sum + Math.max(1, Math.ceil(line.length / CHARS_PER_LINE)), 0)
  return PADDING + lines * LINE_HEIGHT
}

function summaryElement(node: ComfyNode, text: { markdown: string }): HTMLElement {
  const existing = node.widgets?.find((widget) => widget.name === WIDGET_NAME)
  if (existing?.element) return existing.element
  const element = document.createElement('div')
  element.className = 'plenio-summary'
  const widget = node.addDOMWidget(WIDGET_NAME, 'plenio_summary', element, {
    serialize: false,
    getValue: () => '',
    setValue: () => {},
    getMinHeight: () => SUMMARY_MIN_HEIGHT,
    // as tall as its text: a short summary leaves the rest of the node to the other widgets
    getMaxHeight: () =>
      Math.max(SUMMARY_MIN_HEIGHT, element.scrollHeight ? element.scrollHeight + 2 : estimatedHeight(text.markdown))
  })
  widget.serialize = false // display only: not part of the saved widget values
  return element
}

/**
 * A node that is too small for its widgets and the summary grows downwards (it never shrinks, so a
 * size the user chose stays). The templates reserve this room, so they do not grow; a node placed by
 * hand does, instead of hiding its summary.
 */
export function fitNode(node: ComfyNode): void {
  // LiteGraph's computeSize takes an optional *output array*, not a width
  const needed = node.computeSize?.()
  if (needed && node.size && node.size[1] < needed[1]) node.setSize?.([node.size[0], needed[1]])
}

/** The summary text per node, read by the widget's height callback (the element may be off screen). */
const texts = new WeakMap<ComfyNode, { markdown: string }>()

function show(node: ComfyNode, item: Summary): void {
  if (!item.markdown) return
  const text = texts.get(node) ?? { markdown: '' }
  text.markdown = item.markdown
  texts.set(node, text)
  const element = summaryElement(node, text)
  element.dataset.status = item.status ?? ''
  element.innerHTML = renderMarkdown(item.markdown)
  fitNode(node)
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
