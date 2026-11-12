// A poster of every visual (phase 7.8): opens the player at #/posters (each visual drawn from a fixed piece of
// made-up music), gathers the stills into one sprite sheet and writes frontend/src/player/public/posters.jpg and
// posters.json - built into the player beside its page. Run against a player built from this checkout:
//
//   npm --prefix frontend run build:player && python -m plenio.player --port 8791 --no-browser --folder <any>
//   PLAYWRIGHT_MODULE=<playwright-core> node tools/visual_posters.mjs --url http://127.0.0.1:8791
//   npm --prefix frontend run build:player     (again: the sheet goes into the build)
//
// Playwright's own Chromium with the graphics card (Plenio Drop and Nova draw with WebGL2).
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const PROJECT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, value, i, all) => (value.startsWith('--') ? [...pairs, [value.slice(2), all[i + 1]]] : pairs), []))
const URL = args.url ?? 'http://127.0.0.1:8791'
const OUT = path.join(PROJECT, 'frontend', 'src', 'player', 'public')
const COLUMNS = 10

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? 'playwright-core')
const browser = await chromium.launch({ args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11'] })
const page = await browser.newPage()
page.on('pageerror', (e) => console.error('page:', String(e)))
await page.goto(`${URL}/#/posters`, { waitUntil: 'load' })
await page.waitForFunction(() => Array.isArray(window.__plenioPosters), null, { timeout: 600000 })
const sheet = await page.evaluate(async (columns) => {
  const posters = window.__plenioPosters
  const images = await Promise.all(posters.map((p) => new Promise((done) => { const im = new Image(); im.onload = () => done(im); im.src = p.image })))
  const w = images[0].width
  const h = images[0].height
  const canvas = document.createElement('canvas')
  canvas.width = w * columns
  canvas.height = h * Math.ceil(images.length / columns)
  const ctx = canvas.getContext('2d')
  images.forEach((im, k) => ctx.drawImage(im, (k % columns) * w, Math.floor(k / columns) * h))
  return { jpeg: canvas.toDataURL('image/jpeg', 0.8), map: { width: w, height: h, columns, ids: posters.map((p) => p.id) } }
}, COLUMNS)
fs.writeFileSync(path.join(OUT, 'posters.jpg'), Buffer.from(sheet.jpeg.split(',')[1], 'base64'))
fs.writeFileSync(path.join(OUT, 'posters.json'), JSON.stringify(sheet.map) + '\n')
console.log(`wrote ${sheet.map.ids.length} posters (${COLUMNS} a row) to frontend/src/player/public/posters.jpg`)
await browser.close()
