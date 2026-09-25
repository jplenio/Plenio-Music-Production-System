<script setup lang="ts">
/** Sections and bars of the score: navigation, and the section edits of the backend. */
import { computed, ref } from 'vue'

import type { ScoreOperation } from '../../api/client'
import { type ScoreView, clock, sectionOfBar } from '../../shared/scoreView'

const props = defineProps<{
  view: ScoreView | null
  bar: number | null
  errorBars: number[]
  /** Source-recording start of each bar (transcription timeline), when there is one. */
  sourceStarts: number[] | null
  readonly: boolean
}>()
const emit = defineEmits<{ goto: [bar: number]; operate: [operation: ScoreOperation] }>()

const renaming = ref<number | null>(null)
const renameText = ref('')
const newLabel = ref('bridge')

const sections = computed(() => props.view?.sections ?? [])
const bars = computed(() => props.view?.bars ?? [])
const currentSection = computed(() => (props.view && props.bar ? sectionOfBar(props.view, props.bar) : -1))
const errorSet = computed(() => new Set(props.errorBars))

function startRename(index: number, label: string): void {
  renaming.value = index
  renameText.value = label
}

function commitRename(index: number): void {
  const label = renameText.value.trim()
  renaming.value = null
  if (label && label !== sections.value[index]?.label) {
    emit('operate', { op: 'rename_section', section: index + 1, label })
  }
}

function move(index: number, delta: number): void {
  const section = sections.value[index]
  if (section) emit('operate', { op: 'move_section_boundary', section: index + 1, start_bar: section.start_bar + delta })
}

function sourceTime(bar: number): string | null {
  const second = props.sourceStarts?.[bar - 1]
  return typeof second === 'number' ? clock(second) : null
}
</script>

<template>
  <nav class="navigator" aria-label="Sections and bars">
    <ol class="sections">
      <li v-for="(section, index) in sections" :key="index" :class="{ current: index === currentSection }">
        <div class="section-head">
          <button class="link" :title="`Go to bar ${section.start_bar}`" @click="emit('goto', section.start_bar)">
            <strong v-if="renaming !== index">{{ section.label }}</strong>
          </button>
          <input
            v-if="renaming === index"
            v-model="renameText"
            class="rename"
            aria-label="Section name"
            @keydown.enter.prevent="commitRename(index)"
            @keydown.esc.stop.prevent="renaming = null"
            @blur="commitRename(index)"
          />
          <span class="facts">
            bars {{ section.start_bar }}-{{ section.start_bar + section.bars - 1 }} · {{ clock(section.start_s) }}
            <template v-if="sourceTime(section.start_bar)"> · source {{ sourceTime(section.start_bar) }}</template>
          </span>
        </div>
        <div v-if="!readonly" class="section-tools">
          <button title="Rename this section" @click="startRename(index, section.label)">Rename</button>
          <template v-if="index > 0">
            <button title="Start this section one bar earlier" aria-label="Start one bar earlier" @click="move(index, -1)">◀ bar</button>
            <button title="Start this section one bar later" aria-label="Start one bar later" @click="move(index, 1)">bar ▶</button>
            <button title="Join this section to the one before" @click="emit('operate', { op: 'merge_section', section: index + 1 })">
              Join ↑
            </button>
          </template>
        </div>
      </li>
    </ol>
    <div v-if="!readonly && bar" class="split">
      <label>
        New section at bar {{ bar }}:
        <input v-model="newLabel" aria-label="Name of the new section" />
      </label>
      <button
        :disabled="bar <= 1 || !newLabel.trim()"
        title="Start a new section at the selected bar"
        @click="emit('operate', { op: 'split_section', bar, label: newLabel })"
      >
        Split
      </button>
    </div>
    <div class="bar-strip" role="list" aria-label="Bars">
      <button
        v-for="item in bars"
        :key="item.index"
        role="listitem"
        class="bar"
        :class="{
          selected: item.index === bar,
          error: errorSet.has(item.index),
          alt: view ? sectionOfBar(view, item.index) % 2 === 1 : false
        }"
        :title="`Bar ${item.index} · ${clock(item.start_s)} · ${item.chords.join(' ') || 'no chord'}`"
        @click="emit('goto', item.index)"
      >
        {{ item.index }}
      </button>
    </div>
  </nav>
</template>
