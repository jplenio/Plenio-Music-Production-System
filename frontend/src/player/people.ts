/**
 * People & access (phase 6.2, PD §9.1): who comes in and what each may do, on one page. The five roles are names
 * for what exists - the stored groups keep their ids (``listener``, ``maker``, ``admin``), so no state moves:
 *
 *   Host        the admin, on this computer           Co-host   group ``admin`` (a helper)
 *   Maker       group ``maker``                       Listener  group ``listener``
 *   Party guest a phone on the guests' page, no account
 *
 * The grid binds each cell to a setting that exists (the guests' access, the party songs) or shows a fixed rule;
 * this file is the one table of it, and a test holds the grid, the old switches and the server's rules together.
 * *Start a party* sets several of those settings at once and *End the party* puts each back as it was.
 */
import type { GuestStatus } from './api'
import type { MakeStatus } from './make/form'

export type Role = 'guest' | 'listener' | 'maker' | 'cohost' | 'host'
export const ROLES: { id: Role; name: string; group?: 'listener' | 'maker' | 'admin'; how: string }[] = [
  { id: 'guest', name: 'Party guest', how: 'scans the party’s code - no account; their phone remembers their songs' },
  { id: 'listener', name: 'Listener', group: 'listener', how: 'an account: listens, keeps their own playlists' },
  { id: 'maker', name: 'Maker', group: 'maker', how: 'an account: listens and makes songs' },
  { id: 'cohost', name: 'Co-host', group: 'admin', how: 'an account with the host’s rights, from any device; their own playlists' },
  { id: 'host', name: 'Host', how: 'you, at this computer - and on your own devices (My devices)' },
]

/** A stored group's role name (the groups keep their ids). */
export function roleOfGroup(group: string | undefined): string {
  return ROLES.find((r) => r.group === group)?.name ?? 'Maker'
}

export type MakeSettingsValues = MakeStatus['settings']
export interface Settings {
  guests: Pick<GuestStatus, 'on' | 'mode' | 'reactions'>
  make: MakeSettingsValues
}
/** What a cell writes: the guests' access's changes, the party songs' changes. */
export interface Changes {
  guests?: Partial<Pick<GuestStatus, 'on' | 'mode' | 'reactions'>>
  make?: Partial<MakeSettingsValues>
}

export type Cell =
  | { kind: 'fixed'; value: boolean | null }
  | { kind: 'setting'; key: string; read: (s: Settings) => boolean; write: (on: boolean, s: Settings) => Changes; needs?: (s: Settings) => boolean }

export interface Row {
  id: string
  label: string
  cells: Record<Role, Cell>
}

const yes: Cell = { kind: 'fixed', value: true }
const no: Cell = { kind: 'fixed', value: false }
const never: Cell = { kind: 'fixed', value: null }

/** Making songs is on for this kind of person: the switch *Let people make songs* and theirs. */
const makes = (who: 'users' | 'guests') => (s: Settings): boolean => !!s.make.on && !!s.make[who]
/** Switching one kind on switches making songs on; the last one off switches it off. */
const setMakes = (who: 'users' | 'guests') => (on: boolean, s: Settings): Changes => {
  const other = who === 'users' ? 'guests' : 'users'
  const otherOn = !!s.make.on && !!s.make[other]
  return { make: { [who]: on, ...(on ? { on: true } : otherOn ? {} : { on: false }) } }
}

const reactions: Cell = { kind: 'setting', key: 'guests.reactions', read: (s) => s.guests.reactions, write: (on) => ({ guests: { reactions: on } }) }
const changeLive: Cell = { kind: 'setting', key: 'guests.mode', read: (s) => s.guests.mode === 'change', write: (on) => ({ guests: { mode: on ? 'change' : 'view' } }) }
const covers: Cell = { kind: 'setting', key: 'make.covers', read: (s) => !!s.make.covers, write: (on) => ({ make: { covers: on } }), needs: (s) => !!s.make.on }
/** *In your network* gives the whole studio - every field, no party limits, at any time - to whoever comes in by
 * it, also when logged in (the server's ``remote`` setting); off, they keep the party's rules. One setting for all. */
const studio: Cell = { kind: 'setting', key: 'make.remote', read: (s) => !!s.make.remote, write: (on) => ({ make: { remote: on } }) }
const noApproval: Cell = { kind: 'setting', key: 'make.approve', read: (s) => !s.make.approve, write: (on) => ({ make: { approve: !on } }), needs: (s) => !!s.make.on }

/** The grid of PD §9.1: ✓ and - fixed, the rest a setting. The guests' page is everyone's way into the live
 * playlist on a phone, so *add songs* is one switch for all who use it; covers and approval are one switch each for
 * everybody who makes songs (the server keeps one), so their cells in two columns move together. */
