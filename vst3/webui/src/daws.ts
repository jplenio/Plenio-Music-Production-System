// Every DAW's own steps for Plenio: the DAW tab shows those of the host the plug-in runs in first, and
// docs/DAWS.md is written from the same data (tools/docs/make_daws_md.py).
import data from './daws.json'

export interface DawSteps {
  add?: string
  tempo?: string
  stems?: string
  midi?: string
  ara?: string
  audio?: string
}

export interface Daw extends DawSteps {
  id: string
  name: string
  match: string[]
  /** For the overview in docs/DAWS.md: where the tempo map comes from, whether Plenio ARA runs. */
  table: { tempo: string; ara: string }
  /** Plenio VST3 does not run there: why, and what works instead. */
  unsupported?: string
}

export const GENERAL: DawSteps = data.general
export const DAWS: Daw[] = data.daws

/** The DAW a host name (VST3's IHostApplication) belongs to, if Plenio knows it. */
export function dawFor(host: string): Daw | undefined {
  const name = host.toLowerCase()
  return name ? DAWS.find((d) => d.match.some((m) => name.includes(m))) : undefined
}

/** The steps to show: the DAW's own, else the general ones (ARA only where the DAW is known to have it). */
export function stepsOf(daw: Daw | undefined): Required<Omit<DawSteps, 'ara'>> & { ara?: string } {
  return {
    add: daw?.add ?? GENERAL.add ?? '',
    tempo: daw?.tempo ?? GENERAL.tempo ?? '',
    stems: daw?.stems ?? GENERAL.stems ?? '',
    midi: daw?.midi ?? GENERAL.midi ?? '',
    audio: daw?.audio ?? GENERAL.audio ?? '',
    ara: daw?.ara
  }
}
