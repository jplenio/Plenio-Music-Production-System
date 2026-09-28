/**
 * The Song Sheet window and its pane sizes (owner's request, 2026-09-28): the window is resizable
 * and can fill the browser window, and the scores's panes are draggable. The arithmetic is pure and
 * lives in ``paneSizes.ts``; this file pins its clamps and the storage round trip.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  DIALOG_DEFAULT,
  DIALOG_MIN,
  NOTATION_MAX,
  NOTATION_MIN,
  ROLL_MAX,
  ROLL_MIN,
  SIDE_MAX,
  SIDE_MIN,
  clampDialog,
  defaultGeometry,
  loadGeometry,
  rollHeightAfter,
  saveGeometry,
  shareAfter,
  shareValue,
  sideWidthAfter
} from '../src/sheet-editor/paneSizes'

const VIEWPORT = { width: 1920, height: 1080 }

describe('the window geometry', () => {
  it('keeps a dragged size inside the viewport and above the minimum', () => {
    expect(clampDialog({ width: 1000, height: 700 }, VIEWPORT)).toEqual({ width: 1000, height: 700 })
    expect(clampDialog({ width: 100, height: 100 }, VIEWPORT)).toEqual(DIALOG_MIN)
    expect(clampDialog({ width: 5000, height: 5000 }, VIEWPORT)).toEqual({ width: 1904, height: 1064 })
    expect(clampDialog({ width: Number.NaN, height: 700 }, VIEWPORT)).toEqual({
      width: DIALOG_MIN.width,
      height: 700
    })
  })

  it('never asks for more than a small window can give', () => {
    const small = { width: 500, height: 300 }
    expect(clampDialog({ width: 1200, height: 900 }, small)).toEqual(DIALOG_MIN)
  })

  it('round-trips through the storage and falls back on nonsense', () => {
    vi.stubGlobal('innerWidth', 1920)
    vi.stubGlobal('innerHeight', 1080)
    const saved: Record<string, string> = {}
    const storage = {
      getItem: (key: string) => saved[key] ?? null,
      setItem: (key: string, value: string) => void (saved[key] = value)
    }
    const geometry = { width: 1500, height: 820, maximized: true }
    saveGeometry(geometry, storage)
    expect(loadGeometry(storage)).toEqual(geometry)

    saved['plenio.sheet.dialog'] = '{ not json'
    expect(loadGeometry(storage)).toEqual(defaultGeometry())
    expect(loadGeometry(null)).toEqual({ ...DIALOG_DEFAULT, maximized: false })
  })

  it('clamps a stored size to the window it is loaded in', () => {
    vi.stubGlobal('innerWidth', 1024)
    vi.stubGlobal('innerHeight', 768)
    const storage = { getItem: () => JSON.stringify({ width: 1500, height: 900, maximized: false }) }
    expect(loadGeometry(storage)).toEqual({ width: 1008, height: 752, maximized: false })
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('the pane sizes', () => {
  it('clamps the piano roll to its range', () => {
    expect(rollHeightAfter(280, 40)).toBe(320)
    expect(rollHeightAfter(280, -500)).toBe(ROLL_MIN)
    expect(rollHeightAfter(700, 500)).toBe(ROLL_MAX)
  })

  it('turns a drag into a notation share and clamps it', () => {
    expect(shareAfter(0.6, 60, 600)).toBe(0.7)
    expect(shareAfter(0.6, -600, 600)).toBe(NOTATION_MIN)
    expect(shareAfter(0.6, 600, 600)).toBe(NOTATION_MAX)
    // a column that is not measured yet keeps the share it had
    expect(shareAfter(0.5, 40, 0)).toBe(0.5)
  })

  it('clamps the notation share and the side column on their own', () => {
    expect(shareValue(0.42)).toBe(0.42)
    expect(shareValue(0.99)).toBe(NOTATION_MAX)
    expect(sideWidthAfter(230, 40)).toBe(270)
    expect(sideWidthAfter(230, -1000)).toBe(SIDE_MIN)
    expect(sideWidthAfter(230, 1000)).toBe(SIDE_MAX)
  })
})
