/** *Make a song*, short first (phase 6.5): one field, a style chip, Generate - the song has the chosen style's values
 * (as the full form fills them) and the words as its lyrics' idea. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { type App, createApp, h, nextTick } from 'vue'

import type { MakeClient } from '../src/player/make/client'
import { fromTemplate, type FormData, type MakeJob, requestOf, type StyleTemplate } from '../src/player/make/form'
import QuickMake from '../src/player/make/QuickMake.vue'
import { quickMissing, quickRequest, styleGroups, templateOf } from '../src/player/make/quick'

const LENGTHS = ['very short (about 1:00)', 'short (about 1:30)', 'about 2:00', 'about 2:30', 'standard (about 3:00)']
const SYNTH: StyleTemplate = {
  id: 'electronic/synthwave', name: 'Synthwave', group: 'Electronic',
  fields: { genre: 'synthwave', tempo: '110 BPM', length: 'about 2:30', vocals: 'sung', voice: 'warm female vocal', language: 'English', description: 'Neon nights' },
} // prettier-ignore
const SAX: StyleTemplate = { id: 'jazz/sax', name: 'Sax', group: 'Jazz', fields: { genre: 'jazz', vocals: 'instrumental', length: 'about 2:00', description: 'smoky sax' } }
const SCAT: StyleTemplate = { id: 'jazz/scat', name: 'Scat', group: 'Jazz', fields: { genre: 'vocal jazz', vocals: 'sung', length: 'about 2:00' } }
const FORM: FormData = {
  source: 'package',
  templates: [SYNTH, SAX, SCAT],
  values: {},
  song: { fields: [], choices: { length: LENGTHS, vocals: ['sung', 'sparse vocals', 'instrumental'] }, defaults: { length: 'short (about 1:30)', vocals: 'sung' } },
  cover: { fields: [], choices: { vocals: ['original lyrics', 'instrumental'] }, defaults: { vocals: 'original lyrics' } },
  limits: { description: 1500, text: 120, source_mb: 100, max_length: 'about 4:00' },
  covers: true,
}

let app: App | null = null
let host: HTMLElement | null = null
afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
})

function mounted(props: Record<string, unknown>): HTMLElement {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ render: () => h(QuickMake, props as never) })
  app.mount(host)
  return host
}

describe('the short form', () => {
  it('a style chip is a group; a template that sings first', () => {
    expect(styleGroups(FORM.templates)).toEqual(['Electronic', 'Jazz'])
    expect(templateOf('Jazz', FORM.templates, '', () => 0)?.id).toBe('jazz/scat')
    expect(templateOf('Nothing', FORM.templates)).toBeNull()
  })

  it('a song from the short form has the defaults of the chosen style and the words as its idea', () => {
    const body = quickRequest('a night drive in the rain', SYNTH, FORM)
    const full = requestOf({ kind: 'song', fields: { ...fromTemplate(SYNTH, 'song', FORM), lyrics_from: 'written from the idea below', lyrics: 'a night drive in the rain' }, source: null })
    expect(body).toEqual(full)
    expect(body.fields).toMatchObject({ template: 'electronic/synthwave', genre: 'synthwave', length: 'about 2:30', vocals: 'sung', lyrics: 'a night drive in the rain' })
  })

  it('an instrumental style takes the words into its description; no style, the words alone', () => {
    expect(quickRequest('a lazy sunday', SAX, FORM).fields.description).toBe('a lazy sunday - smoky sax')
    expect(quickRequest('a lazy sunday', SAX, FORM).fields.lyrics).toBeUndefined()
    expect(quickRequest('a lazy sunday', null, FORM).fields).toMatchObject({ template: 'none', description: 'a lazy sunday', vocals: 'sung' })
    expect(quickMissing('', null)).toBe('a few words, or a style')
    expect(quickMissing('', SAX)).toBe('')
  })

  it('Generate orders the song through the client', async () => {
    const create = vi.fn(async () => ({ id: 'j1', position: 1 }) as unknown as MakeJob)
    const client = { create } as unknown as MakeClient
    const made: unknown[] = []
    const el = mounted({ client, form: FORM, may: true, onMade: (job: unknown) => made.push(job) })
    const submit = el.querySelector('button[type="submit"]') as HTMLButtonElement
    expect(submit.disabled).toBe(true)
    const area = el.querySelector('textarea') as HTMLTextAreaElement
    area.value = 'rain on a tin roof'
    area.dispatchEvent(new Event('input'))
    const chips = [...el.querySelectorAll('.chips button')] as HTMLButtonElement[]
    expect(chips.map((c) => c.textContent)).toEqual(['Electronic', 'Jazz'])
    chips[0].click()
    await nextTick()
    ;(el.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'))
    await new Promise((r) => setTimeout(r, 0))
    expect(create).toHaveBeenCalledWith(quickRequest('rain on a tin roof', SYNTH, FORM))
    expect(made).toEqual([{ id: 'j1', position: 1 }])
  })

  it('says why when making songs is not for this listener', () => {
    const el = mounted({ client: {} as MakeClient, form: FORM, may: false, why: 'Making songs is switched off.' })
    expect(el.textContent).toContain('Making songs is switched off.')
    expect((el.querySelector('button[type="submit"]') as HTMLButtonElement).disabled).toBe(true)
  })
})
