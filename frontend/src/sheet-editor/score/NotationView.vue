<script setup lang="ts">
/**
 * Rendered notation of the score (abcjs on the backend's display ABC). Clicking a note or
 * rest selects it (Shift adds to the selection); the selection and the playback cursor are
 * drawn with CSS classes on abcjs' SVG elements.
 */
import abcjs from 'abcjs'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { type ScoreView, elementAtDisplay, elementById } from '../../shared/scoreView'

const props = defineProps<{
  view: ScoreView | null
  stale: boolean
  selection: string[]
  playing: string[]
  zoom: number
}>()
const emit = defineEmits<{ select: [id: string, additive: boolean] }>()

const host = ref<HTMLDivElement | null>(null)
const renderError = ref<string | null>(null)
let byEnd = new Map<number, SVGElement[]>()
let marked: Record<'plenio-selected' | 'plenio-playing', SVGElement[]> = {
  'plenio-selected': [],
  'plenio-playing': []
}
let additive = false
let observer: ResizeObserver | null = null
let lastWidth = 0

interface RenderedItem {
  el_type?: string
  endChar?: number
  abselem?: { elemset?: SVGElement[] }
}

function collect(tune: unknown): Map<number, SVGElement[]> {
  const map = new Map<number, SVGElement[]>()
  const lines = (tune as { lines?: { staff?: { voices?: RenderedItem[][] }[] }[] }).lines ?? []
  for (const line of lines) {
    for (const staff of line.staff ?? []) {
      for (const voice of staff.voices ?? []) {
        for (const item of voice) {
          if (item.el_type === 'note' && typeof item.endChar === 'number' && item.abselem?.elemset) {
            map.set(item.endChar, item.abselem.elemset)
          }
        }
      }
    }
  }
  return map
}

function elementsOf(id: string): SVGElement[] {
  const element = elementById(props.view, id)
  return element ? (byEnd.get(element.display[1]) ?? []) : []
}

function mark(kind: 'plenio-selected' | 'plenio-playing', ids: string[]): void {
  for (const svg of marked[kind]) svg.classList.remove(kind)
  marked[kind] = ids.flatMap(elementsOf)
  for (const svg of marked[kind]) svg.classList.add(kind)
}

function render(): void {
  const el = host.value
  if (!el) return
  const abc = props.view?.display_abc
  if (!abc) {
    el.innerHTML = ''
    byEnd = new Map()
    return
  }
  try {
    const color = getComputedStyle(el).color || '#dddddd'
    lastWidth = el.clientWidth
    const tunes = abcjs.renderAbc(el, abc, {
      add_classes: true,
      responsive: 'resize',
      scale: props.zoom,
      foregroundColor: color,
      selectionColor: color,
      staffwidth: Math.max(480, Math.floor(el.clientWidth / props.zoom) - 30),
      wrap: { minSpacing: 1.8, maxSpacing: 2.7, preferredMeasuresPerLine: 4 },
      clickListener: (abcElem) => {
        const range = abcElem as unknown as { startChar?: number; endChar?: number }
        if (!props.view || typeof range.startChar !== 'number' || typeof range.endChar !== 'number') return
        const element = elementAtDisplay(props.view, range.startChar, range.endChar)
        if (element) emit('select', element.id, additive)
      }
    })
    byEnd = collect(tunes[0])
    marked = { 'plenio-selected': [], 'plenio-playing': [] }
    mark('plenio-selected', props.selection)
    mark('plenio-playing', props.playing)
    renderError.value = null
  } catch (e) {
    renderError.value = `The notation could not be drawn: ${e instanceof Error ? e.message : String(e)}`
  }
}

/** Scroll the notation so that the element is visible. */
function reveal(id: string): void {
  const [first] = elementsOf(id)
  first?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
}

defineExpose({ reveal })

watch(() => [props.view?.display_abc, props.zoom], () => nextTick(render))
watch(
  () => props.selection,
  (ids) => {
    mark('plenio-selected', ids)
    if (ids[0]) reveal(ids[0])
  }
)
watch(
  () => props.playing,
  (ids) => {
    mark('plenio-playing', ids)
    if (ids[0]) reveal(ids[0])
  }
)

onMounted(() => {
  render()
  observer = new ResizeObserver(() => {
    if (host.value && Math.abs(host.value.clientWidth - lastWidth) > 40) render()
  })
  if (host.value) observer.observe(host.value)
})
onBeforeUnmount(() => observer?.disconnect())

function onPointer(event: PointerEvent): void {
  additive = event.shiftKey || event.ctrlKey || event.metaKey
}
</script>

<template>
  <div class="notation-wrap" :class="{ stale }">
    <p v-if="stale" class="stale-note" role="status">
      The text has errors - the notation shows the last valid score. Fix the ABC to continue.
    </p>
    <p v-if="renderError" class="error">{{ renderError }}</p>
    <div
      ref="host"
      class="notation"
      aria-label="Score notation - click a note to select it"
      @pointerdown.capture="onPointer"
    />
  </div>
</template>
