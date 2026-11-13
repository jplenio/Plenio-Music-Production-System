<script setup lang="ts">
// The notes of the melody (or the instrument line) on the song's timeline: select, move, lengthen, draw, delete,
// transpose. A change goes to the plug-in when the gesture ends; the next take sings it.
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { act, store } from '../store'
import { pitchName, secondsToTick, tickToSeconds, view, x } from '../timeline'
import type { Measure, Note } from '../types'

const props = defineProps<{ part: 'melody' | 'instrument'; grid: number; height: number }>()

const canvas = ref<HTMLCanvasElement | null>(null)
const selected = ref<Set<number>>(new Set())
const work = ref<Note[] | null>(null) // the notes during a gesture
const undo: Note[][] = []
let frame = 0

const score = computed(() => store.song?.score)
const measures = computed<Measure[]>(() => store.song?.measures ?? [])
const notes = computed<Note[]>(() => work.value ?? (props.part === 'melody' ? score.value?.melody : score.value?.instrument) ?? [])
const ghost = computed<Note[]>(() => (props.part === 'melody' ? score.value?.instrument : score.value?.melody) ?? [])

const range = computed(() => {
  const all = notes.value.length ? notes.value : ghost.value
  let lo = 127
  let hi = 0
  for (const n of all) {
    lo = Math.min(lo, n[2])
    hi = Math.max(hi, n[2])
  }
  if (lo > hi) {
    lo = 55
    hi = 79
  }
  lo = Math.max(0, lo - 3)
  hi = Math.min(127, hi + 3)
  while (hi - lo < 24) {
    if (lo > 0) lo--
    if (hi - lo < 24 && hi < 127) hi++
  }
  return { lo, hi }
})

const rowHeight = computed(() => props.height / (range.value.hi - range.value.lo + 1))
function yOf(pitch: number): number {
  return (range.value.hi - pitch) * rowHeight.value
}
function pitchAt(y: number): number {
  return Math.max(0, Math.min(127, Math.round(range.value.hi - y / rowHeight.value + 0.5 - 0.5)))
}
function snap(tick: number): number {
  return Math.round(tick / props.grid) * props.grid
}

function draw(): void {
  frame = 0
  const c = canvas.value
  if (!c) return
  const dpr = window.devicePixelRatio || 1
  const w = Math.max(1, Math.floor(view.width))
  const h = props.height
  if (c.width !== Math.floor(w * dpr) || c.height !== Math.floor(h * dpr)) {
    c.width = Math.floor(w * dpr)
    c.height = Math.floor(h * dpr)
    c.style.width = `${w}px`
    c.style.height = `${h}px`
  }
  const g = c.getContext('2d')
  if (!g) return
  g.setTransform(dpr, 0, 0, dpr, 0, 0)
  g.clearRect(0, 0, w, h)
  const { lo, hi } = range.value
  const rh = rowHeight.value
  // rows: the black keys darker, every C marked
  for (let p = lo; p <= hi; p++) {
    const black = [1, 3, 6, 8, 10].includes(p % 12)
    g.fillStyle = black ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.012)'
    g.fillRect(0, yOf(p), w, rh)
    if (p % 12 === 0) {
      g.fillStyle = 'rgba(255,255,255,0.07)'
      g.fillRect(0, yOf(p) + rh - 1, w, 1)
    }
  }
  // bars and beats
  const ppq = score.value?.ppq ?? 480
  for (const m of measures.value) {
    const xa = x(m.start)
    const xb = x(m.end)
    if (xb < 0 || xa > w) continue
    g.fillStyle = 'rgba(255,255,255,0.13)'
    g.fillRect(Math.round(xa), 0, 1, h)
    const beats = Math.round((m.endTick - m.tick) / ppq)
    if ((xb - xa) / Math.max(1, beats) > 10) {
      g.fillStyle = 'rgba(255,255,255,0.05)'
      for (let b = 1; b < beats; b++) g.fillRect(Math.round(xa + ((xb - xa) * b) / beats), 0, 1, h)
    }
  }
  const ms = measures.value
  const box = (n: Note) => {
    const xa = x(tickToSeconds(ms, n[0]))
    const xb = x(tickToSeconds(ms, n[0] + n[1]))
    return { xa, w: Math.max(3, xb - xa - 1), y: yOf(n[2]) + 1, h: Math.max(3, rh - 2) }
  }
  // the other part, faint
  g.fillStyle = 'rgba(160, 150, 190, 0.16)'
  for (const n of ghost.value) {
    const b = box(n)
    if (b.xa + b.w < 0 || b.xa > w || n[2] < lo || n[2] > hi) continue
    g.fillRect(b.xa, b.y, b.w, b.h)
  }
  // the notes
  notes.value.forEach((n, i) => {
    const b = box(n)
    if (b.xa + b.w < 0 || b.xa > w || n[2] < lo || n[2] > hi) return
    const on = selected.value.has(i)
    const grad = g.createLinearGradient(b.xa, 0, b.xa + b.w, 0)
    if (props.part === 'melody') {
      grad.addColorStop(0, on ? '#ffd0e4' : '#ff5aa0')
      grad.addColorStop(1, on ? '#e8d6ff' : '#b26bff')
    } else {
      grad.addColorStop(0, on ? '#ffe7b8' : '#ffb23e')
      grad.addColorStop(1, on ? '#ffd9c8' : '#ff7a59')
    }
    g.fillStyle = grad
    g.beginPath()
    g.roundRect(b.xa, b.y, b.w, b.h, Math.min(3, b.h / 2))
    g.fill()
    if (on) {
      g.strokeStyle = 'white'
      g.lineWidth = 1
      g.stroke()
    }
  })
  // the names of the C keys at the left
  g.font = '10px Segoe UI, sans-serif'
  g.fillStyle = 'rgba(255,255,255,0.45)'
  for (let p = lo; p <= hi; p++) if (p % 12 === 0 && rh >= 4) g.fillText(pitchName(p), 4, yOf(p) + rh - 2)
  if (rubber) {
    g.strokeStyle = 'rgba(176, 92, 255, 0.9)'
    g.fillStyle = 'rgba(176, 92, 255, 0.12)'
    const rx = Math.min(rubber.x0, rubber.x1)
    const ry = Math.min(rubber.y0, rubber.y1)
    g.fillRect(rx, ry, Math.abs(rubber.x1 - rubber.x0), Math.abs(rubber.y1 - rubber.y0))
    g.strokeRect(rx + 0.5, ry + 0.5, Math.abs(rubber.x1 - rubber.x0), Math.abs(rubber.y1 - rubber.y0))
  }
}

