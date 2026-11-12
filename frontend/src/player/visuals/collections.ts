/**
 * Choosing visuals by what they show (phase 7.8, PD §9.3): every visual has one or two themes, the collections
 * gather them; *Show* picks the Director, a collection, one visual or none; *Energy* sets sensitivity, how often the
 * picture changes and the crossfade together. *Fine-tune* keeps every setting of before for whoever wants them.
 */
import type { FadeStyle } from './mixer'
import type { SwitchOn } from './chooser'

export type Theme = 'space' | 'nature' | 'club' | 'retro' | 'flow' | 'geometry' | 'song'

/**
 * The twelve signature visuals (phase 7.9, PD §9.6): shown first, in the films and to a new player; each tuned by hand
 * for the Director's cue (anticipation, impact, tension). Chosen across the collections and the three engines, all
 * offered on an integrated graphics chip (the two Nova scenes too heavy there are not among them).
 */
export const SIGNATURES = [
  'nova-hyperspace', 'nova-aurora', 'nova-silk', 'nova-city', 'nova-lasers', 'nova-ocean', 'nova-mandala',
  'drop-nebula-swirl', 'drop-kaleido-bloom', 'drop-cover-galaxy', 'retro', 'vumeter',
] // prettier-ignore

export const COLLECTIONS: { id: Theme | 'signature'; name: string }[] = [
  { id: 'signature', name: 'Signature twelve' },
  { id: 'space', name: 'Space' },
  { id: 'nature', name: 'Nature' },
  { id: 'club', name: 'Club' },
  { id: 'retro', name: 'Retro & hi-fi' },
  { id: 'flow', name: 'Flow' },
  { id: 'geometry', name: 'Geometry' },
  { id: 'song', name: 'This song' },
]

/** The themes of every built-in visual (a test holds the list to the visuals there are). */
export const THEMES: Record<string, Theme[]> = {
  bars: ['retro'], scope: ['retro'], vector: ['retro', 'geometry'], radial: ['flow'], tunnel: ['space', 'geometry'],
  stars: ['space'], plasma: ['flow'], fire: ['nature', 'club'], kaleido: ['geometry'], fountain: ['club'],
  mountains: ['nature', 'retro'], ripples: ['nature', 'flow'], retro: ['retro', 'club'], matrix: ['retro', 'club'],
  ledwall: ['retro', 'club'], vumeter: ['retro'], waterfall: ['retro'], spirograph: ['geometry'], lava: ['flow'],
  wavetunnel: ['space', 'club'], fireworks: ['club'], honeycomb: ['geometry'], vinyl: ['retro'],
  harmonograph: ['geometry'], galaxy: ['space'],
  'drop-nebula-swirl': ['space', 'flow'], 'drop-liquid-mirror': ['flow'], 'drop-star-gate': ['space'],
  'drop-kaleido-bloom': ['geometry'], 'drop-pulse-rings': ['club', 'geometry'], 'drop-aurora-curtain': ['nature'],
  'drop-plasma-storm': ['flow', 'club'], 'drop-vortex-engine': ['space', 'flow'], 'drop-electric-lotus': ['geometry', 'nature'],
  'drop-deep-dive': ['space'], 'drop-mirror-hall': ['geometry'], 'drop-solar-wind': ['space', 'nature'],
  'drop-neon-grid': ['retro', 'club'], 'drop-ink-in-water': ['nature', 'flow'], 'drop-shockwave': ['club'],
  'drop-firefly-orbit': ['nature'], 'drop-cover-galaxy': ['song', 'space'], 'drop-title-smoke': ['song'],
  'drop-lyric-tunnel': ['song'], 'drop-album-kaleido': ['song', 'geometry'], 'drop-cover-echo': ['song'],
  'drop-cosmic-dust': ['space'], 'drop-twin-spiral': ['geometry', 'flow'], 'drop-living-coral': ['nature'],
  'drop-bipolar-swirl': ['flow'], 'drop-fractal-garden': ['geometry', 'nature'], 'drop-altar-of-madness': ['club'],
  'drop-pyramid-dream': ['geometry'], 'drop-polar-night': ['nature'], 'drop-mind-blob': ['flow'],
  'drop-infinite-mosaic': ['geometry'], 'drop-predator-prey': ['nature', 'flow'], 'drop-frost-caves': ['nature'],
  'drop-liquid-diamonds': ['flow', 'geometry'], 'drop-unified-drag': ['flow'], 'drop-ember-rise': ['nature'],
  'drop-frozen-time': ['flow'], 'drop-digital-flame': ['club'], 'drop-glowsticks': ['club'], 'drop-peacock-orb': ['nature'],
  'drop-tokamak': ['space', 'club'], 'drop-inkblot': ['flow'], 'drop-jelly-lanterns': ['nature'],
  'drop-warp-of-doom': ['space', 'club'], 'drop-sea-star': ['nature'], 'drop-velvet-smoke': ['flow'],
  'drop-hypno-disc': ['geometry', 'club'], 'drop-strobe-lattice': ['club'], 'drop-mandala-breath': ['geometry'],
  'drop-harmonic-rose': ['geometry'], 'drop-cover-droste': ['song'], 'drop-random': ['flow'],
  'nova-hyperspace': ['space'], 'nova-nebula': ['space'], 'nova-black-hole': ['space'], 'nova-galaxy': ['space'],
  'nova-aurora': ['nature'], 'nova-ocean': ['nature'], 'nova-rings': ['club'], 'nova-bulb': ['geometry'],
  'nova-gyroid': ['geometry'], 'nova-city': ['club'], 'nova-outrun': ['retro'], 'nova-pulsar': ['retro', 'space'],
  'nova-terrain': ['nature', 'retro'], 'nova-chrome': ['flow'], 'nova-sphere': ['geometry', 'club'],
  'nova-ink': ['nature', 'flow'], 'nova-turing': ['nature'], 'nova-tesla': ['club'], 'nova-glass': ['geometry'],
  'nova-lasers': ['club'], 'nova-mandala': ['flow', 'geometry'], 'nova-silk': ['flow'],
} // prettier-ignore

