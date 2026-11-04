/**
 * Lyrics lines placed by hand (owner's request 2026-10-03): in the roll's lyrics lane a line is
 * selected, moved, made longer or shorter, deleted, copied and pasted like a note; its span is kept with
 * the sheet and sent with the lyrics, and the Score tab makes each edit one undo step. GitHub issue #28
 * (karaoke and translations, syllables matched to notes by hand): lines never overlap and never push one
 * another - a gesture stops at the neighbouring line -, a new line is typed where the lane is free, and an
 * edit pins every sung line, so that no other line moves.
 * The view comes from the backend (fixtures/tricky-lyrics.json): a part per lyrics block - the empty
 * [Intro] 0-32, the verse 32-160 ("beautiful morning" 32-96, "sing it again" 96-160), the chorus 160-224
 * ("hold on"); L:1/32.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { type App, createApp, h, nextTick } from 'vue'

import type { Fetcher, ScoreOperation } from '../src/api/client'
import type { LyricLayoutView, ScoreModelView, ScoreView } from '../src/shared/scoreView'
import type { WorkingDoc } from '../src/shared/sheetSession'
import PianoRoll, { type LyricPlace } from '../src/sheet-editor/score/PianoRoll.vue'
import ScoreTab from '../src/sheet-editor/score/ScoreTab.vue'
import { clipboard } from '../src/sheet-editor/score/clipboard'
import {
  type LyricSpan,
  clipOfLines,
  editRange,
  fitLyricGesture,
  followSpans,
  laneLines,
  newLineAt,
  overlap,
  parseSpans,
  partAt,
  placedLines,
  remapSpans,
  sameSpans,
  settle,
  withBlockSpans
} from '../src/sheet-editor/score/lyricPlacement'
import { followOf, followSetLines, followSources, followText, setBlockLines } from '../src/sheet-editor/score/lyricsFollow'
import { LYRICS_LANE, TOP, geometry, xOf } from '../src/sheet-editor/score/pianoRoll'
import { defaultPrefs, savePrefs } from '../src/sheet-editor/score/prefs'
import plain from './fixtures/tricky-score.json'
import fixture from './fixtures/tricky-lyrics.json'

const VIEW = fixture.view as unknown as ScoreView
const MODEL = VIEW.model as ScoreModelView
const LAYOUT = VIEW.lyrics as LyricLayoutView
const LYRICS = fixture.lyrics
const VERSE = ['beautiful morning', 'sing it again']

/** The fixture's view with the lines of ``spans`` where the spans put them (as the backend places them). */
function viewWith(spans: readonly (readonly number[])[]): ScoreView {
  const view = JSON.parse(JSON.stringify(VIEW)) as ScoreView
  for (const part of view.lyrics?.parts ?? [])
    for (const line of part.lines) {
      const span = spans.find((s) => s.length >= 4 && s[2] === line.block && s[3] === line.line)
      if (span) Object.assign(line, { start: span[0], end: span[1], pinned: true })
    }
  return view
}

let app: App | null = null
afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
  clipboard.value = null
})

async function idle(times = 4): Promise<void> {
  for (let i = 0; i < times; i++) {
    await new Promise((resolve) => setTimeout(resolve, 0))
    await nextTick()
  }
}

