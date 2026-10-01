<script setup lang="ts">
/**
 * Sections and bars of the score: navigation, the section edits of the backend, and arranging
 * whole sections (docs/design/score-arrange-design.md §1; Cubase: arranger track) - select one or
 * more (Ctrl+click, Shift+click), duplicate, copy, delete, move them up or down or drag them to a new
 * place (with Alt held: a copy).
 */
import { computed, ref, watch } from 'vue'

import type { ScoreOperation } from '../../api/client'
import { type ScoreView, clock, sectionOfBar } from '../../shared/scoreView'
import { type Arrangement, deleteSections, dropSections, duplicateSections, moveSections, selectSection } from './arrange'
import { clipOfSections, clipboard } from './clipboard'

const props = defineProps<{
  view: ScoreView | null
  bar: number | null
  errorBars: number[]
  /** Source-recording start of each bar (transcription timeline), when there is one. */
  sourceStarts: (number | null)[] | null
  readonly: boolean
}>()
const emit = defineEmits<{ goto: [bar: number]; operate: [operation: ScoreOperation]; notice: [text: string] }>()

const renaming = ref<number | null>(null)
const renameText = ref('')
const newLabel = ref('bridge')
const selected = ref<number[]>([])
const anchor = ref<number | null>(null)
/** The selection the next view gets (positions after an arrangement). */
let pending: number[] | null = null
const dragging = ref(false)
const dropAt = ref<number | null>(null)

const sections = computed(() => props.view?.sections ?? [])
const bars = computed(() => props.view?.bars ?? [])
const currentSection = computed(() => (props.view && props.bar ? sectionOfBar(props.view, props.bar) : -1))
const errorSet = computed(() => new Set(props.errorBars))
const canArrange = computed(() => !props.readonly && !!props.view?.model && sections.value.length > 0)

watch(sections, (list) => {
  selected.value = (pending ?? selected.value).filter((i) => i < list.length)
  pending = null
})

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

function pick(index: number, event: MouseEvent): void {
  const toggle = event.ctrlKey || event.metaKey
  selected.value = selectSection(selected.value, index, { toggle, range: event.shiftKey }, anchor.value)
  if (!event.shiftKey) anchor.value = index
  const section = sections.value[index]
  if (section && !toggle && !event.shiftKey) emit('goto', section.start_bar)
}

function apply(arrangement: Arrangement | null): void {
  if (!arrangement || !canArrange.value) return
  pending = arrangement.selection
  emit('operate', { op: 'arrange_sections', order: arrangement.order })
}

const duplicate = () => apply(duplicateSections(sections.value.length, selected.value))
const remove = () => apply(deleteSections(sections.value.length, selected.value))
const shift = (delta: -1 | 1) => apply(moveSections(sections.value.length, selected.value, delta))

function copy(): void {
  const model = props.view?.model
  if (!model || !selected.value.length) return
  const clip = clipOfSections(model, selected.value)
  if (!clip) return
  clipboard.value = clip
  emit('notice', `copied ${clip.label} - paste it at the cursor in the piano roll (Ctrl+V; Ctrl+Shift+V moves what follows)`)
}

function onKey(event: KeyboardEvent): void {
  if (!canArrange.value || (event.target as HTMLElement | null)?.closest('input, textarea, select')) return
  const mod = event.ctrlKey || event.metaKey
  const key = event.key.toLowerCase()
  let handled = true
  if (event.key === 'Delete' || event.key === 'Backspace') remove()
  else if (mod && key === 'd') duplicate()
  else if (mod && key === 'c') copy()
  else if (mod && event.key === 'ArrowUp') shift(-1)
  else if (mod && event.key === 'ArrowDown') shift(1)
  else if (mod && key === 'a') selected.value = sections.value.map((_, i) => i)
  else if (event.key === 'Escape' && selected.value.length) selected.value = []
  else handled = false
  if (handled) {
    event.preventDefault()
    event.stopPropagation()
  }
}

// --- drag and drop (Alt: copy) ---
function onDragStart(index: number, event: DragEvent): void {
  if (!canArrange.value) return
  if (!selected.value.includes(index)) selected.value = [index]
  dragging.value = true
  event.dataTransfer?.setData('text/plain', 'plenio-sections')
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'copyMove'
}

function onDragOver(index: number, event: DragEvent): void {
  if (!dragging.value) return
  event.preventDefault()
  const box = (event.currentTarget as HTMLElement).getBoundingClientRect()
  dropAt.value = event.clientY < box.top + box.height / 2 ? index : index + 1
  if (event.dataTransfer) event.dataTransfer.dropEffect = event.altKey || event.ctrlKey ? 'copy' : 'move'
}

function onDrop(event: DragEvent): void {
  if (!dragging.value || dropAt.value === null) return
  event.preventDefault()
  apply(dropSections(sections.value.length, selected.value, dropAt.value, event.altKey || event.ctrlKey))
  onDragEnd()
}

function onDragEnd(): void {
  dragging.value = false
  dropAt.value = null
}
</script>

<template>
  <nav class="navigator" aria-label="Sections and bars" tabindex="0" @keydown="onKey">
    <div v-if="canArrange" class="section-actions" role="toolbar" aria-label="Arrange sections">
      <span class="hint">{{ selected.length ? `${selected.length} selected` : 'Sections: click to select' }}</span>
      <button :disabled="!selected.length" title="Duplicate the selected sections after the last one (Ctrl+D)" @click="duplicate">
        Duplicate
      </button>
      <button :disabled="!selected.length" title="Copy the selected sections; paste them at the cursor in the piano roll (Ctrl+C)" @click="copy">
        Copy
      </button>
      <button :disabled="!selected.length" title="Move the selected sections one place earlier (Ctrl+↑)" aria-label="Move up" @click="shift(-1)">↑</button>
      <button :disabled="!selected.length" title="Move the selected sections one place later (Ctrl+↓)" aria-label="Move down" @click="shift(1)">↓</button>
      <button
        :disabled="!selected.length || selected.length >= sections.length"
        class="danger"
        title="Delete the selected sections; the rest closes up (Del)"
        @click="remove"
      >
        Delete
      </button>
    </div>
    <ol class="sections" @dragleave.self="dropAt = null">
      <li
        v-for="(section, index) in sections"
        :key="index"
        :class="{
          current: index === currentSection,
          picked: selected.includes(index),
          'drop-before': dropAt === index,
          'drop-after': dropAt === index + 1 && index === sections.length - 1
        }"
        :draggable="canArrange"
        :aria-selected="selected.includes(index)"
        @dragstart="onDragStart(index, $event)"
        @dragover="onDragOver(index, $event)"
        @drop="onDrop"
        @dragend="onDragEnd"
      >
        <div class="section-head" @click="pick(index, $event)">
          <button class="link" :title="`Select (Ctrl+click: add, Shift+click: range) and go to bar ${section.start_bar}`">
            <strong v-if="renaming !== index">{{ section.label }}</strong>
          </button>
          <input
            v-if="renaming === index"
            v-model="renameText"
            class="rename"
            aria-label="Section name"
            @click.stop
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
