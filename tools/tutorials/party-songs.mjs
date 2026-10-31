// Tutorial 9 · Party songs: songs made from the Plenio Player alone. The studio - ComfyUI - starts by itself when a
// song is ordered (Settings > The studio), party songs switched on (Settings > Party songs), Live Play running, a song
// ordered with a preset and two takes (How many), followed through the line - writing, composing, singing, the cover -
// and playing in Live Play; a guest orders a song on the party's phone page, it plays with who made it over the
// visual, the guests react from their phones, and a finished song is made again.
//
// Recorded against the Plenio Player itself (meta.page): a player started with a fresh state folder whose studio.json
// names the ComfyUI to start (its folder, a scratch --base-directory with Plenio, --models-directory) and whose
// guests.json pins the guests' port; ComfyUI not running at the start. The songs are made for real (YuE2 on the
// graphics card); the waits are fast-forwarded in the edit:
//   node tools/tutorials/record.mjs party-songs --url http://127.0.0.1:<player port>

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { FOOT } from './lib/studio.mjs'
import { parseNarration } from './lib/voice.mjs'
import { intro } from './lib/scenes.mjs'

export const meta = {
  name: 'Plenio tutorial 9 - Party songs',
  page: true,
}

const NARRATION = parseNarration(path.join(path.dirname(fileURLToPath(import.meta.url)), 'narration', 'party-songs.txt')).filter((l) => !l.card)
const norm = (t) => t.toLowerCase().replace(/[’`]/g, "'").replace(/\s+/g, ' ').trim()
function spoken(caption) {
  const line = NARRATION.find((l) => norm(caption).startsWith(norm(l.cue)))
  return line ? line.text.replace(/\[pause:[\d.]+s\]/g, '') : caption
}
// Music plays through much of the video and a hold in the edit would cut it: a caption waits as long as its
// narration line takes to speak (about 68 ms a character); a caption shown before its scene (an open list) waits
// only what is left
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

const STAGES = {
  writing: 'The writer writes the title, the style and the lyrics',
  composing: 'Plenio composes the score',
  singing: 'YuE2 sings and plays it',
  cover: 'The cover is painted',
  saving: 'Mastered, timed and saved',
}
// a job's stage as the Song API tells it (plenio/comfy/song_api.py STAGE_TEXT) -> one of the captions above
function stageKey(job) {
  if (!job || job.status === 'waiting' || job.status === 'sending') return 'waiting'
  const text = String(job.stage?.text ?? '').toLowerCase()
  if (/hearing|master|sav/.test(text)) return 'saving'
  if (/paint/.test(text)) return 'cover'
  if (/sing|loading the music/.test(text)) return 'singing'
  if (/compos|melody|planning/.test(text)) return 'composing'
  if (/brief|writ|checking/.test(text)) return 'writing'
  return text ? 'singing' : 'waiting'
}

const jobs = (page) => page.evaluate(() => fetch('/api/make?all=1', { cache: 'no-store' }).then((r) => r.json()))

/** Wait while the job (``pick`` finds it among everybody's) is made: each stage a fast-forwarded piece with its
 * caption (the first time it comes; ``captions: false`` for a later song), until it is done. */
async function follow(s, pick, { captions = true, label = '', seconds = 3.2, timeout = 1500 } = {}) {
  const started = Date.now()
  let end = s.fast(label || 'Waiting in line', seconds)
  let last = 'waiting'
  let doneAt = null
  const seen = new Set()
  while (Date.now() - started < timeout * 1000) {
    const status = await jobs(s.page).catch(() => null)
    const job = status ? pick(status.jobs ?? []) : null
    // done, and found in the library (it then joins Live Play) - or a little while after done
    if (job?.status === 'done' && (job.result?.song || (doneAt ??= Date.now()) < Date.now() - 25000)) break
    if (job?.status === 'failed' || job?.status === 'cancelled') throw new Error(`the song ${job.status}: ${job.error || job.note}`)
    const key = stageKey(job)
    if (key !== last) {
      last = key
      end()
      end = s.fast(STAGES[key] ?? label, seconds)
      if (captions && STAGES[key] && !seen.has(key)) s.caption(STAGES[key])
      seen.add(key)
    }
    await s.page.waitForTimeout(1000)
  }
  end()
  s.caption(null)
  const status = await jobs(s.page)
  return pick(status.jobs ?? [])
}

export async function prepare(s) {
  // the admin on the player's own computer (the page asks once who is listening), the welcome card read
  const login = s.page.locator('.login')
  if (await login.waitFor({ timeout: 10000 }).then(() => true, () => false)) await s.page.locator('.login .person.admin').click()
  await s.page.waitForSelector('.side a.link', { timeout: 60000 })
  await s.page.waitForTimeout(1200)
  await s.page.evaluate(() => document.querySelector('.welcome .link')?.click())
  await s.page.waitForTimeout(800)
}

export default async function partySongs(s) {
  const page = s.page
  s.card('title', {
    kicker: 'Plenio tutorial',
    title: '<span class="num">9 ·</span> Party songs',
    subtitle: 'Songs made from the player - with presets and takes, and by your guests on their phones',
    foot: FOOT,
  }, 5)
  intro(s, {
    tutorial: 'Tutorial 9 · Party songs',
    items: [
      'The studio, started from the player',
      'Party songs and Live Play',
      'Make a song: styles, presets, takes',
      'Guests make songs on their phones',
      'Who made it - and the reactions',
    ],
  })

  // --- the studio: ComfyUI starts by itself when a song is ordered ---
  s.chapter('The studio')
  await s.rest(500)
  await talk(s, 'The Plenio Player plays your songs on its own. To make new ones, it needs the studio: ComfyUI, on the same computer.')
  await s.click(page.locator('.side a.link', { hasText: 'Settings' }))
  await s.wait(900)
  await s.click(page.locator('.settings .index .chip', { hasText: 'The studio' }))
  await s.wait(1000)
  const studio = page.locator('#studio')
  await s.spotlight(studio.locator('.status'), { ms: 2400, pad: 6 })
  await talk(s, 'Settings, The studio: ComfyUI is not running.')
  const start = studio.locator('button', { hasText: 'Start the studio' })
  await s.hover(start)
  await talk(s, 'Start the studio runs it in the background - no window, and no workflow to open.')
  const auto = studio.locator('label.check', { hasText: 'Start it by itself' }).locator('input')
  await s.click(auto)
  await talk(s, 'Or let it start by itself, the moment a song is ordered …')
  await s.openSelect(studio.locator('.options select'), { choose: '30', browse: 3, read: 900 })
  await talk(s, '… and stop after half an hour without a song: the graphics card is free again.')

  // --- party songs switched on ---
  s.chapter('Party songs')
  await s.click(page.locator('.settings .index .chip', { hasText: 'Party songs' }))
  await s.wait(900)
  const party = page.locator('#party')
  await s.click(party.locator('label.check.big input'))
  await s.wait(700)
  await talk(s, 'Party songs: let people make songs - logged-in users, and the guests on their phones.')
  const guests = party.locator('label.check', { hasText: 'guests -' }).locator('input')
  if (!(await guests.isChecked())) await s.click(guests)
  show(s, 'You decide how many songs each may have in the making, and how long they may be.')
  await s.openSelect(party.locator('label.field').nth(1).locator('select'), { choose: 'short (about 1:30)', browse: 3, read: 800 })
  await talk(s, 'You decide how many songs each may have in the making, and how long they may be.', 1600)
  await s.openSelect(party.locator('label.credit select'), { choose: 'spotlight', browse: 2, read: 900 })
  await talk(s, 'And whether the party sees who made a song, while it plays.')
  const kept = party.locator('p.hint').last()
  if (await kept.count()) {
    await kept.scrollIntoViewIfNeeded()
    await s.spotlight(kept, { ms: 3200, pad: 4 })
  }
  await talk(s, 'Only a guest’s song is a party song: yours and the users’ are saved like songs made in ComfyUI.')

  // --- Live Play: the party's playlist, where new songs join ---
  s.chapter('Live Play')
  await s.click(page.locator('.side a.link', { hasText: 'Live Play' }))
  await s.wait(1000)
  const newest = page.locator('.way', { hasText: 'With the newest songs' })
  await s.openSelect(newest.locator('select'), { choose: '20', browse: 2, read: 600 })
  await s.click(newest.locator('button', { hasText: 'Start' }))
  await s.wait(1500)
  await talk(s, 'Live Play runs the party. Every song made from now on joins it - next, at the end, or anywhere.')

  // --- a song ordered: a preset, a style, a few words, two takes ---
  s.chapter('Make a song')
  await s.click(page.locator('.side a.link', { hasText: 'Make a song' }))
  await page.waitForSelector('.preset', { timeout: 30000 })
  await s.wait(1000)
  await talk(s, 'Make a song: a new song, or a cover of a recording you drop in.')
  const presets = page.locator('.presets')
  await s.spotlight(presets, { ms: 2600, pad: 6 })
  await s.hover(page.locator('.preset', { hasText: 'Best quality' }))
  await talk(s, 'Presets set the whole form at once: Best quality - HQ mastering, cover art, the best of three takes for the words …')
  await s.click(page.locator('.preset', { hasText: 'Party - fast' }))
  await talk(s, '… or Party, fast: about a minute and a half with cover art, ready in a few minutes.')
  await s.hover(page.locator('.preset', { hasText: 'Save as preset' }))
  await talk(s, 'Your own settings keep a name of their own.', 2600)
  await s.click(page.getByRole('button', { name: 'Latin', exact: true }).first())
  await s.wait(700)
  await talk(s, 'Pick a style: a vibe, any template by name, or Surprise me. It fills every field below.')
  const idea = page.locator('textarea[aria-label="What the lyrics are about"]').first()
  await idea.scrollIntoViewIfNeeded()
  await s.click(idea)
  await s.keys('Control+a', { labels: ['Ctrl', 'A'] })
  await s.type('A garden party at dusk: lanterns in the trees, everyone dancing, a chorus to sing along.', { delay: 28 })
  await s.wait(500)
  await talk(s, 'Say what it is about, in a few words - or write your own lyrics, sung as written.', 3000)
  const many = page.locator('.many')
  await many.scrollIntoViewIfNeeded()
  await s.wait(500)
  await s.click(many.locator('.seg button', { hasText: /^2$/ }).first())
  await s.click(page.locator('.kinds-of button', { hasText: 'takes of one song' }))
  await talk(s, 'How many: two takes of one song - the same words and notes, sung and played twice. Keep the one you like best.')
  const ordered = Date.now() / 1000
  await s.click(page.locator('button.generate'))
  await s.wait(1200)
  await talk(s, 'Generate. The song is first in line - and its second take follows when it is made.')

  // the studio starts by itself
  s.chapter('The studio starts')
  const pill = page.locator('.pill', { hasText: /Studio|Starting/ }).first()
  if (await pill.count()) await s.hover(pill)
  await talk(s, 'ComfyUI was not running: the player starts it now.')
  let end = s.fast('ComfyUI starts', 3.2)
  await page.waitForFunction(() => /Studio (busy|ready)/.test(document.body.innerText), null, { timeout: 300000 })
  end()
  await s.wait(800)
  await talk(s, 'The studio is ready, and the song goes to it.')

  // --- the line: the song being made ---
  s.chapter('Your songs')
  const row = page.locator('.queue .row').first()
  await s.hover(row)
  await talk(s, 'Your songs: the line, what the studio does now, and roughly when your song will be ready.')
  const first = (list) => list.filter((j) => j.created >= ordered - 5 && j.number === 1).sort((a, b) => a.created - b.created)[0]
  await follow(s, first, { label: 'The song is made' })
  await s.wait(800)
  await talk(s, 'Made - with its title and its cover.')
  await s.click(page.locator('.side a.link', { hasText: 'Live Play' }))
  await s.wait(1500)
  // the new song waits in the list - or, when the song before it just ended, it plays already: point at either
  const fresh = await page.locator('.list .row.fresh').first().boundingBox({ timeout: 1500 }).catch(() => null)
  const playingNow = fresh ? null : await page.locator('.playing').first().boundingBox({ timeout: 1500 }).catch(() => null)
  if (fresh || playingNow) await s.hover(fresh ?? playingNow)
  await talk(s, 'It joined Live Play, marked new.')

  // --- a guest orders a song on the party's phone page ---
  s.chapter('Guests make songs')
  const access = page.locator('.guests')
  await access.scrollIntoViewIfNeeded()
  const switchOn = access.locator('.top input[type=checkbox]')
  if (!(await switchOn.isChecked())) await s.click(switchOn)
  await page.waitForSelector('.guests .url code', { timeout: 15000 })
  await s.wait(700)
  await talk(s, 'Guests in your network: everyone on the party’s Wi-Fi scans the QR code.')
  const perSong = access.locator('.choice', { hasText: 'Reactions' }).locator('select')
  if (await perSong.count()) {
    await s.openSelect(perSong, { choose: 'any', browse: 2, read: 1200 })
    await talk(s, 'Reactions: as many per song as they like, or one per song and guest - a tap on another changes it.')
  }
  const guestUrl = (await page.textContent('.guests .url code')).trim()
  const phone = await s.context.newPage()
  await phone.goto(guestUrl)
  await s.switchTo(phone)
  await phone.waitForSelector('#makeBox:not([hidden])', { timeout: 20000 })
  await s.wait(900)
  await talk(s, 'On the phone: what plays, what comes next - and Make your own song.')
  await s.click(phone.locator('#makeBox'))
  await phone.waitForSelector('.preset, .chips', { timeout: 30000 })
  await s.wait(1000)
  await s.click(phone.getByRole('button', { name: 'Pop', exact: true }).first())
  const phoneIdea = phone.locator('textarea[aria-label="What the lyrics are about"]').first()
  await phoneIdea.scrollIntoViewIfNeeded()
  await s.click(phoneIdea)
  await phone.keyboard.press('Control+a')
  await s.type('My best friend turns thirty tonight - a happy song about getting older and staying young.', { delay: 28 })
  await s.wait(500)
  await talk(s, 'The same simple form: a style, a few words - the host decides how long a guest’s song may be.')
  const guestOrdered = Date.now() / 1000
  await s.click(phone.locator('button.generate'))
  await s.wait(1500)
  await talk(s, 'Their song is in line, with a rough time it will be ready.')
  await s.switchTo(page)
  await s.click(page.locator('.side a.link', { hasText: 'Make a song' }))
  await s.wait(1000)
  const everybody = page.getByRole('button', { name: /Everybody/ }).first()
  if (await everybody.count()) await s.click(everybody)
  await s.wait(800)
  await talk(s, 'Everybody’s songs: the second take first - then the guest’s song. You may move any song, or take it out.')
  // the second take, then the guest's song
  const take = (list) => list.filter((j) => j.created >= ordered - 5 && j.number === 2).sort((a, b) => a.created - b.created)[0]
  await follow(s, take, { captions: false, label: 'The second take is made' })
  const guestSong = (list) => list.filter((j) => j.created >= guestOrdered - 5 && j.owner?.kind === 'guest')[0]
  const guestJob = await follow(s, guestSong, { captions: false, label: 'The guest’s song is made' })
  const guestTitle = String(guestJob?.result?.title ?? guestJob?.label ?? '')
  await s.wait(800)
  await talk(s, 'Both are ready - and the guest’s song plays next.')

  // --- who made it, over the visual ---
  s.chapter('Who made it')
  await s.click(page.locator('.side a.link', { hasText: 'Live Play' }))
  await s.wait(1000)
  // play the guest's song now (its row in Up next, by its title)
  const guestRow = page.locator('.list .row', { hasText: guestTitle }).first()
  if (guestTitle && (await guestRow.count())) {
    await guestRow.scrollIntoViewIfNeeded()
    await s.hover(guestRow)
    await s.click(guestRow.locator('button[title="Play now"]'))
  } else {
    await s.keys('Shift+ArrowRight', { labels: ['Shift', '→'] })
  }
  await s.wait(1200)
  await s.keys('f')
  await s.wait(700)
  await s.keys('4')
  await s.rest(600)
  await s.wait(1500)
  await talk(s, 'While it plays, the party sees whose song it is and from which party - large as it begins, at every new section, and as it ends.', 7000)

  // --- the guests react ---
  s.chapter('Reactions')
  await s.switchTo(phone)
  await phone.locator('a.back').click().catch(() => {})
  await phone.waitForSelector('#reactBox:not([hidden])', { timeout: 20000 })
  await s.wait(800)
  await talk(s, 'And the guests react: one tap on their phone …', 2600)
  for (const emoji of ['🔥', '❤️', '🎉', '👏']) {
    await s.click(phone.getByRole('button', { name: `Send ${emoji} to the big screen` }), { pause: 120 })
  }
  await s.switchTo(page)
  // the room goes on tapping while the big screen is in view: the same buttons of the guests' page, clicked in it
  // (its own pause between two taps is 250 ms; the player takes 60 a minute from a phone)
  const tapping = (async () => {
    for (const emoji of ['🔥', '❤️', '🎉', '🔥', '💃', '👏', '🔥', '😂', '❤️', '🎉', '🔥', '❤️', '💃', '🔥']) {
      await phone
        .evaluate((label) => document.querySelector(`button[aria-label="${label}"]`)?.click(), `Send ${emoji} to the big screen`)
        .catch(() => {})
      await new Promise((resolve) => setTimeout(resolve, 450))
    }
  })()
  await s.rest(400)
  await talk(s, '… and it floats up the big screen. Live Play counts how the room liked each song.', 6000)
  await tapping
  await phone.close()
  await s.keys('Escape')
  await s.wait(800)
  // the song keeps them: its page shows the guests' reactions, apart from the favourite heart
  const guestSongId = String(guestJob?.result?.song ?? '')
  if (guestSongId) {
    await page.evaluate((id) => (location.hash = `#/song/${id}`), guestSongId)
    await s.wait(1600)
    const cheers = page.locator('.song-page .cheers').first()
    if (await cheers.count()) {
      await s.spotlight(cheers, { ms: 3000, pad: 6 })
      await talk(s, 'Every song keeps its reactions: its page shows them, apart from your favourite heart.')
    }
  }

  // --- again, from a song ---
  s.chapter('Again')
  await s.click(page.locator('.side a.link', { hasText: 'Make a song' }))
  await s.wait(1000)
  const again = page.locator('.queue .row .again').first()
  if (await again.count()) {
    await s.click(again)
    await page.waitForSelector('.again-kinds, .kind', { timeout: 20000 }).catch(() => {})
    await s.wait(1200)
    await talk(s, 'Any finished song can be made again: a new take, a new song like it, or a cover of it.')
  }
  await talk(s, 'Make songs with your guests - and the player does the rest.', 3000)

  s.card('end', {
    title: 'Party songs',
    lines: ['<b>Settings › Party songs</b> and <b>Settings › The studio</b>', 'Presets, takes, the guests’ phones, who made it, reactions', 'Guide: <b>github.com/jplenio/Plenio-Music-Production-System</b>'],
  }, 5)
}
