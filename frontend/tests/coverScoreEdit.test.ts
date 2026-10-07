/**
 * A cover's text sheet edits the score it shows (owner's request 2026-10-02): the score sheet is found
 * through ``context_score``, a score changed there since the last run is not overwritten, Apply writes
 * the edited score back (edited against the transcription), Approve also approves it in that sheet, and
 * the lyrics shown with it are kept as manual - the two stay a pair.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { type App, createApp, h, nextTick } from 'vue'

import type { Fetcher } from '../src/api/client'
import { scoreOwner, scoreTargetOf, writeScore } from '../src/extension/lyricsOwner'
import type { ComfyNode } from '../src/shared/comfy'
import type { ScoreModelView, ScoreView } from '../src/shared/scoreView'
import type { ScoreChange, SheetPayload } from '../src/shared/sheetSession'
import { type SheetState, parseState, serializeState } from '../src/shared/sheetState'
import { defaultPrefs, savePrefs } from '../src/sheet-editor/score/prefs'
import fixture from './fixtures/tricky-score.json'

const ABC = fixture.abc
const LYRICS = '[Intro]\n\n[Verse]\nverse a\n\n[Chorus]\nchorus a\nchorus b'
const empty = serializeState({ schema: 'plenio.sheet_state/1', docs: {} })

/** A node of a fake graph: inputs linked to other nodes by name. */
function node(id: number, type: string, inputs: Record<string, ComfyNode | null> = {}, state?: string): ComfyNode {
  const names = Object.keys(inputs)
  const widgets: { name: string; type: string; value: unknown; options: object }[] = [
    { name: 'review', type: 'combo', value: 'stop for review', options: {} }
  ]
  if (state !== undefined) widgets.push({ name: 'sheet_state', type: 'PLENIO_SHEET_STATE', value: state, options: {} })
  return {
    id,
    type,
    comfyClass: type,
    title: type === 'PlenioSongSheet' ? `Song Sheet ${id}` : type,
    properties: {},
    widgets,
    inputs: names.map((name) => ({ name, link: inputs[name] ? id * 100 : null })),
    getInputNode: (slot: number) => inputs[names[slot]] ?? null,
    addDOMWidget: () => widgets[0]
  } as unknown as ComfyNode
}

const scorePayload = (upstream: string): SheetPayload =>
  ({
    owned: ['score'],
    review: 'stop for review',
    engine: null,
    instrumental: false,
    context: {},
    docs: { score: { state: 'auto', status: 'auto', upstream, upstream_sha256: 'c'.repeat(64), text: upstream, reason: '' } }
  }) as unknown as SheetPayload
const stateOf = (sheet: ComfyNode): SheetState | null => parseState(sheet.widgets?.find((w) => w.name === 'sheet_state')?.value)

