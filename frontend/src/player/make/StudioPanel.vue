<script setup lang="ts">
/**
 * Every setting of the studio (owner's request 2026-10-26) - for the admin and whoever comes through *In your
 * network*: the template's fields beyond the simple form (the writer model, HQ mastering, Cover Art, the rest of the
 * Song Brief, a cover's excerpt) and the Export Release's (the folder, the formats, the tags). Read from the Song
 * API's description of the template, so a field a later version adds shows here by itself.
 */
import { computed, ref } from 'vue'

import Icon from '../components/Icon.vue'
import { studioApplies, studioGroups, studioSummary, studioValue } from './form'
import type { ApiField, Draft, StudioGroup, StudioSpec, StudioValues } from './form'

const props = defineProps<{ spec: StudioSpec; values: StudioValues; draft: Draft; warnings?: string[] }>()
const open = ref(false)
const groups = computed(() => studioGroups(props.spec))
const summary = computed(() => studioSummary(props.values))

function set(group: StudioGroup, field: ApiField, value: unknown): void {
  props.values[group.part][field.id] = value
}
function siblings(group: StudioGroup): ApiField[] {
  return group.part === 'release' ? props.spec.release : props.spec.fields
}
function shown(group: StudioGroup, field: ApiField): boolean {
  return studioApplies(field, props.values[group.part], props.draft, siblings(group))
}
/** The studio's own fields said plainly (the others say what the template's tooltips say). */
const PLAIN: Record<string, { label: string; hint: string }> = {
  'writer.model': { label: 'Writer model', hint: 'The language model that writes the title, the style and the lyrics.' },
}
const label = (field: ApiField): string => {
  const text = (PLAIN[field.id]?.label ?? field.label.replace(/_/g, ' ')).replace(/\b(flac|mp3|wav|srt)\b/gi, (name) => name.toUpperCase())
  return text.charAt(0).toUpperCase() + text.slice(1)
}
/** A number with a range a slider covers (creativity 0-200), or a free one. */
const ranged = (field: ApiField): boolean => field.minimum !== undefined && field.maximum !== undefined && field.maximum - field.minimum <= 1000
const step = (field: ApiField): number => field.step ?? (field.type === 'integer' ? 1 : 0.1)
function number(group: StudioGroup, field: ApiField, text: string): void {
  const value = Number(text)
  if (text.trim() === '' || Number.isNaN(value)) return
  set(group, field, field.type === 'integer' ? Math.round(value) : value)
}
/** A model file the field is set to that ComfyUI does not list - mostly a ComfyUI started without its models folder. */
function missingFile(field: ApiField, value: unknown): boolean {
  const text = String(value ?? '')
  return field.type === 'choice' && /\.(safetensors|gguf|ckpt|pt|pth|bin|onnx)$/i.test(text) && !(field.choices ?? []).includes(text)
}
/** The start of the field's tooltip: whole sentences (an ellipsis or "e.g." ends none), some fifty characters. */
function hint(field: ApiField): string {
  if (PLAIN[field.id]) return PLAIN[field.id].hint
  let out = ''
  for (const sentence of field.description.split(/(?<=[^.][.!?])\s/)) {
    out = out ? `${out} ${sentence}` : sentence
    if (out.length >= 50 && !/\be\.g\.$/.test(out)) break
  }
  return out
}
</script>

