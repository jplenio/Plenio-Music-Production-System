<script setup lang="ts">
// Plenio ARA's window: the clips of the project that are Plenio takes, and which take plays in each. Another take of
// the song plays in the same clip at the same places (every take's file starts at the project's start).
import { onBeforeUnmount, onMounted } from 'vue'

import { call } from '../bridge'
import { store, toast } from '../store'
import { formatTime } from '../timeline'
import type { AraState } from '../types'
import Icon from './Icon.vue'

let timer = 0

async function refresh(): Promise<void> {
  try {
    store.ara = await call<AraState>('ara.state')
  } catch {
    /* the next turn */
  }
}

async function play(clip: string, number: number): Promise<void> {
  try {
    store.ara = await call<AraState>('ara.playTake', { id: clip, number })
  } catch (error) {
    toast(error instanceof Error ? error.message : String(error), true)
  }
}

onMounted(() => {
  timer = window.setInterval(refresh, 1500) // clips come and go with the host's edits
})
onBeforeUnmount(() => window.clearInterval(timer))
</script>

<template>
  <main class="ara">
    <header>
      <img src="/plenio-icon.png" alt="" class="logo" />
      <h1>Plenio ARA</h1>
    </header>

    <section v-if="store.ara && store.ara.clips.length" class="clips">
      <article v-for="clip in store.ara.clips" :key="clip.id" class="clip">
        <div class="head">
          <Icon name="wave" :size="18" />
          <div class="what">
            <b>{{ clip.song }}</b>
            <span class="muted">{{ clip.name.split(/[\\/]/).pop() }}</span>
          </div>
          <span v-if="clip.stem" class="stem">{{ clip.stem }}</span>
        </div>
        <div class="label">Plays in this clip</div>
        <div class="takes">
          <button
            v-for="t in clip.takes"
            :key="t.number"
            class="take"
            :class="{ on: clip.playing === t.number, waiting: clip.pending === t.number }"
            :disabled="clip.pending !== undefined"
            @click="play(clip.id, t.number)"
          >
            <b>Take {{ t.number }}</b>
            <span class="muted">
              {{ formatTime(t.seconds) }}<template v-if="t.stars !== undefined"> · <Icon name="star" :size="10" class="star" />{{ t.stars }}</template>
            </span>
            <span v-if="t.number === clip.own" class="own">the clip's own</span>
            <span v-if="clip.pending === t.number" class="spinner" />
          </button>
        </div>
        <p v-if="clip.playing !== clip.own" class="note">
          Take {{ clip.playing }} plays at the places of take {{ clip.own }}. The project's tempo map stays take
          {{ clip.own }}'s: its bars can drift a little against take {{ clip.playing }}.
        </p>
      </article>
    </section>

    <section v-else class="empty">
      <Icon name="music" :size="28" />
      <h2>No Plenio take here yet</h2>
      <p class="muted">
        Drag a take from Plenio's DAW tab into the project and put Plenio ARA on that clip. It knows the take, hands your
        DAW its tempo, bars, key, notes and chords, and plays any other take of the song in the same clip.
      </p>
      <p v-if="store.ara && !store.ara.bound" class="muted small">Plenio ARA works on clips: open it from a clip, not as an insert.</p>
    </section>
  </main>
</template>

<style scoped>
.ara {
  flex: 1;
  overflow: auto;
  padding: 18px 22px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
header {
  display: flex;
  align-items: center;
  gap: 10px;
}
.logo {
  width: 28px;
  height: 28px;
  border-radius: 8px;
}
h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 650;
}
.clips {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.clip {
  padding: 14px 16px;
  border-radius: 12px;
  background: linear-gradient(180deg, #1d1929, #171421);
  border: 1px solid var(--line-strong);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.clip .head {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #c9a8ff;
}
.what {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  color: var(--text);
}
.what .muted {
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.stem {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  background: var(--accent-soft);
  color: var(--text);
  text-transform: capitalize;
}
.takes {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.take {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  min-width: 118px;
  padding: 9px 12px;
  border-radius: 10px;
  border: 1px solid var(--line-strong);
  background: var(--bg-sunken);
  cursor: pointer;
  text-align: left;
}
.take:hover:not(:disabled) {
  border-color: #5a4b85;
}
.take.on {
  border-color: var(--accent);
  background: var(--accent-soft);
  box-shadow: inset 3px 0 0 var(--accent);
}
.take:disabled {
  cursor: default;
}
.take .muted {
  font-size: 11.5px;
}
.star {
  color: var(--amber);
  vertical-align: -1px;
}
.own {
  font-size: 10.5px;
  color: var(--text-faint);
}
.spinner {
  position: absolute;
  top: 9px;
  right: 9px;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  border: 2px solid rgba(176, 92, 255, 0.3);
  border-top-color: var(--accent);
  animation: spin 0.8s linear infinite;
}
.note {
  margin: 0;
  font-size: 12px;
  color: #f3d7a6;
}
.empty {
  margin: auto;
  max-width: 460px;
  text-align: center;
  color: #c9a8ff;
}
.empty h2 {
  color: var(--text);
  font-family: var(--font-display);
  font-size: 18px;
  margin: 10px 0 6px;
}
.empty p {
  font-size: 13px;
  line-height: 1.55;
  margin: 0 0 8px;
}
.small {
  font-size: 12px !important;
}
</style>
