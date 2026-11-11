// Make a song with the Plenio Song API and download its files - Node.js 18+ (fetch built in), no packages.
//
//   node make_song.mjs "a night drive through a rainy city" synthwave
//
// PLENIO_API sets another address (default http://127.0.0.1:8188/plenio/api/v1). The guide: docs/api/README.md.

import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const API = (process.env.PLENIO_API ?? 'http://127.0.0.1:8188/plenio/api/v1').replace(/\/$/, '')
const ORIGIN = new URL(API).origin
const FINISHED = ['succeeded', 'failed', 'cancelled']

async function call(method, route, body, headers = {}) {
  const answer = await fetch(API + route, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const data = await answer.json()
  if (!answer.ok) {
    // every error of the API: {"error": {"code", "message", "hint", "field"}}
    const { code, message, hint = '' } = data.error ?? {}
    throw new Error(`${answer.status} ${code}: ${message} ${hint}`.trim())
  }
  return data
}

const [description = 'a summer night at the lake with friends', genre = ''] = process.argv.slice(2)
const about = await call('GET', '')
console.log(`${about.api} ${about.version} · Plenio ${about.plenio} · ComfyUI ${about.comfyui}`)

// the same key again never makes a second song - safe to repeat after a lost answer
let job = await call(
  'POST',
  '/jobs',
  {
    template: 'yue2-song',
    fields: { description, ...(genre ? { genre } : {}), vocals: 'sung', length: 'short (about 1:30)', 'finish.cover_art': true },
    client: { name: 'make_song.mjs' },
  },
  { 'Idempotency-Key': `make-song-${randomUUID()}` },
)
console.log(`job ${job.id}`)

// each request waits up to 30 s for a change: a song takes a handful of them
while (!FINISHED.includes(job.status)) {
  job = await call('GET', `/jobs/${job.id}?wait=30`)
  console.log(job.status, job.queue_position ? `#${job.queue_position} in line` : '', job.stage?.text ?? '')
}
if (job.status !== 'succeeded') {
  console.error('no song:', job.status, job.error?.title ?? '', job.error?.message ?? '')
  process.exit(1)
}

const folder = 'songs'
await mkdir(folder, { recursive: true })
for (const file of job.result.files) {
  const answer = await fetch(ORIGIN + file.url)
  await writeFile(path.join(folder, file.name), Buffer.from(await answer.arrayBuffer()))
  console.log('saved', file.name)
}
