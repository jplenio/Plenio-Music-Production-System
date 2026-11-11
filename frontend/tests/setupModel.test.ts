import { describe, expect, it } from 'vitest'

import { lacksFile } from '../src/extension/modelChoice'
import { templateUrl } from '../src/extension/setupTab'
import {
  type DownloadView,
  type PickView,
  type PlanView,
  type SetupState,
  type VariantView,
  accessSteps,
  formatBytes,
  formatSeconds,
  planRows,
  planTotals,
  rowView,
  shouldOpen,
  startStep,
  testView,
  wantedTemplates
} from '../src/setup/model'

function variant(id: string, bytes: number, extra: Partial<VariantView> = {}): VariantView {
  return {
    id,
    file: `${id}.safetensors`,
    bytes,
    licence: 'Apache-2.0',
    non_commercial: false,
    role: '',
    gated: false,
    manual_approval: false,
    quality: 1,
    speed: 1,
    vram_min_gib: 0,
    vram_full_gib: 0,
    basis: 'estimate',
    measured: false,
    installed: false,
    ...extra
  }
}

function pick(component: string, variants: VariantView[], extra: Partial<PickView> = {}): PickView {
  return {
    component,
    title: component.toUpperCase(),
    folder: 'checkpoints',
    optional: false,
    file: variants[0].file,
    variant: variants[0].id,
    installed: variants[0].installed,
    reason: '16.0 GB of graphics memory: runs on the card',
    warning: '',
    better: null,
    download_bytes: variants[0].installed ? 0 : variants[0].bytes,
    variants,
    ...extra
  }
}

const SONG = '1 · YuE2 · Song'
const MINIMAX = '3 · MiniMax · Song'
const PLAN: Pick<PlanView, 'templates'> = {
  templates: [
    {
      template: SONG,
      ready: false,
      download_bytes: 7e9,
      licences: [],
      warnings: [],
      picks: [
        pick('yue2', [variant('yue2-a', 7e9, { non_commercial: true }), variant('yue2-b', 4e9)]),
        pick('flux2-klein', [variant('flux', 8e9)], { optional: true }),
        pick('stems', [variant('stems', 6e8, { installed: true })], { optional: true })
      ]
    },
    {
      template: MINIMAX,
      ready: true,
      download_bytes: 0,
      licences: [],
      warnings: [],
      picks: [pick('minimax-dit', [variant('mm', 5e9, { installed: true })])]
    }
  ]
}

function state(extra: Partial<SetupState> = {}): SetupState {
  return { step: 'computer', templates: [], extras: [], opened_for: '', done: false, ...extra }
}

function download(state: string, extra: Partial<DownloadView> = {}): DownloadView {
  return {
    id: 'yue2-a',
    title: 'YuE2',
    file: 'yue2-a.safetensors',
    state,
    bytes: 4e9,
    done: 1e9,
    speed: 5e7,
    seconds_left: 60,
    refusal: null,
    ...extra
  }
}

describe('the plan of the templates the user wants', () => {
  it('plans the first song when nothing is chosen', () => {
    expect(wantedTemplates(state())).toEqual([SONG])
    expect(wantedTemplates(state({ templates: [MINIMAX] }))).toEqual([MINIMAX])
  })

  it('takes the needed files, and the optional ones only when wanted', () => {
    expect(planRows(PLAN, [SONG], []).map((r) => r.component)).toEqual(['yue2'])
    expect(planRows(PLAN, [SONG], ['cover-art']).map((r) => r.component)).toEqual(['yue2', 'flux2-klein'])
    expect(planRows(PLAN, [SONG, MINIMAX], ['stems']).map((r) => r.component)).toEqual(['yue2', 'stems', 'minimax-dit'])
  })

  it('follows the user choice of another file and says so', () => {
    const [row] = planRows(PLAN, [SONG], [], { yue2: 'yue2-b' })
    expect(row.variant.id).toBe('yue2-b')
    expect(row.planned).toBe('yue2-a')
    expect(row.reason).toBe('your choice')
    expect(row.variants).toHaveLength(2)
  })

  it('counts what is still to fetch and names the non-commercial licences', () => {
    const totals = planTotals(planRows(PLAN, [SONG, MINIMAX], ['stems']))
    expect(totals).toEqual({ files: 1, bytes: 7e9, nonCommercial: ['YUE2'] })
  })
})

describe('a download row', () => {
  it('shows every state with its actions', () => {
    expect(rowView(true, undefined)).toMatchObject({ status: 'Installed ✓', actions: [], tone: 'ok' })
    expect(rowView(false, undefined)).toMatchObject({ status: 'Not installed', actions: ['download'] })
    expect(rowView(false, download('queued'))).toMatchObject({ status: 'Waiting', actions: ['cancel'] })
    const loading = rowView(false, download('downloading'))
    expect(loading).toMatchObject({ status: 'Downloading', actions: ['pause', 'cancel'], progress: 0.25 })
    expect(loading.detail).toBe('1.0 GB of 4.0 GB · 50 MB/s · 1 min 0 s left')
    expect(rowView(false, download('paused'))).toMatchObject({ status: 'Paused', actions: ['resume', 'cancel'] })
    expect(rowView(false, download('verifying'))).toMatchObject({ status: 'Checking the file', actions: [] })
    expect(rowView(false, download('installed'))).toMatchObject({ status: 'Installed ✓' })
    expect(rowView(false, download('cancelled'))).toMatchObject({ status: 'Not installed', actions: ['download'] })
  })

  it('leads a gated file to the access dialog and other refusals to trying again', () => {
    const gated = download('blocked', { refusal: { kind: 'gated', message: 'Accept the terms.', fix: 'Open the page.' } })
    expect(rowView(false, gated)).toMatchObject({ status: 'Needs you', actions: ['access', 'retry'], tone: 'warn' })
    expect(rowView(false, gated).detail).toBe('Accept the terms. Open the page.')
    const disk = download('blocked', { refusal: { kind: 'disk', message: 'The disk is full.', fix: '' } })
    expect(rowView(false, disk).actions).toEqual(['retry'])
    const damaged = download('failed', { refusal: { kind: 'damaged', message: 'The download was damaged.', fix: '' } })
    expect(rowView(false, damaged)).toMatchObject({ status: 'Failed', actions: ['retry'], tone: 'error' })
  })
})

