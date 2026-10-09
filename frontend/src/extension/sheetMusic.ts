/**
 * The sheet music PDF of an export (Export Release, *sheet music*; owner's request 2026-10-08).
 *
 * The backend has no music engraving, so Export Release reserves ``<name>.pdf`` next to the audio and
 * sends the notation - the score with its lyrics, placed as the score editor places them, lines placed by
 * hand included - and a one-time token (``plenio_notation``). Here it is drawn exactly as the editor's
 * *Export notation… > PDF* draws it and posted back; Plenio saves it and lists it in the release record.
 *
 * Every open page draws the jobs of every execution it hears of, whichever workflow it shows (ComfyUI calls
 * a node's ``onExecuted`` only when the node is in the open workflow - owner's report 2026-10-09: no PDF
 * when the run ended while another workflow was open), and asks the server for the jobs still waiting when
 * it opens, comes back to the front or reconnects. A batch draws its PDFs one after another; a job is drawn
 * once per page.
 */
import { type Fetcher, PlenioApiError } from '../api/client'
import type { NotationSize } from '../sheet-editor/score/editorSettings'
import { isNotationSize } from '../sheet-editor/score/prefs'

export type SheetPaper = 'a4' | 'letter'

/** One PDF to draw: what Export Release sends in ``plenio_notation`` (or the pending list holds). */
export interface SheetMusicJob {
  token: string
  file: string
  title: string
  paper: SheetPaper
  /** How large the music is drawn (Export Release's *sheet music size*; ``standard`` when the job names none). */
  size: NotationSize
  /** The notation with the lyrics as the editor places them (lines placed by hand included). */
  display_abc: string
}

function parseJobs(items: unknown): SheetMusicJob[] {
  if (!Array.isArray(items)) return []
  const text = (value: unknown): string => (typeof value === 'string' ? value : '')
  return items
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => ({
      token: text(item.token),
      file: text(item.file),
      title: text(item.title),
      paper: item.paper === 'letter' ? ('letter' as const) : ('a4' as const),
      size: isNotationSize(item.size) ? item.size : ('standard' as const),
      display_abc: text(item.display_abc)
    }))
    .filter((job) => job.token && job.file && job.display_abc)
}

/** The jobs of an executed Export Release (none when the output has none or is malformed). */
export function sheetMusicJobs(output: Record<string, unknown> | null | undefined): SheetMusicJob[] {
  return parseJobs(output?.plenio_notation)
}

/** The jobs the server still holds for a page to draw (none when it cannot say). */
export async function pendingSheetMusic(fetcher: Fetcher): Promise<SheetMusicJob[]> {
  const response = await fetcher.fetchApi('/plenio/export/sheet-music/pending', { cache: 'no-store' })
  if (!response.ok) return []
  const data = (await response.json().catch(() => ({}))) as { jobs?: unknown }
  return parseJobs(data.jobs)
}

/** What drawing and saving needs from the page. */
export interface SheetMusicHost {
  fetcher: Fetcher
  /** The notation ``abc`` on pages of ``paper`` at ``size`` as a PDF (``notationExport.ts``). */
  draw(abc: string, title: string, paper: SheetPaper, size: NotationSize): Promise<Uint8Array>
}

/** Draw the job's PDF and save it next to the audio; returns the saved file's name and size. */
export async function saveSheetMusic(job: SheetMusicJob, host: SheetMusicHost): Promise<{ file: string; bytes: number }> {
  const pdf = await host.draw(job.display_abc, job.title, job.paper, job.size)
  const buffer = new ArrayBuffer(pdf.length) // a body needs a plain ArrayBuffer behind the bytes
  new Uint8Array(buffer).set(pdf)
  const response = await host.fetcher.fetchApi(`/plenio/export/sheet-music?token=${encodeURIComponent(job.token)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/pdf' },
    body: new Blob([buffer], { type: 'application/pdf' })
  })
  const data = (await response.json().catch(() => ({}))) as { file?: string; bytes?: number; error?: { message?: string; hint?: string } }
  if (!response.ok) {
    throw new PlenioApiError(data.error?.message ?? `Saving the sheet music failed (${response.status})`, data.error?.hint ?? null)
  }
  return { file: data.file ?? job.file, bytes: data.bytes ?? pdf.length }
}

let queue: Promise<unknown> = Promise.resolve()

/** Run ``work`` after the jobs before it (a batch of exports draws one PDF at a time). */
export function enqueue<T>(work: () => Promise<T>): Promise<T> {
  const next = queue.then(work, work)
  queue = next.catch(() => undefined)
  return next
}

/** How a job ended, for the page to say so. */
export type SheetMusicOutcome =
  | { job: SheetMusicJob; saved: { file: string; bytes: number } }
  | { job: SheetMusicJob; error: unknown; quiet: boolean }

/**
 * The jobs this page draws: each token once, one PDF after the other. ``take`` hands jobs over (from an
 * execution, or from the pending list with ``recovered``); ``report`` hears how each ended - ``quiet`` for a
 * recovered job another page saved first (its token is used up), which is no failure to show.
 */
export class SheetMusicJobs {
  private readonly seen = new Set<string>()

  constructor(
    private readonly host: SheetMusicHost,
    private readonly report: (outcome: SheetMusicOutcome) => void
  ) {}

  take(jobs: readonly SheetMusicJob[], recovered = false): Promise<void>[] {
    const started: Promise<void>[] = []
    for (const job of jobs) {
      if (this.seen.has(job.token)) continue
      this.seen.add(job.token)
      started.push(
        enqueue(() => saveSheetMusic(job, this.host)).then(
          (saved) => this.report({ job, saved }),
          (error: unknown) => {
            const usedUp = error instanceof PlenioApiError && /can no longer be saved/.test(error.message)
            this.report({ job, error, quiet: recovered && usedUp })
          }
        )
      )
    }
    return started
  }

  /** Ask the server for the jobs still waiting and draw the new ones (a failed request draws nothing). */
  async recover(): Promise<void> {
    let jobs: SheetMusicJob[] = []
    try {
      jobs = await pendingSheetMusic(this.host.fetcher)
    } catch {
      return
    }
    await Promise.all(this.take(jobs, true))
  }
}
