<script setup lang="ts">
// Before the first song: what Plenio is, and the models' licences (as the SoundCraft add-in asks).
import { ref } from 'vue'

import { saveSettings } from '../store'
import Icon from './Icon.vue'

const emit = defineEmits<{ done: [accepted: boolean] }>()
const accepted = ref(false)

async function go(): Promise<void> {
  await saveSettings({ licenceAccepted: true })
  emit('done', true)
}
</script>

<template>
  <div class="overlay" @mousedown.self="emit('done', false)" @keydown.esc="emit('done', false)">
    <div class="dialog licence" role="dialog" aria-modal="true">
      <header>
        <img src="/plenio-icon.png" alt="" class="logo" />
        <h2>Before your first song</h2>
      </header>
      <div class="body">
        <p>
          Plenio makes songs and covers with YuE2 on your graphics card: the lyrics, the notes and every take land on this
          track, play in time with your project and stay yours to change.
        </p>
        <p>
          It uses your ComfyUI with Plenio inside, on this computer or on your studio PC, and its models. Missing models
          are downloaded by Plenio Setup in ComfyUI.
        </p>
        <p class="strong"><Icon name="info" :size="15" />YuE2 and SheetSage2 are licensed CC BY-NC 4.0: what you make with them is for non-commercial use.</p>
        <label class="toggle accept">
          <input v-model="accepted" type="checkbox" />
          <span class="track" />I accept the models' licences
        </label>
      </div>
      <footer>
        <button class="btn" @click="emit('done', false)">Cancel</button>
        <button class="btn primary" :disabled="!accepted" @click="go">Continue</button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.licence {
  width: min(520px, calc(100vw - 32px));
}
.logo {
  width: 30px;
  height: 30px;
  border-radius: 8px;
}
.body p {
  margin: 0 0 12px;
  line-height: 1.55;
  color: var(--text-dim);
}
.strong {
  display: flex;
  gap: 9px;
  align-items: flex-start;
  color: var(--text) !important;
  font-weight: 600;
  padding: 10px 12px;
  border-radius: 9px;
  background: rgba(255, 178, 62, 0.08);
  border: 1px solid rgba(255, 178, 62, 0.25);
}
.strong svg {
  flex: none;
  margin-top: 2px;
  color: var(--amber);
}
.accept {
  margin-top: 4px;
  color: var(--text);
}
</style>
