/** The store's timers stop when the page is gone: in the CI a test file's page was torn down while the store's
 * background tick still ran, and it failed the run with "document is not defined" (2026-10-19). */
import { afterEach, describe, expect, it, vi } from 'vitest'

describe('the store\'s timers', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('stop when the page is gone instead of throwing', async () => {
    vi.useFakeTimers()
    vi.resetModules()
    await import('../src/player/store')
    // a torn-down test environment has neither of them ("window is not defined", seen 2026-11-04)
    const page = Object.getOwnPropertyDescriptor(globalThis, 'document')
    const frame = Object.getOwnPropertyDescriptor(globalThis, 'window')
    Object.defineProperty(globalThis, 'document', { value: undefined, configurable: true })
    Object.defineProperty(globalThis, 'window', { value: undefined, configurable: true })
    try {
      expect(() => vi.advanceTimersByTime(5000)).not.toThrow()
    } finally {
      if (page) Object.defineProperty(globalThis, 'document', page)
      if (frame) Object.defineProperty(globalThis, 'window', frame)
    }
  })
})
