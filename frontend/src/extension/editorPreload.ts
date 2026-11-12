/**
 * The Song Sheet editor's chunk (about 1.7 MB) loads when a sheet opens; once a workflow with a sheet is on the canvas,
 * it is fetched while the browser is idle, so the first *Edit* opens at once (phase 8.6, PD §6.2 P8). Once per page; a
 * failure is left to the real open, which says what went wrong.
 */
type Idle = (run: () => void, options?: { timeout: number }) => number

let started = false

export function preloadOnIdle(load: () => Promise<unknown>, idle?: Idle): boolean {
  if (started) return false
  started = true
  const schedule: Idle =
    idle ??
    ((globalThis as { requestIdleCallback?: Idle }).requestIdleCallback?.bind(globalThis) as Idle | undefined) ??
    ((run) => setTimeout(run, 2000) as unknown as number)
  schedule(() => void load().catch(() => {}), { timeout: 10000 })
  return true
}

/** For tests: forget that the preload ran. */
export function resetPreload(): void {
  started = false
}
