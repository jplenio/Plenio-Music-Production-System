// The Song Sheet parts of the tutorials: open a sheet, walk through its tabs, approve it, and the score
// editor's scenes - the overview, the lyrics lane, editing notes, the cursor and playback, copy and paste
// at the cursor, arranging sections and the files (0.4.0). Every scene leaves the song as the model made
// it, except where a script asks to keep a change (an arranged section).

export const DIALOG = '.plenio-overlay .plenio-dialog'

export async function openSheet(s, nodeId, text) {
  if (text) s.caption(text)
  let box = await s.nodeButton(nodeId, 'Edit Song Sheet')
  // a node off screen: its button's box is off screen too (a click there hit the workflow tabs)
  const view = s.page.viewportSize()
  if (!box || box.x < 70 || box.y < 70 || box.x + box.width > view.width - 20 || box.y + box.height > view.height - 20) {
    await s.flyNodes([nodeId], 1100, 0.9)
    box = await s.nodeButton(nodeId, 'Edit Song Sheet')
  }
  await s.spotlight(box, { ms: 1200 })
  await s.click(box, { pause: 400 })
  await s.page.locator(DIALOG).waitFor({ state: 'visible', timeout: 15000 })
  await s.wait(1200)
}

export async function tab(s, name, text, { min = 3200 } = {}) {
  const t = s.page.locator(DIALOG).getByRole('tab', { name, exact: true })
  if (text) s.caption(text)
  await s.click(t)
  await s.read(text, min)
}

export async function approve(s, text) {
  const button = s.page.locator(DIALOG).getByRole('button', { name: 'Approve', exact: true })
  if (text) s.caption(text)
  await s.spotlight(button, { ms: 1400 })
  await s.wait(700)
  await s.click(button, { pause: 400 })
  await s.page.locator(DIALOG).waitFor({ state: 'detached', timeout: 15000 }).catch(() => {})
  await s.rest()
  await s.wait(500)
}

export async function maximize(s, text) {
  const d = s.page.locator(DIALOG)
  const button = d.locator('button', { hasText: '⛶' }).first()
  if (!(await button.count())) return
  if (text) s.caption(text)
  await s.click(button, { pause: 300 })
  await s.wait(1400)
}

// geometry of the roll: its visible box, the notes of a voice that are visible, the chords
export async function roll(s, voice) {
  return s.page.evaluate(([sel, v]) => {
    const d = document.querySelector(sel)
    const scroller = d.querySelector('.roll-scroll').getBoundingClientRect()
    const lane = (d.querySelector('.roll-svg .lyrics-lane') ?? d.querySelector('.roll-svg .lane'))?.getBoundingClientRect()
    const top = lane ? lane.bottom + 2 : scroller.top + 44
    const inside = (r) => r.left >= scroller.left + 40 && r.right <= scroller.right - 10 && r.top >= top && r.bottom <= scroller.bottom - 12
    const notes = [...d.querySelectorAll('rect.note')].map((n) => {
      const r = n.getBoundingClientRect()
      return { x: r.x, y: r.y, width: r.width, height: r.height, title: n.querySelector('title')?.textContent ?? '', voice: n.classList.contains('vocal') ? 'vocal' : 'ins', visible: inside(r) }
    })
    const chords = [...d.querySelectorAll('g.chord')].map((g) => {
      const r = g.querySelector('rect').getBoundingClientRect()
      return { x: r.x, y: r.y, width: r.width, height: r.height, name: g.textContent.trim() }
    }).filter((c) => c.x > scroller.left + 40 && c.x + c.width < scroller.right - 10)
    return { box: { x: scroller.x, y: scroller.y, width: scroller.width, height: scroller.height }, top, notes, visible: notes.filter((n) => n.visible && n.voice === v), chords }
  }, [DIALOG, voice])
}

export const free = (geo, x, y) => !geo.notes.some((n) => x >= n.x - 6 && x <= n.x + n.width + 6 && y >= n.y - 4 && y <= n.y + n.height + 4)