describe('lyricPlacement', () => {
  it('reads where the lines of a block are sung, and where a block may stand', () => {
    // the verse's lines may stand anywhere before the chorus's first line (the intro has no lines)
    const range = editRange(LAYOUT, 1, MODEL.total)
    expect(range).toEqual([0, 160])
    expect(editRange(LAYOUT, 2, MODEL.total)).toEqual([160, 224])
    expect(placedLines(LAYOUT, 1, VERSE, range, 8)).toEqual([
      { id: '0', text: 'beautiful morning', start: 32, end: 96 },
      { id: '1', text: 'sing it again', start: 96, end: 160 }
    ])
    // a line no note sings (here one the layout does not know): where the line before ends, without room -
    // it takes no notes from a line after it (before, it got a beat and pushed that line)
    expect(placedLines(LAYOUT, 1, [...VERSE, 'and again'], range, 8).at(-1)).toEqual({ id: '2', text: 'and again', start: 160, end: 160 })
    expect([0, 100, 223, 224].map((unit) => partAt(LAYOUT, unit)?.block ?? -1)).toEqual([0, 1, 2, -1])
  })

  it('settles the lines in the order of their spans, inside the section and without overlaps', () => {
    const moved = settle(
      [
        { id: '*0', text: 'beautiful morning', start: 120, end: 150 },
        { id: '1', text: 'sing it again', start: 40, end: 130 }
      ],
      [32, 160]
    )
    // the first line moved (``*``) past the second: it is sung after it now, and the second ends where it starts
    expect(moved.map((l) => [l.text, l.start, l.end])).toEqual([
      ['sing it again', 40, 120],
      ['beautiful morning', 120, 150]
    ])
    expect(settle([{ id: '0', text: 'x', start: 10, end: 300 }], [32, 160])).toEqual([{ id: '0', text: 'x', start: 32, end: 160 }])
  })

  it('pushes no line: every line keeps its span, a line without room stays without one', () => {
    const lines = [
      { id: '0', text: 'beautiful morning', start: 32, end: 80 },
      { id: '1', text: '(guitar)', start: 80, end: 80 },
      { id: '*typed', text: 'oh yeah', start: 84, end: 96 },
      { id: '2', text: 'sing it again', start: 96, end: 160 }
    ]
    expect(settle(lines, [32, 160])).toEqual(lines)
    // spans that overlap anyway (an older version kept them): the earlier line ends where the next one starts
    const old = settle(
      [
        { id: '0', text: 'a', start: 32, end: 120 },
        { id: '1', text: 'b', start: 96, end: 160 }
      ],
      [32, 160]
    )
    expect(old.map((l) => [l.text, l.start, l.end])).toEqual([
      ['a', 32, 96],
      ['b', 96, 160]
    ])
  })

  it('stops a line at its neighbour: longer, shorter, moved - never over another line', () => {
    const total = MODEL.total
    expect(laneLines(LAYOUT).map((l) => [l.key, l.start, l.end])).toEqual([
      ['1:0', 32, 96],
      ['1:1', 96, 160],
      ['2:0', 160, 224]
    ])
    // the end of "beautiful morning" into "sing it again": it stops where that line starts
    const longer = fitLyricGesture(LAYOUT, { kind: 'end', key: '1:0', keys: [], delta: 40 }, total)
    expect(longer.moves).toEqual([{ key: '1:0', start: 32, end: 96 }])
    expect(longer.free).toBe(false)
    expect(longer.stoppedAt?.text).toBe('sing it again')
    // shorter: as asked, and one unit at least
    expect(fitLyricGesture(LAYOUT, { kind: 'end', key: '1:0', keys: [], delta: -16 }, total).moves).toEqual([{ key: '1:0', start: 32, end: 80 }])
    expect(fitLyricGesture(LAYOUT, { kind: 'end', key: '1:0', keys: [], delta: -400 }, total).moves).toEqual([{ key: '1:0', start: 32, end: 33 }])
    // the start of "sing it again" back into "beautiful morning": it stops at its end
    const start = fitLyricGesture(LAYOUT, { kind: 'start', key: '1:1', keys: [], delta: -20 }, total)
    expect(start.moves).toEqual([{ key: '1:1', start: 96, end: 160 }])
    expect(start.stoppedAt?.key).toBe('1:0')
    // moved later into the next line: it stays where it is (no free room before the chorus)
    const blocked = fitLyricGesture(LAYOUT, { kind: 'move', key: '1:0', keys: ['1:0'], delta: 8 }, total)
    expect(blocked.moves).toEqual([])
    expect(blocked.free).toBe(false)
    expect(blocked.stoppedAt?.key).toBe('1:1')
    // earlier into the empty intro: as asked, and not past the start of the score
    expect(fitLyricGesture(LAYOUT, { kind: 'move', key: '1:0', keys: ['1:0'], delta: -8 }, total).moves).toEqual([{ key: '1:0', start: 24, end: 88 }])
    expect(fitLyricGesture(LAYOUT, { kind: 'move', key: '1:0', keys: ['1:0'], delta: -64 }, total).moves).toEqual([{ key: '1:0', start: 0, end: 64 }])
    // with room after a shortened line: it stops flush at the next line, and dragged far enough past it, it
    // lands in the free room behind it (a line of its own block: the words change their order)
    const roomy = viewWith([[32, 48, 1, 0], [96, 128, 1, 1]]).lyrics as LyricLayoutView
    expect(fitLyricGesture(roomy, { kind: 'move', key: '1:0', keys: ['1:0'], delta: 60 }, total).moves).toEqual([{ key: '1:0', start: 80, end: 96 }])
    expect(fitLyricGesture(roomy, { kind: 'move', key: '1:0', keys: ['1:0'], delta: 90 }, total).moves).toEqual([{ key: '1:0', start: 128, end: 144 }])
    // never into another block's lines: the chorus stays where it is
    expect(fitLyricGesture(roomy, { kind: 'move', key: '1:0', keys: ['1:0'], delta: 140 }, total).moves).toEqual([{ key: '1:0', start: 144, end: 160 }])
    // lines moved together keep their distance
    expect(fitLyricGesture(roomy, { kind: 'move', key: '1:0', keys: ['1:0', '1:1'], delta: 16 }, total).moves).toEqual([
      { key: '1:0', start: 48, end: 64 },
      { key: '1:1', start: 112, end: 144 }
    ])
  })

  it('finds the free room for a new line and tells what a span would overlap', () => {
    const total = MODEL.total
    // the intro: no Vocal note, no line - a new line from the click, never into the verse's first line
    expect(newLineAt(LAYOUT, 8, 1, total)).toEqual({ block: 0, line: 0, start: 8, end: 12 })
    // on a line there is no new one (a double-click there edits it)
    expect(newLineAt(LAYOUT, 40, 1, total)).toBeNull()
    // the room a shortened line left: from the click to the next line (the verse's phrase runs on)
    const roomy = viewWith([[32, 80, 1, 0], [96, 160, 1, 1]]).lyrics as LyricLayoutView
    expect(newLineAt(roomy, 84, 1, total)).toEqual({ block: 1, line: 2, start: 84, end: 96 })
    expect(newLineAt(roomy, 86.5, 4, total)).toEqual({ block: 1, line: 2, start: 84, end: 96 }) // on the grid
    expect(overlap(laneLines(LAYOUT), [{ start: 90, end: 100 }])?.key).toBe('1:0')
    expect(overlap(laneLines(LAYOUT), [{ start: 0, end: 32 }])).toBeNull()
    expect(overlap(laneLines(LAYOUT), [{ start: 90, end: 100 }], new Set(['1:0', '1:1']))).toBeNull()
  })

  it('pins every sung line when one block is edited: the other blocks keep their places', () => {
    const verse = [
      { id: '0', text: 'beautiful morning', start: 32, end: 80 },
      { id: '1', text: 'sing it again', start: 96, end: 160 }
    ]
    // only the edited block (before GitHub issue #28: the chorus flowed anew after the verse's new end)
    expect(withBlockSpans([], LAYOUT, new Map([[1, verse]]))).toEqual([[32, 80, 1, 0], [96, 160, 1, 1]])
    expect(withBlockSpans([], LAYOUT, new Map([[1, verse]]), true)).toEqual([[32, 80, 1, 0], [96, 160, 1, 1], [160, 224, 2, 0]])
    // a span kept already stays as it is
    expect(withBlockSpans([[170, 200, 2, 0]], LAYOUT, new Map([[1, verse]]), true)).toEqual([[32, 80, 1, 0], [96, 160, 1, 1], [170, 200, 2, 0]])
  })

  it('keeps a span with its line, moves it with the bars and reads a property', () => {
    const lines = [
      { id: '0', text: 'a', start: 32, end: 64 },
      { id: '1', text: 'b', start: 64, end: 96 }
    ]
    const verse: LyricSpan[] = withBlockSpans([[160, 200, 2, 0], [40, 60, 1, 0]], LAYOUT, new Map([[1, lines]]))
    expect(verse).toEqual([[32, 64, 1, 0], [64, 96, 1, 1], [160, 200, 2, 0]])
    // spans kept by 0.4.4 without their line: those the view placed become the spans of their lines
    const pinned = { ...LAYOUT, parts: LAYOUT.parts.map((p) => (p.block === 2 ? { ...p, lines: p.lines.map((l) => ({ ...l, pinned: true })) } : p)) }
    expect(withBlockSpans([[160, 224], [40, 60]], pinned, new Map([[1, lines]]))).toEqual([[32, 64, 1, 0], [64, 96, 1, 1], [160, 224, 2, 0]])
    // the verse copied after itself (bars 2-5 again at 160), the chorus moved behind it
    expect(remapSpans(verse, [[0, 160, 0], [32, 160, 160], [160, 224, 288]])).toEqual([
      [32, 64, 1, 0],
      [64, 96, 1, 1],
      [160, 192, 1, 0],
      [192, 224, 1, 1],
      [288, 328, 2, 0]
    ])
    expect(parseSpans([[5, 9], [1, 2, 0, 1], 'x', [3, 3], [-1, 4], [2.5, 6], [1, 2, 3]])).toEqual([[1, 2, 0, 1], [5, 9]])
    expect(sameSpans([[1, 2, 0, 1]], [[1, 2, 0, 2]])).toBe(false)
    expect(clipOfLines([{ id: '1', text: 'b', start: 64, end: 96 }, { id: '0', text: 'a', start: 32, end: 48 }])).toEqual([
      { text: 'a', offset: 0, length: 16 },
      { text: 'b', offset: 32, length: 32 }
    ])
  })

  it('keeps the syllable onsets of a line the MusicXML import placed, while the line stays where it is', () => {
    // [start, end, block, line, ...onsets]: onsets out of order or outside the span are left out
    expect(parseSpans([[32, 64, 1, 0, 32, 40, 48], [64, 96, 1, 1, 70, 66], [96, 128, 1, 2, 130]])).toEqual([
      [32, 64, 1, 0, 32, 40, 48],
      [64, 96, 1, 1],
      [96, 128, 1, 2]
    ])
    // the onsets move with their bars; a span cut by the move loses them
    expect(remapSpans([[32, 64, 1, 0, 32, 48]], [[0, 160, 64]])).toEqual([[96, 128, 1, 0, 96, 112]])
    expect(remapSpans([[32, 64, 1, 0, 32, 48]], [[0, 40, 0], [40, 160, 80]])).toEqual([[32, 40, 1, 0]])
    // an edit of the block: the line left where it was keeps them, the moved one is placed anew
    const lines = [
      { id: '0', text: 'a', start: 32, end: 64 },
      { id: '1', text: 'b', start: 72, end: 96 }
    ]
    expect(withBlockSpans([[32, 64, 1, 0, 32, 48], [64, 96, 1, 1, 64, 80]], LAYOUT, new Map([[1, lines]]))).toEqual([
      [32, 64, 1, 0, 32, 48],
      [72, 96, 1, 1]
    ])
    // the lyrics following the sections keep them too
    expect(followSpans([[32, 64, 1, 0, 32, 48]], [0, 1, 2], [0, 1, 2], [0, 1, 2], [0, 32, 160])).toEqual([[32, 64, 1, 0, 32, 48]])
  })

  it('gives a span the block of the section that took its words when the lyrics follow the sections', () => {
    // the verse (section 1) copied after itself: the sections are intro, verse, verse, chorus
    const after: ScoreModelView = {
      ...MODEL,
      total: MODEL.total + 128,
      measures: [...MODEL.measures, ...[0, 1, 2, 3].map((i) => ({ ...MODEL.measures[0], onset: MODEL.total + 32 * i }))],
      sections: [MODEL.sections[0], MODEL.sections[1], { ...MODEL.sections[1], first_bar: 6 }, { ...MODEL.sections[2], first_bar: 10 }]
    }
    const map = [[0, 160, 0], [32, 160, 160], [160, 224, 288]]
    const sources = followSources(MODEL, after, map)
    expect(sources).toEqual([0, 1, 1, 2])
    const moved = remapSpans([[32, 64, 1, 0], [160, 200, 2, 0]], map)
    const starts = after.sections.map((s) => after.measures[s.first_bar - 1]?.onset ?? 0)
    const labelled = (m: ScoreModelView) => m.sections.flatMap((s, i) => (s.implicit ? [] : [i]))
    // each copy of the verse's span goes to its own verse block, the chorus's to the chorus, now block 3
    expect(followSpans(moved, sources, labelled(MODEL), labelled(after), starts)).toEqual([
      [32, 64, 1, 0],
      [160, 192, 2, 0],
      [288, 328, 3, 0]
    ])
  })

  it('sets the lines of a block, in the text and while the lyrics follow the sections', () => {
    expect(setBlockLines(LYRICS, 1, ['sing it again', 'beautiful morning'])).toBe(
      LYRICS.replace('beautiful morning\nsing it again', 'sing it again\nbeautiful morning')
    )
    const follow = followOf(LYRICS, MODEL)!
    expect(followText(followSetLines(follow, MODEL, 2, []), MODEL)).toBe(LYRICS.replace('\nhold on', ''))
  })
})

