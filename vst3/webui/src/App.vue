<script setup lang="ts">
import { onMounted, ref } from 'vue'

import AraView from './components/AraView.vue'
import LibraryDialog from './components/LibraryDialog.vue'
import LicenceDialog from './components/LicenceDialog.vue'
import NewSongDialog from './components/NewSongDialog.vue'
import OfflineBanner from './components/OfflineBanner.vue'
import SettingsDialog from './components/SettingsDialog.vue'
import SongView from './components/SongView.vue'
import Toasts from './components/Toasts.vue'
import TopBar from './components/TopBar.vue'
import Welcome from './components/Welcome.vue'
import { start, store } from './store'

const dialog = ref<'' | 'new' | 'cover' | 'library' | 'settings' | 'licence'>('')
let afterLicence: '' | 'new' | 'cover' = ''
const problem = ref('')

function open(which: 'new' | 'cover' | 'library' | 'settings'): void {
  if ((which === 'new' || which === 'cover') && store.settings && !store.settings.licenceAccepted) {
    afterLicence = which
    dialog.value = 'licence'
    return
  }
  dialog.value = which
}

function licenceDone(accepted: boolean): void {
  dialog.value = accepted ? afterLicence : ''
  afterLicence = ''
}

onMounted(async () => {
  try {
    await start()
    const preset = new URLSearchParams(location.search).get('state')
    if (preset === 'new') dialog.value = 'new'
  } catch (error) {
    problem.value = error instanceof Error ? error.message : String(error)
  }
})
</script>

<template>
  <div class="app">
    <AraView v-if="store.ready && store.kind === 'ara'" />
    <template v-else-if="store.ready">
      <TopBar @library="open('library')" @settings="open('settings')" @new="open('new')" />
      <OfflineBanner @settings="open('settings')" />
      <SongView v-if="store.song" @new="open('new')" />
      <Welcome v-else @new="open('new')" @cover="open('cover')" @library="open('library')" />
    </template>
    <div v-else-if="problem" class="problem">{{ problem }}</div>
    <div v-else class="loading"><span class="dot" /></div>

    <NewSongDialog v-if="dialog === 'new' || dialog === 'cover'" :cover="dialog === 'cover'" @close="dialog = ''" />
    <LibraryDialog v-if="dialog === 'library'" @close="dialog = ''" />
    <SettingsDialog v-if="dialog === 'settings'" @close="dialog = ''" />
    <LicenceDialog v-if="dialog === 'licence'" @done="licenceDone" />
    <Toasts />
  </div>
</template>

<style scoped>
.app {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: radial-gradient(1200px 600px at 85% -10%, rgba(138, 77, 255, 0.1), transparent 60%),
    radial-gradient(900px 500px at -10% 110%, rgba(255, 61, 139, 0.06), transparent 60%), var(--bg);
}
.loading {
  flex: 1;
  display: grid;
  place-items: center;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent);
  animation: pulse 1s infinite;
}
.problem {
  margin: auto;
  color: var(--danger);
}
</style>
