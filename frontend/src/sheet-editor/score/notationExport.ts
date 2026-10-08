/**
 * The notation as a file (owner's request 2026-10-03): PDF, PNG and SVG of the score as the editor shows
 * it - both voices, chord symbols, sections and the lyrics under the notes - and *Print…* through the
 * browser.
 *
 * abcjs draws the backend's display ABC once more, off screen, black on white and as wide as the paper's
 * text block, one SVG per line of music (``oneSvgPerLine``); the lines are then laid out on pages (a
 * line never splits). The *size* sets how large the music is drawn and so how many bars fit a line
 * (owner's request 2026-10-08: the editor's own scale left 1-2 bars a line and 13 pages a song).
 * From there:
 *
 * - **SVG**: the lines in one vector drawing (the whole score, no pages);
 * - **PNG**: the same, as a picture at twice the screen resolution (for messages and documents);
 * - **PDF**: every page drawn at 300 dpi and written as a grayscale image (``pdf.ts``). A vector PDF
 *   would need the text of chord symbols and lyrics (♯, ♭, any language) as embedded fonts - a font file
 *   of several MB in the editor - so the PDF carries print-quality pages instead; *Print…* (the
 *   browser's dialog, "Save as PDF") gives a vector PDF where one is needed, and MusicXML gives
 *   MuseScore, Sibelius or Dorico the score itself.
 */
import abcjs from 'abcjs'

import type { NotationSize, Paper } from './editorSettings'
import { deflate, pdfDocument } from './pdf'

const PAPER_MM: Record<Paper, [number, number]> = { a4: [210, 297], letter: [215.9, 279.4] }
const MARGIN_MM = 15
const PX_PER_MM = 96 / 25.4
const PDF_DPI = 300
/** Room under the last line of a page for the page number (CSS px). */
const FOOTER_PX = 18

interface SizeSpec {
  /** abcjs's scale (1: the editor's own size). */
  scale: number
  /** The text grows back by this much (it would be too small to read at the music's scale). */
  text: number
  /** abcjs's line breaking: note spacing and the bars it prefers on a line. */
  wrap: { minSpacing: number; maxSpacing: number; preferredMeasuresPerLine: number }
}

/**
 * The notation sizes. Measured on ten sung songs, A4: *large* (the size before 0.4.6) about 1.5 bars a
 * line and 13 pages a song, *standard* 3 bars and 4 pages, *smaller* 3.3 bars and 3 pages, *compact* 3.8
 * bars and 2-3 pages; the lyrics 9.8, 5.9, 5.4 and 4.7 pt high on paper. The sung lines set the width:
 * a run of short notes needs the room of its syllables, so a closer spacing (``minSpacing`` below 1.5)
 * gave a few more bars a line but more syllables touching their neighbours than before (7 %).
 */
export const NOTATION_SIZES: Record<NotationSize, SizeSpec> = {
  large: { scale: 1, text: 1, wrap: { minSpacing: 1.8, maxSpacing: 2.7, preferredMeasuresPerLine: 4 } },
  standard: { scale: 0.6, text: 1, wrap: { minSpacing: 1.5, maxSpacing: 2.4, preferredMeasuresPerLine: 4 } },
  smaller: { scale: 0.5, text: 1.1, wrap: { minSpacing: 1.5, maxSpacing: 2.4, preferredMeasuresPerLine: 5 } },
  compact: { scale: 0.4, text: 1.2, wrap: { minSpacing: 1.5, maxSpacing: 2.3, preferredMeasuresPerLine: 6 } }
}

/** abcjs's text fonts (face, size, weight), grown by the size's ``text``. */
const FONTS: Record<string, [string, number, string]> = {
  titlefont: ['Times New Roman', 20, ''],
  tempofont: ['Times New Roman', 15, 'bold'],
  voicefont: ['Times New Roman', 13, 'bold'],
  gchordfont: ['Helvetica', 12, ''],
  annotationfont: ['Helvetica', 12, ''],
  // plain, not bold: bold lyrics push the notes apart (fewer bars a line)
  vocalfont: ['Times New Roman', 13, '']
}

/** abcjs's ``format`` for a size (none for *large*: the editor's own fonts). */
export function sizeFormat(size: NotationSize): Record<string, string> | undefined {
  if (size === 'large') return undefined
  const { text } = NOTATION_SIZES[size]
  return Object.fromEntries(
    Object.entries(FONTS).map(([name, [face, points, weight]]) => [name, `${face} ${Math.round(points * text)} ${weight}`.trim()])
  )
}

export interface NotationLine {
  svg: SVGSVGElement
  width: number
  height: number
}

/** ``abc`` with ``title`` in its T: field (added after X: when there is none). */
export function withTitle(abc: string, title: string): string {
  const clean = title.replace(/[\r\n%]+/g, ' ').replace(/\s+/g, ' ').trim()
  if (/^T:.*$/m.test(abc)) return abc.replace(/^T:.*$/m, `T:${clean}`)
  return abc.replace(/^(X:.*)$/m, `$1\nT:${clean}`)
}

