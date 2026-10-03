/**
 * Sounds, presets and the notation export in the Score tab (owner's request 2026-10-03): ♫ sounds sets
 * each track's sound and the playback uses it, a preset sets what it names, the user's own preset goes
 * to ComfyUI's user data, the DAW layout's track headers choose the sound too, and the project file
 * carries the settings.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { type App, createApp, h, nextTick } from 'vue'

import type { Fetcher } from '../src/api/client'
import type { ScoreView } from '../src/shared/scoreView'
import type { WorkingDoc } from '../src/shared/sheetSession'
import ScoreTab from '../src/sheet-editor/score/ScoreTab.vue'
import { PRESETS_FILE } from '../src/sheet-editor/score/editorSettings'
import { loadPrefs } from '../src/sheet-editor/score/prefs'
import fixture from './fixtures/tricky-score.json'
import { audioNodes } from './support/fakeAudio'

const VIEW = fixture.view as unknown as ScoreView

const clock = { now: 0 }
class FakeContext {
  get currentTime(): number {
    return clock.now
  }
  resume = () => Promise.resolve()
  close = () => Promise.resolve()
}

let app: App | null = null
let posted: { route: string; body: string }[] = []
let stored: string | null = null

beforeEach(() => {
  Object.assign(FakeContext.prototype, audioNodes())
  vi.stubGlobal('AudioContext', FakeContext)
  window.localStorage.clear()
  posted = []
  stored = null
})
afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

async function settle(times = 4): Promise<void> {
  for (let i = 0; i < times; i++) {
    await new Promise((resolve) => setTimeout(resolve, 0))
    await nextTick()
  }
}

async function mountTab(layout: 'review' | 'daw' = 'review') {
  const fetcher: Fetcher = {
    fetchApi: (route: string, init?: RequestInit) => {
      if (route.startsWith('/userdata/')) {
        if (init?.method === 'POST') {
          posted.push({ route, body: String(init.body) })
          stored = String(init.body)
          return Promise.resolve(new Response('"ok"', { status: 200 }))
        }
        return Promise.resolve(stored ? new Response(stored, { status: 200 }) : new Response('', { status: 404 }))
      }
      const answer = route.includes('/analyze') ? VIEW : {}
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(answer) } as Response)
    }
  }
  const host = document.createElement('div')
  document.body.appendChild(host)
  const doc: WorkingDoc = { kind: 'score', text: fixture.abc, intent: 'keep' }
  app = createApp({ render: () => h(ScoreTab, { doc, fetcher, payload: null, readonly: false, layoutDefault: layout, lyrics: null, title: 'Song', guide: [] }) })
  app.mount(host)
  await settle()
  return host
}

function select(element: Element | null, value: string): void {
  const el = element as HTMLSelectElement
  el.value = value
  el.dispatchEvent(new Event('change', { bubbles: true }))
}

async function openSounds(host: HTMLElement): Promise<HTMLElement> {
  ;[...host.querySelectorAll('.transport button')].find((b) => b.textContent?.includes('♫ sounds'))?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  await settle()
  return host.querySelector('.sounds-panel') as HTMLElement
}

describe('sounds and presets', () => {
  it('sets a track’s sound and remembers it', async () => {
    const host = await mountTab()
    const panel = await openSounds(host)
    select(panel.querySelector('select[aria-label="Sound of the Vocal track"]'), 'voice')
    await settle()
    expect(loadPrefs().sounds.Vocal).toBe('voice')
  })

  it('applies a built-in preset: what it names changes, the rest stays', async () => {
    const host = await mountTab()
    const panel = await openSounds(host)
    const choice = panel.querySelector('select[aria-label="Preset"]') as HTMLSelectElement
    choice.value = 'Electronic / dance'
    choice.dispatchEvent(new Event('change'))
    await nextTick()
    ;[...panel.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'use')?.click()
    await settle()
    const prefs = loadPrefs()
    expect(prefs.sounds).toEqual({ Vocal: 'lead', Ins: 'pluck', chord: 'pad', guide: 'bass' })
    expect(prefs.metronome).toBe(true)
    expect(prefs.wave).toBe(true) // not part of this preset
    expect(host.querySelector('.status')?.textContent).toContain('Electronic / dance: sounds, metronome on set')
  })

  it('saves the current settings as the user’s preset in ComfyUI’s user data', async () => {
    const host = await mountTab()
    const panel = await openSounds(host)
    ;[...panel.querySelectorAll('button')].find((b) => b.textContent?.includes('save current as preset'))?.click()
    await settle()
    const name = panel.querySelector('input[aria-label="Name of the new preset"]') as HTMLInputElement
    name.value = 'My songs'
    name.dispatchEvent(new Event('input'))
    await nextTick()
    ;[...panel.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'save')?.click()
    await settle(6)
    expect(posted).toHaveLength(1)
    expect(posted[0].route).toBe(`/userdata/${encodeURIComponent(PRESETS_FILE)}?overwrite=true`)
    const file = JSON.parse(posted[0].body)
    expect(file.presets[0].name).toBe('My songs')
    expect(file.presets[0].settings.sounds).toEqual(loadPrefs().sounds)
    expect(panel.textContent).toContain('Saved “My songs” in ComfyUI’s user data.')
    // it is offered among the presets now
    expect([...panel.querySelectorAll('optgroup[label="Yours"] option')].map((o) => o.textContent)).toEqual(['My songs'])
  })

  it('chooses the sound in the DAW layout’s track headers', async () => {
    const host = await mountTab('daw')
    select(host.querySelector('.track-panel select[aria-label="Sound of the Chords track"]'), 'strings')
    await settle()
    expect(loadPrefs().sounds.chord).toBe('strings')
  })

  it('offers the notation export only for a valid score', async () => {
    const host = await mountTab()
    const button = [...host.querySelectorAll('.midi-tools button')].find((b) => b.textContent?.includes('Export notation')) as HTMLButtonElement
    expect(button.disabled).toBe(false)
    button.click()
    await settle()
    expect([...host.querySelectorAll('.export-panel .formats button')].map((b) => b.textContent?.trim())).toEqual(['PDF', 'PNG', 'SVG', 'Print…'])
  })
})
