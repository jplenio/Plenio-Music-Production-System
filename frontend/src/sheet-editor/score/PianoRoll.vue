<script setup lang="ts">
/**
 * Piano roll with chord lane (next-release plan §9.8, §10.3; milestone M1, task D1).
 *
 * Draws ``view.model`` - both voices in one roll (Vocal blue, Ins orange; new notes go into the
 * active track), the chord symbols in a lane above, bar numbers and sections in the header.
 * Every gesture is drawn as a ghost and commits exactly one canonical operation on release
 * through ``operate``; the backend checks it and returns the new view. A refused operation
 * removes the ghost (the Score tab shows the backend's message). Only the visible part of a long
 * score is drawn.
 *
 * The pane scrolls both ways: horizontally through the bars, vertically through the whole piano range
 * (the notes' range is centred when the roll opens). The pitch column stays on the left and the header
 * with the chord lane stays on top while it scrolls; a drag near the top or bottom edge scrolls along.
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import type { ScoreOperation } from '../../api/client'
import type { ModelChord, ScoreView } from '../../shared/scoreView'
import {
  type Drag,
  HEADER,
  KEYS_WIDTH,
  LANE,
  MOVE_THRESHOLD_PX,
  type ResizeMode,
  type RollNote,
  type SnapChoice,
  TOP,
  type Track,
  chordWidth,
  dragOp,
  dragTo,
  draggedIds,
  geometry,
  ghosts,
  gridLines,
  hitTest,
  isBlackKey,
  keyOp,
  noteRect,
  notesOf,
  pitchAt,
  pitchLabel,
  scrollTopFor,
  scrollTopToShow,
  selectedChordIds,
  selectedNoteIds,
  selectionFor,
  snapFloor,
  startChord,
  startDraw,
  startMove,
  startResize,
  unitAt,
  unitDenominator,
  xOf,
  yOf
} from './pianoRoll'

const props = withDefaults(
  defineProps<{
    view: ScoreView | null
    selection: string[]
    /** Commits one canonical operation; resolves ``false`` when it was refused. */
    operate: (operation: ScoreOperation) => Promise<boolean>
    playing?: string[]
    readonly?: boolean
    stale?: boolean
    busy?: boolean
    resizeMode?: ResizeMode
    height?: number
  }>(),
  { playing: () => [], readonly: false, stale: false, busy: false, resizeMode: 'rests', height: 280 }
)
const emit = defineEmits<{ select: [ids: string[]] }>()
/** Pixels per quarter note (the roll's horizontal zoom). */
const zoom = defineModel<number>('zoom', { default: 48 })

const root = ref<HTMLDivElement | null>(null)
const scroller = ref<HTMLDivElement | null>(null)
const svg = ref<SVGSVGElement | null>(null)
const chordInput = ref<HTMLInputElement | null>(null)
const track = ref<Track>('vocal')
const snapChoice = ref<SnapChoice>('auto')
const drag = ref<Drag | null>(null)
const committing = ref(false)
const scrollLeft = ref(0)
const scrollTop = ref(0)
const viewportWidth = ref(0)
const viewportHeight = ref(0)
/** The roll opened on the notes once (again after the model was missing, e.g. a new score). */
let centred = false
const chordEdit = ref<{ onset: number; name: string; original: string | null } | null>(null)
let press: { x: number; y: number; start: Drag | null; started: boolean; clear: boolean } | null = null
let observer: ResizeObserver | null = null

const model = computed(() => props.view?.model ?? null)
const notes = computed<RollNote[]>(() => (model.value ? notesOf(model.value) : []))
const chords = computed<ModelChord[]>(() => model.value?.tracks.chords ?? [])
const geo = computed(() => (model.value ? geometry(model.value, { pxPerQuarter: zoom.value, snap: snapChoice.value }) : null))
const editable = computed(() => !props.readonly && !props.stale && !props.busy && !committing.value)
const selectedNotes = computed(() => selectedNoteIds(props.view, props.selection))
const selectedChords = computed(() => selectedChordIds(props.selection))
const playingNotes = computed(() => selectedNoteIds(props.view, props.playing))
const dragged = computed(() => draggedIds(drag.value))
const ghostNotes = computed(() => ghosts(drag.value))
const snapLabel = computed(() => (model.value ? `1/${Math.round(unitDenominator(model.value) / (geo.value?.snap ?? 1))}` : ''))

