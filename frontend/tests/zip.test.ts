/** Save the files of a shared player: the ZIP made in the browser, and the files' names in it. */
import { describe, expect, it } from 'vitest'

import type { SongSummary } from '../src/player/api'
import { fileNames } from '../src/player/portableExport'
import { crc32, makeZip, safeName, uniqueNames } from '../src/player/zip'

const text = (s: string): Blob => new Blob([new TextEncoder().encode(s)])

/** The files back out of a ZIP, read as an unzip program reads it: from the central directory. */
async function unzip(blob: Blob): Promise<{ name: string; data: string; crc: number; flags: number }[]> {
  const bytes = new Uint8Array(await blob.arrayBuffer())
  const view = new DataView(bytes.buffer)
  const end = bytes.length - 22
  expect(view.getUint32(end, true)).toBe(0x06054b50)
  const count = view.getUint16(end + 10, true)
  let at = view.getUint32(end + 16, true)
  const files = []
  for (let k = 0; k < count; k++) {
    expect(view.getUint32(at, true)).toBe(0x02014b50)
    const flags = view.getUint16(at + 8, true)
    const crc = view.getUint32(at + 16, true)
    const size = view.getUint32(at + 20, true)
    const nameLength = view.getUint16(at + 28, true)
    const offset = view.getUint32(at + 42, true)
    const name = new TextDecoder().decode(bytes.subarray(at + 46, at + 46 + nameLength))
    expect(view.getUint32(offset, true)).toBe(0x04034b50)
    const start = offset + 30 + view.getUint16(offset + 26, true)
    const data = bytes.subarray(start, start + size)
    expect(crc32(data)).toBe(crc)
    files.push({ name, data: new TextDecoder().decode(data), crc, flags })
    at += 46 + nameLength
  }
  return files
}

describe('a ZIP made in the browser', () => {
  it('computes the CRC-32 as ZIP has it, also in pieces', () => {
    const hello = new TextEncoder().encode('hello')
    expect(crc32(hello)).toBe(0x3610a686)
    expect(crc32(hello.subarray(2), crc32(hello.subarray(0, 2)))).toBe(0x3610a686)
  })

  it('holds the files as they are, under UTF-8 names', async () => {
    const zip = await makeZip([
      { name: 'Party/01 Über den Wolken.mp3', data: text('sound one') },
      { name: 'Party/01 Über den Wolken.jpg', data: text('') },
      { name: 'Party/02 夜.pdf', data: text('%PDF sheet') },
    ])
    expect(zip.type).toBe('application/zip')
    const files = await unzip(zip)
    expect(files.map((f) => f.name)).toEqual(['Party/01 Über den Wolken.mp3', 'Party/01 Über den Wolken.jpg', 'Party/02 夜.pdf'])
    expect(files.map((f) => f.data)).toEqual(['sound one', '', '%PDF sheet'])
    expect(files.every((f) => f.flags & 0x0800)).toBe(true)
  })

  it('says when it would be too large instead of making a broken file', async () => {
    const huge = { size: 0xffffffff } as Blob
    await expect(makeZip([{ name: 'a.mp3', data: huge }])).rejects.toThrow(/4 GB/)
  })
})

describe('the names of the files saved', () => {
  it('leaves out what a file name may not hold and makes every name its own', () => {
    expect(safeName('AC/DC: "Live" <2026>?')).toBe('AC-DC- -Live- -2026-')
    expect(safeName(' .. ')).toBe('file')
    expect(uniqueNames(['Song.mp3', 'song.mp3', 'Song.mp3', 'Other'])).toEqual(['Song.mp3', 'song (2).mp3', 'Song (3).mp3', 'Other'])
  })

  it('numbers the files in the order shared, and only the kinds a song has', () => {
    const songs = [
      { id: 'a', title: 'Opening', has: { cover: true, pdf: false } },
      { id: 'b', title: 'Opening', has: { cover: false, pdf: true } },
    ] as unknown as SongSummary[]
    expect(fileNames(songs, ['audio', 'cover', 'pdf'], true).map((f) => f.name)).toEqual(['01 Opening.mp3', '01 Opening.jpg', '02 Opening.mp3', '02 Opening.pdf'])
    expect(fileNames(songs, ['audio'], false).map((f) => f.name)).toEqual(['Opening.mp3', 'Opening (2).mp3'])
  })
})
