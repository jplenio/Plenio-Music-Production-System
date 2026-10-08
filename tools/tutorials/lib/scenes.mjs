// The score editor's scenes: a tour of every area first, then the details - the lyrics, the cursor and
// playback (a cover: the original under the notes, its sung pitch, wave, align), the sounds and presets,
// copy and paste at the cursor, arranging sections and bars, recording with a MIDI keyboard and the
// files. Every scene leaves the song as the model made it, except the arranged section (a script keeps
// it to show what follows).

import { DIALOG, framePhrase, roll, scrollToVoice, selectedInRoll, undo, undoMark } from './sheet.mjs'

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

// The visible part of an element of the roll (its lanes are as wide as the whole score).
function inRoll(s, selector) {
  return async () =>
    s.page.evaluate(
      ([dialog, sel]) => {
        const d = document.querySelector(dialog)
        const el = d.querySelector(sel)
        const view = d.querySelector('.roll-scroll').getBoundingClientRect()
        if (!el) return null
        const r = el.getBoundingClientRect()
        const x = Math.max(r.left, view.left + 40), right = Math.min(r.right, view.right)
        const y = Math.max(r.top, view.top), bottom = Math.min(r.bottom, view.bottom)
        return { x, y, width: Math.max(0, right - x), height: Math.max(0, bottom - y) }
      },
      [DIALOG, selector]
    )
}

