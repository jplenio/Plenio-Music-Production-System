/**
 * Arranging sections (docs/design/score-arrange-design.md §1): the pure list logic, the section
 * clipboard, and the section list with selection, buttons, keys and drag and drop.
 */
import { afterEach, describe, expect, it } from 'vitest'
import { type App, createApp, h, nextTick } from 'vue'

import type { ScoreOperation } from '../src/api/client'
import type { ScoreModelView, ScoreView } from '../src/shared/scoreView'
import ScoreNavigator from '../src/sheet-editor/score/ScoreNavigator.vue'
import { deleteSections, dropSections, duplicateSections, moveSections, selectSection } from '../src/sheet-editor/score/arrange'
import { clipOfSections, clipOfSelection, clipboard, convertClip, pasteOperation } from '../src/sheet-editor/score/clipboard'
import fixture from './fixtures/tricky-score.json'

const VIEW = fixture.view as unknown as ScoreView
const MODEL = VIEW.model as ScoreModelView

describe('the section list as an order of sections', () => {
  it('selects with click, Ctrl+click and Shift+click', () => {
    expect(selectSection([1], 3, { toggle: false, range: false }, 1)).toEqual([3])
    expect(selectSection([1], 3, { toggle: true, range: false }, 1)).toEqual([1, 3])
    expect(selectSection([1, 3], 3, { toggle: true, range: false }, 1)).toEqual([1])
    expect(selectSection([1], 4, { toggle: false, range: true }, 1)).toEqual([1, 2, 3, 4])
    expect(selectSection([5], 2, { toggle: true, range: true }, 0)).toEqual([0, 1, 2, 5])
  })

  it('duplicates after the last selected section and selects the copies', () => {
    expect(duplicateSections(6, [2])).toEqual({ order: [1, 2, 3, 3, 4, 5, 6], selection: [3] })
    expect(duplicateSections(6, [1, 2])).toEqual({ order: [1, 2, 3, 2, 3, 4, 5, 6], selection: [3, 4] })
    expect(duplicateSections(6, [4, 1])).toEqual({ order: [1, 2, 3, 4, 5, 2, 5, 6], selection: [5, 6] })
    expect(duplicateSections(6, [])).toBeNull()
  })

  it('deletes, but keeps at least one section', () => {
    expect(deleteSections(6, [3, 4])).toEqual({ order: [1, 2, 3, 6], selection: [] })
    expect(deleteSections(2, [0, 1])).toBeNull()
    expect(deleteSections(3, [])).toBeNull()
  })

  it('moves a block past its neighbour, and not beyond the ends', () => {
    expect(moveSections(6, [2], -1)).toEqual({ order: [1, 3, 2, 4, 5, 6], selection: [1] })
    expect(moveSections(6, [1, 2], 1)).toEqual({ order: [1, 4, 2, 3, 5, 6], selection: [2, 3] })
    expect(moveSections(6, [0], -1)).toBeNull()
    expect(moveSections(6, [5], 1)).toBeNull()
  })

  it('drops the selection before a place, or a copy of it with Alt', () => {
    expect(dropSections(6, [4], 1, false)).toEqual({ order: [1, 5, 2, 3, 4, 6], selection: [1] })
    expect(dropSections(6, [1], 6, false)).toEqual({ order: [1, 3, 4, 5, 6, 2], selection: [5] })
    expect(dropSections(6, [2], 5, true)).toEqual({ order: [1, 2, 3, 4, 5, 3, 6], selection: [5] })
    expect(dropSections(6, [2], 2, false)).toBeNull() // nothing moves
  })
})

describe('the clipboard', () => {
  it('copies whole sections with both voices, chords and labels', () => {
    const clip = clipOfSections(MODEL, [1])!
    const verse = MODEL.sections[1]
    const first = MODEL.measures[verse.first_bar - 1]
    expect(clip.tracks).toEqual(['vocal', 'ins'])
    expect(clip.withChords).toBe(true)
    expect(clip.sections).toEqual([{ onset: 0, label: verse.label }])
    expect(clip.span).toBe(verse.bars * first.length)
    expect(clip.notes.every((n) => n.onset >= 0 && n.onset + n.duration <= clip.span)).toBe(true)
    // two sections are copied one after the other, as one range
    const two = clipOfSections(MODEL, [0, 2])!
    expect(two.sections.map((s) => s.label)).toEqual([MODEL.sections[0].label, MODEL.sections[2].label])
  })

  it('copies a selection from its earliest event and pastes it at the cursor', () => {
    const notes = MODEL.tracks.vocal.slice(1, 3)
    const chord = MODEL.tracks.chords[1]
    const clip = clipOfSelection(MODEL, notes, [chord])!
    const start = Math.min(notes[0].onset, chord.onset)
    expect(clip.notes[0].onset).toBe(notes[0].onset - start)
    expect(clip.tracks).toEqual(['vocal'])
    expect(clip.label).toBe('2 notes and 1 chord symbol')
    const operation = pasteOperation(clip, MODEL, 64, 'overwrite') as ScoreOperation
    expect(operation).toMatchObject({ op: 'paste', at: 64, mode: 'overwrite', tracks: ['vocal'], with_chords: true, sections: [] })
    expect(pasteOperation(clip, MODEL, MODEL.total, 'insert')).toMatch(/cursor/)
  })

  it('converts a clip to another note grid, or says it cannot', () => {
    const clip = clipOfSelection(MODEL, MODEL.tracks.vocal.slice(0, 1), [])!
    const finer = convertClip({ ...clip, unit: '1/16' }, '1/32')!
    expect(finer.notes[0].duration).toBe(clip.notes[0].duration * 2)
    expect(convertClip({ ...clip, unit: '1/32', span: 3 }, '1/16')).toBeNull()
  })
})

