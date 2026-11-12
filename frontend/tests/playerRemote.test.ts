/** The Player API's page side (remote.ts): each command does what it names; the report carries what the API shows. */
import { describe, expect, it } from 'vitest'

import type { RemoteCommand } from '../src/player/api'
import { type Actions, PAGE_ID, carryOutCommand, shownToRemote } from '../src/player/remote'
import { index, queue } from '../src/player/store'

function recorder(): { done: unknown[][]; actions: Actions } {
  const done: unknown[][] = []
  const note = (name: string) => (...args: unknown[]) => done.push([name, ...args])
  return {
    done,
    actions: {
      play: note('play'), pause: note('pause'), toggle: note('toggle'), next: note('next'), previous: note('previous'),
      seek: note('seek'), queue: note('queue'), live: note('live'),
    }, // prettier-ignore
  }
}

describe('the Player API on the page', () => {
  it('carries out every command', () => {
    const { done, actions } = recorder()
    const commands: RemoteCommand[] = [
      { n: 1, do: 'play' },
      { n: 2, do: 'pause' },
      { n: 3, do: 'toggle' },
      { n: 4, do: 'next' },
      { n: 5, do: 'previous' },
      { n: 6, do: 'seek', seconds: 42 },
      { n: 7, do: 'queue', id: 'abc', where: 'next' },
      { n: 8, do: 'live', on: true, atEnd: 'wait' },
    ]
    for (const command of commands) carryOutCommand(command, actions)
    expect(done).toEqual([
      ['play'], ['pause'], ['toggle'], ['next'], ['previous'], ['seek', 42], ['queue', 'abc', 'next'],
      ['live', { on: true, atEnd: 'wait' }],
    ]) // prettier-ignore
  })

  it('reports the next three and its own id', () => {
    queue.value = ['a', 'b', 'c', 'd', 'e', 'f']
    index.value = 1
    const shown = shownToRemote()
    expect(shown.page).toBe(PAGE_ID)
    expect(shown.next).toEqual(['c', 'd', 'e'])
    expect(shown.queue_length).toBe(6)
    expect(Object.keys(shown.live as object).sort()).toEqual(['atEnd', 'auto', 'insert', 'on'])
  })
})