/** The visible units (with a margin) - only this part of a long score is drawn. */
const window_ = computed<[number, number]>(() => {
  const g = geo.value
  if (!g) return [0, 0]
  const width = viewportWidth.value || 100000
  return [unitAt(scrollLeft.value - 200, g), unitAt(scrollLeft.value + width + 200, g)]
})
const inWindow = (start: number, end: number): boolean => end >= window_.value[0] && start <= window_.value[1]
const visibleNotes = computed(() => notes.value.filter((n) => inWindow(n.onset, n.onset + n.duration)))
const visibleChords = computed(() =>
  chords.value.map((chord, index) => ({ chord, next: chords.value[index + 1] })).filter(({ chord }) => inWindow(chord.onset, chord.onset + 64))
)
const visibleLines = computed(() => (model.value ? gridLines(model.value).filter((l) => inWindow(l.unit, l.unit)) : []))
const rows = computed(() => {
  const g = geo.value
  if (!g) return []
  return Array.from({ length: g.high - g.low + 1 }, (_, i) => g.high - i)
})
const sectionStarts = computed(() => {
  const m = model.value
  if (!m) return []
  return m.sections
    .filter((s) => !s.implicit)
    .map((s) => ({ label: s.label, unit: m.measures[s.first_bar - 1]?.onset ?? 0 }))
    .filter((s) => inWindow(s.unit, s.unit + 64))
})

function local(event: MouseEvent): [number, number] {
  const rect = svg.value?.getBoundingClientRect()
  return [event.clientX - (rect?.left ?? 0), event.clientY - (rect?.top ?? 0)]
}

function noteClasses(note: RollNote): Record<string, boolean> {
  return {
    note: true,
    [note.track]: true,
    selected: selectedNotes.value.has(note.id),
    playing: playingNotes.value.has(note.id),
    dragged: dragged.value.has(note.id)
  }
}

function describeNote(note: RollNote): string {
  const voice = note.track === 'vocal' ? 'Vocal' : 'Ins'
  let bar = 1
  for (const measure of model.value?.measures ?? []) if (measure.onset <= note.onset) bar = measure.n
  return `${voice} bar ${bar}: ${note.name}, ${note.duration} units`
}

function select(ids: string[]): void {
  emit('select', ids)
}

function onPointerDown(event: PointerEvent): void {
  const g = geo.value
  if (!g || event.button !== 0) return
  root.value?.focus({ preventScroll: true })
  const [x, y] = local(event)
  const hit = hitTest(x, y, notes.value, chords.value, g, track.value, scrollTop.value)
  const additive = event.shiftKey || event.ctrlKey || event.metaKey
  let start: Drag | null = null
  let clear = false
  if (hit.area === 'note') {
    const already = selectedNotes.value.has(hit.note.id)
    let moving: RollNote[]
    if (additive) {
      const ids = new Set(selectedNotes.value)
      if (already) ids.delete(hit.note.id)
      else ids.add(hit.note.id)
      moving = notes.value.filter((n) => ids.has(n.id))
      select(selectionFor(moving, chords.value.filter((c) => selectedChords.value.has(c.id))))
    } else if (already) {
      moving = notes.value.filter((n) => selectedNotes.value.has(n.id))
    } else {
      moving = [hit.note]
      select(selectionFor(moving))
    }
    if (editable.value && moving.some((n) => n.id === hit.note.id)) {
      start =
        hit.edge === 'end' && moving.length === 1
          ? startResize(hit.note)
          : startMove(moving, hit.note, unitAt(x, g), pitchAt(y, g))
    }
  } else if (hit.area === 'chord') {
    if (additive) {
      const ids = new Set(selectedChords.value)
      if (ids.has(hit.chord.id)) ids.delete(hit.chord.id)
      else ids.add(hit.chord.id)
      select([...props.selection.filter((id) => !id.startsWith('chord:')), ...ids])
    } else if (!selectedChords.value.has(hit.chord.id)) select([hit.chord.id])
    if (editable.value) start = startChord(hit.chord, unitAt(x, g))
  } else if (hit.area === 'grid') {
    if (editable.value && !additive) start = startDraw(track.value, hit.unit, hit.pitch, g)
    clear = !additive
  } else {
    clear = !additive
  }
  press = { x, y, start, started: false, clear }
  try {
    svg.value?.setPointerCapture?.(event.pointerId)
  } catch {
    // capture is a convenience; a synthetic event has no active pointer
  }
}

