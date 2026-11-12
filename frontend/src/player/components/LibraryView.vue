<script lang="ts">
/** How many songs each library page showed, while the page is open: a page you come back to shows as many again, so
 * the place you left is still there. */
const shownBefore = new Map<string, { limit: number; list: string }>()
</script>

<script setup lang="ts">
/**
 * The library: a featured song, the search (free words and field filters, with suggestions as you type), the
 * filters - every genre, mood, tag, tempo, length … with how many of the songs shown have it, a click keeping
 * only those, a right click leaving them out (owner's request 2026-10-18: the genres of the templates were
 * missing) - saved filters, tags for the songs shown, the sort, and the songs as a grid or a list.
 *
 * Owner's request 2026-10-26 (phones first, no long scrolling, fast with thousands of songs): on a phone the featured
 * song is a slim card, the filters open in a sheet (*Filters*), the songs are rows by default; the list grows by
 * itself as it scrolls, and a rail of letters (sorted by title) or months (by date) jumps anywhere in it. The search
 * waits for a short pause in the typing before it searches thousands of songs.
 */
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

import type { SongSummary } from '../api'
import { isPhone, touch } from '../layout'
import { isPortable } from '../portable'
import { makeShown } from '../make/state'
import { current, go, library, measuredStars, playSongs, saveFilter, say, settings, shareFor, state, toggleCurrent } from '../store'
import { countOf, formatTime } from '../timing'
import { chipFilter, chipParts, facetOf, filterRows, fold, lyricsSnippet, parseQuery, scoreWith, sortSongs, suggest, toggleFilterChip, valueLabel, type SortKey } from '../search'
import { indexMarks } from '../listIndex'
import BottomSheet from './BottomSheet.vue'
import CoverArt from './CoverArt.vue'
import Icon from './Icon.vue'
import SongCard from './SongCard.vue'
import SongMenu from './SongMenu.vue'
import TagEditor from './TagEditor.vue'

const props = defineProps<{ collection: 'all' | 'favorites' | 'top' | 'recent' }>()

// the search and the chips are kept with the settings, one set per view: they are still there after a song's
// page, another window, or a reload - until Reset filters
if (!settings.filters[props.collection]) settings.filters[props.collection] = { query: '', chips: [] }
const filter = computed(() => settings.filters[props.collection] ?? { query: '', chips: [] })
const query = computed({ get: () => filter.value.query, set: (v: string) => (filter.value.query = v) })
const chips = computed(() => filter.value.chips)
const filtered = computed(() => !!query.value.trim() || chips.value.length > 0)
const typing = ref(false)
/** The search as it is searched: the typed words a moment after the last key (thousands of songs per key held the
 * typing up), at once when it is cleared or comes from elsewhere (a suggestion, a saved filter). */
const searchText = ref(query.value)
let typingTimer: number | undefined
watch(query, (now) => {
  window.clearTimeout(typingTimer)
  if (!now.trim() || !typing.value) searchText.value = now
  else typingTimer = window.setTimeout(() => (searchText.value = now), 160)
})
function resetFilters(): void {
  filter.value.query = ''
  filter.value.chips.splice(0)
}
const input = ref<HTMLInputElement | null>(null)
const menu = ref<{ song: SongSummary; x: number; y: number } | null>(null)
const root = ref<HTMLElement | null>(null)
const FIRST = 120
const MORE = 240

const base = computed<SongSummary[]>(() => {
  const all = library.value
  if (props.collection === 'favorites') return state.favorites.map((id) => all.find((s) => s.id === id)).filter((s): s is SongSummary => !!s)
  if (props.collection === 'top') return all.filter((s) => (state.plays[s.id] ?? 0) > 0)
  if (props.collection === 'recent') return all.filter((s) => state.last_played[s.id])
  return all
})

// the search's words must all match; the chips of one filter row are alternatives (``chipFilter``)
const terms = computed(() => parseQuery([searchText.value, ...chips.value].join(' ')))
const searched = computed(() => parseQuery(searchText.value))
const chipRows = computed(() => chipFilter(chips.value))
const context = computed(() => ({ favorites: new Set(state.favorites), tags: state.tags, plays: state.plays, ratings: state.ratings, measured: measuredStars.value }))
const scored = computed(() => {
  const map = new Map<string, number>()
  const found = base.value.filter((song) => {
    const value = scoreWith(song, searched.value, chipRows.value, context.value)
    if (value > 0) map.set(song.id, value)
    return value > 0
  })
  return { found, map }
})
const sortKey = computed<SortKey>(() => {
  if (props.collection === 'top') return 'plays'
  if (props.collection === 'recent') return 'recent'
  if (searchText.value.trim() && settings.sort === 'newest') return 'relevance'
  return settings.sort as SortKey
})
const songs = computed(() => sortSongs(scored.value.found, sortKey.value, { plays: state.plays, lastPlayed: state.last_played }, scored.value.map))
// a new search, other chips or another sort start with the first songs again - a song that counts a play, or
// one that arrives, changes the songs but not the list you are in (it shrank back to the first 120 before)
const list = computed(() => [searchText.value.trim(), ...chips.value, sortKey.value].join('\n'))
const kept = shownBefore.get(props.collection)
const limit = ref(kept && kept.list === list.value ? kept.limit : FIRST)
watch(list, () => (limit.value = FIRST))
onBeforeUnmount(() => shownBefore.set(props.collection, { limit: limit.value, list: list.value }))
const shown = computed(() => songs.value.slice(0, limit.value))
/** Cards or rows: a phone has its own choice (rows by default - more songs at once). */
const view = computed<'grid' | 'list'>({
  get: () => (isPhone.value ? settings.phoneView : settings.view),
  set: (v) => {
    if (isPhone.value) settings.phoneView = v
    else settings.view = v
  },
})