/** A visual's themes: its own, or for one of the listener's presets *flow* (what a hand-made MilkDrop preset mostly
 * is). */
export function themesOf(id: string): Theme[] {
  return THEMES[id] ?? (id.startsWith('my-') ? ['flow'] : [])
}

/** The visuals of a collection, among ``ids`` (``favourites``: the listener's ♥). */
export function inCollection(collection: string, ids: string[], favourites: string[] = []): string[] {
  if (collection === 'favourites') return ids.filter((id) => favourites.includes(id))
  if (collection === 'signature') return ids.filter((id) => SIGNATURES.includes(id))
  return ids.filter((id) => themesOf(id).includes(collection as Theme))
}

// --- Energy -------------------------------------------------------------------------------------------------------------

export interface EnergyLevel {
  /** The slider's value where this level begins. */
  from: number
  name: string
  sensitivity: number
  switchOn: SwitchOn
  fade: FadeStyle
  fadeSeconds: number
}

/** *Energy*, calm to intense: the three settings it moves together. */
export const ENERGY: EnergyLevel[] = [
  { from: 0, name: 'calm', sensitivity: 0.75, switchOn: 'song', fade: 'melt', fadeSeconds: 4 },
  { from: 0.34, name: 'lively', sensitivity: 1, switchOn: 'section', fade: 'blend', fadeSeconds: 2 },
  { from: 0.67, name: 'intense', sensitivity: 1.35, switchOn: 'drop', fade: 'flash', fadeSeconds: 0.6 },
]

export function energyLevel(value: number): EnergyLevel {
  const v = Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0.5
  return [...ENERGY].reverse().find((level) => v >= level.from) ?? ENERGY[0]
}

/** The settings *Energy* sets. */
export function energySettings(value: number): Pick<EnergyLevel, 'sensitivity' | 'switchOn' | 'fade' | 'fadeSeconds'> {
  const { sensitivity, switchOn, fade, fadeSeconds } = energyLevel(value)
  return { sensitivity, switchOn, fade, fadeSeconds }
}

/** Where the slider stands for settings (the level whose settings they are; otherwise by the sensitivity). */
export function energyOf(settings: { sensitivity: number; switchOn: SwitchOn; fade: FadeStyle }): number {
  const exact = ENERGY.find((l) => l.switchOn === settings.switchOn && l.fade === settings.fade && Math.abs(l.sensitivity - settings.sensitivity) < 0.01)
  if (exact) return exact === ENERGY[0] ? 0 : exact === ENERGY[1] ? 0.5 : 1
  return Math.max(0, Math.min(1, (settings.sensitivity - 0.75) / 0.6))
}

// --- Show -------------------------------------------------------------------------------------------------------------

export type Show = 'director' | 'one' | 'off' | 'all' | Theme | 'favourites' | 'signature'

/** What *Show* says for the visuals' settings of now. */
export function showOf(v: { enabled: boolean; mode: string; collection?: string }): Show {
  if (!v.enabled) return 'off'
  if (v.mode === 'director') return 'director'
  if (v.mode === 'fixed') return 'one'
  return (v.collection || 'all') as Show
}

/** The settings *Show* sets (the rest - the ticked pool, the look - stay as they are). */
export function showSettings(show: Show): { enabled: boolean; mode?: 'director' | 'fixed' | 'auto'; collection?: string } {
  if (show === 'off') return { enabled: false }
  if (show === 'director') return { enabled: true, mode: 'director', collection: '' }
  if (show === 'one') return { enabled: true, mode: 'fixed' }
  return { enabled: true, mode: 'auto', collection: show === 'all' ? '' : show }
}
