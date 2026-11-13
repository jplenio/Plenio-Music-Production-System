<script setup lang="ts">
// The plug-in's settings (for every instance): where the songs live, how ComfyUI is found and started, the chord
// names, the models' licences; and what this is.
import { computed, ref } from 'vue'

import { call } from '../bridge'
import { saveSettings, store } from '../store'
import Icon from './Icon.vue'

const emit = defineEmits<{ close: [] }>()
const port = ref(String(store.settings?.port || ''))
const host = ref(store.settings?.host || '')
const token = ref('')
const other = ref(!!store.settings?.host)

async function saveHost(): Promise<void> {
  await saveSettings({ host: other.value ? host.value.trim() : '' })
  host.value = store.settings?.host || ''
}

async function setOther(on: boolean): Promise<void> {
  other.value = on
  if (!on || host.value.trim()) await saveHost()
}

async function saveToken(): Promise<void> {
  await saveSettings({ token: token.value.trim() })
  token.value = ''
}
const c = computed(() => store.connection)

async function chooseLibrary(): Promise<void> {
  const folder = await call<string | null>('settings.chooseLibrary')
  if (folder) await saveSettings({ library: folder })
}

async function savePort(): Promise<void> {
  const n = Number(port.value.trim() || '0')
  if (Number.isInteger(n) && n >= 0 && n <= 65535) await saveSettings({ port: n })
  port.value = String(store.settings?.port || '')
}

function link(url: string): void {
  void call('ui.openUrl', { url })
}
</script>

<template>
  <div class="overlay" @mousedown.self="emit('close')" @keydown.esc="emit('close')">
    <div class="dialog settings" role="dialog" aria-modal="true">
      <header>
        <h2>Settings</h2>
        <button class="btn ghost icon" title="Close" @click="emit('close')"><Icon name="close" :size="16" /></button>
      </header>
      <div class="body" v-if="store.settings">
        <section>
          <div class="label">Your songs</div>
          <div class="row">
            <div class="text">
              <b>Song library</b>
              <span class="muted path">{{ store.settings.library }}</span>
            </div>
            <button class="btn small" @click="chooseLibrary"><Icon name="folder" :size="13" />Change …</button>
          </div>
          <p class="note muted">Every song keeps its takes, stems and score there; projects find them by the song's id.</p>
        </section>

        <section>
          <div class="label">The studio</div>
          <div class="row">
            <div class="text">
              <b>ComfyUI with Plenio</b>
              <span class="muted">{{ c?.message }}</span>
            </div>
            <span class="pill" :class="c?.state">{{ c?.state === 'connected' ? `port ${c.port}` : c?.state }}</span>
          </div>
          <div class="row">
            <div class="text">
              <b>Port</b>
              <span class="muted">Empty: Plenio looks at 8188, 8000 and the port ComfyUI starts with</span>
            </div>
            <input v-model="port" class="input port" type="text" inputmode="numeric" placeholder="auto" @change="savePort" @keydown.enter="savePort" />
          </div>
          <label class="row toggle-row">
            <div class="text">
              <b>ComfyUI runs on another computer</b>
              <span class="muted">Your studio PC makes the songs, this computer runs the DAW</span>
            </div>
            <span class="toggle">
              <input type="checkbox" :checked="other" @change="setOther(($event.target as HTMLInputElement).checked)" />
              <span class="track" />
            </span>
          </label>
          <template v-if="other">
            <div class="row">
              <div class="text">
                <b>Its name or address</b>
                <span class="muted">As you open its ComfyUI in a browser, e.g. studio-pc or 192.168.1.20. ComfyUI must run there with <code>--listen</code>.</span>
              </div>
              <input v-model="host" class="input host" type="text" spellcheck="false" placeholder="studio-pc" @change="saveHost" @keydown.enter="saveHost" />
            </div>
            <div class="row">
              <div class="text">
                <b>Token</b>
                <span class="muted">
                  {{ store.settings.hasToken ? 'A token is kept in this computer\'s password store.' : 'Make one on the studio PC: ComfyUI › Plenio Setup › API access › Make a token.' }}
                </span>
              </div>
              <input v-model="token" class="input host" type="password" autocomplete="off" :placeholder="store.settings.hasToken ? '••••••••' : 'plenio_…'" @change="saveToken" @keydown.enter="saveToken" />
              <button v-if="store.settings.hasToken" class="btn small" title="Forget the token" @click="saveSettings({ token: '' })">Forget</button>
            </div>
          </template>
          <label v-if="!other" class="row toggle-row">
            <div class="text">
              <b>Start ComfyUI when needed</b>
              <span class="muted">Starts your ComfyUI (as you set it up) when you make a song and it does not run</span>
            </div>
            <span class="toggle">
              <input type="checkbox" :checked="store.settings.startComfyUI" @change="saveSettings({ startComfyUI: ($event.target as HTMLInputElement).checked })" />
              <span class="track" />
            </span>
          </label>
        </section>

        <section>
          <div class="label">Editing</div>
          <label class="row toggle-row">
            <div class="text">
              <b>Flats in chord names</b>
              <span class="muted">B♭ and E♭ rather than A♯ and D♯ when you choose a chord</span>
            </div>
            <span class="toggle">
              <input type="checkbox" :checked="store.settings.flatKeys" @change="saveSettings({ flatKeys: ($event.target as HTMLInputElement).checked })" />
              <span class="track" />
            </span>
          </label>
        </section>

        <section>
          <div class="label">Licences</div>
          <label class="row toggle-row">
            <div class="text">
              <b>I accept the models' licences</b>
              <span class="muted">YuE2 and SheetSage2 are licensed CC BY-NC 4.0: what you make with them is for non-commercial use.</span>
            </div>
            <span class="toggle">
              <input type="checkbox" :checked="store.settings.licenceAccepted" @change="saveSettings({ licenceAccepted: ($event.target as HTMLInputElement).checked })" />
              <span class="track" />
            </span>
          </label>
        </section>

        <section class="about">
          <img src="/plenio-icon.png" alt="" />
          <div class="text">
            <b>Plenio VST3 {{ store.version }}</b>
            <span class="muted">in {{ store.host || 'your DAW' }} · Apache-2.0 · VST is a trademark of Steinberg Media Technologies GmbH</span>
            <span>
              <a href="#" @click.prevent="link('https://github.com/jplenio/Plenio-Music-Production-System')">Plenio on GitHub</a>
            </span>
          </div>
        </section>
      </div>
      <footer>
        <button class="btn primary" @click="emit('close')">Done</button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.settings {
  width: min(600px, calc(100vw - 32px));
}
.body {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--bg-raised);
  border: 1px solid var(--line);
}
.toggle-row {
  cursor: pointer;
}
.text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.text .muted {
  font-size: 12px;
}
.path {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.note {
  margin: 0;
  font-size: 11.5px;
}
.port {
  width: 90px;
  text-align: center;
}
.host {
  width: 190px;
}
code {
  font-size: 11.5px;
}
.pill {
  font-size: 11.5px;
  padding: 3px 9px;
  border-radius: 10px;
  background: #2c2640;
  color: var(--text-dim);
}
.pill.connected {
  background: rgba(79, 209, 165, 0.14);
  color: var(--ok);
}
.about {
  flex-direction: row;
  align-items: center;
  gap: 14px;
  padding-top: 4px;
}
.about img {
  width: 44px;
  height: 44px;
  border-radius: 11px;
}
a {
  color: #c9a8ff;
  font-size: 12.5px;
}
</style>
