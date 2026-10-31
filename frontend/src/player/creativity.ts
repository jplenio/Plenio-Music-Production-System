/**
 * The brief's creativity (owner's requests 2026-10-19 and 2026-10-31): 0 steady ... 50 the reference ... 100
 * experimental (the default since 1.5.0) ... 200 adventurous - its levels for the song page and the filters, and the
 * sampling values at 50 (as ``plenio/core/creativity.py``). Up to 100 the values mean what they meant in 1.4.
 */
import type { SamplingStage, SamplingValues } from './api'

/** The levels by their highest value, as the writer's rules know them. */
export const CREATIVITY_LEVELS: [number, string][] = [
  [19, 'steady'],
  [39, 'restrained'],
  [60, 'balanced'],
  [80, 'varied'],
  [150, 'experimental'],
  [200, 'adventurous'],
]

/** The default since 1.5.0 (1.4's experimental top). */
export const CREATIVITY_DEFAULT = 100
/** The reference: the writing and sampling of before the slider. */
export const CREATIVITY_REFERENCE = 50

export function creativityLevel(value: number): string {
  return CREATIVITY_LEVELS.find(([highest]) => value <= highest)?.[1] ?? 'adventurous'
}

/** ``75 - varied``, ``100 - experimental, the default``, ``50 - balanced, the reference``. */
export function describeCreativity(value: number): string {
  const note = value === CREATIVITY_DEFAULT ? ', the default' : value === CREATIVITY_REFERENCE ? ', the reference' : ''
  return `${value} - ${creativityLevel(value)}${note}`
}

/** The filter's ranges, with their labels: one level each. */
export const CREATIVITY_RANGES: [string, string][] = [
  ['0-19', 'steady, 0-19'],
  ['20-39', 'restrained, 20-39'],
  ['40-60', 'balanced, 40-60'],
  ['61-80', 'varied, 61-80'],
  ['81-150', 'experimental, 81-150'],
  ['151-200', 'adventurous, 151-200'],
]

/** The values every stage had before the slider - the templates' at 50. */
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
