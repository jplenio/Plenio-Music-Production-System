<script setup lang="ts">
// The steps for the DAW Plenio runs in (known by the host's name), and for any other DAW to pick.
import { computed, ref } from 'vue'

import { DAWS, dawFor, stepsOf } from '../daws'
import { store } from '../store'
import Icon from './Icon.vue'

const detected = computed(() => dawFor(store.host))
const picked = ref('')
const daw = computed(() => (picked.value === 'other' ? undefined : (DAWS.find((d) => d.id === picked.value) ?? detected.value)))
const steps = computed(() => stepsOf(daw.value))
const choice = computed({
  get: () => picked.value || detected.value?.id || 'other',
  set: (id: string) => (picked.value = id)
})
</script>

<template>
  <div class="card guide">
    <div class="card-head">
      <Icon name="library" :size="15" />
      <span class="lead">Steps for</span>
      <select v-model="choice" class="pick" title="The steps for another DAW">
        <option v-for="d in DAWS" :key="d.id" :value="d.id">{{ d.name }}</option>
        <option value="other">another VST3 DAW</option>
      </select>
      <span v-if="daw && daw === detected" class="here">you are here</span>
    </div>
    <p v-if="daw?.unsupported" class="unsupported"><Icon name="warning" :size="13" />{{ daw.unsupported }}</p>
    <dl v-else class="steps">
      <dt>Add Plenio</dt>
      <dd>{{ steps.add }}</dd>
      <dt>Tempo map</dt>
      <dd>{{ steps.tempo }}</dd>
      <dt>Stems</dt>
      <dd>{{ steps.stems }}</dd>
      <dt>MIDI</dt>
      <dd>{{ steps.midi }}</dd>
      <template v-if="steps.ara">
        <dt>Plenio ARA</dt>
        <dd>{{ steps.ara }}</dd>
      </template>
      <dt>Good to know</dt>
      <dd>{{ steps.audio }}</dd>
    </dl>
  </div>
</template>

<style scoped>
.guide .card-head {
  flex-wrap: wrap;
  gap: 6px;
}
.lead {
  color: var(--text-dim);
  font-weight: 600;
}
.pick {
  font: inherit;
  font-weight: 650;
  color: var(--text);
  background: var(--bg-sunken);
  border: 1px solid var(--line-strong);
  border-radius: 8px;
  height: 28px;
  padding: 0 6px;
  max-width: 100%;
  cursor: pointer;
}
.here {
  font-size: 11px;
  padding: 1px 8px;
  border-radius: 10px;
  background: rgba(47, 195, 168, 0.16);
  color: #6fe0c8;
}
.steps {
  margin: 2px 0 0;
  font-size: 12.5px;
  line-height: 1.5;
}
.steps dt {
  margin-top: 10px;
  font-size: 10.5px;
  font-weight: 650;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-faint);
}
.steps dd {
  margin: 2px 0 0;
  color: var(--text-dim);
}
.unsupported {
  display: flex;
  gap: 7px;
  margin: 4px 0 0;
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--amber);
}
.unsupported :deep(svg) {
  flex: none;
  margin-top: 3px;
}
</style>
