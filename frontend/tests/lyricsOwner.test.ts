/**
 * The lyrics of *Song Sheet · Text* follow a score sheet's sections (docs/design/score-arrange-design.md
 * §4): the owner is found through ``context_lyrics``, the Song template's planner is noticed (the score
 * is then kept as the user's), stale lyrics are not overwritten, and Apply writes them back.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { type App, createApp, h, nextTick } from 'vue'

import type { Fetcher, GuideNote, ScoreOperation } from '../src/api/client'
import { feeds, lyricsOwner, lyricsTargetOf, writeLyrics } from '../src/extension/lyricsOwner'
import type { ComfyNode } from '../src/shared/comfy'
import type { ScoreModelView, ScoreView } from '../src/shared/scoreView'
import type { SheetPayload, WorkingDoc } from '../src/shared/sheetSession'
import { parseState, serializeState } from '../src/shared/sheetState'
import ScoreTab from '../src/sheet-editor/score/ScoreTab.vue'
import type { LyricsTarget } from '../src/sheet-editor/score/lyricsFollow'
import { defaultPrefs, savePrefs } from '../src/sheet-editor/score/prefs'
import fixture from './fixtures/tricky-score.json'

const LYRICS = '[Intro]\n\n[Verse]\nverse a\n\n[Chorus]\nchorus a\nchorus b'

/** A node of a fake graph: inputs linked to other nodes by name. */
function node(id: number, type: string, inputs: Record<string, ComfyNode | null> = {}, state?: string): ComfyNode {
  const names = Object.keys(inputs)
  const widgets = state === undefined ? [] : [{ name: 'sheet_state', type: 'PLENIO_SHEET_STATE', value: state, options: {} }]
  return {
    id,
    type,
    comfyClass: type,
    title: type === 'PlenioSongSheet' ? `Sheet ${id}` : type,
    properties: {},
    widgets,
    inputs: names.map((name) => ({ name, link: inputs[name] ? id * 100 + names.indexOf(name) : null })),
    getInputNode: (slot: number) => inputs[names[slot]] ?? null,
    addDOMWidget: () => widgets[0]
  } as unknown as ComfyNode
}

const empty = serializeState({ schema: 'plenio.sheet_state/1', docs: {} })
const textPayload = (upstream: string): SheetPayload =>
  ({ docs: { lyrics: { state: 'auto', status: 'auto', upstream, upstream_sha256: 'abc123', text: upstream, reason: '' } } }) as unknown as SheetPayload

describe('the owner of the context lyrics', () => {
  it('is the Song Sheet linked to context_lyrics, and the Song template plans the score from it', () => {
    const text = node(6, 'PlenioSongSheet', {}, empty)
    const plan = node(7, 'Plan', { lyrics: text })
    const tools = node(8, 'PlenioScoreTools', { score: plan })
    const song = node(9, 'PlenioSongSheet', { score: tools, context_lyrics: text }, empty)
    expect(lyricsOwner(song)).toBe(text)
    expect(feeds(text, song, 'score')).toBe(true)
    // the DAW template: a new score from the brief - the lyrics do not plan it
    const daw = node(10, 'PlenioSongSheet', { score: node(11, 'PlenioScoreTools', {}), context_lyrics: text }, empty)
    expect(feeds(text, daw, 'score')).toBe(false)
    // no Song Sheet behind context_lyrics: nothing to write to
    expect(lyricsOwner(node(12, 'PlenioSongSheet', { context_lyrics: node(13, 'Reroute') }, empty))).toBeNull()
  })

  it('may be written only while its lyrics are what the last run showed', () => {
    const text = node(6, 'PlenioSongSheet', {}, empty)
    const daw = node(9, 'PlenioSongSheet', { context_lyrics: text }, empty)
    const payload = { context: { lyrics: LYRICS } } as unknown as SheetPayload
    const fresh = lyricsTargetOf(daw, payload, () => textPayload(LYRICS))
    expect(fresh?.target).toEqual({ title: 'Sheet 6', blocked: null, replans: false })
    const stale = lyricsTargetOf(daw, payload, () => textPayload(`${LYRICS}\nnew line`))
    expect(stale?.target.blocked).toContain('changed after the last run')
    expect(lyricsTargetOf(daw, null, () => null)).toBeNull() // not run yet: no lyrics to follow
  })

  it('takes the arranged lyrics as an edit of its draft', () => {
    const text = node(6, 'PlenioSongSheet', {}, empty)
    writeLyrics(text, `${LYRICS}\n\n[Chorus]\nchorus a\nchorus b`, textPayload(LYRICS))
    const state = parseState(text.widgets?.[0].value)
    expect(state?.docs.lyrics).toEqual({ state: 'edited', text: `${LYRICS}\n\n[Chorus]\nchorus a\nchorus b`, base_sha256: 'abc123' })
  })
})