describe('when Setup opens and where', () => {
  it('opens once per version and only when a wanted template lacks files', () => {
    expect(shouldOpen(state(), '2.0.0', PLAN)).toBe(true)
    expect(shouldOpen(state({ opened_for: '2.0.0' }), '2.0.0', PLAN)).toBe(false)
    expect(shouldOpen(state({ templates: [MINIMAX] }), '2.0.0', PLAN)).toBe(false)
  })

  it('starts where the user left, past the waiting steps when everything is there', () => {
    const installed = planRows(PLAN, [MINIMAX], [])
    expect(startStep(state({ step: 'plan' }), installed)).toBe('test')
    expect(startStep(state({ step: 'plan' }), planRows(PLAN, [SONG], []))).toBe('plan')
    expect(startStep(state({ step: 'wants', done: true }), installed)).toBe('go')
  })

  it('marks the access steps from the check', () => {
    expect(accessSteps(null)).toEqual({ accept: null, token: null, pending: false })
    expect(accessSteps({ variant: 'v', step: 'accept', message: '', fix: '' }).accept).toBe(false)
    expect(accessSteps({ variant: 'v', step: 'token', message: '', fix: '' }).token).toBe(false)
    expect(accessSteps({ variant: 'v', step: 'pending', message: '', fix: '' }).pending).toBe(true)
    expect(accessSteps({ variant: 'v', step: 'ready', message: '', fix: '' })).toEqual({ accept: true, token: true, pending: false })
  })
})

describe('words and numbers', () => {
  it('writes sizes and times as the backend does', () => {
    expect(formatBytes(24.1e9)).toBe('24.1 GB')
    expect(formatBytes(217e6)).toBe('217 MB')
    expect(formatSeconds(3725)).toBe('1 h 2 min')
    expect(formatSeconds(null)).toBe('')
  })
})

describe('the open workflow and its files', () => {
  const info = { folder: 'checkpoints', files: { 'mine.safetensors': null }, pick: null }
  it('lacks a file when auto has nothing installed or a chosen file is gone', () => {
    expect(lacksFile('auto', { ...info, pick: { file: 'x', installed: false } as never })).toBe(true)
    expect(lacksFile('auto', { ...info, pick: { file: 'x', installed: true } as never })).toBe(false)
    expect(lacksFile('mine.safetensors', info)).toBe(false)
    expect(lacksFile('gone.safetensors', info)).toBe(true)
    expect(lacksFile('auto', undefined)).toBe(false)
  })

  it('finds a template among the ones ComfyUI serves for custom nodes', async () => {
    const fetcher = {
      fetchApi: async () => new Response(JSON.stringify({ other: ['x'], 'Plenio-Music-Production-System': [SONG] }))
    }
    expect(await templateUrl(fetcher, SONG)).toBe(
      `/workflow_templates/Plenio-Music-Production-System/${encodeURIComponent(SONG)}.json`
    )
    expect(await templateUrl(fetcher, 'nothing')).toBeNull()
  })
})

describe('the test song', () => {
  it('follows the job and offers the take when it works', () => {
    expect(testView(null).state).toBe('idle')
    expect(testView({ id: 'j', status: 'running', stage: { text: '5 · RENDER' } }).text).toBe('Making the test song - 5 · RENDER')
    const done = testView({
      id: 'j',
      status: 'succeeded',
      started_at: 100,
      finished_at: 172,
      result: { files: [{ name: 'a.json', url: '/x/a.json' }, { name: 'Setup test.flac', url: '/x/Setup test.flac' }] }
    })
    expect(done).toMatchObject({ state: 'ok', audio: '/x/Setup test.flac', finding: null })
    expect(done.text).toBe('It works ✓ - the test song took 1 min 12 s')
  })

  it('shows a failure as a finding, a missing model with the way to the plan', () => {
    const model = testView({ id: 'j', status: 'failed', error: { message: 'YuE2: x is not on this computer yet.', type: 'PlenioModelError', title: 'Model' } })
    expect(model.finding).toMatchObject({ id: 'test.model', fix: { label: 'Show the plan' } })
    const other = testView({ id: 'j', status: 'failed', error: { message: 'out of memory', title: 'Render' } })
    expect(other.finding).toMatchObject({ id: 'test.failed', text: 'Render: out of memory', fix: null })
    const refused = testView(null, { message: 'ComfyUI does not find the model file x.', hint: 'Put it in.' })
    expect(refused).toMatchObject({ state: 'failed', finding: { id: 'test.model', text: 'ComfyUI does not find the model file x. Put it in.' } })
  })
})

describe('Home', () => {
  it('counts the files of the wanted templates and the optional ones apart', async () => {
    const { homeModels, HOME_TEMPLATES } = await import('../src/setup/model')
    expect(homeModels(PLAN, [SONG])).toEqual({ line: '0 of 1 files for your templates · 1 optional not installed', ready: false })
    expect(homeModels(PLAN, [MINIMAX])).toEqual({ line: '1 of 1 files for your templates', ready: true })
    expect(HOME_TEMPLATES.map((t) => t.template)).toContain(SONG)
  })
})
