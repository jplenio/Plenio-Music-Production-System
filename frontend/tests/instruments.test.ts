/**
 * The playback's sounds (owner's request 2026-10-03): every instrument builds its note from Web Audio
 * nodes, starts them at the note's time, ends them after the release - also a struck note held for
 * long - and stops at once with the playback. Unknown sounds fall back to the classic ones.
 */
import { describe, expect, it } from 'vitest'

import { INSTRUMENT_IDS, defaultSounds, isInstrument, soundsOf, startVoice } from '../src/sheet-editor/score/instruments'
import { type FakeOscillator, audioNodes } from './support/fakeAudio'

function context() {
  const started: FakeOscillator[] = []
  const ctx = { currentTime: 0, ...audioNodes((o) => started.push(o)) }
  return { ctx: ctx as unknown as BaseAudioContext, started, out: ctx.destination as unknown as AudioNode }
}

describe('the instruments', () => {
  it.each(INSTRUMENT_IDS)('%s: starts at the note, ends after the release', (id) => {
    const { ctx, started, out } = context()
    const voice = startVoice(ctx, out, id, 60, 1, { velocity: 0.8, level: 0.2 })
    expect(started.length).toBeGreaterThan(0)
    expect(started.every((o) => o.started === 1)).toBe(true)
    voice.release(2)
    // every oscillator stops after the release, never before the note ends, and within a few seconds
    for (const o of started) {
      expect(o.stopped).not.toBeNull()
      expect(o.stopped as number).toBeGreaterThanOrEqual(2)
      expect(o.stopped as number).toBeLessThan(6)
    }
  })

  it.each(INSTRUMENT_IDS)('%s: stops at once with the playback', (id) => {
    const { ctx, started, out } = context()
    ;(ctx as unknown as { currentTime: number }).currentTime = 1.5
    const voice = startVoice(ctx, out, id, 48, 1)
    voice.stop()
    expect(started.every((o) => o.stopped === 1.5)).toBe(true)
    voice.release(3) // a release after the stop changes nothing
    expect(started.every((o) => o.stopped === 1.5)).toBe(true)
  })

  it('lets a struck note end by itself while it is held, a bowed one not', () => {
    const piano = context()
    startVoice(piano.ctx, piano.out, 'piano', 60, 0)
    expect(piano.started.every((o) => o.stopped !== null && (o.stopped as number) < 30)).toBe(true)
    const strings = context()
    startVoice(strings.ctx, strings.out, 'strings', 60, 0)
    expect(strings.started.every((o) => o.stopped === null)).toBe(true)
  })

  it('knows its instruments and keeps the sounds valid', () => {
    expect(isInstrument('piano')).toBe(true)
    expect(isInstrument('theremin')).toBe(false)
    expect(soundsOf({ Vocal: 'voice', Ins: 7, chord: 'pad' })).toEqual({ ...defaultSounds(), Vocal: 'voice', chord: 'pad' })
    expect(soundsOf(null)).toEqual(defaultSounds())
  })
})