/** While a gesture runs, the pane scrolls along when the pointer reaches its top or bottom edge. */
function followEdge(event: PointerEvent): void {
  const el = scroller.value
  const g = geo.value
  if (!el || !g) return
  const box = el.getBoundingClientRect()
  if (!box.height) return
  const step = g.rowHeight
  if (event.clientY < box.top + TOP + 12) el.scrollTop = Math.max(0, el.scrollTop - step)
  else if (event.clientY > box.bottom - 16) el.scrollTop = el.scrollTop + step
  else return
  onScroll()
}

function onPointerMove(event: PointerEvent): void {
  const g = geo.value
  if (!press || !press.start || !g) return
  if (press.started) followEdge(event)
  const [x, y] = local(event)
  if (!press.started && Math.hypot(x - press.x, y - press.y) < MOVE_THRESHOLD_PX) return
  press.started = true
  drag.value = dragTo(press.start, unitAt(x, g), pitchAt(y, g), g, { alt: event.altKey })
}

async function commit(operation: ScoreOperation): Promise<void> {
  committing.value = true
  try {
    await props.operate(operation)
  } finally {
    committing.value = false
    drag.value = null
  }
}

function onPointerUp(): void {
  const current = press
  press = null
  if (!current) return
  if (!current.started) {
    drag.value = null
    if (current.clear) select([])
    return
  }
  const operation = drag.value ? dragOp(drag.value, props.resizeMode) : null
  if (!operation) {
    drag.value = null
    return
  }
  void commit(operation)
}

function onPointerCancel(): void {
  press = null
  drag.value = null
}

function onDoubleClick(event: MouseEvent): void {
  const g = geo.value
  if (!g || !editable.value) return
  const [x, y] = local(event)
  const hit = hitTest(x, y, notes.value, chords.value, g, track.value, scrollTop.value)
  if (hit.area === 'grid') {
    const onset = Math.min(snapFloor(hit.unit, g.snap), g.total - 1)
    const duration = Math.min(g.drawLength, g.total - onset)
    void commit({ op: 'insert_note', track: track.value, onset, duration, pitch: hit.pitch })
  } else if (hit.area === 'lane' || hit.area === 'chord') {
    const chord = hit.area === 'chord' ? hit.chord : null
    const onset = hit.area === 'chord' ? hit.chord.onset : Math.min(snapFloor(hit.unit, g.snap), g.total - 1)
    chordEdit.value = { onset, name: chord?.name ?? '', original: chord?.name ?? null }
    void nextTick(() => {
      chordInput.value?.focus()
      chordInput.value?.select()
    })
  }
}

function commitChord(): void {
  const edit = chordEdit.value
  chordEdit.value = null
  root.value?.focus({ preventScroll: true })
  if (!edit) return
  const name = edit.name.trim()
  if (name === (edit.original ?? '')) return
  if (!name) {
    if (edit.original !== null) void commit({ op: 'delete_chord', onset: edit.onset })
    return
  }
  void commit({ op: 'put_chord', onset: edit.onset, name })
}

function cancelChord(): void {
  chordEdit.value = null
  root.value?.focus({ preventScroll: true })
}

function onKey(event: KeyboardEvent): void {
  const target = event.target as HTMLElement | null
  if (target?.closest('input, select, textarea')) return
  const g = geo.value
  if (!g) return
  if (event.key === 'Escape') {
    if (press || drag.value) onPointerCancel()
    else if (props.selection.length) select([])
    else return
    event.preventDefault()
    event.stopPropagation()
    return
  }
  const selected = notes.value.filter((n) => selectedNotes.value.has(n.id))
  const selectedChordList = chords.value.filter((c) => selectedChords.value.has(c.id))
  const operation = keyOp(
    event.key,
    { shift: event.shiftKey, alt: event.altKey },
    selected,
    selectedChordList,
    g,
    props.resizeMode
  )
  if (operation === undefined) return
  event.preventDefault()
  event.stopPropagation()
  if (operation && editable.value) void commit(operation)
}

