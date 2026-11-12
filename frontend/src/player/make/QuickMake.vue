<script setup lang="ts">
/**
 * *Make a song*, short first (phase 6.5): what should the song be about, a style chip, *Generate* (quick.ts). The
 * song has the chosen style's values; *More options* below opens the full form.
 */
import { computed, ref } from 'vue'

import Icon from '../components/Icon.vue'
import type { MakeClient } from './client'
import type { FormData, MakeJob, StyleTemplate } from './form'
import { quickMissing, quickRequest, styleGroups, templateOf } from './quick'

const props = defineProps<{ client: MakeClient; form: FormData; may: boolean; why?: string }>()
const emit = defineEmits<{ made: [job: MakeJob] }>()

const about = ref('')
const group = ref('')
const template = ref<StyleTemplate | null>(null)
const sending = ref(false)
const error = ref('')
const groups = computed(() => styleGroups(props.form.templates))
const lacking = computed(() => quickMissing(about.value, template.value))
const limit = computed(() => props.form.limits.description || 1000)

function choose(name: string): void {
  if (group.value === name) {
    group.value = ''
    template.value = null
    return
  }
  group.value = name
  template.value = templateOf(name, props.form.templates, template.value?.id ?? '')
}

function another(): void {
  template.value = templateOf(group.value, props.form.templates, template.value?.id ?? '')
}

async function generate(): Promise<void> {
  if (lacking.value || sending.value || !props.may) return
  sending.value = true
  error.value = ''
  try {
    const job = await props.client.create(quickRequest(about.value, template.value, props.form))
    about.value = ''
    emit('made', job)
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <form class="quick" @submit.prevent="generate">
    <label class="about">
      <span>What should the song be about?</span>
      <textarea v-model="about" rows="3" :maxlength="limit" placeholder="a night drive through a rainy city, missing someone" @keydown.ctrl.enter="generate" />
    </label>
    <div class="chips" role="radiogroup" aria-label="Style">
      <button v-for="name in groups" :key="name" type="button" role="radio" class="chip" :class="{ on: group === name }" :aria-checked="group === name" @click="choose(name)">{{ name }}</button>
    </div>
    <p v-if="template" class="style"><Icon name="music" :size="14" /> {{ template.name }}<template v-if="template.fields.genre"> · {{ template.fields.genre }}</template> - <a @click="another">another one</a></p>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="!may && why" class="hint">{{ why }}</p>
    <button class="primary" type="submit" :disabled="!!lacking || sending || !may" :title="lacking ? `First ${lacking}` : ''">
      <Icon name="wand" :size="16" /> {{ sending ? 'Ordering …' : 'Generate' }}
    </button>
  </form>
</template>

<style scoped>
.quick {
  display: grid;
  gap: 12px;
}
.about {
  display: grid;
  gap: 6px;
  font-weight: 600;
}
.about textarea {
  width: 100%;
  resize: vertical;
  font: inherit;
  font-weight: 400;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.chip.on {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 18%, transparent);
}
.style,
.hint {
  margin: 0;
  color: var(--muted);
  font-size: 0.9rem;
}
.error {
  margin: 0;
  color: #ff8a7a;
}
.primary {
  justify-self: start;
}
</style>
