/**
 * Plenio Setup's logic, apart from its page: the files of the templates the user wants, what each download row
 * shows and offers, and when Setup opens by itself. Pure (the page and the tests share it).
 */

export interface VariantView {
  id: string
  file: string
  bytes: number
  licence: string
  non_commercial: boolean
  role: string
  gated: boolean
  manual_approval: boolean
  quality: number
  speed: number
  vram_min_gib: number
  vram_full_gib: number
  basis: string
  measured: boolean
  installed: boolean
}

export interface PickView {
  component: string
  title: string
  folder: string
  optional: boolean
  file: string
  variant: string | null
  installed: boolean
  reason: string
  warning: string
  better: string | null
  download_bytes: number
  variants: VariantView[]
}

export interface TemplatePlan {
  template: string
  ready: boolean
  download_bytes: number
  licences: string[]
  warnings: string[]
  picks: PickView[]
}

export interface Refusal {
  kind: string
  message: string
  fix: string
  retry_after?: number
}

export interface DownloadView {
  id: string
  title: string
  file: string
  state: string
  bytes: number
  done: number
  speed: number
  seconds_left: number | null
  refusal: Refusal | null
}

export interface PlanView {
  vram_gib: number | null
  prefer: string
  pins: Record<string, string>
  templates: TemplatePlan[]
  downloads: DownloadView[]
  policy: { downloads: string; offline: boolean }
  token: boolean
}

export interface SetupState {
  step: Step
  templates: string[]
  extras: string[]
  opened_for: string
  done: boolean
}

export interface Fix {
  label: string
  action: 'download' | 'copy' | 'open_url' | 'choose_writer' | 'refresh'
  payload: Record<string, string>
}

export interface Finding {
  id: string
  severity: 'ok' | 'warning' | 'error'
  text: string
  fix: Fix | null
}

export interface FolderView {
  path: string
  free_bytes: number | null
  target: boolean
}

export const STEPS = ['computer', 'wants', 'plan', 'downloads', 'test', 'go'] as const
export type Step = (typeof STEPS)[number]
export const STEP_TITLES: Record<Step, string> = {
  computer: 'This computer',
  wants: 'What do you want?',
  plan: 'Your plan',
  downloads: 'Downloading',
  test: 'Test song',
  go: 'Go'
}

/** The template the first song is made with: what Setup plans for when nothing is chosen yet. */
export const FIRST_TEMPLATE = '1 · YuE2 · Song'

/** Optional blocks a user can want beside the templates, by the components they need. */
export const EXTRAS: { id: string; label: string; components: string[] }[] = [
  { id: 'cover-art', label: 'Cover art', components: ['flux2-klein', 'flux2-text-encoder', 'flux2-vae'] },
  { id: 'hq', label: 'HQ mastering', components: ['audio-sr'] },
  { id: 'stems', label: 'Stems', components: ['stems'] }
]

/** Decimal gigabytes as on model cards (the backend's ``size_text``). */
export function formatBytes(size: number): string {
  if (!(size > 0)) return '0 MB'
  if (size >= 1e9) return `${(size / 1e9).toFixed(1)} GB`
  return `${Math.round(size / 1e6)} MB`
}

export function formatSeconds(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds)) return ''
  const whole = Math.max(0, Math.round(seconds))
  if (whole >= 3600) return `${Math.floor(whole / 3600)} h ${Math.round((whole % 3600) / 60)} min`
  if (whole >= 60) return `${Math.floor(whole / 60)} min ${whole % 60} s`
  return `${whole} s`
}

export interface PlanRow {
  component: string
  title: string
  folder: string
  variant: VariantView
  /** Every file that can be this component, to choose from. */
  variants: VariantView[]
  /** The plan's own choice, before the user changed it. */
  planned: string | null
  reason: string
  warning: string
  templates: string[]
  optional: boolean
}

/** The templates Setup plans for: the user's choice, or the first song's template. */
export function wantedTemplates(state: Pick<SetupState, 'templates'>): string[] {
  return state.templates.length ? state.templates : [FIRST_TEMPLATE]
}

/** One row per component the chosen templates need - and the optional blocks among ``extras`` - with the plan's
 * file or the one the user chose instead (``choices``: component -> variant id). */
export function planRows(
  plan: Pick<PlanView, 'templates'>,
  templates: string[],
  extras: string[],
  choices: Record<string, string> = {}
): PlanRow[] {
  const wantedComponents = new Set(EXTRAS.filter((e) => extras.includes(e.id)).flatMap((e) => e.components))
  const rows = new Map<string, PlanRow>()
  for (const template of plan.templates) {
    if (!templates.includes(template.template)) continue
    for (const pick of template.picks) {
      if (pick.optional && !wantedComponents.has(pick.component)) continue
      const known = rows.get(pick.component)
      if (known) {
        if (!known.templates.includes(template.template)) known.templates.push(template.template)
        known.optional = known.optional && pick.optional
        continue
      }
      const chosen = choices[pick.component]
      const variant =
        pick.variants.find((v) => v.id === chosen) ??
        pick.variants.find((v) => v.id === pick.variant) ??
        null
      if (!variant) continue // a pinned file the catalogue does not know: nothing to plan
      rows.set(pick.component, {
        component: pick.component,
        title: pick.title,
        folder: pick.folder,
        variant,
        variants: pick.variants,
        planned: pick.variant,
        reason: variant.id === pick.variant ? pick.reason : 'your choice',
        warning: variant.id === pick.variant ? pick.warning : '',
        templates: [template.template],
        optional: pick.optional
      })
    }
  }
  return [...rows.values()]
}

