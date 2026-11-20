<script setup lang="ts">
/**
 * *Save the files* of a shared player: the songs' sound, covers and sheet music inside the HTML file, saved out of
 * it - all of them as one ZIP, or those of a playlist or the favourites; one song's files one by one on its page.
 */
import { computed, ref } from 'vue'

import { portable } from '../portable'
import { carries, FILE_KINDS, fileNames, soundEnding, zipOf, type FileKind } from '../portableExport'
import { byId, library, state } from '../store'
import { countOf } from '../timing'
import { saveBlob } from '../zip'
import Icon from './Icon.vue'

const which = ref('all')
const kinds = ref<FileKind[]>(['audio', 'cover', 'pdf'])
const numbered = ref(!!portable?.ordered)
const working = ref(false)
const done = ref(0)
const total = ref(0)
const error = ref('')
const saved = ref('')

/** The songs to save, in the order they were shared in (an album's running order). */
const songs = computed(() => {
  const shared = portable?.songs.map((s) => s.id) ?? []
  const ids = which.value === 'favorites' ? state.favorites : which.value.startsWith('playlist:') ? (state.playlists.find((p) => `playlist:${p.id}` === which.value)?.songs ?? []) : shared
  return ids.map((id) => byId.value.get(id)).filter((s): s is NonNullable<typeof s> => !!s)
})
const files = computed(() => fileNames(songs.value, kinds.value, numbered.value).length)
const counts = computed(() => Object.fromEntries(FILE_KINDS.map(({ kind }) => [kind, library.value.filter((s) => carries(s, kind)).length])))

async function save(): Promise<void> {
  error.value = ''
  saved.value = ''
  working.value = true
  done.value = 0
  try {
    const zip = await zipOf(songs.value, kinds.value, numbered.value, (d, t) => {
      done.value = d
      total.value = t
    })
    saveBlob(zip.blob, zip.name)
    saved.value = `${zip.name} - ${countOf(zip.files, 'file')}, ${(zip.blob.size / 2 ** 20).toFixed(1)} MB`
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    working.value = false
  }
}
</script>

<template>
  <section class="block save-files">
    <h3><Icon name="download" /> Save the files</h3>
    <p class="lead">The files inside this shared player, saved as they are: the sound ({{ soundEnding().toUpperCase() }}{{ portable?.bitrate ? `, ${portable.bitrate} kbit/s` : '' }}), the covers and the sheet music - all at once as a ZIP here, or one song's from its menu (⋯, <i>Save its sound</i>) or its page (<i>Details</i>, <i>Files</i>).</p>
    <div class="row">
      <label>Songs
        <select v-model="which" :disabled="working">
          <option value="all">all {{ library.length }}</option>
          <option v-if="state.favorites.length" value="favorites">the favourites ({{ state.favorites.length }})</option>
          <option v-for="p in state.playlists.filter((p) => p.songs.length)" :key="p.id" :value="`playlist:${p.id}`">{{ p.name }} ({{ p.songs.length }})</option>
        </select>
      </label>
    </div>
    <div class="row">
      <label v-for="k in FILE_KINDS" :key="k.kind" class="check">
        <input v-model="kinds" type="checkbox" :value="k.kind" :disabled="working || !counts[k.kind]" /> {{ k.label }} <small>({{ counts[k.kind] }})</small>
      </label>
    </div>
    <label class="check"><input v-model="numbered" type="checkbox" :disabled="working" /> number the files in the order shared (01, 02 …)</label>
    <div class="row">
      <button class="primary" :disabled="working || !files" @click="save">
        <Icon name="download" :size="15" /> {{ working ? `Packing ${Math.min(done, total)} of ${total} …` : `Save ${countOf(files, 'file')} as a ZIP` }}
      </button>
    </div>
    <p v-if="saved" class="hint">Saved: <b>{{ saved }}</b> - in your browser's downloads.</p>
    <p v-if="error" class="hint error">{{ error }}</p>
  </section>
</template>

<style scoped>
.save-files .row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 18px;
  align-items: center;
  margin: 8px 0;
}
.save-files select {
  margin-left: 6px;
  max-width: 100%;
}
.save-files .error {
  color: var(--bad, #f66);
}
</style>
