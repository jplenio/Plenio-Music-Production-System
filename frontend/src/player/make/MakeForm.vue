<script setup lang="ts">
/**
 * The song form (owner's request 2026-10-25, docs/design/party-songs.md §4): a new song, or a cover of a recording
 * of one's own; a style - a vibe (a template of that group, another at every click), any template, or *Surprise
 * me* - that fills every field; what the song is about; the fields as lists of every value the templates have, each
 * with a value of one's own; and **Generate Song**. The player's page and the party guests' page use it alike.
 *
 * Made again from a song (owner's request 2026-10-26): a new take of it (its title, style and lyrics to change), a
 * new song like it (the form filled from its brief) or a cover of it - and for the admin and the player in your
 * network every setting of the studio besides (StudioPanel).
 */
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'

import Icon from '../components/Icon.vue'
import ComboField from './ComboField.vue'
import StudioPanel from './StudioPanel.vue'
import type { MakeClient } from './client'
import { applyPreset, BUILT_IN_PRESETS, formatOf, presetMatters, presetOf, type MakePreset } from './presets'
import { AGAIN_TEXT, LABELS, LIST_FIELDS, LYRICS_IDEA, OWN_LYRICS, VOCALS_TEXT, againStudio, applies, clock, fieldsOf, fromTemplate, grouped, missing, optionsFor, ownAllowed, requestOf, studioStart, summary, surprise, timeOfDay, untilText } from './form'
import type { Again, Draft, FormData, Kind, MakeJob, MakeStatus, Remake, SongDocuments, StudioSpec, StudioValues, StyleTemplate } from './form'

const props = defineProps<{
  client: MakeClient
  form: FormData
  status: MakeStatus | null
  editing?: MakeJob | null
  /** Made again from a song: what it starts from. */
  remake?: Remake | null
  /** The cover of a song of the library (``null``: none to show). */
  coverOf?: (songId: string) => string | null
  /** The presets of one's own (the player keeps them with the settings; the guests' page has none). */
  presets?: MakePreset[]
}>()
const emit = defineEmits<{ made: [job: MakeJob, edited: boolean]; cancel: []; savePreset: [preset: MakePreset]; deletePreset: [id: string] }>()

const AGAIN: Again[] = ['take', 'song', 'cover']
const AGAIN_ICON: Record<Again, 'refresh' | 'sparkles' | 'mic'> = { take: 'refresh', song: 'sparkles', cover: 'mic' }
const NO_DOCUMENTS: SongDocuments = { title: '', style: '', lyrics: '' }
const draft = reactive<Draft>({ kind: 'song', fields: {}, source: null, again: null, base: null, documents: { ...NO_DOCUMENTS }, studio: { fields: {}, release: {} } })
const lit = ref<Set<string>>(new Set())
const query = ref('')
const sending = ref(false)
const uploading = ref(false)
const error = ref('')
const listen = ref('')
const dragging = ref(false)
const lastGroup = ref('')
/** Counts the templates applied (the fields show the list again). */
const epoch = ref(0)
let litTimer = 0

const templates = computed(() => props.form.templates)
const groups = computed(() => grouped(templates.value, query.value))
const vibes = computed(() => [...new Set(templates.value.map((t) => t.group))])
const chosen = computed<StyleTemplate | null>(() => templates.value.find((t) => t.id === draft.fields.template) ?? null)
const shownFields = computed(() => LIST_FIELDS.filter((name) => applies(name, draft)))
const lacking = computed(() => missing(draft))
const editingNow = computed(() => !!props.editing)
const isTake = computed(() => draft.again === 'take')
/** The song's lyrics are one's own (1.5.0): sung as written, the writer writes none. */
const ownLyrics = computed(() => draft.fields.lyrics_from === OWN_LYRICS)
/** The lyrics from an idea or one's own: switching to one's own clears the template's idea for them. */
function setLyricsFrom(choice: string): void {
  if (draft.fields.lyrics_from === choice) return
  const idea = templates.value.find((t) => t.id === draft.fields.template)?.fields.lyrics ?? ''
  if (choice === OWN_LYRICS && draft.fields.lyrics?.trim() === idea.trim()) draft.fields.lyrics = ''
  if (choice === LYRICS_IDEA && !draft.fields.lyrics?.trim()) draft.fields.lyrics = idea
  draft.fields.lyrics_from = choice
}
/** The whole studio: the admin, the player in your network - when ComfyUI describes its templates. */
const full = computed(() => !!props.status?.me.full)
const spec = computed<StudioSpec | null>(() => (full.value ? ((draft.kind === 'cover' ? props.form.studio?.cover : props.form.studio?.song) ?? null) : null))
const original = computed<SongDocuments | null>(() => props.remake?.documents ?? null)
const changedLyrics = computed(() => isTake.value && !!original.value && (draft.documents?.lyrics ?? '').trim() !== original.value.lyrics.trim())
const changedDocuments = computed(() => isTake.value && !!original.value && (['title', 'style', 'lyrics'] as const).some((k) => (draft.documents?.[k] ?? '').trim() !== original.value?.[k].trim()))
const baseCover = computed(() => (draft.base?.id && props.coverOf ? props.coverOf(draft.base.id) : null))
const docLimit = (name: keyof SongDocuments): number => props.form.limits.documents?.[name] ?? (name === 'lyrics' ? 20000 : 2000)
const ahead = computed(() => props.status?.line.waiting ?? 0)
const free = computed(() => props.status?.line.free ?? 0)
const now = ref(Date.now() / 1000)
const clockTimer = window.setInterval(() => (now.value = Date.now() / 1000), 15000)

