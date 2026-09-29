/**
 * Where a run stands, shown on the nodes (UX review before 0.3.0):
 *
 * - before a run, every Song Sheet that will stop for review carries **⏸ review stop** - the holding
 *   points of the workflow are visible before anything runs;
 * - after a run, every Plenio node that ran carries its result: **✓**, **⚠ warning**, **✖ error**, and
 *   the Song Sheets **⏸ waiting for your approval** or **✓ approved**;
 * - the node where the run stopped or failed also gets a coloured frame, which stays visible when the
 *   canvas is zoomed out (the frontend hides badges then), and a toast says where the run stopped;
 * - a new run clears the previous run's results, so the canvas shows how far *this* run got.
 *
 * The badges use the frontend's own badge row above the title bar (``node.badges``: an entry that is not
 * an ``LGraphBadge`` is called and must return an object with ``height``, ``getWidth`` and ``draw``).
 * Nothing here is saved with the workflow.
 */
import { type ComfyNode, type ComfyNodeType, chain } from '../shared/comfy'
import type { SheetPayload } from '../shared/sheetSession'

export type RunState = 'stop' | 'waiting' | 'approved' | 'ok' | 'warning' | 'error' | 'skipped'

export interface Look {
  icon: string
  /** The badge text after the icon (empty: the icon alone, for the quiet *done*). */
  label: string
  color: string
  /** A frame around the node: the run stopped or failed here. */
  frame: boolean
}

export const LOOKS: Record<RunState, Look> = {
  stop: { icon: '⏸', label: 'review stop', color: '#2f6fb0', frame: false },
  waiting: { icon: '⏸', label: 'waiting for your approval', color: '#c98a12', frame: true },
  approved: { icon: '✓', label: 'approved', color: '#2f8a55', frame: false },
  ok: { icon: '✓', label: '', color: '#2f8a55', frame: false },
  warning: { icon: '⚠', label: 'warning', color: '#b87a0a', frame: false },
  error: { icon: '✖', label: 'error', color: '#c0392b', frame: true },
  skipped: { icon: '–', label: 'not needed', color: '#5d6b80', frame: false }
}

/** The state a node summary's status stands for (``plenio_summary``: ok, warning, error, skipped). */
export function summaryState(status: string | undefined): RunState | null {
  return status === 'ok' || status === 'warning' || status === 'error' || status === 'skipped' ? status : null
}

/** Whether a Song Sheet stops for review: its own *review*, or with *as the brief says* the brief's mode. */
export function stopsForReview(review: string, briefMode: string | null | undefined): boolean {
  if (review === 'stop for review') return true
  if (review === 'as the brief says') return !!briefMode && briefMode.includes('stop to review')
  return false
}

/** A Song Sheet's state after a run, from its payload. */
export function sheetState(payload: SheetPayload): RunState {
  if (/^(conflict|invalid)/.test(payload.status)) return 'error'
  if (payload.waiting) return 'waiting'
  if (payload.review === 'stop for review' && payload.approved) return 'approved'
  const severities = new Set(payload.findings.map((finding) => finding.severity))
  return severities.has('error') ? 'error' : severities.has('warning') ? 'warning' : 'ok'
}

/** The line a Song Sheet's widget shows (also in App mode, where the canvas badges are not visible). */
export function sheetLine(state: RunState | null): string {
  switch (state) {
    case 'stop':
      return '⏸ stops here for review'
    case 'waiting':
      return '⏸ waiting for your approval: Edit, Approve, run again'
    case 'approved':
      return '✓ approved'
    case 'error':
      return '✖ fix the sheet (Edit Song Sheet…)'
    case 'warning':
      return '⚠ warnings'
    case 'ok':
      return '✓ passed'
    case 'skipped':
      return '– not needed'
    default:
      // no stop and no run yet: say so, the holding points are the sheets that do stop
      return '▶ runs through, no review stop'
  }
}

// --- the run's states ------------------------------------------------------------------------------

const states = new WeakMap<ComfyNode, RunState>()
const listeners = new Set<(node: ComfyNode | null) => void>()

export function runState(node: ComfyNode): RunState | null {
  return states.get(node) ?? null
}

export function setRunState(node: ComfyNode, state: RunState | null): void {
  if (state) states.set(node, state)
  else states.delete(node)
  node.setDirtyCanvas?.(true, true)
  for (const listener of listeners) listener(node)
}

/** A new run starts: the previous run's results go, so the canvas shows how far this run gets. */
export function clearRunStates(nodes: Iterable<ComfyNode>): void {
  for (const node of nodes) states.delete(node)
  for (const listener of listeners) listener(null)
}

/** Ask every display to render again (a workflow was loaded: links and the brief's mode are known now). */
export function refreshRunStatus(): void {
  for (const listener of listeners) listener(null)
}

