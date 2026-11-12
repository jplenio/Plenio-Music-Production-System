/**
 * The Plenio Drop preset format: a JSON file anyone can write (docs/user/concepts/player-visuals.md).
 *
 *   {
 *     "name": "Nebula Swirl",
 *     "blurb": "A slow swirl of colour around a ring the music swells",
 *     "suits": ["calm", "electronic"],
 *     "base":   { "decay": 0.975, "family": "swirl", "famB": 0.9 },
 *     "init":   { "spin": 0 },
 *     "frame":  { "zoom": "1.004 + 0.012 * bass", "spin": "spin + 0.01 * mid", "rot": "0.004 * sin(spin)" },
 *     "waves":  [ { "mode": "circle", "scale": "0.55 + 0.25 * bass_att", "hue": "time * 0.05" } ],
 *     "shapes": [ { "repeat": 3, "sides": 6, "x": "0.5 * cos(time + i * 2.09)", "y": "0.5 * sin(time + i * 2.09)" } ],
 *     "sprites": [ { "source": "cover", "size": "0.3 + 0.05 * pulse", "angle": "time * 0.2" } ]
 *   }
 *
 * Every value may be a number or a formula - a small language of its own (numbers, names, + - * / % ^,
 * comparisons, && || !, ``a ? b : c``, and functions like sin, clamp, mix), evaluated here, never as script:
 * a preset someone shares can draw, and nothing else. Each frame starts from ``base``; ``frame`` is worked
 * through in order, every line setting a parameter or a variable of the preset's own (kept from frame to
 * frame, starting at ``init``); then the waves, shapes and sprites are worked out, each ``repeat`` times with
 * ``i`` and ``n``. A sprite is a picture drawn into the feedback - the song's ``cover``, its ``title``, the
 * ``line`` sung now, the ``word`` sung now (owner's request 2026-10-18) - so it melts and swirls with the rest.
 */
import { DEFAULTS, type DropDef, type DropParams, type Music, type Shape, type Sprite, type Wave } from './renderer'

// --- names --------------------------------------------------------------------------------------------

export const FAMILIES = ['plain', 'swirl', 'waves', 'tunnel', 'kaleidoscope', 'ripple', 'twist', 'fold', 'lens', 'tiles', 'spiral', 'drain'] as const
export const WAVE_MODES = ['circle', 'scope', 'line', 'spectrum', 'stereo', 'dots', 'vertical', 'spiral'] as const
export const MIRRORS = ['none', 'left-right', 'top-bottom', 'both'] as const
/** What a sprite shows, and how it is laid on. */
export const SOURCES = ['cover', 'title', 'line', 'word'] as const
export const BLENDS = ['over', 'add'] as const

/** The parameters a preset sets (``base``, ``frame``), with their defaults. */
export const PARAMETERS = Object.keys(DEFAULTS).filter((k) => k !== 'waves' && k !== 'shapes') as (keyof DropParams)[]

/** What every formula can read: the music, the time, and the screen. */
export const MUSIC_NAMES = ['time', 'frame', 'dt', 'fps', 'bass', 'mid', 'treb', 'bass_att', 'mid_att', 'treb_att', 'vol', 'beat', 'pulse', 'aspect', 'songtime', 'line_on', 'line_age', 'pi', 'e'] as const

const WAVE_FIELDS = ['mode', 'scale', 'x', 'y', 'thick', 'alpha', 'hue'] as const
const SHAPE_FIELDS = ['sides', 'radius', 'x', 'y', 'angle', 'hue', 'alpha', 'inner'] as const
const SPRITE_FIELDS = ['source', 'x', 'y', 'size', 'angle', 'alpha', 'tint', 'hue', 'blend'] as const
const WAVE_DEFAULTS: Wave = { mode: 0, scale: 1, x: 0, y: 0, thick: 0.006, alpha: 0.9, hue: 0 }
const SHAPE_DEFAULTS: Shape = { sides: 6, radius: 0.1, x: 0, y: 0, angle: 0, hue: 0.5, alpha: 0.4, inner: 0.8 }
/** A sprite's fields as numbers while they are worked out (``source`` and ``blend`` as places in their lists). */
const SPRITE_DEFAULTS = { source: 0, x: 0, y: 0, size: 0.3, angle: 0, alpha: 0.8, tint: 0, hue: 0, blend: 1 }

// --- the formula language -----------------------------------------------------------------------------

type Scope = Record<string, number>
type Fn = (s: Scope) => number

