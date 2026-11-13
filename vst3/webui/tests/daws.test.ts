import { describe, expect, it } from 'vitest'

import { DAWS, dawFor, stepsOf } from '../src/daws'

describe('the DAW guide', () => {
  it('knows a DAW by the name its host gives', () => {
    expect(dawFor('REAPER')?.id).toBe('reaper')
    expect(dawFor('Cubase Pro 14')?.id).toBe('cubase')
    expect(dawFor('Nuendo 13')?.id).toBe('cubase')
    expect(dawFor('Studio One 7')?.id).toBe('studio-one')
    expect(dawFor('Ableton Live 12 Suite')?.id).toBe('live')
    expect(dawFor('FL Studio 2024')?.id).toBe('fl-studio')
    expect(dawFor('Bitwig Studio')?.id).toBe('bitwig')
    expect(dawFor('Cakewalk by BandLab')?.id).toBe('cakewalk')
    expect(dawFor('vstvalidator')).toBeUndefined()
    expect(dawFor('')).toBeUndefined()
  })

  it('has every step for every DAW Plenio runs in, ARA only where it is known', () => {
    for (const daw of DAWS.filter((d) => !d.unsupported)) {
      const steps = stepsOf(daw)
      for (const key of ['add', 'tempo', 'stems', 'midi', 'audio'] as const) expect(steps[key].length, `${daw.id}.${key}`).toBeGreaterThan(10)
    }
    expect(stepsOf(dawFor('Bitwig Studio')).ara).toBeUndefined()
    expect(stepsOf(undefined).add).toContain('VST3')
  })
})
