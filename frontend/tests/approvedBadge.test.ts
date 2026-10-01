/**
 * Approve shows on the node at once (owner's request 2026-10-02): the Song Sheet's badge and widget
 * line turn to "approved" when Approve is pressed in the editor - not only after the next run - and an
 * Apply that changes the documents of an approved sheet takes the approval back.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'

import { displayState, runState, setRunState } from '../src/extension/runStatus'
import { setFetcher, sheetStateWidget } from '../src/extension/sheetStateWidget'
import type { ComfyNode, ComfyWidget } from '../src/shared/comfy'
import type { SheetState } from '../src/shared/sheetState'

type ApplyArgs = [SheetState, unknown[], string | null, null, boolean]
const opened: { onApply: (...args: ApplyArgs) => void }[] = []
vi.mock('../src/sheet-editor/open', () => ({
  openSheetDialog: (options: { onApply: (...args: ApplyArgs) => void }) => {
    opened.push(options)
    return () => undefined
  }
}))

afterEach(() => {
  opened.length = 0
})

function sheet(): { node: ComfyNode; element: () => HTMLElement } {
  let element: HTMLElement | undefined
  const widgets: ComfyWidget[] = [{ name: 'review', type: 'combo', value: 'stop for review', options: {} }]
  const node = {
    id: 9,
    type: 'PlenioSongSheet',
    title: 'Song Sheet · Text',
    properties: {},
    widgets,
    inputs: [],
    badges: [],
    setDirtyCanvas: () => {},
    addDOMWidget: (name: string, type: string, el: HTMLElement, options: { getValue(): unknown; setValue(v: unknown): void }) => {
      element = el
      const widget = {
        name,
        type,
        options: {},
        element: el,
        get value() {
          return options.getValue()
        },
        set value(next: unknown) {
          options.setValue(next)
        }
      } as unknown as ComfyWidget
      widgets.push(widget)
      return widget
    }
  } as unknown as ComfyNode
  sheetStateWidget(node, 'sheet_state', ['PLENIO_SHEET_STATE', { default: '' }], {} as never)
  return { node, element: () => element as HTMLElement }
}

async function openAndApply(element: () => HTMLElement, state: SheetState, approved: boolean): Promise<void> {
  ;(element().querySelector('button') as HTMLButtonElement).click()
  await vi.waitFor(() => expect(opened.length).toBeGreaterThan(0))
  opened[opened.length - 1].onApply(state, [], null, null, approved)
}

const docs = (text: string): SheetState => ({ schema: 'plenio.sheet_state/1', docs: { lyrics: { state: 'manual', text } } })

describe('Approve in the editor', () => {
  setFetcher({ fetchApi: () => Promise.reject(new Error('no server')) })

  it('shows approved on the node at once, and a changed Apply takes it back', async () => {
    const { node, element } = sheet()
    setRunState(node, 'waiting') // the run stopped here
    const line = () => element().querySelector('.plenio-sheet-status')?.textContent
    expect(line()).toContain('waiting for your approval')

    await openAndApply(element, { ...docs('la'), review: { approved_fingerprint: 'f' } }, true)
    expect(runState(node)).toBe('approved')
    expect(line()).toBe('✓ approved')

    // Apply without changes keeps it; Apply with changed documents takes it back (the review stop shows)
    await openAndApply(element, { ...docs('la'), review: { approved_fingerprint: 'f' } }, false)
    expect(runState(node)).toBe('approved')
    await openAndApply(element, { ...docs('la la'), review: { approved_fingerprint: 'f' } }, false)
    expect(runState(node)).toBeNull()
    expect(displayState(node)).toBe('stop')
  })

  it('leaves a waiting sheet waiting when it is only applied', async () => {
    const { node, element } = sheet()
    setRunState(node, 'waiting')
    await openAndApply(element, docs('edited'), false)
    expect(runState(node)).toBe('waiting')
  })
})
