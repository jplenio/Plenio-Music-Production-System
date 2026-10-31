/**
 * The briefs' text fields as lists (1.5.0): the lists, the changed input specs (a vocals choice's inputs too), the
 * saved value shown, and *type your own*.
 */
import { describe, expect, it } from 'vitest'

import type { ComfyNode, ComfyNodeDef, ComfyWidget } from '../src/shared/comfy'
import {
  OWN_VALUE,
  asList,
  installOwnValues,
  listBriefFields,
  listOptions,
  refreshOwnValues,
  showValue
} from '../src/extension/briefChoices'

const VALUES = { genre: ['indie folk', 'Indie Folk', 'acoustic pop'], key: ['D major'], meter: ['4/4'] }

describe('the lists', () => {
  it('start empty (the template applies) and with one\'s own entry, then the values once each, sorted', () => {
    const genres = listOptions('genre', VALUES)
    expect(genres.slice(0, 2)).toEqual(['', OWN_VALUE])
    expect(genres.slice(2)).toEqual(['acoustic pop', 'indie folk'])
    // common values besides the templates' for a field they rarely fill
    expect(listOptions('key', VALUES)).toContain('A minor')
    expect(listOptions('meter', VALUES).filter((value) => value === '4/4')).toHaveLength(1)
  })

  it('turn a one-line text input into a list, a multiline one and a list already stay', () => {
    expect(asList(['STRING', { default: '', tooltip: 't' }], ['', 'a'])).toEqual([
      'COMBO',
      { default: '', tooltip: 't', options: ['', 'a'] }
    ])
    const multiline = ['STRING', { multiline: true }]
    expect(asList(multiline, ['a'])).toBe(multiline)
    const combo = ['COMBO', { options: ['x'] }]
    expect(asList(combo, ['a'])).toBe(combo)
  })

  it('reach the inputs of a vocals choice, and leave the other inputs alone', () => {
    const definition: ComfyNodeDef = {
      name: 'PlenioSongBrief',
      input: {
        required: {
          description: ['STRING', { multiline: true }],
          genre: ['STRING', { default: '' }],
          length: ['COMBO', { options: ['short'] }],
          vocals: [
            'COMFY_DYNAMICCOMBO_V3',
            {
              options: [
                { key: 'sung', inputs: { required: { voice: ['STRING', {}], lyrics: ['STRING', { multiline: true }] } } },
                { key: 'instrumental', inputs: { required: { lead_instrument: ['STRING', {}] } } }
              ]
            }
          ]
        }
      }
    }
    expect(listBriefFields(definition, VALUES).sort()).toEqual(['genre', 'vocals.lead_instrument', 'vocals.voice'])
    const required = definition.input!.required as Record<string, unknown[]>
    expect(required.genre[0]).toBe('COMBO')
    expect(required.description[0]).toBe('STRING')
    const sung = (required.vocals[1] as { options: { inputs: { required: Record<string, unknown[]> } }[] }).options[0]
    expect(sung.inputs.required.voice[0]).toBe('COMBO')
    expect(sung.inputs.required.lyrics[0]).toBe('STRING')
  })
})

function list(name: string, value: string): ComfyWidget {
  return { name, type: 'combo', value, options: { values: listOptions(name.split('.').pop()!, VALUES) }, callback: () => {} }
}

describe('a value of one\'s own', () => {
  it('shows in the list when the workflow saved it', () => {
    const genre = list('genre', 'dream folk')
    showValue(genre)
    expect((genre.options.values as string[]).slice(0, 3)).toEqual(['', OWN_VALUE, 'dream folk'])
    showValue(genre)
    expect((genre.options.values as string[]).filter((value) => value === 'dream folk')).toHaveLength(1)
  })

  it('is asked for by the list\'s own entry; cancelled, the value before stays', async () => {
    const seen: unknown[] = []
    const genre = list('genre', 'indie folk')
    genre.callback = (value) => seen.push(value)
    const voice = list('vocals.voice', '')
    const answers: (string | null)[] = ['  dream   folk ', null]
    const asked: string[] = []
    const target = { widgets: [genre, voice], setDirtyCanvas: () => {} } as unknown as ComfyNode
    installOwnValues(target, (field) => {
      asked.push(field)
      return Promise.resolve(answers.shift() ?? null)
    })
    genre.value = OWN_VALUE
    genre.callback?.(OWN_VALUE)
    await Promise.resolve()
    await Promise.resolve()
    expect(asked).toEqual(['genre'])
    expect(genre.value).toBe('dream folk')
    expect(seen).toEqual(['dream folk'])
    expect(genre.options.values as string[]).toContain('dream folk')
    // cancelled: the value before
    genre.value = OWN_VALUE
    genre.callback?.(OWN_VALUE)
    await Promise.resolve()
    await Promise.resolve()
    expect(genre.value).toBe('dream folk')
    // a value from the list goes through as it is
    genre.value = 'acoustic pop'
    genre.callback?.('acoustic pop')
    expect(seen).toEqual(['dream folk', 'acoustic pop'])
    // installed once: configuring the node again does not wrap the callback twice
    installOwnValues(target, () => Promise.resolve(null))
    genre.callback?.('indie folk')
    expect(seen).toEqual(['dream folk', 'acoustic pop', 'indie folk'])
  })

  it('reaches the fields a vocals choice makes anew, and whatever listens to the field', async () => {
    const target = { widgets: [list('genre', '')], setDirtyCanvas: () => {} } as unknown as ComfyNode
    installOwnValues(target, () => Promise.resolve('a lighthouse'))
    const theme = list('vocals.theme', '')
    const heard: unknown[] = []
    theme.callback = (value) => heard.push(value) // the template panel's chain, wired first
    target.widgets!.push(theme)
    refreshOwnValues(target)
    theme.value = OWN_VALUE
    theme.callback?.(OWN_VALUE)
    await Promise.resolve()
    await Promise.resolve()
    expect(theme.value).toBe('a lighthouse')
    expect(heard).toEqual(['a lighthouse'])
  })
})
