<script setup lang="ts">
/**
 * The lyrics next to the score's sections: order and count of the tags, and a fit hint
 * per section (estimated syllables against the vocal notes). Onsets are not syllables and
 * melismas are allowed, so the ratio is a hint, not a rule.
 */
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import { type Fetcher, type LyricsAnalysis, analyzeLyrics } from '../api/client'

const props = defineProps<{
  lyrics: string
  abc: string | null
  fetcher: Fetcher
  engine: string | null
  instrumental: boolean
}>()

const result = ref<LyricsAnalysis | null>(null)
const failed = ref<string | null>(null)
let timer: ReturnType<typeof setTimeout> | undefined
let latest = 0

async function run(): Promise<void> {
  const ticket = ++latest
  try {
    const analysis = await analyzeLyrics(props.fetcher, {
      lyrics: props.lyrics,
      abc: props.abc ?? undefined,
      engine: props.engine,
      instrumental: props.instrumental
    })
    if (ticket === latest) {
      result.value = analysis
      failed.value = null
    }
  } catch (e) {
    if (ticket === latest) failed.value = e instanceof Error ? e.message : String(e)
  }
}

watch(
  () => [props.lyrics, props.abc],
  () => {
    clearTimeout(timer)
    timer = setTimeout(() => void run(), 350)
  },
  { immediate: true }
)
onBeforeUnmount(() => clearTimeout(timer))

const rows = computed(() =>
  (result.value?.sections ?? []).map((section) => {
    const ratio = section.vocal_notes ? section.syllables / section.vocal_notes : null
    const fit = ratio === null ? '' : ratio < 0.85 ? 'too few syllables' : ratio > 1.3 ? 'too many syllables' : 'fits'
    const mismatch = section.score_section !== undefined && section.tag.toLowerCase() !== section.score_section.toLowerCase()
    return { ...section, ratio, fit, mismatch }
  })
)
</script>

<template>
  <section v-if="abc" class="lyrics-fit" aria-label="Lyrics against the score">
    <h4>Lyrics and the score's sections</h4>
    <p v-if="failed" class="error">{{ failed }}</p>
    <table v-else-if="rows.length">
      <tr>
        <th>Lyrics</th><th>Score section</th><th>Lines</th><th>Syllables</th><th>Vocal notes</th><th>Fit</th>
      </tr>
      <tr v-for="(row, index) in rows" :key="index" :class="{ mismatch: row.mismatch }">
        <td>[{{ row.tag }}]</td>
        <td>{{ row.score_section ?? '—' }}<span v-if="row.mismatch" class="bad"> ≠</span></td>
        <td>{{ row.lines }}</td>
        <td>{{ row.syllables }}</td>
        <td>{{ row.vocal_notes ?? '—' }}</td>
        <td :class="{ bad: row.fit && row.fit !== 'fits' }">
          {{ row.ratio === null ? '' : `${row.ratio.toFixed(2)} · ${row.fit}` }}
        </td>
      </tr>
    </table>
    <p class="hint">About one syllable per vocal note sings clearly; melismas (one syllable on several notes) are fine.</p>
  </section>
</template>
