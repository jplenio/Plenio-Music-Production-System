import { describe, expect, it } from 'vitest'

import { comboOptions, migrateWidgetValues } from '../src/extension/migrate'
import type { ComfyNodeDef } from '../src/shared/comfy'

const songBrief: ComfyNodeDef = {
  name: 'PlenioSongBrief',
  input: {
    required: {
      mode: ['COMBO', { options: ['new song every run', 'one song, stop to review'], default: 'new song every run' }],
      template: ['COMBO', { options: ['none', 'pop/singer-songwriter-acoustic-vocal'] }]
    }
  }
}

describe('widget values of older workflows', () => {
  it('reads combo options in both spec forms', () => {
    expect(comboOptions(songBrief, 'mode')).toEqual(['new song every run', 'one song, stop to review'])
    expect(comboOptions({ name: 'X', input: { required: { mode: [['a', 'b'], {}] } } }, 'mode')).toEqual(['a', 'b'])
    expect(comboOptions(songBrief, 'missing')).toEqual([])
  })

  it('puts the careful mode in front of a Song Brief saved before 0.2.2', () => {
    const info = { widgets_values: ['pop/singer-songwriter-acoustic-vocal', 'a song', 'pop'] }
    expect(migrateWidgetValues(songBrief, info).widgets_values).toEqual([
      'one song, stop to review',
      'pop/singer-songwriter-acoustic-vocal',
      'a song',
      'pop'
    ])
    expect(info.widgets_values).toHaveLength(3) // the saved data itself is not changed
  })

  it('keeps current values and other nodes as they are', () => {
    const current = { widgets_values: ['new song every run', 'none', ''] }
    expect(migrateWidgetValues(songBrief, current)).toBe(current)
    const other = { widgets_values: ['none'] }
    expect(migrateWidgetValues({ name: 'PlenioSongSheet' }, other)).toBe(other)
  })

  it('adds the mode to named values', () => {
    const info = { widgets_values_named: { template: 'none' } }
    expect(migrateWidgetValues({ ...songBrief, name: 'PlenioCoverBrief' }, info).widgets_values_named).toEqual({
      mode: 'one cover, stop to review',
      template: 'none'
    })
  })
})
