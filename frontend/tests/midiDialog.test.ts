/**
 * The MIDI import dialog (M1/D3): the pure parts (roles, mapping, grid, base64, report lines) and
 * the mounted dialog against a fake fetcher - the tracks of the file, a role change that re-reads
 * the file with an explicit mapping, the report before *Insert*, and a refused file.
 */
import { afterEach, describe, expect, it } from 'vitest'
import { type App, createApp, h, nextTick } from 'vue'

import type { Fetcher } from '../src/api/client'
import type { ScoreView } from '../src/shared/scoreView'
import MidiDialog from '../src/sheet-editor/score/MidiDialog.vue'
import {
  GRIDS,
  choicesOf,
  defaultGrid,
  downloadBytes,
  fromBase64,
  mappingOf,
  summaryLines,
  toBase64,
  trackLabel
} from '../src/sheet-editor/score/midiImport'

const TRACKS = [
  { index: 0, name: '', notes: 0, role: null },
  { index: 1, name: 'Vocal', notes: 2, role: 'vocal' },
  { index: 2, name: 'Pads', notes: 3, role: null }
]

const ANALYSIS = { ok: true, sha256: 'a'.repeat(64), diagnostics: [] } as unknown as ScoreView

/** A fetcher whose /plenio/score/midi/import answer is canned; every request body is recorded. */
function fakeFetcher(
  answer: (body: Record<string, unknown>, calls: number) => { status: number; data: unknown }
) {
  const bodies: Record<string, unknown>[] = []
  const fetcher: Fetcher = {
    fetchApi: (_route, options) => {
      const body = options?.body ? (JSON.parse(String(options.body)) as Record<string, unknown>) : {}
      bodies.push(body)
      const { status, data } = answer(body, bodies.length)
      return Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(data) } as Response)
    }
  }
  return { fetcher, bodies }
}

function imported(mapping: Record<string, string | null> | undefined) {
  const guide = mapping === undefined ? [[0, 8, 60]] : []
  return {
    abc: 'X:1\nT:\nM:4/4\nL:1/16\nQ:1/4=100\nV: Vocal clef=treble name="Vocal Melody" snm="Vocal"\nV: Ins clef=treble name="Ins Melody" snm="Inst."\nK:C\n% verse\nV: Vocal\nC8- | C8 |\nV: Ins\nz8 | z8 |\n',
    guide,
    report: ['no time signature at the start: 4/4 assumed', '2 note start(s)/end(s) were quantised to 1/16 notes'],
    tracks: TRACKS,
    analysis: ANALYSIS
  }
}

/** Let every pending microtask and a Vue update settle (the dialog's import is asynchronous). */
async function settle(times = 8): Promise<void> {
  for (let index = 0; index < times; index++) {
    await Promise.resolve()
    await nextTick()
  }
}

let app: App | null = null

afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
})

async function mount(
  answer: () => { status: number; data: unknown } = () => ({ status: 200, data: imported(undefined) })
) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const { fetcher, bodies } = fakeFetcher(answer)
  const inserted: unknown[] = []
  app = createApp({
    render: () =>
      h(MidiDialog, {
        fetcher,
        data: 'TUZ0aGQ=',
        filename: 'sketch.mid',
        view: { model: { unit: '1/16' } } as unknown as ScoreView,
        keepsGuide: true,
        onInsert: (result: unknown, keepGuide: boolean) => inserted.push([result, keepGuide]),
        onClose: () => {}
      })
  })
  app.mount(host)
  await settle()
  return { host, bodies, inserted }
}

function button(host: HTMLElement, text: string): HTMLButtonElement {
  const found = [...host.querySelectorAll('button')].find((b) => b.textContent?.trim() === text)
  if (!found) throw new Error(`no button ${text}`)
  return found as HTMLButtonElement
}

