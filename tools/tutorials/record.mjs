// Record and edit a tutorial video against a running ComfyUI with Plenio and the real models.
//
//   node tools/tutorials/record.mjs <script> [--url http://127.0.0.1:8190] [--tts-url http://127.0.0.1:8191]
//        [--out dist/tutorials] [--render-only] [--headed]
//
// <script> is a file name here without .mjs; its narration is narration/<script>.txt. --tts-url is a
// ComfyUI with TTS Audio Suite (OmniVoice) for the lines not yet in the voice cache.
//
// See tools/tutorials/README.md for the server and the settings it expects.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { renderTutorial } from './lib/render.mjs'
import { openStudio } from './lib/studio.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const PROJECT = path.resolve(HERE, '..', '..')
const args = process.argv.slice(2)
const option = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : fallback
}
const which = args.find((a) => !a.startsWith('--') && !args[args.indexOf(a) - 1]?.startsWith('--'))
if (!which) {
  console.error('usage: node tools/tutorials/record.mjs <script> [--url URL] [--tts-url URL] [--out DIR] [--render-only]')
  process.exit(2)
}
const url = option('url', 'http://127.0.0.1:8190')
const outRoot = path.resolve(option('out', path.join(PROJECT, 'dist', 'tutorials')))
const script = await import(pathToFileURL(path.join(HERE, `${which}.mjs`)).href)
const dir = path.join(outRoot, which)
const banner = path.join(PROJECT, 'assets', 'branding', 'banner.png')

// the viewer settings the videos show: English, no minimap, no node source badges, no canvas info
const SETTINGS = {
  'Comfy.Locale': 'en',
  'Comfy.Minimap.Visible': false,
  'Comfy.NodeBadge.NodeSourceBadgeMode': 'None',
  'Comfy.Graph.CanvasInfo': false,
  'Comfy.TutorialCompleted': true,
  // draw the nodes' text also when the camera shows the whole template
  'LiteGraph.Canvas.LowQualityRenderingZoomThreshold': 0.2,
  // no toolbox above a selected node (it covers the node that is being explained)
  'Comfy.Canvas.SelectionToolbox': false,
  // no hover tooltips: the pointer rests on the canvas while a run is fast-forwarded
  'Comfy.EnableTooltips': false,
}

if (!args.includes('--render-only')) {
  for (const [key, value] of Object.entries(SETTINGS)) {
    const r = await fetch(`${url}/settings/${key}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value) })
    if (!r.ok) throw new Error(`could not set ${key} on ${url}: ${r.status}`)
  }
  fs.rmSync(dir, { recursive: true, force: true })
  const studio = await openStudio({ url, out: dir, headless: !args.includes('--headed') })
  let failure = null
  try {
    await studio.openComfy()
    await script.prepare?.(studio, { project: PROJECT })
    await studio.startCapture()
    await script.default(studio, { project: PROJECT })
    await studio.wait(1500)
  } catch (error) {
    failure = error
    console.error('recording failed:', error)
    await studio.page.screenshot({ path: path.join(dir, 'failure.png') }).catch(() => {})
  } finally {
    await studio.stopCapture().catch(() => {})
    await studio.saveMarkers()
    await studio.browser.close()
  }
  if (failure) process.exit(1)
}
await renderTutorial({
  dir,
  name: script.meta.name,
  banner,
  narration: path.join(HERE, 'narration', `${which}.txt`),
  lexicon: path.join(HERE, 'narration', 'lexicon.txt'),
  voiceDir: path.join(HERE, 'voice'),
  ttsUrl: option('tts-url', null),
})
