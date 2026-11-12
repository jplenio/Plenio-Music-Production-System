import { afterEach, describe, expect, it, vi } from 'vitest'

import { preloadOnIdle, resetPreload } from '../src/extension/editorPreload'

describe('the editor preload (P8)', () => {
  afterEach(() => resetPreload())

  it('loads the chunk once, when the browser is idle', async () => {
    const queued: (() => void)[] = []
    const idle = (run: () => void) => queued.push(run)
    const load = vi.fn(() => Promise.resolve())
    expect(preloadOnIdle(load, idle)).toBe(true)
    expect(preloadOnIdle(load, idle)).toBe(false)
    expect(load).not.toHaveBeenCalled()
    queued.forEach((run) => run())
    expect(load).toHaveBeenCalledTimes(1)
  })

  it('leaves a failed load to the real open', async () => {
    const load = vi.fn(() => Promise.reject(new Error('offline')))
    preloadOnIdle(load, (run) => (run(), 0))
    await Promise.resolve()
    expect(load).toHaveBeenCalledTimes(1)
  })
})
