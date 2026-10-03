/**
 * MIDI keyboards for the score editor (owner's request 2026-10-03: record sequences with a MIDI
 * keyboard - stable and easy). Web MIDI (Chrome, Edge, Opera; Firefox with the site's permission): one
 * hub per page asks for access once, keeps the list of inputs current when a keyboard is plugged in or
 * out, and hands note-on / note-off events with their time (``performance.now()`` milliseconds) to the
 * listeners - the recorder and the step input.
 *
 * Nothing is sent to a MIDI output and no system-exclusive access is asked for.
 */
import { ref } from 'vue'

export interface MidiNoteEvent {
  kind: 'on' | 'off'
  note: number
  velocity: number
  /** When it arrived, in ``performance.now()`` milliseconds. */
  time: number
  input: string
  channel: number
}

export interface MidiDevice {
  id: string
  name: string
  connected: boolean
}

export type MidiStatus = 'off' | 'asking' | 'ready' | 'unsupported' | 'insecure' | 'denied' | 'failed'

type Listener = (event: MidiNoteEvent) => void

interface MidiInputLike {
  id: string
  name?: string | null
  manufacturer?: string | null
  state?: string
  onmidimessage: ((event: { data: Uint8Array; timeStamp?: number }) => void) | null
}

interface MidiAccessLike {
  inputs: { forEach: (fn: (input: MidiInputLike) => void) => void }
  onstatechange: ((event: unknown) => void) | null
}

/** Controller 120 (all sound off) or 123 (all notes off): the keyboard lets every key go. */
export function isAllNotesOff(data: ArrayLike<number>): boolean {
  return data.length >= 3 && (data[0] & 0xf0) === 0xb0 && (data[1] === 120 || data[1] === 123)
}

/** The note event of a raw MIDI message (``null``: not a note - controllers, clock ...). */
export function noteEvent(data: ArrayLike<number>, time: number, input: string): MidiNoteEvent | null {
  if (data.length < 3) return null
  const type = data[0] & 0xf0
  const channel = data[0] & 0x0f
  const note = data[1] & 0x7f
  const velocity = data[2] & 0x7f
  if (type === 0x90 && velocity > 0) return { kind: 'on', note, velocity, time, input, channel }
  if (type === 0x80 || type === 0x90) return { kind: 'off', note, velocity, time, input, channel }
  return null
}

/** What to tell the user when MIDI is not available. */
export function problemOf(status: MidiStatus, error?: unknown): string | null {
  switch (status) {
    case 'unsupported':
      return 'This browser has no Web MIDI. Use Chrome or Edge (in Firefox: allow MIDI for this site); the ComfyUI desktop app may not offer it.'
    case 'insecure':
      return 'The browser offers MIDI only to a secure page: open ComfyUI at http://127.0.0.1 or localhost (or over https), not by the computer’s network address.'
    case 'denied':
      return 'MIDI access was refused. Allow it in the browser’s site settings (the icon left of the address), then press rec again.'
    case 'failed':
      return `MIDI could not be opened${error instanceof Error ? `: ${error.message}` : ''}.`
    default:
      return null
  }
}

export class MidiHub {
  readonly status = ref<MidiStatus>('off')
  readonly problem = ref<string | null>(null)
  readonly devices = ref<MidiDevice[]>([])
  /** The last note's time (``performance.now()`` ms): the activity light. */
  readonly activity = ref(0)
  /** ``'all'`` or an input's id (kept while that keyboard is unplugged: then every one is listened to). */
  readonly selected = ref('all')
  private listeners = new Set<Listener>()
  /** The keys held on each input that the listeners heard go down (note -> channel) - let go when the
   * keyboard is unplugged or sends *all notes off*. */
  private held = new Map<string, Map<number, number>>()
  private access: MidiAccessLike | null = null
  private pending: Promise<boolean> | null = null

