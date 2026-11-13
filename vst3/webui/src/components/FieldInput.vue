<script setup lang="ts">
// One field of a song brief, as its type wants it: a list, a line with suggestions, a text, a slider, a switch.
import { computed, useId } from 'vue'

import { VOCALS_TEXT } from '../form'

const props = defineProps<{
  type: 'text' | 'string' | 'integer' | 'number' | 'boolean' | 'choice' | 'upload'
  label: string
  value: unknown
  hint?: string
  placeholder?: string
  choices?: string[]
  suggestions?: string[]
  minimum?: number
  maximum?: number
  step?: number
  rows?: number
}>()
const emit = defineEmits<{ change: [value: string | number | boolean] }>()

const id = useId()
const text = computed(() => (props.value === undefined || props.value === null ? '' : String(props.value)))
const number = computed(() => (typeof props.value === 'number' ? props.value : Number(props.value) || 0))
const ranged = computed(() => props.minimum !== undefined && props.maximum !== undefined && props.maximum - props.minimum <= 10000)
const shownChoices = computed(() => {
  const list = props.choices ?? []
  return list.includes(text.value) || text.value === '' ? list : [text.value, ...list]
})
const list = computed(() => (props.suggestions ?? []).slice(0, 400))

function choiceLabel(c: string): string {
  return VOCALS_TEXT[c] ?? c
}

function numberChange(e: Event): void {
  const v = Number((e.target as HTMLInputElement).value)
  if (Number.isFinite(v)) emit('change', props.type === 'integer' ? Math.round(v) : v)
}
</script>

<template>
  <label v-if="type === 'boolean'" class="toggle field-toggle" :title="hint">
    <input type="checkbox" :checked="value === true" @change="emit('change', ($event.target as HTMLInputElement).checked)" />
    <span class="track" />{{ label }}
  </label>
  <div v-else class="field">
    <label :for="id" class="field-label" :title="hint">{{ label }}</label>
    <select v-if="type === 'choice'" :id="id" class="select" :value="text" @change="emit('change', ($event.target as HTMLSelectElement).value)">
      <option v-for="c in shownChoices" :key="c" :value="c">{{ choiceLabel(c) }}</option>
    </select>
    <textarea
      v-else-if="type === 'text'"
      :id="id"
      class="textarea"
      :rows="rows ?? 3"
      :value="text"
      :placeholder="placeholder"
      spellcheck="false"
      @change="emit('change', ($event.target as HTMLTextAreaElement).value)"
    />
    <div v-else-if="(type === 'integer' || type === 'number') && ranged" class="range">
      <input type="range" :id="id" :min="minimum" :max="maximum" :step="step ?? 1" :value="number" @input="numberChange" />
      <span class="value">{{ type === 'integer' ? Math.round(number) : number.toFixed(2) }}</span>
    </div>
    <input
      v-else-if="type === 'integer' || type === 'number'"
      :id="id"
      class="input"
      type="number"
      :step="step ?? (type === 'integer' ? 1 : 0.01)"
      :value="number"
      @change="numberChange"
    />
    <template v-else>
      <input
        :id="id"
        class="input"
        type="text"
        :value="text"
        :placeholder="placeholder"
        :list="list.length ? `${id}-list` : undefined"
        spellcheck="false"
        @change="emit('change', ($event.target as HTMLInputElement).value)"
      />
      <datalist v-if="list.length" :id="`${id}-list`">
        <option v-for="s in list" :key="s" :value="s" />
      </datalist>
    </template>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}
.field-label {
  font-size: 12px;
  color: var(--text-dim);
  font-weight: 550;
}
.field-toggle {
  height: 30px;
}
.range {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 32px;
}
.range input {
  flex: 1;
  accent-color: var(--accent);
}
.value {
  width: 38px;
  text-align: right;
  font-family: var(--mono);
  font-size: 12px;
  color: var(--text-dim);
}
</style>
