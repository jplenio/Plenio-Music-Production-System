<script setup lang="ts">
/** The sidebar: the library and its smart lists, your saved filters, the playlists (a new one in place), the
 * folder, a rescan. */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import { vFocus } from '../focus'
import { applySavedFilter, comfyLink, deleteSavedFilter, folders, go, lastSaved, library, lookForComfyUI, newPlaylist, remote, rescan, route, saveError, settings, shareFor, state } from '../store'
import Icon from './Icon.vue'
import { active, jobs } from '../jobs'
import { isPortable, loading, portable } from '../portable'
import { avatarUrl, guest, initials, me, session, switchUser } from '../account'
import { approvalsNow, makeShown, makingNow } from '../make/state'
import { SMART_LISTS } from '../nav'

const naming = ref(false)
const name = ref('')
const scanning = ref(false)
// ComfyUI to open, while it runs (asked now and then)
let comfyTimer: number | undefined
onMounted(() => {
  void lookForComfyUI()
  comfyTimer = window.setInterval(() => void lookForComfyUI(), 15000)
})
onBeforeUnmount(() => window.clearInterval(comfyTimer))

// the five places (nav.ts): Songs, Playlists (the smart lists inside), Live, Make - and More at the foot
const LINKS = [
  ['/', 'Songs', 'music'],
  ['/playlists', 'Playlists', 'playlist'],
  ['/live', 'Live Play', 'live'],
] as const
const counts = computed<Record<string, number>>(() => ({
  '/': library.value.length,
  '/favorites': state.favorites.length,
  '/top': Object.keys(state.plays).length,
  '/recent': Object.keys(state.last_played).length,
  '/playlists': state.playlists.length,
}))

function create(): void {
  const playlist = newPlaylist(name.value)
  naming.value = false
  name.value = ''
  go(`/playlist/${playlist.id}`)
}
async function scan(): Promise<void> {
  scanning.value = true
  try {
    await rescan()
  } finally {
    scanning.value = false
  }
}
/** A folder as its last two names (``player-video-base › output``): the whole path is in its tooltip. */
function shortFolder(path: string): string {
  const parts = path.split(/[\\/]+/).filter(Boolean)
  return parts.slice(-2).join(' › ') || path
}
</script>

