/**
 * The editing session of the score document: one canonical text (the working copy of the
 * Song Sheet), its analysis, the selection and the undo history.
 *
 * - Text edits (ABC view) and notation edits (operations) change the same text.
 * - Every view comes from the backend for exactly the current text; an answer for an older
 *   text is dropped, so the notation never shows a stale score as if it were current.
 * - The last *valid* view stays visible while the text is invalid (marked as such).
 * - Commit gate (next-release plan §9.7): while the text is invalid, unchecked or being checked,
 *   ``commitBlock`` names the reason; the dialog disables Apply/Approve for the score with it,
 *   the notation's operations are refused, and ``revertToLastValid`` restores the last valid
 *   text. An invalid text therefore never replaces the last valid score in the node.
 */
import { computed, reactive, ref, shallowRef, watch } from 'vue'

import {
  type Fetcher,
  PlenioApiError,
  type ScoreOperation,
  type TransformResult,
  analyzeScore,
  transformScore
} from '../../api/client'
import { History, type Snapshot } from '../../shared/history'
import { type ScoreView, elementById, elementSelection, knownIds } from '../../shared/scoreView'
import type { WorkingDoc } from '../../shared/sheetSession'

export interface ScoreSessionOptions {
  fetcher: Fetcher
  /** Called whenever the text changes by an edit in the editor (not by the dialog). */
  onEdit?: () => void
  /**
   * Called on an undo or redo that reaches a step with a side state (``replaceText``'s ``state``):
   * the caller restores what belongs to that text (the Guide notes of a MIDI import).
   */
  onRestore?: (extra: unknown) => void
  /**
   * Called with an operation's result just before it is written: what else changes with this step
   * (the Guide notes that follow the bars of a time map) as ``{ before, after }``, kept with the step
   * like ``replaceText``'s ``state`` - so undo and redo move text and side state together.
   */
  onTransform?: (result: TransformResult, operation: ScoreOperation) => { before: unknown; after: unknown } | undefined
  debounceMs?: number
}

export function describeError(error: unknown): string {
  if (error instanceof PlenioApiError) return `${error.message}${error.hint ? ` — ${error.hint}` : ''}`
  return String(error instanceof Error ? error.message : error)
}

/** Why the current text cannot be committed (``null``: it can). */
export function commitBlockOf(state: {
  text: string
  view: ScoreView | null
  pending: boolean
  busy: boolean
  checkFailed: string | null
}): string | null {
  if (!state.text.trim()) return null // an empty document is the sheet's concern (missing score)
  if (state.pending || state.busy) return 'The score is still being checked.'
  if (state.checkFailed) return `The score could not be checked: ${state.checkFailed}`
  if (!state.view) return 'The score has not been checked yet.'
  if (!state.view.ok) {
    const first = state.view.diagnostics.find((d) => d.severity === 'error')
    const where = first ? ` (${first.line ? `line ${first.line}` : first.where}: ${first.message})` : ''
    return `The ABC text is not valid${where}. Fix it, or revert to the last valid score.`
  }
  return null
}

