/**
 * Continue a song from its release record (owner's request 2026-10-11): the backend's plan applied to the
 * graph just loaded - settings by node and name (DynamicCombo children after their combo), blocks turned on,
 * Song Sheets that keep the documents - and a record dropped onto ComfyUI taken before the frontend sees it.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { type App, createApp, h, nextTick } from 'vue'

import type { Continuation, Fetcher } from '../src/api/client'
import {
  type GraphLike,
  type NodeLike,
  type WidgetLike,
  applyContinuation,
  applyValues,
  describe as describePlan,
  documentsIntoSheets,
  nodeAt,
  workflowName
} from '../src/shared/continuation'
import { droppedRecord, installRecordDrop, recordOf } from '../src/extension/continueSong'

function widget(name: string, value: unknown, log?: string[]): WidgetLike {
  const callback = log
    ? (next: unknown): void => {
        log.push(`${name}=${String(next)}`)
      }
    : undefined
  return { name, value, callback }
}

function graph(nodes: NodeLike[]): GraphLike {
  return { nodes, getNodeById: (id) => nodes.find((n) => String(n.id) === String(id)) ?? null }
}

function plan(overrides: Partial<Continuation> = {}): Continuation {
  return {
    schema: 'plenio.continuation/1',
    title: 'Harbour Lights',
    created: '2026-10-11T10:00:00+0200',
    plenio: '0.5.0',
    source: 'plenio/Harbour Lights.plenio.json',
    documents: {},
    files: [],
    workflow: { nodes: [] },
    from: 'template',
    template: '1 · YuE2 · Song',
    sheets: {},
    values: {},
    activate: [],
    unplaced: [],
    ...overrides
  }
}

describe('applying a continuation', () => {
  it('finds the node of an execution id inside a block', () => {
    const inner: NodeLike = { id: 501, type: 'PlenioComposePrompt' }
    const block: NodeLike = { id: 4, type: 'uuid', subgraph: graph([inner]) }
    const root = graph([block])
    expect(nodeAt(root, '4')).toBe(block)
    expect(nodeAt(root, '4:501')).toBe(inner)
    expect(nodeAt(root, '4:999')).toBeNull()
    expect(nodeAt(root, '7')).toBeNull()
  })

  it('sets a combo before the widgets of its option', () => {
    const log: string[] = []
    const widgets = [widget('vocals', 'instrumental'), widget('description', '', log)]
    const brief: NodeLike = { id: 2, type: 'PlenioSongBrief', widgets }
    // the option's widget appears only once its combo is set (as a DynamicCombo does)
    widgets[0].callback = (next: unknown) => {
      log.push(`vocals=${String(next)}`)
      if (next === 'sung') widgets.push(widget('vocals.language', '', log))
    }
    const missing = applyValues(brief, { 'vocals.language': 'German', vocals: 'sung', description: 'a song', unknown: 1 })
    expect(missing).toEqual(['unknown'])
    expect(log).toEqual(['vocals=sung', 'description=a song', 'vocals.language=German'])
    expect(brief.widgets?.find((w) => w.name === 'vocals.language')?.value).toBe('German')
  })

  it('turns blocks on, sets the settings and gives the Song Sheets their documents', () => {
    const state = '{"schema":"plenio.sheet_state/1","docs":{"lyrics":{"state":"manual","text":"[Verse]\\nla"}}}'
    const sheet: NodeLike = { id: 7, type: 'PlenioSongSheet', widgets: [widget('review', 'continue'), widget('sheet_state', '')] }
    const seed: NodeLike = { id: 20, type: 'SeedNode', widgets: [widget('seed', 1)] }
    const stems: NodeLike = { id: 15, type: 'uuid', mode: 4, subgraph: graph([]) }
    const root = graph([sheet, seed, stems])
    const applied = applyContinuation(root, plan({ values: { '20': { seed: 4242 }, '99': { x: 1 } }, sheets: { '7': state }, activate: ['15'] }))
    expect(applied).toEqual({ values: 1, missing: ['99: x'], sheets: 1, activated: 1 })
    expect(seed.widgets?.[0].value).toBe(4242)
    expect(sheet.widgets?.[1].value).toBe(state)
    expect(stems.mode).toBe(0)
  })

  it('puts the documents into the open workflow when the song`s workflow cannot be rebuilt', () => {
    const text: NodeLike = {
      id: 3,
      type: 'PlenioSongSheet',
      inputs: [
        { name: 'lyrics', link: 5 },
        { name: 'style', link: 6 },
        { name: 'score', link: null }
      ],
      widgets: [widget('sheet_state', '{"schema":"plenio.sheet_state/1","docs":{},"review":{"approved_fingerprint":"ab"}}')]
    }
    const other: NodeLike = { id: 4, type: 'PreviewAudio', widgets: [] }
    const count = documentsIntoSheets(graph([text, other]), { lyrics: '[Verse]\nla', style: 'pop', score: 'X:1' })
    expect(count).toBe(1)
    const state = JSON.parse(String(text.widgets?.[0].value))
    expect(state.docs).toEqual({ lyrics: { state: 'manual', text: '[Verse]\nla' }, style: { state: 'manual', text: 'pop' } })
    expect(state.review).toBeUndefined() // new documents: approved again
  })

  it('names the workflow after the record file and says what was restored', () => {
    expect(workflowName('plenio/2026-10-09 Harbour Lights.plenio.json', 'Harbour Lights')).toBe('2026-10-09 Harbour Lights')
    expect(workflowName('C:\\songs\\x.json', 'X')).toBe('x')
    expect(workflowName('', 'Harbour Lights')).toBe('Harbour Lights')
    const applied = { values: 3, missing: [], sheets: 2, activated: 0 }
    expect(describePlan(plan({ from: 'record' }), applied)).toContain('opened in the workflow it was made with (Plenio 0.5.0, 2026-10-11)')
    const old = describePlan(plan({ unplaced: ['Gone since'] }), applied)
    expect(old).toContain('today\'s template "1 · YuE2 · Song"')
    expect(old).toContain('kept in the Song Sheets (manual)')
    expect(old).toContain('1 node(s) of the song have no place')
    expect(describePlan(plan({ from: 'none', workflow: null }), null)).toContain('cannot be rebuilt')
  })
})

describe('a dropped release record', () => {
  const record = { schema: 'plenio.record/1', title: 'Harbour Lights' }
  const file = (name: string, data: unknown) => new File([JSON.stringify(data)], name, { type: 'application/json' })

  it('is recognised by its name and read by its schema', async () => {
    const drop = (files: File[]) => ({ dataTransfer: { files } }) as unknown as DragEvent
    expect(droppedRecord(drop([file('Harbour Lights.plenio.json', record)]))?.name).toBe('Harbour Lights.plenio.json')
    expect(droppedRecord(drop([file('workflow.json', record)]))).toBeNull() // ComfyUI's own files stay ComfyUI's
    expect(droppedRecord(drop([file('a.plenio.json', record), file('b.plenio.json', record)]))).toBeNull()
    expect(await recordOf(file('Harbour Lights.plenio.json', record))).toEqual(record)
    expect(await recordOf(file('workflow.json', { nodes: [] }))).toBeNull()
  })

  it('opens its song before the frontend sees the drop; other drops pass', async () => {
    const loaded: unknown[] = []
    const root = graph([])
    const host = {
      app: {
        registerExtension: () => undefined,
        get graph() {
          return root
        },
        loadGraphData: async (data: unknown) => {
          loaded.push(data)
        },
        extensionManager: { toast: { add: vi.fn() } }
      },
      fetcher: {
        fetchApi: vi.fn(async () => ({ ok: true, status: 200, json: async () => plan({ workflow: { nodes: [], marker: 1 } }) }) as unknown as Response)
      } satisfies Fetcher
    }
    const target = new EventTarget() as unknown as Window
    const remove = installRecordDrop(host, target)
    const later = vi.fn()
    target.addEventListener('drop', later)
    const event = (name: string) => {
      const drop = new Event('drop', { cancelable: true }) as DragEvent
      Object.defineProperty(drop, 'dataTransfer', { value: { files: [file(name, record)] } })
      return drop
    }
    const ours = event('Harbour Lights.plenio.json')
    target.dispatchEvent(ours)
    expect(ours.defaultPrevented).toBe(true)
    expect(later).not.toHaveBeenCalled() // the frontend's handler never sees it
    await vi.waitFor(() => expect(loaded).toEqual([{ nodes: [], marker: 1 }]))
    const [route, init] = host.fetcher.fetchApi.mock.calls[0] as unknown as [string, RequestInit]
    expect(route).toBe('/plenio/records/continue')
    const body = JSON.parse(String(init.body))
    expect(body).toEqual({ record, name: 'Harbour Lights.plenio.json' })
    expect(host.app.extensionManager.toast.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success', summary: 'Song opened' }))
    const theirs = event('workflow.json')
    target.dispatchEvent(theirs)
    expect(theirs.defaultPrevented).toBe(false)
    expect(later).toHaveBeenCalledTimes(1)
    remove()
  })
})

describe('the Continue a song dialog', () => {
  let app: App | null = null
  afterEach(() => {
    app?.unmount()
    app = null
    document.body.innerHTML = ''
  })

  async function settle(): Promise<void> {
    for (let i = 0; i < 6; i++) {
      await new Promise((resolve) => setTimeout(resolve, 0))
      await nextTick()
    }
  }

  it('lists the songs newest first, filters them and continues the one picked', async () => {
    const rows = [
      { path: 'plenio/Harbour Lights.plenio.json', title: 'Harbour Lights', created: '2026-10-11T10:00:00+0200', plenio: '0.5.1', seconds: 92.5, audio: 'plenio/Harbour Lights.flac', cover: 'plenio/Harbour Lights.jpg', workflow: true },
      { path: 'plenio/old/Paper Moon.plenio.json', title: 'Paper Moon', created: '2026-09-25T08:00:00+0200', plenio: '0.3.0', seconds: 61, audio: null, cover: null, workflow: false }
    ]
    const fetcher: Fetcher = {
      fetchApi: async () => ({ ok: true, status: 200, json: async () => ({ records: rows }) }) as unknown as Response,
      apiURL: (route: string) => `/api${route}`
    }
    const picked: unknown[] = []
    const closed = vi.fn()
    const { default: ContinueDialog } = await import('../src/continue/ContinueDialog.vue')
    const host = document.createElement('div')
    document.body.append(host)
    app = createApp({ render: () => h(ContinueDialog, { fetcher, onContinue: async (request: unknown) => void picked.push(request), onClose: closed }) })
    app.mount(host)
    await settle()
    const titles = () => [...host.querySelectorAll('.row .title')].map((e) => e.textContent)
    expect(titles()).toEqual(['Harbour Lights', 'Paper Moon'])
    expect(host.querySelector('.row .meta')?.textContent).toContain('2026-10-11 10:00 · 1:33 · Plenio 0.5.1 · plenio/')
    expect(host.querySelector('.row img.cover')?.getAttribute('src')).toBe('/api/view?filename=Harbour+Lights.jpg&subfolder=plenio&type=output')
    const search = host.querySelector('input[type=search]') as HTMLInputElement
    search.value = 'moon'
    search.dispatchEvent(new Event('input'))
    await settle()
    expect(titles()).toEqual(['Paper Moon'])
    ;(host.querySelector('.row button.primary') as HTMLButtonElement).click()
    await settle()
    expect(picked).toEqual([{ path: 'plenio/old/Paper Moon.plenio.json' }])
    expect(closed).toHaveBeenCalled()
  })

  it('says why a song could not be opened and stays open', async () => {
    const fetcher: Fetcher = {
      fetchApi: async () => ({ ok: true, status: 200, json: async () => ({ records: [{ path: 'a.plenio.json', title: 'A', created: '', plenio: '', seconds: null, audio: null, cover: null, workflow: false }] }) }) as unknown as Response
    }
    const closed = vi.fn()
    const { default: ContinueDialog } = await import('../src/continue/ContinueDialog.vue')
    const host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      render: () =>
        h(ContinueDialog, {
          fetcher,
          onContinue: async () => {
            throw new Error('The record does not exist (any more).')
          },
          onClose: closed
        })
    })
    app.mount(host)
    await settle()
    ;(host.querySelector('.row button.primary') as HTMLButtonElement).click()
    await settle()
    expect(host.querySelector('.error')?.textContent).toContain('does not exist')
    expect(closed).not.toHaveBeenCalled()
  })
})
