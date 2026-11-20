/**
 * The files a shared player carries, saved out of it: each song's sound (MP3 or M4A), its cover and its sheet
 * music - one by one from a song's page, or many at once as a ZIP (*Save the files*). The files are those inside
 * the HTML file, as they are: nothing is made again.
 */
import type { SongSummary } from './api'
import { ensureMedia, portable } from './portable'
import { makeZip, safeName, uniqueNames, type ZipEntry } from './zip'

export type FileKind = 'audio' | 'cover' | 'pdf'
export const FILE_KINDS: { kind: FileKind; label: string }[] = [
  { kind: 'audio', label: 'the sound' },
  { kind: 'cover', label: 'the covers' },
  { kind: 'pdf', label: 'the sheet music' },
]

/** The sound's file ending in this shared player: ``m4a`` for AAC, else ``mp3``. */
export function soundEnding(): string {
  return portable?.codec === 'aac' ? 'm4a' : 'mp3'
}

const ENDINGS: Record<FileKind, () => string> = { audio: soundEnding, cover: () => 'jpg', pdf: () => 'pdf' }

/** Whether the song carries a file of this kind. */
export function carries(song: SongSummary, kind: FileKind): boolean {
  return kind === 'audio' ? true : !!song.has?.[kind]
}

/** A song's file as a Blob (waits while a large file is still read), or null when it has none. */
export async function songFile(id: string, kind: FileKind): Promise<Blob | null> {
  const url = await ensureMedia(id, kind)
  if (!url) return null
  return (await fetch(url)).blob()
}

/** The names the files get in the ZIP: ``01 Title.mp3`` when numbered (the order shared), else ``Title.mp3``. */
export function fileNames(songs: SongSummary[], kinds: FileKind[], numbered: boolean): { id: string; kind: FileKind; name: string }[] {
  const width = String(songs.length).length
  const wanted = songs.flatMap((song, k) =>
    kinds
      .filter((kind) => carries(song, kind))
      .map((kind) => {
        const title = safeName(song.title || 'song')
        const stem = numbered ? `${String(k + 1).padStart(Math.max(2, width), '0')} ${title}` : title
        return { id: song.id, kind, name: `${stem}.${ENDINGS[kind]()}` }
      }),
  )
  const unique = uniqueNames(wanted.map((w) => w.name))
  return wanted.map((w, k) => ({ ...w, name: unique[k] }))
}

/** The ZIP of the songs' files of these kinds, in a folder named after the shared player. */
export async function zipOf(
  songs: SongSummary[],
  kinds: FileKind[],
  numbered: boolean,
  progress: (done: number, total: number) => void = () => {},
): Promise<{ blob: Blob; name: string; files: number }> {
  const folder = safeName(portable?.title || 'Plenio songs')
  const names = fileNames(songs, kinds, numbered)
  const entries: ZipEntry[] = []
  for (let k = 0; k < names.length; k++) {
    const { id, kind, name } = names[k]
    const data = await songFile(id, kind)
    if (data) entries.push({ name: `${folder}/${name}`, data })
    progress(k + 1, names.length * 2)
  }
  const blob = await makeZip(entries, (done, total) => progress(names.length + Math.round((done / total) * names.length), names.length * 2))
  return { blob, name: `${folder}.zip`, files: entries.length }
}
