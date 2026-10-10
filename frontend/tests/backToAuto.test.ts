/**
 * A document of the Song Sheet can always go back to automatic (GitHub issue #3: once a text was manual it
 * stayed manual for good - *Use draft* is off while no draft is known, and the node computes no draft for a
 * manual document). *Back to auto* discards the text; the next run computes the document again.
 */
import { afterEach, describe, expect, it } from 'vitest'
import { type App, createApp, h, nextTick } from 'vue'

import type { Fetcher } from '../src/api/client'
import type { SheetPayload } from '../src/shared/sheetSession'
import type { SheetState } from '../src/shared/sheetState'

let app: App | null = null
afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
})

async function settle(times = 6): Promise<void> {
  for (let i = 0; i < times; i++) {
    await new Promise((resolve) => setTimeout(resolve, 0))
    await nextTick()
  }
}

const fetcher: Fetcher = {
  fetchApi: (route: string) => {
    const body = route.includes('/resolve') ? { fingerprint: 'e'.repeat(64), findings: [] } : route.includes('/lyrics') ? { sections: [] } : {}
    return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) } as Response)
  }
}

async function mount(state: SheetState, payload: SheetPayload | null) {
  const { default: SheetDialog } = await import('../src/sheet-editor/SheetDialog.vue')
  const applied: SheetState[] = []
  const host = document.createElement('div')
  document.body.appendChild(host)
  app = createApp({
    render: () =>
      h(SheetDialog, {
        title: 'Song Sheet · Text',
        state,
        payload,
        owned: ['lyrics'],
        review: 'continue',
        fetcher,
        layout: 'review',
        guide: [],
        onApply: (next: SheetState) => applied.push(next),
        onClose: () => undefined
      })
  })
  app.mount(host)
  await settle()
  const button = (name: string) => [...host.querySelectorAll('button')].find((b) => b.textContent?.trim() === name) as HTMLButtonElement | undefined
  return { host, applied, button }
}

const manual: SheetState = { schema: 'plenio.sheet_state/1', docs: { lyrics: { state: 'manual', text: '[Verse]\nmy own words' } } }

describe('Back to auto', () => {
  it('hands a manual document back to the workflow although no draft is known', async () => {
    const { host, applied, button } = await mount(manual, null)
    expect(button('Use draft')).toBeUndefined()
    const back = button('Back to auto') as HTMLButtonElement
    expect(back.disabled).toBe(false)
    expect(host.querySelector('.doc-head .badge')?.textContent).toBe('manual')
    back.click()
    await settle()
    expect(host.querySelector('.doc-head .badge')?.textContent).toBe('auto')
    expect(back.disabled).toBe(true) // nothing more to hand back
    expect((host.querySelector('textarea') as HTMLTextAreaElement).value).toContain('my own words') // shown until the next run
    button('Apply')?.click()
    await settle()
    expect(applied.at(-1)?.docs.lyrics).toBeUndefined() // automatic: the next run writes the lyrics again
  })

  it('stays off for an automatic document without a draft, and is Use draft when there is one', async () => {
    const { button } = await mount({ schema: 'plenio.sheet_state/1', docs: {} }, null)
    expect(button('Back to auto')?.disabled).toBe(true)
    app?.unmount()
    app = null
    const payload = {
      owned: ['lyrics'],
      docs: { lyrics: { state: 'manual', status: 'manual', upstream: '[Verse]\nthe draft', upstream_sha256: 'a'.repeat(64), text: '[Verse]\nmy own words', reason: '' } },
      context: {},
      findings: [],
      review: 'continue',
      engine: null,
      instrumental: false
    } as unknown as SheetPayload
    const withDraft = await mount(manual, payload)
    const use = withDraft.button('Use draft') as HTMLButtonElement
    expect(use.disabled).toBe(false)
    use.click()
    await settle()
    expect((withDraft.host.querySelector('textarea') as HTMLTextAreaElement).value).toContain('the draft')
  })
})
