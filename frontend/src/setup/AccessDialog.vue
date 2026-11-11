<script setup lang="ts">
/**
 * A file whose makers ask for an OK on Hugging Face (PD 5.5): open the model's page and accept, give this
 * computer a token that may read it, check and download. Each step is checked with ``/plenio/setup/check``;
 * the token goes to Hugging Face's own token store and is never shown again.
 */
import { computed, onMounted, ref } from 'vue'

import { type Fetcher, PlenioApiError } from '../api/client'
import { setupApi } from './api'
import { type AccessCheck, accessSteps } from './model'

const props = defineProps<{ fetcher: Fetcher; variant: string }>()
const emit = defineEmits<{ close: []; ready: [variant: string] }>()

const check = ref<AccessCheck | null>(null)
const token = ref('')
const busy = ref(false)
const error = ref<string | null>(null)
const steps = computed(() => accessSteps(check.value))

function message(reason: unknown): string {
  if (reason instanceof PlenioApiError) return reason.hint ? `${reason.message} ${reason.hint}` : reason.message
  return reason instanceof Error ? reason.message : String(reason)
}

function mark(done: boolean | null): string {
  return done === true ? '✓' : done === false ? '✕' : '○'
}

async function probe(): Promise<void> {
  busy.value = true
  try {
    check.value = await setupApi.check(props.fetcher, props.variant)
    error.value = null
    if (check.value.step === 'ready') emit('ready', props.variant)
  } catch (reason) {
    error.value = message(reason)
  } finally {
    busy.value = false
  }
}

async function saveToken(): Promise<void> {
  busy.value = true
  try {
    await setupApi.saveToken(props.fetcher, token.value.trim())
    token.value = ''
    error.value = null
  } catch (reason) {
    error.value = message(reason)
  } finally {
    busy.value = false
  }
  await probe()
}

onMounted(() => void probe())
</script>

<template>
  <div class="plenio-access" role="dialog" aria-label="This model needs your OK on Hugging Face">
    <header>
      <strong>This model needs your OK on Hugging Face</strong>
      <button class="close" aria-label="Close" @click="emit('close')">×</button>
    </header>
    <p v-if="check && check.step !== 'ready'" class="hint">{{ check.message }}</p>
    <ol>
      <li>
        <span class="mark">{{ mark(steps.accept) }}</span>
        Open the model's page and accept its terms.
        <a v-if="check?.page" :href="check.page" target="_blank" rel="noopener">Open the page</a>
        <p class="hint">You need a free Hugging Face account. The makers see your user name and e-mail.</p>
      </li>
      <li>
        <span class="mark">{{ mark(steps.token) }}</span>
        Give this computer a token that may read it.
        <a v-if="check?.token_page" :href="check.token_page" target="_blank" rel="noopener">Open the token page</a>
        <p class="hint">
          Create a token of type "Read" (or fine-grained with "Read access to contents of all public gated repos you
          can access"), then paste it here:
        </p>
        <form @submit.prevent="saveToken">
          <input v-model="token" type="password" autocomplete="off" placeholder="hf_…" aria-label="Hugging Face token" />
          <button type="submit" :disabled="busy || !token.trim()">Save</button>
        </form>
      </li>
      <li>
        <span class="mark">{{ steps.pending ? '…' : '○' }}</span>
        <button class="primary" :disabled="busy" @click="probe">Check and download</button>
        <p v-if="steps.pending" class="hint">Your request is with the model's makers. This can take days.</p>
      </li>
    </ol>
    <p v-if="error" class="error" role="alert">{{ error }}</p>
  </div>
</template>
