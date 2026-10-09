/**
 * The lyrics follow the score's sections (docs/design/score-arrange-design.md §4; templates
 * *1 · YuE2 · Song* and *5 · YuE2 · DAW*). YuE2 sings the lyrics section by section, so a duplicated,
 * moved or deleted section needs the same change in the lyrics of *Song Sheet · Text*.
 *
 * Every section of the score keeps the lyric block of the section it came from: the backend's time
 * map of an edit says where each new section's start was in the old score. A copied section copies
 * its block, a deleted one loses it, a split-off part gets an empty block, a section joined to the one
 * before adds its lines there, and an inserted section brings the lyrics that were copied with it.
 * Pure functions; parsing follows the backend's ``parse_lyrics`` (``[Tag]`` lines, blank lines
 * between sections).
 */
import type { ScoreModelView } from '../../shared/scoreView'

/**
 * Where the lyrics of a score sheet live when another sheet owns them (*Song Sheet · Text*, through
 * ``context_lyrics``): what the editor tells the user and whether it may write them.
 */
export interface LyricsTarget {
  /** The other sheet's title. */
  title: string
  /** Why the lyrics cannot follow (``null``: they can). */
  blocked: string | null
  /** The music model plans this score from those lyrics (*1 · YuE2 · Song*): the score is kept as yours. */
  replans: boolean
  /** The lyrics are this sheet's own document (edits go straight into its Lyrics tab). */
  own?: boolean
}

export interface LyricBlock {
  tag: string
  lines: string[]
}

/** The lyrics as the score's sections see them: one block per model section (``null``: no lyrics). */
export interface LyricsFollow {
  preamble: string[]
  blocks: (LyricBlock | null)[]
}

const TAG = /^\[([^[\]\n]{1,40})\]$/

export function parseLyrics(text: string): { preamble: string[]; blocks: LyricBlock[] } {
  const preamble: string[] = []
  const blocks: LyricBlock[] = []
  let current: LyricBlock | null = null
  for (const raw of text.replace(/\r\n?/g, '\n').split('\n')) {
    const line = raw.trim()
    const match = TAG.exec(line)
    if (match) {
      current = { tag: match[1].trim(), lines: [] }
      blocks.push(current)
    } else if (line) {
      if (current) current.lines.push(line)
      else preamble.push(line)
    }
  }
  return { preamble, blocks }
}

/** A tag or label as the backend compares them: no brackets, no trailing number, lower case. */
export function sectionKey(tag: string): string {
  return tag
    .replace(/^\[|\]$/g, '')
    .trim()
    .replace(/\s*\d+$/, '')
    .toLowerCase()
}

/** The tag a section is written with: its block's own tag when it still fits, else from the label. */
export function tagFor(label: string, block: LyricBlock | null): string {
  if (block && sectionKey(block.tag) === sectionKey(label)) return block.tag
  return label.replace(/(^|[\s-])(\p{L})/gu, (_, gap: string, letter: string) => gap + letter.toUpperCase())
}

function starts(model: ScoreModelView): number[] {
  return model.sections.map((s) => model.measures[s.first_bar - 1]?.onset ?? 0)
}

/**
 * The lyrics laid onto the score's sections, or ``null`` when they do not match (other tags or another
 * number of sections: then nothing can follow, and the lyrics fit shows the difference).
 */
export function followOf(text: string | null | undefined, model: ScoreModelView | null | undefined): LyricsFollow | null {
  if (!text?.trim() || !model) return null
  const lyrics = parseLyrics(text)
  const labelled = model.sections.filter((s) => !s.implicit)
  if (!lyrics.blocks.length || lyrics.blocks.length !== labelled.length) return null
  if (labelled.some((s, i) => sectionKey(s.label) !== sectionKey(lyrics.blocks[i].tag))) return null
  let next = 0
  return { preamble: lyrics.preamble, blocks: model.sections.map((s) => (s.implicit ? null : lyrics.blocks[next++])) }
}

/** The lyrics text for the score's sections (the backend's ``Lyrics.format``). */
export function followText(follow: LyricsFollow, model: ScoreModelView): string {
  const parts = follow.preamble.length ? [follow.preamble.join('\n')] : []
  model.sections.forEach((section, index) => {
    if (section.implicit) return
    const block = follow.blocks[index] ?? null
    parts.push([`[${tagFor(section.label, block)}]`, ...(block?.lines ?? [])].join('\n'))
  })
  return parts.join('\n\n')
}

function timeMapOf(before: ScoreModelView, timeMap: readonly (readonly number[])[] | null | undefined): readonly (readonly number[])[] {
  return timeMap?.length ? timeMap : [[0, before.total, 0]]
}

/**
 * For every section after an edit, the section before it whose words it takes (``-1``: none - inserted, or
 * a part split off a section): ``timeMap`` is the backend's (``[old_start, old_end, new_start]``; none: the
 * time stayed where it was). A moved or copied section takes its own words, as does what is left of a
 * section after its first bars were deleted.
 */
