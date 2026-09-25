import { describe, expect, it } from 'vitest'

import { dynamicComboNames, restoreWidgetValues, savedWidgetValues } from '../src/extension/dynamicCombo'
import type { ComfyNode, ComfyWidget } from '../src/shared/comfy'

/** A node whose `operation` combo inserts its option's child widgets after itself, like the frontend. */
function scoreToolsNode(): ComfyNode {
  const children: Record<string, string[]> = { 'prepare from brief': [], 'fit length': ['operation.seconds'], transpose: ['operation.semitones'] }
  const node = { id: 1, type: 'PlenioScoreTools', title: '', properties: {}, widgets: [] as ComfyWidget[] } as unknown as ComfyNode
  let current: unknown = 'prepare from brief'
  const combo = {
    name: 'operation',
    type: 'combo',
    options: { values: Object.keys(children) },
    get value() {
      return current
    },
    set value(value: unknown) {
      current = value
      const widgets = node.widgets as ComfyWidget[]
      const kept = widgets.filter((w) => !w.name.startsWith('operation.'))
      const added = (children[String(value)] ?? []).map((name) => ({ name, type: 'number', value: 0, options: {} }))
      widgets.splice(0, widgets.length, kept[0], ...added, ...kept.slice(1))
    }
  } as ComfyWidget
  ;(node.widgets as ComfyWidget[]).push(combo, { name: 'note', type: 'text', value: '', options: {} })
  return node
}

describe('DynamicCombo restore workaround', () => {
  it('repairs a combo that received its child value', () => {
    const node = scoreToolsNode()
    const saved = ['fit length', 75, 'x']
    node.widgets![0].value = 75 // what frontend 1.53.6 restores
    expect(restoreWidgetValues(node, saved, new Set(['operation']))).toBe(true)
    expect(node.widgets!.map((w) => [w.name, w.value])).toEqual([
      ['operation', 'fit length'],
      ['operation.seconds', 75],
      ['note', 'x']
    ])
  })

  it('leaves a correctly restored node alone', () => {
    const node = scoreToolsNode()
    node.widgets![0].value = 'transpose'
    node.widgets![1].value = 2
    expect(restoreWidgetValues(node, ['transpose', 2, ''], new Set(['operation']))).toBe(false)
    expect(node.widgets![1].value).toBe(2)
  })

  it('stops at a value the combo does not offer', () => {
    const node = scoreToolsNode()
    expect(restoreWidgetValues(node, ['explode', 1, 'x'], new Set(['operation']))).toBe(true)
    expect(node.widgets![0].value).toBe('prepare from brief')
  })

  it('prefers the named values of the saved node', () => {
    const node = scoreToolsNode()
    node.widgets![0].value = 75
    const saved = savedWidgetValues({
      widgets_values: [75],
      widgets_values_named: { operation: 'fit length', 'operation.seconds': 75, note: 'x' }
    })
    expect(restoreWidgetValues(node, saved, new Set(['operation']))).toBe(true)
    expect(node.widgets!.map((w) => w.value)).toEqual(['fit length', 75, 'x'])
    expect(savedWidgetValues({ widgets_values: ['a'] })).toEqual(['a'])
    expect(savedWidgetValues(undefined)).toBeUndefined()
  })

  it('finds the DynamicCombo inputs of a node definition', () => {
    const names = dynamicComboNames({
      required: { operation: ['COMFY_DYNAMICCOMBO_V3', {}], score: ['STRING', {}] },
      optional: { brief: ['PLENIO_BRIEF', {}] }
    })
    expect([...names]).toEqual(['operation'])
  })
})
