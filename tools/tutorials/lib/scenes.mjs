// The score editor's scenes of 0.4.0: the overview with the lyrics lane, the lyrics, the cursor and
// playback, copy and paste at the cursor, arranging sections and the files. Every scene leaves the song
// as the model made it, except the arranged section (a script keeps it to show what follows).

import { DIALOG, free, roll, scrollToVoice, undo, undoMark } from './sheet.mjs'

// the visible elements of the roll matching `selector` (left of the pitch column and past the right edge excluded)
function visible(s, selector) {
  return s.page.evaluate(
    ([dialog, sel]) => {
      const d = document.querySelector(dialog)
      const box = d.querySelector('.roll-scroll').getBoundingClientRect()
      return [...d.querySelectorAll(sel)]
        .map((e) => {
          const r = e.getBoundingClientRect()
          return { x: r.x, y: r.y, width: r.width, height: r.height, text: e.textContent.trim() }
        })
        .filter((r) => r.width > 0 && r.x > box.left + 40 && r.x + Math.min(r.width, 60) < box.right - 10)
    },
    [DIALOG, selector]
  )
}

// a click in the ruler at the start of a bar shown in the roll (the cursor snaps to the grid)
async function cursorAt(s, which = 0.4) {
  const bars = await visible(s, 'text.bar-number')
  if (!bars.length) throw new Error('no bar numbers in the roll')
  const bar = bars[Math.min(bars.length - 1, Math.floor(bars.length * which))]
  const ruler = await s.page.evaluate((dialog) => document.querySelector(dialog).querySelector('.roll-svg .ruler').getBoundingClientRect().toJSON(), DIALOG)
  await s.click({ x: bar.x - 3, y: ruler.y + ruler.height / 2, width: 0, height: 0 }, { pause: 300 })
  return bar.text
}

// The three views, the section list and - with lyrics - the lyrics lane.
export async function overview(s, { lyrics = false } = {}) {
  const d = s.page.locator(DIALOG)
  const geo = await roll(s, 'vocal')
  await s.say('The score is shown three ways: the piano roll on top, the notation below, the inspector on the right.', 4200)
  await s.spotlight(geo.box, { ms: 1500, pad: 2 })
  await s.wait(1600)
  await s.spotlight(d.locator('.notation-wrap').first(), { ms: 1500, pad: 2 })
  await s.wait(1600)
  const sections = d.locator('.navigator .sections').first()
  if (await sections.count()) {
    const text = 'On the left, the song’s sections - new in 0.4: you arrange them like on a DAW’s arranger track.'
    s.caption(text)
    await s.spotlight(sections, { ms: 2600, pad: 4 })
    await s.read(text, 4200)
  }
  if (lyrics && (await d.locator('.lyrics-lane').count())) {
    await scrollToVoice(s, 'vocal')
    const text = 'Also new: the lyrics stand over the notes they are sung on - each line over its phrase, each syllable over its note.'
    s.caption(text)
    await s.spotlight(d.locator('.lyrics-lane').first(), { ms: 3400, pad: 2 })
    await s.read(text, 5800)
  }
}

// The syllables in the notation; a line is edited in the lane where it is sung, then undone.
export async function lyricsDemo(s) {
  const d = s.page.locator(DIALOG)
  await scrollToVoice(s, 'vocal')
  const syllable = d.locator('.notation svg .abcjs-lyric').first()
  if (await syllable.count()) {
    const text = 'The notation shows the same syllables under the Vocal notes.'
    s.caption(text)
    await s.spotlight(syllable, { ms: 2800, pad: 40 })
    await s.read(text, 3800)
  }
  const lines = await visible(s, '.lyric-line rect')
  const line = lines.find((l) => l.width > 60) ?? lines[0]
  if (!line) return
  const to = await undoMark(s)
  s.caption('Double-click a line in the lyrics lane to edit it right there.')
  await s.click({ x: line.x + Math.min(40, line.width / 2), y: line.y + line.height / 2, width: 0, height: 0 }, { count: 2, pause: 400 })
  const input = d.locator('input.lyric-edit')
  await input.waitFor({ state: 'visible', timeout: 5000 })
  await s.wait(900)
  const words = (await input.inputValue()).split(/\s+/).filter(Boolean)
  await s.keys('Control+a', { labels: ['Ctrl', 'A'] })
  await s.type([...words.slice(0, Math.max(1, words.length - 2)), 'under the open sky'].join(' '), { delay: 70 })
  await s.wait(500)
  await s.keys('Enter', { labels: ['Enter'] })
  await s.wait(2200)
  const changed = 'The words move onto their notes in the roll and the notation. Apply writes the lyrics into Song Sheet · Text.'
  s.caption(changed)
  await s.spotlight(d.locator('.lyrics-follow').first(), { ms: 3000, pad: 4 })
  await s.read(changed, 5400)
  await undo(s, 1, 'Ctrl+Z undoes a lyrics edit too - back to the writer’s words.', { to })
  await s.wait(800)
}

