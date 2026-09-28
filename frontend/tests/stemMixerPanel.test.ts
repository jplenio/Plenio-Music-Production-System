/**
 * The Stem Mixer's strips (the owner's report, 2026-09-28): the documented stems are selectable
 * before the first run, a fader can be dragged without losing it under the pointer, and every stem
 * can be marked to be written as its own file.
 */
import { afterEach, describe, expect, it } from 'vitest'

import { addStemMixer } from '../src/extension/stemMixer'
import { parseMix, stripOf } from '../src/shared/stemMix'
import { type Host, host } from './fixtures/host'

function mount(): Host {
  const node = host({ mix: '' })
  addStemMixer(node.node)
  return node
}

function strips(node: Host): string[] {
  return [...node.root.querySelectorAll('.plenio-mix-strip')].map(
    (row) => (row as HTMLElement).dataset.strip ?? ''
  )
}

function fader(node: Host, name: string): HTMLInputElement {
  const found = node.root.querySelector(`input[aria-label="${name} gain"]`)
  if (!found) throw new Error(`no fader for ${name}`)
  return found as HTMLInputElement
}

function saveButton(node: Host, name: string): HTMLButtonElement {
  const found = node.root.querySelector(`button[aria-label="${name} save as its own file"]`)
  if (!found) throw new Error(`no save button for ${name}`)
  return found as HTMLButtonElement
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('the Stem Mixer strips', () => {
  it('shows the documented stems before the first run', () => {
    expect(strips(mount())).toEqual(['vocals', 'drums', 'bass', 'other', 'rest'])
  })

  it('writes a dragged fader and keeps the fader under the pointer', () => {
    const node = mount()
    const gain = fader(node, 'vocals')
    gain.value = '-6'
    gain.dispatchEvent(new Event('input', { bubbles: true }))
    expect(strips(node)).toHaveLength(5) // the drag redraws nothing
    expect(fader(node, 'vocals')).toBe(gain)
    expect(stripOf(parseMix(node.value('mix')), 'vocals').gain_db).toBe(-6)
    gain.value = '-9'
    gain.dispatchEvent(new Event('input', { bubbles: true }))
    expect(fader(node, 'vocals')).toBe(gain)
    gain.dispatchEvent(new Event('change', { bubbles: true }))
    expect(stripOf(parseMix(node.value('mix')), 'vocals').gain_db).toBe(-9)
    expect(fader(node, 'vocals').value).toBe('-9')
    expect(stripOf(parseMix(node.value('mix')), 'drums').gain_db).toBe(0)
  })

  it('marks a stem to be written as its own file', () => {
    const node = mount()
    expect(saveButton(node, 'drums').getAttribute('aria-pressed')).toBe('false')
    saveButton(node, 'drums').dispatchEvent(new MouseEvent('click', { bubbles: true }))
    const again = saveButton(node, 'drums')
    expect(again.getAttribute('aria-pressed')).toBe('true')
    expect(stripOf(parseMix(node.value('mix')), 'drums').save).toBe(true)
    expect(stripOf(parseMix(node.value('mix')), 'vocals').save).toBe(false)
    saveButton(node, 'drums').dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(stripOf(parseMix(node.value('mix')), 'drums').save).toBe(false)
    expect(parseMix(node.value('mix'))!.strips.drums).toBeUndefined()
  })
})
