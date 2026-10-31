/**
 * The brief template panel (M3/D6; visible since 1.5.0): the values it reads, what it fills and each action writes,
 * the lines it shows, the legacy placeholder, and the migration of saved workflows.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { BriefFields, Fetcher } from '../src/api/client'
import type { ComfyNode, ComfyWidget } from '../src/shared/comfy'
import {
  CHOICE_FIELDS,
  OWN_LYRICS,
  TEXT_FIELDS,
  addBriefTemplatePanel,
  briefKind,
  briefValues,
  choicePlan,
  clearLegacyPlaceholders,
  choicesLine,
  isLegacyPlaceholder,
  labelWidgets,
  modeLine,
  notesLine,
  originsLine,
  refillPlan,
  templatePlan,
  widgetOf,
  writeValues
} from '../src/extension/briefTemplate'
import { LYRICS_FROM, legacyPlaceholderFields, migrateSongLyrics } from '../src/extension/migrate'

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
    const fields: readonly string[] = [...TEXT_FIELDS, ...CHOICE_FIELDS, 'lyrics_from']
    expect(Object.keys(values).every((key) => fields.includes(key))).toBe(true)
    expect(values.melody).toBeUndefined() // this node has no melody widget (sung, not instrumental)
  })

  it('finds a field\'s widget and reports a missing one', () => {
    expect(widgetOf(node(), 'genre')?.name).toBe('genre')
    expect(widgetOf(node(), 'nonsense')).toBeUndefined()
  })
})

describe('the fill', () => {
  it('writes the template\'s values into the empty fields, never over a value of the user\'s', () => {
    expect(templatePlan(node(), ANSWER)).toEqual([
      { field: 'genre', value: 'indie folk' },
      { field: 'tempo', value: '88 BPM' }
    ])
    expect(templatePlan(node({ genre: 'indie pop' }), ANSWER)).toEqual([{ field: 'tempo', value: '88 BPM' }])
    expect(templatePlan(node({ genre: 'indie folk', tempo: '88 BPM' }), ANSWER)).toEqual([])
  })

  it('replaces what a template filled before, the user\'s values kept', () => {
    const target = node({ genre: 'old genre', tempo: '100 BPM', description: 'The old template\'s text.' })
    const shown = { genre: ['old genre'], tempo: ['120 BPM'], description: ['The old template\'s text.'] }
    expect(templatePlan(target, ANSWER, shown)).toEqual([
      { field: 'genre', value: 'indie folk' },
      { field: 'description', value: '' } // the new template has none
    ])
  })

  it('never fills one\'s own lyrics, and clears the template\'s idea when own lyrics are chosen', () => {
    const answer = { ...ANSWER, fields: { ...ANSWER.fields, lyrics: 'About a letter never sent.' } }
    const own = node({
      genre: 'indie folk',
      tempo: '88 BPM',
      'vocals.lyrics_from': OWN_LYRICS,
      'vocals.lyrics': 'About a letter never sent.'
    })
    expect(templatePlan(own, answer)).toEqual([{ field: 'lyrics', value: '' }])
    const written = node({ genre: 'indie folk', tempo: '88 BPM', 'vocals.lyrics_from': OWN_LYRICS, 'vocals.lyrics': 'la la' })
    expect(templatePlan(written, answer)).toEqual([])
  })

  it('refills every field that holds another value than the template\'s', () => {
    expect(refillPlan(node({ genre: 'indie pop' }), ANSWER)).toEqual([
      { field: 'genre', value: 'indie folk' },
      { field: 'tempo', value: '88 BPM' }
    ])
    expect(refillPlan(node({ genre: 'indie folk', tempo: '88 BPM' }), ANSWER)).toEqual([])
  })
})

describe('the actions', () => {
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
  it('says which fields show the template\'s value and which hold the user\'s, and what it suggests', () => {
    const target = node({ genre: 'indie pop', tempo: '88 BPM' })
    expect(originsLine(target, ANSWER, true)).toBe('From the template: tempo · your own: genre')
    expect(originsLine(target, ANSWER, false)).toBeNull() // the answer is still on its way
    expect(originsLine(target, { ...ANSWER, template: 'none' }, true)).toBeNull()
    expect(originsLine(node(), ANSWER, true)).toBe('The template has no text for these fields.')
    expect(choicesLine(ANSWER)).toBe('The template suggests: length = short (about 1:30)')
    expect(choicesLine({ ...ANSWER, choices: [] })).toBeNull()
    expect(notesLine({ ...ANSWER, notes: ["'custom' is the predecessor toolkit's placeholder"] })).toContain('custom')
    expect(notesLine(ANSWER)).toBeNull()
  })
})

describe('the lyrics of a Song Brief saved before 1.5.0', () => {
  it('get the idea choice and an empty field after the theme; a newer or an instrumental brief stays', () => {
    const before = ['new song every run', 'none', '', 'pop', '', '', 'short (about 1:30)', 'sung', 'English', '', 'love', 'C major', '4/4']
    const after = migrateSongLyrics(before)
    expect(after.slice(10, 14)).toEqual(['love', LYRICS_FROM[0], '', 'C major'])
    expect(after).toHaveLength(before.length + 2)
    expect(migrateSongLyrics(after)).toBe(after)
    const instrumental = ['new song every run', 'none', '', 'jazz', '', '', 'short (about 1:30)', 'instrumental', 'off', 'sax', '']
    expect(migrateSongLyrics(instrumental)).toBe(instrumental)
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

  it('fills the fields from the template, and follows another template without touching the user\'s values', async () => {
    vi.useFakeTimers()
    const GENRES: Record<string, string> = { 'pop/a': 'genre A', 'pop/b': 'genre B' }
    const fetcher: Fetcher = {
      fetchApi: (_route, options) => {
        const body = JSON.parse(String(options?.body)) as { template: string }
        const answer: BriefFields = {
          ...ANSWER,
          template: body.template,
          sources: { genre: 'template', mood: 'empty' },
          fields: { genre: GENRES[body.template] ?? '' },
          choices: []
        }
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(answer) } as Response)
      }
    }
    const target = node({ template: 'pop/a' })
    target.addDOMWidget = () => widget('plenio_brief_template', '')
    addBriefTemplatePanel(target, fetcher)
    await vi.advanceTimersByTimeAsync(1500)
    const genre = widgetOf(target, 'genre')!
    const template = target.widgets!.find((w) => w.name === 'template')!
    expect(genre.value).toBe('genre A')
    template.value = 'pop/b'
    template.callback?.('pop/b')
    await vi.advanceTimersByTimeAsync(1500)
    expect(genre.value).toBe('genre B')
    genre.value = 'my genre'
    genre.callback?.('my genre')
    template.value = 'pop/a'
    template.callback?.('pop/a')
    await vi.advanceTimersByTimeAsync(1500)
    expect(genre.value).toBe('my genre')
    expect(widgetOf(target, 'mood')!.value).toBe('')
  })

  it('gives fields a vocals choice brings back with an older template\'s values the template\'s now', async () => {
    vi.useFakeTimers()
    const LANGUAGES: Record<string, string> = { 'pop/a': 'English', 'pop/b': 'German', 'jazz/c': '' }
    const fetcher: Fetcher = {
      fetchApi: (_route, options) => {
        const body = JSON.parse(String(options?.body)) as { template: string }
        const sung = body.template !== 'jazz/c'
        const answer: BriefFields = {
          ...ANSWER,
          template: body.template,
          sources: sung ? { language: 'template' } : {},
          fields: { language: LANGUAGES[body.template] ?? '' },
          choices: []
        }
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(answer) } as Response)
      }
    }
    const target = node({ template: 'pop/a' })
    target.addDOMWidget = () => widget('plenio_brief_template', '')
    addBriefTemplatePanel(target, fetcher)
    const choose = async (id: string): Promise<void> => {
      const template = target.widgets!.find((w) => w.name === 'template')!
      template.value = id
      template.callback?.(id)
      await vi.advanceTimersByTimeAsync(1500)
    }
    await vi.advanceTimersByTimeAsync(1500)
    expect(widgetOf(target, 'language')!.value).toBe('English')
    await choose('pop/b')
    expect(widgetOf(target, 'language')!.value).toBe('German')
    // an instrumental hides the field; the frontend brings it back empty, the panel fills it, and then the
    // frontend restores the value it had
    const hidden = widgetOf(target, 'language')!
    target.widgets = target.widgets!.filter((w) => w !== hidden)
    await choose('jazz/c')
    const back = widget('vocals.language', '')
    target.widgets!.push(back)
    await choose('pop/a')
    expect(back.value).toBe('English')
    back.value = 'German'
    back.callback?.('German')
    await vi.advanceTimersByTimeAsync(1500)
    expect(back.value).toBe('English')
  })
})

describe('the choices after another template', () => {
  it('follow where they hold a template\'s value, and stay where the user chose them', async () => {
    vi.useFakeTimers()
    const LENGTHS: Record<string, string> = { 'pop/a': 'standard (about 3:00)', 'pop/b': 'long (about 4:30)' }
    const fetcher: Fetcher = {
      fetchApi: (_route, options) => {
        const body = JSON.parse(String(options?.body)) as { template: string; fields: Record<string, string> }
        const length = LENGTHS[body.template]
        const answer: BriefFields = {
          ...ANSWER,
          template: body.template,
          sources: {},
          fields: { length, vocals: body.template === 'pop/b' ? 'instrumental' : 'sung' },
          choices: [
            { field: 'length', suggested: length, current: body.fields.length },
            { field: 'vocals', suggested: body.template === 'pop/b' ? 'instrumental' : 'sung', current: body.fields.vocals }
          ].filter((c) => c.suggested !== c.current)
        }
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(answer) } as Response)
      }
    }
    // the workflow's length is not the template's (short test songs): it stays; the vocals are the template's
    const target = node({ template: 'pop/a', length: 'short (about 1:30)', vocals: 'sung' })
    target.addDOMWidget = () => widget('plenio_brief_template', '')
    addBriefTemplatePanel(target, fetcher)
    await vi.advanceTimersByTimeAsync(1500)
    const template = target.widgets!.find((w) => w.name === 'template')!
    template.value = 'pop/b'
    template.callback?.('pop/b')
    await vi.advanceTimersByTimeAsync(1500)
    expect(widgetOf(target, 'length')!.value).toBe('short (about 1:30)')
    expect(widgetOf(target, 'vocals')!.value).toBe('instrumental')
  })
})

describe('the labels', () => {
  it('name the lyrics inputs of a vocals choice', () => {
    const target = node({ 'vocals.lyrics_from': 'written from the idea below', 'vocals.lyrics': '' })
    labelWidgets(target)
    expect((widgetOf(target, 'lyrics_from') as { label?: string }).label).toBe('lyrics')
    expect((widgetOf(target, 'lyrics') as { label?: string }).label).toBe('lyrics idea or text')
  })
})

describe('briefKind', () => {
  it('tells a Cover Brief from a Song Brief (the backend answers each with its own fields and choices)', () => {
    expect(briefKind({ comfyClass: 'PlenioCoverBrief' } as unknown as ComfyNode)).toBe('cover')
    expect(briefKind({ type: 'PlenioCoverBrief' } as unknown as ComfyNode)).toBe('cover')
    expect(briefKind({ comfyClass: 'PlenioSongBrief' } as unknown as ComfyNode)).toBe('song')
  })
})

describe('modeLine', () => {
  it('says what the chosen creative mode does, nothing for off (the tooltip names no modes)', () => {
    const answer = { mode: { name: 'hypnotic', description: 'A steady repeating pattern.' } } as unknown as BriefFields
    expect(modeLine(answer)).toBe('Creative mode hypnotic (experimental): A steady repeating pattern.')
    expect(modeLine({ mode: null } as unknown as BriefFields)).toBeNull()
    expect(modeLine(null)).toBeNull()
  })
})
