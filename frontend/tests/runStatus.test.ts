/**
 * Where a run stands (UX review before 0.3.0): the review stops are visible before a run, every Plenio
 * node shows its result after one, the node where the run stopped or failed gets a frame and a toast,
 * a new run clears the previous results, and the Song Sheet's widget line says the same in App mode.
 */
import { describe, expect, it, vi } from 'vitest'

import {
  LOOKS,
  badge,
  clearRunStates,
  displayState,
  installRunStatus,
  outputState,
  refreshRunStatus,
  runState,
  setRunState,
  sheetLine,
  sheetState,
  stopsForReview,
  summaryState
} from '../src/extension/runStatus'
import { SHEET_WIDGET_HEIGHT, sheetStateWidget } from '../src/extension/sheetStateWidget'
import type { ComfyNode, ComfyNodeType, ComfyWidget, DOMWidgetOptions } from '../src/shared/comfy'
import type { SheetPayload } from '../src/shared/sheetSession'

function payload(patch: Partial<SheetPayload> = {}): SheetPayload {
  return {
    schema: 'plenio.sheet_payload/1',
    owned: ['score'],
    docs: {},
    context: {},
    findings: [],
    fingerprint: 'f',
    review: 'stop for review',
    approved: false,
    waiting: true,
    status: 'waiting for approval',
    planning_mode: 'full',
    score_seconds: 60,
    validation: null,
    engine: 'yue2',
    instrumental: false,
    ...patch
  }
}

/** A fake canvas context that records what is drawn. */
function context(): CanvasRenderingContext2D & { calls: string[] } {
  const calls: string[] = []
  const record = (name: string) => (...args: unknown[]) => {
    calls.push(`${name}(${args.map((a) => (typeof a === 'number' ? Math.round(a) : String(a))).join(',')})`)
  }
  return {
    calls,
    save: record('save'),
    restore: record('restore'),
    beginPath: record('beginPath'),
    roundRect: record('roundRect'),
    rect: record('rect'),
    fill: record('fill'),
    stroke: record('stroke'),
    fillText: record('fillText'),
    measureText: (text: string) => ({ width: text.length * 6 }),
    set font(_value: string) {},
    set fillStyle(value: string) {
      calls.push(`fillStyle=${value}`)
    },
    set strokeStyle(value: string) {
      calls.push(`strokeStyle=${value}`)
    },
    set lineWidth(value: number) {
      calls.push(`lineWidth=${value}`)
    },
    set textBaseline(_value: string) {}
  } as unknown as CanvasRenderingContext2D & { calls: string[] }
}

function sheetNode(review: string, brief: ComfyNode | null = null, type = 'PlenioSongSheet'): ComfyNode {
  return {
    id: 7,
    type,
    title: 'Song Sheet · Score',
    properties: {},
    widgets: [{ name: 'review', type: 'combo', value: review, options: {} }],
    inputs: [{ name: 'score' }, { name: 'brief', link: 3 }],
    getInputNode: (slot: number) => (slot === 1 ? brief : null),
    size: [420, 460],
    badges: [],
    setDirtyCanvas: () => {},
    addDOMWidget: () => ({ name: 'x', type: 'x', value: '', options: {} })
  } as unknown as ComfyNode
}

function briefNode(mode: string): ComfyNode {
  return { id: 1, type: 'PlenioSongBrief', title: 'Song Brief', properties: {}, widgets: [{ name: 'mode', type: 'combo', value: mode, options: {} }] } as unknown as ComfyNode
}

describe('the states', () => {
  it('reads a summary status and a sheet payload', () => {
    expect(['ok', 'warning', 'error', 'skipped', 'nonsense', undefined].map(summaryState)).toEqual([
      'ok',
      'warning',
      'error',
      'skipped',
      null,
      null
    ])
    expect(sheetState(payload())).toBe('waiting')
    expect(sheetState(payload({ waiting: false, approved: true }))).toBe('approved')
    expect(sheetState(payload({ status: 'conflict: lyrics', waiting: false }))).toBe('error')
    expect(sheetState(payload({ status: 'invalid: 1 error', waiting: true }))).toBe('error')
    const warned = payload({ review: 'continue', waiting: false, findings: [{ severity: 'warning', message: 'm', where: 'lyrics' }] })
    expect(sheetState(warned)).toBe('warning')
    expect(sheetState(payload({ review: 'continue', waiting: false }))).toBe('ok')
    expect(outputState({ plenio_sheet: [payload()], plenio_summary: [{ status: 'skipped' }] })).toBe('waiting')
    expect(outputState({ plenio_summary: [{ status: 'warning' }] })).toBe('warning')
    expect(outputState({ plenio_eq: [] })).toBeNull()
  })

  it('knows which sheets stop for review before a run', () => {
    expect(stopsForReview('stop for review', null)).toBe(true)
    expect(stopsForReview('continue', 'one song, stop to review')).toBe(false)
    expect(stopsForReview('as the brief says', 'one song, stop to review')).toBe(true)
    expect(stopsForReview('as the brief says', 'one cover, stop to review')).toBe(true)
    expect(stopsForReview('as the brief says', 'new song every run')).toBe(false)
    expect(stopsForReview('as the brief says', null)).toBe(false) // no brief linked: the sheet continues
    expect(displayState(sheetNode('as the brief says', briefNode('one song, stop to review')))).toBe('stop')
    expect(displayState(sheetNode('as the brief says', briefNode('new song every run')))).toBeNull()
    expect(displayState(sheetNode('stop for review', null, 'PlenioEQ'))).toBeNull() // only sheets stop
  })

  it('says it in words for App mode', () => {
    expect(sheetLine('stop')).toContain('stops here for review')
    expect(sheetLine('waiting')).toContain('waiting for your approval')
    expect(sheetLine('approved')).toBe('✓ approved')
    expect(sheetLine(null)).toBe('▶ runs through, no review stop')
  })
})

