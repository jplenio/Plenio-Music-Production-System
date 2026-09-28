/**
 * The Stem Mixer's widget (Phase 11C D12, plan §6.4): one strip per stem plus the residual *rest*,
 * each with a fader, mute/solo, compression and the two sends, and the mini waveform of the last run
 * on which muted time ranges are drawn and dragged. Below them the two bus settings and the raw
 * ``plenio.stem_mix/1`` value under *Advanced* (the same value the node stores, never a second one).
 *
 * The backend owns the mixdown (`core.audio.stems`); this widget only reads and writes the value.
 */
import type { ComfyNode, ComfyWidget } from '../shared/comfy'
import {
  BUSES,
  type Bus,
  MAX_GAIN_DB,
  MIN_GAIN_DB,
  MIX_SCHEMA,
  REST,
  type MixValue,
  type Strip,
  formatGain,
  isAudible,
  parseMix,
  peaksFor,
  peaksOf,
  serializeMix,
  stripNames,
  stripOf,
  withRange,
  withStrip,
  withoutRange
} from '../shared/stemMix'

const WIDGET = 'plenio_stem_mixer'
const MIX_WIDGET = 'mix'
const BAR_WIDTH = 200
const PRESETS = ['room', 'plate', 'hall']

interface Shown {
  mix: MixValue
  names: string[]
  peaks: Record<string, number[]>
  seconds: number
}

function element(tag: string, className?: string, text?: string): HTMLElement {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text !== undefined) node.textContent = text
  return node
}

function slider(min: number, max: number, step: number, value: number, label: string): HTMLInputElement {
  const input = element('input') as HTMLInputElement
  input.type = 'range'
  input.min = String(min)
  input.max = String(max)
  input.step = String(step)
  input.value = String(value)
  input.setAttribute('aria-label', label)
  return input
}

