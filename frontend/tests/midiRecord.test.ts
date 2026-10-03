/**
 * Recording with a MIDI keyboard (owner's request 2026-10-03: stable and easy): the MIDI hub (access,
 * keyboards plugged in and out, note messages) and the take (one line of notes on the grid).
 */
import { describe, expect, it, vi } from 'vitest'

import { MidiHub, noteEvent, problemOf } from '../src/sheet-editor/score/midiInput'
import { Take, gridUnits, lineOf, recordOperation } from '../src/sheet-editor/score/recorder'

/** A fake Web MIDI: inputs that can be plugged in, out, and played. */
function fakeMidi() {
  const inputs = new Map<string, { id: string; name: string; manufacturer: string; state: string; onmidimessage: ((e: { data: Uint8Array; timeStamp?: number }) => void) | null }>()
  const access = {
    inputs: { forEach: (fn: (input: never) => void) => inputs.forEach((i) => fn(i as never)) },
    onstatechange: null as ((e: unknown) => void) | null
  }
  return {
    navigator: { requestMIDIAccess: vi.fn(() => Promise.resolve(access)) },
    plug(id: string, name: string) {
      inputs.set(id, { id, name, manufacturer: 'Acme', state: 'connected', onmidimessage: null })
      access.onstatechange?.({})
    },
    unplug(id: string) {
      const input = inputs.get(id)
      if (input) input.state = 'disconnected'
      access.onstatechange?.({})
    },
    play(id: string, bytes: number[], time = 1000) {
      inputs.get(id)?.onmidimessage?.({ data: new Uint8Array(bytes), timeStamp: time })
    }
  }
}

describe('the MIDI hub', () => {
  it('reads note-on and note-off (velocity 0 too) and ignores the rest', () => {
    expect(noteEvent([0x91, 60, 100], 5, 'k')).toEqual({ kind: 'on', note: 60, velocity: 100, time: 5, input: 'k', channel: 1 })
    expect(noteEvent([0x90, 60, 0], 5, 'k')?.kind).toBe('off')
    expect(noteEvent([0x80, 60, 64], 5, 'k')?.kind).toBe('off')
    expect(noteEvent([0xb0, 64, 127], 5, 'k')).toBeNull() // the sustain pedal
    expect(noteEvent([0xf8], 5, 'k')).toBeNull() // clock
  })

  it('asks once, follows keyboards plugged in and out, and listens to the chosen one', async () => {
    const midi = fakeMidi()
    midi.plug('a', 'Keys 49')
    const hub = new MidiHub(midi.navigator)
    const heard: number[] = []
    hub.subscribe((e) => heard.push(e.note))
    expect(await hub.enable()).toBe(true)
    expect(await hub.enable()).toBe(true)
    expect(midi.navigator.requestMIDIAccess).toHaveBeenCalledTimes(1)
    expect(hub.devices.value).toEqual([{ id: 'a', name: 'Acme Keys 49', connected: true }])
    midi.play('a', [0x90, 64, 90])
    midi.plug('b', 'Pad') // plugged in while the editor is open: heard at once
    midi.play('b', [0x90, 67, 90])
    expect(heard).toEqual([64, 67])
    hub.selected.value = 'b'
    midi.play('a', [0x90, 60, 90])
    expect(heard).toEqual([64, 67])
    midi.unplug('b') // the chosen keyboard goes: all are heard until it is back, the choice stays
    expect(hub.selected.value).toBe('b')
    expect(hub.listening).toBe('all')
    midi.play('a', [0x90, 62, 90])
    expect(heard.at(-1)).toBe(62)
    midi.plug('b', 'Pad')
    expect(hub.listening).toBe('b')
  })

  it('lets held keys go when the keyboard is unplugged or sends all notes off', async () => {
    const midi = fakeMidi()
    midi.plug('a', 'Keys')
    const hub = new MidiHub(midi.navigator)
    const heard: string[] = []
    hub.subscribe((e) => heard.push(`${e.kind} ${e.note}`))
    await hub.enable()
    midi.play('a', [0x90, 60, 90])
    midi.play('a', [0x90, 64, 90])
    midi.play('a', [0xb0, 123, 0]) // all notes off
    expect(heard).toEqual(['on 60', 'on 64', 'off 60', 'off 64'])
    midi.play('a', [0x80, 60, 0]) // a note-off for a key already let go: nothing
    midi.play('a', [0x90, 67, 90])
    midi.unplug('a')
    expect(heard.slice(4)).toEqual(['on 67', 'off 67'])
  })

  it('lets a key go that went down before another keyboard was chosen', async () => {
    const midi = fakeMidi()
    midi.plug('a', 'Keys')
    midi.plug('b', 'Pad')
    const hub = new MidiHub(midi.navigator)
    const heard: string[] = []
    hub.subscribe((e) => heard.push(`${e.kind} ${e.note} ${e.input}`))
    await hub.enable()
    midi.play('a', [0x90, 60, 90])
    hub.selected.value = 'b'
    midi.play('a', [0x90, 62, 90]) // not the chosen keyboard: not heard
    midi.play('a', [0x80, 62, 0])
    midi.play('a', [0x80, 60, 0]) // but its earlier key still goes up
    expect(heard).toEqual(['on 60 a', 'off 60 a'])
  })

  it('says why there is no MIDI', async () => {
    const none = new MidiHub({})
    expect(await none.enable()).toBe(false)
    expect(none.status.value).toBe('unsupported')
    expect(none.problem.value).toContain('Chrome or Edge')
    vi.stubGlobal('isSecureContext', false) // ComfyUI opened by the computer's network address over http
    const insecure = new MidiHub({})
    expect(await insecure.enable()).toBe(false)
    expect(insecure.problem.value).toContain('127.0.0.1')
    vi.unstubAllGlobals()
    const refused = new MidiHub({ requestMIDIAccess: () => Promise.reject(Object.assign(new Error('no'), { name: 'NotAllowedError' })) })
    expect(await refused.enable()).toBe(false)
    expect(refused.status.value).toBe('denied')
    expect(problemOf('failed', new Error('busy'))).toContain('busy')
  })
})