const FUNCTIONS: Record<string, [number, number, (...a: number[]) => number]> = {
  sin: [1, 1, Math.sin], cos: [1, 1, Math.cos], tan: [1, 1, Math.tan], asin: [1, 1, Math.asin], acos: [1, 1, Math.acos],
  atan: [1, 1, Math.atan], atan2: [2, 2, Math.atan2], abs: [1, 1, Math.abs], sqrt: [1, 1, (x) => Math.sqrt(Math.max(0, x))],
  exp: [1, 1, Math.exp], log: [1, 1, (x) => Math.log(Math.max(1e-9, x))], pow: [2, 2, (a, b) => Math.pow(Math.abs(a), b) * (a < 0 && Number.isInteger(b) && b % 2 ? -1 : 1)],
  floor: [1, 1, Math.floor], ceil: [1, 1, Math.ceil], round: [1, 1, Math.round], sign: [1, 1, Math.sign],
  fract: [1, 1, (x) => x - Math.floor(x)], min: [2, 8, Math.min], max: [2, 8, Math.max],
  clamp: [3, 3, (x, a, b) => Math.min(b, Math.max(a, x))], mix: [3, 3, (a, b, t) => a + (b - a) * t],
  step: [2, 2, (edge, x) => (x < edge ? 0 : 1)], smoothstep: [3, 3, (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a || 1))); return t * t * (3 - 2 * t) }],
  rand: [0, 1, (x = 1) => Math.random() * x], hash: [1, 1, (x) => { const s = Math.sin(x * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s) }],
} // prettier-ignore

export class FormulaError extends Error {}

type Token = { kind: 'num' | 'name' | 'op'; text: string; at: number }

function tokens(source: string): Token[] {
  const out: Token[] = []
  const re = /\s*(?:(\d+\.?\d*(?:e[+-]?\d+)?|\.\d+(?:e[+-]?\d+)?)|([A-Za-z_]\w*)|(<=|>=|==|!=|&&|\|\||[-+*/%^()<>?:,!]))/gy
  let at = 0
  while (at < source.length) {
    if (/^\s*$/.test(source.slice(at))) break
    re.lastIndex = at
    const m = re.exec(source)
    if (!m) throw new FormulaError(`cannot read "${source.slice(at).trim().slice(0, 12)}"`)
    if (m[1] !== undefined) out.push({ kind: 'num', text: m[1], at })
    else if (m[2] !== undefined) out.push({ kind: 'name', text: m[2], at })
    else out.push({ kind: 'op', text: m[3], at })
    at = re.lastIndex
  }
  return out
}

const BINARY: Record<string, [number, (a: number, b: number) => number]> = {
  '||': [1, (a, b) => (a || b ? 1 : 0)], '&&': [2, (a, b) => (a && b ? 1 : 0)],
  '==': [3, (a, b) => (a === b ? 1 : 0)], '!=': [3, (a, b) => (a !== b ? 1 : 0)],
  '<': [4, (a, b) => (a < b ? 1 : 0)], '<=': [4, (a, b) => (a <= b ? 1 : 0)], '>': [4, (a, b) => (a > b ? 1 : 0)], '>=': [4, (a, b) => (a >= b ? 1 : 0)],
  '+': [5, (a, b) => a + b], '-': [5, (a, b) => a - b],
  '*': [6, (a, b) => a * b], '/': [6, (a, b) => (b === 0 ? 0 : a / b)], '%': [6, (a, b) => (b === 0 ? 0 : a % b)],
  '^': [8, (a, b) => Math.pow(a, b)],
} // prettier-ignore