export function followSources(
  before: ScoreModelView,
  after: ScoreModelView,
  timeMap: readonly (readonly number[])[] | null | undefined
): number[] {
  const map = timeMapOf(before, timeMap)
  const oldStarts = starts(before)
  const oldAt = (unit: number): number => {
    let found = -1
    oldStarts.forEach((start, i) => {
      if (start <= unit) found = i
    })
    return found
  }
  const back = (unit: number): number | null => {
    for (const [oldStart, oldEnd, newStart] of map) {
      if (unit >= newStart && unit < newStart + oldEnd - oldStart) return oldStart + unit - newStart
    }
    return null
  }
  const sources: number[] = []
  const within: number[] = []
  starts(after).forEach((start, j) => {
    const old = back(start)
    const source = old === null ? -1 : oldAt(old)
    within.push(source)
    // the section itself (moved or copied), or what is left of it after its first bars were deleted
    sources.push(source >= 0 && old !== null && (old === oldStarts[source] || within[j - 1] !== source) ? source : -1)
  })
  return sources
}

/**
 * The blocks after an edit: ``timeMap`` is the backend's (``[old_start, old_end, new_start]``; none: the
 * time stayed where it was), ``inserted`` gives the lyrics of a section that starts in inserted time.
 */
export function followEdit(
  follow: LyricsFollow,
  before: ScoreModelView,
  after: ScoreModelView,
  timeMap: readonly (readonly number[])[] | null | undefined,
  inserted: (unit: number) => LyricBlock | null = () => null
): LyricsFollow {
  const map = timeMapOf(before, timeMap)
  const oldStarts = starts(before)
  const newStarts = starts(after)
  const back = (unit: number): number | null => {
    for (const [oldStart, oldEnd, newStart] of map) {
      if (unit >= newStart && unit < newStart + oldEnd - oldStart) return oldStart + unit - newStart
    }
    return null
  }
  const copy = (block: LyricBlock | null): LyricBlock | null => (block ? { tag: block.tag, lines: [...block.lines] } : null)
  const sources = followSources(before, after, timeMap)
  const used = new Set(sources.filter((s) => s >= 0))
  const blocks: (LyricBlock | null)[] = newStarts.map((start, j) => {
    if (back(start) === null) return inserted(start)
    return sources[j] >= 0 ? copy(follow.blocks[sources[j]] ?? null) : null // a part split off a section: no words of its own
  })
  // a section that is gone but whose start still sounds inside another one was joined to it
  oldStarts.forEach((start, i) => {
    const lines = follow.blocks[i]?.lines
    if (used.has(i) || !lines?.length) return
    for (const [oldStart, oldEnd, newStart] of map) {
      if (start < oldStart || start >= oldEnd) continue
      const unit = newStart + start - oldStart
      let j = -1
      newStarts.forEach((s, k) => {
        if (s <= unit) j = k
      })
      const target = j >= 0 && newStarts[j] !== unit ? blocks[j] : null
      if (target) blocks[j] = { tag: target.tag, lines: [...target.lines, ...lines] }
    }
  })
  return { preamble: follow.preamble, blocks }
}

// --- editing a line where it is sung (the piano roll's lyrics lane) ------------------------------

function withLine(lines: readonly string[], line: number, text: string): string[] {
  const next = [...lines]
  const value = text.trim()
  if (line >= next.length) {
    if (value) next.push(value)
  } else if (value) next[line] = value
  else next.splice(line, 1)
  return next
}

/**
 * ``text`` with line ``line`` of block ``block`` replaced (``line`` past the end: a new line; an empty
 * ``value`` removes the line). The other lines, the tags and the preamble stay as they were.
 */
export function replaceLine(text: string, block: number, line: number, value: string): string {
  const lyrics = parseLyrics(text)
  const target = lyrics.blocks[block]
  if (!target) return text
  const blocks = lyrics.blocks.map((b, i) => (i === block ? { tag: b.tag, lines: withLine(b.lines, line, value) } : b))
  const parts = lyrics.preamble.length ? [lyrics.preamble.join('\n')] : []
  for (const b of blocks) parts.push([`[${b.tag}]`, ...b.lines].join('\n'))
  return parts.join('\n\n')
}

/** The same edit while the lyrics follow the sections: the block of model section ``section``. */
export function followReplace(follow: LyricsFollow, model: ScoreModelView, section: number, line: number, value: string): LyricsFollow {
  const label = model.sections[section]?.label ?? ''
  const blocks = follow.blocks.map((block, i) => {
    if (i !== section) return block
    const own = block ?? { tag: tagFor(label, null), lines: [] }
    return { tag: own.tag, lines: withLine(own.lines, line, value) }
  })
  return { preamble: follow.preamble, blocks }
}

/** ``text`` with all lines of block ``block`` replaced (a lyrics lane edit that moved or removed lines). */
export function setBlockLines(text: string, block: number, lines: readonly string[]): string {
  const lyrics = parseLyrics(text)
  if (!lyrics.blocks[block]) return text
  const parts = lyrics.preamble.length ? [lyrics.preamble.join('\n')] : []
  lyrics.blocks.forEach((b, i) => parts.push([`[${b.tag}]`, ...(i === block ? lines : b.lines)].join('\n')))
  return parts.join('\n\n')
}

/** The same while the lyrics follow the sections: the block of model section ``section`` gets ``lines``. */
export function followSetLines(follow: LyricsFollow, model: ScoreModelView, section: number, lines: readonly string[]): LyricsFollow {
  const label = model.sections[section]?.label ?? ''
  const blocks = follow.blocks.map((block, i) =>
    i === section ? { tag: (block ?? { tag: tagFor(label, null) }).tag, lines: [...lines] } : block
  )
  return { preamble: follow.preamble, blocks }
}
