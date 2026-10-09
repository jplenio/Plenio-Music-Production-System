/**
 * A page that runs older Plenio code than the server's files (owner's report 2026-10-09: after an update
 * every export said "Failed to fetch dynamically imported module .../notationExport-....mjs"): the entry
 * imports another main chunk than the running one, and a failed import then says to reload the page.
 */
import { describe, expect, it } from 'vitest'

import { RELOAD_HINT, codeIsStale, importOrReload, importedChunk, runningChunk } from '../src/extension/staleCode'

const BASE = 'http://127.0.0.1:8188/extensions/Plenio-Music-Production-System/js'
const ENTRY = (main: string) => `import "../../../scripts/api.js";\nimport { a5 as t } from "./chunks/${main}";\nexport { t as EXTENSION_NAME };\n`

describe('staleCode', () => {
  it('reads the running main chunk and the one the entry imports', () => {
    expect(runningChunk(`${BASE}/chunks/main-DFAqzDW8.mjs`)).toBe('main-DFAqzDW8.mjs')
    expect(runningChunk(`${BASE}/chunks/main-DFAqzDW8.mjs?v=2`)).toBe('main-DFAqzDW8.mjs')
    expect(runningChunk('file:///D:/repo/frontend/src/extension/main.ts')).toBeNull() // tests and dev servers
    expect(importedChunk(ENTRY('main-DFAqzDW8.mjs'))).toBe('main-DFAqzDW8.mjs')
    expect(importedChunk('export {}')).toBeNull()
  })

  it('is stale only when the entry imports another main chunk', async () => {
    const asked: string[] = []
    const serving = (main: string | null) => async (url: string) => {
      asked.push(url)
      return main === null ? null : ENTRY(main)
    }
    const running = `${BASE}/chunks/main-Bn0Z0Mwj.mjs`
    expect(await codeIsStale(running, serving('main-DFAqzDW8.mjs'))).toBe(true)
    expect(asked).toEqual([`${BASE}/plenio.js`])
    expect(await codeIsStale(running, serving('main-Bn0Z0Mwj.mjs'))).toBe(false)
    expect(await codeIsStale(running, serving(null))).toBe(false) // not there: no claim
    expect(await codeIsStale(running, () => Promise.reject(new Error('offline')))).toBe(false)
    expect(await codeIsStale('file:///src/extension/main.ts', serving('main-DFAqzDW8.mjs'))).toBe(false)
  })

  it('says to reload when a chunk of an older page cannot be loaded', async () => {
    const gone = () => Promise.reject(new TypeError('Failed to fetch dynamically imported module: .../notationExport-D-CL96aB.mjs'))
    await expect(importOrReload(gone, async () => true, 'The sheet music is drawn and saved then.')).rejects.toThrow(
      `${RELOAD_HINT} The sheet music is drawn and saved then.`
    )
    // the same page and files: the error is the import's own
    await expect(importOrReload(gone, async () => false)).rejects.toThrow('Failed to fetch dynamically imported module')
    await expect(importOrReload(() => Promise.resolve(42), async () => true)).resolves.toBe(42)
  })
})
