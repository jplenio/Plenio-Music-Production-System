import type { Fetcher } from '../api/client'
import type { ComfyNode, InputSpec, WidgetConstructor } from '../shared/comfy'
import { ownedBeforeRun } from '../shared/sheetSession'
import { DOCUMENT_KINDS, parseState, serializeState, summarize } from '../shared/sheetState'
import { lyricsTargetOf, scoreTargetOf, writeLyrics, writeScore } from './lyricsOwner'
import { getAsrNote, getPayload, onPayload } from './payloads'
import { displayState, onRunState, runState, setRunState, sheetLine } from './runStatus'

export const SHEET_STATE_TYPE = 'PLENIO_SHEET_STATE'
/** The widget's layout height: the button row (28 px), the status row (18 px) and the frontend's margins. */
export const SHEET_WIDGET_HEIGHT = 68

interface InputSlot {
  name: string
  link: number | null
}

let fetcher: Fetcher | null = null

/** Provided by main.ts (the ComfyUI api object handles the server's base path). */
export function setFetcher(value: Fetcher): void {
  fetcher = value
}

/**
 * Widget for the PLENIO_SHEET_STATE input type. The value is the JSON string of
 * the Song Sheet state; it is serialised with the workflow and sent to the
 * backend unchanged. The widget shows a summary and opens the sheet editor.
 */