// The cursor: a click in the ruler, playback from there with a line that follows; with a source, A/B.
export async function cursorDemo(s, { source = false } = {}) {
  const d = s.page.locator(DIALOG)
  const intro = 'New: click in the ruler - the bar numbers - to set the cursor, as in Cubase.'
  s.caption(intro)
  const bar = await cursorAt(s, 0.35)
  await s.wait(900)
  await s.spotlight(d.locator('.roll-svg .locator-mark').first(), { ms: 2200, pad: 14 })
  await s.read(intro, 3600)
  s.caption(`Playback starts at the cursor (bar ${bar}). A green line follows the music; on stop the cursor stays where it was.`)
  const play = d.locator('button', { hasText: '▶ notes' }).first()
  const where = await s.click(play, { pause: 300 })
  await s.wait(6500)
  await s.click({ x: where.x, y: where.y, width: 0, height: 0 }, { pause: 200 })
  await s.wait(1000)
  const keys = 'The transport sits right under the roll, in reach of both. Space plays and stops; Home and End go to the start and the end.'
  s.caption(keys)
  await s.spotlight(d.locator('.transport').first(), { ms: 2400, pad: 4 })
  await s.read(keys, 5200)
  const original = d.locator('button', { hasText: '▶ source' }).first()
  if (source && (await original.count())) {
    s.caption('▶ source plays the original recording from the cursor’s bar - A/B switches between the notes and the source.')
    const at = await s.click(original, { pause: 300 })
    await s.wait(6000)
    await s.click({ x: at.x, y: at.y, width: 0, height: 0 }, { pause: 200 })
    await s.wait(800)
  }
}

// Copy and paste at the cursor: overwrite (Ctrl+V) and insert (Ctrl+Shift+V), both undone.
export async function clipboardDemo(s, { voice = 'vocal' } = {}) {
  const d = s.page.locator(DIALOG)
  await scrollToVoice(s, voice)
  const geo = await roll(s, voice)
  const phrase = geo.visible.slice(0, Math.min(5, geo.visible.length))
  if (phrase.length < 2) return
  const x0 = Math.min(...phrase.map((n) => n.x)) - 8, y0 = Math.min(...phrase.map((n) => n.y)) - 8
  const x1 = Math.max(...phrase.map((n) => n.x + n.width)) + 8, y1 = Math.max(...phrase.map((n) => n.y + n.height)) + 8
  const corners = [[{ x: x1, y: y1 }, { x: x0, y: y0 }], [{ x: x0, y: y0 }, { x: x1, y: y1 }], [{ x: x1, y: y0 }, { x: x0, y: y1 }]]
  const [a, b] = corners.find(([c]) => free(geo, c.x, c.y) && c.y > geo.top) ?? corners[0]
  s.caption('Copy and paste work like a DAW’s key editor. Frame a phrase in Select mode …')
  await s.click(d.locator('button', { hasText: 'Select' }).first(), { pause: 300 })
  await s.drag(a, b, { ms: 1200, hold: 250 })
  await s.wait(900)
  s.caption('… Ctrl+C copies it …')
  await s.keys('Control+c', { labels: ['Ctrl', 'C'] })
  await s.wait(1600)
  s.caption('… set the cursor further on …')
  await cursorAt(s, 0.75)
  await s.wait(900)
  const to = await undoMark(s)
  s.caption('… and Ctrl+V pastes it there, replacing what that voice played.')
  await s.keys('Control+v', { labels: ['Ctrl', 'V'] })
  await s.wait(2600)
  await undo(s, 1, 'Ctrl+Z.', { to })
  s.caption('Ctrl+Shift+V inserts it instead: everything after the cursor moves later by whole bars - watch the bar numbers.')
  await s.keys('Control+Shift+V', { labels: ['Ctrl', 'Shift', 'V'] })
  await s.wait(3800)
  await undo(s, 1, 'Ctrl+Z - the song is as it was. Ctrl+X cuts, Ctrl+D duplicates; the buttons are in the roll’s toolbar.', { to })
  await s.spotlight(d.locator('.clip-tools').first(), { ms: 2600, pad: 4 })
  await s.wait(3000)
  await s.click(d.locator('button', { hasText: 'Draw' }).first(), { pause: 250 })
}

