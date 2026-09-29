/**
 * The run summary under a node (``plenio_summary``): it keeps about four lines after a run instead of
 * being squeezed into what is left, a node that is too small grows (never shrinks), and the summary
 * comes back after a reload. LiteGraph's ``computeSize`` takes an optional *output array* - a width
 * passed there threw inside ``onExecuted`` and the summary never appeared (found by the browser check).
 */
import { describe, expect, it } from 'vitest'

import { SUMMARY_MIN_HEIGHT, addSummaryDisplay, estimatedHeight } from '../src/extension/summary'
import type { ComfyNode, ComfyNodeType, DOMWidgetOptions } from '../src/shared/comfy'

interface FakeNode extends ComfyNode {
  size: [number, number]
  options?: DOMWidgetOptions
  element?: HTMLElement
}

/** A node type with the parts the summary uses; ``minimum`` is what computeSize reports. */
function nodeType(minimum: [number, number]): { type: ComfyNodeType; create: (size: [number, number]) => FakeNode } {
  const prototype = {} as ComfyNode
  const type = { prototype } as ComfyNodeType
  addSummaryDisplay(type)
  const create = (size: [number, number]): FakeNode => {
    const node = Object.create(prototype) as FakeNode
    Object.assign(node, {
      id: 1,
      type: 'PlenioTest',
      title: 'Plenio Test',
      properties: {},
      widgets: [],
      size: [...size] as [number, number],
      setSize(next: [number, number]) {
        node.size = [...next] as [number, number]
      },
      computeSize(out?: [number, number]) {
        // LiteGraph writes into ``out`` when one is given; a number there throws
        if (out !== undefined && !Array.isArray(out)) throw new TypeError("Cannot create property '0' on number")
        const result: [number, number] = out ?? [0, 0]
        result[0] = minimum[0]
        result[1] = minimum[1]
        return result
      },
      addDOMWidget(name: string, widgetType: string, element: HTMLElement, options?: DOMWidgetOptions) {
        node.options = options
        node.element = element
        const widget = { name, type: widgetType, value: '', options: {}, element }
        node.widgets?.push(widget)
        return widget
      },
      setDirtyCanvas() {}
    })
    return node
  }
  return { type, create }
}

describe('the run summary', () => {
  it('keeps about four lines and is as tall as its text beyond that', () => {
    const { create } = nodeType([300, 200])
    const node = create([340, 400])
    node.onExecuted?.({ plenio_summary: [{ status: 'warning', markdown: '**Done**\n- note: one' }] })
    expect(node.element?.dataset.status).toBe('warning')
    expect(node.element?.innerHTML).toContain('<strong>Done</strong>')
    expect(node.options?.getMinHeight?.()).toBe(SUMMARY_MIN_HEIGHT)
    expect(node.options?.getMaxHeight?.()).toBeGreaterThanOrEqual(SUMMARY_MIN_HEIGHT)
    expect(node.options?.serialize).toBe(false)
  })

  it('asks for the height of its text even while the node is off screen', () => {
    // off screen the element is not laid out (scrollHeight 0, as in happy-dom): the estimate from the
    // text decides, otherwise the frontend kept the minimum once the node came into view
    const { create } = nodeType([300, 200])
    const node = create([340, 600])
    const long = ['**Export**', ...Array.from({ length: 8 }, (_unused, i) => `- note: file ${i} was written`)].join('\n')
    node.onExecuted?.({ plenio_summary: [{ markdown: long }] })
    expect(node.options?.getMaxHeight?.()).toBe(estimatedHeight(long))
    expect(estimatedHeight(long)).toBeGreaterThan(SUMMARY_MIN_HEIGHT)
    // the next run's shorter text is what the widget measures then
    node.onExecuted?.({ plenio_summary: [{ markdown: 'short' }] })
    expect(node.options?.getMaxHeight?.()).toBe(SUMMARY_MIN_HEIGHT)
    expect(estimatedHeight('x'.repeat(120))).toBe(estimatedHeight('a\nb\nc')) // wrapped: three lines
  })

  it('grows a node that is too small for its widgets and the summary, and never shrinks one', () => {
    const { create } = nodeType([300, 260])
    const small = create([340, 140])
    small.onExecuted?.({ plenio_summary: [{ markdown: 'Score Tools: prepared' }] })
    expect(small.size).toEqual([340, 260]) // taller, the width the user chose stays
    const large = create([340, 500])
    large.onExecuted?.({ plenio_summary: [{ markdown: 'Score Tools: prepared' }] })
    expect(large.size).toEqual([340, 500])
  })

  it('reuses its widget on the next run and comes back after a reload', () => {
    const { create } = nodeType([300, 200])
    const node = create([340, 400])
    node.onExecuted?.({ plenio_summary: [{ markdown: 'first' }] })
    node.onExecuted?.({ plenio_summary: [{ markdown: 'second' }] })
    expect(node.widgets?.filter((w) => w.name === 'plenio_summary')).toHaveLength(1)
    expect(node.element?.textContent).toContain('second')
    const reloaded = create([340, 400])
    reloaded.properties = { ...node.properties }
    reloaded.onConfigure?.({})
    expect(reloaded.element?.textContent).toContain('second')
  })

  it('ignores a run without a summary', () => {
    const { create } = nodeType([300, 200])
    const node = create([340, 400])
    node.onExecuted?.({ plenio_eq: [] })
    expect(node.widgets).toHaveLength(0)
  })
})
