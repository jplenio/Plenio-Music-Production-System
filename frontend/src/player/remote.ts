/**
 * The Player API's page side (``docs/api/player.md``): this page tells its server what it plays - on every change
 * and every five seconds - and carries out the commands of remote controls, stream decks and home automation,
 * which it asks for with a long poll that answers the moment one arrives. The server sends a command to the page
 * that plays; a shared player (portable) has no server and takes part in nothing.
 */
import { watch } from 'vue'

import { api, type RemoteCommand } from './api'
import { engine } from './engine'
import { addLive, startLive, stopLive } from './live'
import { isPortable } from './portable'
import { current, duration, enqueue, index, loadError, loading, next, playing, previous, queue, settings, time, toggleCurrent } from './store'

/** This page's own id among the open player pages (a new one each time the page opens). */
export const PAGE_ID = pageId()

/** 128 random bits (``getRandomValues`` exists on a page served over plain HTTP too, ``randomUUID`` does not). */
function pageId(): string {
  const bytes = new Uint8Array(16)
  globalThis.crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

/** What this page reports (``remote.PlayerRemote.report``). */
export function shownToRemote(): Record<string, unknown> {
  const at = index.value
  const live = settings.live ?? { on: false, insert: 'next', auto: true, atEnd: 'again' }
  return {
    page: PAGE_ID,
    playing: playing.value,
    position: time.value,
    duration: duration.value,
    now: current.value ? { id: current.value.id } : null,
    next: queue.value.slice(at + 1, at + 4),
    queue_length: queue.value.length,
    live: { on: !!live.on, insert: live.insert, auto: live.auto, atEnd: live.atEnd },
  }
}

/** What a command does, given the player's actions (a test passes its own). */
export interface Actions {
  play(): unknown
  pause(): unknown
  toggle(): unknown
  next(): unknown
  previous(): unknown
  seek(seconds: number): unknown
  queue(id: string, where: 'next' | 'end'): unknown
  live(changes: { on?: boolean; insert?: 'next' | 'end' | 'random'; auto?: boolean; atEnd?: 'again' | 'wait' }): unknown
}

export function carryOutCommand(command: RemoteCommand, actions: Actions): void {
  switch (command.do) {
    case 'play': case 'pause': case 'toggle': case 'next': case 'previous':
      void actions[command.do]()
      return
    case 'seek':
      void actions.seek(command.seconds)
      return
    case 'queue':
      void actions.queue(command.id, command.where)
      return
    case 'live': {
      const { n: _, do: __, ...changes } = command
      void actions.live(changes)
    }
  }
} // prettier-ignore

const ACTIONS: Actions = {
  play: () => (current.value ? engine.play() : undefined),
  pause: () => engine.pause(),
  toggle: () => toggleCurrent(),
  next: () => next(),
  previous: () => previous(),
  seek: (seconds) => engine.seek(seconds),
  queue: (id, where) => (settings.live?.on ? addLive([id], where) : enqueue([id], where === 'next')),
  live: (changes) => {
    const { on, ...rules } = changes
    Object.assign(settings.live, rules)
    if (on === true && !settings.live.on) void startLive()
    if (on === false && settings.live.on) stopLive()
  },
}

let reportTimer: number | undefined
let heartbeat: number | undefined
let polling = false
let after = 0

function report(soon = 200): void {
  window.clearTimeout(reportTimer)
  reportTimer = window.setTimeout(() => void api.remoteReport(shownToRemote()).catch(() => undefined), soon)
}

async function poll(): Promise<void> {
  if (polling) return
  polling = true
  while (polling) {
    try {
      const { commands } = await api.remoteCommands(PAGE_ID, after)
      for (const command of commands) {
        after = Math.max(after, command.n)
        carryOutCommand(command, ACTIONS)
      }
      if (commands.length) report(300)
    } catch {
      // the player restarts, or this browser is a guest's (no login): ask again a little later
      await new Promise((done) => window.setTimeout(done, 5000))
    }
  }
}

function start(): void {
  report(0)
  heartbeat = window.setInterval(() => report(0), 5000)
  void poll()
  watch([playing, () => current.value?.id, () => queue.value.slice(index.value + 1, index.value + 4).join(','), () => ({ ...settings.live })], () => report(), { deep: true })
  window.addEventListener('pagehide', () => {
    polling = false
    window.clearInterval(heartbeat)
    navigator.sendBeacon?.('/api/remote/leave', new Blob([JSON.stringify({ page: PAGE_ID })], { type: 'application/json' }))
  })
}

// a page takes part once it has its library (not while it asks who is listening, nor while it reads the folders)
if (!isPortable && typeof window !== 'undefined' && import.meta.env.MODE !== 'test') {
  const stop = watch(loading, (busy) => {
    if (busy || loadError.value) return
    start()
    stop()
  })
}
