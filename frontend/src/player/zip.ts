/**
 * A ZIP of files, made in the browser (the shared player's *Save the files*): the files stored as they are (no
 * compression - MP3, M4A, JPEG and PDF are compressed already), so the archive is a Blob of the files' own Blobs
 * and a few headers - nothing is copied, a large archive needs no memory of its own. File names in UTF-8.
 * Up to 65535 files and 4 GB (no ZIP64): more is said, and saved in smaller sets.
 */

export interface ZipEntry {
  name: string
  data: Blob
}

export const ZIP_LIMIT = 0xffffffff
export const ZIP_FILES = 0xffff

const TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  return table
})()

/** The CRC-32 of the bytes (as ZIP and PNG have it), going on from ``crc`` (a file read in pieces). */
export function crc32(bytes: Uint8Array, crc = 0): number {
  let c = ~crc >>> 0
  for (let i = 0; i < bytes.length; i++) c = TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8)
  return ~c >>> 0
}

async function crcOf(blob: Blob): Promise<number> {
  let crc = 0
  const step = 8 * 2 ** 20
  for (let at = 0; at < blob.size; at += step) crc = crc32(new Uint8Array(await blob.slice(at, at + step).arrayBuffer()), crc)
  return crc
}

function dosTime(when: Date): [number, number] {
  const time = (when.getHours() << 11) | (when.getMinutes() << 5) | Math.floor(when.getSeconds() / 2)
  const date = (Math.max(0, when.getFullYear() - 1980) << 9) | ((when.getMonth() + 1) << 5) | when.getDate()
  return [time, date]
}

/** A file name safe on every system: no folder separators or characters Windows refuses, not empty. */
export function safeName(name: string): string {
  const clean = name.replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '-').replace(/^[\s.]+|[\s.]+$/g, '').slice(0, 150)
  return clean || 'file'
}

/** The names made unique as they come: a second ``Song.mp3`` is ``Song (2).mp3``. */
export function uniqueNames(names: string[]): string[] {
  const seen = new Set<string>()
  return names.map((name) => {
    let candidate = name
    const dot = name.lastIndexOf('.')
    const [stem, ext] = dot > 0 ? [name.slice(0, dot), name.slice(dot)] : [name, '']
    for (let k = 2; seen.has(candidate.toLowerCase()); k++) candidate = `${stem} (${k})${ext}`
    seen.add(candidate.toLowerCase())
    return candidate
  })
}

/** The ZIP of the entries; ``progress(done, total)`` after each file. Throws when it would be too large. */
export async function makeZip(entries: ZipEntry[], progress: (done: number, total: number) => void = () => {}, when = new Date()): Promise<Blob> {
  if (entries.length > ZIP_FILES) throw new Error(`More than ${ZIP_FILES} files: save fewer at a time`)
  const total = entries.reduce((t, e) => t + e.data.size, 0) + entries.length * 200
  if (total >= ZIP_LIMIT) throw new Error('More than 4 GB: save fewer songs at a time (a playlist, the favourites) or the songs one by one')
  const encoder = new TextEncoder()
  const [time, date] = dosTime(when)
  const parts: BlobPart[] = []
  const central: Uint8Array<ArrayBuffer>[] = []
  let offset = 0
  for (let k = 0; k < entries.length; k++) {
    const { name, data } = entries[k]
    const bytes = encoder.encode(name)
    const crc = await crcOf(data)
    const local = new DataView(new ArrayBuffer(30))
    local.setUint32(0, 0x04034b50, true)
    local.setUint16(4, 20, true)
    local.setUint16(6, 0x0800, true) // the name in UTF-8
    local.setUint16(8, 0, true) // stored
    local.setUint16(10, time, true)
    local.setUint16(12, date, true)
    local.setUint32(14, crc, true)
    local.setUint32(18, data.size, true)
    local.setUint32(22, data.size, true)
    local.setUint16(26, bytes.length, true)
    local.setUint16(28, 0, true)
    parts.push(local.buffer, bytes, data)
    const entry = new DataView(new ArrayBuffer(46))
    entry.setUint32(0, 0x02014b50, true)
    entry.setUint16(4, 20, true)
    entry.setUint16(6, 20, true)
    entry.setUint16(8, 0x0800, true)
    entry.setUint16(10, 0, true)
    entry.setUint16(12, time, true)
    entry.setUint16(14, date, true)
    entry.setUint32(16, crc, true)
    entry.setUint32(20, data.size, true)
    entry.setUint32(24, data.size, true)
    entry.setUint16(28, bytes.length, true)
    entry.setUint32(42, offset, true)
    const record = new Uint8Array(46 + bytes.length)
    record.set(new Uint8Array(entry.buffer), 0)
    record.set(bytes, 46)
    central.push(record)
    offset += 30 + bytes.length + data.size
    progress(k + 1, entries.length)
  }
  const size = central.reduce((t, c) => t + c.length, 0)
  const end = new DataView(new ArrayBuffer(22))
  end.setUint32(0, 0x06054b50, true)
  end.setUint16(8, entries.length, true)
  end.setUint16(10, entries.length, true)
  end.setUint32(12, size, true)
  end.setUint32(16, offset, true)
  return new Blob([...parts, ...central, end.buffer], { type: 'application/zip' })
}

/** Hand a file to the browser to save (its download), the address let go after a while. */
export function saveBlob(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