// --- presets, and several takes or songs at once (owner's request 2026-10-26) ----------------------------------
/** How many: takes of one song, or songs of this form (the whole studio). */
const count = ref(1)
const several = ref<'takes' | 'songs'>('takes')
const chosenPreset = ref('')
const naming = ref(false)
const presetName = ref('')
const presets = computed(() => [...BUILT_IN_PRESETS, ...(props.presets ?? [])].filter((p) => !props.form.templates.length || presetMatters(p, draft, props.form, full.value)))
function usePreset(preset: MakePreset): void {
  const applied = applyPreset(preset, draft, props.form, spec.value)
  if (full.value) {
    count.value = applied.takes
    if (applied.takes > 1) several.value = 'takes'
  }
  chosenPreset.value = preset.id
  epoch.value += 1
  light(applied.set.filter((name) => !name.includes('.')))
}
function savePreset(): void {
  emit('savePreset', presetOf(presetName.value, draft, several.value === 'takes' ? count.value : 1))
  naming.value = false
  presetName.value = ''
}
/** The request's count: takes of one song, or songs of this form - only the whole studio orders several. */
function counts(): { takes?: number; copies?: number } {
  if (!full.value || count.value <= 1 || editingNow.value) return {}
  if (isTake.value || several.value === 'takes') return { takes: count.value }
  return { copies: count.value }
}

function light(names: string[]): void {
  lit.value = new Set(names)
  window.clearTimeout(litTimer)
  litTimer = window.setTimeout(() => (lit.value = new Set()), 1400)
}

/** Fill every field from a template (``null``: none - the fields keep what they have). */
function useTemplate(template: StyleTemplate | null): void {
  if (!template) {
    draft.fields.template = 'none'
    return
  }
  const filled = fromTemplate(template, draft.kind, props.form, draft.fields)
  Object.assign(draft.fields, filled)
  // a preset chosen before keeps how long the song is and how it is sung (Party - fast stays about 1:30)
  const preset = presets.value.find((p) => p.id === chosenPreset.value)
  const format = preset ? formatOf(preset) : null
  if (format) applyPreset(format, draft, props.form, null)
  epoch.value += 1
  light(Object.keys(filled).filter((k) => filled[k]))
}
function pick(id: string): void {
  useTemplate(templates.value.find((t) => t.id === id) ?? null)
}
/** A vibe: a template of that group - one with singing first for a song - and another one at the next click. */
function vibe(group: string): void {
  const all = templates.value.filter((t) => t.group === group)
  const sung = all.filter((t) => t.fields.vocals !== 'instrumental')
  const pool = (draft.kind === 'song' && sung.length ? sung : all).filter((t) => t.id !== draft.fields.template)
  const found = pool.length ? pool[Math.floor(Math.random() * pool.length)] : all[0]
  lastGroup.value = group
  useTemplate(found ?? null)
}
function surpriseMe(): void {
  const found = surprise(templates.value, draft.kind)
  lastGroup.value = found?.group ?? ''
  useTemplate(found)
}

function setKind(kind: Kind): void {
  if (draft.kind === kind) return
  draft.kind = kind
  if (kind === 'cover') draft.fields.vocals = draft.fields.vocals === 'instrumental' ? 'instrumental' : 'original lyrics'
  else {
    draft.fields.vocals = draft.fields.vocals === 'instrumental' ? 'instrumental' : 'sung'
    draft.fields.length = draft.fields.length || props.form.song.defaults.length || props.form.song.choices.length[0]
  }
  studioFor(kind)
}

