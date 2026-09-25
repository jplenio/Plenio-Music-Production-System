import type { Fetcher } from '../api/client'
import type { ComfyNode, InputSpec, WidgetConstructor } from '../shared/comfy'
import { ownedBeforeRun } from '../shared/sheetSession'
import { DOCUMENT_KINDS, parseState, serializeState, summarize } from '../shared/sheetState'
import { getAsrNote, getPayload, onPayload } from './payloads'

export const SHEET_STATE_TYPE = 'PLENIO_SHEET_STATE'

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
  element.append(button, summary)

  const render = () => {
    const payload = getPayload(String(node.id))
    const status = payload ? ` · ${payload.status}` : ''
    summary.textContent = summarize(parseState(value)) + status
  }

  const widget = node.addDOMWidget(inputName, SHEET_STATE_TYPE, element, {
    getValue: () => value,
    setValue: (next: unknown) => {
      value = typeof next === 'string' ? next : ''
      render()
    },
    getMinHeight: () => 30,
    getMaxHeight: () => 30
  })

  button.addEventListener('click', async (event) => {
    event.stopPropagation()
    const state = parseState(value)
    if (state === null) {
      summary.textContent = 'The stored state is unreadable; it will be replaced when you apply.'
    }
    const payload = getPayload(String(node.id))
    const inputs = ((node as unknown as { inputs?: InputSlot[] }).inputs ?? []) as InputSlot[]
    const connected = inputs.filter((slot) => slot.link != null).map((slot) => slot.name)
    const current = state ?? { schema: 'plenio.sheet_state/1' as const, docs: {} }
    const owned = payload?.owned ?? ownedBeforeRun(connected, current)
    const review = String(node.widgets?.find((w) => w.name === 'review')?.value ?? 'continue')
    const { openSheetDialog } = await import('../sheet-editor/open')
    if (!fetcher) throw new Error('Plenio: API not initialised')
    openSheetDialog({
      title: node.title || 'Song Sheet',
      state: current,
      payload,
      asrNote: getAsrNote(payload?.docs.lyrics?.upstream_sha256),
      owned: owned.length ? owned : [...DOCUMENT_KINDS],
      review,
      fetcher,
      onApply: (next) => {
        widget.value = serializeState(next)
        node.setDirtyCanvas?.(true, true)
      }
    })
  })

  onPayload((nodeId) => {
    if (nodeId === String(node.id)) render()
  })
  render()
  return { widget }
}
