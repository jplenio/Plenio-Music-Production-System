/**
 * Minimal, safe Markdown rendering for node summaries (headings, lists, bold,
 * inline code, fenced code). Everything is escaped first; no HTML passes through.
 */

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function inline(text: string): string {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
}

export function renderMarkdown(source: string): string {
  const out: string[] = []
  let list = false
  let code: string[] | null = null
  const closeList = () => {
    if (list) {
      out.push('</ul>')
      list = false
    }
  }
  for (const line of source.replace(/\r\n?/g, '\n').split('\n')) {
    if (code !== null) {
      if (line.startsWith('```')) {
        out.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`)
        code = null
      } else {
        code.push(line)
      }
      continue
    }
    if (line.startsWith('```')) {
      closeList()
      code = []
      continue
    }
    const heading = /^(#{1,4})\s+(.*)$/.exec(line)
    if (heading) {
      closeList()
      const level = Math.min(heading[1].length + 2, 6)
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`)
      continue
    }
    const item = /^\s*[-*]\s+(.*)$/.exec(line)
    if (item) {
      if (!list) {
        out.push('<ul>')
        list = true
      }
      out.push(`<li>${inline(item[1])}</li>`)
      continue
    }
    closeList()
    if (line.trim()) out.push(`<p>${inline(line)}</p>`)
  }
  closeList()
  if (code !== null) out.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`)
  return out.join('')
}
