/**
 * Sizes of the Song Sheet window and its panes (owner's request, 2026-09-28): the window is
 * resizable and can fill the browser window, and the score's areas are draggable - the piano roll,
 * the notation/ABC-text split and the side column (navigator, track panel, lyrics fit).
 *
 * All arithmetic lives here so it can be tested without a DOM; the components only wire pointer
 * events and write the numbers into the editor preferences (this browser's localStorage).
 */

export interface Viewport {
  width: number
  height: number
}

export interface DialogGeometry {
  width: number
  height: number
  /** Fill the browser window (the *Maximize* button; double-clicking the header does the same). */
  maximized: boolean
}

/** The gap a maximized window keeps to the browser window's edge. */
export const DIALOG_MARGIN = 12
export const DIALOG_MIN = { width: 640, height: 420 }
export const DIALOG_DEFAULT = { width: 1280, height: 900 }
export const ROLL_MIN = 120
export const ROLL_MAX = 720
export const NOTATION_MIN = 0.25
export const NOTATION_MAX = 0.85
export const SIDE_MIN = 160
export const SIDE_MAX = 460

const KEY = 'plenio.sheet.dialog'

export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(Math.max(value, min), Math.max(min, max))
}

/** A window size that fits the viewport: never smaller than the minimum, never larger than the window. */
export function clampDialog(size: { width: number; height: number }, viewport: Viewport): { width: number; height: number } {
  const width = clamp(size.width, DIALOG_MIN.width, Math.max(DIALOG_MIN.width, viewport.width - 16))
  const height = clamp(size.height, DIALOG_MIN.height, Math.max(DIALOG_MIN.height, viewport.height - 16))
  return { width: Math.round(width), height: Math.round(height) }
}

/** The piano-roll height after a vertical drag (the splitter above it). */
export function rollHeightAfter(start: number, dy: number): number {
  return Math.round(clamp(start + dy, ROLL_MIN, ROLL_MAX))
}

/** The notation's share of the notation/ABC-text column after a drag inside it. */
export function shareAfter(startShare: number, dy: number, containerHeight: number): number {
  if (!Number.isFinite(containerHeight) || containerHeight <= 0) return shareValue(startShare)
  return shareValue(startShare + dy / containerHeight)
}

/** A notation share clamped to its range (used by the keyboard nudges too). */
export function shareValue(share: number): number {
  return Math.round(clamp(share, NOTATION_MIN, NOTATION_MAX) * 1000) / 1000
}

/** The side column's width after a horizontal drag (the splitter right of it). */
export function sideWidthAfter(start: number, dx: number): number {
  return Math.round(clamp(start + dx, SIDE_MIN, SIDE_MAX))
}

/**
 * Wire a splitter or resize grip: ``update`` receives the pointer's delta from the start, ``done``
 * runs once on release (where the caller saves). Removes its listeners; the component stays thin.
 */
export function beginDrag(
  event: PointerEvent,
  update: (delta: { dx: number; dy: number }) => void,
  done?: () => void
): void {
  const startX = event.clientX
  const startY = event.clientY
  const target = event.currentTarget as HTMLElement | null
  target?.setPointerCapture?.(event.pointerId)
  const move = (moveEvent: PointerEvent) => update({ dx: moveEvent.clientX - startX, dy: moveEvent.clientY - startY })
  const up = () => {
    target?.releasePointerCapture?.(event.pointerId)
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerup', up)
    done?.()
  }
  window.addEventListener('pointermove', move)
  window.addEventListener('pointerup', up)
}

export function defaultGeometry(): DialogGeometry {
  return { ...DIALOG_DEFAULT, maximized: false }
}

export function loadGeometry(storage: Pick<Storage, 'getItem'> | null = safeStorage()): DialogGeometry {
  const defaults = defaultGeometry()
  try {
    const raw = storage?.getItem(KEY)
    if (!raw) return defaults
    const data = JSON.parse(raw) as Partial<DialogGeometry>
    const size = clampDialog(
      {
        width: typeof data.width === 'number' ? data.width : defaults.width,
        height: typeof data.height === 'number' ? data.height : defaults.height
      },
      { width: window.innerWidth, height: window.innerHeight }
    )
    return { ...size, maximized: data.maximized === true }
  } catch {
    return defaults
  }
}

export function saveGeometry(
  geometry: DialogGeometry,
  storage: Pick<Storage, 'setItem'> | null = safeStorage()
): void {
  try {
    storage?.setItem(KEY, JSON.stringify(geometry))
  } catch {
    // storage full or blocked: the window size is a convenience only
  }
}

function safeStorage(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}