<template>
  <nav class="side">
    <a class="brand" @click="go('/')">
      <span class="logo"><i /><i /><i /><i /></span>
      <span>Plenio <b>Player</b></span>
    </a>
    <div v-if="session?.login && !isPortable" class="who" :title="guest ? 'A guest: playlists, likes and plays stay in this browser' : 'Your playlists, likes and plays - the same on every device'">
      <span class="face" :style="{ background: me?.color ?? '#4a4560' }">
        <img v-if="me?.avatar" :src="avatarUrl(me)" alt="" />
        <template v-else-if="me">{{ initials(me.name) }}</template>
        <Icon v-else name="user" :size="16" />
      </span>
      <span class="name">{{ me ? me.name : 'Guest' }}<small v-if="me?.admin || me?.helper"> · admin</small></span>
      <button class="icon-btn" :title="guest ? 'Log in' : 'Log out - somebody else listens'" @click="switchUser"><Icon name="logout" :size="16" /></button>
    </div>
    <a v-for="[path, label, icon] in LINKS" :key="path" class="link" :class="{ on: route === path }" @click="go(path)">
      <Icon :name="icon" :size="18" /> {{ label }} <small v-if="path === '/live' && settings.live.on" class="on-air">LIVE</small><small v-else>{{ counts[path] || '' }}</small>
    </a>
    <a v-if="makeShown" class="link make" :class="{ on: route === '/make' }" title="Make a song of your own: a style, a few words - it plays at the party when it is ready" @click="go('/make')">
      <Icon name="wand" :size="18" /> Make a song <small v-if="approvalsNow" class="busy approvals" :title="`${approvalsNow} waiting for your approval`">{{ approvalsNow }} ✓</small><small v-else-if="makingNow" class="busy">{{ makingNow }}</small>
    </a>

    <template v-if="settings.savedFilters.length">
      <h4>Saved filters</h4>
      <div v-for="f in settings.savedFilters" :key="f.id" class="link saved" :title="[f.query, ...f.chips].filter(Boolean).join('  ')" @click="applySavedFilter(f)">
        <Icon name="filter" :size="16" /> <span>{{ f.name }}</span>
        <button class="icon-btn forget" title="Forget this filter" @click.stop="deleteSavedFilter(f.id)"><Icon name="close" :size="13" /></button>
      </div>
    </template>

    <h4>Playlists <button class="icon-btn" title="New playlist" @click="naming = !naming"><Icon name="plus" :size="16" /></button></h4>
    <a v-for="[path, label, icon] in SMART_LISTS" :key="path" class="link" :class="{ on: route === path }" @click="go(path)">
      <Icon :name="icon" :size="16" /> {{ label }} <small>{{ counts[path] || '' }}</small>
    </a>
    <form v-if="naming" class="new" @submit.prevent="create">
      <input v-model="name" v-focus placeholder="Name" @keydown.esc="naming = false" />
    </form>
    <div class="lists">
      <a v-for="p in state.playlists" :key="p.id" class="link pl" :class="{ on: route === `/playlist/${p.id}` }" @click="go(`/playlist/${p.id}`)">
        <i class="dot" :style="{ background: `hsl(${p.hue ?? 260} 80% 60%)` }" /> <span>{{ p.name }}</span> <small>{{ p.songs.length }}</small>
      </a>
      <p v-if="!state.playlists.length && !naming" class="hint">No playlists yet - make one with +, or from a song’s ⋯ menu.</p>
    </div>

    <div class="foot">
      <template v-if="isPortable">
        <p class="shared">“{{ portable?.title }}” - shared with the Plenio Player</p>
        <p v-if="portable?.part" class="shared" :title="portable.part.files.join('\n')">Part {{ portable.part.index }} of {{ portable.part.count }} - the others: {{ portable.part.files.filter((_, k) => k !== portable!.part!.index - 1).join(', ') }}</p>
        <div v-if="!loading.done && loading.total" class="arriving" :title="'A large file is read for a while: the songs play as they arrive'">
          <span>Songs arriving: {{ loading.got }} of {{ loading.total }} files</span>
          <i :style="{ width: `${(loading.got / loading.total) * 100}%` }" />
        </div>
      </template>
      <p v-if="remote" class="remote-mark" title="This page came from the network: the player runs on another computer"><Icon name="external" :size="13" /> from the network</p>
      <button v-for="f in folders" :key="f" class="folder" :title="`The songs are read from ${f} - a click: the folders in Settings`" @click="go('/settings/songs')">
        <Icon name="folder" :size="14" /> <span>{{ shortFolder(f) }}</span>
      </button>
      <a v-if="comfyLink" class="link small-link comfy" :href="comfyLink" target="_blank" rel="noopener" title="ComfyUI, in a tab of its own"><Icon name="external" :size="16" /> ComfyUI <small>↗</small></a>
      <button v-if="!isPortable" class="ghost small" :class="{ wide: true }" @click="shareFor = { songs: [], title: '' }"><Icon name="download" :size="14" /> Share as a player…</button>
      <button v-if="!isPortable" class="ghost small" :disabled="scanning" @click="scan"><Icon name="refresh" :size="14" :class="{ spin: scanning }" /> {{ scanning ? 'Looking …' : 'Look for new songs' }}</button>
      <h4 class="more">More</h4>
      <a v-if="!isPortable" class="link small-link" :class="{ on: route === '/people' }" title="Who comes in and what each may do: your devices, a party, people with accounts" @click="go('/people')">
        <Icon name="guests" :size="16" /> People &amp; access
      </a>
      <a v-if="jobs.length" class="link small-link" :class="{ on: route === '/jobs' }" title="Videos and shared players being made, waiting and made" @click="go('/jobs')">
        <Icon name="layers" :size="16" /> In the making <small v-if="active.length" class="busy">{{ active.length }}</small><small v-else>✓</small>
      </a>
      <a class="link small-link" :class="{ on: route.startsWith('/help') }" title="Short guides and every tutorial as a video (key H)" @click="go('/help')">
        <Icon name="help" :size="16" /> Help &amp; tutorials
      </a>
      <a class="link small-link" :class="{ on: route.startsWith('/settings') }" @click="go('/settings')">
        <Icon name="gear" :size="16" /> Settings
        <small :class="{ bad: saveError }" :title="saveError || 'Playlists, favourites and every setting are kept on this computer'">{{ saveError ? 'not saved' : lastSaved ? 'saved ✓' : 'kept ✓' }}</small>
      </a>
      <p class="keys">Space play · ←→ seek · F now playing · I song page · H help · ? keys</p>
    </div>
  </nav>