// --- the list grows as it scrolls, and a rail jumps in it ------------------------------------------------------
const sentinel = ref<HTMLElement | null>(null)
let watcher: IntersectionObserver | undefined
onMounted(() => {
  if (typeof IntersectionObserver === 'undefined') return
  watcher = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting) && songs.value.length > limit.value) limit.value += MORE
    },
    { rootMargin: '900px 0px' }
  )
  if (sentinel.value) watcher.observe(sentinel.value)
})
watch(sentinel, (now, before) => {
  if (before) watcher?.unobserve(before)
  if (now) watcher?.observe(now)
})
onBeforeUnmount(() => watcher?.disconnect())
/** A phone's tools go up while the list scrolls down (more songs in sight) and come back as it scrolls up. */
const toolsAway = ref(false)
let scroller: HTMLElement | null = null
let lastTop = 0
function onScroll(): void {
  if (!scroller) return
  const top = scroller.scrollTop
  if (!isPhone.value || top < 240) toolsAway.value = false
  else if (top > lastTop + 6) toolsAway.value = !filtersOpen.value && !typing.value
  else if (top < lastTop - 6) toolsAway.value = false
  lastTop = top
}
onMounted(() => {
  scroller = root.value?.closest('.main') ?? null
  scroller?.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => scroller?.removeEventListener('scroll', onScroll))
const marks = computed(() => (songs.value.length > 60 ? indexMarks(songs.value, sortKey.value) : []))
const railAt = ref('')
/** Jump to a mark of the rail: the list grows to it, and its first song comes to the top. */
async function jump(at: number, label: string): Promise<void> {
  railAt.value = label
  if (at >= limit.value) limit.value = FIRST + Math.ceil((at + 1 - FIRST) / MORE) * MORE
  await nextTick()
  const id = songs.value[at]?.id
  const card = id ? root.value?.querySelector<HTMLElement>(`[data-song="${CSS.escape(id)}"]`) : null
  card?.scrollIntoView({ block: 'start', behavior: 'instant' as ScrollBehavior })
  window.setTimeout(() => (railAt.value === label ? (railAt.value = '') : null), 700)
}
/** A finger dragged along the rail: the mark under it. */
function railMove(event: PointerEvent): void {
  if (event.buttons === 0 && event.pointerType === 'mouse') return
  const element = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null
  const index = element?.dataset.mark
  if (index !== undefined && marks.value[Number(index)]) {
    const mark = marks.value[Number(index)]
    if (railAt.value !== mark.label) void jump(mark.at, mark.label)
  }
}

// --- the filters ------------------------------------------------------------------------------------------
/** The rows shown before *More filters* (and every row with a chip on). */
const FIRST_ROWS = new Set(['tag', 'stars', 'measured', 'genre', 'mood', 'made', 'model'])
/** Rows opened to every value, and the word to look for in one. */
const opened = reactive<Record<string, boolean>>({})
const lookFor = reactive<Record<string, string>>({})
const filtersOpen = ref(false)
const chipState = (key: string, value: string): 'in' | 'out' | '' => (chips.value.includes(`${key}:"${value}"`) ? 'in' : chips.value.includes(`-${key}:"${value}"`) ? 'out' : '')

interface FacetRow {
  id: string
  key: string
  label: string
  /** Every value among the songs shown (and every chip on), with how many have it. */
  all: [string, number][]
  shown: [string, number][]
  top: number
  on: boolean
}
const facets = computed<FacetRow[]>(() =>
  // the numbers are of the songs the search and the chips leave: a chip says how many would stay
  filterRows(base.value, searchText.value, chips.value, context.value, scored.value.found).map((row) => {
    const on = row.all.some(([v]) => chipState(row.key, v))
    const want = fold(lookFor[row.id] ?? '')
    const shown = opened[row.id] ? row.all.filter(([v]) => !want || fold(valueLabel(facetOf(row.key, v), v)).includes(want)) : row.all.filter(([v], k) => k < row.top || chipState(row.key, v))
    return { id: row.id, key: row.key, label: row.label, all: row.all, shown, top: row.top, on }
  })
)
const firstRows = computed(() => facets.value.filter((f) => FIRST_ROWS.has(f.id) || f.on))
const moreRows = computed(() => facets.value.filter((f) => !FIRST_ROWS.has(f.id) && !f.on))
const shownRows = computed(() => (settings.moreFilters || isPhone.value ? [...firstRows.value, ...moreRows.value] : firstRows.value))
/** ``genre:"dance-pop"`` -> ``Genre: dance-pop``, ``-tag:"x"`` -> ``not Tags: x`` (the active filters' row). */
function chipLabel(chip: string): string {
  const parts = chipParts(chip)
  if (!parts) return chip
  const facet = facetOf(parts.key, parts.value)
  const label = parts.key === 'plenio' ? 'Plenio version' : (facet?.label ?? parts.key)
  return `${parts.exclude ? 'not ' : ''}${label}: ${valueLabel(facet, parts.value)}`
}
/** A click keeps the songs with that value - or with another chip of the row that is on - (again: off);
 * ``exclude`` (a right click, a long press) leaves them out. */
function toggleChip(key: string, value: string, exclude = false): void {
  // the kept array itself changes, so the settings save it
  chips.value.splice(0, chips.value.length, ...toggleFilterChip(chips.value, key, value, exclude))
}
function filterByTag(tag: string): void {
  if (!chips.value.includes(`tag:"${tag}"`)) toggleChip('tag', tag)
}
// a long press on a chip (a phone has no right click) leaves its songs out
let pressTimer: number | undefined
let pressed = false
function pressStart(key: string, value: string, event: PointerEvent): void {
  if (event.pointerType === 'mouse') return
  pressed = false
  pressTimer = window.setTimeout(() => {
    pressed = true
    toggleChip(key, value, chipState(key, value) !== 'out')
    navigator.vibrate?.(15)
  }, 520)
}
function pressEnd(): void {
  window.clearTimeout(pressTimer)
}
function chipClick(key: string, value: string): void {
  if (pressed) {
    pressed = false
    return
  }
  toggleChip(key, value, chipState(key, value) === 'out')
}

// --- suggestions while typing, a saved filter, tags for the songs shown ---------------------------------------
const pick = ref(-1)
const suggestions = computed(() => (typing.value ? suggest(query.value, library.value, context.value) : []))
watch(query, () => (pick.value = -1))
function take(text: string): void {
  typing.value = false
  query.value = text
  pick.value = -1
  void nextTick(() => {
    input.value?.focus()
    input.value?.setSelectionRange(text.length, text.length)
  })
}
function onSearchKey(event: KeyboardEvent): void {
  if (event.key === 'Enter' && pick.value < 0) {
    searchText.value = query.value
    if (isPhone.value) input.value?.blur()
    return
  }
  const list = suggestions.value
  if (!list.length) return
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    pick.value = (pick.value + (event.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length
  } else if ((event.key === 'Enter' || event.key === 'Tab') && pick.value >= 0) {
    event.preventDefault()
    take(list[pick.value].query)
  } else if (event.key === 'Escape') {
    typing.value = false
  }
}
function stopTyping(): void {
  window.setTimeout(() => {
    typing.value = false
    searchText.value = query.value
  }, 150)
}
const naming = ref(false)
const filterName = ref('')
function keepFilter(): void {
  const saved = saveFilter(filterName.value || [query.value.trim(), ...chips.value.map(chipLabel)].filter(Boolean).join(', ').slice(0, 60), filter.value)
  naming.value = false
  filterName.value = ''
  say(`Saved: “${saved.name}” - in the menu`, 3000)
}
const tagging = ref(false)
const actions = ref(false)

// the featured song: one of the newest dozen, a different one each visit
const featured = ref<SongSummary | null>(null)
function feature(): void {
  const pool = library.value.slice(0, 12)
  featured.value = pool.length ? pool[Math.floor(Math.random() * pool.length)] : null
}
watch(library, feature)
onMounted(feature)

const totals = computed(() => ({
  songs: library.value.length,
  time: library.value.reduce((sum, s) => sum + s.seconds, 0),
  favs: state.favorites.length,
}))
const welcome = computed(() => props.collection === 'all' && !settings.welcomed && !filtered.value && library.value.length > 0)

const titles: Record<string, string> = { all: 'Your songs', favorites: 'Favourites', top: 'Most played', recent: 'Recently played' }
const COLLECTIONS: [string, string][] = [['/', 'All'], ['/favorites', 'Favourites'], ['/top', 'Most played'], ['/recent', 'Recent']]
function play(song: SongSummary): void {
  // the song that plays: its card's button pauses and plays it (it showed pause, and started it anew)
  if (current.value?.id === song.id) return toggleCurrent()
  void playSongs(songs.value.map((s) => s.id), songs.value.indexOf(song))
}
function playAll(shuffle = false): void {
  const ids = songs.value.map((s) => s.id)
  if (shuffle) settings.shuffle = true
  void playSongs(ids, shuffle ? Math.floor(Math.random() * ids.length) : 0)
}
/** The card of the song that plays, when it is among these songs - the list grows by Show more's steps until it
 * holds it (back from a song's page with 1000 songs, the page shows where it plays, not the top). */
async function cardOfCurrent(): Promise<HTMLElement | null> {
  const id = current.value?.id
  const at = id ? songs.value.findIndex((s) => s.id === id) : -1
  if (!id || at < 0) return null
  if (at >= limit.value) limit.value = FIRST + Math.ceil((at + 1 - FIRST) / MORE) * MORE
  await nextTick()
  return root.value?.querySelector<HTMLElement>(`[data-song="${CSS.escape(id)}"]`) ?? null
}
defineExpose({ focus: () => input.value?.focus(), cardOfCurrent, filterByTag })
</script>

<template>
  <div ref="root" class="library" :class="{ phone: isPhone, touch }">
    <section v-if="collection === 'all' && featured && !query" class="hero">
      <div class="hero-art" @click="go(`/song/${featured.id}`)"><CoverArt :song="featured" live rounded :size="isPhone ? 96 : 220" /></div>
      <div class="hero-text">
        <small>Featured</small>
        <h1 @click="go(`/song/${featured.id}`)">{{ featured.title }}</h1>
        <p>{{ [featured.genre, featured.mood, featured.model].filter(Boolean).join(' · ') }}</p>
        <div class="actions">
          <button class="primary" @click="playSongs([featured.id, ...songs.filter((s) => s.id !== featured!.id).map((s) => s.id)])"><Icon name="play" /> Play</button>
          <button class="ghost" title="Shuffle all" @click="playAll(true)"><Icon name="shuffle" /> <span class="wide">Shuffle all</span></button>
          <button class="ghost" title="Another featured song" @click="feature"><Icon name="dice" /> <span class="wide">Another</span></button>
        </div>
        <p class="stats">{{ countOf(totals.songs, 'song') }} · {{ countOf(Math.round(totals.time / 60), 'minute') }} of music · {{ countOf(totals.favs, 'favourite') }}</p>
      </div>
    </section>
    <h1 v-else class="heading">{{ titles[collection] }}</h1>
    <nav v-if="isPhone" class="collections" aria-label="Which songs">
      <button v-for="[path, label] in COLLECTIONS" :key="path" class="chip" :class="{ on: (path === '/' ? 'all' : path.slice(1)) === collection }" @click="go(path)">{{ label }}</button>
    </nav>

    <section v-if="welcome" class="welcome">
      <h2>Welcome to the Plenio Player</h2>
      <div class="first-cards">
        <article><Icon name="music" :size="20" /><b>Your songs are here</b><span>▶ on a cover{{ isPhone ? ', or tap a row' : '' }} plays it; the card opens the song’s page - lyrics, notation, how it was made.</span></article>
        <article><Icon name="sparkles" :size="20" /><b>Press F for the show</b><span>Now playing: the lyrics as sung, the notation, the visuals - {{ isPhone ? 'tap the song at the bottom' : 'F, or a click on the song at the bottom' }}.</span></article>
        <article v-if="!isPortable"><Icon name="guests" :size="20" /><b>Having people over?</b><span>Start a party: guests scan a code, add songs and make their own.</span><button class="ghost small" @click="go('/people')">Start a party</button></article>
      </div>
      <div class="row">
        <button class="ghost small" @click="go('/help')"><Icon name="help" :size="15" /> Help &amp; video tutorials</button>
        <button class="link" @click="settings.welcomed = true">Got it</button>
      </div>
    </section>

    <div class="tools" :class="{ away: toolsAway }">
      <label class="search">
        <Icon name="search" />
        <input ref="input" v-model="query" type="search" enterkeyhint="search" :placeholder="isPhone ? 'Search titles, lyrics, genres …' : 'Search titles, lyrics, genres, #tags … try  bpm:>100  key:Am  is:fav'" @focus="typing = true" @input="typing = true" @blur="stopTyping" @keydown="onSearchKey" />
        <button v-if="query" class="icon-btn" title="Clear the search" @click="query = ''"><Icon name="close" :size="16" /></button>
        <div v-if="suggestions.length" class="suggest" @mousedown.prevent>
          <button v-for="(s, k) in suggestions" :key="s.query" :class="{ on: k === pick }" @click="take(s.query)"><b>{{ s.label }}</b><small>{{ s.hint }}</small></button>
        </div>
      </label>
      <button v-if="isPhone" class="ghost filters-btn" :class="{ on: chips.length > 0 }" @click="filtersOpen = true"><Icon name="sliders" :size="16" /> Filters <b v-if="chips.length">{{ chips.length }}</b></button>
      <select v-if="collection === 'all' || collection === 'favorites'" v-model="settings.sort" title="Sort" aria-label="Sort">
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="title">Title</option>
        <option value="length">Length</option>
        <option value="bpm">Tempo</option>
        <option value="loudness">Loudness</option>
        <option value="plays">Most played</option>
        <option value="recent">Recently played</option>
      </select>
      <button v-if="isPhone" class="icon-btn" :title="view === 'grid' ? 'Rows' : 'Cards'" @click="view = view === 'grid' ? 'list' : 'grid'"><Icon :name="view === 'grid' ? 'list' : 'grid'" /></button>
      <div v-else class="views">
        <button class="icon-btn" :class="{ on: view === 'grid' }" title="Cards" @click="view = 'grid'"><Icon name="grid" /></button>
        <button class="icon-btn" :class="{ on: view === 'list' }" title="Rows" @click="view = 'list'"><Icon name="list" /></button>
      </div>
      <button class="ghost play-all" :disabled="!songs.length" :title="`Play the ${songs.length} songs shown`" @click="playAll()"><Icon name="play" :size="16" /> <span>Play {{ songs.length }}</span></button>
      <template v-if="!isPhone">
        <button v-if="!isPortable" class="ghost" :disabled="!songs.length" title="These songs as one HTML file that plays by itself - to send to others" @click="shareFor = { songs: songs.map((s) => s.id), title: '' }"><Icon name="download" :size="16" /> Share…</button>
        <button class="ghost" :class="{ on: tagging }" :disabled="!songs.length" :title="`Give the ${songs.length} songs shown a tag, or take one off them`" @click="tagging = !tagging"><Icon name="tag" :size="16" /> Tag…</button>
      </template>
      <button v-else class="icon-btn" title="More: shuffle, tag, share" @click="actions = true"><Icon name="more" /></button>
      <button v-if="filtered && !isPhone" class="ghost reset" title="Clear the search and every filter" @click="resetFilters"><Icon name="close" :size="16" /> Reset filters</button>
    </div>

    <div v-if="tagging" class="tagging">
      <p>Tags for the <b>{{ countOf(songs.length, 'song') }}</b> shown{{ filtered ? ' (as filtered)' : '' }}:</p>
      <TagEditor :ids="songs.map((s) => s.id)" autofocus @filter="filterByTag" />
      <button class="icon-btn" title="Close" @click="tagging = false"><Icon name="close" :size="16" /></button>
    </div>

    <div v-if="filtered" class="active">
      <span class="label">Filtered</span>
      <button v-if="query.trim()" class="chip on" title="Clear the search" @click="query = ''">“{{ query.trim() }}” <Icon name="close" :size="12" /></button>
      <button v-for="chip in chips" :key="chip" class="chip on" :class="{ out: chip.startsWith('-') }" title="Remove this filter" @click="chips.splice(chips.indexOf(chip), 1)">
        {{ chipLabel(chip) }} <Icon name="close" :size="12" />
      </button>
      <small>{{ songs.length }} of {{ countOf(base.length, 'song') }}</small>
      <form v-if="naming" class="keep" @submit.prevent="keepFilter">
        <input v-model="filterName" maxlength="80" placeholder="A name for this filter" @keydown.esc="naming = false" />
        <button class="ghost small" type="submit">Save</button>
      </form>
      <button v-else-if="collection === 'all'" class="link" title="Keep this search and these filters under a name - the menu lists them" @click="naming = true">Save this filter…</button>
      <button v-if="isPhone" class="link" @click="resetFilters">Reset</button>
    </div>

    <component :is="isPhone ? BottomSheet : 'div'" v-if="!isPhone || filtersOpen" :title="isPhone ? 'Filters' : undefined" @close="filtersOpen = false">
     <div class="facets" :class="{ 'in-sheet': isPhone }">
      <div v-for="facet in shownRows" :key="facet.id" class="facet" :class="{ wide: opened[facet.id] }">
        <span class="label">{{ facet.label }}</span>
        <div class="values">
          <input v-if="opened[facet.id] && facet.all.length > 16" v-model="lookFor[facet.id]" class="look" :placeholder="`Find a ${facet.label.toLowerCase().replace(/s$/, '')} …`" />
          <button
            v-for="[value, count] in facet.shown"
            :key="value"
            class="chip"
            :class="{ on: chipState(facet.key, value) === 'in', out: chipState(facet.key, value) === 'out' }"
            :title="chipState(facet.key, value) === 'out' ? 'Left out - click to stop leaving them out' : touch ? 'Tap: only these songs · hold: leave them out' : 'Click: only these songs · right-click: leave them out'"
            @click="chipClick(facet.key, value)"
            @contextmenu.prevent="toggleChip(facet.key, value, true)"
            @pointerdown="pressStart(facet.key, value, $event)"
            @pointerup="pressEnd"
            @pointerleave="pressEnd"
          >
            {{ valueLabel(facetOf(facet.key, value), value) }} <small v-if="chipState(facet.key, value) !== 'out'">{{ count }}</small>
          </button>
          <button v-if="!opened[facet.id] && facet.all.length > facet.shown.length" class="link more-values" @click="opened[facet.id] = true">+ {{ facet.all.length - facet.shown.length }} more</button>
          <button v-else-if="opened[facet.id]" class="link more-values" @click="opened[facet.id] = false; lookFor[facet.id] = ''">fewer</button>
        </div>
      </div>
      <div v-if="!isPhone" class="facet-foot">
        <button v-if="moreRows.length" class="link" @click="settings.moreFilters = !settings.moreFilters">{{ settings.moreFilters ? 'Fewer filters' : `More filters: ${moreRows.map((f) => f.label.toLowerCase()).join(', ')}` }}</button>
        <small>{{ touch ? 'Tap a chip to keep only those songs, hold it to leave them out.' : 'Click a chip to keep only those songs, right-click to leave them out.' }} The numbers: how many of the songs shown.</small>
      </div>
      <p v-else class="sheet-hint">Tap a value to keep only those songs, hold it to leave them out. The numbers: how many songs stay.</p>
     </div>
      <template v-if="isPhone" #foot>
        <div class="sheet-foot">
          <button class="ghost" :disabled="!filtered" @click="resetFilters">Reset</button>
          <button class="primary" @click="filtersOpen = false">Show {{ countOf(songs.length, 'song') }}</button>
        </div>
      </template>
    </component>

    <p v-if="!songs.length && library.length" class="empty">
      No song matches - try fewer words or filters.
      <button v-if="filtered" class="ghost reset-empty" @click="resetFilters">Reset filters</button>
    </p>
    <div v-else-if="!songs.length" class="empty first">
      <h2>No songs here yet</h2>
      <p>The player plays the songs Plenio makes in ComfyUI: each template ends with <b>Export Release</b>, which writes the song and its release record into ComfyUI’s output folder - the player finds it there by itself.</p>
      <p>Songs of your own somewhere else? Add their folder under <a @click="go('/settings/songs')">Settings › Songs</a>.</p>
      <button v-if="makeShown" class="primary" @click="go('/make')"><Icon name="wand" :size="16" /> Make your first song</button>
    </div>
    <div :class="view === 'grid' ? 'grid' : 'rows'">
      <SongCard
        v-for="(song, i) in shown"
        :key="song.id"
        :data-song="song.id"
        :song="song"
        :index="i"
        :list="view === 'list'"
        :snippet="lyricsSnippet(song, terms)"
        :style="{ animationDelay: `${Math.min(i % MORE, 24) * 25}ms` }"
        @play="play(song)"
        @menu="menu = { song, x: $event.clientX, y: $event.clientY }"
        @tag="filterByTag"
      />
    </div>
    <div ref="sentinel" class="sentinel" />
    <button v-if="songs.length > shown.length" class="ghost more" @click="limit += MORE">Show {{ Math.min(MORE, songs.length - shown.length) }} more</button>
    <p class="foot">{{ songs.length }} of {{ countOf(base.length, 'song') }} · {{ formatTime(songs.reduce((t, s) => t + s.seconds, 0)) }}</p>

    <nav v-if="marks.length > 2" class="rail" aria-label="Jump in the list" @pointerdown="railMove" @pointermove="railMove">
      <button v-for="(mark, k) in marks" :key="k" :data-mark="k" :class="{ on: railAt === mark.label }" :title="`${mark.title} - ${countOf(mark.count, 'song')}`" @click="jump(mark.at, mark.label)">{{ mark.label }}</button>
    </nav>
    <Transition name="pop"><div v-if="railAt" class="rail-bubble">{{ railAt }}</div></Transition>

    <SongMenu v-if="menu" :song="menu.song" :x="menu.x" :y="menu.y" @close="menu = null" />
    <BottomSheet v-if="actions" title="These songs" @close="actions = false">
      <div class="sheet-actions">
        <button class="ghost" :disabled="!songs.length" @click="actions = false; playAll(true)"><Icon name="shuffle" :size="16" /> Shuffle {{ countOf(songs.length, 'song') }}</button>
        <button class="ghost" :disabled="!songs.length" @click="actions = false; tagging = true"><Icon name="tag" :size="16" /> Tag the {{ countOf(songs.length, 'song') }}…</button>
        <button v-if="!isPortable" class="ghost" :disabled="!songs.length" @click="actions = false; shareFor = { songs: songs.map((s) => s.id), title: '' }"><Icon name="download" :size="16" /> Share as a player…</button>
      </div>
    </BottomSheet>
  </div>
</template>

<style scoped>
.library {
  position: relative;
  padding: 26px 34px 40px;
}
.hero {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 28px;
  align-items: center;
  padding: 22px;
  border-radius: 26px;
  background: radial-gradient(circle at 15% 20%, color-mix(in srgb, var(--accent) 35%, transparent), transparent 60%), linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01));
  border: 1px solid rgba(255, 255, 255, 0.06);
  margin-bottom: 22px;
  overflow: hidden;
}
.hero-art {
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
  border-radius: 16px;
  cursor: pointer;
}
.hero small {
  font: 700 11px var(--font);
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--accent);
}
.hero h1 {
  font: 800 clamp(26px, 3.4vw, 48px) / 1.05 var(--font);
  margin: 8px 0;
  letter-spacing: -0.6px;
  cursor: pointer;
}
.hero p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 16px;
}
.stats {
  font-size: 12px;
  color: var(--muted) !important;
  margin: 14px 0 0 !important;
}
.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.heading {
  font: 800 34px var(--font);
  margin: 6px 0 16px;
}
.collections {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  margin: -4px -16px 14px;
  padding: 0 16px 2px;
  scrollbar-width: none;
}
.first-cards {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  margin: 6px 0 10px;
}
.first-cards article {
  display: grid;
  gap: 6px;
  align-content: start;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.05);
}
.first-cards span {
  color: var(--muted);
  font-size: 0.9rem;
}
.first-cards button {
  justify-self: start;
}
.empty.first {
  display: grid;
  gap: 10px;
  max-width: 560px;
}
.empty.first h2,
.empty.first p {
  margin: 0;
}
.welcome {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 8px 24px;
  align-items: center;
  margin-bottom: 18px;
  padding: 14px 18px;
  border-radius: 20px;
  border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
  background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 16%, transparent), color-mix(in srgb, var(--accent2) 8%, transparent));
}
.welcome h2 {
  margin: 0;
  font: 700 16px var(--font);
  max-width: 150px;
}
.welcome ul {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px 18px;
  margin: 0;
  padding: 0;
  list-style: none;
  color: rgba(255, 255, 255, 0.86);
  font-size: 13px;
  line-height: 1.4;
}
.welcome li {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.welcome li :deep(svg) {
  flex: none;
  margin-top: 2px;
  color: var(--accent);
}
.welcome .row {
  display: flex;
  gap: 14px;
  align-items: center;
  flex-wrap: wrap;
}
@media (max-width: 1100px) {
  .welcome {
    grid-template-columns: minmax(0, 1fr);
  }
  .welcome h2 {
    max-width: none;
  }
  .welcome ul {
    grid-template-columns: minmax(0, 1fr);
    gap: 6px;
  }
}
.tools {
  position: sticky;
  top: 0;
  z-index: 25;
  transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s;
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  margin: 0 -10px 14px;
  padding: 8px 10px;
  border-radius: 16px;
  background: color-mix(in srgb, var(--deep) 94%, transparent);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}
.search {
  flex: 1;
  min-width: 260px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  height: 42px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--muted);
  transition: border-color 0.2s, box-shadow 0.2s;
  position: relative;
}
.search:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 18%, transparent);
}
.search input {
  flex: 1;
  min-width: 0;
  background: none;
  border: 0;
  outline: none;
  color: #fff;
  font: 14px var(--font);
}
.search input::-webkit-search-cancel-button {
  display: none;
}
.suggest {
  position: absolute;
  z-index: 30;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  display: grid;
  padding: 6px;
  border-radius: 14px;
  background: rgba(20, 18, 30, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.55);
}
.suggest button {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 7px 10px;
  border: 0;
  border-radius: 8px;
  background: none;
  color: #ddd;
  cursor: pointer;
  font: 13px var(--font);
  text-align: left;
}
.suggest button b {
  font: 600 13px var(--mono);
  color: #fff;
}
.suggest button small {
  color: var(--muted);
}
.suggest button:hover,
.suggest button.on {
  background: color-mix(in srgb, var(--accent) 20%, transparent);
}
.filters-btn b {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 99px;
  background: var(--accent);
  color: #0b0a12;
  font: 700 11px/18px var(--font);
}
.tagging {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  margin-bottom: 14px;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
  background: color-mix(in srgb, var(--accent) 7%, transparent);
}
.tagging p {
  margin: 0;
  color: var(--muted);
  font-size: 13px;
}
.tagging .tag-editor {
  flex: 1;
}
.chip.out {
  border-color: rgba(255, 120, 120, 0.7);
  background: rgba(255, 90, 90, 0.12);
  color: #ffb4b4;
  text-decoration: line-through;
}
.link {
  background: none;
  border: 0;
  padding: 0;
  color: var(--accent);
  cursor: pointer;
  font: 12px var(--font);
}
.more-values {
  margin-left: 4px;
}
.look {
  width: 170px;
  height: 28px;
  padding: 0 10px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: #fff;
  font: 12px var(--font);
}
.facet-foot {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
  margin-top: 2px;
  padding-left: 102px;
}
.facet-foot small,
.sheet-hint {
  color: var(--muted);
  font-size: 11px;
}
.sheet-foot {
  display: flex;
  gap: 10px;
}
.sheet-foot .primary {
  flex: 1;
  justify-content: center;
}
.keep {
  display: flex;
  gap: 6px;
}
.keep input {
  height: 30px;
  width: 220px;
  padding: 0 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--accent);
  color: #fff;
  font: 13px var(--font);
}
.ghost.small {
  height: 30px;
  padding: 0 12px;
  font-size: 12px;
}
select {
  height: 38px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0 10px;
  font: 13px var(--font);
}
.views {
  display: flex;
  gap: 2px;
}
.facets {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 20px;
}
.facet {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr);
  gap: 6px;
  align-items: start;
}
.facet .values {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}
.facet .label {
  padding-top: 7px;
  font: 600 11px var(--font);
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.6px;
}
.in-sheet .facet {
  grid-template-columns: minmax(0, 1fr);
  gap: 8px;
  margin-bottom: 14px;
}
.in-sheet .chip {
  height: 34px;
  padding: 0 13px;
  font-size: 13px;
}
.chip small {
  opacity: 0.55;
  margin-left: 2px;
}
.active {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  margin: -4px 0 12px;
}
.active .label {
  width: 96px;
  font: 600 11px var(--font);
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.6px;
}
.active small {
  color: var(--muted);
  font-size: 12px;
  margin-left: 4px;
}
.reset {
  border-color: color-mix(in srgb, var(--accent) 60%, transparent);
}
.reset-empty {
  margin: 14px auto 0;
  display: flex;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 16px;
}
.rows {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
/* the cards far off the screen are not drawn until they come near (a list of 1000 cards scrolls smoothly) */
.grid > :deep(.card) {
  content-visibility: auto;
  contain-intrinsic-size: auto 280px;
}
.rows > :deep(.card) {
  content-visibility: auto;
  contain-intrinsic-size: auto 64px;
}
.empty {
  color: var(--muted);
  padding: 40px 0;
  text-align: center;
}
.sentinel {
  height: 1px;
}
.more {
  margin: 24px auto 0;
  display: flex;
}
.foot {
  text-align: center;
  color: var(--muted);
  font-size: 12px;
  margin-top: 24px;
}
.rail {
  position: fixed;
  right: 4px;
  top: 50%;
  z-index: 26;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  max-height: 64vh;
  padding: 6px 2px;
  border-radius: 99px;
  background: rgba(10, 9, 16, 0.55);
  backdrop-filter: blur(8px);
  touch-action: none;
  user-select: none;
}
.rail button {
  flex: 1 1 0;
  min-height: 0;
  max-height: 22px;
  display: grid;
  place-items: center;
  padding: 0 6px;
  border: 0;
  background: none;
  color: rgba(255, 255, 255, 0.6);
  font: 700 10px/1 var(--font);
  cursor: pointer;
  overflow: hidden;
}
.rail button:hover,
.rail button.on {
  color: var(--accent);
}
.rail-bubble {
  position: fixed;
  right: 54px;
  top: 50%;
  z-index: 27;
  min-width: 64px;
  padding: 10px 16px;
  border-radius: 18px;
  transform: translateY(-50%);
  background: var(--accent);
  color: #0b0a12;
  font: 800 22px var(--font);
  text-align: center;
  box-shadow: 0 10px 30px var(--glow);
  pointer-events: none;
}
.pop-enter-active,
.pop-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: translateY(-50%) scale(0.8);
}
.sheet-actions {
  display: grid;
  gap: 10px;
}
.sheet-actions .ghost {
  justify-content: flex-start;
  height: 48px;
}
@media (max-width: 1100px) {
  .library {
    padding: 22px 22px 40px;
  }
  .hero {
    grid-template-columns: 160px 1fr;
  }
}
/* a phone: the featured song as a slim card, the tools in two rows, the songs as rows */
.library.phone {
  padding: 14px 16px 30px;
}
.phone .hero {
  grid-template-columns: 88px minmax(0, 1fr);
  gap: 14px;
  padding: 12px;
  border-radius: 20px;
  margin-bottom: 12px;
}
.phone .hero h1 {
  font-size: 19px;
  margin: 2px 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.phone .hero p {
  margin: 0 0 8px;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.phone .hero .stats,
.phone .hero .wide {
  display: none;
}
.phone .hero .actions {
  gap: 6px;
}
.phone .hero .actions button {
  height: 34px;
  padding: 0 12px;
  font-size: 13px;
}
.phone .heading {
  font-size: 26px;
  margin: 4px 0 12px;
}
.phone .tools {
  gap: 8px;
  margin: 0 -16px 10px;
  padding: 8px 16px;
  border-radius: 0;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35);
}
.phone .tools.away {
  transform: translateY(-110%);
  opacity: 0;
  pointer-events: none;
}
.phone .search {
  flex: 1 1 100%;
  min-width: 0;
  height: 44px;
}
.phone .search input {
  font-size: 16px; /* iOS zooms into a field below 16 px */
}
/* one row on a phone: the sort list gives way (its longest choice would push ⋯ onto a row of its own) */
.phone .tools select {
  flex: 1 1 0;
  min-width: 0;
  height: 40px;
}
.phone .tools .ghost {
  height: 40px;
  padding: 0 14px;
}
.phone .play-all span {
  display: none;
}
.phone .active .label {
  width: auto;
}
.phone .rail {
  right: 2px;
}
.phone .grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
</style>