describe('the badge and the frame', () => {
  it('draws a coloured badge, and nothing without a state', () => {
    const ctx = context()
    const empty = badge(null)
    expect(empty.height).toBe(0)
    expect(empty.getWidth(ctx)).toBe(0)
    empty.draw(ctx, 0, 0)
    expect(ctx.calls).toEqual([])
    const waiting = badge(LOOKS.waiting)
    expect(waiting.height).toBeGreaterThan(0)
    expect(waiting.getWidth(ctx)).toBeGreaterThan(100)
    waiting.draw(ctx, 10, -48)
    expect(ctx.calls).toContain(`fillStyle=${LOOKS.waiting.color}`)
    expect(ctx.calls.some((c) => c.startsWith('fillText(⏸ waiting for your approval'))).toBe(true)
    expect(badge(LOOKS.ok).getWidth(ctx)).toBeLessThan(30) // done is the icon alone
  })

  it('installs the badge, the frame and the toast on a node type, and a new run clears them', () => {
    const prototype = {} as ComfyNode & { onNodeCreated?: () => void }
    const toast = vi.fn()
    let scale = 0.5
    installRunStatus({ prototype } as ComfyNodeType, { scale: () => scale, toast })
    const brief = briefNode('one song, stop to review')
    const node = Object.assign(Object.create(prototype), sheetNode('as the brief says', brief)) as ComfyNode & {
      onNodeCreated: () => void
    }
    node.onNodeCreated()
    expect(node.badges).toHaveLength(1)
    const current = () => (node.badges?.[0] as () => ReturnType<typeof badge>)()
    const ctx = context()
    current().draw(ctx, 0, 0)
    expect(ctx.calls.some((c) => c.includes('review stop'))).toBe(true) // the holding point, before any run

    node.onExecuted?.({ plenio_sheet: [payload()], plenio_summary: [{ status: 'skipped', markdown: 'x' }] })
    expect(runState(node)).toBe('waiting')
    expect(toast).toHaveBeenCalledWith('Stopped at Song Sheet · Score', expect.stringContaining('Approve'))
    const frame = context()
    node.onDrawForeground?.(frame)
    expect(frame.calls).toContain(`strokeStyle=${LOOKS.waiting.color}`)
    expect(frame.calls).toContain('lineWidth=6') // 3 screen pixels at 50 %

    setRunState(node, 'approved')
    const none = context()
    node.onDrawForeground?.(none)
    expect(none.calls).toEqual([]) // no frame: the run went on
    scale = 1
    clearRunStates([node])
    expect(runState(node)).toBeNull()
    expect(displayState(node)).toBe('stop') // back to the holding point for the next run
    expect(toast).toHaveBeenCalledTimes(1)
  })
})

describe('a removed Song Sheet', () => {
  it('stops listening, and a node without a graph has no brief to follow', () => {
    const node = sheetNode('as the brief says', briefNode('one song, stop to review'))
    let element: HTMLElement | undefined
    node.addDOMWidget = (name: string, type: string, el: HTMLElement) => {
      element = el
      return { name, type, value: '', options: {}, element: el } as ComfyWidget
    }
    sheetStateWidget(node, 'sheet_state', ['PLENIO_SHEET_STATE', { default: '' }], {} as never)
    const line = () => element?.querySelector('.plenio-sheet-status')?.textContent
    expect(line()).toBe('⏸ stops here for review')
    // another workflow is loaded: LiteGraph removes the node, its graph is gone and getInputNode throws
    node.onRemoved?.()
    node.getInputNode = () => {
      throw new Error('NullGraphError')
    }
    expect(() => refreshRunStatus()).not.toThrow() // the frontend reported this from afterConfigureGraph
    setRunState(node, 'waiting')
    expect(line()).toBe('⏸ stops here for review') // not rendered again: it no longer listens
    expect(displayState(sheetNode('as the brief says', null))).toBeNull()
  })
})

describe('the Song Sheet widget line (App mode)', () => {
  it('shows the stop before a run and the waiting state after it', () => {
    let options: DOMWidgetOptions | undefined
    let element: HTMLElement | undefined
    const node = sheetNode('stop for review')
    node.addDOMWidget = (name: string, type: string, el: HTMLElement, opts?: DOMWidgetOptions) => {
      element = el
      options = opts
      const widget = { name, type, value: '', options: {}, element: el } as ComfyWidget
      node.widgets?.push(widget)
      return widget
    }
    sheetStateWidget(node, 'sheet_state', ['PLENIO_SHEET_STATE', { default: '' }], {} as never)
    const line = () => element?.querySelector('.plenio-sheet-status') as HTMLElement
    expect(line().textContent).toBe('⏸ stops here for review')
    expect(line().dataset.state).toBe('stop')
    expect(options?.getMinHeight?.()).toBe(SHEET_WIDGET_HEIGHT)
    setRunState(node, 'waiting')
    expect(line().textContent).toContain('waiting for your approval')
    // continue: the sheet runs through - said as well, and the widget keeps its two rows
    const review = node.widgets?.find((w) => w.name === 'review')
    if (review) {
      review.value = 'continue'
      review.callback?.('continue')
    }
    clearRunStates([node])
    expect(line().textContent).toBe('▶ runs through, no review stop')
    expect(options?.getMinHeight?.()).toBe(SHEET_WIDGET_HEIGHT)
  })
})
