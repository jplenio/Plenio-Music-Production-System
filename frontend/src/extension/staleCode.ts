/**
 * Is this page's Plenio code older than the files ComfyUI serves now? (owner's report 2026-10-09: after an
 * update every export said *Failed to fetch dynamically imported module .../notationExport-....mjs*.)
 *
 * When Plenio is updated while a ComfyUI page is open, the page reconnects to the restarted server but keeps
 * its scripts - and a chunk the old code loads later (the notation's, the Song Sheet editor's) is gone, its
 * name has changed. The entry ``plenio.js`` is never cached (ComfyUI sends *no-store* for ``.js``) and
 * imports the main chunk by its hashed name; the running main chunk knows its own name (``import.meta.url``).
 * Pure functions; ``main.ts`` and ``sheetStateWidget.ts`` ask before they report a failed import.
 */

/** What a page that runs older code says: reload it. */
export const RELOAD_HINT = 'Plenio was updated while this page was open: reload the page (F5).'

/** The file name of the main chunk a module URL points at (``null``: not a built chunk - tests, a dev server). */
export function runningChunk(moduleUrl: string): string | null {
  const match = /\/chunks\/(main-[^/?#]+\.mjs)(?:[?#].*)?$/.exec(moduleUrl)
  return match ? match[1] : null
}

/** The main chunk the entry ``plenio.js`` imports now (``null``: none found). */
export function importedChunk(entry: string): string | null {
  return /chunks\/(main-[^"'?#\s]+\.mjs)/.exec(entry)?.[1] ?? null
}

/**
 * ``true`` when the files on the server are newer than the code running in this page: the entry next to
 * the running main chunk (``moduleUrl``) imports another one. ``load`` reads a URL as text (``null``: not
 * there); anything that cannot be read counts as not stale.
 */
export async function codeIsStale(moduleUrl: string, load: (url: string) => Promise<string | null>): Promise<boolean> {
  const running = runningChunk(moduleUrl)
  if (!running) return false
  try {
    const entry = await load(new URL('../plenio.js', moduleUrl).href)
    const current = entry ? importedChunk(entry) : null
    return current !== null && current !== running
  } catch {
    return false
  }
}

/** Reads a URL past every cache (``null``: not there). */
export async function loadFresh(url: string): Promise<string | null> {
  const response = await fetch(url, { cache: 'no-store' })
  return response.ok ? await response.text() : null
}

/** ``import`` of a lazily loaded chunk; when that fails because the page runs older code, the error says to reload. */
export async function importOrReload<T>(load: () => Promise<T>, stale: () => Promise<boolean>, then = ''): Promise<T> {
  try {
    return await load()
  } catch (error) {
    if (await stale()) throw new Error(then ? `${RELOAD_HINT} ${then}` : RELOAD_HINT)
    throw error
  }
}
