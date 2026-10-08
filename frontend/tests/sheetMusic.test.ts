/**
 * Export Release's sheet music (owner's request 2026-10-08): the browser draws the PDF the export reserved
 * and posts it back - with the lyrics lines placed by hand on the Song Sheet, when there are any.
 */
import { describe, expect, it } from 'vitest'

import { PlenioApiError } from '../src/api/client'
import {
  type SheetMusicHost,
  type SheetMusicJob,
  enqueue,
  handPlaced,
  notationOf,
  saveSheetMusic,
  sheetMusicJobs
} from '../src/extension/sheetMusic'

const job: SheetMusicJob = {
  token: 'tok-1',
  file: '2026-10-08 Slow Morning.pdf',
  title: 'Slow Morning',
  paper: 'a4',
  size: 'standard',
  abc: 'X:1\nK:C\nC4|',
  lyrics: '[verse]\nmorning light',
  display_abc: 'X:1\nK:C\nC4|\nw: morn-',
  score_sheet: '12',
  lyrics_sheet: '7'
}

interface Call {
  route: string
  init?: RequestInit
}

function host(properties: Record<string, unknown> = {}, reply = { status: 200, body: { file: job.file, bytes: 2048 } as unknown }) {
  const calls: Call[] = []
  const drawn: string[] = []
  const sizes: string[] = []
  const value: SheetMusicHost = {
    fetcher: {
      async fetchApi(route: string, init?: RequestInit) {
        calls.push({ route, init })
        if (route === '/plenio/score/analyze') {
          return new Response(JSON.stringify({ ok: true, display_abc: 'X:1\nK:C\nC4|\nw: placed' }), { status: 200 })
        }
        return new Response(JSON.stringify(reply.body), { status: reply.status })
      }
    },
    property: (id) => properties[id],
    async draw(abc, _title, _paper, size) {
      drawn.push(abc)
      sizes.push(size)
      return new TextEncoder().encode('%PDF-1.4 fake')
    }
  }
  return { value, calls, drawn, sizes }
}

describe('sheet music of an export', () => {
  it('reads the jobs of an executed Export Release and drops broken ones', () => {
    const output = {
      plenio_notation: [
        { ...job, paper: 'letter', size: 'compact', score_sheet: 12 },
        { token: '', file: 'x.pdf', display_abc: 'X:1' },
        'nonsense',
        { ...job, token: 'tok-2', size: undefined },
        { ...job, token: 'tok-3', size: 'tiny' }
      ]
    }
    const jobs = sheetMusicJobs(output)
    expect(jobs).toHaveLength(3)
    expect(jobs[0]).toMatchObject({ token: 'tok-1', paper: 'letter', size: 'compact', score_sheet: '12', lyrics_sheet: '7' })
    // an export from before the size, or an unknown size: the standard size
    expect(jobs.slice(1).map((one) => one.size)).toEqual(['standard', 'standard'])
    expect(sheetMusicJobs({ plenio_summary: [] })).toEqual([])
    expect(sheetMusicJobs(undefined)).toEqual([])
  })

  it('takes the lyrics lines placed by hand from the score sheet first, then from the lyrics sheet', () => {
    expect(handPlaced(job, { property: (id) => ({ '7': [[0, 8]] })[id] })).toEqual([[0, 8]])
    expect(handPlaced(job, { property: (id) => ({ '12': [[4, 16]], '7': [[0, 8]] })[id] })).toEqual([[4, 16]])
    expect(handPlaced(job, { property: () => 'broken' })).toEqual([])
  })

  it('draws the notation as the editor shows it', async () => {
    const plain = host()
    expect(await notationOf(job, plain.value)).toBe(job.display_abc)
    expect(plain.calls).toHaveLength(0) // Plenio's own placement came with the job
    const placed = host({ '12': [[0, 8]] })
    expect(await notationOf(job, placed.value)).toBe('X:1\nK:C\nC4|\nw: placed')
    const body = JSON.parse(String(placed.calls[0].init?.body))
    expect(body).toMatchObject({ abc: job.abc, lyrics: job.lyrics, lyric_spans: [[0, 8]] })
  })

  it('posts the PDF with the export token and reports the saved file', async () => {
    const fake = host()
    const saved = await saveSheetMusic({ ...job, size: 'smaller' }, fake.value)
    expect(saved).toEqual({ file: job.file, bytes: 2048 })
    expect(fake.drawn).toEqual([job.display_abc])
    expect(fake.sizes).toEqual(['smaller'])
    const upload = fake.calls[0]
    expect(upload.route).toBe('/plenio/export/sheet-music?token=tok-1')
    expect(upload.init?.method).toBe('POST')
    const sent = new Uint8Array(await (upload.init?.body as Blob).arrayBuffer())
    expect(new TextDecoder().decode(sent)).toBe('%PDF-1.4 fake')
  })

  it("says why the server refused the PDF", async () => {
    const refused = host({}, { status: 400, body: { error: { message: 'This sheet music can no longer be saved', hint: 'Export again.' } } })
    const error = await saveSheetMusic(job, refused.value).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(PlenioApiError)
    expect((error as PlenioApiError).message).toContain('can no longer be saved')
    expect((error as PlenioApiError).hint).toBe('Export again.')
  })

  it('draws a batch one PDF after the other, also after a failure', async () => {
    const order: string[] = []
    const slow = (name: string, ms: number, fail = false) => () =>
      new Promise<string>((resolve, reject) =>
        setTimeout(() => {
          order.push(name)
          if (fail) reject(new Error(name))
          else resolve(name)
        }, ms)
      )
    const first = enqueue(slow('first', 30, true))
    const second = enqueue(slow('second', 1))
    await expect(first).rejects.toThrow('first')
    await expect(second).resolves.toBe('second')
    expect(order).toEqual(['first', 'second'])
  })
})
