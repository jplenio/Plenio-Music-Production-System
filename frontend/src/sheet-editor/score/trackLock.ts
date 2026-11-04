/**
 * Tracks locked against editing: the Vocal or the Instrument melody stays as it is, pale in the roll and the notation,
 * while the other one is edited. Locked notes cannot be picked, and every edit passes ``guardOperation`` on its way to
 * the backend - the roll, the palette, the inspector, the MIDI keyboard - so that no path edits a locked track.
 *
 * What belongs to the whole song still reaches it: bars inserted, deleted, copied or moved, sections arranged, a change
 * of meter, tempo, key or the whole score's transposition - otherwise the two voices would no longer play together. The
 * ABC text and a new score (a project, a MIDI file) replace the whole document: they are not edits of a track.
 *
 * Pure; a lock is the editor's setting (``prefs``) and never reaches the score.
 */
import type { ScoreOperation } from '../../api/client'
import type { ScoreView, Voice } from '../../shared/scoreView'

export type LockableTrack = 'vocal' | 'ins'

export interface TrackLocks {
  vocal: boolean
  ins: boolean
}

export const NO_LOCKS: TrackLocks = { vocal: false, ins: false }

const NAMES: Record<LockableTrack, string> = { vocal: 'Vocal', ins: 'Instrument' }
const TRACK_OF_VOICE: Partial<Record<Voice, LockableTrack>> = { Vocal: 'vocal', Ins: 'ins' }

export function parseLocks(value: unknown): TrackLocks {
  const data = (typeof value === 'object' && value !== null ? value : {}) as Partial<TrackLocks>
  return { vocal: data.vocal === true, ins: data.ins === true }
}

const lockedMessage = (track: LockableTrack): string => `The ${NAMES[track]} track is locked: unlock it to edit it.`

/** The ids (notes and their written segments, rests) of what stands on a locked track. */
export function lockedIds(view: ScoreView | null | undefined, locks: TrackLocks): Set<string> {
  const ids = new Set<string>()
  if (!locks.vocal && !locks.ins) return ids
  for (const track of ['vocal', 'ins'] as const) {
    if (!locks[track]) continue
    for (const note of view?.model?.tracks[track] ?? []) {
      ids.add(note.id)
      for (const segment of note.segments) ids.add(segment)
    }
  }
  for (const element of view?.elements ?? []) {
    const track = TRACK_OF_VOICE[element.voice]
    if (track && locks[track]) ids.add(element.id)
  }
  return ids
}

/** The ids that can be selected and edited (chord symbols are on no melody track). */
export function unlockedIds(view: ScoreView | null | undefined, ids: readonly string[], locks: TrackLocks): string[] {
  const locked = lockedIds(view, locks)
  return locked.size ? ids.filter((id) => !locked.has(id)) : [...ids]
}

function trackName(value: unknown): LockableTrack | null {
  const text = String(value ?? '').toLowerCase()
  return text === 'vocal' ? 'vocal' : text === 'ins' ? 'ins' : null
}

/** Edits of selected notes, by the field that names them. */
const BY_IDS = new Set(['delete', 'delete_close_gap', 'move_notes', 'set_note_pitch', 'join_notes', 'quantize', 'set_pitch', 'shift_pitch', 'note_to_rest'])
const BY_ID = new Set(['resize_note', 'split_note', 'set_duration', 'rest_to_note'])
/** Edits that put notes into the track they name. */
const INTO_TRACK = new Set(['insert_note', 'fill_rest', 'place_notes', 'shift_track'])

export interface Guarded {
  /** What may run (``null``: nothing). */
  operation: ScoreOperation | null
  /** What the user is told when a lock changed or stopped the edit. */
  note: string | null
}

function pass(operation: ScoreOperation): Guarded {
  return { operation, note: null }
}

/** ``operation`` as far as the locks allow it. */
export function guardOperation(operation: ScoreOperation, view: ScoreView | null | undefined, locks: TrackLocks): Guarded {
  if (!locks.vocal && !locks.ins) return pass(operation)
  const op = operation.op
  const blocked = (track: LockableTrack): Guarded => ({ operation: null, note: lockedMessage(track) })
  const firstLocked: LockableTrack = locks.vocal ? 'vocal' : 'ins'
  if (INTO_TRACK.has(op)) {
    const track = trackName(operation.track)
    if (track && locks[track]) return blocked(track)
  }
  if (op === 'silence_voice') {
    const track = trackName(operation.voice ?? 'Vocal')
    return track && locks[track] ? blocked(track) : pass(operation)
  }
  if (op === 'move_vocal_to_ins') return blocked(firstLocked)
  if (op === 'fit_notes') {
    if (locks.vocal) return blocked('vocal')
    if (!locks.ins || operation.surplus === 'omit') return pass(operation)
    return { operation: { ...operation, surplus: 'omit' }, note: `${lockedMessage('ins')} Surplus notes were left out instead of moved there.` }
  }
  if (op === 'paste') return guardPaste(operation, locks)
  if (BY_ID.has(op)) {
    const id = String(operation.id ?? (Array.isArray(operation.ids) ? operation.ids[0] : ''))
    return lockedIds(view, locks).has(id) ? blocked(firstLockedOf(id, view, locks)) : pass(operation)
  }
  if (!BY_IDS.has(op) || !Array.isArray(operation.ids)) return pass(operation)
  const target = trackName(operation.track)
  if (op === 'move_notes' && target && locks[target]) return blocked(target)
  const ids = operation.ids as string[]
  const kept = unlockedIds(view, ids, locks)
  if (kept.length === ids.length) return pass(operation)
  if (!kept.length) return blocked(firstLockedOf(ids[0], view, locks))
  return { operation: { ...operation, ids: kept }, note: `${lockedMessage(firstLocked)} Its selected notes stayed as they are.` }
}

function firstLockedOf(id: string, view: ScoreView | null | undefined, locks: TrackLocks): LockableTrack {
  if (locks.vocal && lockedIds(view, { vocal: true, ins: false }).has(id)) return 'vocal'
  return locks.ins ? 'ins' : 'vocal'
}

/** Pasted bars (``insert``) make the song longer in both voices; pasted notes leave a locked track as it is. */
function guardPaste(operation: ScoreOperation, locks: TrackLocks): Guarded {
  if (operation.mode === 'insert') return pass(operation)
  const notes = Array.isArray(operation.notes) ? (operation.notes as { track?: unknown }[]) : []
  const open = (track: unknown): boolean => {
    const name = trackName(track)
    return !name || !locks[name]
  }
  const kept = notes.filter((note) => open(note.track))
  const tracks = Array.isArray(operation.tracks) ? operation.tracks.filter(open) : operation.tracks
  const chords = Array.isArray(operation.chords) ? operation.chords.length : 0
  const touched = kept.length !== notes.length || (Array.isArray(operation.tracks) && (tracks as unknown[]).length !== operation.tracks.length)
  if (!touched) return pass(operation)
  const firstLocked: LockableTrack = locks.vocal ? 'vocal' : 'ins'
  if (!kept.length && !chords) return { operation: null, note: lockedMessage(firstLocked) }
  return { operation: { ...operation, notes: kept, tracks }, note: `${lockedMessage(firstLocked)} Only the other notes were pasted.` }
}