</template>

<style scoped>
.side {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 18px 12px;
  height: 100%;
  /* a short window: the whole column scrolls rather than cutting off its foot */
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.28);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font: 600 18px var(--font);
  padding: 2px 10px 18px;
  cursor: pointer;
  color: #fff;
}
.brand b {
  color: var(--accent);
  font-weight: 800;
}
.logo {
  display: flex;
  gap: 3px;
  align-items: flex-end;
  height: 22px;
}
.who {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: -8px 0 12px;
  padding: 6px 6px 6px 8px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
}
.who .face {
  flex: none;
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  overflow: hidden;
  font: 700 12px var(--font);
  color: #fff;
}
.who .face img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.who .name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font: 600 13px var(--font);
}
.who .name small {
  font-weight: 400;
  opacity: 0.6;
}
.logo i {
  width: 4px;
  border-radius: 2px;
  background: linear-gradient(var(--accent), var(--accent2));
  animation: logo 1.6s ease-in-out infinite;
}
.logo i:nth-child(1) {
  height: 40%;
}
.logo i:nth-child(2) {
  height: 90%;
  animation-delay: -0.4s;
}
.logo i:nth-child(3) {
  height: 65%;
  animation-delay: -0.8s;
}
.logo i:nth-child(4) {
  height: 30%;
  animation-delay: -1.2s;
}
.link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.72);
  cursor: pointer;
  font: 500 14px var(--font);
  transition: background 0.15s, color 0.15s;
}
.link:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}
.link.on {
  background: color-mix(in srgb, var(--accent) 22%, transparent);
  color: #fff;
}
.link small.busy {
  color: #0b0a12;
  background: var(--accent);
  padding: 1px 7px;
  border-radius: 6px;
  font-weight: 700;
  animation: on-air 1.6s ease-in-out infinite;
}
.arriving {
  position: relative;
  margin: 0 0 8px;
  padding: 6px 8px 9px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  font-size: 11px;
  color: var(--muted);
  overflow: hidden;
}
.arriving i {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 3px;
  background: var(--accent);
  transition: width 0.4s;
}
.link small.on-air {
  color: #fff;
  background: #e5484d;
  padding: 1px 6px;
  border-radius: 6px;
  font-weight: 700;
  letter-spacing: 0.5px;
  animation: on-air 1.6s ease-in-out infinite;
}
@keyframes on-air {
  50% {
    opacity: 0.55;
  }
}
.shared {
  margin: 0 0 6px;
  color: var(--muted);
  font-size: 11px;
}
.link small {
  margin-left: auto;
  color: var(--muted);
  font: 11px var(--mono);
}
h4 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 10px 4px;
  font: 600 11px var(--font);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--muted);
}
.new input {
  width: 100%;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid var(--accent);
  border-radius: 8px;
  color: #fff;
  padding: 6px 10px;
  font: 13px var(--font);
  margin-bottom: 4px;
}
.lists {
  flex: 1 0 auto;
  min-height: 40px;
}
.pl span,
.saved span {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.saved .forget {
  margin-left: auto;
  width: 24px;
  height: 24px;
  opacity: 0;
}
.saved:hover .forget {
  opacity: 1;
}
.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex: none;
}
.hint {
  color: var(--muted);
  font-size: 12px;
  padding: 0 10px;
}
.foot {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 6px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}
.folder {
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 6px;
  font: 11px var(--mono);
  color: var(--muted);
  overflow: hidden;
  white-space: nowrap;
}
.folder span {
  overflow: hidden;
  text-overflow: ellipsis;
}
.folder:hover {
  color: #ebe8f5;
}
.small {
  font-size: 12px;
  padding: 6px 10px;
}
.remote-mark {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 11px;
  color: var(--accent);
}
.small-link.comfy small {
  color: var(--muted);
}
.small-link small {
  color: #7fe0a0;
}
.small-link small.bad {
  color: #ff8f8f;
}
.keys {
  margin: 4px 0 0;
  font-size: 11px;
  color: var(--muted);
}
.spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@media (max-height: 760px) {
  .keys,
  .folder {
    display: none;
  }
  .link {
    padding: 6px 10px;
  }
  .brand {
    padding-bottom: 10px;
  }
}
@keyframes logo {
  0%,
  100% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(0.45);
  }
}
.logo i {
  transform-origin: bottom;
}
</style>
