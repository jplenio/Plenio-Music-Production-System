/**
 * The source recording of a cover in the editor (owner's request 2026-10-03: full control for covers):
 * decoded once in the browser - to play it on the same clock as the notes (``playClock``) and to draw
 * its waveform under the roll's chord lane, bar by bar where the transcription's timeline puts it.
 *
 * The file is the one the sheet already shows (``reference_audio``, served by ComfyUI); nothing is
 * uploaded or downloaded from elsewhere. Decoded to mono at the decoder's rate, with an envelope of
 * ``ENVELOPE_RATE`` minimum/maximum pairs per second for the waveform.
 */

export const ENVELOPE_RATE = 200

export interface SourceEnvelope {
  rate: number
  min: Float32Array
  max: Float32Array
  duration: number
}

export interface DecodedSource {
  buffer: AudioBuffer
  envelope: SourceEnvelope
}

/** Decoded recordings by URL; every run brings a new file, so only the last few are kept. */
const cache = new Map<string, Promise<DecodedSource>>()
const KEEP = 2

function mono(buffer: AudioBuffer, Context: typeof OfflineAudioContext): AudioBuffer {
  if (buffer.numberOfChannels === 1) return buffer
  const out = new Context(1, 1, buffer.sampleRate).createBuffer(1, buffer.length, buffer.sampleRate)
  const target = out.getChannelData(0)
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const data = buffer.getChannelData(c)
    for (let i = 0; i < data.length; i++) target[i] += data[i] / buffer.numberOfChannels
  }
  return out
}

/** Minimum and maximum of every ``1 / rate`` seconds of the samples. */
export function envelopeOf(samples: Float32Array, sampleRate: number, rate = ENVELOPE_RATE): SourceEnvelope {
  const step = Math.max(1, Math.round(sampleRate / rate))
  const count = Math.ceil(samples.length / step)
  const min = new Float32Array(count)
  const max = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    let low = 0
    let high = 0
    const end = Math.min(samples.length, (i + 1) * step)
    for (let j = i * step; j < end; j++) {
      const v = samples[j]
      if (v < low) low = v
      if (v > high) high = v
    }
    min[i] = low
    max[i] = high
  }
  return { rate: sampleRate / step, min, max, duration: samples.length / sampleRate }
}

/** The recording at ``url``, decoded (the same file is decoded once per page). */
export function decodeSource(url: string, fetcher: (url: string) => Promise<ArrayBuffer> = defaultFetch): Promise<DecodedSource> {
  let pending = cache.get(url)
  if (!pending) {
    pending = (async () => {
      const Context =
        window.OfflineAudioContext ?? (window as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext }).webkitOfflineAudioContext
      if (!Context) throw new Error('This browser cannot decode audio (no Web Audio).')
      const data = await fetcher(url)
      const decoded = await new Context(1, 1, 48000).decodeAudioData(data)
      const buffer = mono(decoded, Context)
      return { buffer, envelope: envelopeOf(buffer.getChannelData(0), buffer.sampleRate) }
    })()
    cache.set(url, pending)
    while (cache.size > KEEP) cache.delete(cache.keys().next().value as string)
    pending.catch(() => cache.delete(url))
  }
  return pending
}

async function defaultFetch(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`The source recording could not be read (${response.status}).`)
  return response.arrayBuffer()
}

/**
 * The waveform of the source seconds ``[from, to)`` in ``columns`` columns: the extremes per column
 * (``[min, max]``, -1 ... 1).
 */
export function waveColumns(envelope: SourceEnvelope, from: number, to: number, columns: number): [number, number][] {
  const result: [number, number][] = []
  if (columns <= 0 || to <= from) return result
  const per = (to - from) / columns
  for (let c = 0; c < columns; c++) {
    const a = Math.max(0, Math.floor((from + c * per) * envelope.rate))
    const b = Math.min(envelope.min.length, Math.max(a + 1, Math.ceil((from + (c + 1) * per) * envelope.rate)))
    let low = 0
    let high = 0
    for (let i = a; i < b; i++) {
      if (envelope.min[i] < low) low = envelope.min[i]
      if (envelope.max[i] > high) high = envelope.max[i]
    }
    result.push([low, high])
  }
  return result
}
