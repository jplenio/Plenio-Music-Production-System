<script setup lang="ts">
/**
 * The studio - ComfyUI - from the player (owner's request 2026-10-26: the player runs on its own; ComfyUI is started
 * only to make songs, without opening a workflow): whether it runs, *Start* and *Stop* (only the one the player
 * started), the folder and the arguments it starts with, starting by itself when a song is ordered, stopping after
 * idle minutes - and the end of its log. The admin on the player's own computer only.
 *
 * Starting ComfyUI is the Studio add-on's part. An installation without it (the Comfy Registry package) answers
 * `launcher: false`: the panel then says whether ComfyUI runs and how to get it running, and offers nothing it
 * cannot do.
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import { api, type StudioStatus } from '../api'
import { lookForComfyUI, say } from '../store'
import Icon from './Icon.vue'

/** ComfyUI came up or went: the page's other places that say where ComfyUI is look again. */
const emit = defineEmits<{ running: [running: boolean] }>()

const studio = ref<StudioStatus | null>(null)
const busy = ref(false)
const error = ref('')
const root = ref('')
const args = ref('')
const port = ref(8188)
const showLog = ref(false)
/** This installation starts ComfyUI (an older server does not say: it does). */
const launches = computed(() => studio.value?.launcher !== false)
let timer: number | undefined

async function read(): Promise<void> {
  try {
    const answer = await api.studio()
    if (!studio.value) {
      root.value = answer.chosen_root ?? ''
      args.value = answer.args ?? ''
      port.value = answer.port ?? 8188
    }
    const was = studio.value?.running
    studio.value = answer
    if (was !== undefined && was !== answer.running) {
      void lookForComfyUI()
      emit('running', answer.running)
    }
  } catch {
    studio.value = null
  }
}
async function act(work: () => Promise<StudioStatus>, done: string): Promise<void> {
  busy.value = true
  error.value = ''
  try {
    studio.value = await work()
    if (done) say(done, 3000)
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    busy.value = false
  }
}
function save(): void {
  void act(() => api.studioSettings({ root: root.value, args: args.value, port: port.value }), 'The studio’s settings are kept')
}
function setAuto(event: Event): void {
  void act(() => api.studioSettings({ auto: (event.target as HTMLInputElement).checked }), '')
}
function setIdle(event: Event): void {
  void act(() => api.studioSettings({ idle_stop_min: Number((event.target as HTMLSelectElement).value) }), '')
}
onMounted(() => {
  void read()
  timer = window.setInterval(() => void read(), 3000)
})
onBeforeUnmount(() => window.clearInterval(timer))
</script>

