/**
 * What is being made (owner's request 2026-10-18: videos and shared players in the background, one place to see
 * what is being made, and a stop for each). Two lanes, each one job after the other, side by side:
 *  - videos are drawn and encoded by this page (video/make.ts) - they go on while you use the player, also with
 *    the page in the background, but not when it closes (the page asks before it does);
 *  - shared players are made by the player's own server (plenio/player/package.py); this page asks how far they
 *    are, and they go on when the page closes - opened again, it shows them.
 */
import { computed, ref } from 'vue'

import { api, type PackageOptions, type PackageStatus, type SongSummary } from './api'
import { isPortable } from './portable'
import { say } from './store'
import { makeVideo, type VideoOptions } from './video/make'

export type JobState = 'waiting' | 'working' | 'done' | 'error' | 'stopped'

export interface Job {
  id: string
  kind: 'video' | 'package'
  title: string
  /** What it is: the size and the part of a video, the songs and the sound of a shared player. */
  detail: string
  state: JobState
  stage: string
  done: number
  total: number
  /** A video: frames a second against the video's rate; and seconds left. */
  speed: number
  left: number
  file?: string
  /** A shared player in parts: every part's file. */
  files?: { name: string; size: number }[]
  size?: number
  folder?: string
  error?: string
  created: number
  song?: string
}

/** Every job of this session, in the order they were asked for. */
export const jobs = ref<Job[]>([])
export const active = computed(() => jobs.value.filter((j) => j.state === 'waiting' || j.state === 'working'))
export const finished = computed(() => jobs.value.filter((j) => j.state !== 'waiting' && j.state !== 'working'))
/** Videos are made by this page: it should not close while one is waiting or at work. */
export const videosAtWork = computed(() => active.value.some((j) => j.kind === 'video'))

const videoRuns = new Map<string, { song: SongSummary; options: VideoOptions; stop: AbortController }>()
/** A dialog that shows a video's progress sees its frames now and then. */
export const frameWatchers = new Map<string, (canvas: HTMLCanvasElement) => void>()

let made = 0
function add(job: Job): Job {
  jobs.value.push(job)
  // the reactive one, to change as it goes
  return jobs.value[jobs.value.length - 1]
}

const sizeText = (width: number, height: number): string => (width === 3840 ? '4K' : height > width ? `${width} × ${height}, upright` : width === height ? `${width} × ${height}, square` : `${width} × ${height}`)

/** Put a video in the queue (the options as they are now); it starts when the videos before it are made. */
export function queueVideo(song: SongSummary, options: VideoOptions): Job {
  const id = `video-${Date.now().toString(36)}-${made++}`
  const part = options.start > 0 || options.length > 0 ? `${Math.round(options.start)}-${Math.round(options.start + (options.length || song.seconds - options.start))} s` : 'the whole song'
  const job = add({
    id,
    kind: 'video',
    title: song.title,
    detail: `${sizeText(options.width, options.height)} · ${options.fps} fps · ${part}`,
    state: 'waiting',
    stage: '',
    done: 0,
    total: 0,
    speed: 0,
    left: 0,
    created: Date.now(),
    song: song.id,
  })
  videoRuns.set(id, { song, options: JSON.parse(JSON.stringify(options)) as VideoOptions, stop: new AbortController() })
  void runVideos()
  return job
}

let drawing = false
/** Whether a video that failed may succeed when tried again (not: a browser without WebCodecs or the size). */
export function retryable(error: unknown): boolean {
  const text = error instanceof Error ? error.message : String(error)
  return !/cannot encode|WebCodecs|AbortError/i.test(text)
}

/** A video's failure in words a person can act on. */
export function videoError(error: unknown): string {
  const text = error instanceof Error ? error.message : String(error)
  if (/memory|allocation|context lost|Encoding error|EncodingError/i.test(text))
    return `The browser ran out of memory for this video (${text}). Close other tabs, or choose a smaller size or fewer frames a second, and try again.`
  return text
}

/** The videos, one after the other, the oldest first. */
async function runVideos(): Promise<void> {
  if (drawing) return
  drawing = true
  try {
    for (;;) {
      const job = jobs.value.find((j) => j.kind === 'video' && j.state === 'waiting')
      if (!job) break
      const run = videoRuns.get(job.id)
      if (!run) {
        job.state = 'error'
        job.error = 'lost'
        continue
      }
      job.state = 'working'
      try {
        const attempt = () =>
          makeVideo(
            run.song,
            run.options,
            (p) => Object.assign(job, { stage: p.stage, done: p.frame, total: p.total, speed: p.speed, left: p.left }),
            run.stop.signal,
            (canvas) => frameWatchers.get(job.id)?.(canvas)
          )
        let result
        try {
          result = await attempt()
        } catch (error) {
          // once more after a pause (owner's report 2026-10-28: "out of memory" now and then): the first try's
          // memory is given back by then; what this browser cannot do at all fails again at once
          if (run.stop.signal.aborted || !retryable(error)) throw error
          Object.assign(job, { stage: 'Trying again', done: 0 })
          await new Promise((resolve) => setTimeout(resolve, 2500))
          if (run.stop.signal.aborted) throw error
          result = await attempt()
        }
        Object.assign(job, { state: 'done', stage: '', file: result.file, size: result.size, folder: result.folder })
        say(`Video saved: ${result.file}`, 5000)
      } catch (error) {
        if (run.stop.signal.aborted) job.state = 'stopped'
        else Object.assign(job, { state: 'error', error: videoError(error) })
      } finally {
        videoRuns.delete(job.id)
      }
    }
  } finally {
    drawing = false
  }
}

