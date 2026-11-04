/**
 * Which lines' notes do not match their syllables, and what the fit works on (backend ``note_repair``: the operation
 * ``fit_notes``). A line wants one note per syllable; ``off`` says how many notes it lacks (+) or has to spare (-).
 * Pure.
 */
import { type LyricLayoutView, type LyricLine, type ScoreView } from '../../shared/scoreView'
import { lineKey } from './lyricPlacement'
import { selectedNoteIds } from './pianoRoll'

export type FitSurplus = 'auto' | 'omit' | 'ins'

export const FIT_SURPLUS: readonly FitSurplus[] = ['auto', 'omit', 'ins']

/** The notes a line lacks (+) or has to spare (-); 0 for a line that fits or has no syllables. */
export function lineOff(line: LyricLine): number {
  if (!line.wanted) return 0
  return line.wanted - (new Set(line.syllables.map((s) => s.onset)).size + line.holds.length)
}

/** The sung lines whose notes do not match their syllables. */
export function linesOff(layout: LyricLayoutView | null | undefined): LyricLine[] {
  return (layout?.parts ?? []).flatMap((part) => part.lines.filter((line) => lineOff(line) !== 0))
}

/** ``+2`` / ``−3``. */
export function offLabel(off: number): string {
  return off > 0 ? `+${off}` : `−${-off}`
}

/** What a line's marker says. */
export function offHint(line: LyricLine): string {
  const off = lineOff(line)
  if (!off) return ''
  const syllables = line.wanted === 1 ? '1 syllable' : `${line.wanted} syllables`
  const notes = line.wanted! - off
  return `${syllables} on ${notes === 1 ? '1 note' : `${notes} notes`}`
}

/** ``[start, end)`` in units of L of the selected notes and lyrics lines; ``null``: nothing selected to fit. */
export function fitRange(view: ScoreView | null | undefined, selection: readonly string[], lyricKeys: readonly string[]): [number, number] | null {
  const spans: [number, number][] = []
  const notes = selectedNoteIds(view ?? null, selection)
  for (const note of [...(view?.model?.tracks.vocal ?? []), ...(view?.model?.tracks.ins ?? [])]) {
    if (notes.has(note.id)) spans.push([note.onset, note.onset + note.duration])
  }
  if (lyricKeys.length) {
    const keys = new Set(lyricKeys)
    for (const part of view?.lyrics?.parts ?? []) {
      for (const line of part.lines) {
        if (keys.has(lineKey(line.block, line.line))) spans.push([line.start, Math.max(line.end, line.start + 1)])
      }
    }
  }
  if (!spans.length) return null
  return [Math.min(...spans.map((s) => s[0])), Math.max(...spans.map((s) => s[1]))]
}