// Arranging sections: a copied section (kept), a move (undone); `follows` says what follows it.
export async function arrangeDemo(s, { follows } = {}) {
  const d = s.page.locator(DIALOG)
  const labels = await d.locator('.navigator .sections li .section-head strong').allTextContents()
  let index = labels.lastIndexOf('chorus')
  if (index < 0) index = Math.max(0, labels.length - 2)
  const name = labels[index]
  s.caption(`Arrange the song: click a section to select it - here the ${name} …`)
  await s.click(d.locator('.navigator .sections li .section-head').nth(index), { pause: 400 })
  await s.wait(1200)
  s.caption('… and Ctrl+D duplicates it: a copy right after it, with its notes, chords and bars.')
  await s.keys('Control+d', { labels: ['Ctrl', 'D'] })
  await s.wait(2800)
  if (follows) {
    s.caption(follows)
    const panel = d.locator('.lyrics-follow').first()
    if (await panel.count()) await s.spotlight(panel, { ms: 4400, pad: 4 })
    await s.read(follows, 6600)
  }
  const to = await undoMark(s)
  s.caption('Ctrl+↑ / Ctrl+↓ move the selection, Del deletes it, and sections can be dragged - with Alt held, as a copy.')
  await s.keys('Control+ArrowUp', { labels: ['Ctrl', '↑'] }) // up: the copy may be the last section
  await s.wait(2200)
  await undo(s, 1, 'We keep the extra section, but not the move: Ctrl+Z.', { to })
  await s.wait(800)
  await s.spotlight(d.locator('.section-actions').first(), { ms: 2400, pad: 4 })
  await s.wait(2400)
}

// Arranging single bars in the bar strip: two bars selected, duplicated and moved - then undone.
export async function barsDemo(s) {
  const d = s.page.locator(DIALOG)
  const strip = d.locator('.bar-strip').first()
  if (!(await strip.count())) return
  const bars = d.locator('.bar-strip .bar')
  const count = await bars.count()
  if (count < 6) return
  // two bars from the middle of a section of at least four bars: the section just grows (copying a
  // section's first bar would start a new section with that section's words)
  const ranges = await d.locator('.navigator .sections li .facts').allTextContents()
  const spans = ranges.map((text) => /bars (\d+)-(\d+)/.exec(text)).filter(Boolean).map((m) => [Number(m[1]), Number(m[2])])
  const long = spans.find(([a, b]) => b - a >= 3) ?? [Math.floor(count * 0.35), count]
  const first = long[0] // 0-based position of the section's second bar
  const actions = d.locator('.bar-actions').first()
  await actions.scrollIntoViewIfNeeded()
  await bars.nth(first + 1).scrollIntoViewIfNeeded()
  await s.wait(600)
  const to = await undoMark(s)
  const intro = 'New: the bar strip under the sections arranges single bars, the same way as sections.'
  s.caption(intro)
  await s.spotlight(strip, { ms: 2600, pad: 4 })
  await s.read(intro, 4600)
  s.caption('Click a bar, Shift+click the next one: two bars are selected …')
  await s.click(bars.nth(first), { pause: 300 })
  await s.wait(700)
  await s.hover(bars.nth(first + 1))
  await s.page.keyboard.down('Shift')
  await s.page.mouse.down()
  await s.page.mouse.up()
  await s.page.keyboard.up('Shift')
  await s.wait(1400)
  // the keys must reach the bars, not the sections picked before
  const picked = await d.locator('.bar-strip .bar.picked').count()
  if (picked !== 2) throw new Error(`the bar scene picked ${picked} bars, not 2`)
  s.caption('… and the buttons above the strip work on them. Ctrl+D duplicates them, right after the last one.')
  await s.spotlight(actions, { ms: 2200, pad: 4 })
  await s.wait(1600)
  await s.keys('Control+d', { labels: ['Ctrl', 'D'] })
  await s.wait(2800)
  s.caption('Ctrl+← and Ctrl+→ move them, Del deletes them, and bars can be dragged - with Alt held, as a copy.')
  await s.keys('Control+ArrowLeft', { labels: ['Ctrl', '←'] })
  await s.wait(2600)
  await undo(s, 2, 'Ctrl+Z twice - the song is as it was. The Guide track and the lyrics follow every bar edit, as with sections.', { to })
  await s.wait(1200)
}

// The files: MusicXML and the project file (next to MIDI).
export async function filesDemo(s) {
  const d = s.page.locator(DIALOG)
  const group = d.locator('.midi-tools').first()
  if (!(await group.count())) return
  const xml = 'Export MusicXML hands the sheet music - with the lyrics - to MuseScore, Sibelius, Dorico or Cubase.'
  s.caption(xml)
  await s.spotlight(group, { ms: 3000, pad: 4 })
  await s.hover(d.locator('.midi-tools button', { hasText: 'Export MusicXML' }).first())
  await s.read(xml, 4600)
  const project = 'Save project keeps the score, the Guide notes and the lyrics in one file - Open project… brings them back later.'
  s.caption(project)
  await s.hover(d.locator('.midi-tools button', { hasText: 'Save project' }).first())
  await s.read(project, 4800)
}

// After Approve the node turns green at once (0.4.0) - no run needed to see it.
export async function showApproved(s, nodeId, text = 'The node says ✓ approved at once.') {
  s.caption(text)
  await s.flyNodes([nodeId], 1000, 0.9)
  await s.read(text, 3600)
}
