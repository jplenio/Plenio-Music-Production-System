/**
 * The DAW layout (M2/D4-D5): the track rows and their destinations, the Guide notes' seconds,
 * the loose node-property value, the Guide's playback events and the mounted track panel.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { type App, createApp, h, nextTick, reactive } from 'vue'

import type { GuideNote } from '../src/api/client'
import { type VoiceSwitches, schedule } from '../src/shared/playback'
import type { ScoreModelView, ScoreView } from '../src/shared/scoreView'
import TrackPanel from '../src/sheet-editor/score/TrackPanel.vue'
import { initialLayout } from '../src/sheet-editor/score/inspector'
import { defaultPrefs, loadPrefs } from '../src/sheet-editor/score/prefs'
import { guideNotes, notesLabel, parseGuide, sameGuide, serializeGuide, trackRows } from '../src/sheet-editor/score/tracks'
// The editor view of TRICKY (tests/unit/test_score_editor.py), kept current by the backend tests.
import fixture from './fixtures/tricky-score.json'

const VIEW = fixture.view as unknown as ScoreView
const MODEL = VIEW.model as ScoreModelView

afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
  window.localStorage.clear()
})

describe('track rows', () => {
  it('names the four tracks and what YuE2 reads each as', () => {
    const rows = trackRows(VIEW, 3)
    expect(rows.map((row) => [row.voice, row.name, row.destination, row.notes, row.sent])).toEqual([
      ['Vocal', 'Vocal', 'V: Vocal', MODEL.tracks.vocal.length, true],
      ['Ins', 'Instrument', 'V: Ins', MODEL.tracks.ins.length, true],
      ['chords', 'Chords', 'chord symbols', MODEL.tracks.chords.length, true],
      ['guide', 'Guide', 'not sent to YuE2', 3, false]
    ])
    expect(notesLabel(1)).toBe('1 note')
    expect(trackRows(null, 0).map((row) => row.notes)).toEqual([0, 0, 0, 0])
  })
})

describe('guide notes', () => {
  const guide: GuideNote[] = [
    [0, 8, 60],
    [8, 4, 64]
  ]

  it('converts units to score seconds with the model\'s tempo and grid', () => {
    const seconds = guideNotes(guide, MODEL)
    const perUnit = 60 / MODEL.tempo / MODEL.grid.units_per_quarter
    expect(seconds.map((note) => [note.start_s, note.duration_s, note.midi])).toEqual([
      [0, 8 * perUnit, 60],
      [8 * perUnit, 4 * perUnit, 64]
    ])
    expect(guideNotes(guide, null)).toEqual([])
    expect(guideNotes(null, MODEL)).toEqual([])
  })

  it('plays the Guide track only when its switch is on', () => {
    const options = {
      from: 0,
      voices: { Vocal: false, Ins: false, chords: false, guide: true } as VoiceSwitches,
      speed: 1,
      guide: guideNotes(guide, MODEL)
    }
    const events = schedule(VIEW, options)
    expect(events.map((event) => event.part)).toEqual(['guide', 'guide'])
    expect(schedule(VIEW, { ...options, voices: { ...options.voices, guide: false } })).toEqual([])
    // without the switch (older preferences) nothing is played
    const off = schedule(VIEW, { ...options, voices: { Vocal: false, Ins: false, chords: false } })
    expect(off).toEqual([])
  })

  it('reads the loose node-property value and writes a plain array', () => {
    expect(parseGuide([[8, 4, 64], [0, 8, 60]])).toEqual([
      [0, 8, 60],
      [8, 4, 64]
    ])
    expect(parseGuide('[[0,8,60]]')).toEqual([[0, 8, 60]])
    expect(parseGuide(null)).toEqual([])
    expect(parseGuide('not json')).toEqual([])
    expect(parseGuide([[0, 0, 60], [0, 4, 200], [1], ['a', 1, 2], [0.5, 1, 2]])).toEqual([])
    expect(serializeGuide([
      [0, 8, 60],
      [8, 4, 64]
    ])).toEqual([
      [0, 8, 60],
      [8, 4, 64]
    ])
    expect(sameGuide([[0, 8, 60]], [[0, 8, 60]])).toBe(true)
    expect(sameGuide([[0, 8, 60]], [[0, 8, 61]])).toBe(false)
    expect(sameGuide([], [[0, 8, 60]])).toBe(false)
  })
})

describe('layout and preferences', () => {
  it('opens the DAW layout of a template and remembers it', () => {
    expect(initialLayout('daw', 'review')).toBe('daw')
    expect(initialLayout('review', 'text')).toBe('review')
    expect(initialLayout('text', 'review')).toBe('text')
    expect(initialLayout(undefined, 'review')).toBe('review')
    expect(loadPrefs({ getItem: () => JSON.stringify({ layout: 'daw' }) }).layout).toBe('daw')
    expect(loadPrefs(null).voices.guide).toBe(true)
    expect(defaultPrefs().layout).toBe('review')
  })
})

// --- the component ------------------------------------------------------------------------------

let app: App | null = null

function mount(props: Record<string, unknown> = {}) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const voices = reactive<VoiceSwitches>({ Vocal: true, Ins: true, chords: true, guide: true })
  const clears = vi.fn()
  app = createApp({
    render: () =>
      h(TrackPanel, {
        view: VIEW,
        guideCount: 2,
        keepsGuide: true,
        readonly: false,
        voices,
        'onUpdate:voices': (next: VoiceSwitches) => Object.assign(voices, next),
        onClearGuide: clears,
        ...props
      })
  })
  app.mount(host)
  return { host, voices, clears }
}

describe('TrackPanel', () => {
  it('lists the tracks, their destination and their note counts', () => {
    const { host } = mount()
    const cells = (row: Element, selector: string) => row.querySelector(selector)?.textContent?.trim()
    const rows = [...host.querySelectorAll('li')]
    expect(
      rows.map((row) => [
        cells(row, '.track-name'),
        cells(row, '.destination'),
        cells(row, '.count')
      ])
    ).toEqual([
      ['Vocal', 'V: Vocal', notesLabel(MODEL.tracks.vocal.length)],
      ['Instrument', 'V: Ins', notesLabel(MODEL.tracks.ins.length)],
      ['Chords', 'chord symbols', notesLabel(MODEL.tracks.chords.length)],
      ['Guide', 'not sent to YuE2', '2 notes']
    ])
    expect(host.textContent).toContain('never sent to YuE2')
  })

  it('switches the playback voices, also for the Guide track', async () => {
    const { host, voices } = mount()
    const switches = [...host.querySelectorAll('input[type="checkbox"]')] as HTMLInputElement[]
    expect(switches).toHaveLength(4)
    expect(switches.every((input) => input.checked)).toBe(true)
    switches[0].checked = false
    switches[0].dispatchEvent(new Event('change'))
    switches[3].checked = false
    switches[3].dispatchEvent(new Event('change'))
    await nextTick()
    expect(voices.Vocal).toBe(false)
    expect(voices.guide).toBe(false)
  })

  it('offers to clear the Guide notes and hides the track when the sheet keeps none', async () => {
    const { host, clears } = mount()
    ;(host.querySelector('.link') as HTMLButtonElement).click()
    expect(clears).toHaveBeenCalledTimes(1)
    app?.unmount()
    const second = mount({ keepsGuide: false, guideCount: 0 })
    expect([...second.host.querySelectorAll('li')]).toHaveLength(3)
    expect(second.host.textContent).toContain('keeps no Guide track')
  })
})