  constructor(private readonly navigatorLike: { requestMIDIAccess?: (options?: { sysex?: boolean }) => Promise<unknown> } | null = typeof navigator === 'undefined' ? null : (navigator as never)) {}

  /** Ask for MIDI access (once; again after a refusal). ``true`` when inputs can be read. */
  enable(): Promise<boolean> {
    if (this.status.value === 'ready') return Promise.resolve(true)
    if (this.pending) return this.pending
    const request = this.navigatorLike?.requestMIDIAccess
    if (!request) {
      // Web MIDI exists only in a secure context (localhost counts, a LAN address over http does not)
      this.fail(typeof window !== 'undefined' && window.isSecureContext === false ? 'insecure' : 'unsupported')
      return Promise.resolve(false)
    }
    this.status.value = 'asking'
    this.problem.value = null
    this.pending = request
      .call(this.navigatorLike, { sysex: false })
      .then((access) => {
        this.access = access as MidiAccessLike
        this.access.onstatechange = () => this.refresh()
        this.refresh()
        this.status.value = 'ready'
        return true
      })
      .catch((error: unknown) => {
        const name = (error as { name?: string } | null)?.name
        this.fail(name === 'SecurityError' || name === 'NotAllowedError' ? 'denied' : 'failed', error)
        return false
      })
      .finally(() => {
        this.pending = null
      })
    return this.pending
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /** The inputs as they are now; every connected one is listened to (a keyboard plugged in later too). */
  refresh(): void {
    const devices: MidiDevice[] = []
    this.access?.inputs.forEach((input) => {
      const connected = input.state !== 'disconnected'
      devices.push({ id: input.id, name: [input.manufacturer, input.name].filter(Boolean).join(' ') || input.id, connected })
      input.onmidimessage = connected ? (message) => this.receive(input.id, message) : null
      if (!connected) this.letGo(input.id) // unplugged with a key down: no note-off will come
    })
    this.devices.value = devices
  }

  /** The keyboard listened to: the chosen one, or every one while it is unplugged. */
  get listening(): string {
    const chosen = this.selected.value
    return chosen !== 'all' && this.devices.value.some((d) => d.id === chosen && d.connected) ? chosen : 'all'
  }

  private receive(input: string, message: { data: Uint8Array; timeStamp?: number }): void {
    const time = typeof message.timeStamp === 'number' && message.timeStamp > 0 ? message.timeStamp : performance.now()
    if (isAllNotesOff(message.data)) {
      this.letGo(input, time)
      return
    }
    const event = noteEvent(message.data, time, input)
    if (!event) return
    const keys = this.held.get(input) ?? new Map<number, number>()
    this.held.set(input, keys)
    if (event.kind === 'off') {
      // only a key the listeners heard go down (also when another keyboard was chosen meanwhile)
      if (keys.delete(event.note)) this.emit(event)
      return
    }
    const listening = this.listening
    if (listening !== 'all' && listening !== input) return
    keys.set(event.note, event.channel)
    this.activity.value = performance.now()
    this.emit(event)
  }

  /** Every key held on ``input`` goes up (a note-off for each). */
  private letGo(input: string, time = performance.now()): void {
    const keys = this.held.get(input)
    if (!keys?.size) return
    this.held.delete(input)
    for (const [note, channel] of keys) this.emit({ kind: 'off', note, velocity: 0, time, input, channel })
  }

  private emit(event: MidiNoteEvent): void {
    for (const listener of [...this.listeners]) {
      try {
        listener(event)
      } catch (error) {
        console.error('Plenio: a MIDI listener failed', error)
      }
    }
  }

  private fail(status: MidiStatus, error?: unknown): void {
    this.status.value = status
    this.problem.value = problemOf(status, error)
  }
}

let hub: MidiHub | null = null

/** The page's MIDI hub (created on first use). */
export function midiHub(): MidiHub {
  hub ??= new MidiHub()
  return hub
}