/** The whole studio's values from its start: the template's, the party's - and a song's own made again. */
function studioFor(kind: Kind, song: StudioValues | null = null): void {
  const found = full.value ? (kind === 'cover' ? props.form.studio?.cover : props.form.studio?.song) : null
  draft.studio = found ? studioStart(found, props.form.studio?.defaults, song) : { fields: {}, release: {} }
}

/** Make the song again as a new take, a new song like it, or a cover of it. */
function setAgain(mode: Again): void {
  const remake = props.remake
  if (!remake || !remake.can[mode]) return
  error.value = ''
  draft.again = mode
  draft.base = remake.song
  draft.documents = { ...remake.documents }
  if (mode === 'take') {
    draft.kind = remake.kind
    draft.fields = { ...remake.fields }
    draft.source = null
  } else if (mode === 'song') {
    draft.kind = 'song'
    draft.fields = fieldsOf(remake, 'song', props.form)
    draft.source = null
  } else {
    draft.kind = 'cover'
    draft.fields = fieldsOf(remake, 'cover', props.form)
    draft.source = { id: '', name: '', title: remake.song.title, seconds: remake.song.seconds }
  }
  studioFor(draft.kind, againStudio(mode, remake))
  epoch.value += 1
}

function start(): void {
  error.value = ''
  const job = props.editing
  if (job?.fields) {
    draft.kind = job.kind
    draft.fields = { ...job.fields }
    draft.source = job.source ?? null
    draft.again = job.again ?? null
    draft.base = job.from ? { id: job.from.song, title: job.from.title, seconds: job.from.seconds, genre: '', cover: false, other: false, model: '', kind: job.kind } : null
    draft.documents = { ...(props.remake?.documents ?? NO_DOCUMENTS), ...(job.documents ?? {}) }
    studioFor(job.kind, job.studio ?? null)
    return
  }
  if (props.remake?.start) {
    setAgain(props.remake.start)
    return
  }
  draft.again = null
  draft.base = null
  draft.documents = { ...NO_DOCUMENTS }
  draft.kind = draft.kind === 'cover' && props.form.covers ? 'cover' : 'song'
  draft.source = null
  draft.fields = fromTemplate(null, draft.kind, props.form)
  studioFor(draft.kind)
}
watch(() => [props.editing?.id, props.remake?.song.id, full.value, !!props.form.studio?.song], start, { immediate: true })
function resetDocuments(): void {
  if (original.value) draft.documents = { ...original.value }
}

const ACCEPT = 'audio/*,.mp3,.flac,.wav,.ogg,.m4a,.opus,.aac,.aif,.aiff'
async function addFile(file: File | undefined | null): Promise<void> {
  if (!file) return
  error.value = ''
  if (file.size > props.form.limits.source_mb * 2 ** 20) {
    error.value = `The recording is too large - ${props.form.limits.source_mb} MB at most.`
    return
  }
  uploading.value = true
  try {
    draft.source = await props.client.source(file)
    if (listen.value) URL.revokeObjectURL(listen.value)
    listen.value = URL.createObjectURL(file)
    setKind('cover')
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    uploading.value = false
  }
}
function dropped(event: DragEvent): void {
  dragging.value = false
  void addFile(event.dataTransfer?.files?.[0])
}
function dropSource(): void {
  draft.source = null
  if (listen.value) URL.revokeObjectURL(listen.value)
  listen.value = ''
}

async function generate(): Promise<void> {
  if (sending.value || lacking.value.length) return
  sending.value = true
  error.value = ''
  try {
    const body = { ...requestOf(draft, spec.value, original.value), ...counts() }
    const job = props.editing ? await props.client.update(props.editing.id, body) : await props.client.create(body)
    emit('made', job, !!props.editing)
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    sending.value = false
  }
}

