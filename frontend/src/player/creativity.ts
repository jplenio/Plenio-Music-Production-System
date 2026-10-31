/**
 * The brief's creativity (owner's requests 2026-10-19 and 2026-10-31): 0 steady ... 25 balanced (1.4's reference)
 * ... 50 experimental (the default, 1.4's 100) ... 100 adventurous - its levels for the song page and the filters,
 * and the sampling values before the slider (as ``plenio/core/creativity.py``). The player gives songs made before
 * 1.5.0 on this scale (half of 1.4's number).
 */
import type { SamplingStage, SamplingValues } from './api'

/** The levels by their highest value, as the writer's rules know them. */
export const CREATIVITY_LEVELS: [number, string][] = [
  [9, 'steady'],
  [19, 'restrained'],
  [30, 'balanced'],
  [40, 'varied'],
  [75, 'experimental'],
  [100, 'adventurous'],
]

/** The default since 1.5.0 (1.4's 100). */
export const CREATIVITY_DEFAULT = 50
/** 1.4's reference (its 50): the writing and sampling of before the slider. */
export const CREATIVITY_REFERENCE = 25

export function creativityLevel(value: number): string {
  return CREATIVITY_LEVELS.find(([highest]) => value <= highest)?.[1] ?? 'adventurous'
}

/** ``35 - varied``, ``50 - experimental, the default``, ``25 - balanced, 1.4's reference``. */
export function describeCreativity(value: number): string {
  const note = value === CREATIVITY_DEFAULT ? ', the default' : value === CREATIVITY_REFERENCE ? ", 1.4's reference" : ''
  return `${value} - ${creativityLevel(value)}${note}`
}

/** The filter's ranges, with their labels: one level each. */
export const CREATIVITY_RANGES: [string, string][] = [
  ['0-9', 'steady, 0-9'],
  ['10-19', 'restrained, 10-19'],
  ['20-30', 'balanced, 20-30'],
  ['31-40', 'varied, 31-40'],
  ['41-75', 'experimental, 41-75'],
  ['76-100', 'adventurous, 76-100'],
]

/** The values every stage had before the slider - the templates' at 25 (1.4's 50). */
export const REFERENCE_SAMPLING: Record<SamplingStage, SamplingValues> = {
  writer: { temperature: 0.8 },
  arrangement: { temperature: 0.7 },
  plan: { temperature: 0.7, top_p: 0.9, top_k: 30 },
  take: { temperature: 1, top_p: 0.95, top_k: 100 },
}

/** ``temperature 0.81 · top-p 0.925 · top-k 40``. */
export function describeSampling(values: SamplingValues): string {
  const parts = [`temperature ${values.temperature}`]
  if (values.top_p !== undefined) parts.push(`top-p ${values.top_p}`)
  if (values.top_k !== undefined) parts.push(`top-k ${values.top_k}`)
  return parts.join(' · ')
}

export function isReference(stage: SamplingStage, values: SamplingValues): boolean {
  const reference = REFERENCE_SAMPLING[stage]
  return values.temperature === reference.temperature && values.top_p === reference.top_p && values.top_k === reference.top_k
}
