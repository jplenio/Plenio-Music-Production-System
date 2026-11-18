/** A shared player (owner's request 2026-10-16): the page finds its songs inside itself and plays from there;
 * the listener's playlists and settings are kept in their browser. */
import { afterEach, describe, expect, it, vi } from 'vitest'

const DATA = {
  format: 'plenio.portable/1',
  id: 'abc123',
  title: 'Party Mix',
  created: '2026-10-16T20:00:00',
  plenio: '0.8.1',
  bitrate: 160,
  songs: [{ id: 's1', title: 'First' }, { id: 's2', title: 'Second' }],
  details: { s1: { id: 's1', title: 'First', lines: [] } },
  peaks: { s1: [0.1, 0.5, 1] },
  settings: { lyrics: { effect: 'neon' } },
  presets: [],
  playlists: [{ name: 'Both', songs: ['s1', 's2'] }],
}

afterEach(() => {
  document.body.innerHTML = ''
  localStorage.clear()
  vi.resetModules()
})

async function sharedPage(): Promise<typeof import('../src/player/api')> {
  document.body.innerHTML = `<div id="app"></div><script type="application/json" id="plenio-portable">${JSON.stringify(DATA)}</script>`
  vi.resetModules()
  return import('../src/player/api')
}

describe('a shared player', () => {
  it('is the Plenio Player without the page’s songs inside it', async () => {
    vi.resetModules()
    const { isPortable } = await import('../src/player/portable')
    expect(isPortable).toBe(false)
  })

  it('reads its songs, details and waveforms from inside the page', async () => {
    const { api, media } = await sharedPage()
    const { isPortable } = await import('../src/player/portable')
    expect(isPortable).toBe(true)
    expect((await api.library()).songs.map((s) => s.title)).toEqual(['First', 'Second'])
    expect((await api.song('s1')).title).toBe('First')
    await expect(api.song('nope')).rejects.toThrow()
    expect((await api.peaks('s1')).peaks).toEqual([0.1, 0.5, 1])
    // what needs the Plenio Player is not there
    await expect(api.removeSong('s1', 'delete')).rejects.toThrow(/shared player/)
    await expect(api.packageStart({ songs: [], title: '', bitrate: 192, pdf: false })).rejects.toThrow()
    expect(media('s1', 'record')).toBe('')
  })

  it('starts with the playlists and the look it was shared with, and keeps the listener’s own', async () => {
    const { api } = await sharedPage()
    const first = await api.state()
    expect(first.playlists.map((p) => [p.name, p.songs])).toEqual([['Both', ['s1', 's2']]])
    expect(first.settings).toEqual({ lyrics: { effect: 'neon' } })
    await api.saveState({ ...first, favorites: ['s2'] })
    expect(JSON.parse(localStorage.getItem('plenio-portable:abc123') ?? '{}').favorites).toEqual(['s2'])
    expect((await api.state()).favorites).toEqual(['s2'])
  })

  it('starts in the order it was shared in when it is an album', async () => {
    document.body.innerHTML = `<div id="app"></div><script type="application/json" id="plenio-portable">${JSON.stringify({ ...DATA, ordered: true })}</script>`
    vi.resetModules()
    const { api } = await import('../src/player/api')
    expect((await api.state()).settings).toEqual({ lyrics: { effect: 'neon' }, sort: 'shared' })
  })
})
