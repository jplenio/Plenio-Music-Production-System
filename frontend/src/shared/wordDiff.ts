/**
 * Word-level difference between a draft and the text that will be used (Song Sheet editor):
 * which words the user changed in an ASR or writer draft. Line breaks are kept as tokens so the
 * result can be shown line by line.
 */

export type DiffOp = 'same' | 'added' | 'removed'

export interface DiffPart {
  op: DiffOp
  text: string
}

export const LINE_BREAK = '\n'

function tokens(text: string): string[] {
  const out: string[] = []
  text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .forEach((line, index) => {
      if (index > 0) out.push(LINE_BREAK)
      out.push(...line.split(/\s+/).filter(Boolean))
    })
  return out
}

/** Longest-common-subsequence diff of the words of ``before`` and ``after`` (adjacent parts merged). */
export function wordDiff(before: string, after: string): DiffPart[] {
  const a = tokens(before)
  const b = tokens(after)
  const rows = a.length + 1
  const cols = b.length + 1
  const lcs: number[] = new Array(rows * cols).fill(0)
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lcs[i * cols + j] = a[i] === b[j] ? lcs[(i + 1) * cols + j + 1] + 1 : Math.max(lcs[(i + 1) * cols + j], lcs[i * cols + j + 1])
    }
  }
  const parts: DiffPart[] = []
  const push = (op: DiffOp, text: string) => {
    const last = parts[parts.length - 1]
    if (last && last.op === op && text !== LINE_BREAK && !last.text.endsWith(LINE_BREAK)) last.text += ` ${text}`
    else parts.push({ op, text })
  }
  let i = 0
  let j = 0
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) {
      push('same', a[i])
      i++
      j++
    } else if (j < b.length && (i >= a.length || lcs[i * cols + j + 1] >= lcs[(i + 1) * cols + j])) {
      push('added', b[j++])
    } else {
      push('removed', a[i++])
    }
  }
  return parts
}

/** Number of words added or removed (line breaks do not count). */
export function changedWords(parts: DiffPart[]): number {
  return parts
    .filter((part) => part.op !== 'same' && part.text !== LINE_BREAK)
    .reduce((count, part) => count + part.text.split(' ').filter(Boolean).length, 0)
}
