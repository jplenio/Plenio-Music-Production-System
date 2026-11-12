<script setup lang="ts">
/**
 * The Plenio Player: the sidebar, the page of the route (the library and its smart lists, a song, the
 * playlists, a playlist), the bar at the bottom, the queue from the right and Now playing over everything.
 * Keyboard: Space, arrows, F, V, N, L, S, R, B, M, Q, /, 1-4, Esc, ? - shown with ?.
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import LibraryView from './components/LibraryView.vue'
import NowPlaying from './components/NowPlaying.vue'
import PlayerBar from './components/PlayerBar.vue'
import PlaylistView from './components/PlaylistView.vue'
import PlaylistsView from './components/PlaylistsView.vue'
import SettingsView from './components/SettingsView.vue'
import LiveView from './components/LiveView.vue'
import JobsView from './components/JobsView.vue'
import MakeView from './components/MakeView.vue'
import VideoDialog from './components/VideoDialog.vue'
import ShareDialog from './components/ShareDialog.vue'
import QueuePanel from './components/QueuePanel.vue'
import RemoveDialog from './components/RemoveDialog.vue'
import Sidebar from './components/Sidebar.vue'
import SongView from './components/SongView.vue'
import Icon from './components/Icon.vue'
import GuestWayIn from './components/GuestWayIn.vue'
import JoinView from './components/JoinView.vue'
import PeopleView from './components/PeopleView.vue'
import { movedRoute } from './nav'
import LoginView from './components/LoginView.vue'
import MiniPlayer from './components/MiniPlayer.vue'
import BottomNav from './components/BottomNav.vue'
import HelpView from './components/HelpView.vue'
import FolderNote from './components/FolderNote.vue'
import { folderNote } from './folderNote'
import Reactions from './components/Reactions.vue'
import { loadCheers } from './reactions'
import { layout, slimBar } from './layout'
import { begin, joining, loginShown } from './account'
import { guestBig, loadGuests } from './guests'
import { api } from './api'
import { engine } from './engine'
import { paletteStyle, toggleLyrics } from './now'
import {
  current,
  go,
  library,
  load,
  loadError,
  loading,
  next,
  openCurrentPage,
  nowPlayingOpen,
  previous,
  removing,
  route,
  say,
  scanning,
  setVolume,
  toast,
  settings,
  toggleAB,
  toggleFavorite,
  videoFor,
  shareFor,
  toggleMute,
} from './store'
import { loadMyPresets } from './visuals/drop'
import { loadJobs, videosAtWork } from './jobs'
import './live'
import './remote'
import { isPortable } from './portable'
import { pollMake } from './make/state'

const queueOpen = ref(false)
const help = ref(false)
/** The bar's height: the queue ends above it (the slim player and the tab bar of a phone are its height there). */
const barBox = ref<HTMLElement | null>(null)
const barHeight = ref(96)
let barWatch: ResizeObserver | undefined
/** The sidebar as a drawer on a tablet or a phone (*More* in a phone's tab bar opens it); a new page closes it. */
const drawer = ref(false)
const main = ref<HTMLElement | null>(null)
const libraryView = ref<InstanceType<typeof LibraryView> | null>(null)
const nowPlaying = ref<InstanceType<typeof NowPlaying> | null>(null)

const page = computed(() => {
  const [, first = '', second = ''] = route.value.split('/')
  if (first === 'song' && second) return { kind: 'song' as const, id: decodeURIComponent(second) }
  if (first === 'playlist' && second) return { kind: 'playlist' as const, id: decodeURIComponent(second) }
  if (first === 'playlists') return { kind: 'playlists' as const }
  if (first === 'settings') return { kind: 'settings' as const, section: second }
  if (first === 'live') return { kind: 'live' as const }
  if (first === 'jobs') return { kind: 'jobs' as const }
  if (first === 'people' && !isPortable) return { kind: 'people' as const }
  if (first === 'make' && !isPortable) return { kind: 'make' as const, from: second ? decodeURIComponent(second) : '' }
  if (first === 'help') return { kind: 'help' as const, topic: second ? decodeURIComponent(second) : '' }
  if (first === 'favorites' || first === 'top' || first === 'recent') return { kind: 'library' as const, collection: first as 'favorites' | 'top' | 'recent' }
  return { kind: 'library' as const, collection: 'all' as const }
})
watch(page, () => (drawer.value = false))
// Settings' Accounts, Party songs and In your network live on People & access now: their old addresses lead there
watch(route, (path) => {
  const moved = movedRoute(path)
  if (moved) go(moved, true)
}, { immediate: true })
// a page opens at its top - except a library page you come back to, which is where you left it; and when the
// song that plays is not in sight there, the page goes to it (owner's request 2026-10-17: back from a song's
// page with 1000 songs, the place of the song that plays - not the top again)
const scrolls = new Map<string, number>()
watch(route, (now, before) => {
  if (before !== undefined && main.value) scrolls.set(before, main.value.scrollTop)
  const keep = !now.startsWith('/song/') && !now.startsWith('/record/')
  void nextTick(async () => {
    const box = main.value
    if (!box) return
    box.scrollTo({ top: keep ? (scrolls.get(now) ?? 0) : 0, behavior: 'instant' as ScrollBehavior })
    const card = page.value.kind === 'library' ? await libraryView.value?.cardOfCurrent() : null
    if (!card) return
    const at = card.getBoundingClientRect()
    const view = box.getBoundingClientRect()
    if (at.top < view.top || at.bottom > view.bottom) card.scrollIntoView({ block: 'center', behavior: 'instant' as ScrollBehavior })
    card.classList.add('found')
    window.setTimeout(() => card.classList.remove('found'), 1400)
  })
})