describe('the score sheet behind a cover text sheet', () => {
  it('is found through context_score and may be written only while its score is the one shown', () => {
    const scoreSheet = node(5, 'PlenioSongSheet', {}, empty)
    const textSheet = node(10, 'PlenioSongSheet', { context_score: scoreSheet }, empty)
    expect(scoreOwner(textSheet)).toBe(scoreSheet)
    const shown = { context: { score: ABC } } as unknown as SheetPayload
    expect(scoreTargetOf(textSheet, shown, () => scorePayload(ABC))?.target).toEqual({ title: 'Song Sheet 5', blocked: null })
    const later = scoreTargetOf(textSheet, shown, () => scorePayload(`${ABC}% edited later\n`))
    expect(later?.target.blocked).toContain('changed after the last run')
    expect(scoreTargetOf(textSheet, null, () => null)).toBeNull() // not run yet: no score shown
  })

  it('takes the edited score as an edit of the transcription, approved when Approve was pressed', async () => {
    const edited = `${ABC}% arranged\n`
    const plain = node(5, 'PlenioSongSheet', {}, empty)
    await writeScore(plain, edited, scorePayload(ABC))
    expect(stateOf(plain)?.docs.score).toEqual({ state: 'edited', text: edited.trimEnd(), base_sha256: 'c'.repeat(64) }) // stored normalised
    expect(stateOf(plain)?.review).toBeUndefined()

    const asked: Record<string, unknown>[] = []
    const fetcher = (findings: unknown[]): Fetcher => ({
      fetchApi: (route: string, init?: RequestInit) => {
        asked.push(JSON.parse(String(init?.body)))
        const body = route.includes('/resolve') ? { fingerprint: 'f'.repeat(64), findings } : {}
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) } as Response)
      }
    })
    const approved = node(6, 'PlenioSongSheet', {}, empty)
    await writeScore(approved, edited, scorePayload(ABC), { fetcher: fetcher([]) })
    expect(stateOf(approved)?.review).toEqual({ approved_fingerprint: 'f'.repeat(64) })
    expect(asked[0]).toMatchObject({ owned: ['score'], review: 'stop for review' })
    // an invalid score is written but not approved: that sheet stops and says why
    const refused = node(7, 'PlenioSongSheet', {}, empty)
    await writeScore(refused, edited, scorePayload(ABC), {
      fetcher: fetcher([{ severity: 'error', message: 'bad', where: 'score' }])
    })
    expect(stateOf(refused)?.docs.score?.text).toBe(edited.trimEnd())
    expect(stateOf(refused)?.review).toBeUndefined()
  })
})

// --- the cover's text sheet: its editor edits the score and keeps the lyrics with it --------------

const VIEW = fixture.view as unknown as ScoreView
const MODEL = VIEW.model as ScoreModelView
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

async function settle(times = 6): Promise<void> {
  for (let i = 0; i < times; i++) {
    await new Promise((resolve) => setTimeout(resolve, 0))
    await nextTick()
  }
}

