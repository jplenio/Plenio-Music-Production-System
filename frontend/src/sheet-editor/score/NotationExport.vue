<script setup lang="ts">
/**
 * *Export notation…* in the files row (owner's request 2026-10-03): the score's notation as PDF (pages
 * of A4 or Letter), PNG or SVG, or printed, in one of four sizes (2026-10-08). See notationExport.ts.
 */
import { nextTick, ref } from 'vue'

import type { NotationSize, Paper } from './editorSettings'
import { downloadBytes } from './midiImport'
import { exportName, notationPdf, notationPng, printNotation, renderLines, stackedSvg } from './notationExport'

const props = defineProps<{
  /** The display ABC of the valid score (``null``: nothing to export). */
  abc: string | null
  title: string
  /** Why there is nothing to export (shown as the tooltip). */
  blocked: string | null
}>()
const paper = defineModel<Paper>('paper', { required: true })
const size = defineModel<NotationSize>('size', { required: true })
const emit = defineEmits<{ done: [message: string]; failed: [message: string] }>()

const open = ref(false)
const busy = ref(false)
const toggle = ref<HTMLButtonElement | null>(null)

function close(): void {
  open.value = false
  void nextTick(() => toggle.value?.focus())
}

async function run(kind: 'pdf' | 'png' | 'svg' | 'print'): Promise<void> {
  if (!props.abc || busy.value) return
  busy.value = true
  // the drawing takes a moment: let the button show it first
  await new Promise((resolve) => setTimeout(resolve, 20))
  let drawing: ReturnType<typeof renderLines> | null = null
  try {
    drawing = renderLines(props.abc, props.title, paper.value, size.value)
    const { lines } = drawing
    if (!lines.length) throw new Error('the score has no music to draw')
    const sheet = paper.value === 'a4' ? 'A4' : 'Letter'
    if (kind === 'pdf') {
      const bytes = await notationPdf(lines, paper.value, props.title)
      downloadBytes(exportName(props.title, 'pdf'), bytes, 'application/pdf')
      emit('done', `exported the notation as PDF (${sheet})`)
    } else if (kind === 'png') {
      downloadBytes(exportName(props.title, 'png'), await notationPng(lines), 'image/png')
      emit('done', 'exported the notation as PNG')
    } else if (kind === 'svg') {
      downloadBytes(exportName(props.title, 'svg'), new TextEncoder().encode(stackedSvg(lines)), 'image/svg+xml')
      emit('done', 'exported the notation as SVG')
    } else {
      printNotation(lines, paper.value, props.title)
      emit('done', `printing the notation (${sheet}) - the browser’s dialog also saves a vector PDF`)
    }
    close()
  } catch (error) {
    emit('failed', `The notation could not be exported: ${error instanceof Error ? error.message : String(error)}`)
  } finally {
    drawing?.dispose()
    busy.value = false
  }
}
</script>

<template>
  <span class="notation-export">
    <button
      ref="toggle"
      :disabled="!abc"
      :aria-expanded="open"
      :title="blocked ?? 'The sheet music as PDF, PNG or SVG, or printed - both voices, chord symbols, sections and the lyrics'"
      @click="open ? close() : (open = true)"
    >
      Export notation…
    </button>
    <span v-if="open" class="export-panel" role="dialog" aria-label="Export the notation" @keydown.esc.stop.prevent="close">
      <button class="close" aria-label="Close" @click="close">×</button>
      <label title="The paper of the PDF and the print">
        paper
        <select v-model="paper" aria-label="Paper">
          <option value="a4">A4</option>
          <option value="letter">Letter</option>
        </select>
      </label>
      <label title="How large the music is drawn: standard about 3 bars a line (4 pages for a song of 3-4 minutes), smaller 3-4 (3 pages), compact about 4 (2-3 pages), large 1-2 bars a line (the biggest notes)">
        size
        <select v-model="size" aria-label="Notation size">
          <option value="large">large</option>
          <option value="standard">standard</option>
          <option value="smaller">smaller</option>
          <option value="compact">compact</option>
        </select>
      </label>
      <span class="formats">
        <button :disabled="busy" title="Pages of the chosen paper, 300 dpi - for printing and sharing" @click="run('pdf')">PDF</button>
        <button :disabled="busy" title="The whole score as one picture" @click="run('png')">PNG</button>
        <button :disabled="busy" title="The whole score as a vector drawing (scales without loss)" @click="run('svg')">SVG</button>
        <button :disabled="busy" title="The browser’s print dialog - it also saves a vector PDF" @click="run('print')">Print…</button>
      </span>
      <span class="facts">{{ busy ? 'drawing the pages…' : 'What the notation shows: both voices, chord symbols, sections and the lyrics.' }}</span>
    </span>
  </span>
</template>
