import { describe, expect, it } from 'vitest'

import type { ComfyNode, ComfyWidget } from '../src/shared/comfy'
import {
  type ComponentFiles,
  ModelChoiceLabels,
  missingNotice,
  optionLabel,
  shortReason,
  stem
} from '../src/extension/modelChoice'

const YUE2: ComponentFiles = {
  folder: 'checkpoints',
  files: {
    'yue2_3b_int8_convrot.safetensors': null,
    'my_finetune.safetensors': null,
    'sd15.safetensors': 'without the music model, the audio decoder: Load Checkpoint needs them all in one file'
  },
  pick: {
    file: 'yue2_3b_int8_convrot.safetensors',
    reason: '16.0 GB of graphics memory: runs on the card, installed',
    installed: true,
    source: 'plan'
  }
}

describe('the Model Choice field', () => {
  it('shows the plan pick beside auto', () => {
    expect(optionLabel('auto', YUE2)).toBe('auto · yue2_3b_int8_convrot · runs on the card')
    const missing = { ...YUE2, pick: { ...YUE2.pick!, installed: false } }
    expect(optionLabel('auto', missing)).toBe('auto · yue2_3b_int8_convrot · runs on the card · to download')
    const pinned = { ...YUE2, pick: { ...YUE2.pick!, source: 'config', file: 'my_finetune.safetensors' } }
    expect(optionLabel('auto', pinned)).toBe('auto · my_finetune · pinned in config.toml')
  })

  it('shows auto alone while the facts are not known (an older Plenio, a server not answering)', () => {
    expect(optionLabel('auto', undefined)).toBe('auto')
    expect(optionLabel('auto', { folder: 'vae', files: {}, pick: null })).toBe('auto')
  })

  it('marks a file a loader would refuse, with the reason, and leaves the others as they are', () => {
    expect(optionLabel('sd15.safetensors', YUE2)).toBe(
      'sd15.safetensors · does not fit: without the music model, the audio decoder: Load Checkpoint needs them all in one file'
    )
    expect(optionLabel('my_finetune.safetensors', YUE2)).toBe('my_finetune.safetensors')
    expect(optionLabel('elsewhere.safetensors', YUE2)).toBe('elsewhere.safetensors')
  })

  it('says the reason shortly and names files without their extension', () => {
    expect(shortReason('8.0 GB of graphics memory: runs with offloading: slower')).toBe('runs with offloading: slower')
    expect(shortReason('your choice')).toBe('your choice')
    expect(stem('flux-2-klein-4b.safetensors')).toBe('flux-2-klein-4b')
    expect(stem('model_bs_roformer.ckpt')).toBe('model_bs_roformer')
  })
})

describe('a run stopped at a missing file', () => {
  it('names the address and the folder of a catalogue file', () => {
    const notice = missingNotice({
      component: 'flux2-vae',
      file: 'flux2-vae.safetensors',
      folder: 'vae',
      url: 'https://huggingface.co/Comfy-Org/flux2-dev/resolve/abc/split_files/vae/flux2-vae.safetensors',
      variant: 'flux2-vae'
    })
    expect(notice.summary).toBe('Model missing: flux2-vae.safetensors')
    expect(notice.detail).toContain('https://huggingface.co/Comfy-Org/flux2-dev/')
    expect(notice.detail).toContain('models/vae')
  })

  it('names the folder of a file of ones own, and the way back to auto', () => {
    const notice = missingNotice({ component: 'yue2', file: 'gone.safetensors', folder: 'checkpoints', url: null })
    expect(notice.detail).toBe('It is a file of your own: put it into models/checkpoints, or set the field to auto.')
    expect(missingNotice({}).summary).toBe('Model missing: a model file')
  })
})

function widget(name: string, value: unknown, values?: unknown[]): ComfyWidget {
  return { name, type: 'combo', value, options: values ? { values } : {} }
}

function choice(component: string, values: string[]): ComfyNode {
  return {
    id: 1,
    type: 'PlenioModelChoice',
    title: 'Model Choice',
    properties: {},
    widgets: [widget('component', component), widget('component.file', 'auto', values)],
    addDOMWidget: () => widget('dom', null)
  }
}

describe('the labels on the fields', () => {
  const fetcher = {
    fetchApi: async () => new Response(JSON.stringify({ components: { yue2: YUE2 } }), { status: 200 })
  }

  it('go on the node field and follow the facts once they arrive', async () => {
    const labels = new ModelChoiceLabels(fetcher)
    const node = choice('yue2', ['auto', 'yue2_3b_int8_convrot.safetensors'])
    labels.label(node)
    const label = node.widgets![1].options.getOptionLabel as (v: string) => string
    expect(label('auto')).toBe('auto')
    await labels.refresh()
    expect(label('auto')).toBe('auto · yue2_3b_int8_convrot · runs on the card')
    expect(node.widgets![1].value).toBe('auto') // the value stays the name: the prompt is unchanged
  })

  it('go on a block field whose list is the inner Model Choice list', async () => {
    const labels = new ModelChoiceLabels(fetcher)
    await labels.refresh()
    const values = ['auto', 'yue2_3b_int8_convrot.safetensors', 'sd15.safetensors']
    const block = {
      ...choice('yue2', []),
      type: 'some-subgraph-id',
      widgets: [widget('ckpt_name', 'auto', [...values]), widget('other', 'x', ['x'])],
      subgraph: { nodes: [choice('yue2', values)] }
    }
    labels.labelBlock(block)
    const label = block.widgets[0].options.getOptionLabel as (v: string) => string
    expect(label('sd15.safetensors')).toContain('does not fit')
    expect(block.widgets[1].options.getOptionLabel).toBeUndefined()
  })

  it('go on a field whose options are a getter only (ComfyUI 0.41: frontend 1.55)', async () => {
    const labels = new ModelChoiceLabels(fetcher)
    await labels.refresh()
    const node = choice('yue2', ['auto', 'yue2_3b_int8_convrot.safetensors'])
    const options = { values: ['auto', 'yue2_3b_int8_convrot.safetensors'] } as Record<string, unknown>
    Object.defineProperty(node.widgets![1], 'options', { get: () => options, configurable: true })
    expect(() => labels.label(node)).not.toThrow()
    const label = options.getOptionLabel as (v: string) => string
    expect(label('auto')).toBe('auto · yue2_3b_int8_convrot · runs on the card')
  })

  it('are left out, without an error, when the options can be neither changed nor replaced', () => {
    const labels = new ModelChoiceLabels(fetcher)
    const node = choice('yue2', ['auto'])
    Object.defineProperty(node.widgets![1], 'options', { get: () => Object.freeze({ values: ['auto'] }), configurable: true })
    expect(() => labels.label(node)).not.toThrow()
  })

  it('are left out when the server has no such route', async () => {
    const labels = new ModelChoiceLabels({ fetchApi: async () => new Response('', { status: 404 }) })
    await labels.refresh()
    expect(labels.info('yue2')).toBeUndefined()
  })
})
