/**
 * Lyrics lines placed by hand (owner's request 2026-10-03): in the roll's lyrics lane a line is
 * selected, moved, made longer or shorter, deleted, copied and pasted like a note; its span is kept with
 * the sheet and sent with the lyrics, and the Score tab makes each edit one undo step.
 * The view comes from the backend (fixtures/tricky-lyrics.json): intro (bar 1), verse (bars 2-5:
 * "beautiful morning" 32-96, "sing it again" 96-160), chorus (bars 6-7: "hold on" 160-224); L:1/32.
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
  parseSpans,
  placedLines,
  remapSpans,
  sectionAt,
  sectionRange,
  settle,
  withSectionSpans
} from '../src/sheet-editor/score/lyricPlacement'
import { followOf, followSetLines, followText, setBlockLines } from '../src/sheet-editor/score/lyricsFollow'
import { LYRICS_LANE, TOP, geometry, xOf } from '../src/sheet-editor/score/pianoRoll'
import { defaultPrefs, savePrefs } from '../src/sheet-editor/score/prefs'
import plain from './fixtures/tricky-score.json'
import fixture from './fixtures/tricky-lyrics.json'

const VIEW = fixture.view as unknown as ScoreView
const MODEL = VIEW.model as ScoreModelView
const LAYOUT = VIEW.lyrics as LyricLayoutView
const LYRICS = fixture.lyrics
const VERSE = ['beautiful morning', 'sing it again']

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
  it('reads where the lines of a section are sung, and the sections', () => {
    expect(placedLines(MODEL, LAYOUT, 1, VERSE)).toEqual([
      { id: '0', text: 'beautiful morning', start: 32, end: 96 },
      { id: '1', text: 'sing it again', start: 96, end: 160 }
    ])
    // a line the layout does not know (typed after the last one): a beat after the line before
    expect(placedLines(MODEL, LAYOUT, 1, [...VERSE, 'and again']).at(-1)).toEqual({ id: '2', text: 'and again', start: 159, end: 160 })
    expect(sectionRange(MODEL, 1)).toEqual([32, 160])
    expect([sectionAt(MODEL, 0), sectionAt(MODEL, 100), sectionAt(MODEL, 223), sectionAt(MODEL, 224)]).toEqual([0, 1, 2, -1])
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

  it('keeps the lines an edit placed where they were put: the others make room', () => {
    const pasted = settle(
      [
        { id: '0', text: 'beautiful morning', start: 32, end: 96 },
        { id: '1', text: 'sing it again', start: 96, end: 160 },
        { id: '*new0', text: 'hold on', start: 96, end: 128 }
      ],
      [32, 160]
    )
    // pasted where "sing it again" started: that line moves behind it and keeps the rest of its span
    expect(pasted.map((l) => [l.text, l.start, l.end])).toEqual([
      ['beautiful morning', 32, 96],
      ['hold on', 96, 128],
      ['sing it again', 128, 160]
    ])
    const longer = settle(
      [
        { id: '*0', text: 'beautiful morning', start: 32, end: 120 },
        { id: '1', text: 'sing it again', start: 96, end: 160 }
      ],
      [32, 160]
    )
    expect(longer.map((l) => [l.start, l.end])).toEqual([
      [32, 120],
      [120, 160]
    ])
    // two lines pasted over three: the ones covered whole keep their length behind them
    const over = settle(
      [
        { id: 'a', text: 'a', start: 40, end: 60 },
        { id: 'b', text: 'b', start: 60, end: 80 },
        { id: 'c', text: 'c', start: 80, end: 150 },
        { id: '*p', text: 'p', start: 40, end: 70 },
        { id: '*q', text: 'q', start: 70, end: 90 }
      ],
      [32, 160]
    )
    expect(over.map((l) => [l.text, l.start, l.end])).toEqual([
      ['p', 40, 70],
      ['q', 70, 90],
      ['a', 90, 110],
      ['b', 110, 130],
      ['c', 130, 150]
    ])
  })

  it('keeps the spans per section, moves them with the bars and reads a property', () => {
    const verse: LyricSpan[] = withSectionSpans([[160, 200], [40, 60]], [32, 160], [
      { id: '0', text: 'a', start: 32, end: 64 },
      { id: '1', text: 'b', start: 64, end: 96 }
    ])
    expect(verse).toEqual([[32, 64], [64, 96], [160, 200]])
    // the verse copied after itself (bars 2-5 again at 160), the chorus moved behind it
    expect(remapSpans(verse, [[0, 160, 0], [32, 160, 160], [160, 224, 288]])).toEqual([[32, 64], [64, 96], [160, 192], [192, 224], [288, 328]])
    expect(parseSpans([[5, 9], [1, 2], 'x', [3, 3], [-1, 4], [2.5, 6]])).toEqual([[1, 2], [5, 9]])
    expect(clipOfLines([{ id: '1', text: 'b', start: 64, end: 96 }, { id: '0', text: 'a', start: 32, end: 48 }])).toEqual([
      { text: 'a', offset: 0, length: 16 },
      { text: 'b', offset: 32, length: 32 }
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
          onLyricPlace: (moves: LyricPlace[]) => placed.push(moves),
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

  it('moves the selected lines with a drag, by the grid', async () => {
    const { svg, placed } = mountRoll()
    pointer(svg, 'pointerdown', xOf(60, GEO))
    pointer(svg, 'pointermove', xOf(64, GEO))
    pointer(svg, 'pointermove', xOf(68, GEO))
    await nextTick()
    expect(svg.querySelector('.lyric-line.dragged text')?.textContent).toBe('beautiful morning')
    pointer(svg, 'pointerup', xOf(68, GEO))
    await nextTick()
    expect(placed).toEqual([[{ key: '1:0', start: 40, end: 104 }]])
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
    const { root, svg, placed, deleted, selection } = mountRoll()
    pointer(svg, 'pointerdown', xOf(180, GEO))
    pointer(svg, 'pointerup', xOf(180, GEO))
    await nextTick()
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
    expect(placed.at(-1)?.[0].key).toBe('2:0')
    expect(placed.at(-1)?.[0].start).toBeLessThan(160)
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

  function mountTab() {
    const asked: { lyrics?: string; spans?: number[][] }[] = []
    const fetcher: Fetcher = {
      fetchApi: (route: string, init?: RequestInit) => {
        const body = JSON.parse(String(init?.body ?? '{}'))
        if (route.includes('/analyze')) asked.push({ lyrics: body.lyrics, spans: body.lyric_spans })
        const answer = route.includes('/analyze') ? (body.lyrics ? VIEW : plain.view) : {}
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
          lyricSpans: [],
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
    return { asked, reported, spans, pointer, key, svg, tab }
  }

  it('moves a line past the next one: the section is pinned, the words change their order, undo brings it back', async () => {
    const { asked, reported, spans, pointer, key } = mountTab()
    await idle(6)
    pointer('pointerdown', 60)
    pointer('pointermove', 70)
    pointer('pointermove', 60 + 96)
    pointer('pointerup', 60 + 96)
    await idle()
    // "beautiful morning" moved 96 units later: it starts at 128, inside "sing it again" (96-160)
    expect(spans.at(-1)).toEqual([[96, 128], [128, 160]])
    expect(reported.at(-1)).toBe(LYRICS.replace('beautiful morning\nsing it again', 'sing it again\nbeautiful morning'))
    expect(asked.at(-1)?.spans).toEqual([[96, 128], [128, 160]])
    key('z', { ctrlKey: true })
    await idle()
    expect(reported.at(-1)).toBe(LYRICS)
    expect(spans.at(-1)).toEqual([])
  })

  it('deletes, copies and pastes lines at the cursor', async () => {
    const { reported, spans, pointer, key } = mountTab()
    await idle(6)
    pointer('pointerdown', 180) // "hold on"
    pointer('pointerup', 180)
    await nextTick()
    key('c', { ctrlKey: true })
    expect(clipboard.value?.lyricLines).toEqual([{ text: 'hold on', offset: 0, length: 64 }])
    key('Delete')
    await idle()
    expect(reported.at(-1)).toBe(LYRICS.replace('\nhold on', ''))
    // the cursor to bar 4 (unit 96, in the verse): the line is pasted there and the verse is pinned
    pointer('pointerdown', 96, { clientY: 6 }) // in the ruler
    pointer('pointerup', 96, { clientY: 6 })
    await nextTick()
    key('v', { ctrlKey: true })
    await idle()
    // pasted where "sing it again" starts: "hold on" is sung there, "sing it again" right after it
    expect(reported.at(-1)).toContain('[Verse]\nbeautiful morning\nhold on\nsing it again')
    expect(spans.at(-1)?.some(([start]) => start >= 96 && start < 160)).toBe(true)
  })
})