// A tour of the editor before the details: every area and what it is for. `cover`: the source lane and
// the original under the notes; `daw`: the track headers with their sounds.
export async function editorTour(s, { cover = false, daw = false } = {}) {
  const d = s.page.locator(DIALOG)
  const show = async (text, target, ms, read) => {
    s.caption(text)
    if (target && (await (typeof target === 'function' ? target() : target.count()))) await s.spotlight(target, { ms, pad: 4 })
    await s.read(text, read)
  }
  await s.say('First a quick tour, then the details. The score editor shows one score in several views, always in step.', 5600)
  await show('On top, the piano roll: the notes of the melody and of the second voice, bar by bar - the bar numbers are the ruler.', d.locator('.roll-scroll').first(), 3000, 6000)
  await show('Above the notes, the chord lane: each chord symbol where it starts.', inRoll(s, '.roll-svg rect.lane'), 2600, 4200)
  if (await d.locator('.lyrics-lane').count()) {
    await scrollToVoice(s, 'vocal')
    await show('Under it, the lyrics lane: each line over its phrase, each syllable over its note.', inRoll(s, '.lyrics-lane'), 3000, 5400)
  }
  if (cover && (await d.locator('.roll-svg rect.source-lane').count())) {
    await show('For a cover, the original recording runs in a lane of its own - and the pink curve is the pitch the singer really sang.', inRoll(s, '.roll-svg rect.source-lane'), 3400, 6600)
  }
  await show('The roll’s toolbar: draw or select, the voice you draw into, the grid, copy and paste, zoom and quantize.', d.locator('.roll-tools').first(), 3000, 5800)
  await show(
    cover
      ? 'Under the roll, the transport: play from the cursor, record with a MIDI keyboard, the tracks’ sounds - and what you hear: the notes, the original, or both.'
      : 'Under the roll, the transport: play from the cursor, record with a MIDI keyboard, step input, the tracks’ sounds, loop, metronome and speed.',
    d.locator('.transport').first(),
    3400,
    7000
  )
  await show('Below, the notation: both voices with the chords, the sections and the lyrics. Click a note there, and it is selected everywhere.', d.locator('.notation-wrap').first(), 3000, 6400)
  await show('On the right, the inspector: the selected note, chord or bar, to the exact value.', d.locator('.inspector').first(), 2600, 4600)
  if (daw) await show('On the left, the tracks - each with its own sound and a play switch.', d.locator('.track-panel').first(), 2800, 4800)
  await show('And the song’s sections with the bar strip: arrange the song like on a DAW’s arranger track.', d.locator('.navigator').first(), 2800, 5400)
  await show('At the top: undo and the edit buttons, the layouts, and the files - MIDI, MusicXML, the notation as PDF or picture, and the project.', d.locator('.palette').first(), 2400, 6200)
  const keys = d.locator('.keys-help > button').first()
  if (await keys.count()) {
    s.caption('“keys” lists every key and mouse gesture of the editor.')
    await s.click(keys, { pause: 300 })
    await s.wait(500)
    await s.spotlight(d.locator('.keys-panel').first(), { ms: 2600, pad: 4 })
    await s.read('“keys” lists every key and mouse gesture of the editor.', 4400)
    await s.click(d.locator('.keys-panel button.close').first(), { pause: 250 })
    await s.wait(400)
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
  const intro = 'Click in the ruler - the bar numbers - to set the cursor, as in Cubase.'
  s.caption(intro)
  const bar = await cursorAt(s, 0.35)
  await s.wait(900)
  await s.spotlight(d.locator('.roll-svg .locator-mark').first(), { ms: 2200, pad: 14 })
  await s.read(intro, 3600)
  s.caption(`Playback starts at the cursor (bar ${bar}). A green line follows the music; on stop the cursor stays where it was.`)
  const play = d.locator('button', { hasText: '▶ play' }).first()
  const where = await s.click(play, { pause: 300 })
  await s.wait(6500)
  await s.click({ x: where.x, y: where.y, width: 0, height: 0 }, { pause: 200 })
  await s.wait(1000)
  const keys = 'The transport sits right under the roll, in reach of both. Space plays and stops; Home and End go to the start and the end.'
  s.caption(keys)
  await s.spotlight(d.locator('.transport').first(), { ms: 2400, pad: 4 })
  await s.read(keys, 5200)
  const both = d.locator('.transport .hear button', { hasText: 'both' }).first()
  if (source && (await both.count())) {
    s.caption('The original recording plays right under the notes, bar by bar - A/B switches between the notes and the source at once.')
    await s.click(both, { pause: 300 })
    const at = await s.click(play, { pause: 300 })
    await s.wait(4000)
    await s.click(d.locator('.transport button', { hasText: 'A/B' }).first(), { pause: 300 })
    await s.wait(3000)
    await s.click({ x: at.x, y: at.y, width: 0, height: 0 }, { pause: 200 })
    await s.wait(800)
    // the sung pitch (node Sung Pitch), the view of the source, the beat grid by hand
    const curve = d.locator('.roll-svg path.sung-pitch')
    if (await curve.count()) {
      const sung = 'The pink curve is the sung pitch of the original vocals. Where it leaves a note, the transcription is off - a wrong pitch, a missed note.'
      s.caption(sung)
      await s.spotlight(d.locator('.roll-scroll').first(), { ms: 3200, pad: 2 })
      await s.read(sung, 6200)
    }
    const wave = d.locator(`input[aria-label="Show the source's waveform"]`).first()
    const sungSwitch = d.locator('input[aria-label="Show the sung pitch"]').first()
    if (await wave.count()) {
      const free = 'A cover far from the original? Untick “wave” and “sung”: the roll shows only your notes.'
      s.caption(free)
      await s.click(wave, { pause: 300 })
      if (await sungSwitch.count()) await s.click(sungSwitch, { pause: 300 })
      await s.wait(900)
      await s.read(free, 4600)
      await s.click(wave, { pause: 250 })
      if (await sungSwitch.count()) await s.click(sungSwitch, { pause: 250 })
      await s.wait(500)
    }
    const align = d.locator('.transport button', { hasText: 'align' }).first()
    if (await align.count()) {
      const text = '⇆ align moves the recording against the bars, when the beat detection was off.'
      s.caption(text)
      await s.hover(align)
      await s.read(text, 4200)
    }
  }
}

// A simulated MIDI keyboard for recordDemo (Web MIDI is asked for at the first rec, so the page needs
// no reload): window.__key(note, down) plays it.
export async function simulateKeyboard(s) {
  await s.page.evaluate(() => {
    const input = { id: 'usb-1', name: 'USB MIDI Keyboard', manufacturer: '', state: 'connected', onmidimessage: null }
    const access = { inputs: { forEach: (fn) => fn(input) }, onstatechange: null }
    Object.defineProperty(navigator, 'requestMIDIAccess', { value: () => Promise.resolve(access), configurable: true })
    window.__key = (note, on) => input.onmidimessage?.({ data: new Uint8Array([on ? 0x90 : 0x80, note, 96]), timeStamp: performance.now() })
  })
}

// Recording with a MIDI keyboard (0.4.4): rec from the cursor into Ins, the keys appear while they are
// played, Space keeps the take - then Ctrl+Z, so the sketch stays as it was. The script plays the
// keyboard: a simulated one (window.__key, installed by the tutorial's init script) - the recording
// has no sound of its own anyway. Returns false when there is no keyboard to play.
export async function recordDemo(s) {
  const d = s.page.locator(DIALOG)
  const rec = d.locator('.transport button.rec').first()
  if (!(await rec.count()) || !(await s.page.evaluate(() => typeof window.__key === 'function'))) return false
  const intro = 'Got a MIDI keyboard? Play the notes in, like in a DAW: ● rec records from the cursor into the voice of “draw into”.'
  s.caption(intro)
  await s.spotlight(d.locator('.transport .record').first(), { ms: 2600, pad: 4 })
  await s.read(intro, 5600)
  s.caption('A counter-line for the instrument: draw into Ins, the cursor where it starts.')
  await s.click(d.locator('[aria-label="Draw into"] button.ins').first(), { pause: 400 })
  await s.wait(500)
  await cursorAt(s, 0.3)
  await s.wait(1600)
  const to = await undoMark(s)
  // the score's tempo (the notation's ♩ = n), for playing in time
  const bpm = await s.page.evaluate((dialog) => Number(document.querySelector(dialog)?.querySelector('.notation-wrap')?.textContent.match(/=\s*(\d{2,3})/)?.[1]) || 88, DIALOG)
  const beat = 60000 / bpm
  // the cursor between two beats (bar.beat.sixteenth): the count-in keeps the beats, the line starts on the next
  const sixteenth = await s.page.evaluate((dialog) => Number(document.querySelector(dialog)?.querySelector('.transport .facts')?.textContent.match(/cursor \d+\.\d+\.(\d+)/)?.[1]) || 1, DIALOG)
  const phase = ((sixteenth - 1) * beat) / 4
  const first = phase > 0 ? beat - phase : 0
  s.caption('One bar of count-in, then play. The keys appear as you play them - where you heard them.')
  // the counter-line, timed from the click on rec itself as a player hears it (the audio output a little
  // later): E5 half, G5, E5 | C5 half, E5 - each key let go a little before the next
  await s.page.evaluate(([dialog, ms, offset]) => {
    const button = document.querySelector(dialog)?.querySelector('.transport button.rec')
    button?.addEventListener('click', () => {
      const lead = 4 * ms + 50 + offset + 50
      const t0 = performance.now()
      for (const [at, length, note] of [[0, 2, 76], [2, 1, 79], [3, 1, 76], [4, 2, 72], [6, 2, 76]]) {
        setTimeout(() => window.__key(note, true), Math.max(0, t0 + lead + at * ms - performance.now()))
        setTimeout(() => window.__key(note, false), Math.max(0, t0 + lead + (at + length) * ms - 60 - performance.now()))
      }
    }, { once: true, capture: true })
  }, [DIALOG, beat, first])
  await s.click(rec, { pause: 200 })
  await s.wait(4 * beat + 50 + first + 8.4 * beat - 250)
  const keep = 'Space keeps the take: one undo step, on the quantize grid. Esc would throw it away.'
  s.caption(keep)
  await s.keys('Space', { labels: ['Space'] })
  await s.wait(1200)
  await s.read(keep, 4600)
  const panel = d.locator('.transport .midi-settings > button').first()
  if (await panel.count()) {
    const text = '🎹 holds the rest: the keyboard, count-in, quantize, replace or merge. And “step” writes a note at the cursor with every key - no need to play in time.'
    s.caption(text)
    await s.click(panel, { pause: 300 })
    await s.wait(600)
    await s.spotlight(d.locator('.midi-panel').first(), { ms: 3000, pad: 4 })
    await s.read(text, 7000)
    await s.click(d.locator('.midi-panel button.close').first(), { pause: 300 })
  }
  await undo(s, 1, 'Ctrl+Z - for this video the sketch stays as it was.', { to })
  return true
}

// Copy and paste at the cursor: overwrite (Ctrl+V) and insert (Ctrl+Shift+V), both undone.
export async function clipboardDemo(s, { voice = 'vocal' } = {}) {
  const d = s.page.locator(DIALOG)
  await scrollToVoice(s, voice)
  const geo = await roll(s, voice)
  if (geo.visible.length < 2) return
  const [a, b] = framePhrase(geo)
  s.caption('Copy and paste work like a DAW’s key editor. Frame a phrase in Select mode …')
  await s.click(d.locator('button', { hasText: 'Select' }).first(), { pause: 300 })
  await s.drag(a, b, { ms: 1200, hold: 250 })
  await s.wait(900)
  const picked = await selectedInRoll(s)
  if (picked.notes < 2 || picked.chords) throw new Error(`the frame selected ${picked.notes} notes and ${picked.chords} chords`)
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
  const intro = 'The bar strip under the sections arranges single bars, the same way as sections.'
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

// The files: MusicXML, the notation as PDF or picture, and the project file (next to MIDI).
export async function filesDemo(s) {
  const d = s.page.locator(DIALOG)
  const group = d.locator('.midi-tools').first()
  if (!(await group.count())) return
  const xml = 'Export MusicXML hands the sheet music - with the lyrics - to MuseScore, Sibelius, Dorico or Cubase.'
  s.caption(xml)
  await s.spotlight(group, { ms: 3000, pad: 4 })
  await s.hover(d.locator('.midi-tools button', { hasText: 'Export MusicXML' }).first())
  await s.read(xml, 4600)
  const notation = d.locator('.notation-export > button').first()
  if (await notation.count()) {
    const text = 'Export notation… gives the sheet music as a PDF - pages of A4 or Letter - as a PNG or SVG picture, or prints it.'
    s.caption(text)
    await s.click(notation, { pause: 300 })
    await s.wait(600)
    await s.spotlight(d.locator('.export-panel').first(), { ms: 2800, pad: 4 })
    await s.read(text, 5200)
    const pdf = 'A click on PDF: both voices, the chords, the sections and the lyrics, with the song’s title - ready to print.'
    s.caption(pdf)
    await s.click(d.locator('.export-panel .formats button', { hasText: 'PDF' }).first(), { pause: 300 })
    await s.wait(1500)
    await s.read(pdf, 4600)
  }
  const project = 'Save project keeps the score, the Guide notes, the lyrics and the editor’s settings in one file - Open project… brings them back later.'
  s.caption(project)
  await s.hover(d.locator('.midi-tools button', { hasText: 'Save project' }).first())
  await s.read(project, 5600)
}

// The tracks' sounds and the presets: ♫ sounds, a sound per track, a preset for the kind of song (kept),
// saving one's own. The video has no sound of its own: what ▶ plays is said, not heard.
export async function soundsDemo(s, { preset = 'Pop', daw = false } = {}) {
  const d = s.page.locator(DIALOG)
  const button = d.locator('.transport .sounds-settings > button').first()
  if (!(await button.count())) return
  const intro = 'Every track plays in a sound of its own: “sounds” in the transport.'
  s.caption(intro)
  await s.click(button, { pause: 300 })
  await s.wait(600)
  const panel = d.locator('.sounds-panel').first()
  await s.spotlight(panel, { ms: 2600, pad: 4 })
  await s.read(intro, 4200)
  const tracks = 'Vocal, Instrument, Chords and Guide: piano, strings, pad, organ, a sung “ah” and more - ▶ plays a few notes in the sound.'
  s.caption(tracks)
  await s.hover(panel.locator('select[aria-label="Sound of the Vocal track"]').first())
  await s.wait(800)
  await s.click(panel.locator('button[aria-label="Hear the Vocal sound"]').first(), { pause: 300 })
  await s.read(tracks, 6400)
  const presets = `Presets set them for a kind of song or a way of working - here “${preset}”.`
  s.caption(presets)
  const choose = panel.locator('select[aria-label="Preset"]').first()
  await s.hover(choose)
  await choose.selectOption(preset)
  await s.wait(900)
  await s.click(panel.locator('button', { hasText: /^\s*use\s*$/ }).first(), { pause: 300 })
  await s.wait(900)
  await s.read(presets, 5200)
  const own = '“save current as preset…” keeps your own - in ComfyUI, for every song, in every browser.'
  s.caption(own)
  await s.hover(panel.locator('button', { hasText: 'save current as preset' }).first())
  await s.read(own, 5200)
  await s.click(panel.locator('button.close').first(), { pause: 300 })
  await s.wait(500)
  const headers = d.locator('.track-panel select.sound').first()
  if (daw && (await headers.count())) {
    const text = 'In the DAW layout, every track header has its sound too.'
    s.caption(text)
    await s.spotlight(d.locator('.track-panel').first(), { ms: 2600, pad: 4 })
    await s.read(text, 4200)
  }
}

// After Approve the node turns green at once (0.4.0) - no run needed to see it.
export async function showApproved(s, nodeId, text = 'The node says ✓ approved at once.') {
  s.caption(text)
  await s.flyNodes([nodeId], 1000, 0.9)
  await s.read(text, 3600)
}

// The creative mode's arrangement in Song Sheet · Score (0.4.5, experimental): its line above the
// findings with the badge, then the details - the writer's idea and what every section got. Returns
// the status ('applied', 'partial', 'unchanged', 'fallback') or null when the sheet has none.
export async function arrangementDemo(s, { cover = false } = {}) {
  const d = s.page.locator(DIALOG)
  const panel = d.locator('.arrangement').first()
  if (!(await panel.count())) return null
  const status = await panel.getAttribute('data-status')
  if (status === 'fallback') {
    const text = 'Arrangement not applied: the writer’s plan could not be used, so the score stays as it was - the line says why.'
    s.caption(text)
    await s.spotlight(panel, { ms: 4200, pad: 4 })
    await s.read(text, 6400)
    return status
  }
  const line = 'Under the editor, the arrangement: the mode, its closeness and how many sections were arranged - marked “experimental”.'
  s.caption(line)
  await s.spotlight(panel, { ms: 3800, pad: 4 })
  await s.read(line, 6200)
  const summary = panel.locator('summary').first()
  const details = 'Open it: the writer’s idea, and for every section what Plenio wrote - chords, the instrument line, a key lift - and what stayed.'
  s.caption(details)
  await s.click(summary, { fx: 0.05, pause: 300 })
  await s.wait(900)
  await s.spotlight(panel, { ms: 6000, pad: 4 })
  await s.read(details, 8600)
  await s.click(summary, { fx: 0.05, pause: 200 })
  await s.wait(600)
  // the instrument line in the roll: the second voice, where the plan wrote it
  const ins = await roll(s, 'ins')
  if (ins.visible.length) {
    const x0 = Math.min(...ins.visible.map((n) => n.x)) - 6, y0 = Math.min(...ins.visible.map((n) => n.y)) - 6
    const x1 = Math.max(...ins.visible.map((n) => n.x + n.width)) + 6, y1 = Math.max(...ins.visible.map((n) => n.y + n.height)) + 6
    const text = cover
      ? 'In the roll, the instrument line is the second voice: Plenio wrote it note by note from the plan - the melody stays the original.'
      : 'In the roll, the instrument line is the second voice: Plenio wrote it note by note from the plan, on the chords above it.'
    s.caption(text)
    await s.spotlight({ x: x0, y: y0, width: x1 - x0, height: y1 - y0 }, { ms: 4200, pad: 4 })
    await s.read(text, 6600)
  }
  return status
}

// Export's sheet music (0.4.5): the page draws the PDF right after the export and Plenio saves it next
// to the song; the node's summary then says saved.
export async function sheetMusicSaved(s, node, text) {
  await s.page
    .waitForFunction((key) => {
      const el = window.__tut.node(key).widgets?.find((w) => w.name === 'plenio_summary')?.element
      return /sheet music[^]*saved/i.test(el?.textContent ?? '')
    }, node, { timeout: 120000 })
    .catch(() => {})
  // a long summary (the cover's export lists many reports) is clipped by the node: let it show all
  await s.page.evaluate((key) => {
    const n = window.__tut.node(key)
    const el = n.widgets?.find((w) => w.name === 'plenio_summary')?.element
    const extra = el ? el.scrollHeight - el.clientHeight : 0
    if (extra > 0) {
      n.setSize([n.size[0], n.size[1] + extra + 12])
      window.app.canvas.setDirty(true, true)
    }
  }, node)
  await s.wait(400)
  await s.flyNodes([node], 1100, 0.9)
  s.caption(text)
  const box = await s.page.evaluate(
    (key) => window.__tut.node(key).widgets?.find((w) => w.name === 'plenio_summary')?.element?.getBoundingClientRect().toJSON(),
    node
  )
  if (box?.width) await s.spotlight(box, { ms: 3800, pad: 4 })
  await s.read(text, 6000)
}
