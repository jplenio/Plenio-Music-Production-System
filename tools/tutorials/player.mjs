// Tutorial 8 · Plenio Player: the songs made with Plenio in the browser. It starts in ComfyUI - the Plenio
// Player button beside Run (and the one on Export Release) starts the player, a program of its own, and
// opens it - the login page (users, the admin, a guest), then the library and its search, playing a song, a
// song's page (lyrics, notation, every field of the brief, takes), back to the songs where the song plays, Now
// playing in its four views, the visuals and their modes, Plenio Drop and the lyrics' look, the lyrics as
// written and as sung, playlists, the queue with the sleep timer, Live Play with a song that arrives from
// ComfyUI, guests in the network (the QR code, the guests' page, a wish carried out), a song as a video, the
// songs shared as a player, A/B and speed, the keys, help and the tutorials, the settings (in sections: the version,
// the accounts, the studio, the folders, the MP3, the lyrics' rule) and Open in ComfyUI. 1.3.1 adds the rail beside
// a long list, Up next in a song's last seconds and the guests' reactions. Native drop-down lists are shown open
// (studio's openSelect).
//
// Recorded against a ComfyUI dev server whose output folder holds the songs, with PLENIO_PLAYER_STATE set to
// a fresh folder (with a user or two in its users.json) and PLENIO_GUESTS_HOST=127.0.0.1 (the player ComfyUI
// starts inherits both; on the loopback address Windows asks nothing): node tools/tutorials/record.mjs player
// --url <it>. PLENIO_PLAYER_SUNG names the song (its file name) that shows the lyrics as sung.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { FOOT } from './lib/studio.mjs'
import { parseNarration } from './lib/voice.mjs'
import { intro } from './lib/scenes.mjs'

export const meta = {
  name: 'Plenio tutorial 8 - Plenio Player',
  // the visuals on a graphics card: without one the player offers neither Plenio Drop nor Plenio Nova (Playwright's
  // Chromium takes the computer's default one - on the recording computer the processor's integrated graphics, where
  // the player offers 20 of the 22 Nova visuals)
  gpu: true,
}

const TEMPLATE = '1 · YuE2 · Song'
const EXPORT = 'PlenioExportRelease'
const NODE_BUTTON = '▶ Open in the Plenio Player'

// the music under the voice: the player's own volume (the edit ducks it a little more under the voice)
const BED = 0.3, LOUD = 0.7

