/**
 * The EQ curve under a Plenio EQ node: the response the node applies (computed by the backend), with
 * band handles in *manual* mode. Drag a handle to change frequency and gain, use the wheel (or + / -)
 * for Q, double-click the plot to add a band, Delete / right-click to remove it. The bands live in the
 * node's own ``mode.bands`` text widget, so the workflow stores them like any other widget value; this
 * display is not serialised. In the match modes the last applied proposal is shown read-only.
 */
import { type EqPreset, type Fetcher, eqPresets, eqResponse } from '../api/client'
import type { ComfyNode, ComfyWidget } from '../shared/comfy'
import {
  type EqSettings,
  type Plot,
  addBand,
  curvePath,
  dbOf,
  describeBand,
  flat,
  hzOf,
  moveBand,
  parseSettings,
  removeBand,
  scaleQ,
  serialize,
  xOf,
  yOf
} from '../shared/eqCurve'

const SVG = 'http://www.w3.org/2000/svg'
const WIDGET = 'plenio_eq_curve'
const PLOT: Plot = { width: 360, height: 150, maxHz: 20000 }
let presets: Promise<EqPreset[]> | null = null

interface Shown {
  sampleRate: number
  frequencies: number[]
  response: number[]
  settings: EqSettings
  readonly: boolean
  note: string
}

function svg(name: string, attributes: Record<string, string | number>): SVGElement {
  const element = document.createElementNS(SVG, name)
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, String(value))
  return element
}

function widget(node: ComfyNode, name: string): ComfyWidget | undefined {
  return node.widgets?.find((w) => w.name === name)
}

function mode(node: ComfyNode): string {
  return String(widget(node, 'mode')?.value ?? 'flat')
}

