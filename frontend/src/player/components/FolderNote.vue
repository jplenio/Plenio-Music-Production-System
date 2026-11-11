<script setup lang="ts">
/**
 * The path of a folder the player did not open in the file manager (`folderNote.ts`): the path in a field, a button
 * that copies it, and the server's sentence on why it is shown this way.
 */
import { nextTick, onMounted, ref } from 'vue'

import { copyText, folderNote } from '../folderNote'
import Icon from './Icon.vue'

const field = ref<HTMLInputElement | null>(null)
const copied = ref<boolean | null>(null)

function select(): void {
  field.value?.focus()
  field.value?.select()
}
async function copy(): Promise<void> {
  copied.value = await copyText(folderNote.value?.folder ?? '')
  if (!copied.value) select() // the browser refused: the path is selected, Ctrl+C copies it
}
function close(): void {
  folderNote.value = null
}
onMounted(() => void nextTick(select))
</script>

<template>
  <div v-if="folderNote" class="veil" @click="close" @keydown.esc="close">
    <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="folder-note-title" @click.stop>
      <h3 id="folder-note-title"><Icon name="folder" /> The folder</h3>
      <input ref="field" class="path" readonly :value="folderNote.folder" aria-label="The folder's path" @focus="select" />
      <p v-if="folderNote.hint" class="hint">{{ folderNote.hint }}</p>
      <p v-if="copied === false" class="hint warn">The browser did not let the page copy - the path is selected: press Ctrl+C (⌘C).</p>
      <div class="foot">
        <button class="primary" @click="copy"><Icon :name="copied ? 'check' : 'copy'" :size="16" /> {{ copied ? 'Copied' : 'Copy the path' }}</button>
        <button class="ghost" @click="close">Close</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.veil {
  position: fixed;
  inset: 0;
  z-index: 94;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
}
.dialog {
  width: min(560px, 92vw);
  background: rgba(18, 16, 28, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  padding: 20px 22px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
}
h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 12px;
  font: 700 18px var(--font);
}
.path {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font: 13px ui-monospace, SFMono-Regular, Consolas, monospace;
}
.hint {
  margin: 10px 0 0;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.45;
}
.hint.warn {
  color: #f0c36a;
}
.foot {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}
</style>
