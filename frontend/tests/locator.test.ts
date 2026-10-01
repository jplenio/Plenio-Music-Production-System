/**
 * The cursor (docs/design/score-arrange-design.md §2; Cubase: project cursor): the conversions, the
 * ruler in the piano roll, and the Score tab playing from the cursor with a line that follows.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { type App, createApp, h, nextTick, reactive } from 'vue'

import type { Fetcher, ScoreOperation } from '../src/api/client'
import type { ScoreModelView, ScoreView } from '../src/shared/scoreView'
import type { WorkingDoc } from '../src/shared/sheetSession'
import PianoRoll from '../src/sheet-editor/score/PianoRoll.vue'
import ScoreTab from '../src/sheet-editor/score/ScoreTab.vue'
import {
  barOfUnit,
  positionLabel,
  rulerUnit,
  scoreSecondOfSource,
  secondsOfUnit,
  unitOfBar,
  unitOfSeconds
} from '../src/sheet-editor/score/locator'
import { geometry, xOf } from '../src/sheet-editor/score/pianoRoll'
import { defaultPrefs, savePrefs } from '../src/sheet-editor/score/prefs'
import fixture from './fixtures/tricky-score.json'

const VIEW = fixture.view as unknown as ScoreView
const MODEL = VIEW.model as ScoreModelView // L:1/32, 4/4: 32 units a bar, 2.667 s a bar at 90 BPM
const GEO = geometry(MODEL, { pxPerQuarter: 48, height: 280, snap: 'auto' })

describe('cursor positions', () => {
  it('knows the bar of a unit and the unit of a bar', () => {
    expect(barOfUnit(MODEL, 0)).toBe(1)
    expect(barOfUnit(MODEL, 31)).toBe(1)
    expect(barOfUnit(MODEL, 32)).toBe(2)
    expect(barOfUnit(MODEL, MODEL.total)).toBe(7) // the end belongs to the last bar
    expect(unitOfBar(MODEL, 3)).toBe(64)
    expect(unitOfBar(MODEL, 99)).toBe(192)
  })

  it('puts a ruler click on the grid and inside the score', () => {
    expect(rulerUnit(37.4, 4, MODEL.total)).toBe(36)
    expect(rulerUnit(38.1, 4, MODEL.total)).toBe(40)
    expect(rulerUnit(-5, 4, MODEL.total)).toBe(0)
    expect(rulerUnit(500, 4, MODEL.total)).toBe(MODEL.total)
  })

  it('converts between units and score seconds with the bar times of the backend', () => {
    expect(secondsOfUnit(VIEW, 32)).toBeCloseTo(2.667, 3)
    expect(secondsOfUnit(VIEW, 48)).toBeCloseTo(2.667 + 1.3335, 3)
    for (const unit of [0, 17, 32, 100, 223]) expect(unitOfSeconds(VIEW, secondsOfUnit(VIEW, unit))).toBeCloseTo(unit, 6)
    expect(unitOfSeconds(VIEW, 999)).toBe(MODEL.total)
    expect(unitOfSeconds({ ...VIEW, model: null }, 3)).toBeNull()
  })

  it("maps the source recording's time onto the score's bars", () => {
    // a source whose bars last 3 s: its second 4.5 is the middle of bar 2
    const timeline: [number, number, string][] = VIEW.bars.map((_, i) => [i * 3, i * 3 + 3, '4/4'])
    expect(scoreSecondOfSource(VIEW, 4.5, timeline)).toBeCloseTo(2.667 + 2.667 / 2, 3)
    expect(scoreSecondOfSource(VIEW, 4.5, undefined)).toBe(4.5)
  })

  it("reads like Cubase's position display", () => {
    expect(positionLabel(MODEL, 0)).toBe('1.1.1')
    expect(positionLabel(MODEL, 32 + 8 + 2)).toBe('2.2.2') // bar 2, beat 2, second sixteenth
    expect(positionLabel(MODEL, 64 + 31)).toBe('3.4.4')
  })
})

// --- the ruler in the piano roll ----------------------------------------------------------------

let app: App | null = null
afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

function mountRoll(locator: number | null = 0, playhead: number | null = null) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const state = reactive({ locator, playhead, selection: ['V3.0', 'V3.1'] })
  const located: number[] = []
  const selects: string[][] = []
  app = createApp({
    render: () =>
      h(PianoRoll, {
        view: VIEW,
        selection: state.selection,
        operate: (_op: ScoreOperation) => Promise.resolve(true),
        locator: state.locator,
        playhead: state.playhead,
        onLocate: (unit: number) => {
          located.push(unit)
          state.locator = unit
        },
        onSelect: (ids: string[]) => selects.push(ids)
      })
  })
  app.mount(host)
  return { host, svg: host.querySelector('svg.roll-svg') as SVGSVGElement, state, located, selects }
}

function pointer(target: Element, type: string, x: number, y: number): void {
  target.dispatchEvent(new PointerEvent(type, { clientX: x, clientY: y, button: 0, bubbles: true, pointerId: 1 }))
}

describe('PianoRoll: the ruler and the cursor', () => {
  it('sets the cursor on the grid with a click in the ruler and moves it with a drag', async () => {
    const { svg, located, selects } = mountRoll()
    pointer(svg, 'pointerdown', xOf(41.2, GEO), 6)
    expect(located).toEqual([rulerUnit(41.2, GEO.snap, MODEL.total)])
    pointer(svg, 'pointermove', xOf(100, GEO), 6)
    pointer(svg, 'pointermove', xOf(128.4, GEO), 200) // the drag may leave the ruler
    pointer(svg, 'pointerup', xOf(128.4, GEO), 200)
    await nextTick()
    expect(located.at(-1)).toBe(rulerUnit(128.4, GEO.snap, MODEL.total))
    expect(selects).toEqual([]) // the selection stays (Cubase)
    const line = svg.querySelector('line.locator') as SVGLineElement
    expect(Number(line.getAttribute('x1'))).toBeCloseTo(xOf(located.at(-1) as number, GEO))
    expect(svg.querySelector('.locator-mark title')?.textContent).toContain('5.1.1')
  })

  it('draws the playback line only while playing', async () => {
    const { svg, state } = mountRoll(32, null)
    expect(svg.querySelector('line.playhead')).toBeNull()
    state.playhead = 48
    await nextTick()
    expect(Number(svg.querySelector('line.playhead')?.getAttribute('x1'))).toBeCloseTo(xOf(48, GEO))
    state.playhead = null
    await nextTick()
    expect(svg.querySelector('line.playhead')).toBeNull()
    expect(svg.querySelector('line.locator')).not.toBeNull() // the cursor stays where it was
  })
})

// --- the Score tab: play from the cursor --------------------------------------------------------

/** A Web Audio stand-in that records the tones it is asked to play; its clock is set by the test. */
function fakeAudio(): { tones: number[]; clock: { now: number } } {
  const tones: number[] = []
  const clock = { now: 0 }
  const param = () => ({ value: 0, setValueAtTime: () => undefined, linearRampToValueAtTime: () => undefined })
  class FakeContext {
    get currentTime(): number {
      return clock.now
    }
    destination = {}
    resume = () => Promise.resolve()
    close = () => Promise.resolve()
    createGain = () => ({ gain: param(), connect: (to: unknown) => to, disconnect: () => undefined })
    createOscillator = () => {
      const oscillator = {
        type: 'sine',
        frequency: param(),
        onended: null,
        connect: (to: unknown) => to,
        start: () => tones.push(oscillator.frequency.value),
        stop: () => undefined
      }
      return oscillator
    }
  }
  vi.stubGlobal('AudioContext', FakeContext)
  return { tones, clock }
}

