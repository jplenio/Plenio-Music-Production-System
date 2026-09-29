/**
 * The EQ panel under a Plenio EQ node (next-release plan §5): a large direct-manipulation curve with
 * the last run's spectrum behind it, a band strip whose chips open an inline editor, a toolbar
 * (preset, gain range, undo/redo, reset, bypass-compare, the raw bands as text) and the mode row.
 *
 * The bands live in the node's own ``mode.bands`` text widget (``plenio.eq/1``) - that value is the
 * store, and this panel is display only (never serialised). The curve itself is the node's exact
 * response, computed by the backend (``/plenio/eq/response``); a match proposal is shown read-only
 * until *Edit these bands* copies it into *manual*.
 */
import { type EqPreset, type Fetcher, eqPresets, eqResponse } from '../api/client'
import type { ComfyNode, ComfyWidget } from '../shared/comfy'
import {
  type BandType,
  BAND_NAMES,
  type EqSettings,
  EqHistory,
  GAIN_RANGES,
  GAIN_TYPES,
  type GainRange,
  Q_TYPES,
  MAX_BANDS,
  type Plot,
  addBand,
  bandChip,
  curvePath,
  dbOf,
  describeBand,
  editBand,
  fineValue,
  flat,
  hzOf,
  moveBand,
  parseField,
  parseSettings,
  removeBand,
  resetBandGain,
  scaleQ,
  serialize,
  spectrumPath,
  withRange,
  xOf,
  yOf
} from '../shared/eqCurve'

const SVG = 'http://www.w3.org/2000/svg'
const WIDGET = 'plenio_eq_panel'
const BANDS_WIDGET = 'mode.bands'
/** Capture phase: the frontend swallows a bubbling pointerup, so a drag has to end on its own. */
const CAPTURE: AddEventListenerOptions = { capture: true }
const PLOT_SIZE = { width: 560, height: 260 }
/** Colour per band (the strip, the handles and the envelope of a clicked chip agree). */
const BAND_COLORS = ['#4aa3ff', '#f0a35e', '#6fbf73', '#d873c8', '#e0c65a', '#5ac8c8', '#b28df0', '#e08a8a']
let presets: Promise<EqPreset[]> | null = null

interface Shown {
  sampleRate: number
  frequencies: number[]
  response: number[]
  settings: EqSettings
  readonly: boolean
  note: string
  beforeDb?: number[]
  afterDb?: number[]
}

function svg(name: string, attributes: Record<string, string | number>): SVGElement {
  const element = document.createElementNS(SVG, name)
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, String(value))
  return element
}

function element(tag: string, className?: string, text?: string): HTMLElement {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text !== undefined) node.textContent = text
  return node
}

function button(className: string, text: string, label: string): HTMLButtonElement {
  const node = document.createElement('button') as HTMLButtonElement
  node.className = className
  node.textContent = text
  node.setAttribute('aria-label', label)
  node.title = label
  return node
}

function widget(node: ComfyNode, name: string): ComfyWidget | undefined {
  return node.widgets?.find((w) => w.name === name)
}

/** Do two band lists describe the same response? (the backend normalises ids, order and slope) */
function sameBands(one: EqSettings, other: EqSettings): boolean {
  return (
    one.bands.length === other.bands.length &&
    one.bands.every((band, index) => {
      const twin = other.bands[index]
      return (
        twin !== undefined &&
        band.type === twin.type &&
        band.enabled === twin.enabled &&
        Math.abs(band.frequency_hz - twin.frequency_hz) < 0.5 &&
        Math.abs(band.gain_db - twin.gain_db) < 0.05 &&
        Math.abs(band.q - twin.q) < 0.01
      )
    })
  )
}