// A frame over a phrase of the visible notes (up to six in a row) that stays clear of the pane's edges -
// at the bottom edge the pane scrolls along with the pointer, which pulled the frame away from its notes
// in the 0.4.4 recording. Returns where the drag starts and ends (the start on an empty place).
export function framePhrase(geo) {
  const notes = [...geo.visible].sort((a, b) => a.x - b.x)
  const right = geo.box.x + geo.box.width - 40, bottom = geo.box.y + geo.box.height - 34, top = geo.top + 14
  const frameOf = (run) => ({
    x0: Math.min(...run.map((n) => n.x)) - 8, y0: Math.min(...run.map((n) => n.y)) - 8,
    x1: Math.max(...run.map((n) => n.x + n.width)) + 8, y1: Math.max(...run.map((n) => n.y + n.height)) + 8
  })
  const fits = (f) => f.y0 > top && f.y1 < bottom && f.x1 < right && f.x0 > geo.box.x + 50
  let best = null
  for (let i = 0; i < notes.length; i++) {
    for (let j = Math.min(notes.length, i + 6); j > i + 1; j--) {
      const f = frameOf(notes.slice(i, j))
      if (fits(f) && (!best || j - i > best.count)) best = { count: j - i, f }
    }
  }
  if (!best) throw new Error('no phrase to frame clear of the roll’s edges')
  const { x0, y0, x1, y1 } = best.f
  const corners = [[{ x: x0, y: y0 }, { x: x1, y: y1 }], [{ x: x1, y: y1 }, { x: x0, y: y0 }], [{ x: x1, y: y0 }, { x: x0, y: y1 }], [{ x: x0, y: y1 }, { x: x1, y: y0 }]]
  return corners.find(([a]) => free(geo, a.x, a.y)) ?? corners[0]
}

// What the roll has selected: notes and chord symbols.
export function selectedInRoll(s) {
  return s.page.evaluate((sel) => {
    const d = document.querySelector(sel)
    return { notes: d.querySelectorAll('rect.note.selected').length, chords: d.querySelectorAll('g.chord.selected').length }
  }, DIALOG)
}

// The step Ctrl+Z would undo next (the Undo button's title) - a mark to undo back to.
export function undoMark(s) {
  return s.page.evaluate((sel) => document.querySelector(sel)?.querySelector('button[title^="Undo"]')?.title ?? '', DIALOG)
}

// Ctrl+Z up to `times` times, but never past `to` (an undoMark): a demo step that changed nothing (a
// resize against the next note, say) must not undo an edit made before the demo.
export async function undo(s, times = 1, text, { to } = {}) {
  if (text) s.caption(text)
  for (let i = 0; i < times; i++) {
    if (to !== undefined && (await undoMark(s)) === to) break
    await s.keys('Control+z', { labels: ['Ctrl', 'Z'] })
    await s.wait(650)
  }
  await s.wait(700)
}

// A real fix first, when the sheet has one: the score's section names against the lyrics' (the
// planner may call a section "interlude" where the lyrics have a chorus). This edit stays.
export async function fixSections(s) {
  const d = s.page.locator(DIALOG)
  const mismatch = await s.page.evaluate((sel) => {
    const dialog = document.querySelector(sel)
    const text = [...dialog.querySelectorAll('li')].map((x) => x.innerText).find((t) => /lyrics have sections/.test(t))
    const m = text?.match(/lyrics have sections \[(.*?)\] but the score has \[(.*?)\]/)
    if (!m) return null
    const list = (x) => [...x.matchAll(/'([^']*)'/g)].map((y) => y[1])
    const lyrics = list(m[1]), score = list(m[2])
    if (lyrics.length !== score.length) return null
    const index = lyrics.findIndex((name, k) => name !== score[k])
    return index < 0 ? null : { index, from: score[index], to: lyrics[index] }
  }, DIALOG)
  if (!mismatch) return
  const warning = `The sheet warns: the lyrics expect a ${mismatch.to} where the score says “${mismatch.from}”.`
  s.caption(warning)
  await s.spotlight(d.locator('li', { hasText: 'lyrics have sections' }).first(), { ms: 3200, pad: 4 })
  await s.read(warning, 4600)
  s.caption(`Fix it in the section list on the left: Rename “${mismatch.from}” to “${mismatch.to}”.`)
  await s.click(d.getByRole('button', { name: 'Rename', exact: true }).nth(mismatch.index), { pause: 500 })
  const field = d.locator('input[aria-label="Section name"]').first()
  await field.waitFor({ state: 'visible', timeout: 5000 })
  await s.wait(600)
  await s.click(field, { count: 3, pause: 250 })
  await s.type(mismatch.to, { delay: 120 })
  await s.wait(400)
  await s.keys('Enter', { labels: ['Enter'] })
  await s.wait(1800)
  const done = 'Fixed: the warning is gone, and the words will land in the right sections. This edit stays.'
  s.caption(done)
  await s.read(done, 4400)
}

