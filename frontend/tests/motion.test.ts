/** Motion in the page (phase 7.10): the three moves carry their element's name only for the change; without View
 * Transitions the change just happens; one easing and one duration in the styles; less motion when asked. */
import { describe, expect, it } from 'vitest'

import { moveWith } from '../src/player/layout'
import nowPlaying from '../src/player/components/NowPlaying.vue?raw'
import playlist from '../src/player/components/PlaylistView.vue?raw'

describe('the moves', () => {
  it('with View Transitions the source carries the name until the change, then the page takes over', async () => {
    const seen: string[] = []
    const el = document.createElement('div')
    ;(document as unknown as { startViewTransition: unknown }).startViewTransition = (update: () => Promise<void>) => {
      seen.push(`before:${el.style.viewTransitionName}`)
      const finished = update().then(() => seen.push(`after:${el.style.viewTransitionName}`))
      return { finished }
    }
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true })
    let changed = false
    moveWith(el, 'np-cover', () => {
      changed = true
    })
    await new Promise((r) => setTimeout(r, 0))
    expect(changed).toBe(true)
    expect(seen).toEqual(['before:np-cover', 'after:'])
    delete (document as unknown as { startViewTransition?: unknown }).startViewTransition
  })

  it('without them the change happens at once and the source keeps no name', () => {
    const el = document.createElement('div')
    let changed = false
    moveWith(el, 'playlist-mosaic', () => {
      changed = true
    })
    expect(changed).toBe(true)
    expect(el.style.viewTransitionName).toBe('')
  })

  it('the receiving ends carry the names (the styles: motionStyles.test.ts)', () => {
    expect(nowPlaying).toContain('view-transition-name: np-cover')
    expect(playlist).toContain('view-transition-name: playlist-mosaic')
  })
})
