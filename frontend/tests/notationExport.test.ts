/**
 * The notation export (owner's request 2026-10-03): the title in the T: field, lines onto pages (a line
 * never splits), file names, and a PDF whose cross-reference table points at every object and whose
 * page images inflate back to the exact pixels.
 */
import { describe, expect, it } from 'vitest'

import { exportName, paginate, textBlock, withTitle } from '../src/sheet-editor/score/notationExport'
import { deflate, pdfDocument, pdfString } from '../src/sheet-editor/score/pdf'

async function inflate(bytes: Uint8Array): Promise<Uint8Array> {
  const copy = new Uint8Array(bytes)
  const stream = new Blob([copy]).stream().pipeThrough(new DecompressionStream('deflate'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

const latin1 = (bytes: Uint8Array): string => Array.from(bytes, (b) => String.fromCharCode(b)).join('')

describe('the notation export', () => {
  it('puts the song title into the T: field', () => {
    expect(withTitle('X:1\nT:\nM:4/4\n', 'Open Window')).toBe('X:1\nT:Open Window\nM:4/4\n')
    expect(withTitle('X:1\nM:4/4\n', 'A % B\nC')).toBe('X:1\nT:A B C\nM:4/4\n') // no comment, one line
  })

  it('lays the lines onto pages without splitting one', () => {
    const lines = [100, 300, 400, 250, 900, 50].map((height, index) => ({ height, index }))
    const pages = paginate(lines, 800)
    expect(pages.map((page) => page.map((line) => line.index))).toEqual([[0, 1, 2], [3], [4], [5]])
    expect(paginate([], 800)).toEqual([])
    // the text block of A4 and Letter (15 mm margins)
    expect(textBlock('a4').width).toBeCloseTo(680.3, 0)
    expect(textBlock('letter').width).toBeGreaterThan(textBlock('a4').width)
    expect(textBlock('letter').height).toBeLessThan(textBlock('a4').height)
  })

  it('names the files after the song', () => {
    expect(exportName('Open Window: Spring?', 'pdf')).toBe('Open Window_ Spring_.pdf')
    expect(exportName('', 'png')).toBe('score.png')
  })
})

describe('the PDF writer', () => {
  it('writes pages whose objects the cross-reference table finds and whose images inflate exactly', async () => {
    const pixels = [new Uint8Array([0, 255, 128, 64, 32, 16]), new Uint8Array([255, 255, 0, 0])]
    const pages = await Promise.all(
      pixels.map(async (gray, index) => ({
        width: 595.28,
        height: 841.89,
        image: { width: index ? 2 : 3, height: 2, deflated: await deflate(gray) }
      }))
    )
    const bytes = pdfDocument(pages, { title: 'Grüße ()', producer: 'Plenio' })
    const text = latin1(bytes)
    expect(text.startsWith('%PDF-1.4\n')).toBe(true)
    expect(text.endsWith('%%EOF\n')).toBe(true)
    const xref = Number(text.match(/startxref\n(\d+)\n%%EOF\n$/)?.[1])
    expect(text.slice(xref, xref + 4)).toBe('xref')
    const entries = [...text.slice(xref).matchAll(/^(\d{10}) 00000 n $/gm)].map((m) => Number(m[1]))
    expect(entries).toHaveLength(3 + pages.length * 3)
    entries.forEach((offset, index) => expect(text.slice(offset).startsWith(`${index + 1} 0 obj\n`)).toBe(true))
    expect(text).toContain('/Count 2')
    expect(text).toContain(`/Title ${pdfString('Grüße ()')}`)
    // each image stream inflates to its pixels
    const streams = [...text.matchAll(/\/Length (\d+) >>\nstream\n/g)]
      .filter((m) => text.slice(0, m.index).lastIndexOf('/Subtype /Image') > text.slice(0, m.index).lastIndexOf('endobj'))
      .map((m) => bytes.slice((m.index ?? 0) + m[0].length, (m.index ?? 0) + m[0].length + Number(m[1])))
    expect(await Promise.all(streams.map(inflate))).toEqual(pixels)
  })

  it('escapes the text of the document information', () => {
    expect(pdfString('A (b) \\ c')).toBe('(A \\(b\\) \\\\ c)')
    expect(pdfString('Ä')).toBe('<FEFF00C4>')
  })
})