// ComfyUI's Export Release opens the player at a song by its record file: #/record/<path> -> its page
watch(
  [route, library],
  async ([path]) => {
    if (!path.startsWith('/record/') || !library.value.length) return
    const record = decodeURIComponent(path.slice('/record/'.length))
    try {
      const { id } = await api.find(record)
      go(`/song/${id}`, true)
    } catch {
      go('/', true)
      say('That song is not in the library (yet) - Look for new songs, or check the folders in Settings.', 5000)
    }
  },
  { immediate: true }
)

const KEYS: [string, string][] = [
  ['Space', 'Play / pause'],
  ['← →', 'Back / ahead 5 seconds'],
  ['Shift ← →', 'Previous / next song'],
  ['↑ ↓', 'Louder / quieter'],
  ['F', 'Now playing'],
  ['Shift F', 'Only the visual, full screen'],
  ['I', 'The page of the song that plays'],
  ['1 – 4', 'Stage, lyrics, notation, visual'],
  ['V', 'The visuals’ settings'],
  ['N', 'Another visual'],
  ['L', 'Favourite'],
  ['S', 'Shuffle'],
  ['R', 'Repeat: the whole playlist, this song, off'],
  ['B', 'A/B: master or unmastered take'],
  ['W', 'Lyrics as written or as sung (kept for the song)'],
  ['M', 'Mute'],
  ['Q', 'The queue'],
  ['/', 'Search'],
  ['H', 'Help and the video tutorials'],
  ['Esc', 'Close'],
]

function onKey(event: KeyboardEvent): void {
  const target = event.target as HTMLElement
  const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable
  if (event.key === 'Escape') {
    // Esc leaves a text field first; a list (select) that was chosen from does not hold it back
    if (typing && target.tagName !== 'SELECT') (target as HTMLInputElement).blur()
    else if (guestBig.value) guestBig.value = false
    else if (removing.value) removing.value = null
    else if (help.value) help.value = false
    else if (queueOpen.value) queueOpen.value = false
    else if (nowPlayingOpen.value) nowPlayingOpen.value = false
    return
  }
  if (typing || event.ctrlKey || event.metaKey || event.altKey) return
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
  switch (key) {
    case ' ':
      event.preventDefault()
      void engine.toggle()
      break
    case 'ArrowLeft':
      event.preventDefault()
      if (event.shiftKey) void previous()
      else engine.seek(engine.time - 5)
      break
    case 'ArrowRight':
      event.preventDefault()
      if (event.shiftKey) void next()
      else engine.seek(engine.time + 5)
      break
    case 'ArrowUp':
    case 'ArrowDown':
      event.preventDefault()
      setVolume(settings.volume + (key === 'ArrowUp' ? 0.05 : -0.05))
      say(`Volume ${Math.round(settings.volume * 100)} %`)
      break
    case 'f':
      if (event.shiftKey) visualFullscreen()
      else nowPlayingOpen.value = !nowPlayingOpen.value
      break
    case 'v':
      nowPlayingOpen.value = true
      void nextTick(() => nowPlaying.value?.togglePanel())
      break
    case 'n':
      nowPlaying.value?.nextVisual()
      break
    case '1':
    case '2':
    case '3':
    case '4':
      nowPlayingOpen.value = true
      void nextTick(() => nowPlaying.value?.setView((['stage', 'lyrics', 'notation', 'visual'] as const)[Number(key) - 1]))
      break
    case 'i':
      openCurrentPage()
      break
    case 'l':
      if (current.value) {
        toggleFavorite(current.value.id)
        say('♥')
      }
      break
    case 's':
      settings.shuffle = !settings.shuffle
      say(settings.shuffle ? 'Shuffle on' : 'Shuffle off')
      break
    case 'r':
      settings.repeat = settings.repeat === 'all' ? 'one' : settings.repeat === 'one' ? 'off' : 'all'
      say({ all: 'Repeat: the whole playlist', one: 'Repeat: this song', off: 'Repeat off' }[settings.repeat])
      break
    case 'b':
      toggleAB()
      break
    case 'w': {
      const shown = toggleLyrics()
      say(shown ? (shown === 'sung' ? 'Lyrics as sung' : 'Lyrics as written') : 'This song has only its written lyrics')
      break
    }
    case 'm':
      toggleMute()
      break
    case 'q':
      queueOpen.value = !queueOpen.value
      break
    case '/':
      event.preventDefault()
      nowPlayingOpen.value = false
      if (page.value.kind !== 'library') go('/')
      void nextTick(() => libraryView.value?.focus())
      break
    case '?':
      help.value = !help.value
      break
    case 'h':
      go(page.value.kind === 'help' ? '/' : '/help')
      break
  }
}
function visualFullscreen(): void {
  nowPlayingOpen.value = true
  void nextTick(() => nowPlaying.value?.visualFullscreen())
}