<template>
  <section v-if="studio" id="studio" class="block studio">
    <h3><Icon name="studio" /> The studio (ComfyUI)</h3>
    <p v-if="launches" class="lead">
      The player plays without ComfyUI. To <b>make songs</b> - <i>Make a song</i>, the party's songs, a new take - ComfyUI must run on this computer: start it here, and it
      runs in the background, without a window and without a workflow to open.
    </p>
    <p v-else class="lead">
      The player plays without ComfyUI. To <b>make songs</b> - <i>Make a song</i>, the party's songs, a new take - ComfyUI must run on this computer. The player finds it by
      itself once it runs.
    </p>
    <p class="status" :class="{ ok: studio.running, busy: studio.starting }">
      <i />
      {{ studio.running ? `ComfyUI is running at ${studio.url}${studio.own ? ' - started by the player' : ''}` : studio.starting ? 'ComfyUI is starting …' : 'ComfyUI is not running' }}
    </p>
    <div class="row-buttons">
      <button v-if="launches && !studio.running && !studio.starting" class="primary" :disabled="busy || !studio.can_start" @click="act(() => api.studioStart(), 'ComfyUI is starting')"><Icon name="power" :size="16" /> Start the studio</button>
      <button v-if="studio.own" class="ghost" :disabled="busy" @click="act(() => api.studioStop(), 'ComfyUI was stopped')"><Icon name="close" :size="16" /> Stop it</button>
      <a v-if="studio.running" class="ghost" :href="studio.url" target="_blank" rel="noopener"><Icon name="external" :size="16" /> Open ComfyUI</a>
    </div>
    <p v-if="launches && !studio.can_start" class="hint warn">{{ studio.why }}</p>
    <div v-if="!launches" class="without">
      <p v-if="!studio.running" class="hint"><b>Start ComfyUI the way you usually do</b> - its shortcut, <code>run_nvidia_gpu.bat</code>, ComfyUI Desktop, or <code>python main.py</code> - and come back: this line turns green within a few seconds.</p>
      <p class="hint">
        Plenio installed through the ComfyUI Manager does not start programs, so there is no <i>Start the studio</i> button here. Plenio from GitHub
        (<code>git clone</code> or the release zip) starts ComfyUI for you - <a href="https://github.com/jplenio/Plenio-Music-Production-System/blob/main/docs/user/getting-started.md#two-ways-to-install" target="_blank" rel="noopener">the two ways to install</a>.
      </p>
    </div>
    <p v-if="error || studio.error" class="error">{{ error || studio.error }}</p>

    <div v-if="launches" class="options">
      <label class="check"><input type="checkbox" :checked="studio.auto" :disabled="busy" @change="setAuto" /> Start it by itself when a song is ordered</label>
      <label class="check">
        Stop the ComfyUI the player started after
        <select :value="studio.idle_stop_min" :disabled="busy" @change="setIdle">
          <option :value="0">never</option>
          <option :value="15">15 minutes</option>
          <option :value="30">30 minutes</option>
          <option :value="60">an hour</option>
          <option :value="180">three hours</option>
        </select>
        without a song (frees the graphics card)
      </label>
    </div>

    <details v-if="launches" class="how">
      <summary>How it starts ComfyUI</summary>
      <label class="field">
        ComfyUI's folder
        <input v-model="root" :placeholder="studio.installed_root || 'the folder with ComfyUI’s main.py'" />
      </label>
      <label class="field">
        Arguments for ComfyUI
        <input v-model="args" :placeholder="studio.args_from === 'last start' ? 'empty: as ComfyUI was last started' : 'e.g. --models-directory D:/AI/models'" />
      </label>
      <p v-if="!args.trim() && studio.args_from === 'last start'" class="hint ok-hint">
        <Icon name="check" :size="14" /> Empty, so the player starts ComfyUI the way it was last started<span v-if="studio.last_start_at"> ({{ new Date(studio.last_start_at * 1000).toLocaleString() }})</span>:
        <code>{{ studio.args_used || 'no arguments' }}</code> - with your models folder and options.
      </p>
      <p v-else-if="!args.trim()" class="hint">
        Empty, and ComfyUI has not been started with Plenio here yet: start it once the way you usually do (its models folder included), and the player
        starts it the same way from then on. Or enter the arguments here.
      </p>
      <label class="field short">
        Port
        <input v-model.number="port" type="number" min="1024" max="65535" />
      </label>
      <div class="row-buttons"><button class="ghost small" :disabled="busy" @click="save"><Icon name="check" :size="14" /> Keep these settings</button></div>
      <p v-if="studio.command" class="hint"><code>{{ studio.command }}</code></p>
      <p class="hint">
        Empty folder: the ComfyUI Plenio is installed in, else the one last started with Plenio. The Python is the one it last ran on, or that ComfyUI's own
        (the portable build's <code>python_embeded</code>, a <code>.venv</code>). ComfyUI stays on this computer: <code>--listen</code> is not passed - the network comes in
        by <i>In your network</i>. Its messages go to <code>comfyui.log</code> in the player's state folder.
      </p>
      <button v-if="studio.log?.length" class="link" @click="showLog = !showLog">{{ showLog ? 'Hide' : 'Show' }} the end of its log</button>
      <pre v-if="showLog && studio.log?.length" class="log">{{ studio.log.join('\n') }}</pre>
    </details>
  </section>
</template>

<style scoped>
.status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 10px 0;
  font-weight: 600;
}
.status i {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #e4573d;
  flex: none;
}
.status.ok i {
  background: #4fbf7f;
  box-shadow: 0 0 10px #4fbf7f;
}
.status.busy i {
  background: #e0a83c;
  animation: pulse 1.2s ease-in-out infinite;
}
.row-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.options {
  display: grid;
  gap: 8px;
  margin: 14px 0 6px;
}
.check {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}
.check select {
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 0 8px;
}
.how {
  margin-top: 10px;
}
.how summary {
  cursor: pointer;
  color: var(--accent);
  font-size: 13px;
  margin-bottom: 10px;
}
.field {
  display: grid;
  gap: 4px;
  margin-bottom: 10px;
  font-size: 13px;
  color: var(--muted);
}
.field input {
  height: 38px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(10, 8, 18, 0.55);
  color: #fff;
  font: 14px var(--mono);
}
.field.short input {
  width: 120px;
}
.hint {
  color: var(--muted);
  font-size: 12px;
  line-height: 1.6;
}
.hint.warn {
  color: #ffcf8a;
}
.hint.ok-hint code {
  word-break: break-all;
}
.error {
  color: #ff9a9a;
}
.link {
  border: 0;
  background: none;
  color: var(--accent);
  cursor: pointer;
  padding: 0;
  font: 13px var(--font);
}
.log {
  max-height: 240px;
  overflow: auto;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.4);
  font: 11.5px/1.5 var(--mono);
  white-space: pre-wrap;
  word-break: break-all;
}
@keyframes pulse {
  50% {
    opacity: 0.35;
  }
}
</style>