export function useScoreSession(doc: WorkingDoc, options: ScoreSessionOptions) {
  const view = shallowRef<ScoreView | null>(null)
  const lastValid = shallowRef<ScoreView | null>(null)
  const lastValidText = ref<string | null>(null)
  const pending = ref(false)
  const busy = ref(false)
  const error = ref<string | null>(null)
  const checkFailed = ref<string | null>(null)
  const notes = ref<string[]>([])
  const selection = ref<string[]>([])
  const history = new History(doc.text)
  const historyVersion = ref(0)
  let requested = ''
  let timer: ReturnType<typeof setTimeout> | undefined
  let ownWrite = false

  const current = computed(() => (view.value && view.value.sha256 && !pending.value ? view.value : null))
  const primary = computed(() => elementById(lastValid.value, selection.value[0]))
  const canUndo = computed(() => (historyVersion.value, history.canUndo))
  const canRedo = computed(() => (historyVersion.value, history.canRedo))
  const undoLabel = computed(() => (historyVersion.value, history.undoLabel))
  const redoLabel = computed(() => (historyVersion.value, history.redoLabel))
  const commitBlock = computed(() =>
    commitBlockOf({
      text: doc.text,
      view: view.value,
      pending: pending.value,
      busy: busy.value,
      checkFailed: checkFailed.value
    })
  )
  const canRevert = computed(
    () => lastValidText.value !== null && lastValidText.value !== doc.text && !!view.value && !view.value.ok
  )

  function accept(result: ScoreView, text: string): void {
    view.value = result
    checkFailed.value = null
    if (result.ok) {
      lastValid.value = result
      lastValidText.value = text
      const known = knownIds(result)
      selection.value = selection.value.filter((id) => known.has(id))
    }
  }

  async function analyze(): Promise<void> {
    const text = doc.text
    requested = text
    if (!text.trim()) {
      view.value = null
      pending.value = false
      return
    }
    try {
      const result = await analyzeScore(options.fetcher, text)
      if (requested !== text || doc.text !== text) return // an older text: drop it
      accept(result, text)
      error.value = null
    } catch (e) {
      if (doc.text === text) {
        error.value = describeError(e)
        checkFailed.value = error.value
      }
    } finally {
      if (doc.text === text) pending.value = false
    }
  }

  function scheduleAnalyze(delay = options.debounceMs ?? 300): void {
    pending.value = true
    clearTimeout(timer)
    timer = setTimeout(() => void analyze(), delay)
  }

  function write(text: string, label: string, group?: string, extra?: unknown): void {
    if (text === doc.text) return
    ownWrite = true
    doc.text = text
    ownWrite = false
    history.record(text, label, { group, extra })
    historyVersion.value++
    options.onEdit?.()
  }

  /** Text typed in the ABC view (grouped into one undo step per burst). */
  function typed(text: string): void {
    write(text, 'typing', 'typing')
    scheduleAnalyze()
  }

  /**
   * Replace the whole text as one undo step (an import, a dialog decision). When ``view`` is the
   * backend's analysis of exactly this text it is taken as it is; otherwise it is checked again.
   *
   * ``state`` is a side state that changes with the text (a MIDI import's Guide notes): ``before``
   * is attached to the current step, ``after`` to the new one, and ``onRestore`` gets the one an
   * undo or redo reaches - so text and side state always move together.
   */
  function replaceText(
    text: string,
    label: string,
    view: ScoreView | null = null,
    state?: { before: unknown; after: unknown }
  ): boolean {
    if (text === doc.text) return false
    history.seal()
    if (state) history.annotate(state.before)
    write(text, label, undefined, state?.after)
    history.seal()
    clearTimeout(timer)
    requested = text
    pending.value = false
    notes.value = []
    if (view && view.ok) {
      // the route computed this view for exactly this text, in the same response
      accept(view, text)
      error.value = null
    } else {
      scheduleAnalyze(0)
    }
    return true
  }

  async function operate(operation: ScoreOperation): Promise<boolean> {
    const text = doc.text
    if (view.value && !view.value.ok) {
      error.value = 'The ABC text is not valid; fix it or revert to the last valid score before editing the notation.'
      return false
    }
    busy.value = true
    error.value = null
    try {
      const result = await transformScore(options.fetcher, text, operation)
      if (doc.text !== text) {
        error.value = 'The score changed while the edit was computed; it was not applied.'
        return false
      }
      const state = options.onTransform?.(result, operation)
      history.seal()
      if (state) history.annotate(state.before)
      write(result.abc, result.changes[0] ?? operation.op, undefined, state?.after)
      history.seal()
      clearTimeout(timer)
      pending.value = false
      requested = result.abc
      accept(result.analysis, result.abc)
      notes.value = [...result.changes, ...result.warnings.map((w) => `warning: ${w}`)]
      // canonical operations select notes by canonical id; the staff selects written segments
      if (result.select.length) selection.value = elementSelection(result.analysis, result.select)
      return true
    } catch (e) {
      error.value = describeError(e)
      return false
    } finally {
      busy.value = false
    }
  }

  function restore(snapshot: Snapshot | null): void {
    if (!snapshot) return
    ownWrite = true
    doc.text = snapshot.text
    ownWrite = false
    if (snapshot.extra !== undefined) options.onRestore?.(snapshot.extra)
    historyVersion.value++
    options.onEdit?.()
    notes.value = []
    scheduleAnalyze(0)
  }

  const undo = () => restore(history.undo())
  const redo = () => restore(history.redo())

  /** Replace an invalid text by the last valid one (one undo step; its view is already known). */
  function revertToLastValid(): boolean {
    const text = lastValidText.value
    if (text === null || text === doc.text || !lastValid.value) return false
    history.seal()
    write(text, 'revert to the last valid score')
    history.seal()
    clearTimeout(timer)
    requested = text
    pending.value = false
    view.value = lastValid.value
    checkFailed.value = null
    error.value = null
    notes.value = ['reverted to the last valid score']
    return true
  }

  function select(ids: string[]): void {
    selection.value = ids
  }

  // Changes made by the dialog (use draft, conflict choice) enter the history as one step.
  // Synchronous, so that ``ownWrite`` tells the session's own writes apart (a queued watcher
  // would run after the flag is reset, break typing groups and re-analyze every edit).
  watch(
    () => doc.text,
    (text) => {
      if (ownWrite) return
      history.seal()
      history.record(text, 'document replaced')
      history.seal()
      historyVersion.value++
      scheduleAnalyze(0)
    },
    { flush: 'sync' }
  )

  function dispose(): void {
    clearTimeout(timer)
  }

  scheduleAnalyze(0)

  return reactive({
    view,
    lastValid,
    lastValidText,
    current,
    pending,
    busy,
    error,
    notes,
    selection,
    primary,
    canUndo,
    canRedo,
    undoLabel,
    redoLabel,
    commitBlock,
    canRevert,
    typed,
    replaceText,
    operate,
    undo,
    redo,
    revertToLastValid,
    select,
    analyze,
    dispose
  })
}

export type ScoreSession = ReturnType<typeof useScoreSession>