/** An invitation accepted: the new user's state; set aside: the login page as without it. */
function joined(): void {
  joining.value = ''
  loginShown.value = false
  void load()
}
async function notJoining(): Promise<void> {
  joining.value = ''
  history.replaceState(null, '', '#/')
  if (await begin()) void load()
  else loginShown.value = true
}

/** Somebody chose who listens (the login page): now the page reads their state. */
function loggedIn(): void {
  loginShown.value = false
  void load()
}

/** A video in the queue is drawn by this page: closing it stops the video, so the browser asks first. */
function beforeLeave(event: BeforeUnloadEvent): void {
  if (!videosAtWork.value) return
  event.preventDefault()
  event.returnValue = ''
}

// the listener's own Plenio Drop presets: read now, and again every few seconds (a file saved shows at once)
let presetTimer: number | undefined
onMounted(() => {
  window.addEventListener('keydown', onKey)
  window.addEventListener('beforeunload', beforeLeave)
  // the shared players the player is making or made (also before this page opened)
  void loadJobs()
  const el = barBox.value
  if (el && typeof ResizeObserver !== 'undefined') {
    barWatch = new ResizeObserver(() => (barHeight.value = Math.round(el.getBoundingClientRect().height)))
    barWatch.observe(el)
  }
  void loadMyPresets()
  // the guests' access as it was left: on, the page tells the guests what plays again
  void loadGuests()
  // the guests' reactions per song, as the player keeps them (the song's page shows them)
  if (!isPortable) void loadCheers(api.reactions)
  // party songs: the sidebar's entry and count, and a word when a song of one's own is ready
  pollMake(false, (job) =>
    say(
      job.release === 'maker'
        ? `Your song “${job.result?.title || job.label}” is ready - hear it first in Make a song, then release it`
        : job.release === 'admin'
          ? `Your song “${job.result?.title || job.label}” is ready - an admin hears it before everybody does`
          : `Your song “${job.result?.title || job.label}” is ready${settings.live.on ? ' - it joins the party' : ''}`,
      6000
    )
  )
  if (!isPortable) presetTimer = window.setInterval(() => {
    if (document.visibilityState === 'visible') void loadMyPresets()
  }, 3000)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('beforeunload', beforeLeave)
  barWatch?.disconnect()
  clearInterval(presetTimer)
})
</script>