const seconds = (s: number): string => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`
const describe = (name: string) => (name === 'vocals' ? (value: string) => VOCALS_TEXT[value] ?? value : undefined)

onBeforeUnmount(() => {
  window.clearInterval(clockTimer)
  window.clearTimeout(litTimer)
  if (listen.value) URL.revokeObjectURL(listen.value)
})
</script>

<template>
  <form class="maker" @submit.prevent="generate">
    <section v-if="remake || draft.again" class="from">
      <div class="song">
        <span class="art"><img v-if="baseCover" :src="baseCover" alt="" /><Icon v-else name="music" :size="22" /></span>
        <span class="what">
          <small>{{ editingNow ? 'Made again from' : 'Again, from' }}</small>
          <b>{{ draft.base?.title || remake?.song.title }}</b>
          <em v-if="remake">{{ [remake.song.genre, remake.song.seconds ? clock(remake.song.seconds) : '', remake.song.other ? 'other music' : remake.song.model].filter(Boolean).join(' · ') }}</em>
        </span>
      </div>
      <div v-if="remake && !editingNow" class="kinds again" role="radiogroup" aria-label="What to make of it">
        <button
          v-for="mode in AGAIN"
          :key="mode"
          type="button"
          class="kind"
          :class="{ on: draft.again === mode, off: !remake.can[mode] }"
          role="radio"
          :aria-checked="draft.again === mode"
          :disabled="!remake.can[mode]"
          :title="remake.can[mode] ? AGAIN_TEXT[mode].text : `Not for this song: ${remake.why[mode]}`"
          @click="setAgain(mode)"
        >
          <span class="badge"><Icon :name="AGAIN_ICON[mode]" :size="22" /></span>
          <span><b>{{ AGAIN_TEXT[mode].title }}</b><small>{{ remake.can[mode] ? AGAIN_TEXT[mode].text : `Not for this song: ${remake.why[mode]}` }}</small></span>
        </button>
      </div>
    </section>

    <section v-if="isTake && draft.documents" class="step take">
      <h3><i>1</i> The song <small>change what you like - everything else stays as it is</small></h3>
      <label class="doc">
        <span>Title</span>
        <input v-model="draft.documents.title" :maxlength="docLimit('title')" />
      </label>
      <label class="doc">
        <span>Style <small>what the music model is told: genre, instruments, voice</small></span>
        <textarea v-model="draft.documents.style" rows="2" :maxlength="docLimit('style')" />
      </label>
      <label v-if="draft.kind === 'song'" class="doc">
        <span>Lyrics <small v-if="changedLyrics" class="new">new words - the notes are made anew for them</small></span>
        <textarea v-model="draft.documents.lyrics" rows="9" :maxlength="docLimit('lyrics')" />
      </label>
      <p v-else class="note">A cover’s words follow the original’s melody - they stay as they are.</p>
      <button v-if="changedDocuments" type="button" class="link" @click="resetDocuments">Back to the song as it is</button>
    </section>

    <div v-if="!(remake || draft.again)" class="kinds" role="radiogroup" aria-label="What to make">
      <button type="button" class="kind" :class="{ on: draft.kind === 'song' }" role="radio" :aria-checked="draft.kind === 'song'" @click="setKind('song')">
        <span class="badge"><Icon name="music" :size="22" /></span>
        <span><b>A new song</b><small>Words and music, made for you</small></span>
      </button>
      <button v-if="form.covers || editingNow" type="button" class="kind" :class="{ on: draft.kind === 'cover' }" role="radio" :aria-checked="draft.kind === 'cover'" @click="setKind('cover')">
        <span class="badge"><Icon name="mic" :size="22" /></span>
        <span><b>A cover</b><small>Your song, in another style</small></span>
      </button>
    </div>

    <section v-if="!editingNow && presets.length" class="presets" aria-label="Presets">
      <span class="label"><Icon name="sliders" :size="14" /> Presets</span>
      <div class="row">
        <button v-for="p in presets" :key="p.id" type="button" class="preset" :class="{ on: chosenPreset === p.id, mine: !p.builtIn }" :title="p.text || `Your preset “${p.name}”`" @click="usePreset(p)">
          <Icon :name="p.icon" :size="15" /> {{ p.name }}
          <span v-if="!p.builtIn" class="x" title="Forget this preset" @click.stop="emit('deletePreset', p.id)"><Icon name="close" :size="12" /></span>
        </button>
        <button v-if="props.presets && !naming" type="button" class="preset add" title="Keep every setting of the form under a name" @click="naming = true"><Icon name="plus" :size="15" /> Save as preset…</button>
        <form v-if="naming" class="name" @submit.prevent="savePreset">
          <input v-model="presetName" maxlength="40" placeholder="A name - e.g. My party jazz" aria-label="The preset's name" @keydown.esc="naming = false" />
          <button type="submit" class="ghost small">Save</button>
        </form>
      </div>
      <p v-if="chosenPreset" class="preset-note">{{ presets.find((p) => p.id === chosenPreset)?.text || 'Your preset' }} - change anything below.</p>
    </section>

    <p v-if="draft.again === 'cover'" class="note original"><Icon name="mic" :size="15" /> The original: <b>{{ draft.base?.title }}</b> from the library{{ draft.base?.seconds ? ` · ${clock(draft.base.seconds)}` : '' }} - its melody, form and tempo stay.</p>
    <section v-if="draft.kind === 'cover' && !draft.again" class="step">
      <h3><i>1</i> The original song</h3>
      <label
        class="drop"
        :class="{ over: dragging, has: !!draft.source }"
        @dragover.prevent="dragging = true"
        @dragleave="dragging = false"
        @drop.prevent="dropped"
      >
        <input type="file" :accept="ACCEPT" @change="addFile(($event.target as HTMLInputElement).files?.[0])" />
        <template v-if="uploading"><Icon name="refresh" :size="22" class="spin" /> Sending the recording …</template>
        <template v-else-if="draft.source">
          <Icon name="check" :size="22" />
          <span class="file"><b>{{ draft.source.title || draft.source.name }}</b><small>{{ draft.source.name }}{{ draft.source.seconds ? ` · ${seconds(draft.source.seconds)}` : '' }} · tap to choose another</small></span>
        </template>
        <template v-else><Icon name="download" :size="22" class="up" /> <span class="file"><b>Drop the song here, or tap to choose it</b><small>MP3, FLAC, WAV, M4A … up to {{ form.limits.source_mb }} MB - its melody and form stay</small></span></template>
      </label>
      <div v-if="draft.source && listen" class="listen">
        <audio :src="listen" controls preload="none" />
        <button type="button" class="link" @click="dropSource">remove</button>
      </div>
    </section>

    <section v-if="!isTake" class="step">
      <h3><i>{{ draft.kind === 'cover' && !draft.again ? 2 : 1 }}</i> Pick a style</h3>
      <div class="vibes">
        <button v-for="g in vibes" :key="g" type="button" class="chip" :class="{ on: chosen?.group === g && lastGroup === g }" @click="vibe(g)">{{ g }}</button>
      </div>
      <div class="pickrow">
        <select :value="draft.fields.template || 'none'" aria-label="The style template" @change="pick(($event.target as HTMLSelectElement).value)">
          <option value="none">No template - I describe it myself</option>
          <optgroup v-for="[group, list] in groups" :key="group" :label="group">
            <option v-for="t in list" :key="t.id" :value="t.id">{{ t.name }}</option>
          </optgroup>
        </select>
        <input v-model="query" class="find" type="search" placeholder="Find a style …" aria-label="Find a style" />
        <button type="button" class="ghost surprise" @click="surpriseMe"><Icon name="dice" :size="16" /> Surprise me</button>
      </div>
      <p v-if="chosen" class="chosen"><Icon name="sparkles" :size="14" /> <b>{{ chosen.name }}</b> <span>{{ chosen.group }}</span> - every field below is filled from it; change what you like.</p>
    </section>

    <section v-if="!isTake" class="step">
      <h3><i>{{ draft.kind === 'cover' && !draft.again ? 3 : 2 }}</i> {{ draft.kind === 'cover' ? 'How should your cover sound?' : 'How should it sound - and what is it about?' }}</h3>
      <div class="describe" :class="{ lit: lit.has('description') }">
        <textarea
          v-model="draft.fields.description"
          rows="4"
          :maxlength="form.limits.description"
          :placeholder="draft.kind === 'cover' ? 'e.g. a slow acoustic version with warm guitar and soft brushes' : 'e.g. warm acoustic guitars, soft drums and a big singalong chorus'"
          aria-label="How it should sound"
        />
        <small>{{ (draft.fields.description || '').length }} / {{ form.limits.description }}</small>
      </div>
      <template v-if="applies('lyrics', draft)">
        <div class="lyricsfrom" role="radiogroup" aria-label="The lyrics">
          <button type="button" class="chip" role="radio" :aria-checked="!ownLyrics" :class="{ on: !ownLyrics }" @click="setLyricsFrom(LYRICS_IDEA)">The writer writes them from an idea</button>
          <button type="button" class="chip" role="radio" :aria-checked="ownLyrics" :class="{ on: ownLyrics }" @click="setLyricsFrom(OWN_LYRICS)">My own lyrics, sung as written</button>
        </div>
        <div class="describe" :class="{ lit: lit.has('lyrics') }">
          <textarea
            v-model="draft.fields.lyrics"
            :rows="ownLyrics ? 9 : 2"
            :maxlength="form.limits.lyrics ?? 6000"
            :placeholder="ownLyrics ? 'Your lyrics - one line per sung line, a blank line between verse and chorus ([Verse], [Chorus] tags are fine)' : 'e.g. about a summer night at the lake with friends'"
            :aria-label="ownLyrics ? 'Your lyrics' : 'What the lyrics are about'"
          />
          <small>{{ (draft.fields.lyrics || '').length }} / {{ form.limits.lyrics ?? 6000 }}</small>
        </div>
      </template>
    </section>

    <section v-if="!isTake" class="step">
      <h3><i>{{ draft.kind === 'cover' && !draft.again ? 4 : 3 }}</i> The details <small>pick from the lists, or ✎ type your own</small></h3>
      <div class="fields">
        <ComboField
          v-for="name in shownFields"
          :key="`${draft.kind}-${name}`"
          v-model="draft.fields[name]"
          :label="LABELS[name].label"
          :hint="LABELS[name].hint"
          :placeholder="LABELS[name].placeholder"
          :options="optionsFor(name, draft, form)"
          :own="ownAllowed(name)"
          :required="name === 'vocals' || name === 'length'"
          :describe="describe(name)"
          :limit="form.limits.text"
          :lit="lit.has(name)"
          :epoch="epoch"
        />
      </div>
      <p v-if="draft.kind === 'cover'" class="note">A cover keeps the original’s melody, tempo, length and key{{ draft.fields.vocals === 'original lyrics' ? ' - and its lyrics, sung anew' : '' }}.</p>
      <p v-else-if="form.limits.max_length" class="note">Songs up to {{ form.limits.max_length.replace(/^.*\(about (.*)\).*$/, '$1') }} here.</p>
    </section>

    <StudioPanel v-if="spec && draft.studio" :key="`${draft.kind}-${draft.again}-${draft.base?.id ?? ''}`" :spec="spec" :values="draft.studio" :draft="draft" :warnings="remake?.studio?.warnings" />
    <p v-else-if="full && form.studio?.unavailable" class="note">Every setting of the studio shows here once ComfyUI runs.</p>

    <footer class="go">
      <div v-if="full && !editingNow" class="many" role="group" aria-label="How many">
        <span class="label">How many</span>
        <div class="seg">
          <button v-for="n in [1, 2, 3, 4]" :key="n" type="button" :class="{ on: count === n }" @click="count = n">{{ n }}</button>
        </div>
        <div v-if="count > 1 && !isTake" class="seg kinds-of">
          <button type="button" :class="{ on: several === 'takes' }" title="One song, sung and played several times - the takes follow when it is made" @click="several = 'takes'">takes of one song</button>
          <button type="button" :class="{ on: several === 'songs' }" title="Several songs of this form - each its own words and music" @click="several = 'songs'">different songs</button>
        </div>
      </div>
      <p v-if="isTake" class="what"><Icon name="refresh" :size="15" /> {{ count > 1 ? `${count} new takes` : 'A new take' }} of {{ draft.base?.title }}{{ changedDocuments ? ' - as changed' : '' }}</p>
      <p v-else-if="summary(draft)" class="what"><Icon name="music" :size="15" /> {{ summary(draft) }}</p>
      <button type="submit" class="generate" :disabled="sending || uploading || lacking.length > 0 || (status !== null && !status.may)">
        <span class="shine" />
        <Icon :name="editingNow ? 'check' : isTake ? 'refresh' : 'sparkles'" :size="22" />
        {{ sending ? (editingNow ? 'Saving …' : 'Sending …') : editingNow ? 'Save the changes' : isTake ? (count > 1 && full ? `Make ${count} takes` : 'Make the new take') : count > 1 && full ? (several === 'takes' ? `Generate · ${count} takes` : `Generate ${count} songs`) : 'Generate Song' }}
      </button>
      <button v-if="editingNow" type="button" class="link" @click="emit('cancel')">Leave it as it was</button>
      <p v-if="lacking.length" class="hint">Still needed: {{ lacking.join(' and ') }}.</p>
      <p v-else-if="status && !status.may" class="hint">{{ status.why }}</p>
      <p v-else-if="!editingNow" class="hint">
        <template v-if="ahead">{{ ahead }} {{ ahead === 1 ? 'song is' : 'songs are' }} in line before yours - the studio is free {{ untilText(free, now) }} ({{ timeOfDay(free, true, now) }}).</template>
        <template v-else>The studio is free - yours is next.</template>
        A song takes a few minutes; when it is ready {{ status?.me.kind === 'guest' ? 'it plays at the party' : 'it is in your songs' }}.
      </p>
      <p v-if="error" class="error">{{ error }}</p>
    </footer>
  </form>
</template>

<style scoped>
.maker {
  display: grid;
  gap: 18px;
}
.presets {
  display: grid;
  gap: 8px;
}
.presets .label,
.many .label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font: 600 11px var(--font);
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.7px;
}
.presets .row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.preset {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 36px;
  padding: 0 14px;
  border-radius: 99px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: #fff;
  font: 600 13px var(--font);
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, transform 0.15s;
}
.preset:hover {
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--accent) 60%, transparent);
}
.preset.on {
  border-color: var(--accent);
  background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 30%, transparent), color-mix(in srgb, var(--accent2) 14%, transparent));
}
.preset.add {
  border-style: dashed;
  color: var(--muted);
}
.preset .x {
  display: inline-grid;
  place-items: center;
  margin-right: -6px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  opacity: 0.6;
}
.preset .x:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.12);
}
.presets .name {
  display: flex;
  gap: 6px;
}
.presets .name input {
  height: 36px;
  width: 230px;
  padding: 0 12px;
  border-radius: 99px;
  border: 1px solid var(--accent);
  background: rgba(10, 8, 18, 0.55);
  color: #fff;
  font: 14px var(--font);
}
.preset-note {
  margin: 0;
  color: var(--muted);
  font-size: 12.5px;
}
.many {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  justify-content: center;
}
.seg {
  display: inline-flex;
  padding: 3px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.seg button {
  min-width: 38px;
  height: 32px;
  padding: 0 12px;
  border: 0;
  border-radius: 99px;
  background: none;
  color: rgba(255, 255, 255, 0.75);
  font: 600 13px var(--font);
  cursor: pointer;
}
.seg button.on {
  background: var(--accent);
  color: #0b0a12;
}
.kinds {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}
.kind {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  color: #fff;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, transform 0.15s;
}
.kind:hover {
  transform: translateY(-1px);
}
.kind.on {
  border-color: var(--accent);
  background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 26%, transparent), color-mix(in srgb, var(--accent2) 12%, transparent));
}
.kind b {
  display: block;
  font-size: 15px;
}
.kind small {
  color: var(--muted);
}
.badge {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.07);
  flex: none;
}
.kind.on .badge {
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  color: #0b0a12;
}
.kind.off {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}
.from {
  display: grid;
  gap: 12px;
}
.from .song {
  display: flex;
  align-items: center;
  gap: 12px;
}
.from .art {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: 14px;
  overflow: hidden;
  flex: none;
  background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 55%, #1a1528), color-mix(in srgb, var(--accent2) 45%, #1a1528));
}
.from .art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.from .what {
  display: grid;
  min-width: 0;
}
.from .what small {
  color: var(--muted);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.from .what b {
  font-size: 17px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.from .what em {
  font-style: normal;
  color: var(--muted);
  font-size: 12.5px;
}
.kinds.again {
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
}
.take .doc {
  display: grid;
  gap: 6px;
}
.take .doc > span {
  font: 600 13px var(--font);
  color: rgba(255, 255, 255, 0.88);
}
.take .doc small {
  font-weight: 400;
  color: var(--muted);
  margin-left: 6px;
}
.take .doc small.new {
  color: #ffcf8a;
}
.take input {
  height: 40px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(10, 8, 18, 0.55);
  color: #fff;
  font: 600 15px var(--font);
}
.take input:focus {
  outline: none;
  border-color: var(--accent);
}
.take textarea {
  padding-bottom: 12px;
  min-height: 0;
}
.note.original {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.step {
  display: grid;
  gap: 10px;
}
h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 16px;
}
h3 i {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--accent) 28%, transparent);
  color: #fff;
  font: 700 12px var(--font);
  font-style: normal;
}
h3 small {
  color: var(--muted);
  font-weight: 400;
  font-size: 12px;
}
.vibes {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.pickrow {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) auto;
  gap: 8px;
}
.pickrow select,
.pickrow .find {
  height: 40px;
  min-width: 0;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(10, 8, 18, 0.55);
  color: #fff;
  font: 500 14px var(--font);
}
.chosen {
  margin: 0;
  color: rgba(255, 255, 255, 0.82);
  font-size: 13px;
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}
.chosen span {
  color: var(--muted);
}
.describe {
  position: relative;
  border-radius: 14px;
  transition: box-shadow 0.6s;
}
.describe.lit {
  box-shadow: 0 0 0 1px var(--accent), 0 0 24px color-mix(in srgb, var(--accent) 24%, transparent);
  transition: none;
}
textarea {
  width: 100%;
  resize: vertical;
  min-height: 92px;
  padding: 12px 14px 22px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(10, 8, 18, 0.55);
  color: #fff;
  font: 14px/1.5 var(--font);
}
textarea:focus,
.pickrow select:focus,
.pickrow .find:focus {
  outline: none;
  border-color: var(--accent);
}
.describe small {
  position: absolute;
  right: 12px;
  bottom: 8px;
  color: rgba(255, 255, 255, 0.35);
  font-size: 11px;
}
.lyricsfrom {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 12px 0 8px;
}
.fields {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 10px;
}
.note {
  margin: 0;
  color: var(--muted);
  font-size: 12.5px;
}
.drop {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  border-radius: 18px;
  border: 2px dashed rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.03);
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}
.drop input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}
.drop.over,
.drop:hover {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 10%, transparent);
}
.drop.has {
  border-style: solid;
  border-color: color-mix(in srgb, #4fbf7f 60%, transparent);
}
.drop .up {
  transform: rotate(180deg);
}
.file b {
  display: block;
}
.file small {
  color: var(--muted);
}
.listen {
  display: flex;
  align-items: center;
  gap: 10px;
}
.listen audio {
  flex: 1;
  height: 36px;
  min-width: 0;
}
.go {
  display: grid;
  justify-items: center;
  gap: 10px;
  padding-top: 6px;
}
.what {
  margin: 0;
  display: flex;
  gap: 6px;
  align-items: center;
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
}
.generate {
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 58px;
  padding: 0 38px;
  border: 0;
  border-radius: 99px;
  background: linear-gradient(120deg, var(--accent), var(--accent2) 55%, #fbbf24);
  background-size: 180% 100%;
  color: #120c1c;
  font: 800 18px var(--font);
  letter-spacing: 0.01em;
  cursor: pointer;
  box-shadow: 0 14px 40px color-mix(in srgb, var(--accent2) 38%, transparent), 0 0 0 1px rgba(255, 255, 255, 0.18) inset;
  animation: drift 6s ease-in-out infinite;
  transition: transform 0.18s, box-shadow 0.25s;
}
.generate:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 18px 50px color-mix(in srgb, var(--accent2) 50%, transparent), 0 0 0 1px rgba(255, 255, 255, 0.25) inset;
}
.generate:active:not(:disabled) {
  transform: scale(0.98);
}
.generate:disabled {
  filter: grayscale(0.6);
  animation: none;
}
.shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(100deg, transparent 30%, rgba(255, 255, 255, 0.45) 50%, transparent 70%);
  transform: translateX(-120%);
  animation: shine 3.2s ease-in-out infinite;
  pointer-events: none;
}
.generate:disabled .shine {
  display: none;
}
@keyframes shine {
  0%,
  55% {
    transform: translateX(-120%);
  }
  100% {
    transform: translateX(120%);
  }
}
@keyframes drift {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}
.hint {
  margin: 0;
  max-width: 520px;
  color: var(--muted);
  font-size: 12.5px;
  text-align: center;
}
.error {
  margin: 0;
  color: #ff9a9a;
  text-align: center;
}
.link {
  background: none;
  border: 0;
  color: var(--accent);
  cursor: pointer;
  font: 13px var(--font);
  padding: 0;
}
.spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@media (max-width: 640px) {
  .kinds {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .kind {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 12px;
  }
  .kind small {
    font-size: 11.5px;
    line-height: 1.35;
  }
  .badge {
    width: 36px;
    height: 36px;
    border-radius: 11px;
  }
  .presets .row {
    flex-wrap: nowrap;
    overflow-x: auto;
    margin: 0 -14px;
    padding: 0 14px 4px;
    scrollbar-width: none;
  }
  .preset {
    flex: none;
  }
  .pickrow {
    grid-template-columns: minmax(0, 1fr) auto;
  }
  .pickrow select {
    grid-column: 1 / -1;
  }
  .fields {
    grid-template-columns: minmax(0, 1fr);
  }
  .generate {
    width: 100%;
    justify-content: center;
  }
}
</style>