describe('SheetDialog: a cover text sheet edits the score it shows', () => {
  beforeEach(() => {
    window.localStorage.clear()
    savePrefs({ ...defaultPrefs() })
  })

  async function mountText(blocked: string | null = null, arrangement: Record<string, unknown> | null = null) {
    const { default: SheetDialog } = await import('../src/sheet-editor/SheetDialog.vue')
    const resolves: Record<string, unknown>[] = []
    const payload = {
      schema: 'plenio.sheet_payload/1',
      owned: ['lyrics'],
      docs: { lyrics: { state: 'auto', status: 'auto', upstream: LYRICS, upstream_sha256: 'a'.repeat(64), text: LYRICS, reason: '' } },
      context: { score: ABC },
      findings: [],
      fingerprint: 'x',
      review: 'stop for review',
      approved: false,
      waiting: true,
      status: 'waiting',
      planning_mode: 'melody',
      score_seconds: 18.7,
      validation: null,
      engine: null,
      instrumental: false,
      ...(arrangement ? { arrangement } : {})
    } as unknown as SheetPayload
    const fetcher: Fetcher = {
      fetchApi: (route: string, init?: RequestInit) => {
        const sent = JSON.parse(String(init?.body ?? '{}'))
        if (route.includes('/resolve')) resolves.push(sent)
        const body = route.includes('/transform')
          ? { abc: `${ABC}% arranged\n`, changes: ['sections copied chorus'], warnings: [], select: [], time_map: [[0, 224, 0], [160, 224, 224]], analysis: { ...VIEW, model: ARRANGED } }
          : route.includes('/analyze')
            ? VIEW
            : route.includes('/resolve')
              ? { ...payload, fingerprint: 'e'.repeat(64), findings: [] }
              : route.includes('/lyrics')
                ? { sections: [] }
                : {}
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) } as Response)
      }
    }
    const applied: [SheetState, unknown, string | null, ScoreChange | null][] = []
    const host = document.createElement('div')
    document.body.appendChild(host)
    app = createApp({
      render: () =>
        h(SheetDialog, {
          title: 'Song Sheet · Text',
          state: { schema: 'plenio.sheet_state/1', docs: {} },
          payload,
          owned: ['lyrics'],
          review: 'stop for review',
          fetcher,
          layout: 'review',
          guide: [],
          scoreTarget: { title: 'Song Sheet · Score', blocked },
          onApply: (...args: [SheetState, unknown, string | null, ScoreChange | null]) => applied.push(args),
          onClose: () => undefined
        })
    })
    app.mount(host)
    await settle()
    // the score tab
    const scoreTab = [...host.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Score') as HTMLButtonElement
    scoreTab.click()
    await settle()
    const button = (name: string) => [...host.querySelectorAll('button')].find((b) => b.textContent?.trim() === name) as HTMLButtonElement
    return { host, applied, resolves, button }
  }

  async function duplicateChorus(host: HTMLElement): Promise<void> {
    ;([...host.querySelectorAll('.section-head')][2] as HTMLElement).click()
    await nextTick()
    ;([...host.querySelectorAll('.section-actions button')].find((b) => b.textContent?.trim() === 'Duplicate') as HTMLButtonElement).click()
    await settle()
  }

  it('edits the score, checks the lyrics against it and hands it to the score sheet on Apply', async () => {
    const { host, applied, resolves, button } = await mountText()
    expect(host.textContent).toContain('Changes to the score go into Song Sheet · Score on Apply')
    expect(host.querySelector('.section-actions')).not.toBeNull() // arranging is on: the score is editable
    await duplicateChorus(host)
    expect(host.querySelector('.doc-head .badge')?.textContent).toContain('changed')
    await new Promise((resolve) => setTimeout(resolve, 400)) // the validation follows the edit
    await settle()
    expect((resolves.at(-1)?.context as { score: string }).score).toBe(`${ABC}% arranged\n`)
    button('Apply').click()
    expect(applied).toHaveLength(1)
    const [state, , , score] = applied[0]
    expect(score).toEqual({ text: `${ABC}% arranged\n`, approved: false })
    // the lyrics follow the copied chorus and are kept as shown (manual)
    expect(state.docs.lyrics).toEqual({ state: 'manual', text: `${LYRICS}\n\n[Chorus]\nchorus a\nchorus b` })
  })

  it('approves the changed score too when Approve is pressed', async () => {
    const { host, applied, button } = await mountText()
    await duplicateChorus(host)
    button('Approve').click()
    await settle()
    expect(applied.at(-1)?.[3]).toEqual({ text: `${ABC}% arranged\n`, approved: true })
    expect(applied.at(-1)?.[0].review).toEqual({ approved_fingerprint: 'e'.repeat(64) })
  })

  it('marks a creative arrangement as experimental', async () => {
    const plan = { status: 'applied', summary: '2 of 3 sections changed', mode: 'fantasy', closeness: 50, kind: 'cover', sections: [] }
    const { host } = await mountText(null, plan)
    expect(host.querySelector('.arrangement .experimental')?.textContent).toBe('experimental')
    expect(host.querySelector('.arrangement summary')?.textContent).toContain('fantasy (song flow closeness 50)')
    expect(host.querySelector('.arrangement')?.textContent).toContain('Creative modes are experimental')
    app?.unmount()
    document.body.innerHTML = ''
    const { host: fallback } = await mountText(null, { ...plan, status: 'fallback', summary: 'not applied: no usable plan' })
    expect(fallback.querySelector('.arrangement p')?.textContent).toMatch(/Arrangement not applied\s*experimental/)
  })

  it('keeps the score read-only when it changed in its own sheet after the run', async () => {
    const { host } = await mountText('The score in Song Sheet · Score changed after the last run.')
    expect(host.textContent).toContain('changed after the last run')
    expect(host.querySelector('.section-actions')).toBeNull()
    expect(host.textContent).toContain('from the other sheet (read-only)')
  })
})
