// Tutorial 10 · The Song API: songs made by your own programs. The reference (docs/api/index.html, Redoc), then a
// terminal that shows the requests the video really sends to the running ComfyUI and the answers it really gets: the
// API's index, a template's fields, a song ordered, followed with ?wait until it is made, its files downloaded (the
// song plays beside the terminal), its release record turned back into its request, and the ready-made examples.
//
// Recorded against a ComfyUI with Plenio and the models on the graphics card (tools/dev_server.py --gpu): the
// requests go to its own address, the song is made for real; the waits are fast-forwarded in the edit:
//   node tools/tutorials/record.mjs song-api --url http://127.0.0.1:8190

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { FOOT } from './lib/studio.mjs'
import { parseNarration } from './lib/voice.mjs'
import { intro } from './lib/scenes.mjs'

export const meta = {
  name: 'Plenio tutorial 10 - Song API',
  page: true,
}

const HERE = path.dirname(fileURLToPath(import.meta.url))
const PROJECT = path.resolve(HERE, '..', '..')
const API = '/plenio/api/v1'
const NARRATION = parseNarration(path.join(HERE, 'narration', 'song-api.txt')).filter((l) => !l.card)
const norm = (t) => t.toLowerCase().replace(/[’`]/g, "'").replace(/\s+/g, ' ').trim()
function spoken(caption) {
  const line = NARRATION.find((l) => norm(caption).startsWith(norm(l.cue)))
  return line ? line.text.replace(/\[pause:[\d.]+s\]/g, '') : caption
}
async function talk(s, text, min = 0) {
  s.caption(text)
  await s.wait(Math.max(min, 900 + spoken(text).length * 68))
}

// a request from the page (same origin as the API): its status and its JSON (or text)
const call = (page, method, route, body = null, headers = {}) =>
  page.evaluate(
    async ([m, r, b, h]) => {
      const answer = await fetch(r, { method: m, headers: { ...(b ? { 'Content-Type': 'application/json' } : {}), ...h }, body: b ? JSON.stringify(b) : undefined })
      const text = await answer.text()
      let data = text
      try {
        data = JSON.parse(text)
      } catch {}
      return { status: answer.status, data, size: text.length }
    },
    [method, route, body, headers]
  )
const term = (page, fn, ...args) => page.evaluate(([f, a]) => window.term[f](...a), [fn, args])

const STAGES = {
  'reading the brief': 'The fields become the brief',
  'writing the lyrics': 'The writer model writes the lyrics',
  composing: 'Plenio composes the score',
  'singing and playing': 'YuE2 sings and plays it',
  'painting the cover': 'The cover is painted',
  'mastering and saving': 'Mastered and saved',
}

export async function prepare(s) {
  const page = s.page
  const origin = new URL(page.url()).origin
  const serve = (file, type) => (route) => route.fulfill({ status: 200, contentType: type, body: fs.readFileSync(file) })
  await page.route(`${origin}/__tutorial/terminal.html`, serve(path.join(HERE, 'assets', 'api-terminal.html'), 'text/html; charset=utf-8'))
  await page.route(`${origin}/__tutorial/api/index.html`, serve(path.join(PROJECT, 'docs', 'api', 'index.html'), 'text/html; charset=utf-8'))
  await page.route(`${origin}/__tutorial/api/openapi.json`, serve(path.join(PROJECT, 'docs', 'api', 'openapi.json'), 'application/json'))
  await page.goto(`${origin}/__tutorial/api/index.html`, { waitUntil: 'load' })
  await page.waitForSelector('.menu-content, [role="navigation"]', { timeout: 60000 }).catch(() => {})
  await page.waitForTimeout(1500)
}

export default async function songApi(s) {
  let page = s.page
  const origin = new URL(page.url()).origin
  s.card('title', {
    kicker: 'Plenio tutorial',
    title: '<span class="num">10 ·</span> Song API',
    subtitle: 'Songs made by your own programs - one HTTP request',
    foot: FOOT,
  }, 5)
  intro(s, {
    tutorial: 'Tutorial 10 · Song API',
    items: [
      'The API reference',
      'Make a song with one request',
      'Follow it, download its files',
      'Make it again - examples in your language',
    ],
  })

  // --- the reference ---
  s.chapter('The reference')
  await s.rest(500)
  await talk(s, 'The Song API is part of Plenio, on your running ComfyUI. Any program that speaks HTTP can make songs with it.')
  await s.moveTo(700, 500)
  for (let i = 0; i < 6; i++) {
    await page.mouse.wheel(0, 420)
    await s.wait(450)
  }
  await talk(s, 'Its reference lists every call, every answer and every field - and a guide takes you from the first request to the files.')
  const jobsTag = page.locator('[role="navigation"] label, .menu-content label', { hasText: /Jobs|jobs/ }).first()
  if (await jobsTag.count()) await s.click(jobsTag)
  await s.wait(1500)

  // --- the terminal ---
  await page.goto(`${origin}/__tutorial/terminal.html`)
  await page.waitForFunction(() => !!window.term)
  await term(page, 'title', `Song API · ${origin}${API}`)
  s.chapter('What it can make')
  await term(page, 'cmd', `curl ${origin}${API}`)
  const index = await call(page, 'GET', API)
  await term(page, 'out', { api: index.data.api, version: index.data.version, plenio: index.data.plenio, comfyui: index.data.comfyui, templates: (index.data.templates ?? []).map((t) => ({ id: t.id, title: t.title, kind: t.kind })) })
  await talk(s, 'The address of your ComfyUI, and slash plenio, api, v1: its version, Plenio’s, and the templates it can make.')
  await term(page, 'cmd', `curl ${origin}${API}/templates/yue2-song`)
  const template = await call(page, 'GET', `${API}/templates/yue2-song`)
  const fields = template.data.fields ?? []
  const brief = (f) => ({ id: f.id, type: f.type, default: f.default, ...(f.choices ? { choices: [...f.choices.slice(0, 4), `… ${f.choices.length} in all`] } : {}) })
  const pick = ['genre', 'description', 'length', 'vocals'].map((id) => fields.find((f) => f.id === id)).filter(Boolean)
  await term(page, 'out', { id: template.data.id, title: template.data.title, fields: [...pick.map(brief), `… ${fields.length} fields in all`] })
  await talk(s, 'A template’s fields come from the template itself: change the workflow, and the API follows.')

  // --- a song ordered ---
  s.chapter('Make a song')
  await term(page, 'clear')
  const body = {
    template: 'yue2-song',
    fields: { genre: 'synthwave', description: 'a night drive through a rainy city, neon in the puddles', length: 'short (about 1:30)', vocals: 'sung', language: 'English' },
    release: { album: 'Night drives', artist: 'My app' },
    client: { name: 'my-app' },
  }
  const key = `night-drive-${Date.now().toString(36)}`
  await term(page, 'cmd', `curl -X POST ${origin}${API}/jobs \\\n  -H "Content-Type: application/json" -H "Idempotency-Key: ${key}" \\\n  -d '${JSON.stringify(body, null, 1).replace(/\n\s*/g, ' ')}'`, 12)
  const created = await call(page, 'POST', `${API}/jobs`, body, { 'Idempotency-Key': key })
  if (created.status >= 300) throw new Error(`the job was refused: ${JSON.stringify(created.data).slice(0, 400)}`)
  const job = created.data
  await term(page, 'out', { id: job.id, status: job.status, template: job.template, queue_position: job.queue_position ?? null, links: job.links })
  await talk(s, 'Make a song: the template, a few fields, a name for your program. The answer is the job - queued.')
  await talk(s, 'The Idempotency key makes a request safe to send again: the same key never makes a second song.')

  // --- followed until it is made ---
  s.chapter('Follow it')
  await term(page, 'cmd', `curl "${origin}${API}/jobs/${job.id}?wait=30"`)
  await talk(s, 'Follow it with wait: the answer comes the moment something changes - no need to ask every second.')
  let state = job
  let end = s.fast('Waiting in the queue', 3)
  let last = ''
  const seen = new Set()
  const started = Date.now()
  while (!['succeeded', 'failed', 'cancelled'].includes(state.status) && Date.now() - started < 1500 * 1000) {
    const answer = await call(page, 'GET', `${API}/jobs/${job.id}?wait=30`)
    if (answer.status !== 200) continue
    state = answer.data
    const stage = state.stage?.text ?? ''
    const line = `${state.status}${stage ? ` · ${stage}` : ''}`
    if (line !== last) {
      last = line
      await term(page, 'out', { status: state.status, stage: stage || null, progress: state.progress ?? null })
      if (STAGES[stage] && !seen.has(stage)) {
        seen.add(stage)
        end()
        end = s.fast(STAGES[stage], 3)
        s.caption(STAGES[stage])
      }
    }
  }
  end()
  s.caption(null)
  if (state.status !== 'succeeded') throw new Error(`the song ${state.status}: ${JSON.stringify(state.error).slice(0, 300)}`)
  await s.wait(600)
  await talk(s, 'Succeeded - a short song takes a few minutes on this graphics card.')

  // --- the files ---
  s.chapter('The files')
  await term(page, 'clear')
  const files = state.result?.files ?? []
  await term(page, 'out', { status: state.status, result: { title: state.result?.title, files: files.map((f) => ({ name: f.name, url: f.url })) } })
  await talk(s, 'Its files: the audio, the unmastered take, the cover, the subtitles, the sheet music - and the record of how it was made.')
  const flac = files.find((f) => /\.flac$/i.test(f.name) && !/original/i.test(f.name)) ?? files.find((f) => /\.(flac|mp3|wav)$/i.test(f.name))
  const cover = files.find((f) => /\.(jpg|jpeg|png)$/i.test(f.name))
  if (flac) {
    await term(page, 'cmd', `curl -OJ "${origin}${flac.url}"`)
    const size = await page.evaluate((u) => fetch(u).then((r) => r.arrayBuffer()).then((b) => b.byteLength), flac.url)
    await term(page, 'out', `saved ${flac.name} (${(size / 2 ** 20).toFixed(1)} MB)`)
    await talk(s, 'Each with its address: download it, play it, put it on your page.', 2600)
    await term(page, 'song', { title: state.result?.title ?? 'The song', by: 'synthwave · made through the Song API', cover: cover?.url, audio: flac.url, files: files.map((f) => f.name) })
    await s.wait(1200)
    await talk(s, 'Here it is.', 1600)
    await term(page, 'volume', 0.9)
    await s.wait(9000)
    await term(page, 'volume', 0.35)
  }

  // --- again, from its record ---
  s.chapter('Again')
  const record = files.find((f) => /\.plenio\.json$/i.test(f.name))
  if (record) {
    await term(page, 'clear')
    await term(page, 'cmd', `curl -X POST ${origin}${API}/from-record -d @"${record.name}"`, 14)
    const data = await call(page, 'GET', record.url)
    const again = await call(page, 'POST', `${API}/from-record`, data.data)
    const request = again.data?.request ?? again.data
    await term(page, 'out', { template: request?.template, fields: Object.fromEntries(Object.entries(request?.fields ?? {}).slice(0, 5)), documents: Object.keys(request?.documents ?? {}) })
    await talk(s, 'A song’s release record turns back into its request: send it again for a new take - the same words and notes, sung anew.')
  }

  // --- the examples ---
  s.chapter('Your language')
  const example = fs.readFileSync(path.join(PROJECT, 'docs', 'api', 'examples', 'make_song.py'), 'utf8').split('\n').slice(0, 44).join('\n')
  await term(page, 'code', 'docs/api/examples/make_song.py', example)
  await talk(s, 'Ready-made examples in Python, JavaScript and the shell: order a song, follow it, save its files.')
  await talk(s, 'A game, a chat bot, a scene of your smart home - anything that sends HTTP can make a song now.')
  await term(page, 'code', '', '')
  await s.wait(600)

  s.card('end', {
    title: 'Song API',
    lines: ['<b>/plenio/api/v1</b> on your ComfyUI', 'Guide, every field, examples: <b>docs/api</b>', 'Reference: <b>jplenio.github.io/Plenio-Music-Production-System/api/</b>'],
  }, 5)
}
