/**
 * Guests in the network (owner's request 2026-10-17), the player's side: the guests' access is a server of
 * its own (``plenio/player/guest.py``); this page tells it what the live playlist shows - on every change and
 * every few seconds - and carries out the guests' wishes (a song up, down, out, or added), which it asks for
 * every second and a half. The live playlist keeps one owner, this page: a wish for a song that has moved on
 * is simply not done. The guests' reactions come along and float over the screen (``reactions.ts``).
 */
import { ref, watch } from 'vue'

import { canAdmin } from './account'
import { api, type GuestStatus, type GuestWish } from './api'
import { addLive, isNew, liveLog } from './live'
import { isPortable } from './portable'
import { loadCheers, receive } from './reactions'
import { byId, current, index, liveWaiting, playing, queue, say, settings, time } from './store'

export const guestStatus = ref<GuestStatus | null>(null)
export const guestError = ref('')
/** The way in shown big over everything (for a screen the guests can see). */
export const guestBig = ref(false)

export async function loadGuests(): Promise<void> {
  if (isPortable) return
  try {
    guestStatus.value = await api.guests()
  } catch {
    // an older player without guests' access: nothing to show
  }
}

export async function setGuests(changes: Parameters<typeof api.setGuests>[0]): Promise<void> {
  try {
    guestStatus.value = await api.setGuests(changes)
    guestError.value = guestStatus.value.error
  } catch (e) {
    guestError.value = e instanceof Error ? e.message : String(e)
  }
}

/** The live playlist as this page shows it: song ids and places only (the player adds titles and covers). */
export function shownToGuests(): Record<string, unknown> {
  const at = index.value
  return {
    live: !!settings.live?.on,
    playing: playing.value,
    waiting: liveWaiting.value,
    position: time.value,
    now: current.value ? { id: current.value.id, at } : null,
    next: queue.value.slice(at + 1, at + 201).map((id, k) => ({ id, at: at + 1 + k, new: isNew(id) })),
    played: queue.value.slice(Math.max(0, at - 5), Math.max(0, at)).map((id, k, list) => ({ id, at: at - list.length + k })).reverse(),
  }
}

/** The place of the song a wish means: where the guest saw it, or else its next place after the song that
 * plays (``-1``: no longer coming). */
export function wishedAt(wish: GuestWish, list: string[], now: number): number {
  if (wish.at !== undefined && wish.at > now && list[wish.at] === wish.id) return wish.at
  return list.findIndex((id, k) => k > now && id === wish.id)
}

/** Carry out a guest's wish on the live playlist (only while Live Play is on); what happened to the song
 * (``plays next, by a guest`` ...), or ``''`` when nothing was done. */
export function carryOut(wish: GuestWish): string {
  if (!settings.live?.on) return ''
  if (wish.op === 'add') {
    const before = queue.value.length
    addLive([wish.id], wish.where ?? 'end')
    return queue.value.length > before ? `added by a guest, ${wish.where === 'next' ? 'plays next' : 'at the end'}` : ''
  }
  const list = queue.value
  const now = index.value
  const i = wishedAt(wish, list, now)
  if (i < 0) return ''
  const nowId = list[now]
  const move = (from: number, to: number): void => {
    const [song] = list.splice(from, 1)
    list.splice(to, 0, song)
    index.value = list.indexOf(nowId)
  }
  if (wish.op === 'up') {
    if (i - 1 <= now) return ''
    move(i, i - 1)
    return 'one up, by a guest'
  }
  if (wish.op === 'down') {
    if (i + 1 >= list.length) return ''
    move(i, i + 1)
    return 'one down, by a guest'
  }
  if (wish.op === 'next') {
    if (i === now + 1) return ''
    move(i, now + 1)
    return 'plays next, by a guest'
  }
  list.splice(i, 1)
  return 'taken out by a guest'
}

let publishTimer: number | undefined
let heartbeat: number | undefined
let wishTimer: number | undefined
let lastWish = 0
let lastReaction: number | undefined

function publish(soon = 250): void {
  window.clearTimeout(publishTimer)
  publishTimer = window.setTimeout(() => void api.showGuests(shownToGuests()).catch(() => undefined), soon)
}

async function pollWishes(): Promise<void> {
  try {
    const { wishes, last, reactions, last_reaction, cheers } = await api.guestWishes(lastWish, lastReaction)
    lastWish = last
    if (last_reaction !== undefined) lastReaction = last_reaction
    if (reactions?.length) receive(reactions, cheers)
    let done = 0
    for (const wish of wishes) {
      const title = byId.value.get(wish.id)?.title ?? 'a song'
      const where = carryOut(wish)
      if (!where) continue
      done += 1
      liveLog.value = [{ id: wish.id, title, at: Date.now(), where }, ...liveLog.value].slice(0, 30)
      say(`${title} - ${where}`, 3500)
    }
    if (done) publish(0)
  } catch {
    // the player restarts: ask again next time
  }
}

async function start(): Promise<void> {
  if (heartbeat !== undefined) return
  try {
    // the wishes from before this page opened are not done again (nor shown, the reactions) - their counts are
    void loadCheers(api.reactions)
    const first = await api.guestWishes(0)
    lastWish = first.last
    lastReaction = first.last_reaction
  } catch {
    lastWish = 0
  }
  publish(0)
  heartbeat = window.setInterval(() => publish(0), 5000)
  wishTimer = window.setInterval(() => void pollWishes(), 1500)
}

function stop(): void {
  window.clearInterval(heartbeat)
  window.clearInterval(wishTimer)
  window.clearTimeout(publishTimer)
  heartbeat = wishTimer = undefined
}

if (!isPortable) {
  watch(
    () => !!guestStatus.value?.on && canAdmin.value,
    (on) => (on ? void start() : stop())
  )
  // every change of the live playlist reaches the guests at once
  watch([queue, index, () => current.value?.id, playing, liveWaiting, () => settings.live?.on], () => {
    if (heartbeat !== undefined) publish()
  }, { deep: true })
}
