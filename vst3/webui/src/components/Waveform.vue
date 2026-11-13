<script setup lang="ts">
// A take's waveform at its place on the timeline (peaks from the plug-in, drawn mirrored).
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { view, x } from '../timeline'

const props = defineProps<{ peaks?: number[]; start: number; seconds: number; active: boolean; height: number }>()
const canvas = ref<HTMLCanvasElement | null>(null)
let frame = 0

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
  const peaks = props.peaks
  const x0 = x(props.start)
  const x1 = x(props.start + props.seconds)
  if (x1 < 0 || x0 > w) return
  // the take's span
  g.fillStyle = props.active ? 'rgba(176, 92, 255, 0.10)' : 'rgba(255, 255, 255, 0.03)'
  g.beginPath()
  g.roundRect(x0, 3, Math.max(2, x1 - x0), h - 6, 6)
  g.fill()
  if (!peaks || peaks.length === 0) return
  const mid = h / 2
  const grad = g.createLinearGradient(0, 0, w, 0)
  if (props.active) {
    grad.addColorStop(0, '#ff5aa0')
    grad.addColorStop(0.55, '#a05cff')
    grad.addColorStop(1, '#7a6bff')
  } else {
    grad.addColorStop(0, '#6d6585')
    grad.addColorStop(1, '#5b5475')
  }
  g.fillStyle = grad
  const from = Math.max(0, Math.floor(x0))
  const to = Math.min(w, Math.ceil(x1))
  const scale = (h / 2 - 5) * 0.95
  for (let px = from; px < to; px++) {
    const t0 = ((px - x0) / (x1 - x0)) * peaks.length
    const t1 = ((px + 1 - x0) / (x1 - x0)) * peaks.length
    let p = 0
    for (let k = Math.floor(t0); k <= Math.min(peaks.length - 1, Math.floor(t1)); k++) p = Math.max(p, peaks[k] ?? 0)
    const a = Math.max(0.6, p * scale)
    g.fillRect(px, mid - a, 1, a * 2)
  }
}

function schedule(): void {
  if (!frame) frame = requestAnimationFrame(draw)
}

watch(() => [props.peaks, props.start, props.seconds, props.active, view.pxPerSecond, view.scroll, view.width], schedule)
onMounted(draw)
onBeforeUnmount(() => cancelAnimationFrame(frame))
</script>

<template>
  <canvas ref="canvas" class="wave" />
</template>

<style scoped>
.wave {
  display: block;
}
</style>