<template>
  <div class="app" :class="[layout, { 'no-side': !settings.sidebar && layout === 'desktop' }]" :style="[paletteStyle, { '--bar-height': `${barHeight}px` }]">
    <JoinView v-if="joining" :code="joining" @done="joined" @away="notJoining" />
    <LoginView v-else-if="loginShown" @done="loggedIn" />
    <div class="ambient" />
    <Sidebar v-if="settings.sidebar || layout !== 'desktop'" class="sidebar" :class="{ open: drawer }" />
    <button v-if="layout === 'tablet'" class="menu-btn icon-btn" :class="{ open: drawer }" :title="drawer ? 'Close the menu' : 'Menu: songs, playlists, Live Play, settings'" @click="drawer = !drawer"><Icon :name="drawer ? 'close' : 'list'" /></button>
    <Transition name="fade"><div v-if="drawer" class="drawer-veil" @click="drawer = false" /></Transition>
    <main ref="main" class="main">
      <div v-if="loading && !library.length" class="splash">
        <span class="logo"><i /><i /><i /><i /><i /></span>
        <p v-if="scanning && scanning.total">Reading your songs - {{ scanning.done }} of {{ scanning.total }}</p>
        <p v-else>Looking for your songs …</p>
        <i v-if="scanning && scanning.total" class="scan-bar"><b :style="{ width: `${(100 * scanning.done) / scanning.total}%` }" /></i>
      </div>
      <div v-else-if="loadError" class="splash error">
        <p>The player’s server does not answer: {{ loadError }}</p>
        <p class="hint">Start it with <code>python -m plenio.player</code>.</p>
      </div>
      <template v-else>
        <SongView v-if="page.kind === 'song'" :id="page.id" />
        <PlaylistView v-else-if="page.kind === 'playlist'" :id="page.id" />
        <PlaylistsView v-else-if="page.kind === 'playlists'" />
        <SettingsView v-else-if="page.kind === 'settings'" :section="page.section" />
        <LiveView v-else-if="page.kind === 'live'" />
        <JobsView v-else-if="page.kind === 'jobs'" />
        <PeopleView v-else-if="page.kind === 'people'" />
        <MakeView v-else-if="page.kind === 'make'" :key="page.from" :from="page.from" />
        <HelpView v-else-if="page.kind === 'help'" :topic="page.topic" />
        <LibraryView v-else ref="libraryView" :key="page.collection" :collection="page.collection" />
      </template>
    </main>
    <div ref="barBox" class="playerbar" :class="{ slim: slimBar }">
      <PlayerBar v-if="!slimBar" @queue="queueOpen = !queueOpen" @visual="visualFullscreen" />
      <template v-else>
        <MiniPlayer @queue="queueOpen = !queueOpen" />
        <BottomNav v-if="layout === 'phone'" @more="drawer = !drawer" />
      </template>
    </div>
    <VideoDialog v-if="videoFor" :song="videoFor" @close="videoFor = null" />
    <ShareDialog v-if="shareFor" :songs="shareFor.songs" :title="shareFor.title" @close="shareFor = null" />
    <Transition name="slide"><QueuePanel v-if="queueOpen" class="queue" @close="queueOpen = false" /></Transition>
    <Transition name="np"><NowPlaying v-if="nowPlayingOpen" ref="nowPlaying" /></Transition>
    <Transition name="fade">
      <div v-if="help" class="help" @click="help = false">
        <div class="keys" @click.stop>
          <h3>Keys</h3>
          <dl><template v-for="[k, what] in KEYS" :key="k"><dt><kbd>{{ k }}</kbd></dt><dd>{{ what }}</dd></template></dl>
          <p class="hint">Search: words find titles, lyrics, genres, moods; fields narrow it - <code>genre:jazz</code> <code>bpm:&gt;110</code> <code>key:Am</code> <code>model:yue</code> <code>lang:german</code> <code>is:fav</code> <code>has:pdf</code> <code>#party</code> <code>is:unplayed</code> <code>-word</code> <code>"a phrase"</code>. A filter chip: click keeps only those songs, right-click leaves them out.</p>
          <button class="ghost" @click="help = false; go('/help')"><Icon name="help" :size="16" /> All the help and the video tutorials</button>
        </div>
      </div>
    </Transition>
    <Transition name="fade"><GuestWayIn v-if="guestBig" big /></Transition>
    <Reactions v-if="!isPortable" />
    <Transition name="fade"><div v-if="toast" class="toast">{{ toast }}</div></Transition>
    <Transition name="fade"><RemoveDialog v-if="removing" :song="removing" @close="removing = null" @done="say" /></Transition>
    <Transition name="fade"><FolderNote v-if="folderNote" /></Transition>
  </div>
</template>

<style scoped>
.app {
  position: fixed;
  inset: 0;
  display: grid;
  /* minmax(0, ...): a wide child scrolls or wraps inside the page instead of widening it */
  grid-template-columns: 240px minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr) auto;
  grid-template-areas: 'side main' 'bar bar';
  background: #0a0910;
}
.app.no-side {
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas: 'main' 'bar';
}
.ambient {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(1200px 600px at 75% -10%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 70%),
    radial-gradient(900px 500px at 0% 110%, color-mix(in srgb, var(--accent2) 14%, transparent), transparent 70%), var(--deep);
  transition: background 1.2s;
}
.sidebar {
  grid-area: side;
  position: relative;
  min-height: 0;
}
.main {
  grid-area: main;
  position: relative;
  overflow-y: auto;
  min-height: 0;
  scroll-behavior: smooth;
}
.playerbar {
  grid-area: bar;
  position: relative;
  z-index: 10;
}
.app .queue {
  position: fixed;
  top: 0;
  right: 0;
  bottom: var(--bar-height, 96px);
  height: auto;
  z-index: 40;
}
.splash {
  height: 100%;
  display: grid;
  place-content: center;
  justify-items: center;
  color: var(--muted);
  gap: 14px;
}
.splash.error {
  color: #ff9a9a;
}
.scan-bar {
  width: min(320px, 70vw);
  height: 4px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}
