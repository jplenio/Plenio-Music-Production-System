/**
 * Who listens (owner's request 2026-10-23, plenio/player/accounts.py): the player opens with a login page - a
 * user set up by the admin keeps the same playlists, likes, plays and settings on every device; the admin logs
 * in on the player's computer only and has the player's state as it was; a guest keeps theirs in this browser.
 * A device stays logged in (a cookie) and a guest's choice is remembered here, so the page asks once.
 *
 * A user is a listener, a maker or an admin (owner's request 2026-10-29): an admin user is a helper with the admin's
 * rights - from any device - but their own playlists and likes.
 */
import { computed, ref } from 'vue'

import { keepStateInBrowser } from './api'
import { isPortable } from './portable'

export type Group = 'listener' | 'maker' | 'admin'

export interface Account {
  id: string
  name: string
  /** The player's admin (this computer's). */
  admin: boolean
  /** What the user may: listen, also make songs, or everything the admin may (``helper``). */
  group?: Group
  helper?: boolean
  avatar: boolean
  color: string
  created?: number
  last_login?: number
}

export interface Session {
  /** The player has the login (a player started before 1.2, or a shared one, has not). */
  login: boolean
  /** The logged-in user - or this computer's admin while nobody chose (``null``: a guest from the network). */
  user: Account | null
  /** Somebody logged in on this device (else the login page asks). */
  chosen: boolean
  /** The page is on the player's own computer (the admin can log in). */
  local: boolean
  users: Account[]
  admin?: Account | null
}

export const session = ref<Session | null>(null)
/** Who this page is for (``null``: a guest). */
export const me = ref<Account | null>(null)
/** The admin's rights here: the admin, or a helper. */
export const canAdmin = computed(() => !!me.value && (me.value.admin || !!me.value.helper))
/** Songs may leave the library from this page: the admin's rights - or a player without the login, as its server
 * says (a listener, a maker or a guest keeps their own playlists, not the songs). */
export const canRemoveSongs = computed(() => !session.value?.login || canAdmin.value)
/** The groups by their role names (People & access; the stored ids stay). */
export const GROUPS: [Group, string, string][] = [
  ['listener', 'Listener', 'Listens and keeps their own playlists; does not make songs'],
  ['maker', 'Maker', 'Listens and makes songs, when People & access lets makers make them'],
  ['admin', 'Co-host', 'Everything the host may - people, approvals, settings - from any device; their own playlists and likes stay theirs'],
]
export const guest = ref(false)
export const loginShown = ref(false)
/** Changes with a new picture, so that the browser shows it at once. */
export const avatarStamp = ref(Date.now())

const GUEST_KEY = 'plenio-guest'

function remembered(): boolean {
  try {
    return localStorage.getItem(GUEST_KEY) === '1'
  } catch {
    return false
  }
}

function remember(on: boolean): void {
  try {
    if (on) localStorage.setItem(GUEST_KEY, '1')
    else localStorage.removeItem(GUEST_KEY)
  } catch {
    // a private window: the page asks again next time
  }
}

export function avatarUrl(account: Account | null | undefined): string {
  return account?.avatar ? `/api/users/${account.id}/avatar?v=${avatarStamp.value}` : ''
}

/** Initials for an account without a picture. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return (parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] ?? '?').slice(0, 2)).toUpperCase()
}

async function answer<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.error ?? `${response.url}: ${response.status}`)
  return data as T
}

const sendJson = (url: string, method: string, body?: unknown): Promise<Response> =>
  fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) })

export async function readSession(): Promise<Session> {
  const found = await answer<Session>(await fetch('/api/session'))
  session.value = found
  return found
}

/** Before the page reads its state: ``true`` when it knows whose (a login on this device, a guest's choice
 * remembered, or a player without the login), ``false`` when the login page asks. */
export async function begin(): Promise<boolean> {
  if (isPortable) return true
  let found: Session
  try {
    found = await readSession()
  } catch {
    return true // an older player's server: as before
  }
  if (!found.login) return true
  if (found.chosen && found.user) {
    me.value = found.user
    return true
  }
  if (remembered()) {
    useGuest()
    return true
  }
  return false
}

function useGuest(): void {
  guest.value = true
  me.value = null
  keepStateInBrowser(true)
}

