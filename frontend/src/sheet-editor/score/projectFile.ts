/**
 * The score editor's project file (owner's request 2026-10-01): everything the *Edit Score* area
 * holds in one file - the score (its canonical ABC: notes, chords, sections, tempo, keys), the Guide
 * notes, the lyrics and (since 0.4.4) the editor's settings: the tracks' sounds, the metronome, the
 * cover's view of its source, the recording and the paper - so that work can be saved and opened again
 * later, in any sheet. JSON, ``plenio.score_project/1``; reading checks every part and says what it
 * left out. ``settings`` is optional: older files have none, and older versions ignore it.
 */
import { version } from '../../../package.json'
import type { GuideNote } from '../../api/client'
import { type EditorSettings, parseSettings } from './editorSettings'
import { type LyricSpan, parseSpans } from './lyricPlacement'
import { parseGuide } from './tracks'

export const PROJECT_SCHEMA = 'plenio.score_project/1'
export const PROJECT_EXTENSION = '.plenio.json'

export interface ScoreProject {
  schema: typeof PROJECT_SCHEMA
  /** What wrote the file (for the reader's information). */
  app: string
  /** When it was saved (ISO 8601). */
  saved: string
  title: string
  /** The canonical ABC text of the score. */
  score: string
  /** Guide notes ``[onset, duration, pitch]`` in units of the score's L (playback and MIDI only). */
  guide: GuideNote[]
  /** The song's lyrics (``null``: none). */
  lyrics: string | null
  /** The lyrics lines placed by hand (``[start, end]`` in units of L; empty: placed by the phrases). */
  lyric_spans: LyricSpan[]
  /** The editor's settings (only the valid ones of a file; none in files before 0.4.4). */
  settings: Partial<EditorSettings>
}

export function buildProject(
  parts: {
    title?: string | null
    score: string
    guide?: GuideNote[] | null
    lyrics?: string | null
    lyricSpans?: LyricSpan[] | null
    settings?: EditorSettings | null
  },
  now: Date = new Date()
): ScoreProject {
  return {
    schema: PROJECT_SCHEMA,
    app: `Plenio Music Production System ${version}`,
    saved: now.toISOString(),
    title: (parts.title ?? '').trim(),
    score: parts.score,
    guide: (parts.guide ?? []).map(([onset, duration, pitch]) => [onset, duration, pitch]),
    lyrics: parts.lyrics?.trim() ? parts.lyrics : null,
    lyric_spans: parts.lyrics?.trim() ? parseSpans(parts.lyricSpans ?? []) : [],
    settings: parts.settings ? parseSettings(parts.settings) : {}
  }
}

/** ``<title>.plenio.json`` with only safe characters (``score.plenio.json`` without a title). */
export function projectFilename(title: string | null | undefined): string {
  const safe = Array.from((title ?? '').trim(), (ch) => (/[\p{L}\p{N} \-_()]/u.test(ch) ? ch : '_'))
    .join('')
    .slice(0, 80)
    .trim()
  return `${safe || 'score'}${PROJECT_EXTENSION}`
}

/** The file's text as a project, or why it is not one. */
export function parseProject(text: string): ScoreProject | string {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return 'This file is not a Plenio project (not JSON).'
  }
  const record = (typeof data === 'object' && data !== null ? data : {}) as Record<string, unknown>
  if (record.schema !== PROJECT_SCHEMA) {
    return `This file is not a Plenio score project (${PROJECT_SCHEMA}); for a MIDI file use Import MIDI.`
  }
  if (typeof record.score !== 'string' || !record.score.trim()) return 'The project holds no score.'
  return {
    schema: PROJECT_SCHEMA,
    app: typeof record.app === 'string' ? record.app : '',
    saved: typeof record.saved === 'string' ? record.saved : '',
    title: typeof record.title === 'string' ? record.title : '',
    score: record.score,
    guide: parseGuide(record.guide),
    lyrics: typeof record.lyrics === 'string' && record.lyrics.trim() ? record.lyrics : null,
    lyric_spans: parseSpans(record.lyric_spans),
    settings: parseSettings(record.settings)
  }
}
