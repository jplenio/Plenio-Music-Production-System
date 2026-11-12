/** Motion in the page (phase 7.10): one easing and one duration in the styles; less motion when asked.
 *
 * @vitest-environment node
 */
import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'

it('one easing, one duration, the three moves styled, less motion asked rests', () => {
  const styles = readFileSync(new URL('../src/player/styles.css', import.meta.url), 'utf-8')
  expect(styles).toMatch(/--ease: cubic-bezier\(0\.2, 0\.8, 0\.2, 1\)/)
  expect(styles).toMatch(/--dur: 220ms/)
  for (const name of ['song-cover', 'np-cover', 'playlist-mosaic']) expect(styles).toContain(`::view-transition-group(${name})`)
  expect(styles).toMatch(/prefers-reduced-motion: reduce/)
})