// --- the section list -----------------------------------------------------------------------------

let app: App | null = null
afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
  clipboard.value = null
})

function mount(readonly = false) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const operations: ScoreOperation[] = []
  const notices: string[] = []
  app = createApp({
    render: () =>
      h(ScoreNavigator, {
        view: VIEW,
        bar: 1,
        errorBars: [],
        sourceStarts: null,
        readonly,
        onOperate: (op: ScoreOperation) => operations.push(op),
        onNotice: (text: string) => notices.push(text)
      })
  })
  app.mount(host)
  const nav = host.querySelector('nav') as HTMLElement
  const heads = () => [...host.querySelectorAll('.section-head')] as HTMLElement[]
  const button = (name: string) => [...host.querySelectorAll('.section-actions button')].find((b) => b.textContent?.trim() === name || b.getAttribute('aria-label') === name) as HTMLButtonElement
  return { host, nav, heads, button, operations, notices }
}

const click = (el: HTMLElement, init: MouseEventInit = {}) => el.dispatchEvent(new MouseEvent('click', { bubbles: true, ...init }))
const key = (el: HTMLElement, name: string, init: KeyboardEventInit = {}) => el.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true, ...init }))

describe('ScoreNavigator: arranging sections', () => {
  it('selects sections and duplicates, moves and deletes them', async () => {
    const { host, heads, button, operations } = mount()
    expect(button('Duplicate').disabled).toBe(true)
    click(heads()[1])
    await nextTick()
    expect(host.querySelectorAll('li.picked')).toHaveLength(1)
    button('Duplicate').click()
    expect(operations.at(-1)).toEqual({ op: 'arrange_sections', order: [1, 2, 2, 3] })
    button('Move up').click()
    expect(operations.at(-1)).toEqual({ op: 'arrange_sections', order: [2, 1, 3] })
    click(heads()[2], { ctrlKey: true })
    await nextTick()
    button('Delete').click()
    expect(operations.at(-1)).toEqual({ op: 'arrange_sections', order: [1] })
  })

  it('has the Cubase keys and copies to the clipboard', async () => {
    const { nav, heads, operations, notices } = mount()
    click(heads()[0])
    click(heads()[1], { shiftKey: true })
    await nextTick()
    const browserDefault = key(nav, 'd', { ctrlKey: true }) // the browser's bookmark shortcut must not run
    expect(browserDefault).toBe(false)
    expect(operations.at(-1)).toEqual({ op: 'arrange_sections', order: [1, 2, 1, 2, 3] })
    key(nav, 'ArrowDown', { ctrlKey: true })
    expect(operations.at(-1)).toEqual({ op: 'arrange_sections', order: [3, 1, 2] })
    key(nav, 'c', { ctrlKey: true })
    expect(clipboard.value?.label).toContain('sections')
    expect(notices.at(-1)).toContain('paste it at the cursor')
    key(nav, 'Delete')
    expect(operations.at(-1)).toEqual({ op: 'arrange_sections', order: [3] })
    // Ctrl+X: copy, then delete (Cubase: cut)
    clipboard.value = null
    key(nav, 'x', { ctrlKey: true })
    const held = () => clipboard.value // read after the key (an assignment would narrow it to null)
    expect(held()?.label).toContain('sections')
    expect(operations.at(-1)).toEqual({ op: 'arrange_sections', order: [3] })
  })

  it('drags a section to a new place, and copies it with Alt', async () => {
    const { host, operations } = mount()
    const items = [...host.querySelectorAll('ol.sections li')] as HTMLElement[]
    const drag = (from: number, to: number, alt: boolean) => {
      items[from].dispatchEvent(new Event('dragstart', { bubbles: true }))
      const over = new Event('dragover', { bubbles: true, cancelable: true }) as DragEvent
      Object.defineProperty(over, 'clientY', { value: -1 }) // the upper half: before this item
      items[to].dispatchEvent(over)
      const drop = new Event('drop', { bubbles: true, cancelable: true }) as DragEvent
      Object.defineProperty(drop, 'altKey', { value: alt })
      items[to].dispatchEvent(drop)
    }
    drag(2, 0, false)
    await nextTick()
    expect(operations.at(-1)).toEqual({ op: 'arrange_sections', order: [3, 1, 2] })
    drag(0, 2, true)
    expect(operations.at(-1)).toEqual({ op: 'arrange_sections', order: [1, 2, 1, 3] })
  })

  it('offers no arranging on a read-only score', () => {
    const { host } = mount(true)
    expect(host.querySelector('.section-actions')).toBeNull()
    expect(host.querySelector('li[draggable="true"]')).toBeNull()
  })
})
