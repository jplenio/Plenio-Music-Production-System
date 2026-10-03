/**
 * Recording with a MIDI keyboard in the Score tab, end to end with a fake keyboard and a fake audio
 * clock: rec plays from the cursor, the keys show live and land where they were heard, Stop writes one
 * place_notes step, Esc throws the take away, step input writes a note at the cursor and moves it on.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { type App, createApp, h, nextTick } from 'vue'

import type { Fetcher } from '../src/api/client'
import type { ScoreView } from '../src/shared/scoreView'
import type { WorkingDoc } from '../src/shared/sheetSession'
import ScoreTab from '../src/sheet-editor/score/ScoreTab.vue'
import { defaultPrefs, defaultRecord, savePrefs } from '../src/sheet-editor/score/prefs'
import fixture from './fixtures/tricky-score.json'

const VIEW = fixture.view as unknown as ScoreView

// --- a fake audio clock and a fake MIDI keyboard ------------------------------------------------
const clock = { now: 0 }
const param = () => ({
  value: 0,
  setValueAtTime: () => undefined,
  linearRampToValueAtTime: () => undefined,
  setTargetAtTime: () => undefined,
  cancelScheduledValues: () => undefined
})
class FakeContext {
  get currentTime(): number {
    return clock.now
  }
  baseLatency = 0
  destination = {}
  resume = () => Promise.resolve()
  close = () => Promise.resolve()
  createGain = () => ({ gain: param(), connect: (to: unknown) => to, disconnect: () => undefined })
  createOscillator = () => ({ type: 'sine', frequency: param(), onended: null, connect: (to: unknown) => to, start: () => undefined, stop: () => undefined })
}
const keyboard = { onmidimessage: null as ((e: { data: Uint8Array; timeStamp: number }) => void) | null, id: 'k', name: 'Keys', manufacturer: 'Test', state: 'connected' }
const access = { inputs: { forEach: (fn: (i: typeof keyboard) => void) => fn(keyboard) }, onstatechange: null }
const PERF = 1000

function key(note: number, on: boolean): void {
  keyboard.onmidimessage?.({ data: new Uint8Array([on ? 0x90 : 0x80, note, 100]), timeStamp: PERF })
}

let app: App | null = null
let ops: Record<string, unknown>[] = []

beforeEach(() => {
  vi.stubGlobal('AudioContext', FakeContext)
  Object.defineProperty(navigator, 'requestMIDIAccess', { value: () => Promise.resolve(access), configurable: true })
  vi.spyOn(performance, 'now').mockReturnValue(PERF)
  window.localStorage.clear()
  savePrefs({ ...defaultPrefs(), record: { ...defaultRecord(), countIn: 0 } })
  clock.now = 0
  ops = []
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
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function mountTab() {
  const fetcher: Fetcher = {
    fetchApi: (route: string, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body ?? '{}'))
      if (route.includes('/transform')) ops.push(body.operation)
      const answer = route.includes('/transform')
        ? { abc: fixture.abc, changes: ['recorded'], warnings: [], select: [], time_map: null, analysis: VIEW }
        : route.includes('/analyze')
          ? VIEW
          : {}
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(answer) } as Response)
    }
  }
  const host = document.createElement('div')
  document.body.appendChild(host)
  const doc: WorkingDoc = { kind: 'score', text: fixture.abc, intent: 'keep' }
  app = createApp({ render: () => h(ScoreTab, { doc, fetcher, payload: null, readonly: false, layoutDefault: 'review', lyrics: null, title: 'Song' }) })
  app.mount(host)
  await settle()
  const button = (label: string) => [...host.querySelectorAll('.transport button')].find((b) => b.textContent?.trim().startsWith(label)) as HTMLButtonElement
  return { host, button }
}

/** Score seconds -> units of the fixture's first bars (L:1/32, the bar's own timing). */
function unitAt(seconds: number): number {
  const bar = [...VIEW.bars].reverse().find((b) => b.start_s <= seconds) ?? VIEW.bars[0]
  const measure = VIEW.model!.measures[bar.index - 1]
  return measure.onset + ((seconds - bar.start_s) / bar.duration_s) * measure.length
}

