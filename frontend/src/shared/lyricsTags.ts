/**
 * Section tags of a lyrics document (Phase 11C D7). YuE2 sings section by section, and the lyrics'
 * tags and the score's `% section` lines must match; these helpers are the editor's small
 * insert-only convenience, nothing more (the checks live in the backend).
 */

export const SECTION_TAGS = ['Intro', 'Verse', 'Pre-Chorus', 'Chorus', 'Bridge', 'Outro'] as const

/** ``text`` with the section tag appended as its own line (unchanged when it is already there). */
export function withTag(text: string, tag: string): string {
  const line = `[${tag}]`
  const trimmed = text.replace(/\s+$/, '')
  if (!trimmed) return `${line}\n`
  if (trimmed.split('\n').some((row) => row.trim() === line)) return text
  return `${trimmed}\n\n${line}\n`
}