describe('PianoRoll: lines placed by hand in the lyrics lane', () => {
  const GEO = geometry(MODEL, { pxPerQuarter: 48, snap: 'auto', lyrics: true })
  const lane = TOP + LYRICS_LANE / 2

  function mountRoll() {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const placed: LyricPlace[][] = []
    const notes: (string | undefined)[] = []
    const deleted: string[][] = []
    let selection: string[] = []
    app = createApp({
      data: () => ({ picked: [] as string[] }),
      render() {
        return h(PianoRoll, {
          view: VIEW,
          selection: [],
          operate: (_op: ScoreOperation) => Promise.resolve(true),
          lyrics: LAYOUT,
          lyricsEditable: true,
          lyricSelection: this.picked,
          'onUpdate:lyricSelection': (keys: string[]) => {
            this.picked = keys
            selection = keys
          },
          onLyricPlace: (moves: LyricPlace[], note?: string) => {
            placed.push(moves)
            notes.push(note)
          },
          onLyricDelete: (keys: string[]) => deleted.push(keys)
        })
      }
    })
    app.mount(host)
    return {
      host,
      root: host.querySelector('.roll') as HTMLElement,
      svg: host.querySelector('svg.roll-svg') as SVGSVGElement,
      placed,
      notes,
      deleted,
      selection: () => selection
    }
  }
  const pointer = (svg: SVGSVGElement, type: string, x: number, init: PointerEventInit = {}) =>
    svg.dispatchEvent(new PointerEvent(type, { clientX: x, clientY: lane, button: 0, bubbles: true, pointerId: 1, ...init }))

  it('selects a line with a click, more with Ctrl, and marks them', async () => {
    const { svg, selection } = mountRoll()
    pointer(svg, 'pointerdown', xOf(60, GEO))
    pointer(svg, 'pointerup', xOf(60, GEO))
    await nextTick()
    expect(selection()).toEqual(['1:0'])
    pointer(svg, 'pointerdown', xOf(180, GEO), { ctrlKey: true })
    pointer(svg, 'pointerup', xOf(180, GEO), { ctrlKey: true })
    await nextTick()
    expect(selection()).toEqual(['1:0', '2:0'])
    expect([...svg.querySelectorAll('.lyric-line.selected text')].map((t) => t.textContent)).toEqual(['beautiful morning', 'hold on'])
  })

  it('moves the selected lines with a drag, by the grid - and stops them at the next line', async () => {
    const { svg, placed, notes } = mountRoll()
    pointer(svg, 'pointerdown', xOf(60, GEO))
    pointer(svg, 'pointermove', xOf(56, GEO))
    pointer(svg, 'pointermove', xOf(52, GEO))
    await nextTick()
    expect(svg.querySelector('.lyric-line.dragged text')?.textContent).toBe('beautiful morning')
    pointer(svg, 'pointerup', xOf(52, GEO))
    await nextTick()
    expect(placed).toEqual([[{ key: '1:0', start: 24, end: 88 }]])
    expect(notes).toEqual([undefined])
    // later: "sing it again" follows at once - the line stays, drawn as stopped while it is dragged, and says why
    pointer(svg, 'pointerdown', xOf(60, GEO))
    pointer(svg, 'pointermove', xOf(64, GEO))
    pointer(svg, 'pointermove', xOf(68, GEO))
    await nextTick()
    expect(svg.querySelector('.lyric-line.stopped text')?.textContent).toBe('beautiful morning')
    expect(svg.querySelector('.lyric-line.dragged')).toBeNull() // it does not move over "sing it again"
    pointer(svg, 'pointerup', xOf(68, GEO))
    await nextTick()
    expect(placed.at(-1)).toEqual([])
    expect(notes.at(-1)).toContain('stops at "sing it again"')
  })

  it('makes a line longer or shorter at its end or its start', async () => {
    const { svg, placed } = mountRoll()
    const end = xOf(96, GEO) - 2
    pointer(svg, 'pointerdown', end)
    pointer(svg, 'pointermove', end - 48)
    pointer(svg, 'pointerup', end - 48)
    await nextTick()
    expect(placed.at(-1)).toEqual([{ key: '1:0', start: 32, end: 88 }])
    const start = xOf(96, GEO) + 2 // "sing it again" starts here
    pointer(svg, 'pointerdown', start)
    pointer(svg, 'pointermove', start + 96)
    pointer(svg, 'pointerup', start + 96)
    await nextTick()
    expect(placed.at(-1)).toEqual([{ key: '1:1', start: 112, end: 160 }])
  })

  it('deletes the selected lines with Del and nudges them with the arrows; Esc lets them go', async () => {
    const { root, svg, placed, notes, deleted, selection } = mountRoll()
    pointer(svg, 'pointerdown', xOf(60, GEO))
    pointer(svg, 'pointerup', xOf(60, GEO))
    await nextTick()
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
    expect(placed.at(-1)).toEqual([{ key: '1:0', start: 31, end: 95 }]) // a grid step into the free intro
    // the chorus's line cannot go left into the verse: nothing moves, and the roll says why
    pointer(svg, 'pointerdown', xOf(180, GEO))
    pointer(svg, 'pointerup', xOf(180, GEO))
    await nextTick()
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
    expect(placed.at(-1)).toEqual([])
    expect(notes.at(-1)).toContain('stops at "sing it again"')
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }))
    expect(deleted).toEqual([['2:0']])
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await nextTick()
    expect(selection()).toEqual([])
  })
})

