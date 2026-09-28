/**
 * The EQ panel's direct manipulation (the owner's report, 2026-09-28): a drag on a handle moves the
 * band and keeps the handle it grabbed, and Delete removes the band it acts on.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { Fetcher } from '../src/api/client'
import { addEqCurve } from '../src/extension/eqWidget'
import { type Band, type EqSettings, parseSettings, withRange, xOf, yOf } from '../src/shared/eqCurve'
import { type Host, host } from './fixtures/host'

const BAND: Band = { id: 'b1', enabled: true, type: 'peak', frequency_hz: 1000, gain_db: 3, q: 1, slope: 1 }
/** The plot the panel draws: 560 x 260 px, the default +-12 dB range between the two strips. */
const BOX = withRange({ width: 560, height: 260, maxHz: 20000 }, 12)
const FREQUENCIES = Array.from({ length: 200 }, (_unused, index) => 20 * 1000 ** (index / 199))

/** The panel's two routes: the exact response (echoing the settings back) and the presets. */
function fetcher(): Fetcher {
  return {
    fetchApi: (route: string, options?: RequestInit) => {
      const body = JSON.parse(String(options?.body ?? '{}')) as { settings?: EqSettings }
      const payload =
        route === '/plenio/presets/eq'
          ? { manual: [] }
          : {
              settings: body.settings,
              frequency_hz: FREQUENCIES,
              response_db: FREQUENCIES.map((hz) => Math.sin(hz / 4000)),
              bands: []
            }
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(payload) } as unknown as Response)
    }
  }
}

function pointer(type: string, x: number, y: number): PointerEvent {
  return new PointerEvent(type, { clientX: x, clientY: y, bubbles: true })
}

function plotOf(node: Host): SVGSVGElement {
  const plot = node.root.querySelector('svg.plenio-eq-plot')
  if (!plot) throw new Error('the plot is not drawn')
  return plot as unknown as SVGSVGElement
}

async function mount(): Promise<Host> {
  const settings: EqSettings = { schema: 'plenio.eq/1', preamp_db: 0, bands: [BAND] }
  const node = host({ mode: 'manual', 'mode.bands': JSON.stringify(settings) })
  addEqCurve(node.node, fetcher())
  await vi.waitFor(() => expect(node.root.querySelector('circle.handle')).toBeTruthy())
  return node
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('the EQ panel', () => {
  it('moves the band with the pointer and keeps the handle it grabbed', async () => {
    const node = await mount()
    const plot = plotOf(node)
    const start = { x: xOf(BOX, 1000), y: yOf(BOX, 3) }
    ;(plot.querySelector('circle.handle') as SVGCircleElement).dispatchEvent(pointer('pointerdown', start.x, start.y))
    // the click selects the band and redraws once - from here the drag paints without a rebuild
    const handle = plot.querySelector('circle.handle') as SVGCircleElement
    expect(handle.getAttribute('class')).toContain('selected')
    window.dispatchEvent(pointer('pointermove', start.x + 56, start.y - 26))
    window.dispatchEvent(pointer('pointermove', start.x + 112, start.y - 52))
    expect(plot.querySelector('circle.handle')).toBe(handle) // the pointer keeps the handle it grabbed
    expect(Number(handle.getAttribute('cy'))).toBeLessThan(start.y)
    window.dispatchEvent(pointer('pointerup', start.x + 112, start.y - 52))
    const written = parseSettings(node.value('mode.bands'))!
    expect(written.bands).toHaveLength(1)
    expect(written.bands[0].gain_db).toBeGreaterThan(3)
    expect(written.bands[0].frequency_hz).toBeGreaterThan(1000)
  })

  it('removes the band that Delete reaches', async () => {
    const node = await mount()
    const plot = plotOf(node)
    const start = { x: xOf(BOX, 1000), y: yOf(BOX, 3) }
    ;(plot.querySelector('circle.handle') as SVGCircleElement).dispatchEvent(pointer('pointerdown', start.x, start.y))
    window.dispatchEvent(pointer('pointerup', start.x, start.y))
    const handle = plot.querySelector('circle.handle') as SVGCircleElement
    handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }))
    expect(parseSettings(node.value('mode.bands'))!.bands).toEqual([])
    expect(node.root.querySelector('circle.handle')).toBeNull()
  })
})
