/**
 * The size of the screen the player is on, as the page lays itself out (owner's request 2026-10-26: as good on a phone
 * and a tablet as on a large screen). ``phone``: a tab bar at the bottom and a slim player above it; ``tablet``: the
 * slim player, the menu as a drawer; ``desktop``: the sidebar and the full bar. Kept in step with the window.
 */
import { computed, ref } from 'vue'

export type Layout = 'phone' | 'tablet' | 'desktop'

/** Widths where the layout changes (CSS px): below ``PHONE_MAX`` a phone, below ``TABLET_MAX`` a tablet. */
export const PHONE_MAX = 700
export const TABLET_MAX = 1100

export function layoutOf(width: number): Layout {
  return width < PHONE_MAX ? 'phone' : width < TABLET_MAX ? 'tablet' : 'desktop'
}

const width = ref(typeof window === 'undefined' ? 1400 : window.innerWidth)
const coarse = ref(typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: coarse)').matches)
const reduced = ref(typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)

if (typeof window !== 'undefined') {
  let frame = 0
  window.addEventListener('resize', () => {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(() => (width.value = window.innerWidth))
  })
  window.matchMedia?.('(pointer: coarse)').addEventListener?.('change', (event) => (coarse.value = event.matches))
  window.matchMedia?.('(prefers-reduced-motion: reduce)').addEventListener?.('change', (event) => (reduced.value = event.matches))
}

export const layout = computed<Layout>(() => layoutOf(width.value))
export const isPhone = computed(() => layout.value === 'phone')
/** The slim player at the bottom instead of the full bar (phones and tablets). */
export const slimBar = computed(() => layout.value !== 'desktop')
/** A touch screen: no hover - what shows on hover shows always. */
export const touch = coarse
/** The listener asked the system for less motion: transitions shorten, nothing floats. */
export const reducedMotion = reduced

/** Run ``change`` as a view transition where the browser has them (the cover glides from the card to the page);
 * otherwise, or with less motion wished, at once. While it runs the page itself does not slide in as well (``vt``). */
export function withTransition(change: () => void | Promise<void>): void {
  type Start = (update: () => void | Promise<void>) => { finished?: Promise<unknown> }
  const start = (document as Document & { startViewTransition?: Start }).startViewTransition
  if (!start || reduced.value || document.visibilityState !== 'visible') {
    void change()
    return
  }
  const root = document.documentElement
  root.classList.add('vt')
  const done = (): void => root.classList.remove('vt')
  const transition = start.call(document, change)
  if (transition?.finished) transition.finished.then(done, done)
  else done()
}

/**
 * One of the three moves a user makes most (phase 7.10, PD §9.6) - a card or the slim player to Now playing, a
 * playlist to its page: ``from`` carries ``name`` for the moment of the change, the page's element that receives it
 * has the same name in its style, and the browser moves one into the other. Without View Transitions, or with less
 * motion asked for, the change just happens.
 */
export function moveWith(from: Element | null | undefined, name: string, change: () => void | Promise<void>): void {
  const el = from instanceof HTMLElement ? from : null
  if (el) el.style.viewTransitionName = name
  withTransition(async () => {
    if (el) el.style.viewTransitionName = ''
    await change()
  })
  // without a transition the change ran at once: the source keeps no name
  if (el && !document.documentElement.classList.contains('vt')) el.style.viewTransitionName = ''
}