export async function logIn(user: string, password: string): Promise<void> {
  const { user: account } = await answer<{ user: Account }>(await sendJson('/api/login', 'POST', { user, password }))
  me.value = account
  guest.value = false
  remember(false)
}

export async function logInAdmin(): Promise<void> {
  const { user: account } = await answer<{ user: Account }>(await sendJson('/api/login', 'POST', { admin: true }))
  me.value = account
  guest.value = false
  remember(false)
}

export function continueAsGuest(): void {
  remember(true)
  useGuest()
}

/** Log out (or leave the guest's choice) and start again at the login page. */
export async function switchUser(): Promise<void> {
  remember(false)
  if (!guest.value) await sendJson('/api/logout', 'POST', {}).catch(() => null)
  window.location.reload()
}

// --- the users (Settings) -------------------------------------------------------------------------------

export async function listUsers(): Promise<Account[]> {
  return (await answer<{ users: Account[] }>(await fetch('/api/users'))).users
}

export async function addUser(name: string, password: string, group: Group = 'maker'): Promise<Account> {
  return (await answer<{ user: Account }>(await sendJson('/api/users', 'POST', { name, password, group }))).user
}

export async function changeUser(id: string, changes: { name?: string; password?: string; color?: string; group?: Group }): Promise<Account> {
  const account = (await answer<{ user: Account }>(await sendJson(`/api/users/${id}`, 'PUT', changes))).user
  if (me.value?.id === account.id) me.value = account
  return account
}

export async function removeUser(id: string): Promise<void> {
  await answer(await sendJson(`/api/users/${id}`, 'DELETE'))
}

/** A picture made square and small (256 px) in the page, then kept as the user's avatar. */
export async function setAvatar(id: string, file: Blob | null): Promise<Account> {
  let body: Blob | null = null
  if (file) {
    const bitmap = await createImageBitmap(file)
    const side = Math.min(bitmap.width, bitmap.height)
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 256
    canvas.getContext('2d')?.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, 256, 256)
    body = await new Promise<Blob | null>((done) => canvas.toBlob(done, 'image/png'))
    if (!body) throw new Error('The picture could not be read.')
  }
  const response = await fetch(`/api/users/${id}/avatar`, {
    method: body ? 'PUT' : 'DELETE',
    headers: { 'X-Plenio-Player': '1', 'Content-Type': body ? 'image/png' : 'application/json' },
    body: body ?? undefined,
  })
  const account = (await answer<{ user: Account }>(response)).user
  if (me.value?.id === account.id) me.value = account
  avatarStamp.value = Date.now()
  return account
}

// --- invitations (People & access) ---------------------------------------------------------------------------

export interface Invite {
  id: string
  name: string
  group: Group
  /** Valid until (seconds since 1970). */
  until: number
}

export async function listInvites(): Promise<Invite[]> {
  return (await answer<{ invites: Invite[] }>(await fetch('/api/invites'))).invites
}

/** A one-time code for a new user (15 minutes); ``path``: the page that accepts it, on this player. */
export async function inviteSomeone(name: string, group: Group): Promise<{ code: string; invite: Invite; path: string }> {
  return answer(await sendJson('/api/invites', 'POST', { name, group }))
}

export async function withdrawInvite(id: string): Promise<void> {
  await answer(await sendJson(`/api/invites/${id}`, 'DELETE'))
}

/** Whom a code invites (an error when it is used up or too old). */
export async function checkInvite(code: string): Promise<{ name: string; group: Group }> {
  return (await answer<{ invite: { name: string; group: Group } }>(await sendJson('/api/invites/check', 'POST', { code }))).invite
}

/** The invited person's password or PIN: they are a user now, logged in on this device. */
export async function acceptInvite(code: string, password: string): Promise<Account> {
  const { user } = await answer<{ user: Account }>(await sendJson('/api/invites/accept', 'POST', { code, password }))
  me.value = user
  guest.value = false
  remember(false)
  return user
}

/** The code of an invitation's link (``#/join/<code>``), ``''`` for any other address. */
export function joinCode(hash: string): string {
  const match = /^#\/join\/([A-Za-z0-9_-]{8,64})$/.exec(hash)
  return match ? match[1] : ''
}

/** The invitation this page was opened with (its code), until it is accepted or set aside. */
export const joining = ref(typeof location === 'undefined' ? '' : joinCode(location.hash))