/** A formula as a function of the scope. ``known``: the names it may use (others are a mistake to report). */
export function compileFormula(source: string, known: Set<string>): Fn {
  const list = tokens(source)
  let pos = 0
  const peek = () => list[pos]
  const take = (text?: string): Token => {
    const t = list[pos]
    if (!t || (text !== undefined && t.text !== text)) throw new FormulaError(text ? `"${text}" expected` : 'the formula ends too soon')
    pos++
    return t
  }
  function primary(): Fn {
    const t = take()
    if (t.kind === 'num') {
      const v = Number(t.text)
      return () => v
    }
    if (t.kind === 'name') {
      if (peek()?.text === '(') {
        const fn = FUNCTIONS[t.text]
        if (!fn) throw new FormulaError(`unknown function "${t.text}"`)
        take('(')
        const args: Fn[] = []
        if (peek()?.text !== ')') {
          args.push(expression(0))
          while (peek()?.text === ',') {
            take(',')
            args.push(expression(0))
          }
        }
        take(')')
        if (args.length < fn[0] || args.length > fn[1]) throw new FormulaError(`${t.text}() takes ${fn[0] === fn[1] ? fn[0] : `${fn[0]}-${fn[1]}`} values, not ${args.length}`)
        const call = fn[2]
        return (s) => call(...args.map((a) => a(s)))
      }
      if (t.text === 'pi') return () => Math.PI
      if (t.text === 'e') return () => Math.E
      if (!known.has(t.text)) throw new FormulaError(`unknown name "${t.text}"`)
      const name = t.text
      return (s) => s[name] ?? 0
    }
    if (t.text === '(') {
      const inner = expression(0)
      take(')')
      return inner
    }
    // a sign binds looser than ^ (-x^2 is -(x^2)) and tighter than * /
    if (t.text === '-') {
      const v = expression(7)
      return (s) => -v(s)
    }
    if (t.text === '+') return expression(7)
    if (t.text === '!') {
      const v = expression(7)
      return (s) => (v(s) ? 0 : 1)
    }
    throw new FormulaError(`unexpected "${t.text}"`)
  }
  function unary(): Fn {
    return primary()
  }
  function expression(min: number): Fn {
    let left = unary()
    for (;;) {
      const t = peek()
      if (!t) return left
      if (t.text === '?' && min === 0) {
        take('?')
        const yes = expression(0)
        take(':')
        const no = expression(0)
        const cond = left
        left = (s) => (cond(s) ? yes(s) : no(s))
        continue
      }
      const op = BINARY[t.text]
      if (!op || op[0] < min) return left
      take()
      // ^ binds to the right, the others to the left
      const right = expression(t.text === '^' ? op[0] : op[0] + 1)
      const a = left
      const f = op[1]
      left = (s) => f(a(s), right(s))
    }
  }
  if (!list.length) throw new FormulaError('the formula is empty')
  const fn = expression(0)
  if (pos < list.length) throw new FormulaError(`unexpected "${list[pos].text}"`)
  return (s) => {
    const v = fn(s)
    return Number.isFinite(v) ? v : 0
  }
}

// --- the file -----------------------------------------------------------------------------------------

type Value = number | string | boolean
type Fields = Record<string, Value>

export interface PresetFile {
  name: string
  blurb?: string
  suits?: string[]
  base?: Fields
  init?: Record<string, number>
  frame?: Record<string, Value>
  waves?: (Fields & { repeat?: number })[]
  shapes?: (Fields & { repeat?: number })[]
  sprites?: (Fields & { repeat?: number })[]
}

/** A named value of a list (``"swirl"``, ``"circle"``) as its number; numbers and formulas pass. */
function named(value: Value, names: readonly string[], field: string): Value {
  if (typeof value !== 'string' || /[^a-z-]/i.test(value)) return value
  const i = names.indexOf(value.toLowerCase())
  if (i < 0) throw new FormulaError(`${field}: "${value}" is none of ${names.join(', ')}`)
  return i
}

function compileValue(value: Value, known: Set<string>, where: string): Fn {
  if (typeof value === 'number') return () => value
  if (typeof value === 'boolean') return () => (value ? 1 : 0)
  if (typeof value !== 'string') throw new FormulaError(`${where}: a number or a formula, not ${JSON.stringify(value)}`)
  try {
    return compileFormula(value, known)
  } catch (error) {
    throw new FormulaError(`${where}: ${error instanceof Error ? error.message : String(error)}`)
  }
}

function listValue(field: string, value: Value): Value {
  if (field === 'family') return named(value, FAMILIES, field)
  if (field === 'mirror') return named(value, MIRRORS, field)
  if (field === 'mode') return named(value, WAVE_MODES, field)
  if (field === 'source') return named(value, SOURCES, field)
  if (field === 'blend') return named(value, BLENDS, field)
  return value
}

/** ``"Nebula Swirl"`` -> ``nebula-swirl``. */
export function slug(text: string): string {
  return text.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'preset'
}

