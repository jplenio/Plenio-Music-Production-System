// @vitest-environment node
import fs from 'node:fs'
import { describe, expect, it } from 'vitest'

import { WARM_UP } from '../src/player/warmUp'

describe('the warm-up note (P6)', () => {
  it('says the first song takes longer, with the measured factor, in the studio panel', () => {
    expect(WARM_UP).toMatch(/first song after ComfyUI starts takes longer/)
    expect(WARM_UP).toMatch(/one and a half times/)
    expect(fs.readFileSync('src/player/components/StudioSettings.vue', 'utf8')).toContain('{{ WARM_UP }}')
  })

  it('Setup says the test song warms up', () => {
    expect(fs.readFileSync('src/setup/SetupPanel.vue', 'utf8')).toMatch(/loads the models once/)
  })
})