export function addEqCurve(node: ComfyNode, fetcher: Fetcher): { showExecuted(output: Record<string, unknown>): void } {
  const root = element('div', 'plenio-eq')
  const toolbar = element('div', 'plenio-eq-tools')
  const presetSelect = element('select') as HTMLSelectElement
  presetSelect.setAttribute('aria-label', 'EQ preset')
  presetSelect.title = 'EQ preset: sets every band at once (the list comes from resources/presets/eq.json)'
  const rangeSelect = element('select') as HTMLSelectElement
  rangeSelect.setAttribute('aria-label', 'Gain range')
  rangeSelect.title = 'Gain range: the dB axis of the curve and how far a drag may go'
  for (const range of GAIN_RANGES) rangeSelect.append(new Option(`±${range} dB`, String(range)))
  const undoButton = button('', '↶', 'Undo the last band change')
  const redoButton = button('', '↷', 'Redo the last band change')
  const resetButton = button('', 'reset', 'Remove every band')
  const compareButton = button('', 'compare', 'Show the curve without the EQ (bypass)')
  const textButton = button('', 'bands as text', 'Show or hide the plenio.eq/1 JSON widget')
  const info = element('span', 'plenio-eq-info')
  info.setAttribute('aria-live', 'polite')
  info.title = 'What the panel is showing right now (the selected band, a note, or a hint)'
  toolbar.append(presetSelect, rangeSelect, undoButton, redoButton, resetButton, compareButton, textButton, info)

  const modeRow = element('div', 'plenio-eq-mode')
  const plot = svg('svg', {
    viewBox: `0 0 ${PLOT_SIZE.width} ${PLOT_SIZE.height}`,
    class: 'plenio-eq-plot',
    role: 'img',
    preserveAspectRatio: 'none'
  })
  plot.setAttribute('aria-label', 'EQ response curve')
  plot.setAttribute('tabindex', '0')
  plot.setAttribute('title', 'Drag a handle to move a band (Shift = fine), wheel = Q, double-click = new band, Delete = remove')
  const strip = element('div', 'plenio-eq-strip')
  const editor = element('div', 'plenio-eq-editor')
  const editorFields = element('div', 'plenio-eq-fields')
  editor.append(editorFields)
  root.append(toolbar, modeRow, plot, strip, editor)

  const panel = node.addDOMWidget(WIDGET, WIDGET, root, {
    serialize: false,
    getValue: () => '',
    setValue: () => {},
    getMinHeight: () => 420,
    getMaxHeight: () => 620
  })
  panel.serialize = false

  let shown: Shown = { sampleRate: 48000, frequencies: [], response: [], settings: flat(), readonly: true, note: '' }
  /** The match mode whose proposal the panel shows (from the last run); ``null``: none yet. */
  let proposalMode: string | null = null
  let selected: string | null = null
  let compare = false
  let range: GainRange = 12
  let presetName: string | null = null
  let presetItems: EqPreset[] = []
  let request = 0
  let timer: ReturnType<typeof setTimeout> | undefined
  let liveTimer: ReturnType<typeof setTimeout> | undefined
  let dragStart: { hz: number; db: number } | null = null
  let restoreFocus = false
  /** The drawn handles and the curve, so a drag can move them without rebuilding the plot. */
  const handles = new Map<string, SVGCircleElement>()
  let curve: SVGPathElement | null = null
  const history = new EqHistory(flat())

  const bandsWidget = () => widget(node, BANDS_WIDGET)
  const currentRange = () => range
  const limit = (): Plot => withRange({ ...PLOT_SIZE, maxHz: Math.min(20000, shown.sampleRate / 2) }, currentRange())

  /** Write bands into the node's widget (the store) and remember the step for undo. */
  function writeBands(settings: EqSettings, { record = true } = {}): void {
    const target = bandsWidget()
    if (!target) return
    const text = serialize(settings)
    target.value = text
    target.callback?.(text)
    if (record) history.push(settings)
    shown = { ...shown, settings }
    draw()
    refresh(0)
  }

  async function refresh(delay = 120): Promise<void> {
    clearTimeout(timer)
    timer = setTimeout(async () => {
      const current = String(widget(node, 'mode')?.value ?? 'flat')
      if (current !== 'manual') {
        if (current === 'flat') {
          shown = {
            ...shown,
            settings: flat(),
            response: shown.frequencies.map(() => 0),
            readonly: true,
            note: 'flat: no change'
          }
        } else if (proposalMode !== current) {
          // a match mode fits its bands to the audio when the workflow runs: until then there is no
          // proposal to show (not the manual bands of before, not an empty 'applied' curve)
          shown = {
            ...shown,
            settings: flat(),
            response: shown.frequencies.map(() => 0),
            readonly: true,
            note: `${current}: the bands are fitted to your audio when the workflow runs - run once to see the proposal here`
          }
        } else {
          shown = { ...shown, readonly: true }
        }
        draw()
        return
      }
      const settings = parseSettings(bandsWidget()?.value)
      if (!settings) {
        shown = { ...shown, readonly: true, note: 'the bands are not valid JSON' }
        draw()
        return
      }
      // bands typed into the text widget are adopted as the new baseline (nothing to undo into)
      if (serialize(settings) !== serialize(history.current)) history.reset(settings)
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

  /** The bands of a preset, capped to what the panel can draw. */
  const presetSettings = (item: EqPreset): EqSettings => ({
    ...item.settings,
    bands: item.settings.bands.slice(0, MAX_BANDS)
  })

  /**
   * The preset that is on the curve right now, or '' - the owner expects a chosen preset to stay
   * visible until the bands are edited by hand (2026-09-28).
   */
  function activePreset(): string {
    if (!presetName) return ''
    const item = presetItems.find((candidate) => candidate.name === presetName)
    return item && sameBands(presetSettings(item), shown.settings) ? presetName : ''
  }

  function draw(): void {
    plot.replaceChildren()
    handles.clear()
    curve = null
    const box = limit()
    for (const db of [-box.db!, -box.db! / 2, 0, box.db! / 2, box.db!]) {
      plot.append(
        svg('line', { x1: 0, x2: box.width, y1: yOf(box, db), y2: yOf(box, db), class: db ? 'grid' : 'grid zero' })
      )
    }
    for (const hz of [100, 1000, 10000]) {
      plot.append(svg('line', { x1: xOf(box, hz), x2: xOf(box, hz), y1: 0, y2: box.height, class: 'grid' }))
    }
    // the last run's spectrum behind the curve: grey before, accent after
    if (shown.beforeDb?.length === shown.frequencies.length) {
      plot.append(svg('path', { d: spectrumPath(box, shown.frequencies, shown.beforeDb), class: 'spectrum before' }))
    }
    if (shown.afterDb?.length === shown.frequencies.length) {
      plot.append(svg('path', { d: spectrumPath(box, shown.frequencies, shown.afterDb), class: 'spectrum after' }))
    }
    if (compare) {
      plot.append(svg('line', { x1: 0, x2: box.width, y1: yOf(box, 0), y2: yOf(box, 0), class: 'curve flat' }))
    } else if (shown.frequencies.length) {
      curve = svg('path', { d: curvePath(box, shown.frequencies, shown.response), class: 'curve' }) as SVGPathElement
      plot.append(curve)
    }
    if (!shown.readonly && !compare) {
      shown.settings.bands.forEach((band, index) => {
        const colour = BAND_COLORS[index % BAND_COLORS.length]
        const gain = GAIN_TYPES.includes(band.type) ? band.gain_db : 0
        const handle = svg('circle', {
          cx: xOf(box, band.frequency_hz),
          cy: yOf(box, gain),
          r: band.id === selected ? 9 : 7,
          class: band.id === selected ? 'handle selected' : 'handle',
          style: `stroke: ${colour}`,
          tabindex: 0,
          'data-band': band.id
        })
        handle.setAttribute('aria-label', `Band ${index + 1}: ${describeBand(band)}`)
        if (!band.enabled) handle.classList.add('disabled')
        handle.append(svg('title', {}))
        handle.lastChild!.textContent = `Band ${index + 1}: ${describeBand(band)}`
        handle.addEventListener('pointerdown', (event) => startDrag(event as PointerEvent, band.id))
        handle.addEventListener('dblclick', (event) => {
          event.stopPropagation()
          writeBands(resetBandGain(shown.settings, band.id))
        })
        handle.addEventListener('focus', () => select(band.id))
        handle.addEventListener('keydown', (event) => onKey(event as KeyboardEvent, band.id))
        handle.addEventListener('wheel', (event) => {
          event.preventDefault()
          const factor = (event as WheelEvent).deltaY < 0 ? 1.15 : 1 / 1.15
          writeBands(scaleQ(shown.settings, band.id, factor))
        })
        handle.addEventListener('contextmenu', (event) => {
          event.preventDefault()
          writeBands(removeBand(shown.settings, band.id))
        })
        plot.append(handle)
        handles.set(band.id, handle as SVGCircleElement)
      })
    }
    drawStrip()
    drawEditor()
    drawModeRow()
    const band = shown.settings.bands.find((b) => b.id === selected)
    info.textContent =
      shown.note ||
      (compare
        ? 'compare: the curve is off (the node still applies it)'
        : band
          ? describeBand(band)
          : shown.readonly
            ? `${shown.settings.bands.length} band(s)`
            : `drag a handle, Shift = fine, wheel = Q, double-click = add · ${shown.settings.bands.length}/${MAX_BANDS}`)
    presetSelect.disabled = shown.readonly
    undoButton.disabled = !history.canUndo
    redoButton.disabled = !history.canRedo
    resetButton.disabled = shown.readonly || !shown.settings.bands.length
    if (restoreFocus) {
      // a draw replaces the handles: put the focus back on the selected one so Delete and the arrows
      // keep working (the owner's report, 2026-09-28)
      restoreFocus = false
      if (selected) handles.get(selected)?.focus({ preventScroll: true })
    }
    rangeSelect.value = String(range)
    presetSelect.value = activePreset()
    compareButton.classList.toggle('active', compare)
    textButton.classList.toggle('active', isTextShown())
    node.setDirtyCanvas?.(true, true)
  }

  /** The band strip: one chip per band; a click opens the inline editor. */
  function drawStrip(): void {
    strip.replaceChildren()
    if (shown.readonly && !shown.settings.bands.length) {
      strip.append(element('span', 'plenio-eq-hint', shown.note || 'no bands'))
      return
    }
    shown.settings.bands.forEach((band, index) => {
      const chip = element('button', 'plenio-eq-chip', bandChip(band, index)) as HTMLButtonElement
      chip.style.borderLeftColor = BAND_COLORS[index % BAND_COLORS.length]
      chip.classList.toggle('selected', band.id === selected)
      chip.classList.toggle('disabled', !band.enabled)
      chip.setAttribute('aria-label', `Edit band ${index + 1}`)
      chip.title = `Band ${index + 1}: ${describeBand(band)} - click to open its fields`
      chip.addEventListener('click', (event) => {
        event.stopPropagation()
        selected = selected === band.id ? null : band.id
        draw()
      })
      strip.append(chip)
    })
  }

  /** The inline editor of the selected band: type, frequency, gain, Q and the enable switch. */
  function drawEditor(): void {
    editorFields.replaceChildren()
    const band = shown.settings.bands.find((b) => b.id === selected)
    if (!band || shown.readonly) {
      editor.style.display = 'none'
      return
    }
    editor.style.display = ''
    const label = element('span', 'name', `Band ${shown.settings.bands.indexOf(band) + 1}`)
    label.title = 'The selected band'
    const type = element('select') as HTMLSelectElement
    type.setAttribute('aria-label', 'Band type')
    type.title = 'Band type: bell and shelves change the gain, the cuts and the notch do not'
    for (const [value, name] of Object.entries(BAND_NAMES)) type.append(new Option(name, value))
    type.value = band.type
    type.addEventListener('change', () => writeBands(editBand(shown.settings, band.id, { type: type.value as BandType })))
    const enabled = element('input') as HTMLInputElement
    enabled.type = 'checkbox'
    enabled.checked = band.enabled
    enabled.setAttribute('aria-label', 'Band enabled')
    enabled.title = 'Band enabled: off keeps the band in the list but out of the response'
    enabled.addEventListener('change', () => writeBands(editBand(shown.settings, band.id, { enabled: enabled.checked })))
    // a field commits only a number ("1.2k", "1,5" and a unit are fine); anything else puts the
    // band's value back into the field instead of writing NaN into the node's value
    const fields: [string, string, number, (value: string) => boolean][] = [
      [
        'Hz',
        `${band.frequency_hz}`,
        70,
        (value) => commitField(band.id, 'frequency_hz', parseField(value, { kilo: true }))
      ],
      ['dB', `${band.gain_db}`, 60, (value) => commitField(band.id, 'gain_db', parseField(value))],
      ['Q', `${band.q}`, 60, (value) => commitField(band.id, 'q', parseField(value))]
    ]
    editorFields.append(label, type, enabled)
    for (const [name, value, width, commit] of fields) {
      const field = element('input', 'number') as HTMLInputElement
      field.value = value
      field.style.width = `${width}px`
      field.setAttribute('aria-label', `Band ${name}`)
      field.title =
        name === 'Hz'
          ? 'Frequency of the band in Hz (the centre of a bell, the corner of a shelf)'
          : name === 'dB'
            ? 'Gain in dB (bell and shelves; the cuts and the notch have none)'
            : 'Q: how narrow the band is - higher Q, smaller range'
      const apply = () => {
        if (!commit(field.value)) field.value = value
      }
      field.addEventListener('keydown', (event) => {
        if ((event as KeyboardEvent).key === 'Enter') apply()
      })
      field.addEventListener('blur', apply)
      // the gain belongs to bell and shelves; the Q to bell, notch and the cuts (shelves use a slope)
      if ((name === 'dB' && !GAIN_TYPES.includes(band.type)) || (name === 'Q' && !Q_TYPES.includes(band.type))) {
        field.disabled = true
      }
      editorFields.append(field)
    }
    const remove = button('', 'remove', 'Remove this band')
    remove.addEventListener('click', (event) => {
      event.stopPropagation()
      selected = null
      writeBands(removeBand(shown.settings, band.id))
    })
    editorFields.append(remove)
  }

  /** The mode row: in match modes the applied proposal plus *Edit these bands*. */
  function drawModeRow(): void {
    modeRow.replaceChildren()
    const name = String(widget(node, 'mode')?.value ?? 'flat')
    if (name === 'manual' || name === 'flat') {
      modeRow.style.display = 'none'
      return
    }
    modeRow.style.display = ''
    modeRow.append(
      element(
        'span',
        'plenio-eq-hint',
        proposalMode === name
          ? `applied proposal (${shown.settings.bands.length} band(s), ${name})`
          : `${name}: no proposal yet - it is computed on the next run`
      )
    )
    const edit = button('', 'Edit these bands', 'Copy the proposal into manual bands and edit it')
    edit.disabled = !shown.settings.bands.length
    edit.addEventListener('click', (event) => {
      event.stopPropagation()
      // switching the combo recreates the bands widget, so the value is written afterwards
      const combo = widget(node, 'mode')
      if (!combo) return
      combo.value = 'manual'
      combo.callback?.('manual')
      const created = bandsWidget()
      if (created) {
        const text = serialize(shown.settings)
        created.value = text
        created.callback?.(text)
      }
      history.reset(shown.settings)
      watch()
      void refresh(0)
    })
    modeRow.append(edit)
  }

  function select(id: string | null): void {
    selected = id
    restoreFocus = true
    draw()
  }

  /** Mark a band as selected without rebuilding the plot (a drag must keep the handle it grabbed). */
  function selectLive(id: string | null): void {
    selected = id
    paintLive()
  }

  /**
   * Move the drawn handles and the curve to what ``shown`` says - without rebuilding the plot.
   * A rebuild during a drag would replace the handle under the pointer (the drag then stops after
   * the first move), so a drag paints live and only the release draws the whole panel again.
   */
  function paintLive(): void {
    const box = limit()
    shown.settings.bands.forEach((band) => {
      const handle = handles.get(band.id)
      if (!handle) return
      const gain = GAIN_TYPES.includes(band.type) ? band.gain_db : 0
      handle.setAttribute('cx', String(xOf(box, band.frequency_hz)))
      handle.setAttribute('cy', String(yOf(box, gain)))
      handle.classList.toggle('selected', band.id === selected)
      handle.setAttribute('r', band.id === selected ? '9' : '7')
    })
    if (curve && shown.frequencies.length) curve.setAttribute('d', curvePath(box, shown.frequencies, shown.response))
    const band = shown.settings.bands.find((b) => b.id === selected)
    if (band) info.textContent = describeBand(band)
  }

  /** During a drag: ask for the curve of the new bands, but paint it without a rebuild. */
  function refreshLive(): void {
    clearTimeout(liveTimer)
    liveTimer = setTimeout(async () => {
      const settings = shown.settings
      const id = ++request
      try {
        const result = await eqResponse(fetcher, settings, shown.sampleRate)
        if (id !== request) return
        shown = { ...shown, frequencies: result.frequency_hz, response: result.response_db }
        paintLive()
      } catch {
        // a failed curve while dragging is not worth interrupting the drag; the release reports it
      }
    }, 60)
  }

  /** Show or hide the raw ``mode.bands`` widget (the value itself is never touched). */
  function isTextShown(): boolean {
    return !(widget(node, BANDS_WIDGET) as { plenioHidden?: boolean } | undefined)?.plenioHidden
  }

  function setTextShown(shown_: boolean): void {
    const target = widget(node, BANDS_WIDGET) as (ComfyWidget & { plenioHidden?: boolean }) | undefined
    if (!target) return
    target.plenioHidden = !shown_
    if (shown_) {
      // restore the widget's own size calculation when it can be computed again
      delete target.computeSize
    } else {
      target.computeSize = () => [0, -4]
    }
    node.setDirtyCanvas?.(true, true)
  }

  /** Write one typed band field; ``false`` (nothing written) when the text was not a number. */
  function commitField(id: string, key: 'frequency_hz' | 'gain_db' | 'q', value: number | null): boolean {
    if (value === null) return false
    const band = shown.settings.bands.find((b) => b.id === id)
    if (band && band[key] === value) return true // Enter, then blur: nothing new
    writeBands(editBand(shown.settings, id, { [key]: value }))
    return true
  }

  function startDrag(event: PointerEvent, id: string): void {
    event.preventDefault()
    event.stopPropagation()
    // select without a redraw: a rebuild here would replace the handle under the pointer (and would
    // make setPointerCapture throw on the detached element), which stopped the drag after the first
    // move - the owner's report of 2026-09-28
    if (selected !== id) selectLive(id)
    const band = shown.settings.bands.find((b) => b.id === id)
    if (!band) return
    dragStart = { hz: band.frequency_hz, db: band.gain_db }
    let moved = false
    let done = false
    const origin = event.currentTarget as Element | null
    try {
      origin?.setPointerCapture?.(event.pointerId)
    } catch {
      // the handle may be detached while a drag is running; the window listeners below carry the drag
    }
    const box = plot.getBoundingClientRect()
    // the test environment reports an empty rect: fall back to the viewBox
    const left = box.width ? box.left : 0
    const top = box.height ? box.top : 0
    const width = box.width || PLOT_SIZE.width
    const height = box.height || PLOT_SIZE.height
    /** Only what happens on the curve counts: outside it the band stays where it was. */
    const inside = (x: number, y: number) =>
      x >= left - 1 && x <= left + width + 1 && y >= top - 1 && y <= top + height + 1
    function finish(): void {
      if (done) return
      done = true
      try {
        origin?.releasePointerCapture?.(event.pointerId)
      } catch {
        // already detached
      }
      window.removeEventListener('pointermove', move, CAPTURE)
      window.removeEventListener('pointerup', finish, CAPTURE)
      window.removeEventListener('pointercancel', finish, CAPTURE)
      window.removeEventListener('blur', finish, CAPTURE)
      dragStart = null
      if (moved) writeBands(shown.settings)
    }
    const move = (e: PointerEvent) => {
      if (done || !dragStart) return
      // the button is no longer down (the pointerup was swallowed by the frontend or happened
      // outside the window): the drag ends here instead of following every later move
      if (e.buttons === 0) {
        finish()
        return
      }
      if (!inside(e.clientX, e.clientY)) return
      const scaleX = PLOT_SIZE.width / width
      const scaleY = PLOT_SIZE.height / height
      const x = (e.clientX - left) * scaleX
      const y = (e.clientY - top) * scaleY
      const grabX = xOf(limit(), dragStart.hz)
      const grabY = yOf(limit(), dragStart.db)
      const hz = hzOf(limit(), fineValue(grabX, x, e.shiftKey))
      const db = dbOf(limit(), fineValue(grabY, y, e.shiftKey))
      shown = { ...shown, settings: moveBand(shown.settings, id, hz, db, shown.sampleRate) }
      moved = true
      paintLive()
      refreshLive()
    }
    window.addEventListener('pointermove', move, CAPTURE)
    window.addEventListener('pointerup', finish, CAPTURE)
    window.addEventListener('pointercancel', finish, CAPTURE)
    window.addEventListener('blur', finish, CAPTURE)
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
    else if (event.key === '0') next = resetBandGain(shown.settings, id)
    else if (event.key === 'Delete' || event.key === 'Backspace') next = removeBand(shown.settings, id)
    if (next) {
      event.preventDefault()
      writeBands(next)
    }
  }

  // the keyboard acts on the selected band wherever the focus sits inside the plot: click a handle and
  // press Delete (every draw replaces the handle, so its own listener is not enough on its own)
  plot.addEventListener('keydown', (event) => {
    if (selected && event.target === plot) onKey(event, selected)
  })

  plot.addEventListener('dblclick', (event) => {
    if (shown.readonly || compare) return
    const box = plot.getBoundingClientRect()
    const scaleX = PLOT_SIZE.width / (box.width || PLOT_SIZE.width)
    const scaleY = PLOT_SIZE.height / (box.height || PLOT_SIZE.height)
    const x = ((event as MouseEvent).clientX - box.left) * scaleX
    const y = ((event as MouseEvent).clientY - box.top) * scaleY
    const next = addBand(shown.settings, hzOf(limit(), x), dbOf(limit(), y), shown.sampleRate)
    if (next) {
      selected = next.bands[next.bands.length - 1].id
      writeBands(next)
    } else {
      shown = { ...shown, note: `the EQ has at most ${MAX_BANDS} bands` }
      draw()
    }
  })

  presetSelect.append(new Option('preset…', ''))
  presets ??= eqPresets(fetcher).then((data) => data.manual).catch(() => [])
  void presets.then((items) => {
    presetItems = items
    for (const item of items) presetSelect.append(new Option(item.name, item.name))
    presetSelect.value = activePreset()
  })
  presetSelect.addEventListener('change', async () => {
    const item = (await presets)?.find((p) => p.name === presetSelect.value)
    if (!item) return
    presetName = item.name
    writeBands(presetSettings(item))
  })
  rangeSelect.addEventListener('change', () => {
    const value = Number(rangeSelect.value)
    range = GAIN_RANGES.find((candidate) => candidate === value) ?? 12
    draw()
  })
  undoButton.addEventListener('click', () => {
    const previous = history.undo()
    if (previous) writeBands(previous, { record: false })
  })
  redoButton.addEventListener('click', () => {
    const next = history.redo()
    if (next) writeBands(next, { record: false })
  })
  resetButton.addEventListener('click', () => {
    selected = null
    writeBands(flat())
  })
  compareButton.addEventListener('click', () => {
    compare = !compare
    draw()
  })
  textButton.addEventListener('click', () => {
    setTextShown(!isTextShown())
    draw()
  })

  // follow mode changes and typed bands; re-apply the text toggle after a combo switch
  function watch(): void {
    for (const name of ['mode', BANDS_WIDGET]) {
      const target = widget(node, name)
      if (!target || (target as { plenioWatched?: boolean }).plenioWatched) continue
      ;(target as { plenioWatched?: boolean }).plenioWatched = true
      const original = target.callback
      target.callback = (value: unknown) => {
        original?.(value)
        setTimeout(() => {
          if (!isTextShown()) setTextShown(false)
          void refresh()
        })
      }
    }
  }
  watch()
  setTextShown(false)
  void refresh(0)

  // A DynamicCombo rebuilds the widgets of its node when the mode changes, and the frontend may
  // replace them entirely: the watchers of a replaced widget never fire again, which is why the
  // panel did not follow a mode change (the owner's report, 2026-09-28). Re-attach and re-read
  // whenever the mode or the bands differ from what the panel saw last.
  let watchedMode: string | null = null
  let watchedBands: string | null = null
  const follow = setInterval(() => {
    if (!root.isConnected) {
      clearInterval(follow)
      return
    }
    const mode = String(widget(node, 'mode')?.value ?? 'flat')
    const bands = String(bandsWidget()?.value ?? '')
    if (mode === watchedMode && bands === watchedBands) return
    watchedMode = mode
    watchedBands = bands
    watch()
    void refresh(0)
  }, 700)

  return {
    showExecuted(output) {
      const items = output?.plenio_eq as
        | {
            settings: EqSettings
            sample_rate: number
            frequency_hz: number[]
            response_db: number[]
            spectrum_before_db?: number[]
            spectrum_after_db?: number[]
          }[]
        | undefined
      const last = items?.[items.length - 1]
      if (!last) return
      const mode = String(widget(node, 'mode')?.value ?? 'flat')
      const manual = mode === 'manual'
      proposalMode = manual || mode === 'flat' ? null : mode
      shown = {
        sampleRate: last.sample_rate,
        frequencies: last.frequency_hz,
        response: last.response_db,
        settings: last.settings,
        readonly: !manual,
        note: manual ? '' : `applied: ${last.settings.bands.length} band(s)`,
        beforeDb: last.spectrum_before_db,
        afterDb: last.spectrum_after_db
      }
      if (!manual) draw()
      else void refresh(0)
    }
  }
}