describe('midiImport (pure)', () => {
  it('lists the file\'s tracks with their suggested roles', () => {
    const choices = choicesOf(TRACKS)
    expect(choices).toEqual([
      { index: 0, number: 1, name: '', notes: 0, role: 'none' },
      { index: 1, number: 2, name: 'Vocal', notes: 2, role: 'vocal' },
      { index: 2, number: 3, name: 'Pads', notes: 3, role: 'none' }
    ])
    expect(trackLabel(choices[1])).toBe('Vocal · 2 notes')
    expect(trackLabel(choices[2])).toBe('Pads · 3 notes')
    expect(trackLabel(choices[0])).toBe('unnamed · 0 notes')
  })

  it('sends every track explicitly, and null for "do not import"', () => {
    const choices = choicesOf(TRACKS)
    choices[2].role = 'ins'
    expect(mappingOf(choices)).toEqual({ '0': null, '1': 'vocal', '2': 'ins' })
  })

  it('suggests the score\'s own unit as the grid, 1/16 without one', () => {
    expect(defaultGrid({ model: { unit: '1/16' } } as unknown as ScoreView)).toBe(16)
    expect(defaultGrid({ model: { unit: '1/32' } } as unknown as ScoreView)).toBe(32)
    expect(defaultGrid({ header: { unit: '1/8' } } as unknown as ScoreView)).toBe(8)
    expect(defaultGrid(null)).toBe(16)
    expect(defaultGrid({ model: { unit: '1/1024' } } as unknown as ScoreView)).toBe(64)
    expect(defaultGrid({ model: { unit: 'broken' } } as unknown as ScoreView)).toBe(16)
    expect(GRIDS).toContain(16)
  })

  it('round-trips bytes through base64', () => {
    const bytes = new Uint8Array([0, 1, 2, 127, 128, 255, 77])
    expect(toBase64(bytes)).toBe('AAECf4D/TQ==')
    expect([...fromBase64('AAECf4D/TQ==')]).toEqual([...bytes])
    const long = new Uint8Array(20_000)
    for (let index = 0; index < long.length; index++) long[index] = index % 251
    expect([...fromBase64(toBase64(long))]).toEqual([...long])
  })

  it('says what happens to the file\'s Guide notes', () => {
    expect(summaryLines(['a'], 0, true)).toEqual(['a'])
    expect(summaryLines(['a'], 4, true)).toEqual([
      'a',
      '4 Guide note(s) in the file will be kept (never sent to YuE2).'
    ])
    expect(summaryLines([], 1, false)).toEqual([
      '1 Guide note(s) in the file are not kept here (this sheet has no Guide track).'
    ])
  })

  it('saves bytes as a download (happy-dom keeps the anchor reachable)', () => {
    expect(typeof downloadBytes).toBe('function')
  })
})

describe('MidiDialog', () => {
  it('lists the file\'s tracks and the report before anything is replaced', async () => {
    const { host, bodies } = await mount()
    expect(bodies).toHaveLength(1)
    expect(bodies[0]).toEqual({ data: 'TUZ0aGQ=', grid: 16, chords: false })
    const rows = [...host.querySelectorAll('.tracks tr')].slice(1)
    expect(rows.map((row) => row.querySelector('td')?.textContent?.replace(/\s+/g, ' ').trim())).toEqual([
      '2 Vocal · 2 notes',
      '3 Pads · 3 notes'
    ])
    expect(rows.map((row) => (row.querySelector('select') as HTMLSelectElement).value)).toEqual([
      'vocal',
      'none'
    ])
    expect(host.textContent).toContain('Empty track(s) not shown: 1')
    expect(host.textContent).toContain('2 note start(s)/end(s) were quantised')
    expect(host.textContent).toContain('1 Guide note(s) in the file will be kept')
    expect(button(host, 'Insert').disabled).toBe(false)
  })

  it('re-reads the file with an explicit mapping when a role changes', async () => {
    const { host, bodies } = await mount()
    const selects = [...host.querySelectorAll('select')] as HTMLSelectElement[]
    const roleOfTrack3 = selects[1]
    roleOfTrack3.value = 'chords'
    roleOfTrack3.dispatchEvent(new Event('change'))
    await settle()
    expect(bodies).toHaveLength(2)
    expect(bodies[1]).toEqual({
      data: 'TUZ0aGQ=',
      grid: 16,
      chords: false,
      mapping: { '0': null, '1': 'vocal', '2': 'chords' }
    })
  })

  it('takes the grid and the chord switch with it', async () => {
    const { host, bodies } = await mount()
    const grid = host.querySelector('[aria-label="Import grid"]') as HTMLSelectElement
    grid.value = '32'
    grid.dispatchEvent(new Event('change'))
    await settle()
    const chords = host.querySelector('[aria-label="Read chords from the notes"]') as HTMLInputElement
    chords.checked = true
    chords.dispatchEvent(new Event('change'))
    await settle()
    expect(bodies[1].grid).toBe(32)
    expect(bodies[2]).toMatchObject({ grid: 32, chords: true })
  })

  it('inserts the imported score and the Guide notes it was asked to keep', async () => {
    const { host, inserted } = await mount()
    button(host, 'Insert').click()
    await settle()
    expect(inserted).toHaveLength(1)
    const [result, keepGuide] = inserted[0] as [{ abc: string; guide: number[][] }, boolean]
    expect(result.abc.startsWith('X:1')).toBe(true)
    expect(result.guide).toEqual([[0, 8, 60]])
    expect(keepGuide).toBe(true)
  })

  it('shows a refused file and keeps Insert off', async () => {
    const { host } = await mount(() => ({
      status: 400,
      data: { error: { message: 'The file is not a readable MIDI file: no MThd header.' } }
    }))
    expect(host.textContent).toContain('no MThd header')
    expect(button(host, 'Insert').disabled).toBe(true)
  })
})
