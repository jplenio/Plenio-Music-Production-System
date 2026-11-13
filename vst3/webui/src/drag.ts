// Dragging a take's files out of the plug-in onto the DAW's tracks: the plug-in starts the system's drag once the
// mouse moved a few pixels with the button down (the files are made beforehand: `daw.prepare`).

import { call } from './bridge'
import { toast } from './store'

export interface DragWhat {
  index: number
  what: 'take' | 'stems' | 'stem' | 'midi' | 'tempo' | 'click' | 'all'
  stem?: string
}

export function dragToDaw(e: PointerEvent, what: DragWhat): void {
  if (e.button !== 0) return
  e.preventDefault()
  const x0 = e.clientX
  const y0 = e.clientY
  const move = (m: PointerEvent) => {
    if (Math.hypot(m.clientX - x0, m.clientY - y0) < 5) return
    stop()
    call<{ state: string }>('daw.drag', what as unknown as Record<string, unknown>)
      .then((r) => {
        if (r.state === 'preparing') toast('The files for the DAW are being made: drag again in a moment.')
        else if (r.state === 'failed') toast('The drag did not start. Try again, or use “Show the files”.', true)
      })
      .catch((error: unknown) => toast(error instanceof Error ? error.message : String(error), true))
  }
  const stop = () => {
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerup', stop)
  }
  window.addEventListener('pointermove', move)
  window.addEventListener('pointerup', stop)
}
