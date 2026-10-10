/**
 * Section tags of a lyrics document (Phase 11C D7). YuE2 sings section by section, and the lyrics'
 * tags and the score's `% section` lines must match; these helpers are the editor's small
 * insert-only convenience, nothing more (the checks live in the backend).
 */

/** The tag buttons of the lyrics editor (all in both engines' tag vocabularies; ``Instrumental`` is a
 * section without words - the plan makes it an interlude). */
export const SECTION_TAGS = ['Intro', 'Verse', 'Pre-Chorus', 'Chorus', 'Bridge', 'Instrumental', 'Outro'] as const

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
