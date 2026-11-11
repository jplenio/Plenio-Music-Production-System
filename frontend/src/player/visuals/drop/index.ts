/**
 * Plenio Drop as visuals: the built-in presets, *Drop · Random*, and the listener's own presets - JSON files
 * in the player's visuals folder (``~/.plenio/player/visuals``), read again while you edit them, so a
 * preset changes on screen as you save it.
 */
import { shallowRef } from 'vue'

import type { Preset, Scene, SceneOptions } from '../presets'
import { BUILTIN, randomPreset } from './builtin'
import { FormulaError, compilePreset, slug, type PresetFile } from './format'
import { MILKDROP } from './milkdrop'
import { dropRenderer, type DropDef } from './renderer'
import { noteFolder } from '../../folderNote'
import { isPortable, portable } from '../../portable'

/** The preset file of the Drop visual on screen (for *Edit a copy*; *Random* makes a new one each time). */
export const playingFile = shallowRef<PresetFile | null>(null)

/** A Drop preset as a visual. ``make`` gives the preset to play (a new one each time for *Random*). */
function asVisual(id: string, file: PresetFile, make: () => [DropDef, PresetFile], source: 'builtin' | 'mine'): Preset {
  return {
    id,
    name: `${source === 'mine' ? 'My' : 'Drop'} · ${file.name}`,
    blurb: file.blurb ?? '',
    suits: file.suits ?? ['any'],
    kind: 'drop',
    source,
    file,
    create(options?: SceneOptions): Scene {
      const [def, made] = make()
      if (!options?.drop) playingFile.value = made
      return {
        draw(ctx, frame, width, height, colors) {
          const renderer = options?.drop ? options.drop.renderer() : dropRenderer()
          if (!renderer) {
            ctx.fillStyle = '#05040a'
            ctx.fillRect(0, 0, width, height)
            ctx.fillStyle = '#8a86a0'
            ctx.font = '16px system-ui, sans-serif'
            ctx.fillText('This browser has no WebGL2: Plenio Drop cannot draw here. Choose another visual.', 24, 40)
            return
          }
          renderer.use(def, frame.time)
          ctx.drawImage(renderer.render(frame, colors, width, height, options?.drop?.scale), 0, 0, width, height)
        },
      }
    },
  }
}

export const DROP_PRESETS: Preset[] = [
  ...[...BUILTIN, ...MILKDROP].map((file) => {
    const def = compilePreset(file)
    return asVisual(def.id, file, () => [def, file], 'builtin')
  }),
  asVisual('drop-random', randomPreset(), () => {
    const file = randomPreset()
    return [compilePreset(file, 'drop-random'), file]
  }, 'builtin'),
]

// --- the listener's own presets ------------------------------------------------------------------------

export interface MyPresetFile {
  name: string
  text: string
  mtime: number
}

/** Which file a preset of the listener's came from (``my-<file>``). */
export function myPresetFile(id: string): string {
  return id.startsWith('my-') ? (myPresetNames.get(id) ?? '') : ''
}
const myPresetNames = new Map<string, string>()

/** The listener's presets that work, and the files that do not (with why). */
export const myPresets = shallowRef<Preset[]>([])
export const myPresetErrors = shallowRef<{ file: string; error: string }[]>([])
export const myPresetFolder = shallowRef('')
let stamp = ''

/** The listener's preset files as read (for a shared player: they go with it). */
export const myPresetTexts = shallowRef<{ name: string; text: string }[]>([])

/** Read the visuals folder again; ``true`` when something changed. A shared player has the presets it was
 * shared with. */
export async function loadMyPresets(): Promise<boolean> {
  let answer: { folder: string; files: MyPresetFile[] }
  if (isPortable) {
    answer = { folder: '', files: portable?.presets ?? [] }
  } else {
    try {
      const response = await fetch('/api/visuals')
      if (!response.ok) return false
      answer = await response.json()
    } catch {
      return false
    }
  }
  myPresetTexts.value = answer.files.map((f) => ({ name: f.name, text: f.text }))
  myPresetFolder.value = answer.folder
  const next = answer.files.map((f) => `${f.name}:${f.mtime}`).join('|')
  if (next === stamp) return false
  stamp = next
  const ok: Preset[] = []
  const errors: { file: string; error: string }[] = []
  for (const f of answer.files) {
    const id = `my-${slug(f.name.replace(/\.json$/i, ''))}`
    myPresetNames.set(id, f.name)
    try {
      const data = JSON.parse(f.text) as PresetFile
      const def = compilePreset(data, id)
      ok.push(asVisual(id, data, () => [def, data], 'mine'))
    } catch (error) {
      const message = error instanceof SyntaxError ? `not valid JSON: ${error.message}` : error instanceof FormulaError ? error.message : String(error)
      errors.push({ file: f.name, error: message })
    }
  }
  myPresets.value = ok
  myPresetErrors.value = errors
  return true
}

/** A copy of a preset in the visuals folder, to edit (its name gets " (my copy)"); the file's name back. */
export async function copyToMyPresets(file: PresetFile): Promise<string> {
  const copy = { ...file, name: `${file.name} (my copy)` }
  const response = await fetch('/api/visuals/copy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: copy.name, text: `${JSON.stringify(copy, null, 2)}\n` }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data?.error ?? `could not save the copy (${response.status})`)
  await loadMyPresets()
  return String(data.file)
}

export async function openMyPresetFolder(): Promise<void> {
  const response = await fetch('/api/visuals/open', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
  // where the player opens no file manager, the folder's path is shown to copy
  if (response.ok) noteFolder((await response.json().catch(() => null)) ?? { folder: '' })
}
