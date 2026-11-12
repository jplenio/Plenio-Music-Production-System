/** A one-line explanation under a page's heading, the first three times the page is opened in this browser
 * (phase 6.4, PD §9.2). Kept in the browser only: a convenience, never needed. */

export const INTRO_TIMES = 3

export const INTROS: Record<string, string> = {
  live: 'The party’s playlist: songs play one after the other, and new ones from ComfyUI join by themselves.',
  jobs: 'Videos and shared players being made, waiting and made - the work goes on while you listen.',
  people: 'Who comes in and what each may do - your devices, a party’s guests, people with accounts.',
}

/** Whether the explanation of ``page`` shows this time (and count this time). */
export function introShown(page: string, storage: Pick<Storage, 'getItem' | 'setItem'> | null = safeStorage()): boolean {
  if (!INTROS[page]) return false
  const key = `plenio-intro-${page}`
  let seen = 0
  try {
    seen = Number(storage?.getItem(key) ?? 0) || 0
    storage?.setItem(key, String(seen + 1))
  } catch {
    return seen < INTRO_TIMES
  }
  return seen < INTRO_TIMES
}

function safeStorage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}
