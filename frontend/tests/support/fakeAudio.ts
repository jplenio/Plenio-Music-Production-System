/**
 * The Web Audio nodes the editor's sounds use (``instruments.ts``), as stand-ins that do nothing: a
 * test's fake AudioContext spreads ``audioNodes()`` in and keeps its own clock. ``onStart`` sees every
 * oscillator that is started (a test can record the pitches played).
 */
export const param = () => ({
  value: 0,
  setValueAtTime: () => undefined,
  linearRampToValueAtTime: () => undefined,
  setTargetAtTime: () => undefined,
  cancelScheduledValues: () => undefined
})

export interface FakeOscillator {
  type: string
  frequency: ReturnType<typeof param>
  detune: ReturnType<typeof param>
  onended: (() => void) | null
  started: number | null
  stopped: number | null
}

export function audioNodes(onStart?: (oscillator: FakeOscillator) => void) {
  const node = () => ({ connect: (to: unknown) => to, disconnect: () => undefined })
  return {
    sampleRate: 8000,
    baseLatency: 0,
    destination: {},
    createGain: () => ({ ...node(), gain: param() }),
    createBiquadFilter: () => ({ ...node(), type: 'lowpass', frequency: param(), Q: param() }),
    createPeriodicWave: () => ({}),
    createBuffer: (_channels: number, length: number) => ({ getChannelData: () => new Float32Array(length) }),
    createBufferSource: () => ({ ...node(), buffer: null, loop: false, onended: null, start: () => undefined, stop: () => undefined }),
    createOscillator: () => {
      const oscillator: FakeOscillator & ReturnType<typeof node> & Record<string, unknown> = {
        ...node(),
        type: 'sine',
        frequency: param(),
        detune: param(),
        onended: null,
        started: null,
        stopped: null,
        setPeriodicWave: () => undefined,
        start: (at = 0) => {
          oscillator.started = at
          onStart?.(oscillator)
        },
        stop: (at = 0) => {
          oscillator.stopped = at
        }
      }
      return oscillator
    }
  }
}