// The music plays all through the video, and a hold in the edit would cut it: every caption waits as long
// as its narration line will take to speak (about 68 ms a character, as the voice reads).
const NARRATION = parseNarration(path.join(path.dirname(fileURLToPath(import.meta.url)), 'narration', 'player.txt')).filter((l) => !l.card)
const norm = (t) => t.toLowerCase().replace(/[’`]/g, "'").replace(/\s+/g, ' ').trim()
function spoken(caption) {
  const line = NARRATION.find((l) => norm(caption).startsWith(norm(l.cue)))
  return line ? line.text.replace(/\[pause:[\d.]+s\]/g, '') : caption
}
// a caption shown before its scene (an open list): talk() with the same text then waits only what is left
let shown = null
function show(s, text) {
  s.caption(text)
  shown = { text, at: Date.now() }
}
async function talk(s, text, min = 0) {
  const ms = Math.max(min, 900 + spoken(text).length * 68)
  if (shown?.text === text) {
    const gone = Date.now() - shown.at
    shown = null
    await s.wait(Math.max(min, ms - gone))
    return
  }
  shown = null
  s.caption(text)
  await s.wait(ms)
}

// the song the video plays: the one named by its file name in PLENIO_PLAYER_SONG, else timed lyrics, a score,
// sheet music, other takes and the longest of those - one further down the songs (newest first), so that back
// from its page the songs' page goes to it
async function pickSong(s) {
  const library = await s.page.evaluate(() => fetch('/api/library').then((r) => r.json()))
  const named = process.env.PLENIO_PLAYER_SONG && library.songs.find((x) => x.file === process.env.PLENIO_PLAYER_SONG)
  if (named) return named
  const newest = [...library.songs].sort((a, b) => String(b.created).localeCompare(String(a.created)))
  const place = new Map(newest.map((x, i) => [x.id, i]))
  const takes = (x) => !!x.takes_key && library.songs.some((o) => o.id !== x.id && o.takes_key === x.takes_key)
  const songs = library.songs.filter((x) => x.has.timing && x.has.score && x.seconds > 90)
  const rank = (x) => [Number(x.has.original), Number(x.has.pdf), Number(takes(x)), Number(place.get(x.id) >= 40), x.seconds]
  songs.sort((a, b) => {
    const [ra, rb] = [rank(a), rank(b)]
    for (let i = 0; i < ra.length; i++) if (ra[i] !== rb[i]) return rb[i] - ra[i]
    return 0
  })
  if (!songs.length) throw new Error('the player has no song with timed lyrics and a score')
  return songs[0]
}

// the song that shows the lyrics as sung: the one named in PLENIO_PLAYER_SUNG, else a song exported with what
// its take sings
async function pickSung(s) {
  const library = await s.page.evaluate(() => fetch('/api/library').then((r) => r.json()))
  const named = process.env.PLENIO_PLAYER_SUNG && library.songs.find((x) => x.file === process.env.PLENIO_PLAYER_SUNG)
  return named ?? library.songs.find((x) => x.has.sung && x.seconds > 90) ?? null
}

// A song "exported" while Live Play runs: a copy of one of the library's songs under a new title, written
// into the player's folder as Export Release writes one (the record last)
function arrive(folder, record, title) {
  const stem = path.basename(record).replace(/\.plenio\.json$/, '')
  const data = JSON.parse(fs.readFileSync(record, 'utf8'))
  data.title = title
  const name = title.replace(/\s+/g, '_')
  for (const f of data.files ?? []) if (typeof f?.name === 'string' && f.name.startsWith(stem)) f.name = name + f.name.slice(stem.length)
  for (const kind of ['.flac', '.mp3', ' (lines).srt', ' (notes).srt', '.jpg', '.pdf']) {
    const from = path.join(path.dirname(record), `${stem}${kind}`)
    if (fs.existsSync(from)) fs.copyFileSync(from, path.join(folder, `${name}${kind}`))
  }
  fs.writeFileSync(path.join(folder, `${name}.plenio.json`), JSON.stringify(data))
}

async function setVolume(s, value) {
  await s.page.evaluate((v) => {
    const range = document.querySelector('.vol input[type=range]')
    if (!range) return
    range.value = String(v)
    range.dispatchEvent(new Event('input', { bubbles: true }))
  }, value)
}

export async function prepare(s, { project }) {
  // ComfyUI with the YuE2 Song template open: its Export Release node has the player's button
  const graph = JSON.parse(fs.readFileSync(path.join(project, 'example_workflows', `${TEMPLATE}.json`), 'utf8'))
  await s.page.evaluate(async ([g, name]) => window.app.loadGraphData(g, true, true, name), [graph, TEMPLATE])
  await s.wait(2500)
}

export default async function player(s) {
  s.card('title', {
    kicker: 'Plenio tutorial',
    title: '<span class="num">8 ·</span> Plenio Player',
    subtitle: 'Your songs in the browser: lyrics, sheet music and visuals in time with the music',
    foot: FOOT,
  }, 5)
  intro(s, {
    tutorial: 'Tutorial 8 · Plenio Player',
    items: [
      'Find and play your songs',
      "The song's page and Now playing",
      'Visuals: Plenio Nova and Plenio Drop',
      'Lyrics as written or as sung, playlists, the queue',
      'Live Play, guests, videos and sharing',
    ],
  })

  // --- in ComfyUI: one click ---
  s.chapter('Open the player')
  await s.rest(600)
  await talk(s, 'The Plenio Player plays the songs you made with Plenio - in the browser.')
  const button = s.page.locator('button', { hasText: 'Plenio Player' }).first()
  await s.hover(button)
  await s.spotlight(button, { ms: 2600 })
  await talk(s, 'In ComfyUI it is one click away: Plenio Player, beside Run.')
  await s.flyNodes([EXPORT], 1300, 0.9)
  await s.hover(await s.widgetBox(EXPORT, NODE_BUTTON), { fx: 0.5 })
  await talk(s, 'Export Release has a button too: it opens the song you just exported.')
  const [opened] = await Promise.all([s.context.waitForEvent('page'), s.click(button)])
  await s.switchTo(opened)
  await talk(s, 'If the player is not running yet, ComfyUI starts it, and opens it in a tab of its own.')
  // who listens: the page asks once on every device - here the admin logs in, on the player's own computer
  const login = s.page.locator('.login')
  if (await login.waitFor({ timeout: 60000 }).then(() => true, () => false)) {
    await s.wait(900)
    await talk(s, 'Who is listening? The player asks once on every device.')
    const users = login.locator('.person:not(.admin)')
    if (await users.count()) {
      await s.spotlight(login.locator('.people'), { ms: 3200, pad: 8 })
      await s.hover(users.first())
      await talk(s, 'A user keeps the same playlists, likes and settings on every device - the admin sets them up.')
    }
    const admin = login.locator('.person.admin')
    await s.hover(admin)
    await s.callout(admin, 'this computer only', { ms: 3400 })
    await talk(s, 'The admin logs in only on the player’s own computer, with the player’s playlists and settings.')
    const asGuest = login.locator('.guest button')
    await s.hover(asGuest)
    await s.pulse(asGuest, { times: 1 })
    await talk(s, 'A guest’s playlists and likes stay in that browser.')
    await s.click(admin)
  }
  await s.page.waitForSelector('.card', { timeout: 60000 })
  await s.wait(1200)
  let page = s.page
  const song = await pickSong(s)
  await s.rest(500)
  await talk(s, 'The player is a program of its own: it keeps running when ComfyUI closes. Without ComfyUI: double-click Plenio Player.bat.')
  await s.hover(page.locator('.hero h1'))
  await talk(s, 'It finds every song Export Release wrote into ComfyUI’s output folder.')

  s.chapter('Find a song')
  await s.click(page.locator('.search input'))
  await s.type(song.title.split(/\s+/).slice(0, 2).join(' ').toLowerCase())
  await s.wait(900)
  await talk(s, 'Search looks through titles, lyrics, genres, moods and briefs.')
  await page.fill('.search input', '')
  await s.type('bpm:>100')
  await s.wait(900)
  await talk(s, 'Fields narrow it down: genre, tempo, key, model, language, favourites …')
  await page.fill('.search input', '')
  await s.wait(500)
  const chip = page.locator('.facet .chip').first()
  await s.click(chip)
  await talk(s, 'The chips filter by your most common genres, moods, models and creative modes.')
  await s.click(chip)
  await s.click(page.locator('.views .icon-btn').nth(1))
  await talk(s, 'A grid or a list, sorted by date, title, length, tempo or loudness.', 3000)
  await s.click(page.locator('.views .icon-btn').nth(0))
  await s.wait(600)
  // sorted by title: a rail of letters beside the list
  const sort = page.locator('.tools select').first()
  show(s, 'Sorted by title, the letters at the side jump anywhere - by date, the months.')
  await s.openSelect(sort, { choose: 'title', browse: 3, read: 700 })
  const rail = page.locator('.rail')
  if (await rail.count()) {
    await s.hover(rail)
    await s.click(rail.locator('button').nth(Math.min(12, (await rail.locator('button').count()) - 1)))
    await s.wait(600)
  }
  await talk(s, 'Sorted by title, the letters at the side jump anywhere - by date, the months.', 1600)
  await s.openSelect(sort, { choose: 'newest', browse: 1, read: 500 })
  await s.wait(600)

  s.chapter('Play')
  // the song is further down the songs: the search brings it up
  await s.click(page.locator('.search input'))
  await s.type(song.title.split(/\s+/).slice(0, 2).join(' ').toLowerCase())
  await s.wait(700)
  // by its id: two songs can have the same title
  const card = page.locator(`.card[data-song="${song.id}"]`)
  await card.scrollIntoViewIfNeeded()
  await s.hover(card)
  await s.wait(400)
  await s.click(card.locator('.play'))
  await s.wait(1500)
  await talk(s, 'Press play on a cover. A click on the card opens the song’s page.')
  await s.click(page.locator('.search .icon-btn'))
  await s.wait(500)
  await s.hover(page.locator('.bar .meta .sub'))
  await talk(s, 'The bar shows the song’s section and the line sung right now.')
  const wave = page.locator('.bar .progress .wave')
  await s.hover(wave, { fx: 0.42 })
  await talk(s, 'The waveform is the seek bar: its sections, and under the mouse, the line sung there.')
  await s.hover(page.locator('.bar .mini'))
  await talk(s, 'The bright square on the right moves with the music - a click opens Now playing.')
  await s.click(wave, { fx: 0.18 })
  await s.rest()
  await s.wait(1200)

  s.chapter('The song’s page')
  await s.click(page.locator('.bar .song .icon-btn').first())
  await s.wait(1200)
  await talk(s, 'ⓘ beside the song opens its page, too.')
  // its stars: the measured ones (measured as the page opens, about half a second) faded until the listener rates it
  await page.waitForFunction(() => / measured/.test(document.querySelector('.rating')?.textContent ?? ''), null, { timeout: 15000 }).catch(() => {})
  const stars = page.locator('.rating .stars.editable')
  if (await stars.count()) {
    await s.hover(page.locator('.rating .measured'))
    await talk(s, 'Its stars: give your own, by ear - until you do, the measured ones stand there, faded.')
    await s.click(stars.locator('.star').nth(3), { fx: 0.8 })
    await s.hover(page.locator('.rating .mine'))
    await talk(s, 'Four of five: your stars, kept like your playlists.', 2600)
  }
  await talk(s, 'Its lyrics light up as they are sung - the times were measured when the song was exported.')
  const later = page.locator('.karaoke .line').nth(6)
  if (await later.count()) {
    await s.click(later)
    await talk(s, 'A click on a line plays the song from there.')
  }
  const tab = (name) => page.locator('.tabs button', { hasText: name }).first()
  if (await tab('Notation').count()) {
    await s.click(tab('Notation'))
    await s.wait(1500)
    await talk(s, 'The notation follows the music: the notes that sound light up, and a click on a note jumps there.', 6500)
  }
  await s.click(tab('Details'))
  await s.wait(800)
  await s.hover(page.locator('.details .block').first())
  await talk(s, 'The details: every field of the brief - one you left empty shows its default - the model, the writer, the loudness, and the seeds to make the take again.')
  const made = page.locator('.details .block', { has: page.locator('h3', { hasText: 'How it was made' }) }).first()
  if (await made.count()) {
    await s.spotlight(made, { ms: 3000, pad: 6 })
    await talk(s, 'How it was made: when - and for a song made since 1.4, how long it took, on what, and with which lyrics fidelity.')
  }
  const measured = page.locator('.details .block.quality').first()
  if (await measured.count()) {
    await measured.scrollIntoViewIfNeeded()
    await s.spotlight(measured, { ms: 3200, pad: 6 })
    await talk(s, 'How it came out, measured: the lyrics sung as written, the harmony, the beat - and what went wrong. A hint where to listen first.')
  }
  await page.locator('.downloads').scrollIntoViewIfNeeded()
  await s.hover(page.locator('.downloads .file').first())
  await talk(s, 'Every file to download: the audio, the sheet music, the subtitles, the cover and the record.')
  for (const name of ['Takes', 'Alike']) {
    if (await tab(name).count()) {
      await s.click(tab(name))
      await s.wait(900)
      await talk(s, name === 'Takes' ? 'The song’s other takes, to compare them …' : '… and songs alike.', 2600)
    }
  }
  await s.click(tab('Lyrics'))
  // back to the songs: the page goes to the song that plays, however far down it is, and it lights up
  await s.click(page.locator('.side a.link', { hasText: 'Songs' }))
  await page.waitForSelector('.card.now', { timeout: 10000 }).catch(() => {})
  await s.wait(700)
  const playingCard = page.locator('.card.now').first()
  if (await playingCard.count()) await s.hover(playingCard)
  await talk(s, 'Back to your songs, the page shows the one that plays - even among hundreds.')

  s.chapter('Now playing')
  await s.keys('f')
  await s.wait(1500)
  await talk(s, 'F opens Now playing. The stage: the cover, and the lyrics as they are sung.')
  const chorus = page.locator('.dock .chips .chip', { hasText: /^\s*Chorus/ }).first()
  if (await chorus.count()) {
    await s.click(chorus)
    await talk(s, 'The sections are chips: one click, and the chorus plays.')
  }
  await s.keys('2')
  await s.wait(800)
  await talk(s, 'Lyrics: large, painted syllable by syllable.')
  await s.keys('3')
  await s.wait(1200)
  await talk(s, 'Notation: the sheet scrolls along, with the lyrics at the side.', 5200)
  await s.keys('4')
  await s.rest(500)
  await talk(s, 'And the visual, full screen, with the lyrics as subtitles. The controls fade out while the mouse rests.', 8000)

  s.chapter('Visuals')
  await s.click(page.locator('.np .top .tools .icon-btn[title^="Visuals"]'))
  await s.wait(700)
  await talk(s, 'The visuals’ settings.', 2400)
  await s.hover(page.locator('.vpanel .mode').nth(0))
  await talk(s, 'Match the music picks a visual for the song’s genre, mood and tempo.')
  await s.click(page.locator('.vpanel .mode').nth(1))
  await talk(s, 'Random picks from the visuals you tick. Cycle goes through them in turn, Fixed keeps one.')
  const ticked = page.locator('.vpanel .pick input').nth(6)
  await s.click(ticked)
  await talk(s, 'Tick the ones you like: 25 classics, 51 Plenio Drop visuals and 22 Plenio Nova scenes - in groups, with a search.', 2600)
  await s.click(ticked)
  const find = page.locator('.vpanel input.find')
  if (await find.count()) {
    await s.click(find)
    await s.type('space')
    await s.wait(700)
    await talk(s, 'Find one by name or by what it shows - or pick a mood.')
    await page.fill('.vpanel input.find', '')
    await s.wait(300)
  }
  const change = page.locator('.vpanel select').first()
  show(s, 'They change with every song, at every section, every few seconds - or when the music drops in.')
  await s.openSelect(change, { choose: 'section', browse: 3, read: 1000 })
  await talk(s, 'They change with every song, at every section, every few seconds - or when the music drops in.', 1600)
  await s.hover(page.locator('.vpanel h4', { hasText: 'This song' }))
  await talk(s, 'A song can have a visual of its own, and so can a playlist: the song’s wins, then the playlist’s, then the mode.')

  s.chapter('Plenio Nova')
  await s.click(page.locator('.vpanel .mode', { hasText: 'Fixed' }))
  await s.wait(500)
  // offered once timed on this graphics card - in the background, the first time a visual shows (Now playing above)
  await page.waitForFunction(() => {
    try {
      return Object.keys(JSON.parse(localStorage.getItem('plenio.nova.timings') || 'null')?.timings ?? {}).length >= 22
    } catch {
      return false
    }
  }, null, { timeout: 90000 }).catch(() => {})
  // the first of these this graphics card draws smoothly
  const fixedNova = page.locator('.vpanel select').first()
  const novaPick = await fixedNova.evaluate(
    (sel, ids) => ids.find((id) => [...sel.options].some((o) => o.value === id)) ?? null,
    ['nova-galaxy', 'nova-aurora', 'nova-bulb', 'nova-black-hole', 'nova-city'],
  )
  if (!novaPick) throw new Error('the player offers no Plenio Nova visual here: record with a graphics card')
  show(s, 'Plenio Nova: scenes the graphics card works out for every pixel - a galaxy, northern lights, the Mandelbulb, a black hole bending the starlight.')
  await s.openSelect(fixedNova, { choose: novaPick, browse: 5, read: 1200 })
  await s.click(page.locator('.vpanel header .icon-btn'))
  await s.rest(400)
  await talk(s, 'Plenio Nova: scenes the graphics card works out for every pixel - a galaxy, northern lights, the Mandelbulb, a black hole bending the starlight.', 6500)
  await s.click(page.locator('.np .top .tools .icon-btn[title^="Visuals"]'))
  await s.wait(700)
  // the Nova group: what this graphics card is offered, and what is too heavy for it
  const novaGroup = page.locator('.vpanel .group', { has: page.locator('.fold', { hasText: 'Plenio Nova' }) }).first()
  if (await novaGroup.count()) {
    if ((await novaGroup.locator('.fold').getAttribute('aria-expanded')) !== 'true') await s.click(novaGroup.locator('.fold'))
    await s.wait(500)
    const heavy = novaGroup.locator('.note', { hasText: 'Too heavy' }).first()
    if (await heavy.count()) {
      await heavy.scrollIntoViewIfNeeded()
      await s.spotlight(heavy, { ms: 3600, pad: 6 })
      await talk(s, 'The player offers only the visuals this computer draws smoothly - here, the heaviest are left out.', 3600)
    } else {
      await s.spotlight(novaGroup, { ms: 3000, pad: 6 })
      await talk(s, 'The player offers only the visuals this computer draws smoothly.', 3600)
    }
  } else {
    await talk(s, 'The player offers only the visuals this computer draws smoothly.', 3600)
  }

  s.chapter('Plenio Drop')
  await s.click(page.locator('.vpanel .mode', { hasText: 'Fixed' }))
  await s.wait(500)
  const fixed = page.locator('.vpanel select').first()
  show(s, 'Plenio Drop: visuals like Winamp’s MilkDrop, made anew and drawn on the graphics card - and one made up fresh each time.')
  await s.openSelect(fixed, { choose: 'drop-electric-lotus', browse: 6, read: 1400 })
  await s.wait(1200)
  await talk(s, 'Plenio Drop: visuals like Winamp’s MilkDrop, made anew and drawn on the graphics card - and one made up fresh each time.', 2400)
  const copy = page.locator('.vpanel .drop-tools .chip', { hasText: 'Edit a copy' })
  await copy.scrollIntoViewIfNeeded()
  await s.hover(copy)
  await talk(s, 'Write your own: Edit a copy saves the one that plays as a short file of numbers and formulas - save a change, and the visual changes.')
  await s.click(page.locator('.vpanel .mode', { hasText: 'Random' }))
  await s.click(page.locator('.vpanel header .icon-btn'))
  await s.rest(400)
  await s.click(page.locator('.np .top .tools .icon-btn[title^="How the lyrics look"]'))
  await s.wait(700)
  await s.click(page.locator('.lpanel .font', { hasText: 'Poster' }))
  await s.click(page.locator('.lpanel .effect', { hasText: 'Neon' }))
  await talk(s, 'How the lyrics look: a font, a colour and an effect - neon, glow, bounce, typewriter, on the beat - in the player and in videos.')
  await s.click(page.locator('.lpanel header .icon-btn'))
  await s.rest(400)
  await talk(s, 'N shows the next one.', 2400)
  // no voice for a while: the music comes up
  await setVolume(s, LOUD)
  for (let i = 0; i < 7; i++) {
    await s.keys('n')
    await s.wait(2600)
  }
  await setVolume(s, BED)
  // a song's last seconds: Up next names the one that follows
  const npWave = page.locator('.np .dock canvas, .np .dock .waveform').first()
  await s.click(npWave, { fx: 0.93 })
  await s.rest(400)
  await page.waitForSelector('.up-next', { timeout: 20000 }).catch(() => {})
  await s.wait(900)
  await talk(s, 'In a song’s last seconds, Up next names the one that follows - for the big screen at a party.')

  s.chapter('As written, as sung')
  const sung = await pickSung(s)
  if (sung) {
    await s.keys('Escape')
    await s.wait(800)
    await page.fill('.search input', '')
    await s.click(page.locator('.search input'))
    await s.type(sung.title.split(/\s+/).slice(0, 3).join(' ').toLowerCase())
    await s.wait(700)
    const sungCard = page.locator(`.card[data-song="${sung.id}"]`)
    await sungCard.scrollIntoViewIfNeeded()
    await s.hover(sungCard)
    await s.click(sungCard.locator('.play'))
    await s.wait(1200)
    await talk(s, 'A music model does not always sing what it was given: it repeats a line, makes one up, or leaves one out.')
    await s.click(sungCard, { fy: 0.85 })
    await page.waitForSelector('.song-page .version .switch', { timeout: 15000 })
    await s.wait(900)
    const versions = page.locator('.song-page .version .switch').first()
    await s.spotlight(versions, { ms: 3000, pad: 6 })
    await s.hover(versions)
    await talk(s, 'So the player has both: the lyrics as written, and as sung - what the take really sings, heard when the song was exported.')
    const note = page.locator('.song-page .version .note').first()
    if (await note.count()) {
      await s.spotlight(note, { ms: 3600, pad: 6 })
      await s.hover(note, { fx: 0.3 })
      await talk(s, 'How far the take follows its lyrics. A song shows them as written - as sung only when you choose it.')
    }
    await s.click(versions.locator('button', { hasText: 'As sung' }))
    await s.wait(700)
    await talk(s, 'One click switches, and the song keeps your choice.')
    await s.rest(400)
    await s.keys('w')
    await s.wait(600)
    const chipW = page.locator('.bar .right .chip', { hasText: 'Lyrics ·' }).first()
    if (await chipW.count()) {
      await s.pulse(chipW, { times: 2 })
      await s.callout(chipW, 'W', { ms: 2600, side: 'top' })
    }
    await talk(s, 'W does it too, or the chip in the bar. The notation always follows the written lyrics.')
    const full = versions.locator('button', { hasText: 'Full lyrics' })
    if (await full.count()) {
      await s.click(full)
      await s.wait(800)
      await talk(s, 'Full lyrics: the whole text with its sections - to copy for a new song, with or without the section tags, and the style too.')
      await s.click(page.locator('.full-lyrics .copy-row button').first())
      await s.wait(600)
      const sheetLink = page.locator('.full-lyrics .copy-row a').first()
      if (await sheetLink.count()) {
        const [sheet] = await Promise.all([s.context.waitForEvent('page'), s.click(sheetLink)])
        await s.switchTo(sheet)
        await sheet.waitForLoadState('load')
        await s.wait(1000)
        await talk(s, 'The song’s page: the lyrics, the prompts, every setting and the files on one page - Export Release writes it next to every song.')
        for (let step = 0; step < 4; step++) {
          await sheet.mouse.wheel(0, 420)
          await s.wait(450)
        }
        await s.wait(800)
        await s.switchTo(page)
        await sheet.close()
      }
      // back to the timed lyrics: the player keeps the view for the next song
      await s.click(versions.locator('button', { hasText: 'As written' }))
      await s.wait(500)
    }
    await s.click(page.locator('.side a.link', { hasText: 'Songs' }))
    await s.wait(600)
    // back to the video's song: the chapters after this one play it (Live Play, the video, Open in ComfyUI)
    await page.fill('.search input', '')
    await s.click(page.locator('.search input'))
    await s.type(song.title.split(/\s+/).slice(0, 2).join(' ').toLowerCase())
    await s.wait(700)
    const again = page.locator(`.card[data-song="${song.id}"]`)
    await again.scrollIntoViewIfNeeded()
    await s.click(again.locator('.play'))
    await s.wait(900)
    await page.fill('.search input', '')
    await s.wait(600)
  }

  s.chapter('Playlists')
  await s.keys('Escape')
  await s.wait(800)
  await s.click(page.locator('.side h4 .icon-btn'))
  await s.type('Evening')
  await page.keyboard.press('Enter')
  await s.wait(900)
  await talk(s, 'A new playlist: plus, a name.', 2600)
  await s.click(page.locator('.pl .actions button', { hasText: 'Add songs' }))
  await s.wait(500)
  for (let i = 0; i < 4; i++) {
    await s.click(page.locator('.cand').first(), { pause: 120 })
  }
  await talk(s, 'Add songs with the search, and drag them into order.')
  const rows = page.locator('.rows li')
  if ((await rows.count()) >= 3) {
    const from = await s.boxOf(rows.nth(2))
    const to = await s.boxOf(rows.nth(0))
    await s.drag({ x: from.x + 300, y: from.y + from.height / 2 }, { x: to.x + 300, y: to.y + 6 })
  }
  const visual = page.locator('.pl .visual select')
  show(s, 'A playlist can have its own colour and its own visual.')
  await s.openSelect(visual, { choose: 'fire', browse: 4, read: 900 })
  await talk(s, 'A playlist can have its own colour and its own visual.', 1600)
  await s.click(page.locator('.side a.link', { hasText: 'Playlists' }))
  await s.wait(900)
  await talk(s, 'Next to yours: favourites, most played, recently played and never played.')

  s.chapter('The queue')
  await s.keys('q')
  await s.wait(800)
  await talk(s, 'The queue: what comes next. Reorder it, or save it as a playlist.')
  await s.click(page.locator('.queue .sleep .chip', { hasText: '30' }))
  await talk(s, 'Crossfades between songs, and a sleep timer that fades the music out.')
  await s.click(page.locator('.queue .sleep .chip', { hasText: 'off' }))
  await s.keys('q')
  await s.click(page.locator('.side a.link', { hasText: 'Songs' }))
  await s.wait(900)
  // the songs' page is at the song that plays: the song after it
  const after = page.locator('.card.now + .card')
  const other = (await after.count()) ? after.first() : page.locator('.card').nth(2)
  await s.hover(other)
  await s.click(other, { button: 'right' })
  await talk(s, 'A right-click on a song: play it next, add it to a playlist, start a radio of songs alike - or remove it.')
  // a click beside the menu closes it
  await s.click({ x: 1180, y: 150, width: 0, height: 0 })
  await s.wait(500)

  s.chapter('Live Play')
  await s.click(page.locator('.side a.link', { hasText: 'Live Play' }))
  await s.wait(1000)
  await talk(s, 'Live Play: a playlist for a party, changed while it plays.')
  const newest = page.locator('.way', { hasText: 'With the newest songs' })
  if (await newest.count()) {
    await s.openSelect(newest.locator('select'), { choose: '10', browse: 2, read: 500 })
    await s.click(newest.locator('button'))
    await s.wait(1500)
  }
  await s.hover(page.locator('.rules'))
  await talk(s, 'Make songs in ComfyUI meanwhile: as soon as Export Release has written one, it joins - next, at the end, or anywhere.')
  const info = await page.evaluate(() => fetch('/api/info').then((r) => r.json()))
  const detail = await page.evaluate((id) => fetch(`/api/song/${id}`).then((r) => r.json()), song.id)
  if (info.folders?.[0] && detail.record_path) arrive(info.folders[0], detail.record_path, 'Midnight on the Dance Floor')
  await page.waitForFunction(() => document.body.innerText.includes('Midnight on the Dance Floor'), null, { timeout: 30000 }).catch(() => {})
  await s.wait(800)
  const fresh = page.locator('.list .row.fresh').first()
  if (await fresh.count()) await s.hover(fresh)
  await talk(s, 'There it is - marked new, playing next.')

  s.chapter('Guests in your network')
  const guests = page.locator('.guests')
  await guests.scrollIntoViewIfNeeded()
  await s.click(guests.locator('input[type=checkbox]').first())
  await page.waitForSelector('.guests .url code', { timeout: 15000 })
  await s.click(guests.locator('label', { hasText: 'change it' }).locator('input'))
  await s.wait(800)
  await talk(s, 'Guests in your network: switch it on, and everyone on the same Wi-Fi opens the live playlist on the phone - a QR code and an address with a random part.')
  await s.click(guests.locator('button', { hasText: 'Show it big' }))
  await s.wait(800)
  await talk(s, 'Show it big, for a screen the whole room sees. A new address at any time locks the old one out.')
  await s.keys('Escape')
  const guestUrl = (await page.textContent('.guests .url code')).trim()
  const phone = await s.context.newPage()
  await phone.goto(guestUrl)
  await s.switchTo(phone)
  await phone.waitForSelector('#next li', { timeout: 15000 })
  await s.wait(1000)
  await talk(s, 'On the phone: the song that plays, and what comes next …')
  const earlier = phone.locator('#next li').nth(2).locator('button[title="Earlier"]')
  if (await earlier.count()) await s.click(earlier)
  await talk(s, '… and if you allow it, guests move songs, take them out and add their favourites. The music plays on your computer.')
  // reactions: a tap on the phone floats over the host's screen
  const reactions = phone.locator('#reactBox')
  if (await reactions.isVisible().catch(() => false)) {
    await s.hover(reactions)
    await talk(s, 'And they react to the song that plays …', 2400)
    for (const emoji of ['🔥', '❤️', '🎉', '👏']) {
      await s.click(phone.getByRole('button', { name: `Send ${emoji} to the big screen` }), { pause: 120 })
    }
    await s.switchTo(page)
    // the room goes on tapping while this screen is in view: the same buttons of the guests' page, clicked in it
    const tapping = (async () => {
      for (const emoji of ['🔥', '❤️', '💃', '🔥', '😂', '🎉', '❤️', '🔥']) {
        await phone
          .evaluate((label) => document.querySelector(`button[aria-label="${label}"]`)?.click(), `Send ${emoji} to the big screen`)
          .catch(() => {})
        await new Promise((resolve) => setTimeout(resolve, 450))
      }
    })()
    await s.rest(400)
    await s.wait(900)
    const cheers = page.locator('.playing .cheers')
    if (await cheers.count()) await s.hover(cheers)
    await talk(s, '… it floats up the big screen, and every song keeps its reactions - apart from your hearts.', 4000)
    await tapping
  } else {
    await s.switchTo(page)
  }
  await s.wait(1500)
  const log = page.locator('.log p').first()
  if (await log.count()) {
    await log.scrollIntoViewIfNeeded()
    await s.hover(log)
  }
  await talk(s, 'The playlist follows, and says what the guests did.')
  await phone.close()

  s.chapter('A song as a video')
  await s.click(page.locator('.bar .song .icon-btn').first())
  await s.wait(1200)
  await s.click(page.locator('.song-page .actions button', { hasText: 'Video' }))
  await page.waitForSelector('.dialog .shot canvas', { timeout: 30000 })
  await s.wait(1200)
  show(s, 'A song as a video: its visual, the lyrics as karaoke, the notes following the music - Full HD, 4K, or upright for Shorts.')
  await s.openSelect(page.locator('.dialog select').first(), { choose: 'vertical', browse: 2, read: 900 })
  await page.fill('.dialog input[type=number] >> nth=0', '20')
  await page.fill('.dialog input[type=number] >> nth=1', '32')
  await s.openSelect(page.locator('.dialog fieldset:has-text("Over the visual") select').first(), { choose: 'karaoke', browse: 3, read: 800 })
  await s.click(page.locator('.dialog button', { hasText: 'Preview' }))
  await s.wait(1500)
  await talk(s, 'A song as a video: its visual, the lyrics as karaoke, the notes following the music - Full HD, 4K, or upright for Shorts.', 2400)
  const quality = page.locator('.dialog label', { hasText: 'Quality' }).locator('select').first()
  if (await quality.count()) {
    show(s, 'Seven steps of quality, from Low to Best - or a bitrate of your own.')
    await s.openSelect(quality, { choose: 'high', browse: 4, read: 900 })
    await talk(s, 'Seven steps of quality, from Low to Best - or a bitrate of your own.', 1600)
  }
  await s.click(page.locator('.dialog button', { hasText: 'Make the video' }))
  await page.waitForSelector('.dialog .done, .dialog .error', { timeout: 300000 })
  await s.wait(600)
  await talk(s, 'Made on the graphics card, faster than the song plays: an MP4 in the player’s videos folder.')
  await s.click(page.locator('.dialog header button[title^="Close"]'))
  await s.wait(500)

  s.chapter('Share as a player')
  await s.click(page.locator('.side button', { hasText: 'Share as a player' }))
  await page.waitForSelector('.dialog .list .row', { timeout: 15000 })
  const evening = page.locator('.dialog .quick .chip', { hasText: 'Evening' })
  if (await evening.count()) await s.click(evening)
  show(s, 'Share your songs as a player: one HTML file with the songs as MP3 - send it, and anyone just double-clicks it.')
  await s.openSelect(page.locator('.dialog .right select').first(), { choose: '128', browse: 3, read: 800 })
  await talk(s, 'Share your songs as a player: one HTML file with the songs as MP3 - send it, and anyone just double-clicks it.', 2400)
  await s.click(page.locator('.dialog button', { hasText: 'Make the player' }))
  await page.waitForSelector('.dialog .done, .dialog .error', { timeout: 300000 })
  const tryIt = page.locator('.dialog .done a', { hasText: 'Try it' })
  if (await tryIt.count()) {
    const [shared] = await Promise.all([s.context.waitForEvent('page'), s.click(tryIt)])
    await s.switchTo(shared)
    // a file of a few dozen MB: once in a while the first load stays white - then once more
    if (!(await shared.waitForSelector('.card', { timeout: 30000 }).then(() => true, () => false))) {
      await shared.reload()
      await shared.waitForSelector('.card', { timeout: 60000 })
    }
    await s.wait(1200)
    await talk(s, 'It plays by itself in any browser: the lyrics, the notation, the visuals - nothing to install.')
    await s.switchTo(page)
    await shared.close()
  }
  await s.click(page.locator('.dialog header button[title^="Close"]'))
  await s.wait(500)

  s.chapter('Compare and keys')
  const ab = page.locator('.bar .right .chip', { hasText: 'master' })
  if (await ab.count()) {
    await s.click(ab)
    await talk(s, 'A/B: the unmastered take, at the same moment, without a gap.')
    await s.click(page.locator('.bar .right .chip', { hasText: 'original' }))
  }
  const speed = page.locator('.bar .right .chip', { hasText: '×' })
  await s.click(speed)
  await talk(s, 'Speed, from three quarters to one and a quarter - the pitch stays.')
  for (let i = 0; i < 4; i++) await s.click(speed, { pause: 80 })
  await s.keys('?', { labels: ['?'] })
  await s.wait(700)
  await talk(s, 'Every key is listed under the question mark.', 3600)
  await s.keys('Escape')

  s.chapter('Help and tutorials')
  await s.click(page.locator('.side a.link', { hasText: 'Help & tutorials' }))
  await page.waitForSelector('.help-page', { timeout: 15000 })
  await s.wait(1000)
  await talk(s, 'Help and tutorials: short guides by topic, and every tutorial as a video - press H anywhere.')
  const video = page.locator('.help-page .video').first()
  await s.hover(video)
  await talk(s, 'A click plays a tutorial right here. Nothing is loaded from YouTube before.')
  await s.click(page.locator('.help-page .search input'))
  await s.type('guests')
  await s.wait(900)
  await talk(s, 'The search finds the lines of every guide that answer it.')
  await page.fill('.help-page .search input', '')
  await s.wait(500)

  s.chapter('Settings')
  await s.click(page.locator('.side a.link', { hasText: 'Settings' }))
  await s.wait(1200)
  await s.hover(page.locator('.settings p.version'))
  await talk(s, 'Settings starts with the version of the player that runs.')
  await s.spotlight(page.locator('.settings .index'), { ms: 2600, pad: 6 })
  await talk(s, 'Its sections are chips: one click jumps there.')
  const studioChip = page.locator('.settings .index .chip', { hasText: 'The studio' })
  if (await studioChip.count()) {
    await s.click(studioChip)
    await s.wait(900)
    await s.hover(page.locator('#studio .status'))
    await talk(s, 'The studio: when ComfyUI does not run, the player starts it - the way you last started it, with your models folder. Tutorial nine shows more.')
  }
  const accounts = page.locator('.settings section', { has: page.locator('h3', { hasText: 'Accounts' }) }).first()
  if (await accounts.count()) {
    await accounts.scrollIntoViewIfNeeded()
    await s.wait(500)
    await s.spotlight(accounts.locator('.users'), { ms: 3000, pad: 6 })
    await talk(s, 'Accounts: who logged in, and the users the admin set up.')
    const add = accounts.locator('form.add')
    await s.click(add.locator('input').nth(0))
    await s.type('Sam')
    await s.click(add.locator('input').nth(1))
    await s.type('sam-1234')
    const group = add.locator('select.group')
    if (await group.count()) {
      show(s, 'A name, a password and a group - listens, makes songs, or helps as an admin. A user logs in on any device that opens the player.')
      await s.openSelect(group, { choose: 'listener', browse: 3, read: 900 })
    }
    await s.click(add.locator('button'))
    await s.wait(900)
    await talk(s, 'A name, a password and a group - listens, makes songs, or helps as an admin. A user logs in on any device that opens the player.')
  }
  await talk(s, 'Everything you set is kept on this computer, by the player - not in the browser.')
  await s.hover(page.locator('.settings button', { hasText: 'Download a backup' }))
  await talk(s, 'A backup to download, and to restore here or on another computer.')
  const addFolder = page.locator('.settings button', { hasText: 'Add a folder' })
  if (await addFolder.count()) {
    await addFolder.scrollIntoViewIfNeeded()
    await s.hover(addFolder)
    await talk(s, 'Choose the folders it reads - and the other music in them plays too, with its tags and lyrics.')
  }
  const mp3 = page.locator('.settings label.check', { hasText: 'MP3' }).first()
  if (await mp3.count()) {
    await mp3.scrollIntoViewIfNeeded()
    await s.spotlight(mp3, { ms: 2800, pad: 6 })
    await s.hover(mp3.locator('input'))
    await talk(s, 'Sound: the MP3 where a song has one - less data for a phone in the network.')
  }
  const rule = page.locator('.settings .version .switch').first()
  if (await rule.count()) {
    await rule.scrollIntoViewIfNeeded()
    await s.spotlight(rule, { ms: 2800, pad: 6 })
    await s.hover(rule)
    await talk(s, 'Lyrics: the rule for every song - as written, or as sung.')
  }
  const stop = page.locator('.settings button', { hasText: 'Stop the player' })
  await stop.scrollIntoViewIfNeeded()
  await s.hover(stop)
  await talk(s, 'Started from ComfyUI, the player has no window: Stop the player ends it.')

  s.chapter('Back to ComfyUI')
  await s.click(page.locator('.bar .song .icon-btn').first())
  await s.wait(1200)
  const back = page.locator('.song-page .actions button', { hasText: 'Open in ComfyUI' })
  await s.hover(back)
  await talk(s, 'And Open in ComfyUI takes the song back to work on it.')
  const [comfy] = await Promise.all([s.context.waitForEvent('page'), s.click(back)])
  await s.switchTo(comfy)
  page = s.page
  await page.waitForFunction(() => window.app?.graph?.nodes?.some((n) => String(n.type).startsWith('Plenio')), null, { timeout: 120000 })
  await s.wait(2500)
  await s.rest()
  await talk(s, 'Its workflow opens: the brief, the lyrics, the score and the settings - ready for another take.', 6000)
  await talk(s, 'Make songs in ComfyUI - and listen to them in the player.', 3000)

  s.card('end', {
    title: 'Plenio Player',
    lines: ['In ComfyUI: <b>Plenio Player</b> beside Run', 'Accounts, Live Play, guests, videos, a player to share', 'Guide and source: <b>github.com/jplenio/Plenio-Music-Production-System</b>'],
  }, 5)
}