/** The paper's text block in CSS px. */
export function textBlock(paper: Paper): { width: number; height: number } {
  const [w, h] = PAPER_MM[paper]
  return { width: (w - 2 * MARGIN_MM) * PX_PER_MM, height: (h - 2 * MARGIN_MM) * PX_PER_MM - FOOTER_PX }
}

/** Lines onto pages of ``height``: in order, a page full when the next line does not fit. */
export function paginate<T extends { height: number }>(lines: readonly T[], height: number): T[][] {
  const pages: T[][] = []
  let page: T[] = []
  let used = 0
  for (const line of lines) {
    if (page.length && used + line.height > height) {
      pages.push(page)
      page = []
      used = 0
    }
    page.push(line)
    used += line.height
  }
  if (page.length) pages.push(page)
  return pages
}

/** A file name from the song's title (``score`` without one). */
export function exportName(title: string | null | undefined, extension: string): string {
  const safe = Array.from((title ?? '').trim(), (ch) => (/[\p{L}\p{N} \-_()]/u.test(ch) ? ch : '_'))
    .join('')
    .slice(0, 80)
    .trim()
  return `${safe || 'score'}.${extension}`
}

/**
 * Draw ``abc`` off screen for ``paper`` at ``size``: the lines of music, black on white. ``dispose()``
 * removes the drawing again (call it when done).
 */
export function renderLines(
  abc: string,
  title: string,
  paper: Paper,
  size: NotationSize = 'standard'
): { lines: NotationLine[]; dispose: () => void } {
  const block = textBlock(paper)
  const spec = NOTATION_SIZES[size]
  const format = sizeFormat(size)
  const host = document.createElement('div')
  // laid out (abcjs measures its text) but never seen
  host.style.cssText = `position:fixed;left:-30000px;top:0;width:${Math.ceil(block.width)}px;visibility:hidden;background:#fff;color:#000`
  document.body.appendChild(host)
  try {
    abcjs.renderAbc(host, withTitle(abc, title), {
      oneSvgPerLine: true,
      // the width on paper: abcjs lays a scaled line out on staffwidth / scale
      staffwidth: Math.floor(block.width) - 8,
      scale: spec.scale,
      foregroundColor: '#000000',
      paddingleft: 0,
      paddingright: 0,
      paddingtop: 4,
      paddingbottom: 6,
      wrap: { ...spec.wrap },
      ...(format ? { format } : {})
    })
  } catch (error) {
    host.remove()
    throw error
  }
  const lines = [...host.querySelectorAll('svg')].map((svg) => {
    const box = svg.getBoundingClientRect()
    const drawnWidth = Number.parseFloat(svg.getAttribute('width') ?? '') || box.width / spec.scale
    const drawnHeight = Number.parseFloat(svg.getAttribute('height') ?? '') || box.height / spec.scale
    if (spec.scale !== 1) {
      // abcjs scales a line by a CSS transform, which a standalone copy (file, picture, print) loses:
      // the line gets its size on paper instead, its viewBox (abcjs's: the lines share one coordinate
      // system) maps the drawing onto it
      if (!svg.getAttribute('viewBox')) svg.setAttribute('viewBox', `0 0 ${drawnWidth} ${drawnHeight}`)
      svg.removeAttribute('style')
    }
    const width = drawnWidth * spec.scale
    const height = drawnHeight * spec.scale
    svg.setAttribute('width', String(width))
    svg.setAttribute('height', String(height))
    return { svg: svg as SVGSVGElement, width, height }
  })
  return { lines, dispose: () => host.remove() }
}

const SVG_NS = 'http://www.w3.org/2000/svg'

/** The SVG markup of a line on its own (a standalone document). */
function lineMarkup(line: NotationLine): string {
  const clone = line.svg.cloneNode(true) as SVGSVGElement
  clone.setAttribute('xmlns', SVG_NS)
  clone.setAttribute('width', String(line.width))
  clone.setAttribute('height', String(line.height))
  return new XMLSerializer().serializeToString(clone)
}

/** The lines one under the other, in one SVG document on white. */
export function stackedSvg(lines: readonly NotationLine[], pad = 24): string {
  const width = Math.ceil(Math.max(0, ...lines.map((l) => l.width)) + 2 * pad)
  const height = Math.ceil(lines.reduce((sum, l) => sum + l.height, 0) + 2 * pad)
  let y = pad
  const parts = lines.map((line) => {
    const markup = lineMarkup(line).replace(/^<svg\b/, `<svg x="${pad}" y="${y.toFixed(2)}"`)
    y += line.height
    return markup
  })
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="${SVG_NS}" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    `<rect width="100%" height="100%" fill="#ffffff"/>${parts.join('')}</svg>\n`
  )
}

/** A line as a picture (the browser draws its SVG). */
async function lineImage(line: NotationLine): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(new Blob([lineMarkup(line)], { type: 'image/svg+xml;charset=utf-8' }))
  try {
    const image = new Image()
    image.src = url
    await image.decode()
    return image
  } finally {
    URL.revokeObjectURL(url)
  }
}

