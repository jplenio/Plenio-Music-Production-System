// Tutorial 11 · YuE2 LoRAs (1.4.0): the YuE2 LoRAs node under the music model of the YuE2 templates - its four
// slots, the two halves of YuE2 a LoRA can shape (the plan, the sound), a LoRA chosen with its strength (the
// instrumental adapter of models/loras, trained on YuE2's planner), an instrumental song made with it, and what
// the node says after the run; then what it leaves out and the original layout it reads.

import { afterRun, intro, openTemplate } from './lib/scenes.mjs'
import { FOOT } from './lib/studio.mjs'

export const meta = {
  name: 'Plenio tutorial 11 - YuE2 LoRAs',
  template: '1 · YuE2 · Song',
}

const BRIEF = 'PlenioSongBrief', LORAS = 'PlenioLoras', MODEL_GROUP = 'MUSIC MODEL'
const WRITE = 'Plenio · Write Song', PLAN = 'Plenio · YuE2 Plan', RENDER = 'Plenio · YuE2 Render', MASTER = 'Plenio · Master'
const PREVIEW = 'Preview (mastered)', BEST = 'Best Take · lyrics fidelity'
const LORA = process.env.PLENIO_TUTORIAL_LORA || 'ar_lora_inst_v3abc_comfyui.safetensors'
const GROUPS = {
  [WRITE]: '2 · WRITE', [PLAN]: '4 · SCORE', [RENDER]: '5 · RENDER', [BEST]: '5 · RENDER', [MASTER]: '6 · FINISH', [PREVIEW]: '6 · FINISH',
  [LORAS]: MODEL_GROUP,
}
// the render block is told with the plan: some of its nodes need nothing from the plan and run first, so a
// caption of its own would come before the writer's
const STAGES = {
  [WRITE]: 'The writer drafts the style and the title.',
  [LORAS]: 'The LoRA joins YuE2 before the plan.',
  [PLAN]: 'YuE2 plans the melody and the chords - with the LoRA - and renders the song.',
  [MASTER]: 'Master and Export finish the song.',
}

// the screen box of the node's summary (what it says after a run)
const summaryBox = (s, node) => s.widgetBox(node, 'plenio_summary')

export default async function loras(s) {
  s.card('title', {
    kicker: 'Plenio tutorial',
    title: '<span class="num">11 ·</span> YuE2 LoRAs',
    subtitle: 'Up to four LoRAs on YuE2 - for the plan or the sound',
    foot: FOOT,
  }, 5)
  intro(s, {
    tutorial: 'Tutorial 11 · YuE2 LoRAs',
    items: [
      'The LoRA node in the template',
      'Choose a LoRA and its strength',
      'What it did to the song',
    ],
  })

  s.chapter('Getting started')
  await s.wait(600)
  await openTemplate(s, {
    name: '1 · YuE2 · Song',
    what: 'Every YuE2 template has it - here 1 · YuE2 · Song.',
  })

  // --- the node --------------------------------------------------------------------------------------------
  s.chapter('The LoRA node')
  const node = 'Under the music model: YuE2 LoRAs - up to four LoRAs, each with its strength.'
  s.caption(node)
  await s.flyGroups([MODEL_GROUP], 1300, 0.8)
  await s.spotlight(s.nodeBox(LORAS), { ms: 3000, pad: 6 })
  await s.read(node, 4200)
  const empty = 'Every slot on none, as the templates ship: YuE2 runs exactly as loaded.'
  s.caption(empty)
  await s.callout(s.nodeBox(LORAS), 'none · as loaded', { ms: 3000 })
  await s.read(empty, 4200)
  const halves = 'YuE2 has two halves. A LoRA on the planner shapes the plan - structure, melody, genre. One on the acoustic model shapes the sound.'
  s.caption(halves)
  await s.read(halves, 7400)
  const reads = 'The node reads which half a file is for, and applies it there - one strength per LoRA is enough.'
  s.caption(reads)
  await s.read(reads, 5600)

  s.chapter('Choose a LoRA')
  const choose = 'Put a LoRA into models/loras and choose it. Ours: an instrumental LoRA, trained on YuE2’s planner.'
  s.caption(choose)
  await s.chooseCombo(LORAS, 'lora_1', LORA, { read: 2800, browse: 3 })
  await s.read(choose, 3400)
  const strength = 'strength: 1 as trained, 0 off. A LoRA’s card says what suits it.'
  s.caption(strength)
  const slider = await s.widgetBox(LORAS, 'strength_1')
  await s.spotlight(slider, { ms: 3000, pad: 6 })
  await s.read(strength, 4600)

  const brief = 'An instrumental LoRA wants an instrumental song: vocals - instrumental, in the Song Brief.'
  s.caption(brief)
  await s.flyNodes([BRIEF], 1200, 0.94)
  await s.chooseCombo(BRIEF, 'vocals', 'instrumental', { read: 2400, browse: 3 })
  await s.chooseCombo(BRIEF, 'length', 'short (about 1:30)', { read: 1600, browse: 3 })
  await s.read(brief, 2400)

  s.caption('Press Run.')
  await s.resetRunState()
  await s.run()
  await s.follow({ stages: STAGES, groups: GROUPS })
  await afterRun(s, 'Done: an instrumental, planned with the LoRA.', { group: '6 · FINISH', preview: PREVIEW, seconds: 18 })

  // --- what it did ------------------------------------------------------------------------------------------
  s.chapter('What it did')
  const said = 'After the run the node says what it did: how many of the LoRA’s weights went to the plan, how many to the sound.'
  s.caption(said)
  await s.flyGroups([MODEL_GROUP], 1200, 0.8)
  await s.spotlight(await summaryBox(s, LORAS), { ms: 3600, pad: 6 })
  await s.read(said, 6400)
  const safe = 'A file that does not fit - another model’s LoRA, a broken download, weights of another shape - is left out and named. The run goes on.'
  s.caption(safe)
  await s.read(safe, 7000)
  const layouts = 'Files in ComfyUI’s layout and in m-a-p’s original one both work: the node joins the original layout for ComfyUI.'
  s.caption(layouts)
  await s.read(layouts, 6000)
  const record = 'The release record keeps the LoRAs with their strengths, and the song’s page lists them.'
  s.caption(record)
  await s.read(record, 4800)

  s.card('end', {
    title: 'YuE2 LoRAs',
    lines: ['Guide: <b>docs/user/concepts/loras.md</b>', 'Install: ComfyUI Manager → <b>Plenio Music Production System</b>', 'Guides and source: <b>github.com/jplenio/Plenio-Music-Production-System</b>'],
  }, 5)
}
