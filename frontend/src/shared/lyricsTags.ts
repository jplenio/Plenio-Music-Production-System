/**
 * Section tags of a lyrics document (Phase 11C D7). YuE2 sings section by section, and the lyrics'
 * tags and the score's `% section` lines must match; these helpers are the editor's small
 * insert-only convenience, nothing more (the checks live in the backend).
 */

/** The tag buttons of the lyrics editor when the sheet names no engine: the sections YuE2 learned
 * (``plenio/core/engines/yue2.py`` ``MODEL_SECTIONS``; ``Interlude`` and ``Instrumental`` are sections without
 * words). A sheet with an engine names the engine's own (``model_tags``, ``section_tags``). */
export const SECTION_TAGS = ['Intro', 'Verse', 'Pre-Chorus', 'Chorus', 'Bridge', 'Interlude', 'Instrumental', 'Outro'] as const

/** The other tags Plenio knows (YuE2 ``TAG_VOCABULARY`` beyond its own sections): sung on a related section's
 * melody, or - without words - an instrumental part. */
export const MORE_TAGS = ['Post-Chorus', 'Hook', 'Refrain', 'Solo', 'Break', 'Breakdown', 'Drop', 'Build'] as const

/** Sections without words: the editor says so in their button's title. */
const WORDLESS = new Set(['intro', 'interlude', 'instrumental', 'solo', 'break', 'outro'])

/** At most this many tags of one's own as buttons, each at most ``OWN_TAG_LENGTH`` characters (a tag typed in the
 * lyrics may be longer). */
export const MAX_OWN_TAGS = 30
export const OWN_TAG_LENGTH = 40

/** A tag of one's own as typed - ``[Violin Rise]``, ``Violin Rise`` - as it is kept: one line, no brackets, at most
 * ``OWN_TAG_LENGTH`` characters (``null``: nothing left). */
export function ownTag(text: string): string | null {
  const tag = text.replace(/[[\]\r\n]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, OWN_TAG_LENGTH).trim()
  return tag || null
}

/** The tags of one's own as kept, cleaned: each once (case does not count), none the editor offers anyway
 * (``offered``), at most ``MAX_OWN_TAGS``. */
export function ownTags(raw: unknown, offered: readonly string[] = []): string[] {
  if (!Array.isArray(raw)) return []
  const seen = new Set(offered.map((tag) => tag.toLowerCase()))
  const out: string[] = []
  for (const item of raw) {
    const tag = typeof item === 'string' ? ownTag(item) : null
    if (!tag || seen.has(tag.toLowerCase())) continue
    seen.add(tag.toLowerCase())
    out.push(tag)
    if (out.length === MAX_OWN_TAGS) break
  }
  return out
}

/** A tag button's title. */
export function tagTitle(tag: string, learned: boolean): string {
  const wordless = WORDLESS.has(tag.toLowerCase())
  const what = wordless ? 'usually without words - an instrumental part' : 'sung: its words beneath it'
  return learned
    ? `Insert [${tag}] at the cursor - a section YuE2 learned (${what})`
    : `Insert [${tag}] at the cursor - ${wordless ? 'without words: an instrumental part' : 'with words it is sung on a related section\'s melody, without words it is an instrumental part'}`
}

/**
 * ``text`` with the section tag inserted as its own line at ``at`` (the cursor; GitHub issue #3: the tags
 * were appended at the end). A cursor inside a line breaks it there; a blank line goes before the tag when
 * the line before it has words, as between sections. Nothing is removed - a selection stays, the tag goes
 * before it. ``caret`` is where the first line of the new section begins.
 */
export function insertTag(text: string, tag: string, at: number = text.length): { text: string; caret: number } {
  const cut = Math.max(0, Math.min(at, text.length))
  let before = text.slice(0, cut)
  let after = text.slice(cut)
  if (before && !before.endsWith('\n')) {
    // inside or at the end of a line: break it here
    before = before.replace(/[ \t]+$/, '') + '\n'
    after = after.replace(/^[ \t]+/, '')
  }
  const lines = before.split('\n')
  const previous = lines.length >= 2 ? lines[lines.length - 2] : ''
  const gap = previous.trim() ? '\n' : ''
  const line = `[${tag}]`
  const caret = before.length + gap.length + line.length + 1
  return { text: `${before}${gap}${line}${after.startsWith('\n') ? '' : '\n'}${after}`, caret }
}
