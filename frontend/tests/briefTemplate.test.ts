/**
 * The brief template panel (M3/D6): the values it reads, what each action writes, the lines it
 * shows, the legacy placeholder, and the migration of saved workflows.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { BriefFields, Fetcher } from '../src/api/client'
import type { ComfyNode, ComfyWidget } from '../src/shared/comfy'
import {
  CHOICE_FIELDS,
  TEXT_FIELDS,
  addBriefTemplatePanel,
  briefValues,
  choicePlan,
  clearLegacyPlaceholders,
  fillPlan,
  fillsLine,
  choicesLine,
  isLegacyPlaceholder,
  notesLine,
  resetPlan,
  widgetOf,
  writeValues
} from '../src/extension/briefTemplate'
import { legacyPlaceholderFields } from '../src/extension/migrate'

function widget(name: string, value: unknown): ComfyWidget {
  return { name, type: 'text', value, options: {}, callback: () => {} }
}

function node(values: Record<string, unknown> = {}): ComfyNode {
  const defaults: Record<string, unknown> = {
    mode: 'new song every run',
    template: 'pop/singer-songwriter-acoustic-vocal',
    description: '',
    genre: '',
    mood: '',
    tempo: '',
    key: '',
    meter: '',
    length: 'standard (about 3:00)',
    vocals: 'sung',
    'vocals.language': '',
    'vocals.voice': '',
    'vocals.theme': ''
  }
  const widgets = Object.entries({ ...defaults, ...values }).map(([name, value]) => widget(name, value))
  return {
    id: 1,
    type: 'PlenioSongBrief',
    title: 'Song Brief',
    widgets,
    properties: {},
    addDOMWidget: () => widget('plenio_summary', ''),
    setDirtyCanvas: () => {}
  }
}

const ANSWER: BriefFields = {
  template: 'pop/singer-songwriter-acoustic-vocal',
  sources: { genre: 'typed', tempo: 'template', description: 'typed' },
  fields: { genre: 'indie folk', tempo: '88 BPM' },
  fills: [{ field: 'tempo', value: '88 BPM', template: '88 BPM' }],
  choices: [{ field: 'length', suggested: 'short (about 1:30)', current: 'standard (about 3:00)' }],
  length_default: 'standard (about 3:00)',
  notes: []
}

describe('values and fields', () => {
  it('reads the widget values by name, including the vocals group', () => {
    const values = briefValues(node({ 'vocals.voice': 'warm female voice', mood: 'warm' }))
    expect(values.genre).toBe('')
    expect(values.voice).toBe('warm female voice')
    expect(values.mood).toBe('warm')
    expect('vocals.voice' in values).toBe(false) // the route takes field names, not widget names
    const fields: readonly string[] = [...TEXT_FIELDS, ...CHOICE_FIELDS]
    expect(Object.keys(values).every((key) => fields.includes(key))).toBe(true)
    expect(values.melody).toBeUndefined() // this node has no melody widget (sung, not instrumental)
  })

  it('finds a field\'s widget and reports a missing one', () => {
    expect(widgetOf(node(), 'genre')?.name).toBe('genre')
    expect(widgetOf(node(), 'nonsense')).toBeUndefined()
  })
})

describe('the actions', () => {
  it('copies only the empty text fields the template defines', () => {
    const target = node({ genre: 'indie pop' })
    expect(fillPlan(target, ANSWER)).toEqual([{ field: 'tempo', value: '88 BPM' }])
    expect(fillPlan(node(), { ...ANSWER, fills: [] })).toEqual([])
  })

  it('resets every text field that holds a typed value', () => {
    const target = node({ genre: 'indie pop', mood: 'warm' })
    expect(resetPlan(target).map((widget) => widget.name)).toEqual(['genre', 'mood'])
    expect(resetPlan(node())).toEqual([])
  })

  it('uses the template choices only where they differ', () => {
    expect(choicePlan(ANSWER)).toEqual([{ field: 'length', value: 'short (about 1:30)' }])
    expect(choicePlan({ ...ANSWER, choices: [{ field: 'vocals', suggested: 'sung', current: 'sung' }] })).toEqual([])
  })

  it('writes values through the widget callback', () => {
    const target = node()
    const seen: unknown[] = []
    const genre = widgetOf(target, 'genre') as ComfyWidget
    genre.callback = (value) => seen.push(value)
    writeValues(target, [{ field: 'genre', value: 'indie pop' }])
    expect(genre.value).toBe('indie pop')
    expect(seen).toEqual(['indie pop'])
  })
})

describe('the lines', () => {
  it('formats what the template fills and what it suggests', () => {
    expect(fillsLine(ANSWER, true)).toBe('Template fills: tempo (88 BPM)')
    expect(fillsLine(ANSWER, false)).toBeNull() // the answer is still on its way
    expect(fillsLine({ ...ANSWER, template: 'none', fills: [] }, true)).toBeNull()
    expect(fillsLine({ ...ANSWER, fills: [] }, true)).toBe(
      'The template fills nothing: every text field has your value.'
    )
    expect(choicesLine(ANSWER)).toBe('The template suggests: length = short (about 1:30)')
    expect(choicesLine({ ...ANSWER, choices: [] })).toBeNull()
    expect(notesLine({ ...ANSWER, notes: ["'custom' is the predecessor toolkit's placeholder"] })).toContain('custom')
    expect(notesLine(ANSWER)).toBeNull()
    // long texts are shortened for the one-line panel
    const long = { ...ANSWER, fills: [{ field: 'description', value: 'x'.repeat(80), template: 'x'.repeat(80) }] }
    const shown = fillsLine(long, true) ?? ''
    expect(shown).toContain('description (x')
    expect(shown).toContain('…')
    expect(shown.length).toBeLessThan(80)
  })
})

describe('the legacy placeholder', () => {
  it('is recognised and cleared from the text widgets', () => {
    expect(isLegacyPlaceholder('custom')).toBe(true)
    expect(isLegacyPlaceholder('  CUSTOM ')).toBe(true)
    expect(isLegacyPlaceholder('custom pop')).toBe(false)
    expect(isLegacyPlaceholder(42)).toBe(false)
    const target = node({ genre: 'custom', mood: 'CUSTOM', tempo: '88 BPM' })
    expect(clearLegacyPlaceholders(target)).toEqual(['genre', 'mood'])
    expect(widgetOf(target, 'genre')?.value).toBe('')
    expect(widgetOf(target, 'tempo')?.value).toBe('88 BPM')
    expect(clearLegacyPlaceholders(target)).toEqual([])
  })

  it('is cleared from a saved workflow\'s named values, and left in positional ones', () => {
    const info = {
      widgets_values_named: { genre: 'custom', mood: 'warm', 'vocals.voice': 'custom' }
    }
    expect(legacyPlaceholderFields('PlenioSongBrief', info.widgets_values_named)).toEqual([
      'genre',
      'vocals.voice'
    ])
    expect(legacyPlaceholderFields('PlenioSongBrief', ['new song every run', 'none', 'custom'])).toEqual([])
    expect(legacyPlaceholderFields('SomeOtherNode', info.widgets_values_named)).toEqual([])
  })
})

describe('the panel', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('asks again when any field the rule reads changes, a rebuilt vocals child included', async () => {
    vi.useFakeTimers()
    const asked: Record<string, string>[] = []
    const fetcher: Fetcher = {
      fetchApi: (_route, options) => {
        asked.push((JSON.parse(String(options?.body)) as { fields: Record<string, string> }).fields)
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(ANSWER) } as Response)
      }
    }
    const target = node()
    target.addDOMWidget = () => widget('plenio_brief_template', '')
    addBriefTemplatePanel(target, fetcher)
    await vi.advanceTimersByTimeAsync(500)
    expect(asked).toHaveLength(1)
    // fields the first version did not listen to: length and a child of the vocals group
    for (const field of ['length', 'vocals.theme'] as const) {
      const changed = (target.widgets ?? []).find((w) => w.name === field)!
      changed.value = 'short (about 1:30)'
      changed.callback?.(changed.value)
      await vi.advanceTimersByTimeAsync(500)
    }
    expect(asked).toHaveLength(3)
    // the vocals group rebuilds its children: a new child widget is wired after the next answer
    target.widgets = (target.widgets ?? []).filter((w) => w.name !== 'vocals.theme')
    target.widgets.push(widget('vocals.theme', ''))
    const vocals = (target.widgets ?? []).find((w) => w.name === 'vocals')!
    vocals.callback?.('sung')
    await vi.advanceTimersByTimeAsync(500)
    const theme = target.widgets.find((w) => w.name === 'vocals.theme')!
    theme.value = 'the sea'
    theme.callback?.('the sea')
    await vi.advanceTimersByTimeAsync(500)
    expect(asked).toHaveLength(5)
    expect(asked[4].theme).toBe('the sea')
  })
})
