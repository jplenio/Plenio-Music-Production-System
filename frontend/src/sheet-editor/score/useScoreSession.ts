/**
 * The editing session of the score document: one canonical text (the working copy of the
 * Song Sheet), its analysis, the selection and the undo history.
 *
 * - Text edits (ABC view) and notation edits (operations) change the same text.
 * - Every view comes from the backend for exactly the current text; an answer for an older
 *   text is dropped, so the notation never shows a stale score as if it were current.
 * - The last *valid* view stays visible while the text is invalid (marked as such).
 */
import { computed, reactive, ref, shallowRef, watch } from 'vue'

import { type Fetcher, PlenioApiError, type ScoreOperation, analyzeScore, transformScore } from '../../api/client'
import { History } from '../../shared/history'
import { type ScoreView, elementById } from '../../shared/scoreView'
import type { WorkingDoc } from '../../shared/sheetSession'

export interface ScoreSessionOptions {
  fetcher: Fetcher
  /** Called whenever the text changes by an edit in the editor (not by the dialog). */
  onEdit?: () => void
  debounceMs?: number
}

export function describeError(error: unknown): string {
  if (error instanceof PlenioApiError) return `${error.message}${error.hint ? ` — ${error.hint}` : ''}`
  return String(error instanceof Error ? error.message : error)
}

export function useScoreSession(doc: WorkingDoc, options: ScoreSessionOptions) {
  const view = shallowRef<ScoreView | null>(null)
  const lastValid = shallowRef<ScoreView | null>(null)
  const pending = ref(false)
  const busy = ref(false)
  const error = ref<string | null>(null)
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
      view.value = result
      if (result.ok) {
        lastValid.value = result
        const known = new Set((result.elements ?? []).map((e) => e.id))
        selection.value = selection.value.filter((id) => known.has(id))
      }
      error.value = null
    } catch (e) {
      if (doc.text === text) error.value = describeError(e)
    } finally {
      if (doc.text === text) pending.value = false
    }
  }

  function scheduleAnalyze(delay = options.debounceMs ?? 300): void {
    pending.value = true
    clearTimeout(timer)
    timer = setTimeout(() => void analyze(), delay)
  }

  function write(text: string, label: string, group?: string): void {
    if (text === doc.text) return
    ownWrite = true
    doc.text = text
    ownWrite = false
    history.record(text, label, { group })
    historyVersion.value++
    options.onEdit?.()
  }

  /** Text typed in the ABC view (grouped into one undo step per burst). */
  function typed(text: string): void {
    write(text, 'typing', 'typing')
    scheduleAnalyze()
  }

  async function operate(operation: ScoreOperation): Promise<boolean> {
    const text = doc.text
    busy.value = true
    error.value = null
    try {
      const result = await transformScore(options.fetcher, text, operation)
      if (doc.text !== text) {
        error.value = 'The score changed while the edit was computed; it was not applied.'
        return false
      }
      history.seal()
      write(result.abc, result.changes[0] ?? operation.op)
      history.seal()
      clearTimeout(timer)
      pending.value = false
      requested = result.abc
      view.value = result.analysis
      if (result.analysis.ok) lastValid.value = result.analysis
      notes.value = [...result.changes, ...result.warnings.map((w) => `warning: ${w}`)]
      if (result.select.length) selection.value = result.select
      return true
    } catch (e) {
      error.value = describeError(e)
      return false
    } finally {
      busy.value = false
    }
  }

  function restore(snapshot: { text: string; label: string } | null): void {
    if (!snapshot) return
    ownWrite = true
    doc.text = snapshot.text
    ownWrite = false
    historyVersion.value++
    options.onEdit?.()
    notes.value = []
    scheduleAnalyze(0)
  }

  const undo = () => restore(history.undo())
  const redo = () => restore(history.redo())

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
    typed,
    operate,
    undo,
    redo,
    select,
    analyze,
    dispose
  })
}

export type ScoreSession = ReturnType<typeof useScoreSession>