export const GRID: Row[] = [
  { id: 'react', label: 'see what plays, react', cells: { guest: reactions, listener: yes, maker: yes, cohost: yes, host: yes } },
  { id: 'add', label: 'add songs to the live playlist (on the party’s page)', cells: { guest: changeLive, listener: changeLive, maker: changeLive, cohost: yes, host: yes } },
  {
    id: 'make',
    label: 'make songs',
    cells: {
      guest: { kind: 'setting', key: 'make.guests', read: makes('guests'), write: setMakes('guests') },
      listener: never,
      maker: { kind: 'setting', key: 'make.users', read: makes('users'), write: setMakes('users') },
      cohost: yes,
      host: yes,
    },
  },
  { id: 'covers', label: 'make covers', cells: { guest: covers, listener: never, maker: covers, cohost: yes, host: yes } },
  { id: 'studio', label: 'the whole studio when they come by the network link (every field, no limits)', cells: { guest: studio, listener: never, maker: studio, cohost: yes, host: studio } },
  { id: 'approval', label: 'their song plays without approval', cells: { guest: noApproval, listener: never, maker: noApproval, cohost: yes, host: yes } },
  { id: 'approve', label: 'approve songs, invite people', cells: { guest: never, listener: never, maker: never, cohost: yes, host: yes } },
  { id: 'settings', label: 'remove songs, change settings', cells: { guest: never, listener: never, maker: never, cohost: yes, host: yes } },
  { id: 'computer', label: 'folders, stop the player', cells: { guest: never, listener: never, maker: never, cohost: no, host: yes } },
]

/** A cell's value now: ``true`` / ``false``, ``null`` for one that does not apply. */
export function cellValue(cell: Cell, s: Settings): boolean | null {
  return cell.kind === 'fixed' ? cell.value : cell.read(s)
}

// --- the three starting points ---------------------------------------------------------------------------------

export type Start = 'me' | 'family' | 'party'
export const STARTS: { id: Start; name: string; text: string }[] = [
  { id: 'me', name: 'Just me', text: 'Only you, on your devices. Nobody else makes songs.' },
  { id: 'family', name: 'Family', text: 'People with accounts listen and make songs. No party.' },
  { id: 'party', name: 'House party', text: 'Guests add songs and make their own; you approve them first.' },
]

export function startChanges(start: Start): Changes {
  switch (start) {
    case 'me':
      // only your own devices: they have the whole studio by the network link
      return { guests: { on: false }, make: { on: false, remote: true } }
    case 'family':
      return { guests: { on: false }, make: { on: true, users: true, guests: false, approve: false, remote: false } }
    case 'party':
      return { guests: { on: true, mode: 'change', reactions: true }, make: { on: true, users: true, guests: true, approve: true, remote: false } }
  }
}

/** Which starting point the settings are now, if any. */
export function startOf(s: Settings): Start | null {
  return STARTS.map((x) => x.id).find((id) => {
    const want = startChanges(id)
    const same = (have: object, wanted: object | undefined): boolean =>
      Object.entries(wanted ?? {}).every(([k, v]) => {
        const now = (have as Record<string, unknown>)[k]
        return typeof v === 'boolean' ? !!now === v : now === v
      })
    return same(s.guests, want.guests) && (want.make?.on === false ? !s.make.on && !!s.make.remote : same(s.make, want.make))
  }) ?? null
}

// --- Start a party, End the party (6.3) -------------------------------------------------------------------------

export interface PartyPlan {
  name: string
  /** What guests may do: add songs, make songs, react - the grid's guest column. */
  add: boolean
  make: boolean
  react: boolean
  /** Their songs play only after you approved them. */
  approve: boolean
}

export const PARTY_DEFAULT: PartyPlan = { name: '', add: true, make: true, react: true, approve: true }

/** Live Play's own switch is the page's (its settings), not the server's. */
export interface Before {
  guests: Pick<GuestStatus, 'on' | 'mode' | 'reactions'>
  make: Pick<MakeSettingsValues, 'on' | 'guests' | 'approve' | 'remote'>
  live: boolean
}

export function partyChanges(plan: PartyPlan, s: Settings, liveOn: boolean): { changes: Changes; live: boolean; before: Before } {
  return {
    changes: {
      guests: { on: true, mode: plan.add ? 'change' : 'view', reactions: plan.react },
      // the party's rules for everyone who comes by the network too (its link is in every invitation's code)
      make: plan.make ? { on: true, guests: true, approve: plan.approve, remote: false } : { guests: false, remote: false },
    },
    live: true,
    before: snapshot(s, liveOn),
  }
}

export function snapshot(s: Settings, live: boolean): Before {
  return {
    guests: { on: s.guests.on, mode: s.guests.mode, reactions: s.guests.reactions },
    make: { on: !!s.make.on, guests: !!s.make.guests, approve: !!s.make.approve, remote: s.make.remote !== false },
    live,
  }
}

/** *End the party*: every setting *Start* changed, back as it was. */
export function endChanges(before: Before): { changes: Changes; live: boolean } {
  return { changes: { guests: { ...before.guests }, make: { ...before.make } }, live: before.live }
}