export const sheetStateWidget: WidgetConstructor = (node: ComfyNode, inputName: string, inputData: InputSpec) => {
  let value = typeof inputData?.[1]?.default === 'string' ? (inputData[1].default as string) : ''
  const element = document.createElement('div')
  element.className = 'plenio-sheet-state'
  const summary = document.createElement('span')
  summary.className = 'plenio-sheet-summary'
  const button = document.createElement('button')
  button.className = 'plenio-sheet-open'
  button.textContent = 'Edit Song Sheet…'
  // where the run stands at this sheet - a review stop, waiting for approval, approved - in words, so
  // App mode (which shows this widget but not the canvas badges) says it too
  const status = document.createElement('div')
  status.className = 'plenio-sheet-status'
  element.append(button, summary, status)
  let hookedReview = false

  const render = () => {
    const payload = getPayload(String(node.id))
    const state = displayState(node)
    // the last run's status, unless Approve has answered it since (it said "waiting for approval")
    summary.textContent = summarize(parseState(value)) + (payload && state !== 'approved' ? ` · ${payload.status}` : '')
    status.textContent = sheetLine(state)
    status.dataset.state = state ?? ''
    // the review setting decides whether the sheet stops: follow it (the widget exists once the node is built)
    const review = hookedReview ? null : node.widgets?.find((w) => w.name === 'review')
    if (review) {
      hookedReview = true
      const original = review.callback
      review.callback = (next: unknown) => {
        original?.(next)
        render()
      }
    }
  }

  const widget = node.addDOMWidget(inputName, SHEET_STATE_TYPE, element, {
    getValue: () => value,
    setValue: (next: unknown) => {
      value = typeof next === 'string' ? next : ''
      render()
    },
    // two rows, always: the frontend lays a DOM widget out once, so a height that changes later is cut;
    // it also keeps a 10 px margin above and below the element (68 - 20 = the rows' 48 px)
    getMinHeight: () => SHEET_WIDGET_HEIGHT,
    getMaxHeight: () => SHEET_WIDGET_HEIGHT
  })

  button.addEventListener('click', (event) => {
    event.stopPropagation()
    // whatever goes wrong, the click is answered: the reason stands on the node (and in the console)
    void openEditor().catch((error: unknown) => {
      console.error('Plenio: the Song Sheet editor could not open', error)
      summary.textContent = `The editor could not open: ${error instanceof Error ? error.message : String(error)}`
    })
  })

  async function openEditor(): Promise<void> {
    const state = parseState(value)
    if (state === null) {
      summary.textContent = 'The stored state is unreadable; it will be replaced when you apply.'
    }
    const payload = getPayload(String(node.id))
    const inputs = ((node as unknown as { inputs?: InputSlot[] }).inputs ?? []) as InputSlot[]
    const connected = inputs.filter((slot) => slot.link != null).map((slot) => slot.name)
    const current = state ?? { schema: 'plenio.sheet_state/1' as const, docs: {} }
    const owned = payload?.owned ?? ownedBeforeRun(connected, current)
    // 'as the brief says' is resolved by the backend: the rule of the last run applies
    const setting = String(node.widgets?.find((w) => w.name === 'review')?.value ?? 'continue')
    const review = setting === 'as the brief says' ? (payload?.review ?? 'continue') : setting
    const { openSheetDialog } = await import('../sheet-editor/open')
    const { parseGuide, serializeGuide } = await import('../sheet-editor/score/tracks')
    const { parseShift, parseSpans } = await import('../sheet-editor/score/lyricPlacement')
    if (!fetcher) throw new Error('Plenio: API not initialised')
    // the lyrics of Song Sheet · Text follow this score's sections (templates 1 and 5); when the graph
    // cannot say where they come from, the editor opens without that (the lyrics are then not written back)
    let lyrics: ReturnType<typeof lyricsTargetOf> = null
    try {
      lyrics = lyricsTargetOf(node, payload, getPayload)
    } catch (error) {
      console.warn('Plenio: the lyrics sheet of this score was not found', error)
    }
    // a cover's text sheet edits the score it shows; Apply writes it into Song Sheet · Score
    let score: ReturnType<typeof scoreTargetOf> = null
    try {
      score = scoreTargetOf(node, payload, getPayload)
    } catch (error) {
      console.warn('Plenio: the score sheet of these lyrics was not found', error)
    }
    const api = fetcher
    openSheetDialog({
      title: node.title || 'Song Sheet',
      state: current,
      payload,
      asrNote: getAsrNote(payload?.docs.lyrics?.upstream_sha256),
      owned: owned.length ? owned : [...DOCUMENT_KINDS],
      review,
      fetcher,
      // a template's choice of the score editor's layout (review, text; daw with the DAW template)
      layout: typeof node.properties?.plenio_editor_layout === 'string' ? node.properties.plenio_editor_layout : null,
      // the Guide track (playback and MIDI only), kept in the node's properties with the workflow
      guide: parseGuide(node.properties?.plenio_guide),
      // the lyrics lines placed by hand in the lyrics lane, kept like the Guide notes
      lyricSpans: parseSpans(node.properties?.plenio_lyric_spans),
      // how far a cover's source recording is moved against the bars (the beat grid corrected by hand)
      sourceShift: parseShift(node.properties?.plenio_source_shift),
      lyricsTarget: lyrics?.target ?? null,
      scoreTarget: score?.target ?? null,
      onApply: (next, guide, arranged, changedScore, approved, extras) => {
        const before = String(widget.value ?? '')
        widget.value = serializeState(next)
        node.properties = {
          ...(node.properties ?? {}),
          plenio_guide: serializeGuide(guide),
          plenio_lyric_spans: (extras?.lyricSpans ?? []).map((span) => [...span]),
          plenio_source_shift: extras?.sourceShift ?? 0
        }
        // the node says it at once: Approve released the sheet (no need to wait for the next run), and
        // changed documents of a sheet that was approved need a new approval
        if (approved) setRunState(node, 'approved')
        else if (String(widget.value) !== before) unapprove(node)
        if (arranged !== null && lyrics && !lyrics.target.blocked) {
          writeLyrics(lyrics.owner, arranged, getPayload(String(lyrics.owner.id)))
          unapprove(lyrics.owner)
        }
        if (changedScore && score && !score.target.blocked) {
          const owner = score.owner
          void writeScore(owner, changedScore.text, getPayload(String(owner.id)), changedScore.approved ? { fetcher: api } : null).then(
            (written) => {
              if (written?.review?.approved_fingerprint) setRunState(owner, 'approved')
              else unapprove(owner)
            }
          )
        }
        node.setDirtyCanvas?.(true, true)
      }
    })
  }

  /** A sheet whose documents changed is no longer approved: it shows its review stop again. */
  function unapprove(sheet: ComfyNode): void {
    if (runState(sheet) === 'approved') setRunState(sheet, null)
  }

  const unsubscribe = [
    onPayload((nodeId) => {
      if (nodeId === String(node.id)) render()
    }),
    onRunState((changed) => {
      if (changed === null || changed === node) render()
    })
  ]
  // a removed node (another workflow loaded, the node deleted) stops listening: its graph is gone
  const removed = node.onRemoved
  node.onRemoved = function (this: ComfyNode) {
    for (const stop of unsubscribe) stop()
    removed?.call(this)
  }
  render()
  return { widget }
}