export function addStemMixer(node: ComfyNode): { showExecuted(output: Record<string, unknown>): void } {
  const root = element('div', 'plenio-mix')
  const strips = element('div', 'plenio-mix-strips')
  const buses = element('div', 'plenio-mix-buses')
  const info = element('div', 'plenio-mix-info')
  const owner = element('div', 'plenio-mix-advanced')
  root.append(strips, buses, owner, info)
  let shown: Shown = {
    mix: { schema: MIX_SCHEMA, strips: {} },
    // the documented stems are there before the first run (owner's request, 2026-09-28); a separation
    // replaces them with what the model actually produced
    names: stripNames(null, null),
    peaks: {},
    seconds: 0
  }
  let advanced = false

  const mixWidget = (): ComfyWidget | undefined => node.widgets?.find((widget) => widget.name === MIX_WIDGET)

  /** Write the value; ``draw`` false keeps the strips on screen (a drag must not replace the fader). */
  function write(mix: MixValue, { draw: redraw = true } = {}): void {
    const target = mixWidget()
    if (!target) return
    const text = serializeMix(mix)
    target.value = text
    target.callback?.(text)
    shown = { ...shown, mix }
    if (redraw) draw()
  }

  function update(name: string, patch: Partial<Strip>, options: { draw?: boolean } = {}): void {
    write(withStrip(shown.mix, name, { ...stripOf(shown.mix, name), ...patch }), options)
  }

  /** A send that is raised needs its bus: the widget writes the documented defaults with it. */
  function setSend(name: string, bus: Bus, amount: number, options: { draw?: boolean } = {}): void {
    const strip = stripOf(shown.mix, name)
    let mix = withStrip(shown.mix, name, { ...strip, [bus]: amount })
    if (amount > 0 && !(mix[bus] && Object.keys(mix[bus]).length)) {
      mix =
        bus === 'reverb'
          ? { ...mix, reverb: { preset: 'room' } }
          : { ...mix, delay: { time_ms: 375, feedback: 0.35, lowpass_hz: 4000 } }
    }
    write(mix, options)
  }

  function setBusSetting(bus: Bus, key: string, value: unknown): void {
    const current = { ...(shown.mix[bus] ?? {}) }
    write({ ...shown.mix, [bus]: { ...current, [key]: value } })
  }

  function draw(): void {
    strips.replaceChildren()
    const audibleNames = shown.names
    for (const name of shown.names) {
      const strip = stripOf(shown.mix, name)
      const row = element('div', 'plenio-mix-strip')
      row.dataset.strip = name
      const title = element('span', 'name', name === REST ? `${name} (missed)` : name)
      title.title = name === REST ? 'What the separator missed: keeps a neutral mix exact' : ''
      const fader = slider(MIN_GAIN_DB, MAX_GAIN_DB, 0.5, strip.gain_db, `${name} gain`)
      const gainText = element('span', 'gain', `${formatGain(strip.gain_db)} dB`)
      fader.addEventListener('input', () => {
        // live: the label follows the pointer and the value is written, but the strips are not rebuilt
        // (a rebuild would replace the fader under the pointer and the drag would stop)
        gainText.textContent = `${formatGain(Number(fader.value))} dB`
        update(name, { gain_db: Number(fader.value) }, { draw: false })
      })
      fader.addEventListener('change', () => update(name, { gain_db: Number(fader.value) }))
      const mute = element('button', strip.mute ? 'toggle active' : 'toggle', 'M')
      mute.setAttribute('aria-label', `${name} mute`)
      mute.addEventListener('click', (event) => {
        event.stopPropagation()
        update(name, { mute: !strip.mute })
      })
      const solo = element('button', strip.solo ? 'toggle active' : 'toggle', 'S')
      solo.setAttribute('aria-label', `${name} solo`)
      solo.addEventListener('click', (event) => {
        event.stopPropagation()
        update(name, { solo: !strip.solo })
      })
      const comp = slider(0, 1, 0.05, strip.compression, `${name} compression`)
      comp.title = 'Compression amount: one knob for the master compressor (threshold and ratio)'
      comp.addEventListener('input', () => update(name, { compression: Number(comp.value) }, { draw: false }))
      comp.addEventListener('change', () => update(name, { compression: Number(comp.value) }))
      const sends = BUSES.map((bus) => {
        const send = slider(0, 1, 0.05, strip[bus], `${name} ${bus} send`)
        send.title = `${bus} send: how much of this stem goes to the shared ${bus} bus`
        send.addEventListener('input', () => setSend(name, bus, Number(send.value), { draw: false }))
        send.addEventListener('change', () => setSend(name, bus, Number(send.value)))
        return send
      })
      const save = element('button', strip.save ? 'toggle active' : 'toggle', 'save')
      save.setAttribute('aria-label', `${name} save as its own file`)
      save.setAttribute('aria-pressed', String(strip.save))
      save.title =
        'Write this stem as its own 24-bit FLAC file (output/plenio/stems) on the next run; ' +
        'its gain, compression and muted ranges are applied, mute/solo and the buses are not'
      save.addEventListener('click', (event) => {
        event.stopPropagation()
        update(name, { save: !strip.save })
      })
      const audible = isAudible(shown.mix, name, audibleNames)
      row.classList.toggle('silent', !audible)
      const waveform = element('canvas', 'plenio-mix-wave') as HTMLCanvasElement
      waveform.width = BAR_WIDTH
      waveform.height = 26
      waveform.setAttribute('aria-label', `${name} waveform (drag to mute a time range)`)
      drawWave(waveform, strip, peaksFor(shown.peaks, name, BAR_WIDTH))
      waveform.addEventListener('pointerdown', (event) => startRange(event, waveform, name))
      row.append(
        title,
        fader,
        gainText,
        mute,
        solo,
        element('span', 'label', 'comp'),
        comp,
        element('span', 'label', 'verb'),
        sends[0],
        element('span', 'label', 'delay'),
        sends[1],
        save,
        waveform
      )
      strips.append(row)
    }
    drawBuses()
    info.textContent = shown.seconds
      ? `last run: ${shown.seconds.toFixed(1)} s - drag on a strip to mute a time range, click a range to remove it`
      : 'no run yet: the strips show the documented stems (vocals, drums, bass, other and the residual rest); Separate Stems fills them'
    node.setDirtyCanvas?.(true, true)
  }

  function drawWave(canvas: HTMLCanvasElement, strip: Strip, values: number[]): void {
    const context = canvas.getContext('2d')
    if (!context) return
    context.clearRect(0, 0, BAR_WIDTH, canvas.height)
    const middle = canvas.height / 2
    context.strokeStyle = 'rgba(180, 190, 205, 0.8)'
    context.beginPath()
    for (let index = 0; index < values.length; index++) {
      const height = Math.max(1, values[index] * (middle - 1))
      context.moveTo(index + 0.5, middle - height)
      context.lineTo(index + 0.5, middle + height)
    }
    context.stroke()
    context.fillStyle = 'rgba(224, 104, 94, 0.35)'
    context.strokeStyle = 'rgba(224, 104, 94, 0.9)'
    for (const [start, end] of strip.muted) {
      const from = Math.max(0, Math.min(BAR_WIDTH, (start / Math.max(shown.seconds, 1e-6)) * BAR_WIDTH))
      const to = Math.max(0, Math.min(BAR_WIDTH, (end / Math.max(shown.seconds, 1e-6)) * BAR_WIDTH))
      context.fillRect(from, 0, Math.max(1, to - from), canvas.height)
      context.strokeRect(from + 0.5, 0.5, Math.max(1, to - from) - 1, canvas.height - 1)
    }
  }

  /** A drag on the waveform mutes that time range; a click inside one removes it. */
  function startRange(event: PointerEvent, canvas: HTMLCanvasElement, name: string): void {
    event.preventDefault()
    event.stopPropagation()
    if (!shown.seconds) return
    const box = canvas.getBoundingClientRect()
    const seconds = (x: number): number => {
      const fraction = Math.max(0, Math.min(1, (x - box.left) / (box.width || BAR_WIDTH)))
      return fraction * shown.seconds
    }
    const start = seconds(event.clientX)
    const strip = stripOf(shown.mix, name)
    if (strip.muted.some(([from, to]) => from <= start && start <= to)) {
      write(withoutRange(shown.mix, name, start))
      return
    }
    let end = start
    const move = (moveEvent: PointerEvent) => {
      end = seconds(moveEvent.clientX)
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      write(withRange(shown.mix, name, Math.min(start, end), Math.max(start, end)))
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  function drawBuses(): void {
    buses.replaceChildren()
    const reverb = { preset: 'room', ...(shown.mix.reverb ?? {}) } as Record<string, unknown>
    const delay = { time_ms: 375, feedback: 0.35, lowpass_hz: 4000, ...(shown.mix.delay ?? {}) } as Record<
      string,
      unknown
    >
    const preset = element('select') as HTMLSelectElement
    preset.setAttribute('aria-label', 'Reverb preset')
    preset.title = 'The room the reverb bus adds; the amount per stem is its verb send'
    for (const name of PRESETS) preset.append(new Option(name, name))
    preset.value = String(reverb.preset ?? 'room')
    preset.addEventListener('change', () => setBusSetting('reverb', 'preset', preset.value))
    const time = element('input') as HTMLInputElement
    time.type = 'number'
    time.value = String(delay.time_ms ?? 375)
    time.setAttribute('aria-label', 'Delay time in ms')
    time.title = 'Delay time in ms: where the first echo of the delay bus sits'
    time.addEventListener('change', () => setBusSetting('delay', 'time_ms', Number(time.value)))
    const feedback = slider(0, 0.8, 0.05, Number(delay.feedback ?? 0.35), 'Delay feedback')
    feedback.title = 'Delay feedback: how much of each echo returns into the delay line'
    feedback.addEventListener('input', () => setBusSetting('delay', 'feedback', Number(feedback.value)))
    buses.append(
      element('span', 'label', 'reverb bus'),
      preset,
      element('span', 'label', 'delay bus'),
      time,
      element('span', 'label', 'ms, feedback'),
      feedback
    )
    buses.style.display = BUSES.some((bus) => shown.mix[bus]) ? '' : 'none'
  }

  const widget = node.addDOMWidget(WIDGET, WIDGET, root, {
    serialize: false,
    getValue: () => '',
    setValue: () => {},
    getMinHeight: () => 200,
    getMaxHeight: () => 520
  })
  widget.serialize = false

  // the raw plenio.stem_mix/1 widget stays the stored value; Advanced shows it (like the EQ panel)
  const raw = node.widgets?.find((item) => item.name === MIX_WIDGET) as
    | (ComfyWidget & { plenioHidden?: boolean })
    | undefined
  const toggle = element('button', 'toggle', 'JSON')
  toggle.title = 'Show or hide the raw mixer value'
  toggle.addEventListener('click', (event) => {
    event.stopPropagation()
    advanced = !advanced
    toggle.classList.toggle('active', advanced)
    if (raw) {
      raw.plenioHidden = !advanced
      if (advanced) delete raw.computeSize
      else raw.computeSize = () => [0, -4]
    }
    node.setDirtyCanvas?.(true, true)
  })
  owner.append(element('span', 'label', 'Advanced'), toggle)
  if (raw) {
    raw.plenioHidden = true
    raw.computeSize = () => [0, -4]
  }

  function reload(): void {
    const parsed = parseMix(mixWidget()?.value)
    shown = { ...shown, mix: parsed ?? { schema: MIX_SCHEMA, strips: {} } }
    if (!parsed) info.textContent = 'the mixer value is not readable; it will be replaced on the next edit'
    draw()
  }
  reload()

  return {
    showExecuted(output) {
      const payload = (
        output?.plenio_stems as
          | { stems?: string[]; seconds?: number; peaks?: Record<string, number[]> }[]
          | undefined
      )?.at(-1)
      const peaks = peaksOf(output)
      const names = stripNames(shown.mix, payload ?? null)
      shown = { ...shown, names, peaks, seconds: Number(payload?.seconds ?? shown.seconds) || 0 }
      reload()
    }
  }
}