// --- the Score tab: the lyrics follow an arrangement, also through undo ---------------------------

const VIEW = fixture.view as unknown as ScoreView
const MODEL = VIEW.model as ScoreModelView
/** The tricky score with its chorus (bars 6-7) duplicated: what the backend returns for [1, 2, 3, 3]. */
const ARRANGED: ScoreModelView = {
  ...MODEL,
  total: MODEL.total + 64,
  measures: [...MODEL.measures, ...MODEL.measures.slice(5).map((m, i) => ({ ...m, n: 8 + i, onset: 224 + 32 * i }))],
  sections: [...MODEL.sections, { label: 'chorus', first_bar: 8, bars: 2, implicit: false }]
}

let app: App | null = null
afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
})

describe('ScoreTab: the lyrics follow the sections', () => {
  beforeEach(() => {
    window.localStorage.clear()
    savePrefs({ ...defaultPrefs() })
  })

  async function mountTab(target: LyricsTarget) {
    const sent: ScoreOperation[] = []
    const fetcher: Fetcher = {
      fetchApi: (route: string, init?: RequestInit) => {
        if (route.includes('/transform')) sent.push(JSON.parse(String(init?.body)).operation)
        const body = route.includes('/transform')
          ? { abc: `${fixture.abc}\n% arranged\n`, changes: ['sections copied chorus'], warnings: [], select: [], time_map: [[0, 224, 0], [160, 224, 224]], analysis: { ...VIEW, model: ARRANGED } }
          : route.includes('/analyze')
            ? VIEW
            : route.includes('/lyrics')
              ? { sections: [] }
              : {}
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) } as Response)
      }
    }
    const followed: (string | null)[] = []
    const host = document.createElement('div')
    document.body.appendChild(host)
    const doc: WorkingDoc = { kind: 'score', text: fixture.abc, intent: 'keep' }
    app = createApp({
      render: () =>
        h(ScoreTab, {
          doc,
          fetcher,
          payload: null,
          readonly: false,
          layoutDefault: 'review',
          lyrics: LYRICS,
          title: 'Song',
          guide: [] as GuideNote[],
          lyricsTarget: target,
          onLyricsFollow: (text: string | null) => followed.push(text)
        })
    })
    app.mount(host)
    for (let i = 0; i < 4; i++) {
      await new Promise((resolve) => setTimeout(resolve, 0))
      await nextTick()
    }
    return { host, sent, followed }
  }

  async function duplicateChorus(host: HTMLElement): Promise<void> {
    ;([...host.querySelectorAll('.section-head')][2] as HTMLElement).click()
    await nextTick()
    ;([...host.querySelectorAll('.section-actions button')].find((b) => b.textContent?.trim() === 'Duplicate') as HTMLButtonElement).click()
    for (let i = 0; i < 4; i++) {
      await new Promise((resolve) => setTimeout(resolve, 0))
      await nextTick()
    }
  }

  it('arranges the lyrics like the score and says what Apply will do', async () => {
    const { host, sent, followed } = await mountTab({ title: 'Song Sheet · Text', blocked: null, replans: true })
    expect(followed.at(-1)).toBe(LYRICS)
    expect(host.querySelector('.lyrics-follow')?.textContent).toContain('arranges the lyrics in Song Sheet · Text the same way')
    await duplicateChorus(host)
    expect(sent.at(-1)).toEqual({ op: 'arrange_sections', order: [1, 2, 3, 3] })
    expect(followed.at(-1)).toBe(`${LYRICS}\n\n[Chorus]\nchorus a\nchorus b`)
    const panel = host.querySelector('.lyrics-follow')?.textContent ?? ''
    expect(panel).toContain('Intro · Verse · Chorus · Chorus')
    expect(panel).toContain('kept as yours (manual)')
    // undo brings the lyrics back with the text
    host.querySelector('.score-tab')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true, cancelable: true }))
    for (let i = 0; i < 4; i++) {
      await new Promise((resolve) => setTimeout(resolve, 0))
      await nextTick()
    }
    expect(followed.at(-1)).toBe(LYRICS)
  })

  it('says why the lyrics cannot follow', async () => {
    const { host } = await mountTab({ title: 'Song Sheet · Text', blocked: 'The lyrics in Song Sheet · Text changed after the last run.', replans: false })
    const box = host.querySelector('.lyrics-follow') as HTMLElement
    expect(box.textContent).toContain('changed after the last run')
    expect((box.querySelector('input') as HTMLInputElement).disabled).toBe(true)
  })
})

