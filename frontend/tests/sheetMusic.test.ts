/**
 * Export Release's sheet music (owner's request 2026-10-08): a page draws the PDF the export reserved and
 * posts it back - from every execution it hears of, whichever workflow it shows, and the jobs still waiting
 * when it opens again (owner's report 2026-10-09: no PDF when the run ended while another workflow was open).
 */
import { describe, expect, it } from 'vitest'

import { PlenioApiError } from '../src/api/client'
import {
  type SheetMusicHost,
  type SheetMusicJob,
  type SheetMusicOutcome,
  SheetMusicJobs,
  enqueue,
  pendingSheetMusic,
  saveSheetMusic,
  sheetMusicJobs
} from '../src/extension/sheetMusic'

const job: SheetMusicJob = {
  token: 'tok-1',
  file: '2026-10-08 Slow Morning.pdf',
  title: 'Slow Morning',
  paper: 'a4',
  size: 'standard',
  display_abc: 'X:1\nK:C\nC4|\nw: morn-'
}

interface Call {
  route: string
  init?: RequestInit
}

function host(replies: { status: number; body: unknown }[] = [], pending: unknown = { jobs: [] }) {
  const calls: Call[] = []
  const drawn: string[] = []
  const sizes: string[] = []
  const value: SheetMusicHost = {
    fetcher: {
      async fetchApi(route: string, init?: RequestInit) {
        calls.push({ route, init })
        if (route === '/plenio/export/sheet-music/pending') return new Response(JSON.stringify(pending), { status: 200 })
        const reply = replies.shift() ?? { status: 200, body: { file: job.file, bytes: 2048 } }
        return new Response(JSON.stringify(reply.body), { status: reply.status })
      }
    },
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
        { ...job, paper: 'letter', size: 'compact' },
        { token: '', file: 'x.pdf', display_abc: 'X:1' },
        'nonsense',
        { ...job, token: 'tok-2', size: undefined },
        { ...job, token: 'tok-3', size: 'tiny' }
      ]
    }
    const jobs = sheetMusicJobs(output)
    expect(jobs).toHaveLength(3)
    expect(jobs[0]).toEqual({ ...job, paper: 'letter', size: 'compact' })
    // an export from before the size, or an unknown size: the standard size
    expect(jobs.slice(1).map((one) => one.size)).toEqual(['standard', 'standard'])
    expect(sheetMusicJobs({ plenio_summary: [] })).toEqual([])
    expect(sheetMusicJobs(undefined)).toEqual([])
  })

  it('reads the jobs still waiting on the server', async () => {
    const fake = host([], { jobs: [job, { token: 'x' }] })
    expect(await pendingSheetMusic(fake.value.fetcher)).toEqual([job])
    expect(fake.calls[0].route).toBe('/plenio/export/sheet-music/pending')
  })

  it('draws the notation the export sent and posts the PDF with its token', async () => {
    const fake = host()
    const saved = await saveSheetMusic({ ...job, size: 'smaller' }, fake.value)
    expect(saved).toEqual({ file: job.file, bytes: 2048 })
    expect(fake.drawn).toEqual([job.display_abc]) // the lines placed by hand are in it already
    expect(fake.sizes).toEqual(['smaller'])
    const upload = fake.calls[0]
    expect(upload.route).toBe('/plenio/export/sheet-music?token=tok-1')
    expect(upload.init?.method).toBe('POST')
    const sent = new Uint8Array(await (upload.init?.body as Blob).arrayBuffer())
    expect(new TextDecoder().decode(sent)).toBe('%PDF-1.4 fake')
  })

  it('says why the server refused the PDF', async () => {
    const refused = host([{ status: 400, body: { error: { message: 'This sheet music can no longer be saved', hint: 'Export again.' } } }])
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

  it('draws every job once, from an execution or from the waiting list', async () => {
    const other = { ...job, token: 'tok-2', file: 'Other.pdf' }
    const fake = host([], { jobs: [job, other] })
    const outcomes: SheetMusicOutcome[] = []
    const jobs = new SheetMusicJobs(fake.value, (outcome) => outcomes.push(outcome))
    await Promise.all(jobs.take([job]))
    await Promise.all(jobs.take([job])) // the same execution heard twice
    await jobs.recover() // the waiting list still names the first one: only the other is new
    expect(fake.drawn).toHaveLength(2)
    expect(outcomes.map((o) => ('saved' in o ? o.saved.file : 'error'))).toEqual([job.file, job.file])
    expect(fake.calls.filter((c) => c.route.startsWith('/plenio/export/sheet-music?')).map((c) => c.route)).toEqual([
      '/plenio/export/sheet-music?token=tok-1',
      '/plenio/export/sheet-music?token=tok-2'
    ])
  })

  it('stays quiet when another page saved a recovered job first, not when an execution fails', async () => {
    const usedUp = { status: 400, body: { error: { message: 'This sheet music can no longer be saved: ...' } } }
    const fake = host([usedUp, usedUp], { jobs: [job] })
    const outcomes: SheetMusicOutcome[] = []
    const jobs = new SheetMusicJobs(fake.value, (outcome) => outcomes.push(outcome))
    await jobs.recover()
    await Promise.all(jobs.take([{ ...job, token: 'tok-9' }]))
    expect(outcomes.map((o) => ('quiet' in o ? o.quiet : 'saved'))).toEqual([true, false])
  })
})