const midiOf = (hz: number): number => Math.round(69 + 12 * Math.log2(hz / 440))

async function settle(times = 4): Promise<void> {
  for (let index = 0; index < times; index++) {
    await new Promise((resolve) => setTimeout(resolve, 0))
    await nextTick()
  }
}

describe('ScoreTab: playback from the cursor', () => {
  beforeEach(() => {
    window.localStorage.clear()
    savePrefs({ ...defaultPrefs(), voices: { Vocal: true, Ins: false, chords: false } })
  })

  async function mountTab() {
    const { tones, clock } = fakeAudio()
    const host = document.createElement('div')
    document.body.appendChild(host)
    const fetcher: Fetcher = {
      fetchApi: (route: string) =>
        Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(route.includes('/analyze') ? VIEW : {}) } as Response)
    }
    const doc: WorkingDoc = { kind: 'score', text: fixture.abc, intent: 'keep' }
    app = createApp({
      render: () => h(ScoreTab, { doc, fetcher, payload: null, readonly: false, layoutDefault: 'review', lyrics: null, title: 'Song' })
    })
    app.mount(host)
    await settle()
    const svg = host.querySelector('svg.roll-svg') as SVGSVGElement
    const play = [...host.querySelectorAll('.transport button')].find((b) => b.textContent?.includes('notes')) as HTMLButtonElement
    return { host, svg, play, tones, clock }
  }

  it('plays from the cursor, follows with a line and keeps the cursor on stop', async () => {
    const { host, svg, play, tones } = await mountTab()
    expect(play.title).toContain('the cursor (1.1.1)')
    pointer(svg, 'pointerdown', xOf(96, GEO), 6) // bar 4
    pointer(svg, 'pointerup', xOf(96, GEO), 6)
    await nextTick()
    expect(play.title).toContain('the cursor (4.1.1)')
    play.click()
    await nextTick()
    expect(midiOf(tones[0])).toBe(71) // the Vocal note of bar 4, not the first of the song
    expect(Number(svg.querySelector('line.playhead')?.getAttribute('x1'))).toBeCloseTo(xOf(96, GEO))
    expect(host.querySelector('.transport .facts')?.textContent).toContain('notes')
    play.click() // stop
    await nextTick()
    expect(svg.querySelector('line.playhead')).toBeNull()
    expect(Number(svg.querySelector('line.locator')?.getAttribute('x1'))).toBeCloseTo(xOf(96, GEO))
  })

  it("loops from the cursor to the section's end, then the whole section (Cubase: cycle)", async () => {
    const { host, svg, play, tones, clock } = await mountTab()
    const loop = [...host.querySelectorAll('.transport label')].find((l) => l.textContent?.includes('loop section'))
    ;(loop?.querySelector('input') as HTMLInputElement).click()
    pointer(svg, 'pointerdown', xOf(96, GEO), 6) // bar 4 of the verse (bars 2-5)
    pointer(svg, 'pointerup', xOf(96, GEO), 6)
    await nextTick()
    play.click()
    expect(midiOf(tones[0])).toBe(71)
    clock.now = 5.5 // past the verse's end (bar 4 to the end of bar 5: 5.33 s)
    await new Promise((resolve) => setTimeout(resolve, 80))
    expect(tones.slice(1).map(midiOf)).toContain(66) // the verse again, from bar 2
    expect(Number(svg.querySelector('line.locator')?.getAttribute('x1'))).toBeCloseTo(xOf(96, GEO))
    play.click()
  })

  it('puts the cursor at a section from the list, and at the start with Home', async () => {
    const { host, svg, play } = await mountTab()
    const chorus = [...host.querySelectorAll('.section-head')][2] as HTMLElement
    chorus.click()
    await nextTick()
    expect(play.title).toContain('the cursor (6.1.1)')
    expect(Number(svg.querySelector('line.locator')?.getAttribute('x1'))).toBeCloseTo(xOf(160, GEO))
    const tab = host.querySelector('.score-tab') as HTMLElement
    tab.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true, cancelable: true }))
    await nextTick()
    expect(play.title).toContain('the cursor (1.1.1)')
  })
})