function onScroll(): void {
  scrollLeft.value = scroller.value?.scrollLeft ?? 0
  scrollTop.value = scroller.value?.scrollTop ?? 0
  viewportWidth.value = scroller.value?.clientWidth ?? 0
  viewportHeight.value = scroller.value?.clientHeight ?? 0
}

/** Open on the notes: centre their range vertically (once per score shown). */
function centre(): void {
  const g = geo.value
  const el = scroller.value
  if (centred || !g || !el || !el.clientHeight) return
  centred = true
  el.scrollTop = scrollTopFor(g, el.clientHeight, g.focus[0], g.focus[1])
  onScroll()
}

/** Scroll so that the (first) selected or playing note is visible - along the bars and in pitch. */
function reveal(ids: Set<string>): void {
  const g = geo.value
  const el = scroller.value
  const note = notes.value.find((n) => ids.has(n.id))
  if (!g || !el || !note || !el.clientWidth) return
  const x = xOf(note.onset, g)
  if (x < el.scrollLeft + KEYS_WIDTH || x > el.scrollLeft + el.clientWidth - 40) {
    el.scrollLeft = Math.max(0, x - el.clientWidth / 3)
  }
  const top = el.clientHeight ? scrollTopToShow(g, el.scrollTop, el.clientHeight, note.pitch) : null
  if (top !== null) el.scrollTop = top
  onScroll()
}

function zoomBy(factor: number): void {
  zoom.value = Math.max(12, Math.min(240, Math.round(zoom.value * factor)))
}

watch(selectedNotes, (ids) => reveal(ids))
watch(playingNotes, (ids) => reveal(ids))
// the scroller exists only while there is a model: centre when it appears (a new or repaired score)
watch(
  () => !!model.value,
  (present) => {
    if (!present) centred = false
    else void nextTick(centre)
  }
)

