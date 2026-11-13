<script setup lang="ts">
import { computed, ref } from 'vue'

import { call } from '../bridge'
import { store, toast } from '../store'
import Icon from './Icon.vue'

defineEmits<{ settings: [] }>()
const starting = ref(false)
// another computer's ComfyUI, or one that asks for a token: its own sentence says what to do, and the way is the settings
const elsewhere = computed(() => !!store.connection?.remote || !!store.connection?.problem)
const show = computed(() => store.connection && store.connection.state !== 'connected')

async function startComfy(): Promise<void> {
  starting.value = true
  try {
    const r = await call<{ started: boolean; message: string }>('studio.start')
    if (!r.started) toast(r.message, true)
  } catch (error) {
    toast(error instanceof Error ? error.message : String(error), true)
  } finally {
    starting.value = false
  }
}
</script>

<template>
  <div v-if="show" class="banner" :class="store.connection?.state">
    <Icon :name="store.connection?.state === 'offline' ? 'power' : 'refresh'" :size="15" />
    <span v-if="store.connection?.state === 'offline' && elsewhere">
      <b>{{ store.connection?.problem === 'token' ? 'Token needed.' : 'Studio offline.' }}</b> {{ store.connection?.message }}
    </span>
    <span v-else-if="store.connection?.state === 'offline'">
      <b>Studio offline.</b> Playing and editing work as always; to make new takes, start ComfyUI with Plenio.
    </span>
    <span v-else>{{ store.connection?.message }}</span>
    <div class="spacer" />
    <button v-if="store.connection?.state === 'offline' && elsewhere" class="btn small" @click="$emit('settings')">
      <Icon name="gear" :size="13" />Settings
    </button>
    <button v-else-if="store.connection?.state === 'offline'" class="btn small" :disabled="starting" @click="startComfy">
      <Icon name="power" :size="13" />Start ComfyUI
    </button>
    <button class="btn small ghost" @click="call('studio.refresh')"><Icon name="refresh" :size="13" />Look again</button>
  </div>
</template>

<style scoped>
.banner {
  flex: none;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 14px;
  background: rgba(255, 178, 62, 0.08);
  border-bottom: 1px solid rgba(255, 178, 62, 0.2);
  color: #f3d7a6;
  font-size: 12.5px;
}
.banner.starting,
.banner.searching {
  background: rgba(138, 77, 255, 0.08);
  border-color: rgba(138, 77, 255, 0.25);
  color: #d8c8ff;
}
.spacer {
  flex: 1;
}
</style>