/** What the plan still has to fetch, and its licences. */
export function planTotals(rows: PlanRow[]): { files: number; bytes: number; nonCommercial: string[] } {
  const missing = rows.filter((row) => !row.variant.installed)
  return {
    files: missing.length,
    bytes: missing.reduce((sum, row) => sum + row.variant.bytes, 0),
    nonCommercial: rows.filter((row) => row.variant.non_commercial).map((row) => row.title)
  }
}

export type RowAction = 'download' | 'pause' | 'resume' | 'cancel' | 'retry' | 'access'

export interface RowView {
  /** What the row says about the file now. */
  status: string
  /** 0..1 while bytes arrive (``null``: no bar). */
  progress: number | null
  detail: string
  actions: RowAction[]
  tone: 'ok' | 'busy' | 'warn' | 'error' | 'idle'
}

const BLOCKED_KINDS = new Set(['gated', 'pending', 'token'])

/** What one file's row shows, from its download (if any) and whether it is installed. */
export function rowView(installed: boolean, download: DownloadView | undefined): RowView {
  if (download?.state === 'installed' || (installed && !download)) {
    return { status: 'Installed ✓', progress: null, detail: 'verified', actions: [], tone: 'ok' }
  }
  if (!download || download.state === 'cancelled') {
    return { status: 'Not installed', progress: null, detail: '', actions: ['download'], tone: 'idle' }
  }
  const part = download.bytes > 0 ? Math.min(1, download.done / download.bytes) : 0
  const amount = `${formatBytes(download.done)} of ${formatBytes(download.bytes)}`
  switch (download.state) {
    case 'queued':
      return { status: 'Waiting', progress: part, detail: amount, actions: ['cancel'], tone: 'busy' }
    case 'downloading': {
      const speed = download.speed > 0 ? ` · ${formatBytes(download.speed)}/s` : ''
      const left = download.seconds_left !== null ? ` · ${formatSeconds(download.seconds_left)} left` : ''
      return { status: 'Downloading', progress: part, detail: `${amount}${speed}${left}`, actions: ['pause', 'cancel'], tone: 'busy' }
    }
    case 'paused':
      return { status: 'Paused', progress: part, detail: amount, actions: ['resume', 'cancel'], tone: 'idle' }
    case 'verifying':
      return { status: 'Checking the file', progress: 1, detail: 'size and SHA-256', actions: [], tone: 'busy' }
    case 'blocked': {
      const refusal = download.refusal
      const actions: RowAction[] = refusal && BLOCKED_KINDS.has(refusal.kind) ? ['access', 'retry'] : ['retry']
      return { status: 'Needs you', progress: part || null, detail: refusalText(refusal), actions, tone: 'warn' }
    }
    case 'failed':
      return { status: 'Failed', progress: null, detail: refusalText(download.refusal), actions: ['retry'], tone: 'error' }
    default:
      return { status: download.state, progress: part, detail: amount, actions: [], tone: 'idle' }
  }
}

function refusalText(refusal: Refusal | null): string {
  if (!refusal) return ''
  return refusal.fix ? `${refusal.message} ${refusal.fix}` : refusal.message
}

/** Setup opens by itself once per installed version, and only when a wanted template lacks files. */
export function shouldOpen(state: SetupState, version: string, plan: Pick<PlanView, 'templates'>): boolean {
  if (state.opened_for === version) return false
  const wanted = wantedTemplates(state)
  return plan.templates.some((t) => wanted.includes(t.template) && !t.ready)
}

/** The step to show: the remembered one, but a plan whose files are all there skips the waiting steps. */
export function startStep(state: SetupState, rows: PlanRow[]): Step {
  if (state.done) return 'go'
  if ((state.step === 'plan' || state.step === 'downloads') && rows.length && rows.every((r) => r.variant.installed)) {
    return 'test'
  }
  return state.step
}

/** The gated dialog's three steps (PD 5.5), from ``/plenio/setup/check``'s answer. */
export interface AccessCheck {
  variant: string
  step: 'ready' | 'accept' | 'pending' | 'token' | 'other' | string
  message: string
  fix: string
  page?: string
  token_page?: string
}

