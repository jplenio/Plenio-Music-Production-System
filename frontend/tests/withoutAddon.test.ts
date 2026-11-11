/**
 * The player's page on an installation without the Studio add-on (the Comfy Registry package): *Open the folder*
 * shows the folder's path with a button that copies it, and the studio panel says how to get ComfyUI running
 * instead of offering a start it cannot do.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { type App, createApp, h, nextTick } from 'vue'

import type { StudioStatus } from '../src/player/api'

let app: App | null = null
afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
  vi.useRealTimers()
})
beforeEach(() => vi.resetModules())

async function settle(times = 6): Promise<void> {
  for (let i = 0; i < times; i++) {
    await Promise.resolve()
    await nextTick()
  }
}

const STATUS: StudioStatus = { running: false, own: false, starting: false, since: null, can_start: true, why: '', url: 'http://127.0.0.1:8188', auto: false, idle_stop_min: 0, error: '', command: 'python main.py --port 8188' }

async function panel(status: StudioStatus): Promise<HTMLElement> {
  vi.useFakeTimers() // the panel asks again every three seconds
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, status: 200, json: async () => status }) as unknown as Response))
  const { default: StudioSettings } = await import('../src/player/components/StudioSettings.vue')
  const host = document.createElement('div')
  document.body.appendChild(host)
  app = createApp({ render: () => h(StudioSettings) })
  app.mount(host)
  await settle()
  return host
}

describe('a folder the player did not open', () => {
  it('is shown as a path to copy, and an opened one is not', async () => {
    const { folderNote, noteFolder } = await import('../src/player/folderNote')
    noteFolder({ folder: 'C:/music/videos', opened: true })
    noteFolder({ folder: 'C:/music/videos' }) // an older server: it opened the folder and says nothing about it
    expect(folderNote.value).toBeNull()
    const answer = { folder: 'C:/music/videos', opened: false, hint: 'copy it into your file manager' }
    expect(noteFolder(answer)).toBe(answer)
    expect(folderNote.value).toEqual(answer)
  })

  it('copies the path, and says no when the browser refuses', async () => {
    const { copyText } = await import('../src/player/folderNote')
    const written: string[] = []
    expect(await copyText('C:/music', { writeText: async (text) => void written.push(text) })).toBe(true)
    expect(written).toEqual(['C:/music'])
    expect(await copyText('C:/music', { writeText: async () => Promise.reject(new Error('denied')) })).toBe(false)
    expect(await copyText('C:/music', null)).toBe(false) // a page without a clipboard (http from another computer)
  })

  it('opens the dialog with the path, the sentence and a copy button', async () => {
    const { folderNote, noteFolder } = await import('../src/player/folderNote')
    const { default: FolderNote } = await import('../src/player/components/FolderNote.vue')
    const written: string[] = []
    vi.stubGlobal('navigator', { clipboard: { writeText: async (text: string) => void written.push(text) } })
    noteFolder({ folder: 'C:/Users/me/.plenio/player/packages', opened: false, hint: 'This installation of Plenio opens no file manager.' })
    const host = document.createElement('div')
    document.body.appendChild(host)
    app = createApp({ render: () => h(FolderNote) })
    app.mount(host)
    await settle()
    const field = host.querySelector<HTMLInputElement>('input.path')!
    expect(field.value).toBe('C:/Users/me/.plenio/player/packages')
    expect(field.readOnly).toBe(true)
    expect(host.textContent).toContain('opens no file manager')
    const [copy, close] = [...host.querySelectorAll('button')]
    copy.click()
    await settle()
    expect(written).toEqual(['C:/Users/me/.plenio/player/packages'])
    expect(copy.textContent).toContain('Copied')
    close.click()
    await settle()
    expect(folderNote.value).toBeNull()
    expect(host.querySelector('.dialog')).toBeNull()
  })
})

describe('the studio panel', () => {
  it('offers the start, its options and how it starts ComfyUI where the player can start it', async () => {
    const host = await panel({ ...STATUS, launcher: true })
    expect([...host.querySelectorAll('button')].some((b) => b.textContent?.includes('Start the studio'))).toBe(true)
    expect(host.querySelector('.options')).not.toBeNull()
    expect(host.querySelector('details.how')).not.toBeNull()
    expect(host.querySelector('.without')).toBeNull()
  })

  it('treats a server that does not say as one that can (1.6 and older)', async () => {
    const host = await panel(STATUS)
    expect([...host.querySelectorAll('button')].some((b) => b.textContent?.includes('Start the studio'))).toBe(true)
  })

  it('says how to get ComfyUI running where the player starts no program', async () => {
    const why = 'This installation of Plenio does not start ComfyUI.'
    const host = await panel({ ...STATUS, launcher: false, can_start: false, why, command: '' })
    expect([...host.querySelectorAll('button')].some((b) => b.textContent?.includes('Start the studio'))).toBe(false)
    expect(host.querySelector('.options')).toBeNull()
    expect(host.querySelector('details.how')).toBeNull()
    const without = host.querySelector('.without')!
    expect(without.textContent).toContain('Start ComfyUI the way you usually do')
    expect(without.textContent).toContain('git clone')
    expect(host.querySelector('.status')!.textContent).toContain('ComfyUI is not running')
  })

  it('shows a ComfyUI that runs, with its link, and no advice to start one', async () => {
    const host = await panel({ ...STATUS, launcher: false, can_start: false, running: true })
    expect(host.querySelector('.status')!.textContent).toContain('ComfyUI is running at http://127.0.0.1:8188')
    expect(host.querySelector('a[href="http://127.0.0.1:8188"]')).not.toBeNull()
    expect(host.querySelector('.without')!.textContent).not.toContain('the way you usually do')
  })
})