function schedule(): void {
  if (!frame) frame = requestAnimationFrame(draw)
}

// --- gestures ---

type Drag =
  | { kind: 'move'; x0: number; y0: number; start: Note[]; dt: number; dp: number }
  | { kind: 'resize'; x0: number; start: Note[]; index: number }
let drag: Drag | null = null
let rubber: { x0: number; y0: number; x1: number; y1: number } | null = null

function hit(px: number, py: number): { index: number; edge: boolean } | null {
  const ms = measures.value
  for (let i = notes.value.length - 1; i >= 0; i--) {
    const n = notes.value[i]
    const xa = x(tickToSeconds(ms, n[0]))
    const xb = x(tickToSeconds(ms, n[0] + n[1]))
    const ya = yOf(n[2])
    if (px >= xa && px <= Math.max(xa + 4, xb) && py >= ya && py <= ya + rowHeight.value) return { index: i, edge: px > xb - 6 && xb - xa > 10 }
  }
  return null
}

function local(e: MouseEvent): { px: number; py: number } {
  const r = canvas.value!.getBoundingClientRect()
  return { px: e.clientX - r.left, py: e.clientY - r.top }
}

function begin(): void {
  undo.push(notes.value.map((n) => [...n] as Note))
  if (undo.length > 50) undo.shift()
}

function down(e: MouseEvent): void {
  if (e.button !== 0) return
  canvas.value?.focus()
  const { px, py } = local(e)
  const found = hit(px, py)
  if (found) {
    if (e.shiftKey || e.ctrlKey) {
      const s = new Set(selected.value)
      if (s.has(found.index)) s.delete(found.index)
      else s.add(found.index)
      selected.value = s
    } else if (!selected.value.has(found.index)) selected.value = new Set([found.index])
    const start = notes.value.map((n) => [...n] as Note)
    drag = found.edge ? { kind: 'resize', x0: px, start, index: found.index } : { kind: 'move', x0: px, y0: py, start, dt: 0, dp: 0 }
  } else {
    if (!e.shiftKey) selected.value = new Set()
    rubber = { x0: px, y0: py, x1: px, y1: py }
  }
  window.addEventListener('mousemove', move)
  window.addEventListener('mouseup', up)
  schedule()
}