describe('a take', () => {
  const options = { start: 32, stop: 96, total: 128, grid: 2, chordUnits: 0.5, pickup: 4 }

  it('makes one line: chords give their highest note, legato is cut, all on the grid', () => {
    const take = new Take(32, 'vocal')
    take.noteOn(60, 32.3)
    take.noteOn(64, 32.5) // together with 60: a chord
    take.noteOff(60, 35)
    take.noteOff(64, 35.2)
    take.noteOn(67, 39.6)
    take.noteOn(69, 43.8) // pressed before 67 is let go: 67 ends there
    take.noteOff(67, 45)
    take.noteOff(69, 47.9)
    expect(lineOf(take.finish(96), options)).toEqual([
      { onset: 32, duration: 4, pitch: 64 },
      { onset: 40, duration: 4, pitch: 67 },
      { onset: 44, duration: 4, pitch: 69 }
    ])
  })

  it('lands a key of the count-in on the start, ends held keys at the stop and keeps inside the score', () => {
    const take = new Take(32, 'ins')
    take.noteOn(55, 30.4) // half a beat early
    take.noteOff(55, 33.9)
    take.noteOn(57, 90)
    expect(take.played(92).at(-1)).toMatchObject({ pitch: 57, end: 92 }) // the live picture
    const line = lineOf(take.finish(96), options)
    expect(line).toEqual([
      { onset: 32, duration: 2, pitch: 55 },
      { onset: 90, duration: 6, pitch: 57 }
    ])
    take.noteOn(50, 10) // far before the start: not part of the take
    expect(lineOf(take.finish(96), options).some((n) => n.pitch === 50)).toBe(false)
  })

  it('writes the take with one operation: replace clears the range, merge only the notes', () => {
    const notes = [{ onset: 32, duration: 4, pitch: 64 }]
    expect(recordOperation('vocal', notes, 32, 96.4, 'replace')).toEqual({ op: 'place_notes', track: 'vocal', notes, clear: [32, 96], label: 'recorded' })
    expect(recordOperation('ins', notes, 32, 96, 'merge')).toEqual({ op: 'place_notes', track: 'ins', notes, label: 'recorded' })
    expect([gridUnits('1/16', 8), gridUnits('1/32', 16), gridUnits('1/16', 0)]).toEqual([2, 2, 1])
  })
})