// --- shared players: made by the server, asked how far they are -------------------------------------------

/** Put a shared player in the server's queue. */
export async function queuePackage(options: PackageOptions): Promise<Job> {
  const { job: id } = await api.packageStart(options)
  const job = add({
    id,
    kind: 'package',
    title: options.title || 'Plenio songs',
    detail: `${options.songs.length} ${options.songs.length === 1 ? 'song' : 'songs'} · ${(options.codec ?? 'mp3').toUpperCase()} ${options.bitrate} kbit/s${options.part_mb ? ` · parts of ${options.part_mb} MB` : ''}`,
    state: 'waiting',
    stage: '',
    done: 0,
    total: options.songs.length,
    speed: 0,
    left: 0,
    created: Date.now(),
  })
  watchPackages()
  return job
}

function fromServer(status: PackageStatus): Partial<Job> {
  return { state: status.state, stage: status.stage ?? '', done: status.done, total: status.total, file: status.file, files: status.files, size: status.size, folder: status.folder, error: status.error }
}

let asking: number | undefined
/** Ask the server how its players are coming on, while one waits or is made. */
function watchPackages(): void {
  if (asking !== undefined) return
  asking = window.setInterval(() => void askServer(), 700)
}

async function askServer(): Promise<void> {
  let answer: { jobs: PackageStatus[] }
  try {
    answer = await api.packageJobs()
  } catch {
    return // the player restarts: ask again
  }
  for (const status of answer.jobs) {
    if (!status.job) continue
    const job = jobs.value.find((j) => j.id === status.job)
    if (!job) continue
    const was = job.state
    Object.assign(job, fromServer(status))
    if (was !== 'done' && job.state === 'done') say(`Shared player saved: ${job.file}`, 5000)
  }
  if (!active.value.some((j) => j.kind === 'package')) {
    window.clearInterval(asking)
    asking = undefined
  }
}

/** The server's players made or being made since it started (also before this page was opened). */
export async function loadJobs(): Promise<void> {
  if (isPortable) return
  try {
    const answer = await api.packageJobs()
    for (const status of [...answer.jobs].reverse()) {
      if (!status.job || jobs.value.some((j) => j.id === status.job)) continue
      add({
        id: status.job,
        kind: 'package',
        title: status.title || 'Plenio songs',
        detail: `${status.total} ${status.total === 1 ? 'song' : 'songs'} · ${(status.codec ?? 'mp3').toUpperCase()} ${status.bitrate ?? 192} kbit/s${status.part_mb ? ` · parts of ${status.part_mb} MB` : ''}`,
        state: status.state,
        stage: status.stage ?? '',
        done: status.done,
        total: status.total,
        speed: 0,
        left: 0,
        created: Date.now(),
        file: status.file,
        files: status.files,
        size: status.size,
        folder: status.folder,
        error: status.error,
      })
    }
    if (active.value.some((j) => j.kind === 'package')) watchPackages()
  } catch {
    // an older player without the queue
  }
}

// --- stop, forget ------------------------------------------------------------------------------------------

/** Stop a job: a waiting one never starts, the one at work stops (and leaves no file). */
export async function stopJob(job: Job): Promise<void> {
  if (job.state !== 'waiting' && job.state !== 'working') return
  if (job.kind === 'video') {
    videoRuns.get(job.id)?.stop.abort()
    if (job.state === 'waiting') {
      job.state = 'stopped'
      videoRuns.delete(job.id)
    }
    return
  }
  try {
    await api.packageCancel(job.id)
    if (job.state === 'waiting') job.state = 'stopped'
  } catch (error) {
    say(error instanceof Error ? error.message : String(error), 4000)
  }
}

/** Forget one finished job, or every finished one. */
export function forgetJob(job: Job): void {
  jobs.value = jobs.value.filter((j) => j !== job)
}
export async function forgetFinished(): Promise<void> {
  jobs.value = jobs.value.filter((j) => j.state === 'waiting' || j.state === 'working')
  if (!isPortable) await api.packageClear().catch(() => undefined)
}

/** A short line of where a job is. */
export function progressText(job: Job): string {
  if (job.state === 'waiting') return 'waiting for its turn'
  if (job.state === 'stopped') return 'stopped'
  if (job.state === 'error') return `could not be made: ${job.error ?? ''}`
  if (job.state === 'done') return 'done'
  if (job.kind === 'package') return job.stage === 'reading' ? `reading song ${Math.min(job.done + 1, job.total)} of ${job.total}` : `packing song ${Math.min(job.done + 1, job.total)} of ${job.total}`
  return job.total ? `${job.stage} · frame ${job.done} of ${job.total}` : job.stage || 'starting'
}

/** How far a job is, 0..1. */
export function progressOf(job: Job): number {
  if (job.state === 'done') return 1
  if (!job.total) return 0
  if (job.kind === 'package') return job.stage === 'reading' ? (job.done / job.total) * 0.1 : 0.1 + (job.done / job.total) * 0.9
  return job.done / job.total
}
