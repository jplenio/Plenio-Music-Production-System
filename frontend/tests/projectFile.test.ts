/**
 * Everything of the score editor in one file and back (owner's request 2026-10-01): the project file
 * holds the score, the Guide notes and the lyrics; the Score tab saves it, opens it as one undo step and
 * says what a sheet could not take. *Export MusicXML* downloads the sheet music.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { type App, createApp, h, nextTick, reactive } from 'vue'

import type { Fetcher, GuideNote } from '../src/api/client'
import type { WorkingDoc } from '../src/shared/sheetSession'
import ScoreTab from '../src/sheet-editor/score/ScoreTab.vue'
import { PROJECT_SCHEMA, buildProject, parseProject, projectFilename } from '../src/sheet-editor/score/projectFile'
import { defaultPrefs, savePrefs } from '../src/sheet-editor/score/prefs'
import plain from './fixtures/tricky-score.json'
import sung from './fixtures/tricky-lyrics.json'

describe('the project file', () => {
  it('holds the score, the Guide notes and the lyrics and reads them back', () => {
    const project = buildProject(
      { title: ' My Song ', score: plain.abc, guide: [[0, 8, 60]], lyrics: sung.lyrics },
      new Date('2026-10-01T12:00:00Z')
    )
    expect(project).toMatchObject({ schema: PROJECT_SCHEMA, title: 'My Song', saved: '2026-10-01T12:00:00.000Z', guide: [[0, 8, 60]] })
    expect(project.app).toMatch(/^Plenio Music Production System \d+\.\d+\.\d+/)
    expect(parseProject(JSON.stringify(project))).toEqual(project)
    expect(buildProject({ score: 'X', lyrics: '  ' }).lyrics).toBeNull()
  })

  it('says why a file is not a project and drops broken Guide notes', () => {
    expect(parseProject('not json')).toContain('not JSON')
    expect(parseProject('{"schema": "plenio.sheet_state/1"}')).toContain('not a Plenio score project')
    expect(parseProject(`{"schema": "${PROJECT_SCHEMA}", "score": " "}`)).toBe('The project holds no score.')
    const read = parseProject(JSON.stringify({ schema: PROJECT_SCHEMA, score: 'X:1', guide: [[0, 8, 60], [1, 0, 61], 'x'], lyrics: 3 }))
    expect(read).toMatchObject({ score: 'X:1', guide: [[0, 8, 60]], lyrics: null, title: '' })
  })

  it('is named after the title', () => {
    expect(projectFilename('Lied: Nr. 2')).toBe('Lied_ Nr_ 2.plenio.json')
    expect(projectFilename('')).toBe('score.plenio.json')
  })
})

// --- the Score tab: save, open, export ---------------------------------------------------------

let app: App | null = null
let blobs: Blob[] = []
beforeEach(() => {
  window.localStorage.clear()
  savePrefs({ ...defaultPrefs() })
  blobs = []
  vi.spyOn(URL, 'createObjectURL').mockImplementation((blob: Blob | MediaSource) => {
    blobs.push(blob as Blob)
    return 'blob:plenio'
  })
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
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

async function mountTab(options: { guide?: GuideNote[]; lyricsTarget?: boolean } = {}) {
  const requests: { route: string; body: Record<string, unknown> }[] = []
  const fetcher: Fetcher = {
    fetchApi: (route: string, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body ?? '{}'))
      requests.push({ route, body })
      const answer = route.includes('/musicxml')
        ? { filename: 'Song.musicxml', data: '<score-partwise/>', type: 'application/vnd.recordare.musicxml+xml' }
        : route.includes('/analyze')
          ? body.lyrics
            ? sung.view
            : plain.view
          : {}
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(answer) } as Response)
    }
  }
  const state = reactive({ guide: options.guide, changes: [] as GuideNote[][], lyrics: [] as (string | null)[] })
  const doc: WorkingDoc = reactive({ kind: 'score', text: plain.abc, intent: 'keep' })
  const host = document.createElement('div')
  document.body.appendChild(host)
  app = createApp({
    render: () =>
      h(ScoreTab, {
        doc,
        fetcher,
        payload: null,
        readonly: false,
        layoutDefault: 'review',
        lyrics: options.lyricsTarget ? sung.lyrics : null,
        title: 'Song',
        guide: state.guide,
        lyricsTarget: options.lyricsTarget ? { title: 'Song Sheet · Text', blocked: null, replans: false } : null,
        onGuideChange: (next: GuideNote[]) => {
          state.changes.push(next)
          state.guide = next
        },
        onLyricsChange: (text: string | null) => state.lyrics.push(text)
      })
  })
  app.mount(host)
  await settle(6)
  const button = (name: string) =>
    [...host.querySelectorAll('.midi-tools button')].find((b) => b.textContent?.trim() === name) as HTMLButtonElement
  const status = () => host.querySelector('.status')?.textContent ?? ''
  return { host, doc, state, requests, button, status }
}

async function choose(input: HTMLInputElement, text: string, name: string): Promise<void> {
  Object.defineProperty(input, 'files', { value: [new File([text], name, { type: 'application/json' })], configurable: true })
  input.dispatchEvent(new Event('change'))
  await settle(6)
}

describe('ScoreTab: project and sheet music files', () => {
  it('saves the score, the Guide notes and the lyrics in one file', async () => {
    const { button, status } = await mountTab({ guide: [[0, 8, 60]], lyricsTarget: true })
    button('Save project').click()
    await settle()
    expect(blobs).toHaveLength(1)
    const saved = parseProject(await blobs[0].text())
    expect(saved).toMatchObject({ title: 'Song', score: plain.abc, guide: [[0, 8, 60]], lyrics: sung.lyrics })
    expect(status()).toContain('saved the project: score, 1 Guide note, lyrics')
  })

  it('opens a project as one undo step: score, Guide notes and lyrics together', async () => {
    const { host, doc, state, status } = await mountTab({ guide: [], lyricsTarget: true })
    const score = plain.abc.replace('Q:1/4=90', 'Q:1/4=100')
    const lyrics = sung.lyrics.replace('hold on', 'hold on tight')
    const project = buildProject({ title: 'Old song', score, guide: [[32, 8, 62]], lyrics })
    await choose(host.querySelector('input[aria-label="Project file"]') as HTMLInputElement, JSON.stringify(project), 'old.plenio.json')
    expect(doc.text).toBe(score)
    expect(state.changes.at(-1)).toEqual([[32, 8, 62]])
    expect(state.lyrics.at(-1)).toBe(lyrics)
    expect(status()).toContain('opened old.plenio.json: score, 1 Guide note, lyrics ("Old song")')
    host.querySelector('.score-tab')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true, cancelable: true }))
    await settle()
    expect(doc.text).toBe(plain.abc)
    expect(state.changes.at(-1)).toEqual([])
    expect(state.lyrics.at(-1)).toBe(sung.lyrics)
  })

  it('says what a sheet cannot take, and refuses a file that is not a project', async () => {
    const { host, state, status } = await mountTab() // no Guide track, no lyrics to edit
    const input = host.querySelector('input[aria-label="Project file"]') as HTMLInputElement
    const other = buildProject({ score: plain.abc.replace('Q:1/4=90', 'Q:1/4=95'), guide: [[0, 8, 60]], lyrics: 'la' })
    await choose(input, JSON.stringify(other), 'p.plenio.json')
    expect(status()).toContain('not opened: the Guide notes (only the DAW sheet keeps a Guide track)')
    expect(status()).toContain('not opened: the lyrics')
    expect(state.changes).toEqual([])
    await choose(input, '{"schema": "other"}', 'x.json')
    expect(host.querySelector('.error')?.textContent).toContain('not a Plenio score project')
  })

  it('exports the sheet music as MusicXML with the lyrics', async () => {
    const { button, requests } = await mountTab({ lyricsTarget: true })
    button('Export MusicXML').click()
    await settle()
    const asked = requests.find((r) => r.route.includes('/musicxml'))
    expect(asked?.body).toMatchObject({ abc: plain.abc, title: 'Song', lyrics: sung.lyrics })
    expect(blobs[0].type).toBe('application/vnd.recordare.musicxml+xml')
    expect(await blobs[0].text()).toBe('<score-partwise/>')
  })
})
