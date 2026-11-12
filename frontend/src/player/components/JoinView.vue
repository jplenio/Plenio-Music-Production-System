<script setup lang="ts">
/**
 * An invitation opened (People & access, phase 6.1): the link of the host's QR code (``#/join/<code>``). It says
 * whom it invites and as what, takes a password or a four-digit PIN, and logs this device in as the new user. A
 * code is used once and holds 15 minutes.
 */
import { computed, onMounted, ref } from 'vue'

import { acceptInvite, checkInvite, type Group } from '../account'
import { roleOfGroup } from '../people'

const props = defineProps<{ code: string }>()
const emit = defineEmits<{ done: []; away: [] }>()

const invited = ref<{ name: string; group: Group } | null>(null)
const problem = ref('')
const secret = ref('')
const again = ref('')
const busy = ref(false)
const pin = computed(() => /^\d{4}$/.test(secret.value))
const ready = computed(() => secret.value.length >= 4 && secret.value === again.value && !busy.value)

onMounted(async () => {
  try {
    invited.value = await checkInvite(props.code)
  } catch (e) {
    problem.value = e instanceof Error ? e.message : String(e)
  }
})

async function join(): Promise<void> {
  if (!ready.value) return
  busy.value = true
  problem.value = ''
  try {
    await acceptInvite(props.code, secret.value)
    history.replaceState(null, '', '#/')
    emit('done')
  } catch (e) {
    problem.value = e instanceof Error ? e.message : String(e)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="join">
    <form class="card" @submit.prevent="join">
      <p class="brand"><span class="logo"><i /><i /><i /><i /></span> Plenio <b>Player</b></p>
      <template v-if="invited">
        <h1>Welcome, {{ invited.name }}</h1>
        <p class="lead">You are invited as <b>{{ roleOfGroup(invited.group) }}</b>. Choose a password - or a four-digit PIN - for this player. Your playlists, likes and plays are then the same on every device you log in on.</p>
        <label class="field">Password or PIN
          <input v-model="secret" type="password" autocomplete="new-password" :inputmode="/^\d*$/.test(secret) ? 'numeric' : 'text'" minlength="4" required autofocus />
        </label>
        <label class="field">Once more
          <input v-model="again" type="password" autocomplete="new-password" :inputmode="/^\d*$/.test(again) ? 'numeric' : 'text'" minlength="4" required />
        </label>
        <p v-if="secret && secret.length < 4" class="hint">At least four characters.</p>
        <p v-else-if="again && secret !== again" class="hint">The two are not the same yet.</p>
        <p v-else-if="pin" class="hint">A PIN: four digits, easy to type on a phone.</p>
        <button class="primary" type="submit" :disabled="!ready">Join</button>
      </template>
      <template v-else-if="problem">
        <h1>This invitation does not work</h1>
        <p class="lead">{{ problem }}</p>
      </template>
      <p v-else class="lead">Reading the invitation …</p>
      <p v-if="invited && problem" class="error">{{ problem }}</p>
      <button type="button" class="link" @click="emit('away')">Not now - continue without joining</button>
    </form>
  </div>
</template>

<style scoped>
.join {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: grid;
  place-items: center;
  padding: 16px;
  background: var(--bg, #0d0b14);
  overflow: auto;
}
.card {
  width: min(440px, 100%);
  display: grid;
  gap: 14px;
  padding: 28px;
  border-radius: 20px;
  background: var(--panel, #1a1726);
  border: 1px solid var(--line, #ffffff1a);
}
.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  justify-content: center;
  color: var(--muted, #b9b3c9);
}
h1 {
  margin: 0;
  text-align: center;
  font-size: 1.6rem;
}
.lead {
  margin: 0;
  color: var(--muted, #b9b3c9);
  line-height: 1.5;
}
.field {
  display: grid;
  gap: 6px;
  font-weight: 600;
}
.field input {
  font-size: 1.1rem;
  padding: 10px 12px;
}
.hint {
  margin: 0;
  color: var(--muted, #b9b3c9);
  font-size: 0.9rem;
}
.error {
  margin: 0;
  color: #ff8a7a;
}
.primary {
  padding: 12px;
  font-size: 1.05rem;
}
.link {
  background: none;
  border: 0;
  color: var(--muted, #b9b3c9);
  text-decoration: underline;
  cursor: pointer;
}
</style>