export function addEqCurve(node: ComfyNode, fetcher: Fetcher): { showExecuted(output: Record<string, unknown>): void } {
  const root = document.createElement('div')
  root.className = 'plenio-eq'
  const toolbar = document.createElement('div')
  toolbar.className = 'plenio-eq-tools'
  const presetSelect = document.createElement('select')
  presetSelect.setAttribute('aria-label', 'EQ preset')
  const info = document.createElement('span')
  info.className = 'plenio-eq-info'
  info.setAttribute('aria-live', 'polite')
  toolbar.append(presetSelect, info)
  const plot = svg('svg', { viewBox: `0 0 ${PLOT.width} ${PLOT.height}`, class: 'plenio-eq-plot', role: 'img' })
  plot.setAttribute('aria-label', 'EQ response curve')
  root.append(toolbar, plot)
  node.addDOMWidget(WIDGET, WIDGET, root, { serialize: false, getValue: () => '', setValue: () => {}, getMinHeight: () => 200 })

  let shown: Shown = { sampleRate: 48000, frequencies: [], response: [], settings: flat(), readonly: true, note: '' }
  let selected: string | null = null
  let request = 0
  let timer: ReturnType<typeof setTimeout> | undefined

  const bandsWidget = () => widget(node, 'mode.bands')

  function writeBands(settings: EqSettings): void {
    const target = bandsWidget()
    if (!target) return
    const text = serialize(settings)
    target.value = text
    target.callback?.(text)
    shown = { ...shown, settings }
    draw()
    refresh(0)
  }

  async function refresh(delay = 120): Promise<void> {
    clearTimeout(timer)
    timer = setTimeout(async () => {
      const current = mode(node)
      if (current !== 'manual') {
        shown = current === 'flat'
          ? { ...shown, settings: flat(), response: shown.frequencies.map(() => 0), readonly: true, note: 'flat: no change' }
          : { ...shown, readonly: true, note: shown.note || 'the applied proposal appears here after a run' }
        draw()
        return
      }
      const settings = parseSettings(bandsWidget()?.value)
      if (!settings) {
        shown = { ...shown, readonly: true, note: 'the bands are not valid JSON' }
        draw()
        return
      }
      const id = ++request
      try {
        const result = await eqResponse(fetcher, settings, shown.sampleRate)
        if (id !== request) return // an answer for older bands
        shown = {
          ...shown,
          frequencies: result.frequency_hz,
          response: result.response_db,
          settings: result.settings,
          readonly: false,
          note: ''
        }
      } catch (error) {
        shown = { ...shown, readonly: false, note: error instanceof Error ? error.message : String(error) }
      }
      draw()
    }, delay)
  }

  function draw(): void {
    plot.replaceChildren()
    const limit = { ...PLOT, maxHz: Math.min(PLOT.maxHz, shown.sampleRate / 2) }
    for (const db of [-12, -6, 0, 6, 12]) {
      plot.append(svg('line', { x1: 0, x2: PLOT.width, y1: yOf(limit, db), y2: yOf(limit, db), class: db ? 'grid' : 'grid zero' }))
    }
    for (const hz of [100, 1000, 10000]) {
      plot.append(svg('line', { x1: xOf(limit, hz), x2: xOf(limit, hz), y1: 0, y2: PLOT.height, class: 'grid' }))
    }
    if (shown.frequencies.length) {
      plot.append(svg('path', { d: curvePath(limit, shown.frequencies, shown.response), class: 'curve' }))
    }
    if (!shown.readonly) {
      for (const band of shown.settings.bands) {
        const handle = svg('circle', {
          cx: xOf(limit, band.frequency_hz),
          cy: yOf(limit, ['peak', 'low_shelf', 'high_shelf'].includes(band.type) ? band.gain_db : 0),
          r: band.id === selected ? 7 : 5.5,
          class: band.id === selected ? 'handle selected' : 'handle',
          tabindex: 0
        })
        handle.setAttribute('aria-label', describeBand(band))
        handle.addEventListener('pointerdown', (event) => startDrag(event as PointerEvent, band.id, limit))
        handle.addEventListener('focus', () => select(band.id))
        handle.addEventListener('keydown', (event) => onKey(event as KeyboardEvent, band.id))
        handle.addEventListener('wheel', (event) => {
          event.preventDefault()
          writeBands(scaleQ(shown.settings, band.id, (event as WheelEvent).deltaY < 0 ? 1.15 : 1 / 1.15))
        })
        handle.addEventListener('contextmenu', (event) => {
          event.preventDefault()
          writeBands(removeBand(shown.settings, band.id))
        })
        plot.append(handle)
      }
    }
    const band = shown.settings.bands.find((b) => b.id === selected)
    info.textContent =
      shown.note ||
      (band
        ? describeBand(band)
        : shown.readonly
          ? `${shown.settings.bands.length} band(s)`
          : 'double-click to add a band; drag, wheel = Q, right-click = remove')
    presetSelect.disabled = shown.readonly
    node.setDirtyCanvas?.(true, true)
  }

  function select(id: string | null): void {
    selected = id
    draw()
  }

  function startDrag(event: PointerEvent, id: string, limit: Plot): void {
    event.preventDefault()
    event.stopPropagation()
    select(id)
    const box = plot.getBoundingClientRect()
    const move = (e: PointerEvent) => {
      const x = ((e.clientX - box.left) / box.width) * PLOT.width
      const y = ((e.clientY - box.top) / box.height) * PLOT.height
      shown = { ...shown, settings: moveBand(shown.settings, id, hzOf(limit, x), dbOf(limit, y), shown.sampleRate) }
      draw()
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      writeBands(shown.settings)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  function onKey(event: KeyboardEvent, id: string): void {
    const band = shown.settings.bands.find((b) => b.id === id)
    if (!band) return
    const step = event.shiftKey ? 0.1 : 0.5
    const ratio = event.shiftKey ? 1.01 : 1.06
    let next: EqSettings | null = null
    if (event.key === 'ArrowUp') next = moveBand(shown.settings, id, band.frequency_hz, band.gain_db + step, shown.sampleRate)
    else if (event.key === 'ArrowDown') next = moveBand(shown.settings, id, band.frequency_hz, band.gain_db - step, shown.sampleRate)
    else if (event.key === 'ArrowRight') next = moveBand(shown.settings, id, band.frequency_hz * ratio, band.gain_db, shown.sampleRate)
    else if (event.key === 'ArrowLeft') next = moveBand(shown.settings, id, band.frequency_hz / ratio, band.gain_db, shown.sampleRate)
    else if (event.key === '+') next = scaleQ(shown.settings, id, 1.15)
    else if (event.key === '-') next = scaleQ(shown.settings, id, 1 / 1.15)
    else if (event.key === 'Delete' || event.key === 'Backspace') next = removeBand(shown.settings, id)
    if (next) {
      event.preventDefault()
      writeBands(next)
    }
  }

  plot.addEventListener('dblclick', (event) => {
    if (shown.readonly) return
    const box = plot.getBoundingClientRect()
    const limit = { ...PLOT, maxHz: Math.min(PLOT.maxHz, shown.sampleRate / 2) }
    const x = (((event as MouseEvent).clientX - box.left) / box.width) * PLOT.width
    const y = (((event as MouseEvent).clientY - box.top) / box.height) * PLOT.height
    const next = addBand(shown.settings, hzOf(limit, x), dbOf(limit, y), shown.sampleRate)
    if (next) {
      selected = next.bands[next.bands.length - 1].id
      writeBands(next)
    } else {
      shown = { ...shown, note: 'the EQ has at most 8 bands' }
      draw()
    }
  })

  presetSelect.append(new Option('preset…', ''))
  presets ??= eqPresets(fetcher).then((data) => data.manual).catch(() => [])
  void presets.then((items) => {
    for (const item of items) presetSelect.append(new Option(item.name, item.name))
  })
  presetSelect.addEventListener('change', async () => {
    const item = (await presets)?.find((p) => p.name === presetSelect.value)
    presetSelect.value = ''
    if (item) writeBands({ ...item.settings, bands: item.settings.bands.slice(0, 8) })
  })

  // follow mode changes and typed bands
  const watch = (name: string) => {
    const target = widget(node, name)
    if (!target) return
    const original = target.callback
    target.callback = (value: unknown) => {
      original?.(value)
      setTimeout(() => {
        watch('mode.bands')
        void refresh()
      })
    }
  }
  watch('mode')
  watch('mode.bands')
  void refresh(0)

  return {
    showExecuted(output) {
      const items = output?.plenio_eq as
        | { settings: EqSettings; sample_rate: number; frequency_hz: number[]; response_db: number[] }[]
        | undefined
      const last = items?.[items.length - 1]
      if (!last) return
      const manual = mode(node) === 'manual'
      shown = {
        sampleRate: last.sample_rate,
        frequencies: last.frequency_hz,
        response: last.response_db,
        settings: last.settings,
        readonly: !manual,
        note: manual ? '' : `applied: ${last.settings.bands.length} band(s)`
      }
      if (!manual) draw()
      else void refresh(0)
    }
  }
}