onMounted(() => {
  onScroll()
  centre()
  if (scroller.value && typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(() => {
      onScroll()
      centre()
    })
    observer.observe(scroller.value)
  }
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div
    ref="root"
    class="roll"
    :class="{ stale, readonly }"
    tabindex="0"
    role="application"
    aria-label="Piano roll: drag to draw a note, drag a note to move it, drag its end to change its length"
    @keydown="onKey"
  >
    <div class="roll-tools" role="toolbar" aria-label="Piano roll">
      <span class="group" role="group" aria-label="Draw into">
        draw into
        <button :class="{ active: track === 'vocal' }" class="vocal" :aria-pressed="track === 'vocal'" @click="track = 'vocal'">
          Vocal
        </button>
        <button :class="{ active: track === 'ins' }" class="ins" :aria-pressed="track === 'ins'" @click="track = 'ins'">
          Ins
        </button>
      </span>
      <label title="Grid for drawing, moving and resizing">
        snap
        <select v-model="snapChoice" aria-label="Snap">
          <option value="auto">auto ({{ snapChoice === 'auto' ? snapLabel : 'score' }})</option>
          <option :value="4">1/4</option>
          <option :value="8">1/8</option>
          <option :value="16">1/16</option>
          <option :value="32">1/32</option>
        </select>
      </label>
      <span class="group" role="group" aria-label="Zoom">
        <button title="Zoom out" aria-label="Zoom out" @click="zoomBy(1 / 1.25)">−</button>
        <button title="Zoom in" aria-label="Zoom in" @click="zoomBy(1.25)">+</button>
      </span>
      <span class="hint">
        drag: draw · drag a note: move (↕ pitch) · drag its end: length (Alt: over the next note) · double-click: note ·
        double-click the lane: chord · Del: rest · Shift+Del: close the gap
      </span>
    </div>
    <p v-if="!model && view?.model_error" class="roll-note">{{ view.model_error.message }}</p>
    <div
      v-else-if="model && geo"
      ref="scroller"
      class="roll-scroll"
      :style="{ height: `${Math.min(height, geo.height + 16)}px` }"
      @scroll="onScroll"
    >
      <svg
        ref="svg"
        class="roll-svg"
        :width="geo.width"
        :height="geo.height"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerCancel"
        @dblclick="onDoubleClick"
      >
        <rect
          v-for="pitch in rows"
          :key="'row' + pitch"
          class="row"
          :class="{ black: isBlackKey(pitch), c: pitch % 12 === 0 }"
          :x="0"
          :y="yOf(pitch, geo)"
          :width="geo.width"
          :height="geo.rowHeight"
        />
        <line
          v-for="line in visibleLines"
          :key="'l' + line.unit"
          :class="line.kind"
          :x1="xOf(line.unit, geo)"
          :x2="xOf(line.unit, geo)"
          :y1="TOP"
          :y2="geo.height"
        />
        <rect v-for="note in visibleNotes" :key="note.id" :class="noteClasses(note)" v-bind="noteRect(note, geo)" rx="2">
          <title>{{ describeNote(note) }}</title>
        </rect>
        <rect v-for="(ghost, index) in ghostNotes" :key="'ghost' + index" class="ghost" :class="ghost.track" v-bind="noteRect(ghost, geo)" rx="2" />
        <g class="keys" :transform="`translate(${scrollLeft} 0)`">
          <rect class="keys-bg" :x="0" :y="TOP" :width="KEYS_WIDTH - 2" :height="geo.height - TOP" />
          <text
            v-for="pitch in rows.filter((p) => p % 12 === 0)"
            :key="'k' + pitch"
            class="key-label"
            :x="4"
            :y="yOf(pitch, geo) + geo.rowHeight - 2"
          >
            {{ pitchLabel(pitch) }}
          </text>
        </g>
        <!-- the header (bar numbers, sections) and the chord lane stay on top while the pane scrolls -->
        <g class="roll-top" :transform="`translate(0 ${scrollTop})`">
          <rect class="top-bg" :x="0" :y="0" :width="geo.width" :height="TOP" />
          <rect class="lane" :x="0" :y="HEADER" :width="geo.width" :height="LANE" />
          <line
            v-for="line in visibleLines.filter((l) => l.kind === 'bar')"
            :key="'t' + line.unit"
            class="bar"
            :x1="xOf(line.unit, geo)"
            :x2="xOf(line.unit, geo)"
            :y1="0"
            :y2="TOP"
          />
          <text v-for="line in visibleLines.filter((l) => l.bar)" :key="'n' + line.unit" class="bar-number" :x="xOf(line.unit, geo) + 3" :y="12">
            {{ line.bar }}
          </text>
          <text v-for="section in sectionStarts" :key="'s' + section.unit" class="section-label" :x="xOf(section.unit, geo) + 22" :y="12">
            {{ section.label }}
          </text>
          <g
            v-for="{ chord, next } in visibleChords"
            :key="chord.id"
            class="chord"
            :class="{ selected: selectedChords.has(chord.id), dragged: drag?.kind === 'chord' && drag.chord.id === chord.id }"
          >
            <rect :x="xOf(chord.onset, geo)" :y="HEADER + 3" :width="chordWidth(chord, next, geo)" :height="LANE - 6" rx="3" />
            <text :x="xOf(chord.onset, geo) + 4" :y="HEADER + LANE / 2 + 4">{{ chord.name }}</text>
            <title>chord {{ chord.name }} - drag to move, double-click to rename, Delete to remove</title>
          </g>
          <g v-if="drag?.kind === 'chord'" class="chord ghost">
            <rect :x="xOf(drag.to, geo)" :y="HEADER + 3" :width="chordWidth(drag.chord, undefined, geo)" :height="LANE - 6" rx="3" />
            <text :x="xOf(drag.to, geo) + 4" :y="HEADER + LANE / 2 + 4">{{ drag.chord.name }}</text>
          </g>
        </g>
      </svg>
      <input
        v-if="chordEdit"
        ref="chordInput"
        v-model="chordEdit.name"
        class="chord-edit"
        aria-label="Chord symbol (empty removes it)"
        placeholder="Am7"
        :style="{ left: `${xOf(chordEdit.onset, geo)}px`, top: `${HEADER + 1 + scrollTop}px` }"
        @keydown.enter.prevent="commitChord"
        @keydown.esc.prevent.stop="cancelChord"
        @blur="cancelChord"
      />
    </div>
  </div>
</template>
