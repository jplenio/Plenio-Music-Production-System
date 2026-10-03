/**
 * A cover's source recording aligned with the bars by hand (owner's request 2026-10-03: correct the
 * beat grid when the transcription's beat detection was off): *⇆ align* moves the recording by a beat
 * or by 10 ms; the source times of the sections, the waveform and the playback follow, and the shift is
 * kept with the sheet (``plenio_source_shift``).
 */
import { afterEach, describe, expect, it } from 'vitest'
import { type App, createApp, h, nextTick, reactive } from 'vue'

import type { Fetcher } from '../src/api/client'
import type { ScoreView } from '../src/shared/scoreView'
import type { SheetPayload, WorkingDoc } from '../src/shared/sheetSession'
import ScoreTab from '../src/sheet-editor/score/ScoreTab.vue'
import { parseShift } from '../src/sheet-editor/score/lyricPlacement'
import fixture from './fixtures/tricky-score.json'

const VIEW = fixture.view as unknown as ScoreView

let app: App | null = null
afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
})

async function settle(times = 4): Promise<void> {
  for (let i = 0; i < times; i++) {
    await new Promise((resolve) => setTimeout(resolve, 0))
    await nextTick()
  }
}

function mountTab(shift = 0) {
  const fetcher: Fetcher = {
    fetchApi: (route: string) =>
      Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(route.includes('/analyze') ? VIEW : {}) } as Response)
  }
  // every bar of the source lasts 3 s and starts 10 s into the recording
  const payload = {
    schema: 'plenio.sheet_payload/1',
    owned: ['score'],
    docs: {},
    context: {},
    findings: [],
    fingerprint: null,
    review: 'stop for review',
    approved: false,
    waiting: true,
    status: '',
    planning_mode: 'full',
    score_seconds: 0,
    validation: null,
    engine: null,
    instrumental: false,
    timeline: { duration_s: 40, bars: VIEW.bars.map((_, i) => [10 + i * 3, 13 + i * 3, '4/4']), sections: [] },
    reference_audio: { filename: 'source.mp3', subfolder: '', type: 'input' }
  } as unknown as SheetPayload
  const state = reactive({ shift })
  const changes: number[] = []
  const host = document.createElement('div')
  document.body.appendChild(host)
  const doc: WorkingDoc = { kind: 'score', text: fixture.abc, intent: 'keep' }
  app = createApp({
    render: () =>
      h(ScoreTab, {
        doc,
        fetcher,
        payload,
        readonly: false,
        layoutDefault: 'review',
        lyrics: null,
        title: 'Song',
        sourceShift: state.shift,
        onSourceShiftChange: (value: number) => {
          changes.push(value)
          state.shift = value
        }
      })
  })
  app.mount(host)
  return { host, state, changes }
}

const sourceTimes = (host: HTMLElement): string[] =>
  [...host.querySelectorAll('.navigator .sections li .facts')].map((f) => /source (\S+)/.exec(f.textContent ?? '')?.[1] ?? '')

describe('aligning the source recording with the bars', () => {
  it('reads a kept shift and refuses nonsense', () => {
    expect([parseShift(0.25), parseShift(-1.2346), parseShift('x'), parseShift(99), parseShift(Number.NaN)]).toEqual([0.25, -1.235, 0, 0, 0])
  })

  it('moves the source times by a beat or by 10 ms, and back', async () => {
    const { host, state, changes } = mountTab()
    await settle(6)
    const before = sourceTimes(host)
    expect(before[1]).toBe('0:13') // the verse starts at bar 2: 10 s + 3 s
    const align = [...host.querySelectorAll('.transport button')].find((b) => b.textContent?.includes('align')) as HTMLButtonElement
    align.click()
    await nextTick()
    const panel = host.querySelector('.align-panel') as HTMLElement
    const button = (label: string) => [...panel.querySelectorAll('button')].find((b) => b.textContent?.includes(label)) as HTMLButtonElement
    button('beat ▶▶').click() // the recording a beat later: every bar takes 0.75 s earlier seconds
    await settle()
    expect(changes.at(-1)).toBe(0.75)
    expect(sourceTimes(host)[1]).toBe('0:12')
    expect(panel.textContent).toContain('750 ms later')
    button('◀ 10 ms').click()
    await settle()
    expect(state.shift).toBe(0.74)
    button('reset').click()
    await settle()
    expect(state.shift).toBe(0)
    expect(sourceTimes(host)).toEqual(before)
  })
})
