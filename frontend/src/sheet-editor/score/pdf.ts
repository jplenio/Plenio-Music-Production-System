/**
 * A minimal PDF writer for the notation export (owner's request 2026-10-03): pages that each show one
 * full-page grayscale image, losslessly compressed (FlateDecode, the browser's own zlib through
 * ``CompressionStream``). PDF 1.4, a cross-reference table with exact offsets, the title in the
 * document information - what every PDF reader and printer takes. No library: the notation itself is
 * drawn by abcjs, so the PDF only has to carry the pages (see notationExport.ts for why the pages are
 * images).
 */

export interface PdfImagePage {
  /** The page's size in points (1/72 inch). */
  width: number
  height: number
  /** The page's picture: ``pixels`` gray bytes (0 black - 255 white), row by row, zlib-compressed. */
  image: { width: number; height: number; deflated: Uint8Array }
}

/** zlib-compress ``bytes`` (RFC 1950 - what FlateDecode reads). */
export async function deflate(bytes: Uint8Array): Promise<Uint8Array> {
  const copy = new Uint8Array(new ArrayBuffer(bytes.length))
  copy.set(bytes)
  const stream = new Blob([copy]).stream().pipeThrough(new CompressionStream('deflate'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

const encoder = new TextEncoder()

/** A PDF text string: ASCII as a literal (escaped), anything else as UTF-16BE hex with the BOM. */
export function pdfString(text: string): string {
  if (/^[\x20-\x7e]*$/.test(text)) return `(${text.replace(/[\\()]/g, (c) => `\\${c}`)})`
  let hex = 'FEFF'
  for (let i = 0; i < text.length; i++) hex += text.charCodeAt(i).toString(16).padStart(4, '0').toUpperCase()
  return `<${hex}>`
}

const number = (value: number): string => (Math.round(value * 100) / 100).toString()

/** The bytes of a PDF with ``pages`` (in order) and the document information ``info``. */
export function pdfDocument(pages: readonly PdfImagePage[], info: { title?: string; producer?: string } = {}): Uint8Array {
  const chunks: Uint8Array[] = []
  let length = 0
  const offsets: number[] = []
  const push = (part: string | Uint8Array) => {
    const bytes = typeof part === 'string' ? encoder.encode(part) : part
    chunks.push(bytes)
    length += bytes.length
  }
  const object = (id: number, body: string, stream?: Uint8Array) => {
    offsets[id] = length
    if (stream) {
      push(`${id} 0 obj\n${body}\nstream\n`)
      push(stream)
      push('\nendstream\nendobj\n')
    } else push(`${id} 0 obj\n${body}\nendobj\n`)
  }

  // 1 catalog, 2 pages, 3 info, then per page: the page, its content and its image
  const first = 4
  const pageId = (index: number) => first + index * 3
  push('%PDF-1.4\n')
  push(new Uint8Array([0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a])) // a comment of high bytes: the file is binary
  object(1, '<< /Type /Catalog /Pages 2 0 R >>')
  object(2, `<< /Type /Pages /Kids [${pages.map((_, i) => `${pageId(i)} 0 R`).join(' ')}] /Count ${pages.length} >>`)
  const fields = [info.title ? `/Title ${pdfString(info.title)}` : '', `/Producer ${pdfString(info.producer ?? 'Plenio')}`].filter(Boolean)
  object(3, `<< ${fields.join(' ')} >>`)
  pages.forEach((page, index) => {
    const id = pageId(index)
    const content = encoder.encode(`q\n${number(page.width)} 0 0 ${number(page.height)} 0 0 cm\n/Im0 Do\nQ\n`)
    object(
      id,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${number(page.width)} ${number(page.height)}] ` +
        `/Resources << /XObject << /Im0 ${id + 2} 0 R >> >> /Contents ${id + 1} 0 R >>`
    )
    object(id + 1, `<< /Length ${content.length} >>`, content)
    const { width, height, deflated } = page.image
    object(
      id + 2,
      `<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceGray ` +
        `/BitsPerComponent 8 /Filter /FlateDecode /Length ${deflated.length} >>`,
      deflated
    )
  })
  const count = first + pages.length * 3
  const xref = length
  let table = `xref\n0 ${count}\n0000000000 65535 f \n`
  for (let id = 1; id < count; id++) table += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`
  push(table)
  push(`trailer\n<< /Size ${count} /Root 1 0 R /Info 3 0 R >>\nstartxref\n${xref}\n%%EOF\n`)
  const out = new Uint8Array(length)
  let at = 0
  for (const chunk of chunks) {
    out.set(chunk, at)
    at += chunk.length
  }
  return out
}