export function accessSteps(check: AccessCheck | null): { accept: boolean | null; token: boolean | null; pending: boolean } {
  if (!check) return { accept: null, token: null, pending: false }
  switch (check.step) {
    case 'ready':
      return { accept: true, token: true, pending: false }
    case 'accept':
      return { accept: false, token: null, pending: false }
    case 'pending':
      return { accept: true, token: true, pending: true }
    case 'token':
      return { accept: null, token: false, pending: false }
    default:
      return { accept: null, token: null, pending: false }
  }
}

/** A job of the Song API as Setup's test song reads it (``/plenio/api/v1/jobs/{id}``). */
export interface TestJob {
  id: string
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled' | string
  stage?: { text?: string } | null
  progress?: { done?: number; total?: number } | null
  started_at?: number | null
  finished_at?: number | null
  result?: { files?: { name: string; url: string; kind?: string }[] } | null
  error?: { message: string; type?: string; title?: string; hint?: string; details?: unknown } | null
}

export interface TestView {
  state: 'idle' | 'running' | 'ok' | 'failed'
  text: string
  /** The take to listen to, once it is there. */
  audio: string | null
  finding: Finding | null
}

/** What step 5 shows for the test song's job: how far it is, the take when it works, or what failed as a finding
 * (``test.model``: a model file - the plan fixes it; ``test.failed``: anything else, with the node that failed). */
export function testView(job: TestJob | null, refused: { message: string; hint?: string | null } | null = null): TestView {
  if (refused) {
    return {
      state: 'failed',
      text: 'The test song did not start.',
      audio: null,
      finding: {
        id: 'test.model',
        severity: 'error',
        text: refused.hint ? `${refused.message} ${refused.hint}` : refused.message,
        fix: { label: 'Show the plan', action: 'refresh', payload: {} }
      }
    }
  }
  if (!job) return { state: 'idle', text: '', audio: null, finding: null }
  if (job.status === 'succeeded') {
    const seconds = job.started_at && job.finished_at ? Math.round(job.finished_at - job.started_at) : null
    const audio = job.result?.files?.find((f) => /\.(flac|mp3|wav)$/i.test(f.name))?.url ?? null
    return { state: 'ok', text: `It works ✓${seconds !== null ? ` - the test song took ${formatSeconds(seconds)}` : ''}`, audio, finding: null }
  }
  if (job.status === 'failed' || job.status === 'cancelled') {
    const error = job.error
    const model = /model|not on this computer|does not find/i.test(`${error?.type ?? ''} ${error?.message ?? ''}`)
    return {
      state: 'failed',
      text: job.status === 'cancelled' ? 'The test song was cancelled.' : 'The test song failed.',
      audio: null,
      finding: {
        id: model ? 'test.model' : 'test.failed',
        severity: 'error',
        text: `${error?.title ? `${error.title}: ` : ''}${error?.message ?? 'the run stopped'}`,
        fix: model ? { label: 'Show the plan', action: 'refresh', payload: {} } : null
      }
    }
  }
  const stage = job.stage?.text ? ` - ${job.stage.text}` : ''
  return { state: 'running', text: `${job.status === 'queued' ? 'Waiting in the queue' : 'Making the test song'}${stage}`, audio: null, finding: null }
}

/** Home's buttons: what one wants to do, and the template that does it (PD 7.2). */
export const HOME_TEMPLATES: { label: string; template: string }[] = [
  { label: 'Make a song', template: '1 · YuE2 · Song' },
  { label: 'Cover a recording', template: '2 · YuE2 · Cover' },
  { label: 'A song with MiniMax', template: '3 · MiniMax · Song' },
  { label: 'Compose it yourself', template: '5 · YuE2 · DAW' },
  { label: 'Master a file', template: '4 · Enhance & Master' }
]

const REPOSITORY = 'https://github.com/jplenio/Plenio-Music-Production-System'
export const HOME_LINKS: { label: string; url: string }[] = [
  { label: 'New in 2.0', url: `${REPOSITORY}/blob/main/CHANGELOG.md` },
  { label: 'Tutorials', url: 'https://www.youtube.com/playlist?list=PLAFqTtP59fgE' },
  { label: 'Documentation', url: `${REPOSITORY}/blob/main/docs/user/getting-started.md` },
  { label: 'Where to report it', url: `${REPOSITORY}/issues` }
]

/** Home's models line: how many of the wanted templates' files are there, and the optional ones that are not. */
export function homeModels(plan: Pick<PlanView, 'templates'>, templates: string[]): { line: string; ready: boolean } {
  const needed = new Map<string, boolean>()
  const optional = new Map<string, boolean>()
  for (const template of plan.templates) {
    if (!templates.includes(template.template)) continue
    for (const pick of template.picks) {
      const into = pick.optional ? optional : needed
      into.set(pick.component, (into.get(pick.component) ?? false) || pick.installed)
    }
  }
  for (const component of needed.keys()) optional.delete(component)
  const have = [...needed.values()].filter(Boolean).length
  const missingOptional = [...optional.values()].filter((installed) => !installed).length
  const line =
    `${have} of ${needed.size} files for your templates` +
    (missingOptional ? ` · ${missingOptional} optional not installed` : '')
  return { line, ready: have === needed.size }
}