describe('recording with a MIDI keyboard', () => {
  it('records the keys where they were heard and writes them with one step on stop', async () => {
    const { host, button } = await mountTab()
    button('● rec').click()
    await settle()
    expect(button('■ stop')).toBeTruthy() // playback runs
    const started = 0.05 // the player starts 50 ms ahead
    clock.now = started + 0.4
    key(72, true)
    clock.now = started + 0.9
    await wait(40) // a playback tick: the live note grows
    expect(host.querySelectorAll('.roll-svg rect.rec-note').length).toBe(1)
    key(72, false)
    clock.now = started + 1.2
    key(74, true)
    clock.now = started + 1.6
    await wait(40)
    button('● rec').click() // stop and keep
    await settle(6)
    expect(ops).toHaveLength(1)
    const op = ops[0] as { op: string; track: string; notes: { onset: number; duration: number; pitch: number }[]; clear: number[] }
    expect(op.op).toBe('place_notes')
    expect(op.track).toBe('vocal')
    expect(op.notes.map((n) => n.pitch)).toEqual([72, 74])
    expect(Math.abs(op.notes[0].onset - unitAt(0.4))).toBeLessThanOrEqual(1) // on the 1/16 grid (2 units)
    expect(op.notes[1].onset + op.notes[1].duration).toBeLessThanOrEqual(op.clear[1]) // the held key ends at the stop
    expect(op.clear[0]).toBe(0)
    expect(host.querySelectorAll('.roll-svg rect.rec-note').length).toBe(0)
  })

  it('counts in a bar: a key just before the start lands on it, one long before is not taken', async () => {
    savePrefs({ ...defaultPrefs(), record: { ...defaultRecord(), countIn: 1 } })
    const { button } = await mountTab()
    button('● rec').click()
    await settle()
    expect(button('● count-in')).toBeTruthy()
    const bar = VIEW.bars[0]
    const beats = Number(bar.meter.split('/')[0])
    const lead = bar.duration_s // one bar of clicks
    const started = 0.05
    clock.now = started + 0.1 // the first beat of the count-in: too early
    key(60, true)
    key(60, false)
    clock.now = started + lead - (bar.duration_s / beats) * 0.3 // a little before the first beat
    key(62, true)
    clock.now = started + lead + 0.5
    key(62, false)
    await wait(40)
    expect(button('● rec')).toBeTruthy() // the count-in is over
    button('● rec').click()
    await settle(6)
    const op = ops[0] as { notes: { onset: number; pitch: number }[] }
    expect(op.notes.map((n) => [n.onset, n.pitch])).toEqual([[0, 62]])
  })

  it('throws the take away with Esc and changes nothing without keys', async () => {
    const { host, button } = await mountTab()
    button('● rec').click()
    await settle()
    clock.now = 0.5
    key(60, true)
    host.querySelector('.score-tab')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    await settle(6)
    expect(ops).toEqual([])
    expect(host.querySelector('.status')?.textContent).toContain('thrown away')
    expect(host.querySelector('.plenio-overlay, .score-tab')).toBeTruthy() // the editor stays open
    button('● rec').click()
    await settle()
    button('● rec').click()
    await settle(6)
    expect(ops).toEqual([])
    expect(host.querySelector('.status')?.textContent).toContain('nothing recorded')
  })

  it('keeps the take with Space also when the focus left the score', async () => {
    const { button } = await mountTab()
    button('● rec').click()
    await settle()
    clock.now = 0.5
    key(72, true)
    clock.now = 0.9
    await wait(40)
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }))
    await settle(6)
    expect((ops[0] as { op: string }).op).toBe('place_notes')
    // not recording any more: Space outside the score is not the editor's
    const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
    document.body.dispatchEvent(space)
    expect(space.defaultPrevented).toBe(false)
  })

  it('writes a note at the cursor with each key in step input and moves the cursor on', async () => {
    const { button } = await mountTab()
    button('step').click()
    await settle()
    key(67, true)
    key(64, true) // pressed together: the highest
    await wait(60)
    await settle(6)
    expect(ops).toEqual([{ op: 'place_notes', track: 'vocal', notes: [{ onset: 0, duration: 4, pitch: 67 }], label: 'step' }])
    expect(button('▶ play').title).toContain('1.1.3') // the cursor one eighth on (L:1/32)
    button('rest ▶').click()
    await nextTick()
    key(69, true)
    await wait(60)
    await settle(6)
    expect((ops[1] as { notes: { onset: number }[] }).notes[0].onset).toBe(8)
  })

  it('says what is wrong when the browser has no MIDI', async () => {
    Object.defineProperty(navigator, 'requestMIDIAccess', { value: undefined, configurable: true })
    const { MidiHub } = await import('../src/sheet-editor/score/midiInput')
    const hub = new MidiHub(navigator as never)
    expect(await hub.enable()).toBe(false)
    expect(hub.problem.value).toContain('Web MIDI')
  })
})