/** A preset file made into what the renderer plays. Throws ``FormulaError`` with where and why. */
export function compilePreset(file: PresetFile, id = `drop-${slug(file.name ?? '')}`): DropDef {
  if (!file || typeof file !== 'object') throw new FormulaError('a preset is a JSON object')
  if (typeof file.name !== 'string' || !file.name.trim()) throw new FormulaError('"name" is missing')
  const params = new Set<string>(PARAMETERS)
  const own = new Set<string>([...Object.keys(file.init ?? {}), ...Object.keys(file.frame ?? {})].filter((k) => !params.has(k)))
  for (const name of own) {
    if (!/^[A-Za-z]\w*$/.test(name) || name in Object.prototype || (MUSIC_NAMES as readonly string[]).includes(name) || name === 'i' || name === 'n')
      throw new FormulaError(`"${name}" cannot be a variable's name (letters, digits and _, starting with a letter, and none of the music's names)`)
  }
  const known = new Set<string>([...MUSIC_NAMES, ...PARAMETERS, ...own])
  for (const key of Object.keys(file.base ?? {})) if (!params.has(key)) throw new FormulaError(`base: "${key}" is no parameter (the parameters: ${PARAMETERS.join(', ')})`)
  for (const [key, value] of Object.entries(file.init ?? {})) if (typeof value !== 'number') throw new FormulaError(`init.${key}: a number`)
  const base = Object.entries(file.base ?? {}).map(([k, v]) => [k, compileValue(listValue(k, v), known, `base.${k}`)] as const)
  const frame = Object.entries(file.frame ?? {}).map(([k, v]) => [k, compileValue(listValue(k, v), known, `frame.${k}`)] as const)
  const local = new Set([...known, 'i', 'n'])
  const parts = <T extends Wave | Shape>(list: (Fields & { repeat?: number })[] | undefined, fields: readonly string[], defaults: T, kind: string) =>
    (list ?? []).map((item, k) => {
      for (const key of Object.keys(item)) if (key !== 'repeat' && !fields.includes(key)) throw new FormulaError(`${kind}[${k}]: "${key}" is not a field (${fields.join(', ')}, repeat)`)
      const repeat = Math.max(1, Math.min(64, Math.round(Number(item.repeat ?? 1)) || 1))
      const compiled = fields.map((f) => [f, item[f] === undefined ? () => (defaults as unknown as Record<string, number>)[f] : compileValue(listValue(f, item[f]), local, `${kind}[${k}].${f}`)] as const)
      return { repeat, compiled }
    })
  const waves = parts(file.waves, WAVE_FIELDS, WAVE_DEFAULTS, 'waves')
  const shapes = parts(file.shapes, SHAPE_FIELDS, SHAPE_DEFAULTS, 'shapes')
  const sprites = parts(file.sprites, SPRITE_FIELDS, SPRITE_DEFAULTS as unknown as Wave, 'sprites')

  return {
    id,
    name: file.name,
    blurb: file.blurb ?? '',
    suits: Array.isArray(file.suits) ? file.suits.map(String) : ['any'],
    frame(m: Music, vars: Scope): Partial<DropParams> {
      // the music and the time; the preset's own variables carry over from the last frame
      if (!vars.__ready) {
        for (const [k, v] of Object.entries(file.init ?? {})) vars[k] = v
        vars.__ready = 1
      }
      vars.time = m.time
      vars.frame = m.frame
      vars.dt = m.dt
      vars.fps = 1 / Math.max(m.dt, 0.001)
      vars.bass = m.bass
      vars.mid = m.mid
      vars.treb = m.treb
      vars.bass_att = m.bassAtt
      vars.mid_att = m.midAtt
      vars.treb_att = m.trebAtt
      vars.vol = m.vol
      vars.beat = m.beat ? 1 : 0
      vars.pulse = m.pulse
      vars.aspect = m.aspect
      vars.songtime = m.songTime
      vars.line_on = m.lineOn
      vars.line_age = m.lineAge
      vars.anticipation = m.anticipation ?? 0
      vars.impact = m.impact ?? 0
      vars.tension = m.tension ?? 0
      vars.beat_phase = m.beatPhase ?? 0
      vars.bar_phase = m.barPhase ?? 0
      vars.section_energy = m.sectionEnergy ?? 0.5
      // every frame starts from the defaults and the preset's base
      for (const key of PARAMETERS) vars[key] = DEFAULTS[key] as number
      for (const [k, f] of base) vars[k] = f(vars)
      for (const [k, f] of frame) vars[k] = f(vars)
      const out: Partial<DropParams> = {}
      for (const key of PARAMETERS) (out[key] as number) = vars[key]
      const expand = <T>(list: typeof waves, defaults: T): T[] => {
        const result: T[] = []
        for (const part of list) {
          vars.n = part.repeat
          for (let i = 0; i < part.repeat; i++) {
            vars.i = i
            const item = { ...defaults } as Record<string, number>
            for (const [f, fn] of part.compiled) item[f] = fn(vars)
            result.push(item as T)
          }
        }
        return result
      }
      out.waves = expand(waves, WAVE_DEFAULTS)
      out.shapes = expand(shapes, SHAPE_DEFAULTS)
      out.sprites = expand(sprites, SPRITE_DEFAULTS as unknown as Record<string, number>).map(
        (s): Sprite => ({
          source: SOURCES[Math.max(0, Math.min(SOURCES.length - 1, Math.round(s.source)))],
          x: s.x,
          y: s.y,
          size: s.size,
          angle: s.angle,
          alpha: s.alpha,
          tint: s.tint,
          hue: s.hue,
          additive: s.blend >= 0.5 ? 1 : 0,
        })
      )
      return out
    },
  }
}

/** A preset file read from text: the JSON, then the preset; errors say where. */
export function readPreset(text: string, id?: string): DropDef {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch (error) {
    throw new FormulaError(`not valid JSON: ${error instanceof Error ? error.message : String(error)}`)
  }
  return compilePreset(data as PresetFile, id)
}
