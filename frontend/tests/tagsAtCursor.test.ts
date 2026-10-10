/**
 * The section tag buttons of the lyrics editor insert at the cursor (GitHub issue #3: they were appended at
 * the end), and there is an [Instrumental] button.
 */
import { afterEach, describe, expect, it } from 'vitest'
import { type App, createApp, h, nextTick } from 'vue'

import type { Fetcher } from '../src/api/client'
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

const TEXT = '[Verse]\nfirst line\nsecond line\n'

async function mount() {
  const { default: SheetDialog } = await import('../src/sheet-editor/SheetDialog.vue')
  const state: SheetState = { schema: 'plenio.sheet_state/1', docs: { lyrics: { state: 'manual', text: TEXT } } }
  const host = document.createElement('div')
  document.body.appendChild(host)
  app = createApp({
    render: () =>
      h(SheetDialog, {
        title: 'Song Sheet · Text',
        state,
        payload: null,
        owned: ['lyrics'],
        review: 'continue',
        fetcher,
        layout: 'review',
        guide: [],
        onApply: () => undefined,
        onClose: () => undefined
      })
  })
  app.mount(host)
  await settle()
  const button = (name: string) => [...host.querySelectorAll('button')].find((b) => b.textContent?.trim() === name) as HTMLButtonElement
  return { box: host.querySelector('textarea') as HTMLTextAreaElement, button }
}

describe('lyrics tag buttons', () => {
  it('append while the user has not been in the text', async () => {
    const { box, button } = await mount()
    button('[Chorus]').click()
    await settle()
    expect(box.value).toBe(TEXT + '\n[Chorus]\n')
  })

  it('insert at the cursor and leave it where the section goes on', async () => {
    const { box, button } = await mount()
    box.focus()
    box.setSelectionRange(TEXT.indexOf('second'), TEXT.indexOf('second'))
    button('[Instrumental]').click()
    await settle()
    expect(box.value).toBe('[Verse]\nfirst line\n\n[Instrumental]\nsecond line\n')
    expect(document.activeElement).toBe(box)
    expect(box.value.slice(box.selectionStart)).toBe('second line\n')
    button('[Chorus]').click() // the next tag goes where the cursor now is
    await settle()
    expect(box.value).toBe('[Verse]\nfirst line\n\n[Instrumental]\n\n[Chorus]\nsecond line\n')
  })
})