function canvasOf(width: number, height: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('This browser cannot draw pictures (no canvas).')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)
  return { canvas, ctx }
}

/** The whole score as one PNG at ``scale`` x the screen size (smaller when the browser's limit needs it). */
export async function notationPng(lines: readonly NotationLine[], scale = 2, pad = 24): Promise<Uint8Array> {
  const width = Math.max(0, ...lines.map((l) => l.width)) + 2 * pad
  const height = lines.reduce((sum, l) => sum + l.height, 0) + 2 * pad
  // browsers draw canvases up to about 32767 px a side
  const s = Math.max(0.5, Math.min(scale, 32000 / height, 32000 / width))
  const { canvas, ctx } = canvasOf(Math.ceil(width * s), Math.ceil(height * s))
  ctx.scale(s, s)
  let y = pad
  for (const line of lines) {
    ctx.drawImage(await lineImage(line), pad, y, line.width, line.height)
    y += line.height
  }
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) throw new Error('The picture could not be made.')
  return new Uint8Array(await blob.arrayBuffer())
}

/** The score on pages of ``paper`` as a PDF (300 dpi pages, page numbers, the title in its information). */
export async function notationPdf(lines: readonly NotationLine[], paper: Paper, title: string): Promise<Uint8Array> {
  const [wMm, hMm] = PAPER_MM[paper]
  const block = textBlock(paper)
  const pages = paginate(lines, block.height)
  const scale = PDF_DPI / 96
  const width = Math.round((wMm / 25.4) * PDF_DPI)
  const height = Math.round((hMm / 25.4) * PDF_DPI)
  const margin = MARGIN_MM * PX_PER_MM
  const out = []
  for (const [index, page] of pages.entries()) {
    const { ctx } = canvasOf(width, height)
    ctx.scale(scale, scale)
    let y = margin
    for (const line of page) {
      ctx.drawImage(await lineImage(line), margin, y, line.width, line.height)
      y += line.height
    }
    if (pages.length > 1) {
      ctx.fillStyle = '#555555'
      ctx.font = '11px serif'
      ctx.textAlign = 'center'
      ctx.fillText(`${index + 1} / ${pages.length}`, (wMm * PX_PER_MM) / 2, hMm * PX_PER_MM - margin / 2)
    }
    const rgba = ctx.getImageData(0, 0, width, height).data
    const gray = new Uint8Array(width * height)
    for (let i = 0, j = 0; j < gray.length; i += 4, j++) gray[j] = Math.round(0.299 * rgba[i] + 0.587 * rgba[i + 1] + 0.114 * rgba[i + 2])
    out.push({ width: (wMm / 25.4) * 72, height: (hMm / 25.4) * 72, image: { width, height, deflated: await deflate(gray) } })
  }
  return pdfDocument(out, { title: title.trim() || 'Score', producer: 'Plenio Music Production System' })
}

/**
 * Print the score on pages of ``paper`` through the browser (its dialog also saves a vector PDF): a
 * hidden frame holds the pages and goes away after printing.
 */
export function printNotation(lines: readonly NotationLine[], paper: Paper, title: string): void {
  const block = textBlock(paper)
  const pages = paginate(lines, block.height)
  const frame = document.createElement('iframe')
  frame.setAttribute('aria-hidden', 'true')
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden'
  document.body.appendChild(frame)
  const doc = frame.contentDocument
  const win = frame.contentWindow
  if (!doc || !win) {
    frame.remove()
    throw new Error('The browser did not allow printing from the editor.')
  }
  const size = paper === 'a4' ? 'A4' : 'letter'
  const escape = (text: string) => text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string)
  const body = pages
    .map(
      (page, index) =>
        `<section class="page">${page.map(lineMarkup).join('')}${pages.length > 1 ? `<footer>${index + 1} / ${pages.length}</footer>` : ''}</section>`
    )
    .join('')
  doc.open()
  doc.write(
    `<!doctype html><html><head><meta charset="utf-8"><title>${escape(title.trim() || 'Score')}</title><style>` +
      `@page{size:${size} portrait;margin:${MARGIN_MM}mm}html,body{margin:0;background:#fff}` +
      `.page{break-after:page;position:relative;height:${(PAPER_MM[paper][1] - 2 * MARGIN_MM).toFixed(1)}mm}` +
      `.page:last-child{break-after:auto}svg{display:block}` +
      `footer{position:absolute;bottom:0;left:0;right:0;text-align:center;font:9pt serif;color:#555}` +
      `</style></head><body>${body}</body></html>`
  )
  doc.close()
  const done = () => setTimeout(() => frame.remove(), 1000)
  win.addEventListener('afterprint', done, { once: true })
  // a browser without afterprint: the frame goes after a minute
  setTimeout(() => frame.isConnected && frame.remove(), 60000)
  win.focus()
  win.print()
}