function move(e: MouseEvent): void {
  const { px, py } = local(e)
  const ms = measures.value
  if (drag?.kind === 'move') {
    const t0 = secondsToTick(ms, view.scroll + drag.x0 / view.pxPerSecond)
    const t1 = secondsToTick(ms, view.scroll + px / view.pxPerSecond)
    const dt = snap(t1 - t0)
    const dp = Math.round((drag.y0 - py) / rowHeight.value)
    if (dt === drag.dt && dp === drag.dp && work.value) return
    drag.dt = dt
    drag.dp = dp
    work.value = drag.start.map((n, i) => (selected.value.has(i) ? [Math.max(0, n[0] + dt), n[1], Math.max(0, Math.min(127, n[2] + dp)), n[3]] : n) as Note)
  } else if (drag?.kind === 'resize') {
    // every selected note grows or shrinks by what the grabbed one does
    const n = drag.start[drag.index]
    const end = snap(secondsToTick(ms, view.scroll + px / view.pxPerSecond))
    const delta = Math.max(props.grid, end - n[0]) - n[1]
    work.value = drag.start.map((m, i) => (selected.value.has(i) ? [m[0], Math.max(props.grid, m[1] + delta), m[2], m[3]] : m) as Note)
  } else if (rubber) {
    rubber.x1 = px
    rubber.y1 = py
    const xa = Math.min(rubber.x0, rubber.x1)
    const xb = Math.max(rubber.x0, rubber.x1)
    const ya = Math.min(rubber.y0, rubber.y1)
    const yb = Math.max(rubber.y0, rubber.y1)
    const s = new Set<number>()
    notes.value.forEach((n, i) => {
      const nx = x(tickToSeconds(ms, n[0]))
      const ny = yOf(n[2]) + rowHeight.value / 2
      if (nx >= xa && nx <= xb && ny >= ya && ny <= yb) s.add(i)
    })
    selected.value = s
  }
  schedule()
}

function up(): void {
  window.removeEventListener('mousemove', move)
  window.removeEventListener('mouseup', up)
  if (drag && work.value) {
    const changed = JSON.stringify(work.value) !== JSON.stringify(drag.start)
    if (changed) {
      undo.push(drag.start)
      commit(work.value)
    } else work.value = null
  }
  drag = null
  rubber = null
  schedule()
}

function dbl(e: MouseEvent): void {
  const { px, py } = local(e)
  if (hit(px, py)) return
  const tick = Math.max(0, Math.floor(secondsToTick(measures.value, view.scroll + px / view.pxPerSecond) / props.grid) * props.grid)
  begin()
  const added: Note = [tick, props.grid, pitchAt(py), 90]
  const next = [...notes.value, added].sort((a, b) => a[0] - b[0] || a[2] - b[2])
  selected.value = new Set([next.indexOf(added)])
  commit(next)
}

function key(e: KeyboardEvent): void {
  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (selected.value.size === 0) return
    begin()
    commit(notes.value.filter((_, i) => !selected.value.has(i)))
    selected.value = new Set()
    e.preventDefault()
  } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    if (selected.value.size === 0) return
    begin()
    const d = (e.key === 'ArrowUp' ? 1 : -1) * (e.shiftKey ? 12 : 1)
    commit(notes.value.map((n, i) => (selected.value.has(i) ? [n[0], n[1], Math.max(0, Math.min(127, n[2] + d)), n[3]] : n) as Note))
    e.preventDefault()
  } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
    const last = undo.pop()
    if (last) commit(last)
    e.preventDefault()
  } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
    selected.value = new Set(notes.value.map((_, i) => i))
    schedule()
    e.preventDefault()
  }
}

function commit(next: Note[]): void {
  work.value = next
  void act('song.notes', { part: props.part, notes: next }).then(() => {
    work.value = null
    schedule()
  })
  schedule()
}

watch(() => [notes.value, ghost.value, view.pxPerSecond, view.scroll, view.width, props.height, props.part, measures.value], schedule, { deep: false })
watch(
  () => props.part,
  () => (selected.value = new Set())
)
onMounted(draw)
onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  window.removeEventListener('mousemove', move)
  window.removeEventListener('mouseup', up)
})
</script>

<template>
  <canvas ref="canvas" class="roll" tabindex="0" @mousedown="down" @dblclick="dbl" @keydown="key" />
</template>

<style scoped>
.roll {
  display: block;
  outline: none;
  cursor: default;
}
</style>
