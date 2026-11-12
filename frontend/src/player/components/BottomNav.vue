<script setup lang="ts">
/**
 * The tab bar of a phone (owner's request 2026-10-26: on a phone first): the songs, the playlists, Live Play, making a
 * song and *More* - the menu with everything else (favourites, settings, help …). The page that shows is lit; Live
 * Play glows while it is on, Make a song counts one's songs in the making.
 */
import { computed } from 'vue'

import { makeShown, makingNow } from '../make/state'
import { isPortable } from '../portable'
import { placeOf } from '../nav'
import { go, route, settings } from '../store'
import Icon from './Icon.vue'

const emit = defineEmits<{ more: [] }>()

const TABS = computed(() =>
  [
    { path: '/', label: 'Songs', icon: 'music', match: (r: string) => placeOf(r) === 'songs' },
    { path: '/playlists', label: 'Playlists', icon: 'playlist', match: (r: string) => placeOf(r) === 'playlists' },
    { path: '/live', label: 'Live', icon: 'live', match: (r: string) => placeOf(r) === 'live' },
    makeShown.value && !isPortable
      ? { path: '/make', label: 'Make', icon: 'wand', match: (r: string) => r.startsWith('/make') }
      : { path: '/help', label: 'Help', icon: 'help', match: (r: string) => r.startsWith('/help') },
  ] as { path: string; label: string; icon: string; match: (r: string) => boolean }[]
)
</script>

<template>
  <nav class="tabs" aria-label="Sections">
    <button v-for="tab in TABS" :key="tab.path" :class="{ on: tab.match(route) }" :aria-current="tab.match(route) ? 'page' : undefined" @click="go(tab.path)">
      <span class="ic">
        <Icon :name="tab.icon" :size="22" />
        <i v-if="tab.path === '/live' && settings.live.on" class="dot live" />
        <i v-else-if="tab.path === '/make' && makingNow" class="count">{{ makingNow }}</i>
      </span>
      <span class="label">{{ tab.label }}</span>
    </button>
    <button @click="emit('more')">
      <span class="ic"><Icon name="list" :size="22" /></span>
      <span class="label">More</span>
    </button>
  </nav>
</template>

<style scoped>
.tabs {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  padding: 4px 6px calc(4px + env(safe-area-inset-bottom, 0px));
  background: rgba(10, 9, 16, 0.94);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}
button {
  display: grid;
  justify-items: center;
  gap: 2px;
  padding: 6px 0 4px;
  border: 0;
  background: none;
  color: rgba(255, 255, 255, 0.55);
  font: 600 10.5px var(--font);
  letter-spacing: 0.2px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: color 0.2s;
}
.ic {
  position: relative;
  display: grid;
  place-items: center;
  width: 56px;
  height: 30px;
  border-radius: 99px;
  transition: background 0.25s, transform 0.2s;
}
button.on {
  color: #fff;
}
button.on .ic {
  background: color-mix(in srgb, var(--accent) 30%, transparent);
  box-shadow: 0 0 18px color-mix(in srgb, var(--accent) 35%, transparent);
}
button:active .ic {
  transform: scale(0.9);
}
.dot.live {
  position: absolute;
  top: 3px;
  right: 14px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e5484d;
  box-shadow: 0 0 8px #e5484d;
  animation: pulse 1.6s ease-in-out infinite;
}
.count {
  position: absolute;
  top: -2px;
  right: 8px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 99px;
  background: var(--accent);
  color: #0b0a12;
  font: 700 10px/16px var(--font);
  font-style: normal;
}
@keyframes pulse {
  50% {
    opacity: 0.45;
  }
}
</style>
