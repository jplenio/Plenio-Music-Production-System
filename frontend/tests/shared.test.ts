import { describe, expect, it } from 'vitest'

import { sheetStateWidget } from '../src/extension/sheetStateWidget'
import type { ComfyNode, ComfyWidget, DOMWidgetOptions } from '../src/shared/comfy'
import { escapeHtml, renderMarkdown } from '../src/shared/markdown'
import { emptyState, parseState, serializeState, summarize } from '../src/shared/sheetState'

describe('markdown', () => {
  it('escapes HTML before formatting', () => {
    expect(escapeHtml('<b>"x"</b>')).toBe('&lt;b&gt;&quot;x&quot;&lt;/b&gt;')
    expect(renderMarkdown('**<img src=x onerror=alert(1)>**')).toBe(
      '<p><strong>&lt;img src=x onerror=alert(1)&gt;</strong></p>'
    )
  })

  it('renders headings, lists, inline code and fenced code', () => {
    const html = renderMarkdown('## Title\n- one `a`\n- two\n\ntext\n```json\n{"a": 1}\n```')
    expect(html).toBe(
      '<h4>Title</h4><ul><li>one <code>a</code></li><li>two</li></ul><p>text</p><pre><code>{&quot;a&quot;: 1}</code></pre>'
    )
  })
})

describe('sheet state', () => {
  it('treats empty values as the default state and refuses malformed ones', () => {
    expect(parseState('')).toEqual(emptyState())
    expect(parseState(undefined)).toEqual(emptyState())
    expect(parseState('{broken')).toBeNull()
    expect(parseState('{"schema":"plenio.sheet_state/2","docs":{}}')).toBeNull()
    expect(parseState(42)).toBeNull()
  })

  it('serialises in document order and keeps approval', () => {
    const text = serializeState({
      schema: 'plenio.sheet_state/1',
      docs: { style: { state: 'manual', text: 'pop' }, lyrics: { state: 'edited', text: 'x', base_sha256: 'a'.repeat(64) } },
      review: { approved_fingerprint: 'f'.repeat(64) }
    })
    expect(Object.keys(JSON.parse(text).docs)).toEqual(['style', 'lyrics'])
    expect(summarize(parseState(text))).toBe('style manual · lyrics edited · approved')
  })

  it('summarises the default and unreadable states', () => {
    expect(summarize(emptyState())).toBe('all documents automatic')
    expect(summarize(null)).toContain('unreadable')
  })
})

describe('sheet state widget', () => {
  function fakeNode() {
    let options: DOMWidgetOptions = {}
    const node = {
      id: 1,
      type: 'PlenioTestWidgetEcho',
      title: 'x',
      properties: {},
      widgets: [] as ComfyWidget[],
      addDOMWidget(name: string, type: string, element: HTMLElement, opts: DOMWidgetOptions = {}) {
        options = opts
        const widget = {
          name,
          type,
          element,
          options: opts as Record<string, unknown>,
          get value() {
            return opts.getValue?.()
          },
          set value(v: unknown) {
            opts.setValue?.(v)
          }
        }
        this.widgets.push(widget)
        return widget
      }
    }
    return { node: node as unknown as ComfyNode, options: () => options }
  }

  it('keeps the value as a string and restores it like a workflow load', () => {
    const { node } = fakeNode()
    const { widget } = sheetStateWidget(node, 'sheet_state', ['PLENIO_SHEET_STATE', { default: '' }], {
      registerExtension() {}
    })
    expect(widget.value).toBe('')
    const saved = '{"schema":"plenio.sheet_state/1","docs":{"lyrics":{"state":"manual","text":"x"}}}'
    widget.value = saved
    expect(widget.value).toBe(saved)
    expect(widget.element?.querySelector('.plenio-sheet-summary')?.textContent).toBe('lyrics manual')
    widget.value = 17
    expect(widget.value).toBe('')
  })
})