// The other real fix: the score has more sections than the lyrics (a sketch with two verses for lyrics
// with one) - the extra ones are selected in the section list and deleted. This edit stays.
export async function trimSections(s) {
  const d = s.page.locator(DIALOG)
  const extra = await s.page.evaluate((sel) => {
    const dialog = document.querySelector(sel)
    const text = [...dialog.querySelectorAll('li')].map((x) => x.innerText).find((t) => /lyrics have sections/.test(t))
    const m = text?.match(/lyrics have sections \[(.*?)\] but the score has \[(.*?)\]/)
    if (!m) return null
    const list = (x) => [...x.matchAll(/'([^']*)'/g)].map((y) => y[1])
    const lyrics = list(m[1]), score = list(m[2])
    if (lyrics.length >= score.length) return null
    // the lyrics as a subsequence of the score: what is left over goes
    const out = []
    let j = 0
    score.forEach((name, i) => (j < lyrics.length && name === lyrics[j] ? j++ : out.push(i)))
    return j === lyrics.length ? { out, names: out.map((i) => score[i]) } : null
  }, DIALOG)
  if (!extra) return false
  const warning = `The sheet warns: the lyrics have fewer sections than the sketch - ${extra.names.length} of the score’s sections would have no words.`
  s.caption(warning)
  await s.spotlight(d.locator('li', { hasText: 'lyrics have sections' }).first(), { ms: 3200, pad: 4 })
  await s.read(warning, 5000)
  s.caption(`Arrange the score to the words: select the extra ${extra.names.join(' and the ')} - Ctrl+click adds to the selection …`)
  const heads = d.locator('.navigator .sections li .section-head')
  for (const [k, index] of extra.out.entries()) {
    const head = heads.nth(index)
    await head.scrollIntoViewIfNeeded()
    if (k === 0) await s.click(head, { pause: 400 })
    else {
      await s.hover(head)
      await s.page.keyboard.down('Control')
      await s.page.mouse.down()
      await s.page.mouse.up()
      await s.page.keyboard.up('Control')
    }
    await s.wait(900)
  }
  s.caption('… and Del deletes them. The bars after them move up.')
  await s.keys('Delete', { labels: ['Del'] })
  await s.wait(2200)
  const done = 'Now the score and the lyrics have the same sections: the warning is gone, and the words sit over the melody.'
  s.caption(done)
  await s.read(done, 5000)
  return true
}

// Scroll the roll to where the voice starts (an instrumental intro can fill the first bars).
export async function scrollToVoice(s, voice) {
  const page = s.page
  const need = () => page.evaluate(([sel, v]) => {
    const d = document.querySelector(sel)
    const box = d.querySelector('.roll-scroll').getBoundingClientRect()
    const first = [...d.querySelectorAll(`rect.note.${v}`)].map((n) => n.getBoundingClientRect().x).sort((a, b) => a - b)[0]
    return first === undefined ? 0 : first - (box.left + 150)
  }, [DIALOG, voice])
  let distance = await need()
  if (distance < 60) return
  const geo = await roll(s, voice)
  s.caption('Shift + mouse wheel scrolls through the bars - here to where the singing starts.')
  await s.hover(geo.box, { fx: 0.55, fy: 0.62 })
  await page.evaluate(() => window.__tut.keys(['Shift', 'Wheel'], 2600))
  await page.keyboard.down('Shift')
  for (let i = 0; i < 40 && distance > 30; i++) {
    const before = distance
    await page.mouse.wheel(0, Math.min(140, distance))
    await s.wait(90)
    distance = await need()
    if (Math.abs(before - distance) < 1) await page.mouse.wheel(Math.min(140, distance), 0) // no horizontal wheel for Shift here
  }
  await page.keyboard.up('Shift')
  await s.wait(1200)
}

