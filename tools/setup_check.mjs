// Browser check of Plenio Setup (phase 4.2) in the real ComfyUI frontend, against a throttled stand-in for
// Hugging Face: the plan → *Download all* → every row verified; a gated file leads to the access dialog.
//
// Needs a fresh dev server with the stand-in and one gated file (nothing downloaded yet):
//
//   PLENIO_FAKE_GATED=<a file name> python tools/dev_server.py --fake-hub 8791 --port 8192 --base <new folder>
//       --models <new folder>/models
//   node tools/setup_check.mjs --url http://127.0.0.1:8192 --gated <that file name> [--chromium <path>]
//        [--out <folder for screenshots>]
//
// Playwright: the global `playwright` package or `playwright-core` (PLAYWRIGHT_MODULE) with Playwright's own
// Chromium (--chromium).

import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const PROJECT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, value, index, all) => {
    if (value.startsWith('--')) pairs.push([value.slice(2), all[index + 1]?.startsWith('--') ? true : all[index + 1] ?? true])
    return pairs
  }, []),
)
const URL = args.url ?? 'http://127.0.0.1:8192'
const OUT = path.resolve(args.out ?? path.join(PROJECT, '.browser-check', 'setup'))
fs.mkdirSync(OUT, { recursive: true })

function loadPlaywright() {
  const require = createRequire(import.meta.url)
  for (const name of [process.env.PLAYWRIGHT_MODULE, 'playwright', 'playwright-core'].filter(Boolean)) {
    try {
      return require(name)
    } catch {}
  }
  throw new Error('Playwright not found: npm install -g playwright-core (or set PLAYWRIGHT_MODULE)')
}

const results = []
const record = (check, ok, detail = '') => {
  results.push({ check, ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${check}${detail ? `  - ${detail}` : ''}`)
}

const { chromium } = loadPlaywright()
const browser = await chromium.launch({ ...(args.chromium ? { executablePath: args.chromium } : {}) })
const page = await browser.newPage({ viewport: { width: 1500, height: 950 } })
const errors = []
page.on('console', (message) => {
  if (message.type() === 'error' && /plenio/i.test(message.text())) errors.push(message.text())
})
try {
  // Setup as after an install: its state reset (it opens by itself once per version)
  await fetch(`${URL}/api/plenio/setup/state`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ step: 'computer', templates: [], extras: [], opened_for: '', done: false }),
  })
  await page.goto(URL, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => window.app?.graph, null, { timeout: 120000 })
  // a new user's first visit opens ComfyUI's template browser over everything: closed, as a user would
  const templates = page.locator('[data-dialog-key="global-workflow-template-selector"]')
  if (await templates.waitFor({ timeout: 8000 }).then(() => true, () => false)) await page.keyboard.press('Escape')

  // 1. Setup opens by itself: nothing is installed, so the first song's template lacks files
  const panel = page.locator('.plenio-setup')
  const opened = await panel.waitFor({ timeout: 30000 }).then(() => true, () => false)
  record('opens by itself once', opened)
  if (!opened) throw new Error('Setup did not open')
  await page.screenshot({ path: path.join(OUT, '1-computer.png') })
  record('step 1 names the computer', /no graphics card|GB/.test(await panel.locator('.line').first().innerText()))

  // 2. what the user wants: the first song with cover art
  await panel.getByRole('button', { name: 'Next' }).click()
  await panel.locator('label.choice', { hasText: 'Cover art' }).locator('input').check()
  await panel.getByRole('button', { name: 'Next' }).click()

  // 3. the plan: files, sizes, Download all
  await panel.locator('.row').first().waitFor()
  const rows = await panel.locator('.row').count()
  const total = await panel.locator('.line').first().innerText()
  record('the plan lists files with their total', rows >= 4 && /to download/.test(total), `${rows} rows; ${total}`)
  await page.screenshot({ path: path.join(OUT, '3-plan.png') })
  await panel.getByRole('button', { name: /Download all/ }).click()

  // 4. downloading: progress, then every ungated row verified
  await panel.locator('progress').first().waitFor({ timeout: 20000 })
  record('rows show progress', true)
  await page.screenshot({ path: path.join(OUT, '4-downloading.png') })
  const gatedRow = args.gated ? panel.locator('.row', { hasText: args.gated }) : null
  await page.waitForFunction(
    (gated) =>
      [...document.querySelectorAll('.plenio-setup .row')].every((row) => {
        const text = row.textContent ?? ''
        return text.includes('Installed') || (gated && text.includes(gated) && text.includes('Needs you'))
      }),
    args.gated ?? null,
    { timeout: 240000 },
  )
  const installed = await panel.locator('.row', { hasText: 'Installed' }).count()
  record('every file arrives verified', installed === rows - (args.gated ? 1 : 0), `${installed} of ${rows} installed`)
  await page.screenshot({ path: path.join(OUT, '4-done.png') })

  // the gated file: Needs you → What to do → the three steps, the first one open
  if (gatedRow) {
    record('the gated file needs the user', await gatedRow.locator('.state.warn').isVisible())
    await gatedRow.getByRole('button', { name: 'What to do' }).click()
    const dialog = page.locator('.plenio-access')
    await dialog.waitFor()
    await page.waitForFunction(() => document.querySelector('.plenio-access .mark')?.textContent === '✕', null, { timeout: 20000 })
    const text = await dialog.innerText()
    record('the access dialog leads through the three steps', /accept its terms/.test(text) && /token/.test(text) && /Check and download/.test(text))
    await page.screenshot({ path: path.join(OUT, '5-access.png') })
    await dialog.getByRole('button', { name: 'Close' }).click()
  }

  // the files are where ComfyUI looks: the plan says so after a refresh
  const plan = await page.evaluate(async () => (await (await fetch('/api/plenio/setup/plan')).json()))
  const song = plan.templates.find((t) => t.template === '1 · YuE2 · Song')
  const expected = song.picks.filter((p) => !p.optional && p.file !== args.gated)
  record('the plan counts the files as installed', expected.every((p) => p.installed), expected.map((p) => `${p.file}: ${p.installed}`).join(', '))
  record('no Plenio error in the console', errors.length === 0, errors.slice(0, 3).join(' | '))
} catch (error) {
  record('the check ran through', false, String(error?.message ?? error))
  await page.screenshot({ path: path.join(OUT, 'failure.png') }).catch(() => {})
} finally {
  await browser.close()
  fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(results, null, 1))
  const failed = results.filter((r) => !r.ok).length
  console.log(`${results.length - failed}/${results.length} passed`)
  process.exitCode = failed ? 1 : 0
}
