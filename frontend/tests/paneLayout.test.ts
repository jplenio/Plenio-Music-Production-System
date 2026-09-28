/**
 * The score tab's draggable panes (owner's request, 2026-09-28): the piano roll's splitter, the
 * notation/ABC split and the side column. Mounted with a fake fetcher (the analyse route answers
 * the tricky-score fixture), the same way the MIDI dialog is tested.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { type App, createApp, h, nextTick } from 'vue'

import type { Fetcher } from '../src/api/client'
import type { ScoreView } from '../src/shared/scoreView'
import type { WorkingDoc } from '../src/shared/sheetSession'
import ScoreTab from '../src/sheet-editor/score/ScoreTab.vue'
import { defaultPrefs, loadPrefs, savePrefs } from '../src/sheet-editor/score/prefs'
import fixture from './fixtures/tricky-score.json'

const VIEW = fixture.view as unknown as ScoreView
const ABC = fixture.abc

let app: App | null = null

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
  window.localStorage.clear()
})

function fetcher(): Fetcher {
  return {
    fetchApi: (route: string) =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(route.includes('/analyze') ? VIEW : {})
      } as Response)
  }
}

async function mount(
  prefs: Partial<ReturnType<typeof defaultPrefs>> = {},
  props: Record<string, unknown> = {},
  keepStored = false
) {
  if (!keepStored) savePrefs({ ...defaultPrefs(), ...prefs })
  const host = document.createElement('div')
  document.body.appendChild(host)
  const doc: WorkingDoc = { kind: 'score', text: ABC, intent: 'keep' }
  app = createApp({
    render: () =>
      h(ScoreTab, {
        doc,
        fetcher: fetcher(),
        payload: null,
        readonly: false,
        layoutDefault: 'review',
        lyrics: null,
        title: 'Song',
        guide: [],
        ...props
      })
  })
  app.mount(host)
  await settle()
  return host
}

async function settle(times = 4): Promise<void> {
  for (let index = 0; index < times; index++) {
    // the session's analyze is scheduled with setTimeout(0) and resolves through the microtask queue
    await new Promise((resolve) => setTimeout(resolve, 0))
    await nextTick()
  }
}

function splitter(host: HTMLElement, label: string): HTMLElement {
  const found = host.querySelector(`[aria-label="${label}"]`)
  if (!found) throw new Error(`no splitter: ${label}`)
  return found as HTMLElement
}

function press(element: HTMLElement, key: string): void {
  element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
}

describe('the score tab panes', () => {
  it('shows the piano-roll splitter and sizes the roll from the preferences', async () => {
    const small = await mount({ rollHeight: 200 })
    const smallHeight = (small.querySelector('.roll-scroll') as HTMLElement).style.height
    app?.unmount()
    app = null
    document.body.innerHTML = ''
    const host = await mount({ rollHeight: 360 })
    const roll = host.querySelector('[aria-label="Resize the piano roll"]') as HTMLElement
    expect(roll).toBeTruthy()
    expect(roll.getAttribute('aria-valuenow')).toBe('360')
    // the roll's scroll area follows the preference (its geometry rounds to whole key rows)
    const tall = (host.querySelector('.roll-scroll') as HTMLElement).style.height
    expect(parseFloat(tall)).toBeGreaterThan(parseFloat(smallHeight) + 100)
  })

  it('nudges the roll with the arrow keys and remembers the size', async () => {
    const host = await mount({ rollHeight: 360 })
    const roll = () => splitter(host, 'Resize the piano roll')
    press(roll(), 'ArrowDown')
    await settle(1)
    expect(roll().getAttribute('aria-valuenow')).toBe('376')
    press(roll(), 'ArrowUp')
    press(roll(), 'ArrowUp')
    await settle(1)
    expect(roll().getAttribute('aria-valuenow')).toBe('344')
  })

  it('puts the pane variables on the grid: the side width and the notation share', async () => {
    const host = await mount({ sideWidth: 300, notationShare: 0.4, advanced: true })
    const main = host.querySelector('.score-main') as HTMLElement
    expect(main.style.getPropertyValue('--plenio-side-w')).toBe('300px')
    expect(main.style.getPropertyValue('--plenio-notation-fr')).toBe('0.4fr')
    expect(main.style.getPropertyValue('--plenio-text-fr')).toBe('0.6fr')
    expect(host.querySelector('.score-views')?.classList.contains('split')).toBe(true)
  })

  it('nudges the side column and the notation split with the arrow keys', async () => {
    const host = await mount({ sideWidth: 230, notationShare: 0.5, advanced: true })
    const side = () => splitter(host, 'Resize the side column')
    press(side(), 'ArrowRight')
    await settle(1)
    expect(side().getAttribute('aria-valuenow')).toBe('246')
    press(side(), 'ArrowLeft')
    press(side(), 'ArrowLeft')
    await settle(1)
    expect(side().getAttribute('aria-valuenow')).toBe('214')

    const notation = () => splitter(host, 'Resize the ABC text')
    press(notation(), 'ArrowDown') // the divider moves down: the notation grows
    await settle(1)
    expect(notation().getAttribute('aria-valuenow')).toBe('0.53')
    press(notation(), 'ArrowUp')
    press(notation(), 'ArrowUp')
    await settle(1)
    expect(notation().getAttribute('aria-valuenow')).toBe('0.47')
  })
})

describe('the pane sizes in the storage', () => {
  it('survives a reload of the tab', async () => {
    const host = await mount({ rollHeight: 200 })
    press(splitter(host, 'Resize the piano roll'), 'ArrowDown')
    await settle(1)
    expect(loadPrefs().rollHeight).toBe(216) // saved while dragging (the tab watches its prefs)
    app?.unmount()
    app = null
    document.body.innerHTML = ''
    const again = await mount({}, {}, true)  // a new tab: the stored size comes back
    expect(splitter(again, 'Resize the piano roll').getAttribute('aria-valuenow')).toBe('216')
  })
})