// --- the dialog: Apply hands the arranged lyrics out and keeps the score as the user's -------------

describe('SheetDialog: Apply with the lyrics following', () => {
  beforeEach(() => {
    window.localStorage.clear()
    savePrefs({ ...defaultPrefs() })
  })

  it('emits the arranged lyrics and keeps a replanned score as manual', async () => {
    const { default: SheetDialog } = await import('../src/sheet-editor/SheetDialog.vue')
    const payload = {
      schema: 'plenio.sheet_payload/1',
      owned: ['score'],
      docs: { score: { state: 'auto', status: 'auto', upstream: fixture.abc, upstream_sha256: 'f'.repeat(64), text: fixture.abc, reason: '' } },
      context: { lyrics: LYRICS },
      findings: [],
      fingerprint: 'x',
      review: 'continue',
      approved: false,
      waiting: false,
      status: 'ok',
      planning_mode: 'melody',
      score_seconds: 18.7,
      validation: null,
      engine: null,
      instrumental: false
    } as unknown as SheetPayload
    const fetcher: Fetcher = {
      fetchApi: (route: string) => {
        const body = route.includes('/transform')
          ? { abc: `${fixture.abc}\n% arranged\n`, changes: ['sections copied chorus'], warnings: [], select: [], time_map: [[0, 224, 0], [160, 224, 224]], analysis: { ...VIEW, model: ARRANGED } }
          : route.includes('/analyze')
            ? VIEW
            : route.includes('/resolve')
              ? payload
              : route.includes('/lyrics')
                ? { sections: [] }
                : {}
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) } as Response)
      }
    }
    const applied: unknown[][] = []
    const host = document.createElement('div')
    document.body.appendChild(host)
    app = createApp({
      render: () =>
        h(SheetDialog, {
          title: 'Song Sheet · Score',
          state: { schema: 'plenio.sheet_state/1', docs: {} },
          payload,
          owned: ['score'],
          review: 'continue',
          fetcher,
          layout: 'review',
          guide: [],
          lyricsTarget: { title: 'Song Sheet · Text', blocked: null, replans: true },
          onApply: (...args: unknown[]) => applied.push(args),
          onClose: () => undefined
        })
    })
    app.mount(host)
    for (let i = 0; i < 6; i++) {
      await new Promise((resolve) => setTimeout(resolve, 0))
      await nextTick()
    }
    ;([...host.querySelectorAll('.section-head')][2] as HTMLElement).click()
    await nextTick()
    ;([...host.querySelectorAll('.section-actions button')].find((b) => b.textContent?.trim() === 'Duplicate') as HTMLButtonElement).click()
    for (let i = 0; i < 6; i++) {
      await new Promise((resolve) => setTimeout(resolve, 0))
      await nextTick()
    }
    ;(host.querySelector('button.primary') as HTMLButtonElement).click()
    expect(applied).toHaveLength(1)
    const [state, , lyrics] = applied[0] as [{ docs: Record<string, { state: string }> }, unknown, string]
    expect(lyrics).toBe(`${LYRICS}\n\n[Chorus]\nchorus a\nchorus b`)
    expect(state.docs.score.state).toBe('manual')
  })
})
