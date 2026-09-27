/** Typed calls to the /plenio/* routes. Errors carry the backend's message and hint. */
import type { ScoreView } from '../shared/scoreView'
import type { AsrNote, SheetPayload } from '../shared/sheetSession'
import type { SheetState } from '../shared/sheetState'

export interface Fetcher {
  fetchApi(route: string, options?: RequestInit): Promise<Response>
  apiURL?(route: string): string
}

export class PlenioApiError extends Error {
  constructor(
    message: string,
    readonly hint: string | null = null
  ) {
    super(message)
  }
}

async function post<T>(fetcher: Fetcher, route: string, body: unknown): Promise<T> {
  const response = await fetcher.fetchApi(route, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  const data = await response.json()
  if (!response.ok) {
    const error = data?.error ?? {}
    throw new PlenioApiError(error.message ?? `Request failed (${response.status})`, error.hint ?? null)
  }
  return data as T
}

export interface ResolveRequest {
  sheet_state: SheetState
  upstream: Record<string, string | null>
  owned: string[]
  review: string
  engine: string | null
  instrumental: boolean
  context: Record<string, string>
  max_seconds?: number
  target_seconds?: number | null
}

export function resolveSheet(fetcher: Fetcher, request: ResolveRequest): Promise<SheetPayload> {
  return post<SheetPayload>(fetcher, '/plenio/sheet/resolve', request)
}

/** The Transcribe Lyrics note of a lyrics draft (by the draft's hash), or null. */
export async function getAsrNote(fetcher: Fetcher, draftSha256: string): Promise<AsrNote | null> {
  if (!/^[0-9a-f]{64}$/.test(draftSha256)) return null
  const response = await fetcher.fetchApi(`/plenio/asr/notes/${draftSha256}`)
  if (!response.ok) return null
  const data = await response.json()
  return (data?.note as AsrNote | null) ?? null
}

/** Analysis and element view of a score (valid or not: invalid scores come back with diagnostics). */
export function analyzeScore(fetcher: Fetcher, abc: string): Promise<ScoreView> {
  return post<ScoreView>(fetcher, '/plenio/score/analyze', { abc })
}

export interface ScoreOperation {
  op: string
  [parameter: string]: unknown
}

export interface TransformResult {
  abc: string
  changes: string[]
  warnings: string[]
  select: string[]
  analysis: ScoreView
}

/** Apply one editor operation; the backend checks it and returns the new canonical text. */
export function transformScore(fetcher: Fetcher, abc: string, operation: ScoreOperation): Promise<TransformResult> {
  return post<TransformResult>(fetcher, '/plenio/score/transform', { abc, operation })
}

/** A Guide-track note ``[onset, duration, pitch]`` in units of the score's L (never sent to YuE2). */
export type GuideNote = [number, number, number]

/** The score (and Guide notes) as a standard MIDI file; ``data`` is base64. */
export function exportMidi(
  fetcher: Fetcher,
  request: { abc: string; title?: string; guide?: GuideNote[] }
): Promise<{ filename: string; data: string }> {
  return post(fetcher, '/plenio/score/midi/export', request)
}

export interface MidiTrack {
  /** 0-based track index, as the mapping's keys use it. */
  index: number
  name: string
  notes: number
  /** The role the track's name suggests, or ``null``. */
  role: string | null
}

export interface MidiImportResult {
  abc: string
  guide: GuideNote[]
  /** Every lossy step of the import (quantisation, cut notes, dropped tempo changes ...). */
  report: string[]
  /** The file's tracks as the import saw them (the dialog lists these). */
  tracks: MidiTrack[]
  analysis: ScoreView
}

/** A MIDI file (base64) as a score. ``mapping``: track index -> vocal | ins | chords | guide | null. */
export function importMidi(
  fetcher: Fetcher,
  request: { data: string; mapping?: Record<string, string | null>; grid?: number; chords?: boolean }
): Promise<MidiImportResult> {
  return post(fetcher, '/plenio/score/midi/import', request)
}

export interface LyricsSectionInfo {
  tag: string
  lines: number
  words: number
  syllables: number
  score_section?: string
  vocal_notes?: number
}

export interface LyricsAnalysis {
  sections: LyricsSectionInfo[]
  tags: string[]
  words: number
  findings: { severity: string; message: string; where: string }[]
}

export function analyzeLyrics(
  fetcher: Fetcher,
  request: { lyrics: string; abc?: string; engine?: string | null; instrumental?: boolean }
): Promise<LyricsAnalysis> {
  return post<LyricsAnalysis>(fetcher, '/plenio/lyrics/analyze', request)
}

/** URL of a file ComfyUI serves from its input/temp/output folders (for the A/B player). */
export function viewUrl(fetcher: Fetcher, file: { filename: string; subfolder: string; type: string }): string {
  const query = new URLSearchParams({ filename: file.filename, subfolder: file.subfolder, type: file.type })
  const route = `/view?${query.toString()}`
  return fetcher.apiURL ? fetcher.apiURL(route) : `/api${route}`
}

export interface EqResponse {
  settings: import('../shared/eqCurve').EqSettings
  frequency_hz: number[]
  response_db: number[]
  bands: number[][]
}

/** The exact response of EQ settings (the node's own filter design). */
export function eqResponse(fetcher: Fetcher, settings: unknown, sampleRate: number, points = 200): Promise<EqResponse> {
  return post<EqResponse>(fetcher, '/plenio/eq/response', { settings, sample_rate: sampleRate, points })
}

export interface EqPreset {
  name: string
  description: string
  settings: import('../shared/eqCurve').EqSettings
}

/** Shipped EQ recipes (``manual``: band sets; ``match``: tone-match recipes). */
export async function eqPresets(fetcher: Fetcher): Promise<{ manual: EqPreset[] }> {
  const response = await fetcher.fetchApi('/plenio/presets/eq')
  if (!response.ok) throw new PlenioApiError(`Request failed (${response.status})`)
  return (await response.json()) as { manual: EqPreset[] }
}