<template>
  <section class="studio" :class="{ open }">
    <button type="button" class="head" :aria-expanded="open" @click="open = !open">
      <span class="badge"><Icon name="gear" :size="20" /></span>
      <span class="what"><b>Every setting of the studio</b><small>{{ summary || 'the writer model, HQ mastering, cover art, the folder and the formats' }}</small></span>
      <Icon :name="open ? 'up' : 'down'" :size="18" />
    </button>
    <div v-if="open" class="body">
      <p class="lead">You have the whole studio here - from the player in your network or as the admin: every field of the template and of Export Release. What is not changed stays as the template has it.</p>
      <p v-for="w in warnings ?? []" :key="w" class="warn"><Icon name="info" :size="13" /> {{ w }}</p>
      <div v-for="group in groups" :key="group.title" class="group">
        <h4>{{ group.title }}</h4>
        <div class="grid">
          <template v-for="field in group.fields" :key="field.id">
            <label v-if="shown(group, field)" class="field" :class="[field.type, { wide: field.type === 'text' || (field.type === 'string' && field.id.includes('comment')) }]" :title="field.description">
              <span class="name">{{ label(field) }}</span>
              <span v-if="field.type === 'boolean'" class="toggle">
                <input type="checkbox" :checked="studioValue(field, values[group.part]) === true" @change="set(group, field, ($event.target as HTMLInputElement).checked)" />
                <i />
                <em>{{ studioValue(field, values[group.part]) === true ? 'on' : 'off' }}</em>
              </span>
              <select v-else-if="field.type === 'choice'" :value="String(studioValue(field, values[group.part]) ?? '')" @change="set(group, field, ($event.target as HTMLSelectElement).value)">
                <option v-if="!(field.choices ?? []).includes(String(studioValue(field, values[group.part]) ?? ''))" :value="String(studioValue(field, values[group.part]) ?? '')">{{ studioValue(field, values[group.part]) || '-' }}</option>
                <option v-for="c in field.choices ?? []" :key="c" :value="c">{{ c }}</option>
              </select>
              <span v-else-if="(field.type === 'integer' || field.type === 'number') && ranged(field)" class="range">
                <input type="range" :min="field.minimum" :max="field.maximum" :step="step(field)" :value="Number(studioValue(field, values[group.part]) ?? 0)" @input="number(group, field, ($event.target as HTMLInputElement).value)" />
                <input type="number" :min="field.minimum" :max="field.maximum" :step="step(field)" :value="Number(studioValue(field, values[group.part]) ?? 0)" @change="number(group, field, ($event.target as HTMLInputElement).value)" />
              </span>
              <input v-else-if="field.type === 'integer' || field.type === 'number'" type="number" :step="step(field)" :value="Number(studioValue(field, values[group.part]) ?? 0)" @change="number(group, field, ($event.target as HTMLInputElement).value)" />
              <textarea v-else-if="field.type === 'text'" rows="3" :value="String(studioValue(field, values[group.part]) ?? '')" @input="set(group, field, ($event.target as HTMLTextAreaElement).value)" />
              <input v-else type="text" :value="String(studioValue(field, values[group.part]) ?? '')" :placeholder="field.id === 'folder' ? 'plenio/My-Songs' : ''" @input="set(group, field, ($event.target as HTMLInputElement).value)" />
              <small v-if="missingFile(field, studioValue(field, values[group.part]))" class="missing">
                <Icon name="info" :size="12" /> ComfyUI does not find this model file. Was it started without your models folder? Settings › The studio shows how it starts.
              </small>
              <small v-else-if="field.id === 'folder'">A folder in ComfyUI’s output folder - it is made when it is not there.</small>
              <small v-else-if="hint(field)">{{ hint(field) }}</small>
            </label>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.studio {
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
  overflow: hidden;
}
.studio.open {
  border-color: color-mix(in srgb, var(--accent) 45%, transparent);
}
.head {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 0;
  background: none;
  color: #fff;
  text-align: left;
  cursor: pointer;
}
.badge {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 50%, #1a1528), color-mix(in srgb, var(--accent2) 40%, #1a1528));
  flex: none;
}
.what {
  flex: 1;
  min-width: 0;
}
.what b {
  display: block;
  font-size: 14px;
}
.what small {
  display: block;
  color: var(--muted);
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.body {
  padding: 0 14px 14px;
  display: grid;
  gap: 14px;
}
.lead,
.warn {
  margin: 0;
  color: var(--muted);
  font-size: 12.5px;
}
.warn {
  color: #ffcf8a;
}
h4 {
  margin: 0 0 8px;
  font: 700 12px var(--font);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.7);
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 10px;
}
.field {
  display: grid;
  gap: 5px;
  align-content: start;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(10, 8, 18, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.07);
}
.field.wide {
  grid-column: 1 / -1;
}
.name {
  font: 600 12.5px var(--font);
  color: rgba(255, 255, 255, 0.88);
}
.field small.missing {
  color: #ffcf8a;
}
.field small {
  color: var(--muted);
  font-size: 11.5px;
  line-height: 1.35;
}
select,
input[type='text'],
input[type='number'],
textarea {
  width: 100%;
  min-width: 0;
  padding: 7px 9px;
  border-radius: 9px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(10, 8, 18, 0.6);
  color: #fff;
  font: 13px var(--font);
}
textarea {
  resize: vertical;
}
select:focus,
input:focus,
textarea:focus {
  outline: none;
  border-color: var(--accent);
}
.range {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 70px;
  gap: 8px;
  align-items: center;
}
.range input[type='range'] {
  accent-color: var(--accent);
}
.toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.toggle input {
  position: absolute;
  opacity: 0;
  width: 40px;
  height: 22px;
  margin: 0;
  cursor: pointer;
}
.toggle i {
  width: 40px;
  height: 22px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.16);
  position: relative;
  transition: background 0.2s;
}
.toggle i::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.2s;
}
.toggle input:checked + i {
  background: linear-gradient(90deg, var(--accent), var(--accent2));
}
.toggle input:checked + i::after {
  transform: translateX(18px);
}
.toggle input:focus-visible + i {
  box-shadow: 0 0 0 2px var(--accent);
}
.toggle em {
  font-style: normal;
  font-size: 12.5px;
  color: var(--muted);
}
@media (max-width: 640px) {
  .grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