.scan-bar b {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent2));
  transition: width 0.6s;
}
.splash .logo {
  display: flex;
  gap: 5px;
  align-items: flex-end;
  height: 40px;
}
.splash .logo i {
  width: 7px;
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(var(--accent), var(--accent2));
  transform-origin: bottom;
  animation: bounce 1s ease-in-out infinite;
}
.splash .logo i:nth-child(2) {
  animation-delay: -0.2s;
}
.splash .logo i:nth-child(3) {
  animation-delay: -0.4s;
}
.splash .logo i:nth-child(4) {
  animation-delay: -0.6s;
}
.splash .logo i:nth-child(5) {
  animation-delay: -0.8s;
}
.hint {
  color: var(--muted);
  font-size: 12px;
  line-height: 1.6;
}
.help {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
}
.keys {
  width: min(560px, 92vw);
  background: rgba(18, 16, 28, 0.97);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  padding: 20px 24px;
}
.keys h3 {
  margin: 0 0 12px;
}
.keys dl {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 6px 16px;
  margin: 0 0 12px;
  font-size: 13px;
}
.keys dd {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
}
kbd,
code {
  font: 12px var(--mono);
  background: rgba(255, 255, 255, 0.08);
  border-radius: 5px;
  padding: 1px 6px;
}
.toast {
  position: fixed;
  left: 50%;
  top: calc(40px + env(safe-area-inset-top, 0px));
  max-width: min(560px, calc(100vw - 32px));
  text-align: center;
  transform: translateX(-50%);
  z-index: 95;
  padding: 8px 16px;
  border-radius: 99px;
  background: rgba(20, 18, 30, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font: 600 13px var(--font);
}
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.35s;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(40px);
  opacity: 0;
}
.np-enter-active,
.np-leave-active {
  transition: opacity 0.45s, transform 0.55s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.np-enter-from,
.np-leave-to {
  opacity: 0;
  transform: translateY(40px) scale(0.98);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
@keyframes bounce {
  0%,
  100% {
    transform: scaleY(0.3);
  }
  50% {
    transform: scaleY(1);
  }
}
.menu-btn,
.drawer-veil {
  display: none;
}
/* a page comes in softly (no leaving animation: the list's place and the song's card are found at once) */
.main > * {
  animation: page-in 0.32s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}
@keyframes page-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
}
/* a tablet and a phone: the sidebar is a drawer (the menu button, a phone's More), the slim player at the bottom */
.app.tablet,
.app.phone {
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas: 'main' 'bar';
  padding: env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) 0 env(safe-area-inset-left, 0px);
}
.app.tablet .sidebar,
.app.phone .sidebar {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  width: min(300px, 86vw);
  z-index: 45;
  padding-top: calc(18px + env(safe-area-inset-top, 0px));
  padding-bottom: calc(18px + env(safe-area-inset-bottom, 0px));
  background: #120f1c;
  transform: translateX(-105%);
  transition: transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1);
  box-shadow: 20px 0 60px rgba(0, 0, 0, 0.5);
}
.app .sidebar.open {
  transform: none;
}
.menu-btn {
  display: grid;
  position: fixed;
  top: calc(10px + env(safe-area-inset-top, 0px));
  left: 10px;
  z-index: 46;
  background: rgba(18, 15, 28, 0.85);
  backdrop-filter: blur(8px);
}
/* open: beside the drawer, not over its logo */
.menu-btn.open {
  left: min(310px, calc(86vw + 10px));
}
.drawer-veil {
  display: block;
  position: fixed;
  inset: 0;
  z-index: 44;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}
.app.tablet .main > * {
  padding-top: 56px;
}
.playerbar.slim {
  padding-top: 6px;
  background: linear-gradient(transparent, rgba(6, 5, 11, 0.92) 45%);
}
.app.tablet .playerbar.slim {
  padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
}
.app.phone .playerbar.slim {
  display: grid;
  gap: 6px;
}
</style>
