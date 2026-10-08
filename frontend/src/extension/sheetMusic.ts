/**
 * The sheet music PDF of an export (Export Release, *sheet music*; owner's request 2026-10-08).
 *
 * The backend has no music engraving, so Export Release reserves ``<name>.pdf`` next to the audio and
 * sends this browser the score, its lyrics and a one-time token (``plenio_notation``). Here the notation is
 * drawn exactly as the score editor's *Export notation… > PDF* draws it - with the lyrics lines placed by
 * hand on the Song Sheet, when there are any - and posted back; Plenio saves it and lists it in the
 * release record. A batch draws its PDFs one after another.
 */
import { type Fetcher, PlenioApiError, analyzeScore } from '../api/client'
import type { NotationSize } from '../sheet-editor/score/editorSettings'
import { type LyricSpan, parseSpans } from '../sheet-editor/score/lyricPlacement'
import { isNotationSize } from '../sheet-editor/score/prefs'

export type SheetPaper = 'a4' | 'letter'

/** One PDF to draw: what Export Release sends in ``plenio_notation``. */
export interface SheetMusicJob {
  token: string
  file: string
  title: string
  paper: SheetPaper
  /** How large the music is drawn (Export Release's *sheet music size*; ``standard`` before 0.4.6). */
  size: NotationSize
  /** The final score and lyrics (for the lines placed by hand). */
  abc: string
  lyrics: string
  /** The notation with the lyrics as Plenio places them by itself. */
  display_abc: string
  /** The Song Sheets that hold the score and the lyrics (their lines placed by hand). */
  score_sheet: string | null
  lyrics_sheet: string | null
}

/** The jobs of an executed Export Release (none when the output has none or is malformed). */
export function sheetMusicJobs(output: Record<string, unknown> | undefined): SheetMusicJob[] {
  const items = output?.plenio_notation
  if (!Array.isArray(items)) return []
  const text = (value: unknown): string => (typeof value === 'string' ? value : '')
  const id = (value: unknown): string | null => (value === null || value === undefined || value === '' ? null : String(value))
  return items
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => ({
      token: text(item.token),
      file: text(item.file),
      title: text(item.title),
      paper: item.paper === 'letter' ? ('letter' as const) : ('a4' as const),
      size: isNotationSize(item.size) ? item.size : ('standard' as const),
      abc: text(item.abc),
      lyrics: text(item.lyrics),
      display_abc: text(item.display_abc),
      score_sheet: id(item.score_sheet),
      lyrics_sheet: id(item.lyrics_sheet)
    }))
    .filter((job) => job.token && job.file && job.display_abc)
}

/** What drawing and saving needs from the page. */
export interface SheetMusicHost {
  fetcher: Fetcher
  /** The ``plenio_lyric_spans`` property of a node of the open graph (``undefined``: not there). */
  property(nodeId: string): unknown
  /** The notation of ``abc`` on pages of ``paper`` at ``size`` as a PDF (``notationExport.ts``). */
  draw(abc: string, title: string, paper: SheetPaper, size: NotationSize): Promise<Uint8Array>
}

/** The lyrics lines placed by hand: on the score's sheet, else on the lyrics' sheet. */
export function handPlaced(job: SheetMusicJob, host: Pick<SheetMusicHost, 'property'>): LyricSpan[] {
  for (const node of [job.score_sheet, job.lyrics_sheet]) {
    if (!node) continue
    const spans = parseSpans(host.property(node))
    if (spans.length) return spans
  }
  return []
}

/** The notation to draw: as the score editor shows it (with the lines placed by hand). */
export async function notationOf(job: SheetMusicJob, host: SheetMusicHost): Promise<string> {
  const spans = job.lyrics.trim() ? handPlaced(job, host) : []
  if (!spans.length) return job.display_abc
  const view = await analyzeScore(host.fetcher, job.abc, job.lyrics, spans)
  return view.display_abc ?? job.display_abc
}

/** Draw the job's PDF and save it next to the audio; returns the saved file's name and size. */
export async function saveSheetMusic(job: SheetMusicJob, host: SheetMusicHost): Promise<{ file: string; bytes: number }> {
  const pdf = await host.draw(await notationOf(job, host), job.title, job.paper, job.size)
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