describe('ScoreTab: lines placed by hand', () => {
  beforeEach(() => {
    window.localStorage.clear()
    savePrefs({ ...defaultPrefs() })
  })

  function mountTab(kept: LyricSpan[] = []) {
    const asked: { lyrics?: string; spans?: number[][] }[] = []
    const fetcher: Fetcher = {
      fetchApi: (route: string, init?: RequestInit) => {
        const body = JSON.parse(String(init?.body ?? '{}'))
        if (route.includes('/analyze')) asked.push({ lyrics: body.lyrics, spans: body.lyric_spans })
        // the lines stand where their spans put them, as the backend places them
        const answer = route.includes('/analyze') ? (body.lyrics ? viewWith(body.lyric_spans ?? []) : plain.view) : {}
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(answer) } as Response)
      }
    }
    const reported: (string | null)[] = []
    const spans: LyricSpan[][] = []
    const host = document.createElement('div')
    document.body.appendChild(host)
    const doc: WorkingDoc = { kind: 'score', text: plain.abc, intent: 'keep' }
    app = createApp({
      render: () =>
        h(ScoreTab, {
          doc,
          fetcher,
          payload: null,
          readonly: false,
          layoutDefault: 'review',
          lyrics: LYRICS,
          title: 'Song',
          lyricSpans: kept,
          lyricsTarget: { title: 'Song Sheet · Text', blocked: null, replans: false },
          onLyricsChange: (text: string | null) => reported.push(text),
          onLyricSpansChange: (next: LyricSpan[]) => spans.push(next)
        })
    })
    app.mount(host)
    const geo = geometry(MODEL, { pxPerQuarter: 48, snap: 'auto', lyrics: true })
    const svg = () => host.querySelector('svg.roll-svg') as SVGSVGElement
    // keys go to the roll (it has the focus after a click) and bubble up to the tab
    const tab = () => host.querySelector('.roll') as HTMLElement
    const pointer = (type: string, unit: number, init: PointerEventInit = {}) =>
      svg().dispatchEvent(new PointerEvent(type, { clientX: xOf(unit, geo), clientY: TOP + LYRICS_LANE / 2, button: 0, bubbles: true, pointerId: 1, ...init }))
    const key = (k: string, init: KeyboardEventInit = {}) =>
      tab().dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }))
    const dblclick = (unit: number) =>
      svg().dispatchEvent(new MouseEvent('dblclick', { clientX: xOf(unit, geo), clientY: TOP + LYRICS_LANE / 2, bubbles: true }))
    const type = async (text: string) => {
      await nextTick()
      const input = host.querySelector('input.lyric-edit') as HTMLInputElement
      input.value = text
      input.dispatchEvent(new Event('input'))
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
      await idle()
    }
    const said = () => host.textContent ?? ''
    return { asked, reported, spans, pointer, key, svg, tab, dblclick, type, said, host }
  }

  it('makes a line shorter and every other line keeps its place - also those of the other blocks; undo, redo', async () => {
    const { asked, reported, spans, pointer, key } = mountTab()
    await idle(6)
    // the end of "beautiful morning" (32-96) back to 80
    pointer('pointerdown', 96 - 0.3)
    pointer('pointermove', 90)
    pointer('pointermove', 80)
    pointer('pointerup', 80)
    await idle()
    // every sung line is pinned where it was: the chorus's line keeps its notes (GitHub issue #28)
    expect(spans.at(-1)).toEqual([[32, 80, 1, 0], [96, 160, 1, 1], [160, 224, 2, 0]])
    expect(asked.at(-1)?.spans).toEqual([[32, 80, 1, 0], [96, 160, 1, 1], [160, 224, 2, 0]])
    expect(reported.at(-1)).toBe(LYRICS) // the words and their order stay
    key('z', { ctrlKey: true })
    await idle()
    expect(spans.at(-1)).toEqual([])
    key('y', { ctrlKey: true })
    await idle()
    expect(spans.at(-1)).toEqual([[32, 80, 1, 0], [96, 160, 1, 1], [160, 224, 2, 0]])
  })

  it('stops a line made longer at the next line and says so; the next line keeps its start', async () => {
    const { spans, pointer, said } = mountTab([[32, 80, 1, 0], [96, 160, 1, 1], [160, 224, 2, 0]])
    await idle(6)
    pointer('pointerdown', 80 - 0.3)
    pointer('pointermove', 100)
    pointer('pointermove', 120)
    pointer('pointerup', 120)
    await idle()
    expect(spans.at(-1)).toEqual([[32, 96, 1, 0], [96, 160, 1, 1], [160, 224, 2, 0]])
    expect(said()).toContain('stops at "sing it again"')
  })

  it('types a new line where the lane is free; the other lines keep their spans', async () => {
    const { reported, spans, dblclick, type } = mountTab([[32, 80, 1, 0], [96, 160, 1, 1], [160, 224, 2, 0]])
    await idle(6)
    dblclick(84) // between "beautiful morning" (32-80) and "sing it again" (96-160)
    await type('oh yeah')
    expect(reported.at(-1)).toContain('[Verse]\nbeautiful morning\noh yeah\nsing it again')
    // the new line from the click to the next line; "sing it again" is the verse's third line now
    expect(spans.at(-1)).toEqual([[32, 80, 1, 0], [84, 96, 1, 1], [96, 160, 1, 2], [160, 224, 2, 0]])
  })

  it('changes the words of a line where it is sung: no line moves', async () => {
    const { reported, spans, dblclick, type } = mountTab()
    await idle(6)
    dblclick(120) // "sing it again"
    await type('sing it once more')
    expect(reported.at(-1)).toBe(LYRICS.replace('sing it again', 'sing it once more'))
    expect(spans.at(-1)).toEqual([[32, 96, 1, 0], [96, 160, 1, 1], [160, 224, 2, 0]])
  })

  it('lays the lyrics out anew with auto-place lyrics, in one undo step; the words stay', async () => {
    const { reported, spans, key, host } = mountTab([[32, 80, 1, 0], [96, 160, 1, 1], [160, 224, 2, 0]])
    await idle(6)
    const button = () => [...host.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'auto-place lyrics') as HTMLButtonElement | undefined
    expect(button()).toBeTruthy()
    button()?.click()
    await idle()
    expect(spans.at(-1)).toEqual([])
    expect(reported.at(-1)).toBe(LYRICS)
    expect(button()).toBeUndefined() // nothing placed by hand any more
    key('z', { ctrlKey: true })
    await idle()
    expect(spans.at(-1)).toEqual([[32, 80, 1, 0], [96, 160, 1, 1], [160, 224, 2, 0]])
    expect(button()).toBeTruthy()
  })

  it('reopens with the spans kept in the sheet: they go to the backend and the lane shows them', async () => {
    const { asked, svg } = mountTab([[32, 80, 1, 0], [96, 160, 1, 1], [160, 224, 2, 0]])
    await idle(6)
    expect(asked.at(-1)?.spans).toEqual([[32, 80, 1, 0], [96, 160, 1, 1], [160, 224, 2, 0]])
    const geo = geometry(MODEL, { pxPerQuarter: 48, snap: 'auto', lyrics: true })
    const box = svg().querySelector('.lyric-line rect') as SVGRectElement
    expect(Number(box.getAttribute('width'))).toBeCloseTo(xOf(80, geo) - xOf(32, geo))
  })

  it('deletes, copies and pastes lines at the cursor - into free room only', async () => {
    const { reported, spans, pointer, key, said } = mountTab()
    await idle(6)
    pointer('pointerdown', 180) // "hold on"
    pointer('pointerup', 180)
    await nextTick()
    key('c', { ctrlKey: true })
    expect(clipboard.value?.lyricLines).toEqual([{ text: 'hold on', offset: 0, length: 64 }])
    key('Delete')
    await idle()
    expect(reported.at(-1)).toBe(LYRICS.replace('\nhold on', ''))
    const deleted = reported.length
    // the cursor to bar 4 (unit 96, where "sing it again" is sung): a paste there is refused - nothing moves
    pointer('pointerdown', 96, { clientY: 6 }) // in the ruler
    pointer('pointerup', 96, { clientY: 6 })
    await nextTick()
    key('v', { ctrlKey: true })
    await idle()
    expect(reported).toHaveLength(deleted)
    expect(said()).toContain('Not pasted: the lines would overlap "sing it again"')
    // at the start (the intro is free): pasted there, up to the verse's first line
    key('Home')
    await nextTick()
    key('v', { ctrlKey: true })
    await idle()
    expect(reported.at(-1)).toContain('[Intro]\nhold on\n')
    expect(spans.at(-1)?.[0]).toEqual([0, 32, 0, 0])
  })
})
