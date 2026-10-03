<script setup lang="ts">
/**
 * The score editor's keys and mouse gestures at a glance (owner's request 2026-10-03: DAW users should
 * know their way at once). A button in the view tools opens the list; it changes nothing.
 */
import { ref } from 'vue'

const open = ref(false)

const GROUPS: { title: string; rows: [string, string][] }[] = [
  {
    title: 'Transport',
    rows: [
      ['Space', 'play / stop from the cursor (also after a click on a button)'],
      ['click / drag in the ruler', 'set the cursor - while it plays, playback jumps there'],
      ['Home / End', 'cursor to the start / the end'],
      ['loop', "the selected notes' bars, else the cursor's section"],
      ['hear · A/B (covers)', 'the notes and the source together, or one of them - switched at once']
    ]
  },
  {
    title: 'Piano roll',
    rows: [
      ['click the empty grid (Draw)', 'a note of the last drawn length'],
      ['drag / Shift+drag', 'draw a note / pull a selection frame'],
      ['drag a note · Alt+drag', 'move it (all selected) · copy it'],
      ['drag a note’s end', 'longer / shorter - stops at the next note, Alt: over it'],
      ['↑ / ↓ (Shift)', 'a semitone (an octave) - selected chord symbols too'],
      ['← / → (Shift) · Alt+← / →', 'move by the grid (a beat) · shorter / longer'],
      ['Del · Shift+Del', 'rest · delete and close the gap'],
      ['Ctrl+wheel · G / H', 'zoom along the bars'],
      ['Alt+wheel · Shift+G / H', 'zoom the rows (taller / lower)'],
      ['Q · Shift+Q', 'quantize the selection (all notes when none) to the grid · lengths too'],
      ['follow', 'the roll pages along with the playback (off: it stays where you look)'],
      ['click a key', 'hear its pitch']
    ]
  },
  {
    title: 'Clipboard and history',
    rows: [
      ['Ctrl+C / X / V', 'copy / cut / paste at the cursor (overwriting)'],
      ['Ctrl+Shift+V', 'insert at the cursor (what follows moves later)'],
      ['Ctrl+D', 'duplicate right after itself'],
      ['Ctrl+A · Esc', 'select all · let the selection go'],
      ['Ctrl+Z · Ctrl+Y', 'undo · redo']
    ]
  },
  {
    title: 'Sections, bars, lyrics',
    rows: [
      ['section list / bar strip', 'click, Ctrl+click, Shift+click to select'],
      ['Ctrl+D · Ctrl+↑↓ / ←→ · Del', 'duplicate · move · delete sections or bars (drag: move, Alt: copy)'],
      ['lyrics lane', 'double-click: edit · drag a line or its ends · Del · Ctrl+C / V']
    ]
  }
]
</script>

<template>
  <span class="keys-help">
    <button :aria-expanded="open" title="The keys and mouse gestures of the score editor" @click="open = !open">⌨ keys</button>
    <div v-if="open" class="keys-panel" role="dialog" aria-label="Keys and gestures">
      <button class="close" aria-label="Close" @click="open = false">×</button>
      <section v-for="group in GROUPS" :key="group.title">
        <h5>{{ group.title }}</h5>
        <table>
          <tr v-for="[keys, what] in group.rows" :key="keys">
            <th>{{ keys }}</th>
            <td>{{ what }}</td>
          </tr>
        </table>
      </section>
    </div>
  </span>
</template>
