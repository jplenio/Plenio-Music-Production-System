<script setup lang="ts">
// A song brief: the description, the short fields that apply, the lyrics (an idea, or one's own), and More: the
// rest of the template's fields. It changes the objects it is given and says so.
import { computed, ref } from 'vue'

import { LABELS, LIST_FIELDS, LYRICS_IDEA, OWN_LYRICS, applies, choicesOf, fieldApplies, labelOf, moreGroups, type Kind, type Values } from '../form'
import type { TemplateDetail } from '../types'
import FieldInput from './FieldInput.vue'
import Icon from './Icon.vue'

const props = defineProps<{
  kind: Kind
  template: TemplateDetail | null
  values: Record<string, string[]>
  simple: Values
  more: Values
  compact?: boolean
}>()
const emit = defineEmits<{ changed: [] }>()

const showMore = ref(false)
const groups = computed(() => moreGroups(props.template))
const all = computed(() => ({ ...props.simple, ...props.more }))
// what each way of the lyrics had, so switching back gives it back
const stash: Record<string, string> = {}

function set(name: string, value: string | number | boolean): void {
  // eslint-disable-next-line vue/no-mutating-props -- the brief is the parent's reactive object, changed in place
  props.simple[name] = value
  emit('changed')
}

function setMore(name: string, value: string | number | boolean): void {
  // eslint-disable-next-line vue/no-mutating-props
  props.more[name] = value
  emit('changed')
}

function lyricsFrom(way: string): void {
  const now = String(props.simple.lyrics_from || LYRICS_IDEA)
  if (now === way) return
  stash[now] = String(props.simple.lyrics ?? '')
  // eslint-disable-next-line vue/no-mutating-props
  props.simple.lyrics = stash[way] ?? ''
  set('lyrics_from', way)
}

function choices(name: string): string[] | undefined {
  if (name === 'length') return choicesOf(props.template, 'length', [])
  if (name === 'vocals') return choicesOf(props.template, 'vocals', props.kind === 'cover' ? ['original lyrics', 'new lyrics', 'instrumental'] : ['sung', 'sparse vocals', 'instrumental'])
  return undefined
}

const own = computed(() => props.simple.lyrics_from === OWN_LYRICS)
</script>

<template>
  <div class="brief" :class="{ compact }">
    <FieldInput
      type="text"
      :label="LABELS.description.label"
      :hint="LABELS.description.hint"
      :placeholder="LABELS.description.placeholder"
      :value="simple.description"
      :rows="compact ? 5 : 3"
      @change="set('description', $event)"
    />
    <div class="pairs">
      <template v-for="name in LIST_FIELDS" :key="name">
        <FieldInput
          v-if="applies(name, kind, simple)"
          :type="name === 'length' || name === 'vocals' ? 'choice' : 'string'"
          :label="LABELS[name].label"
          :hint="LABELS[name].hint"
          :placeholder="LABELS[name].placeholder"
          :choices="choices(name)"
          :suggestions="values[name]"
          :value="simple[name]"
          @change="set(name, $event)"
        />
      </template>
    </div>

    <div v-if="applies('lyrics_from', kind, simple)" class="lyrics">
      <div class="head">
        <span class="field-label">Lyrics</span>
        <div class="segmented">
          <button :class="{ on: !own }" @click="lyricsFrom(LYRICS_IDEA)">Plenio writes them</button>
          <button :class="{ on: own }" @click="lyricsFrom(OWN_LYRICS)">My own lyrics</button>
        </div>
      </div>
      <textarea
        v-if="own"
        class="textarea own"
        :rows="compact ? 10 : 8"
        :value="String(simple.lyrics ?? '')"
        placeholder="[verse]&#10;The first line of your song&#10;…&#10;&#10;[chorus]&#10;…"
        spellcheck="false"
        @change="set('lyrics', ($event.target as HTMLTextAreaElement).value)"
      />
      <FieldInput
        v-else
        type="string"
        label="An idea for the words"
        hint="What the writer starts from: a line, a story, a feeling"
        placeholder="e.g. about a conversation that never happened"
        :suggestions="values.lyrics"
        :value="simple.lyrics"
        @change="set('lyrics', $event)"
      />
      <p v-if="own" class="tip muted">Plenio sings them as written. [verse], [chorus] and [bridge] mark the parts.</p>
    </div>

    <button v-if="groups.length" class="more-toggle" @click="showMore = !showMore">
      <Icon :name="showMore ? 'chevron-down' : 'chevron-right'" :size="14" />More settings
      <span class="muted">model, mastering, closeness, creativity …</span>
    </button>
    <template v-if="showMore">
      <section v-for="g in groups" :key="g.title" class="group">
        <div class="label">{{ g.title }}</div>
        <div class="pairs">
          <template v-for="f in g.fields" :key="f.id">
            <FieldInput
              v-if="fieldApplies(f, all, template)"
              :type="f.type"
              :label="labelOf(f)"
              :hint="f.description"
              :value="more[f.id]"
              :choices="f.choices"
              :minimum="f.minimum"
              :maximum="f.maximum"
              :step="f.step"
              @change="setMore(f.id, $event)"
            />
          </template>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.brief {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.pairs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 14px;
}
.compact .pairs {
  grid-template-columns: minmax(0, 1fr);
  gap: 10px;
}
.lyrics {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.lyrics .head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}
.field-label {
  font-size: 12px;
  color: var(--text-dim);
  font-weight: 550;
}
.own {
  font-family: var(--font);
  line-height: 1.55;
}
.tip {
  margin: 0;
  font-size: 11.5px;
}
.more-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: transparent;
  padding: 4px 0;
  cursor: pointer;
  color: var(--text);
  font-weight: 600;
  text-align: left;
}
.more-toggle .muted {
  font-weight: 400;
  font-size: 12px;
  margin-left: 4px;
}
.group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 4px;
}
</style>