/** Called with the node whose state changed (``null``: all of them). */
export function onRunState(listener: (node: ComfyNode | null) => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// --- drawing -----------------------------------------------------------------------------------------

const FONT = '600 12px sans-serif'
const HEIGHT = 20
const PADDING = 7

export interface Badge {
  height: number
  getWidth(ctx: CanvasRenderingContext2D): number
  draw(ctx: CanvasRenderingContext2D, x: number, y: number): void
}

export function badgeText(look: Look): string {
  return look.label ? `${look.icon} ${look.label}` : look.icon
}

/** A badge for the frontend's badge row; ``null`` draws nothing (zero width). */
export function badge(look: Look | null): Badge {
  const text = look ? badgeText(look) : ''
  return {
    height: look ? HEIGHT : 0,
    getWidth(ctx) {
      if (!look) return 0
      ctx.save()
      ctx.font = FONT
      const width = ctx.measureText(text).width + 2 * PADDING
      ctx.restore()
      return width
    },
    draw(ctx, x, y) {
      if (!look) return
      ctx.save()
      ctx.font = FONT
      const width = ctx.measureText(text).width + 2 * PADDING
      ctx.fillStyle = look.color
      ctx.beginPath()
      if (typeof ctx.roundRect === 'function') ctx.roundRect(x, y, width, HEIGHT, 5)
      else ctx.rect(x, y, width, HEIGHT)
      ctx.fill()
      ctx.fillStyle = '#ffffff'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, x + PADDING, y + HEIGHT / 2 + 0.5)
      ctx.restore()
    }
  }
}

// --- the nodes ---------------------------------------------------------------------------------------

export const SHEET_TYPE = 'PlenioSongSheet'
const TITLE_HEIGHT = 30

/** What the run-status display needs from the host (the canvas scale and the toast). */
export interface StatusHost {
  scale(): number
  toast(summary: string, detail: string): void
}

function widgetValue(node: ComfyNode, name: string): string | null {
  const widget = node.widgets?.find((w) => w.name === name)
  return widget ? String(widget.value ?? '') : null
}

/** The mode of the brief a Song Sheet is linked to (``null``: none linked). */
export function briefMode(node: ComfyNode): string | null {
  const index = node.inputs?.findIndex((slot) => slot.name === 'brief') ?? -1
  if (index < 0) return null
  try {
    const brief = node.getInputNode?.(index)
    return brief ? widgetValue(brief, 'mode') : null
  } catch {
    return null // a node without a graph (being removed): no link to follow
  }
}

/** The state a node shows now: this run's result, or - for a Song Sheet before a run - its stop. */
export function displayState(node: ComfyNode): RunState | null {
  const state = runState(node)
  if (state) return state
  if (node.type !== SHEET_TYPE) return null
  return stopsForReview(widgetValue(node, 'review') ?? 'continue', briefMode(node)) ? 'stop' : null
}

/** The state a Plenio node's execution output stands for: a Song Sheet by its payload, others by summary. */
export function outputState(output: Record<string, unknown> | undefined): RunState | null {
  const sheets = output?.plenio_sheet as SheetPayload[] | undefined
  const sheet = sheets?.[sheets.length - 1]
  if (sheet) return sheetState(sheet)
  const summaries = output?.plenio_summary as { status?: string }[] | undefined
  return summaryState(summaries?.[summaries.length - 1]?.status)
}

/** Attach the status badge and frame to a Plenio node type (called from beforeRegisterNodeDef). */
export function installRunStatus(nodeType: ComfyNodeType, host: StatusHost): void {
  type Created = { onNodeCreated?: () => void }
  const prototype = nodeType.prototype as ComfyNode & Created
  const created = prototype.onNodeCreated
  prototype.onNodeCreated = function (this: ComfyNode) {
    created?.call(this)
    const node = this
    // the frontend calls a non-LGraphBadge entry on every draw: the badge always shows the current state
    node.badges?.push(() => {
      const state = displayState(node)
      return badge(state ? LOOKS[state] : null)
    })
  }
  prototype.onDrawForeground = chain(prototype.onDrawForeground, function (this: ComfyNode, ctx: CanvasRenderingContext2D) {
    const state = displayState(this)
    if (!state || !LOOKS[state].frame || this.flags?.collapsed || !this.size) return
    drawFrame(ctx, LOOKS[state], this.size, TITLE_HEIGHT, host.scale())
  })
  prototype.onExecuted = chain(prototype.onExecuted, function (this: ComfyNode, output) {
    const state = outputState(output)
    if (!state) return
    setRunState(this, state)
    if (state === 'waiting') {
      host.toast(
        `Stopped at ${this.title || 'the Song Sheet'}`,
        'Waiting for your approval: open it with "Edit Song Sheet…", check the documents, press Approve, then run again.'
      )
    }
  })
}

/** The frame around a node the run stopped or failed at (drawn in ``onDrawForeground``). */
export function drawFrame(
  ctx: CanvasRenderingContext2D,
  look: Look,
  size: [number, number],
  titleHeight: number,
  scale: number
): void {
  // at least 3 screen pixels, so the frame is found on a zoomed-out canvas
  const width = Math.max(3, 3 / Math.max(scale, 0.05))
  ctx.save()
  ctx.strokeStyle = look.color
  ctx.lineWidth = width
  ctx.beginPath()
  const inset = width / 2 + 3
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(-inset, -titleHeight - inset, size[0] + 2 * inset, size[1] + titleHeight + 2 * inset, 10)
  } else {
    ctx.rect(-inset, -titleHeight - inset, size[0] + 2 * inset, size[1] + titleHeight + 2 * inset)
  }
  ctx.stroke()
  ctx.restore()
}
