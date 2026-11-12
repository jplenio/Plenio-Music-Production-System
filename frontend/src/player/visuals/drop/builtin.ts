/**
 * Plenio Drop's own presets - written in the same format as anyone's (format.ts, and the guide in
 * docs/user/concepts/player-visuals.md), so each is also an example to start from (*Edit a copy* puts one
 * into the visuals folder). And *Drop · Random*, a new preset every time it is chosen.
 *
 * The music: bass, mid, treb (about 1 at the song's usual level, 2 when loud), their smoothed bass_att,
 * mid_att, treb_att, vol (0..1), beat (1 on a beat), pulse (1 at a beat, falling to 0), time, frame.
 */
import type { PresetFile } from './format'

export const BUILTIN: PresetFile[] = [
  {
    name: 'Nebula Swirl',
    blurb: 'A slow swirl of colour around a ring the music swells.',
    suits: ['calm', 'electronic', 'any'],
    base: { decay: 0.975, family: 'swirl', famB: 0.9, warp: 0.6, hueShift: 0.006, gamma: 1.7 },
    // a signature (phase 7.9): it draws in before an onset, the ring jumps on it, the swirl tightens before a louder part
    frame: {
      zoom: '1.004 + 0.012 * bass + 0.02 * anticipation',
      rot: '0.004 * sin(time * 0.3) + 0.01 * tension',
      famA: '0.12 + 0.1 * bass_att + 0.08 * tension',
    },
    waves: [{ mode: 'circle', scale: '0.55 + 0.25 * bass_att + 0.2 * impact', thick: 0.007, alpha: 0.9, hue: 'time * 0.05' }],
  },
  {
    name: 'Liquid Mirror',
    blurb: 'A line of sound melting upward, mirrored left and right.',
    suits: ['calm', 'acoustic'],
    base: { decay: 0.962, family: 'waves', famB: 6, mirror: 'left-right', dy: 0.002, gamma: 1.6 },
    frame: {
      famA: '0.006 * (1 + mid_att)',
      zoom: '0.996 + 0.01 * bass_att',
    },
    waves: [{ mode: 'line', y: -0.2, scale: '0.7 + 0.3 * mid', thick: 0.008, alpha: 0.85, hue: 'time * 0.03' }],
  },
  {
    name: 'Star Gate',
    blurb: 'A tunnel rushing at you with the bass, the stereo picture at its heart.',
    suits: ['energetic', 'electronic'],
    base: { decay: 0.958, family: 'tunnel', famB: 12, hueShift: 0.01, vignette: 0.5, gamma: 1.8 },
    frame: {
      zoom: '1.02 + 0.025 * bass',
      famA: '0.03 * bass_att',
      rot: '0.01 * sin(time * 0.17)',
    },
    waves: [{ mode: 'scope', scale: '0.9 + 0.4 * bass_att', thick: 0.007, alpha: 0.9, hue: 'time * 0.07' }],
  },
  {
    name: 'Kaleido Bloom',
    blurb: 'Six mirrored slices, three shapes circling, the spectrum as a ring of dots.',
    suits: ['electronic', 'energetic'],
    base: { decay: 0.955, family: 'kaleidoscope', famB: 6, famA: 0.5, gamma: 1.6 },
    // a signature (phase 7.9): the slices turn faster as a louder part comes, the shapes swell on the hit
    frame: {
      zoom: '1.01 + 0.02 * bass + 0.015 * anticipation',
      rot: '0.01 * sin(time * 0.2) + 0.02 * tension',
    },
    waves: [{ mode: 'dots', scale: '0.9 + 0.2 * mid_att + 0.15 * impact', thick: 0.012, alpha: 0.8, hue: 'time * 0.04' }],
    shapes: [{ repeat: 3, sides: 5, radius: '0.06 + 0.06 * pulse + 0.05 * impact', x: '0.45 * cos(time * 0.7 + i * 2.094)', y: '0.45 * sin(time * 0.7 + i * 2.094)', angle: 'time', hue: 'i / n + time * 0.05', alpha: 0.15, inner: 0.6 }],
  },
  {
    name: 'Pulse Rings',
    blurb: 'Every beat drops a ring; the ripples carry the colour out.',
    suits: ['electronic', 'any'],
    base: { decay: 0.968, family: 'ripple', famB: 30, gamma: 1.7 },
    frame: {
      famA: '0.012 + 0.02 * pulse',
      zoom: '1.025 + 0.025 * bass_att',
    },
    waves: [
      { mode: 'circle', scale: '0.3 + 0.35 * pulse', thick: '0.005 + 0.012 * pulse', alpha: 0.9, hue: 'time * 0.06' },
      { mode: 'dots', scale: '0.5 + 0.3 * mid_att', thick: 0.008, alpha: 0.5, hue: 'time * 0.06 + 0.4' },
    ],
    shapes: [{ sides: 48, radius: '0.04 + 0.12 * pulse', alpha: 0, inner: '0.6 * pulse', hue: 'time * 0.06 + 0.5' }],
  },
  {
    name: 'Aurora Curtain',
    blurb: 'Green and violet light rising from a wave along the ground.',
    suits: ['calm', 'acoustic'],
    base: { decay: 0.975, dy: 0.006, warp: 1.2, warpScale: 0.6, sx: 1.002, hueShift: 0.004, gamma: 1.8 },
    frame: { warp: '1 + 0.6 * mid_att' },
    waves: [{ mode: 'line', y: -0.62, scale: '0.5 + 0.3 * bass_att', thick: 0.009, alpha: 0.85, hue: '0.35 + 0.15 * sin(time * 0.1)' }],
  },
  {
    name: 'Plasma Storm',
    blurb: 'The warp field wild, sparks of sound thrown into it.',
    suits: ['energetic', 'electronic'],
    base: { decay: 0.985, warp: 2.5, warpSpeed: 1.5, zoom: 1.002, hueShift: 0.015, gamma: 1.5 },
    frame: { warp: '2 + 1.5 * treb_att' },
    waves: [{ mode: 'dots', scale: '1.2 + 0.4 * bass', thick: 0.01, alpha: 0.7, hue: 'time * 0.1' }],
  },
  {
    name: 'Vortex Engine',
    blurb: 'An outward spiral that turns faster when the mids push.',
    suits: ['energetic', 'dark'],
    base: { decay: 0.97, wrap: 1, gamma: 1.6 },
    frame: {
      rot: '0.025 + 0.03 * mid_att',
      zoom: '1.012 + 0.02 * bass',
    },
    waves: [
      { mode: 'circle', scale: '0.4 + 0.2 * bass_att', thick: 0.007, alpha: 0.85, hue: 'time * 0.05' },
      { mode: 'spiral', scale: 0.9, thick: 0.004, alpha: 0.5, hue: 'time * 0.05 + 0.5' },
    ],
  },
  {
    name: 'Electric Lotus',
    blurb: 'Eight petals of mirrored spectrum around a glowing core.',
    suits: ['electronic'],
    base: { decay: 0.95, family: 'kaleidoscope', famB: 8, gamma: 1.7 },
    frame: { zoom: '1.006 + 0.015 * bass_att', famA: 'sin(time * 0.3)' },
    waves: [
      { mode: 'spectrum', y: 0, scale: '0.6 + 0.2 * mid_att', thick: 0.006, alpha: 0.8, hue: 'time * 0.03' },
      { mode: 'circle', scale: 0.25, thick: 0.004, alpha: 0.7, hue: 'time * 0.03 + 0.5' },
    ],
    shapes: [{ sides: 40, radius: '0.08 + 0.05 * bass_att', alpha: 0, inner: '0.35 + 0.3 * pulse', hue: 'time * 0.03 + 0.2' }],
  },
  {
    name: 'Deep Dive',
    blurb: 'Plunging forward, the image echoing back on itself.',
    suits: ['energetic', 'dark'],
    base: { decay: 0.955, zoomExp: 1.6, echoAlpha: 0.4, echoZoom: 1.4, echoOrient: 1, gamma: 1.8 },
    frame: { zoom: '1.03 + 0.03 * bass' },
    waves: [
      { mode: 'scope', scale: '1 + 0.3 * bass_att', thick: 0.008, alpha: 0.9, hue: 'time * 0.08' },
      { mode: 'circle', scale: '0.25 + 0.2 * pulse', thick: 0.005, alpha: 0.6, hue: 'time * 0.08 + 0.5' },
    ],
  },
  {
    name: 'Mirror Hall',
    blurb: 'Four mirrors and a slow turn - the sound folded into itself.',
    suits: ['dark', 'calm'],
    base: { decay: 0.96, mirror: 'both', family: 'waves', famA: 0.004, famB: 9, rot: 0.006, gamma: 1.6 },
    frame: { zoom: '1.002 + 0.008 * bass_att' },
    waves: [{ mode: 'line', y: '0.3 * sin(time * 0.4)', scale: 0.8, thick: 0.007, alpha: 0.8, hue: 'time * 0.04' }],
  },
  {
    name: 'Solar Wind',
    blurb: 'Both channels as streams of light, drifting and flaring with the highs.',
    suits: ['acoustic', 'energetic'],
    base: { decay: 0.968, warp: 1, gamma: 1.6 },
    frame: {
      dx: '0.004 * sin(time * 0.2)',
      dy: 0.002,
      solarize: '0.25 * clamp(treb_att - 1, 0, 1)',
    },
    waves: [{ mode: 'stereo', scale: '0.7 + 0.3 * mid_att', thick: 0.006, alpha: 0.85, hue: 'time * 0.05' }],
  },
  {
    name: 'Neon Grid',
    blurb: 'Motion made visible: a field of strokes along the flow, a line of sound across it.',
    suits: ['electronic'],
    base: { decay: 0.9, mvec: 24, mvAlpha: 0.45, gamma: 2 },
    frame: {
      zoom: '1.01 + 0.015 * bass',
      rot: '0.003 * sin(time)',
    },
    waves: [{ mode: 'line', scale: '0.6 + 0.3 * bass_att', thick: 0.006, alpha: 0.9, hue: 'time * 0.06' }],
  },
  {
    name: 'Ink in Water',
    blurb: 'Colour spreading slowly, as ink in still water.',
    suits: ['calm', 'dark', 'acoustic'],
    base: { decay: 0.993, family: 'swirl', famA: 0.05, famB: 1.2, warp: 0.8, warpSpeed: 0.5, zoom: 1.002, gamma: 1.4 },
    waves: [{ mode: 'circle', scale: '0.2 + 0.1 * bass_att', thick: 0.003, alpha: 0.35, hue: 'time * 0.02' }],
  },
  {
    name: 'Shockwave',
    blurb: 'Every kick hits the picture: a jolt of zoom, a ring, a flash.',
    suits: ['energetic'],
    base: { decay: 0.964, family: 'ripple', famB: 24, gamma: 1.7 },
    init: { kick: 0 },
    frame: {
      kick: 'beat ? 1 : kick * 0.9',
      zoom: '1.015 + 0.08 * kick',
      famA: '0.03 * kick',
      invert: 'kick > 0.95 && bass > 1.6 ? 0.25 : 0',
    },
    waves: [
      { mode: 'circle', scale: '0.45 + 0.6 * kick', thick: '0.005 + 0.014 * kick', alpha: 0.9, hue: 'time * 0.07' },
      { mode: 'dots', scale: '0.7 + 0.4 * bass_att', thick: 0.009, alpha: 0.55, hue: 'time * 0.07 + 0.5' },
    ],
  },
  {
    name: 'Firefly Orbit',
    blurb: 'Five lights circling, their trails woven into the dark.',
    suits: ['calm', 'acoustic'],
    base: { decay: 0.986, zoom: 1.004, warp: 0.8, gamma: 1.7 },
    shapes: [
      {
        repeat: 5,
        sides: 24,
        radius: '0.025 + 0.03 * pulse',
        x: '0.55 * sin(time * 0.5 + i * 1.2566) * (0.6 + 0.4 * sin(time * 0.13 + i))',
        y: '0.55 * cos(time * 0.37 + i * 1.2566)',
        hue: 'i / n',
        alpha: 0.3,
        inner: 1,
      },
    ],
    waves: [{ mode: 'circle', scale: '0.15 + 0.1 * bass_att', thick: 0.003, alpha: 0.4, hue: 'time * 0.05' }],
  },
  // the song itself in the picture (owner's request 2026-10-18): its cover, its title, the line and word sung
  {
    name: 'Cover Galaxy',
    blurb: 'The song’s cover at the heart of a slow galaxy - its colours pulled out into spiral arms that fill the sky.',
    suits: ['calm', 'electronic', 'any'],
    // a long memory (decay) and a steady pull outward (zoom), so the swirl carries the cover's colours to the edges
    base: { decay: 0.988, family: 'swirl', famB: 2, hueShift: 0.001, warp: 0.2, gamma: 1.4 },
    // a signature (phase 7.9): the galaxy pulls harder before a louder part, the cover breathes on the hit
    frame: { zoom: '1.01 + 0.01 * bass_att + 0.012 * tension', famA: '0.07 + 0.04 * bass_att', rot: '0.003 + 0.004 * anticipation' },
    sprites: [{ source: 'cover', size: '0.19 + 0.03 * pulse + 0.04 * impact', angle: 'time * 0.25', alpha: 0.55, blend: 'over' }],
    // three lights circling the cover: their trails are the arms
    shapes: [{ repeat: 3, sides: 16, radius: '0.018 + 0.02 * pulse', x: '0.3 * cos(time * 0.9 + i * 2.094) / aspect', y: '0.3 * sin(time * 0.9 + i * 2.094)', hue: 'i / n + time * 0.02', alpha: 0.35, inner: 1 }],
    waves: [{ mode: 'dots', scale: '0.5 + 0.15 * mid_att', thick: 0.005, alpha: 0.3, hue: 'time * 0.03' }],
  },
  {
    name: 'Title Smoke',
    blurb: 'The song’s title at its start, then every line sung, rising as smoke.',
    suits: ['calm', 'acoustic', 'any'],
    base: { decay: 0.982, dy: 0.0025, warp: 0.9, warpScale: 0.7, zoom: 1.002, gamma: 1.6 },
    // laid over (not added), so the words melt into the smoke without burning white
    sprites: [
      { source: 'title', y: '-0.1 + 0.02 * sin(time)', size: 0.12, alpha: 'clamp(1 - songtime / 9, 0, 1) * 0.3', blend: 'over', tint: 0.35, hue: 'time * 0.02' },
      { source: 'line', y: -0.45, size: 0.075, alpha: 'line_on * clamp(line_age * 2, 0, 1) * clamp(songtime / 6 - 0.5, 0, 1) * 0.25', blend: 'over', tint: 0.5, hue: 'time * 0.03 + 0.3' },
    ],
    waves: [{ mode: 'line', y: -0.85, scale: '0.3 + 0.2 * bass_att', thick: 0.004, alpha: 0.5, hue: 'time * 0.04' }],
  },
  {
    name: 'Lyric Tunnel',
    blurb: 'The words sung fly at you on the beat, through a tunnel of light.',
    suits: ['energetic', 'electronic'],
    base: { decay: 0.965, family: 'tunnel', famB: 10, hueShift: 0.006, gamma: 1.5, vignette: 0.2 },
    init: { kick: 0, t0: 0 },
    frame: {
      // a beat - or, in a quiet stretch, a moment - throws the word sung now
      kick: 'beat || time - t0 > 0.6 ? 1 : kick * 0.75',
      t0: 'kick > 0.99 ? time : t0',
      zoom: '1.035 + 0.02 * bass',
      famA: '0.02 * bass_att',
      rot: '0.006 * sin(time * 0.3)',
    },
    // drawn in bursts, not every frame: each copy flies off on its own instead of piling up into a blur
    sprites: [
      { source: 'word', size: 0.11, alpha: 'line_on * clamp(kick * 2 - 1, 0, 1) * 0.9', blend: 'over', tint: 0.25, hue: 'time * 0.05' },
      { source: 'title', size: 0.1, alpha: 'clamp(1 - songtime / 7, 0, 1) * clamp(kick * 2 - 1, 0, 1) * 0.9', blend: 'over', tint: 0.25 },
    ],
    waves: [
      { mode: 'circle', scale: '0.6 + 0.12 * bass_att', thick: 0.004, alpha: 0.4, hue: 'time * 0.05 + 0.5' },
      { mode: 'circle', scale: '0.45 + 0.15 * kick', thick: '0.003 + 0.008 * kick', alpha: '0.7 * kick', hue: 'time * 0.05 + 0.25' },
      { mode: 'dots', scale: '0.75 + 0.2 * mid_att', thick: 0.006, alpha: 0.5, hue: 'time * 0.05' },
    ],
  },
  {
    name: 'Album Kaleido',
    blurb: 'The cover folded into a turning mandala of ten mirrors, from the middle out to the edges.',
    suits: ['electronic', 'energetic', 'calm'],
    base: { decay: 0.972, family: 'kaleidoscope', famB: 5, famA: 0, hueShift: 0.003, gamma: 1.5 },
    frame: { zoom: '1.012 + 0.012 * bass_att', rot: '0.01 * sin(time * 0.17)' },
    // the kaleidoscope copies only its first slice (from the right, 0 to 36 degrees up): the covers sit in it
    sprites: [
      { source: 'cover', x: '(0.42 + 0.08 * bass_att) * cos(0.314) / aspect', y: '(0.42 + 0.08 * bass_att) * sin(0.314)', size: '0.12 + 0.02 * pulse', angle: 'time * 0.6', alpha: 0.6, blend: 'over' },
      { source: 'cover', x: '0.17 * cos(0.314) / aspect', y: '0.17 * sin(0.314)', size: 0.05, angle: '-time * 0.8', alpha: 0.6, blend: 'over' },
    ],
    waves: [{ mode: 'spectrum', y: 0, scale: '0.5 + 0.2 * mid_att', thick: 0.005, alpha: 0.5, hue: 'time * 0.03' }],
  },
  {
    name: 'Cover Echo',
    blurb: 'The cover and its echoes falling away into the depth, thrown further on every beat, its light all around.',
    suits: ['energetic', 'dark'],
    base: { decay: 0.92, zoom: 0.992, warp: 1.2, warpScale: 0.5, gamma: 1.3 },
    init: { kick: 0, t0: 0 },
    frame: {
      kick: 'beat || time - t0 > 1.2 ? 1 : kick * 0.9',
      t0: 'kick > 0.99 ? time : t0',
      // where the echoes fall to, wandering slowly
      vx: '1.05 * cos(time * 0.3)',
      vy: '0.75 * sin(time * 0.23)',
    },
    sprites: [
      // the cover large and faint every frame: its light fills the picture, softened by the warp
      { source: 'cover', size: 1.8, angle: 'time * 0.03', alpha: 0.05, blend: 'over' },
      // seven covers, the farthest first: each smaller and nearer the point they fall to
      {
        source: 'cover',
        repeat: 7,
        size: '0.42 * pow(0.72, n - 1 - i)',
        x: 'vx * (1 - pow(0.72, n - 1 - i)) * (1 + 0.35 * kick) / aspect',
        y: 'vy * (1 - pow(0.72, n - 1 - i)) * (1 + 0.35 * kick)',
        angle: '(n - 1 - i) * 0.1 * sin(time * 0.4)',
        alpha: '0.3 + 0.6 * pow(0.78, n - 1 - i)',
        blend: 'over',
      },
    ],
    waves: [
      { mode: 'dots', scale: '0.8 + 0.2 * mid_att', thick: 0.005, alpha: 0.25, hue: 'time * 0.04' },
      { mode: 'circle', scale: '0.3 + 0.5 * kick', thick: '0.002 + 0.006 * kick', alpha: '0.5 * kick', hue: 'time * 0.06' },
    ],
  },
]