// Editing notes: select, arrow keys, the toolbar, drag, resize, draw, frame-select, chords - each change
// is undone again, so the song keeps the model's melody.
export async function noteEditing(s, { voice = 'vocal' } = {}) {
  const page = s.page
  const d = page.locator(DIALOG)
  await scrollToVoice(s, voice)
  let geo = await roll(s, voice)
  if (geo.visible.length < 3) throw new Error('not enough visible notes in the roll')
  const to = await undoMark(s)

  // select a note
  const note = geo.visible[Math.min(2, geo.visible.length - 1)]
  s.caption('Click a note: the roll, the notation and the inspector select it together.')
  await s.click(note, { pause: 350 })
  await s.read('Click a note: the roll, the notation and the inspector select it together.', 3800)

  // arrow keys, then back
  s.caption('The arrow keys move it: ↑ ↓ a semitone, ← → along the grid.')
  await s.keys('ArrowUp', { times: 2, gap: 700 })
  await s.wait(900)
  await undo(s, 2, 'Ctrl+Z undoes every step - the note is back where it was.', { to })

  // the toolbar
  const tools = d.getByRole('button', { name: '+8va', exact: true }).first()
  s.caption('The toolbar does the same: −1 / +1, an octave, shorter, longer, rest.')
  await s.spotlight(async () => {
    const a = await d.getByRole('button', { name: '−8va', exact: true }).first().boundingBox()
    const b = await d.getByRole('button', { name: 'rest', exact: true }).first().boundingBox()
    return { x: a.x, y: a.y, width: b.x + b.width - a.x, height: a.height }
  }, { ms: 2200 })
  await s.hover(tools)
  await s.wait(2600)

  // drag, then undo
  geo = await roll(s, voice)
  const target = geo.visible.find((n) => Math.abs(n.x - note.x) < 2 && Math.abs(n.y - note.y) < 2) ?? geo.visible[2]
  const from = { x: target.x + target.width * 0.4, y: target.y + target.height / 2 }
  s.caption('Drag a note to move it in time and pitch …')
  await s.drag(from, { x: from.x + 70, y: from.y - 2 * target.height }, { ms: 1100 })
  await s.wait(1400)
  await undo(s, 1, '… and Ctrl+Z undoes any step.', { to })

  // resize by its end, then undo
  geo = await roll(s, voice)
  const roomy = (n) => free(geo, n.x + n.width + 12, n.y + n.height / 2) && free(geo, n.x + n.width + 50, n.y + n.height / 2)
  const longer = geo.visible.find((n) => Math.abs(n.x - note.x) < 2 && Math.abs(n.y - note.y) < 2 && roomy(n)) ?? geo.visible.find(roomy) ?? geo.visible[2]
  s.caption('Drag its right end to make it longer or shorter.')
  const end = { x: longer.x + longer.width - 2, y: longer.y + longer.height / 2 }
  await s.drag(end, { x: end.x + 45, y: end.y }, { ms: 900 })
  await s.wait(1300)
  await undo(s, 1, undefined, { to })

  // draw a note on an empty place (in the row of the selected note, after it), then undo
  geo = await roll(s, voice)
  const anchor = geo.visible[Math.min(2, geo.visible.length - 1)]
  const row = anchor.y + anchor.height / 2
  let spot = null
  for (let x = anchor.x + anchor.width + 20; x < geo.box.x + geo.box.width - 120 && !spot; x += 12) {
    if (free(geo, x, row) && free(geo, x + 60, row) && free(geo, x + 30, row)) spot = { x, y: row }
  }
  if (spot) {
    s.caption('Draw mode: drag on an empty place to draw a new note (into the voice chosen under “draw into”).')
    await s.spotlight(d.locator('button', { hasText: 'Draw' }).first(), { ms: 1400 })
    await s.wait(1200)
    await s.drag(spot, { x: spot.x + 60, y: spot.y }, { ms: 800 })
    await s.wait(1800)
    await undo(s, 1, undefined, { to })
  }

  // select mode: a frame over a phrase, move it, undo
  geo = await roll(s, voice)
  const [startFrame, endFrame] = framePhrase(geo)
  s.caption('Select mode: pull a frame to select several notes at once …')
  await s.click(d.locator('button', { hasText: 'Select' }).first(), { pause: 300 })
  await s.wait(700)
  await s.drag(startFrame, endFrame, { ms: 1300, hold: 250 })
  await s.wait(1400)
  // the frame must have taken notes (and nothing else) before the arrow keys move them
  const picked = await selectedInRoll(s)
  if (picked.notes < 2 || picked.chords) throw new Error(`the frame selected ${picked.notes} notes and ${picked.chords} chords`)
  s.caption('… and move them together: here two semitones up.')
  await s.keys('ArrowUp', { times: 2, gap: 800 })
  await s.wait(1400)
  await undo(s, 2, 'Ctrl+Z again: back to the melody as it was.', { to })
  await s.click(d.locator('button', { hasText: 'Draw' }).first(), { pause: 250 })

  // chords
  geo = await roll(s, voice)
  const chord = geo.chords[Math.min(2, geo.chords.length - 1)]
  if (chord) {
    s.caption('Double-click a chord symbol to change it; double-click the empty lane to add one.')
    await s.click(chord, { count: 2, pause: 300 })
    const input = d.locator('input.chord-edit')
    await input.waitFor({ state: 'visible', timeout: 4000 })
    await s.wait(500)
    await s.type(chord.name.includes('m') ? chord.name.replace(/m.*$/, '') : `${chord.name.replace(/\/.*$/, '')}sus4`, { delay: 120 })
    await s.wait(500)
    await s.keys('Enter', { labels: ['Enter'] })
    await s.wait(1600)
    await undo(s, 1, undefined, { to })
  }
}
