/**
 * Node summaries render pipe tables (the System Check's templates, model files and hardware table were
 * shown as raw "| a | b |" lines) - escaped like everything else.
 */
import { describe, expect, it } from 'vitest'

import { renderMarkdown } from '../src/shared/markdown'

describe('renderMarkdown', () => {
  it('renders a pipe table with a header row', () => {
    const html = renderMarkdown('### Templates\n\n| Template | Model files |\n|---|---|\n| 0 · System Check | all installed |\n| 1 · YuE2 · Song | `x.safetensors` missing |\n\nafter')
    expect(html).toBe(
      '<h5>Templates</h5><table><thead><tr><th>Template</th><th>Model files</th></tr></thead><tbody>' +
        '<tr><td>0 · System Check</td><td>all installed</td></tr><tr><td>1 · YuE2 · Song</td><td><code>x.safetensors</code> missing</td></tr>' +
        '</tbody></table><p>after</p>'
    )
  })

  it('escapes table cells', () => {
    expect(renderMarkdown('| a |\n|---|\n| <b>x</b> |')).toContain('<td>&lt;b&gt;x&lt;/b&gt;</td>')
  })

  it('closes a list before a table', () => {
    expect(renderMarkdown('- one\n| a |\n|---|\n| b |')).toBe('<ul><li>one</li></ul><table><thead><tr><th>a</th></tr></thead><tbody><tr><td>b</td></tr></tbody></table>')
  })
})