/** *Drop · Random*: a preset made up now - a warp family, motion, a wave or two, maybe shapes, maybe a
 * mirror - from ranges that look good together. ``random`` for tests. */
export function randomPreset(random: () => number = Math.random): PresetFile {
  const pick = <T>(list: readonly T[]): T => list[Math.floor(random() * list.length) % list.length]
  const r = (a: number, b: number, digits = 4): number => Number((a + (b - a) * random()).toFixed(digits))
  const family = pick(['plain', 'swirl', 'waves', 'tunnel', 'kaleidoscope', 'ripple', 'twist', 'fold', 'lens', 'tiles', 'spiral', 'drain'] as const)
  const famB = { plain: 1, swirl: r(0.6, 1.4), waves: r(3, 10), tunnel: r(6, 16), kaleidoscope: Math.round(r(3, 9)), ripple: r(14, 34), twist: r(1, 2.5), fold: r(0.2, 0.8), lens: r(0.2, 0.4), tiles: Math.round(r(2, 3)), spiral: 1, drain: r(0.08, 0.25) }[family]
  const famA = { plain: '0', swirl: `${r(0.05, 0.2)} * bass_att`, waves: `${r(0.002, 0.008)} * (1 + mid_att)`, tunnel: `${r(0.01, 0.04)} * bass_att`, kaleidoscope: `${r(0.2, 1)}`, ripple: `${r(0.008, 0.03)} + 0.02 * pulse`, twist: `${r(0.01, 0.03)} * bass_att`, fold: `${r(0.08, 0.16)}`, lens: `${r(0.01, 0.03)} * bass_att`, tiles: `${r(0.03, 0.08)} + 0.15 * pulse`, spiral: `${r(0.008, 0.02)} * bass_att`, drain: `${r(0.004, 0.012)} * bass_att` }[family]
  const band = pick(['bass', 'bass_att', 'mid', 'mid_att'])
  const wave = pick(['circle', 'scope', 'line', 'spectrum', 'stereo', 'dots', 'vertical', 'spiral'] as const)
  const speed = r(0.02, 0.1)
  const file: PresetFile = {
    name: 'Random',
    blurb: 'A preset made up now - a different one each time.',
    suits: ['any', 'electronic', 'energetic', 'calm'],
    base: {
      decay: r(0.92, 0.99),
      family,
      famB,
      warp: r(0, 2),
      warpSpeed: r(0.5, 1.6),
      hueShift: r(0, 0.012),
      mirror: random() < 0.2 ? pick(['left-right', 'both'] as const) : 'none',
      gamma: r(1.4, 1.9),
      wrap: random() < 0.25 ? 1 : 0,
    },
    frame: {
      zoom: `${r(1, 1.03)} + ${r(0.005, 0.03)} * ${band}`,
      rot: `${r(-0.02, 0.02)} * sin(time * ${r(0.1, 0.6)})`,
      famA,
    },
    waves: [{ mode: wave, scale: `${r(0.4, 0.9)} + ${r(0.1, 0.4)} * bass_att`, thick: r(0.004, 0.01), alpha: r(0.6, 0.95), hue: `time * ${speed}` }],
  }
  if (random() < 0.4) {
    const count = Math.round(r(1, 5))
    file.shapes = [{ repeat: count, sides: Math.round(r(3, 8)), radius: `${r(0.03, 0.08)} + 0.05 * pulse`, x: `${r(0.2, 0.6)} * cos(time * ${r(0.2, 0.8)} + i * ${(6.2832 / count).toFixed(4)})`, y: `${r(0.2, 0.6)} * sin(time * ${r(0.2, 0.8)} + i * ${(6.2832 / count).toFixed(4)})`, angle: 'time', hue: `i / n + time * ${speed}`, alpha: r(0.1, 0.3), inner: r(0.4, 0.9) }]
  }
  return file
}
