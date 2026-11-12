/** People & access (phase 6.2, 6.3): every cell of the grid reads and writes the setting it names - the same keys
 * the old switches (Settings › Party songs, Live Play's guests' access) change; the starting points; a party started
 * and ended leaves every setting as it was. */
import { describe, expect, it } from 'vitest'

import { cellValue, type Changes, endChanges, GRID, PARTY_DEFAULT, partyChanges, ROLES, type Settings, snapshot, startChanges, startOf, STARTS, roleOfGroup } from '../src/player/people'
import makeSettingsSource from '../src/player/components/MakeSettings.vue?raw'
import guestAccessSource from '../src/player/components/GuestAccess.vue?raw'

function base(): Settings {
  return {
    guests: { on: false, mode: 'view', reactions: true },
    make: { on: false, users: true, guests: true, per_person: 3, max_length: 'about 4:00', covers: true, approve: false, listen_first: false },
  }
}

function applied(s: Settings, changes: Changes): Settings {
  return { guests: { ...s.guests, ...changes.guests }, make: { ...s.make, ...changes.make } }
}

describe('the grid', () => {
  it('has a cell for every role in every row', () => {
    for (const row of GRID) expect(Object.keys(row.cells).sort()).toEqual(ROLES.map((r) => r.id).sort())
  })

  it('writes and reads back every setting cell, on and off', () => {
    for (const row of GRID) {
      for (const role of ROLES) {
        const cell = row.cells[role.id]
        if (cell.kind !== 'setting') continue
        for (const on of [true, false]) {
          for (const start of [base(), applied(base(), { make: { on: true } })]) {
            expect(cellValue(cell, applied(start, cell.write(on, start))), `${row.id}/${role.id} -> ${on}`).toBe(on)
          }
        }
      }
    }
  })

  it('names only keys the old switches change', () => {
    const keys = new Set(GRID.flatMap((row) => Object.values(row.cells)).filter((c) => c.kind === 'setting').map((c) => (c as { key: string }).key))
    for (const key of keys) {
      const [where, name] = key.split('.')
      const source = where === 'make' ? makeSettingsSource : guestAccessSource
      expect(source, key).toMatch(new RegExp(`['"]${name}['"]|\\b${name}\\b`))
    }
  })

  it('keeps the server’s rules: a listener never makes songs, only the host has the computer', () => {
    const make = GRID.find((r) => r.id === 'make')!
    expect(make.cells.listener).toEqual({ kind: 'fixed', value: null })
    const computer = GRID.find((r) => r.id === 'computer')!
    expect(cellValue(computer.cells.cohost, base())).toBe(false)
    expect(cellValue(computer.cells.host, base())).toBe(true)
  })

  it('switches making songs off with the last kind of person, on with the first', () => {
    const make = GRID.find((r) => r.id === 'make')!
    const guestsOnly = applied(base(), { make: { on: true, users: false, guests: true } })
    const cell = make.cells.guest
    if (cell.kind !== 'setting') throw new Error('a setting')
    expect(applied(guestsOnly, cell.write(false, guestsOnly)).make.on).toBe(false)
    const off = base()
    expect(applied(off, cell.write(true, off)).make.on).toBe(true)
  })
})

describe('starting points', () => {
  it('each sets what it says and is recognised again', () => {
    for (const { id } of STARTS) expect(startOf(applied(base(), startChanges(id)))).toBe(id)
    expect(startOf(applied(base(), { guests: { on: true, mode: 'view' }, make: { on: true, guests: false } }))).toBeNull()
  })
})

describe('a party', () => {
  it('turns on what it needs and ends with every setting as before', () => {
    const before = applied(base(), { make: { on: true, users: true, guests: false, approve: false }, guests: { reactions: false } })
    const { changes, live } = partyChanges({ ...PARTY_DEFAULT, name: 'Friday' }, before, false)
    const during = applied(before, changes)
    expect(during.guests).toMatchObject({ on: true, mode: 'change', reactions: true })
    expect(during.make).toMatchObject({ on: true, guests: true, approve: true, users: true })
    expect(live).toBe(true)
    const ended = endChanges(snapshot(before, false))
    const after = applied(during, ended.changes)
    expect(after).toEqual(before)
    expect(ended.live).toBe(false)
  })

  it('a party where guests only listen leaves making songs as it was', () => {
    const before = base()
    const { changes } = partyChanges({ ...PARTY_DEFAULT, add: false, make: false }, before, true)
    const during = applied(before, changes)
    expect(during.guests.mode).toBe('view')
    expect(during.make.guests).toBe(false)
    expect(during.make.on).toBe(false)
  })
})

it('names the stored groups by their roles', () => {
  expect(['listener', 'maker', 'admin'].map(roleOfGroup)).toEqual(['Listener', 'Maker', 'Co-host'])
})
