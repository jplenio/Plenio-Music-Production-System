<script setup lang="ts">
/** A song in the library: its cover with a play button, the title, genre and length, its marks and your tags
 * (a click on a tag shows the songs with it); playing, it moves. A click opens the song's page (▶ plays, and
 * so does a double click in the list). */
import type { SongSummary } from '../api'
import { isNew } from '../live'
import { isPhone } from '../layout'
import { current, go, isFavorite, openSong, playing, songTags, openNowPlaying } from '../store'
import { formatTime } from '../timing'
import CoverArt from './CoverArt.vue'
import Icon from './Icon.vue'

const props = defineProps<{ song: SongSummary; snippet?: string | null; list?: boolean; index?: number }>()
const emit = defineEmits<{ play: []; menu: [event: MouseEvent]; tag: [tag: string] }>()

/** The title opens the song's page - in a phone's rows a tap anywhere plays the song (the page is in its menu). */
function titleClick(event: MouseEvent): void {
  if (props.list && isPhone.value) return
  event.stopPropagation()
  open(event)
}
/** The song's page, its cover gliding there from this card. */
function open(event: Event): void {
  const card = (event.currentTarget as HTMLElement | null)?.closest('.card')
  openSong(props.song.id, card?.querySelector('.cover'))
}
</script>

<template>
  <article
    class="card"
    :class="{ list, now: current?.id === song.id, playing: current?.id === song.id && playing }"
    tabindex="0"
    :title="list ? undefined : `${song.title} - open its page`"
    @click="list ? isPhone && emit('play') : open($event)"
    @dblclick="list && !isPhone && emit('play')"
    @keydown.enter="open($event)"
    @contextmenu.prevent="emit('menu', $event)"
  >
    <div class="art">
      <CoverArt :song="song" :live="current?.id === song.id && playing" rounded :size="list ? 56 : 240" />
      <button class="play" title="Play" @click.stop="emit('play')"><Icon :name="current?.id === song.id && playing ? 'pause' : 'play'" :size="22" /></button>
      <span v-if="current?.id === song.id && playing" class="eq" role="button" title="Now playing" @click.stop="openNowPlaying(($event.currentTarget as Element).parentElement)"><i /><i /><i /><i /></span>
    </div>
    <div class="text">
      <a class="title" @click="titleClick">{{ song.title }}</a>
      <p class="sub">
        <span>{{ song.other ? song.artist || song.genre || '—' : song.genre || song.style.split(',')[0] || '—' }}</span>
        <span class="dot">·</span>
        <span>{{ formatTime(song.seconds) }}</span>
      </p>
      <p v-if="snippet" class="snippet">“{{ snippet }}”</p>
      <p class="tags">
        <button v-for="t in songTags(song.id)" :key="t" class="tag mine" :title="`Your tag - the songs with #${t}`" @click.stop="emit('tag', t)">#{{ t }}</button>
        <span v-if="isNew(song.id)" class="tag new" title="Made while Live Play was on">new</span>
        <span v-if="song.other" class="tag other" title="Not made with Plenio: it plays with what its file has">other music</span>
        <span v-if="song.model" class="tag model">{{ song.model.replace('MiniMax Music 3', 'MiniMax') }}</span>
        <span v-if="song.kind === 'cover'" class="tag">cover</span>
        <span v-if="song.instrumental" class="tag">instrumental</span>
        <span v-if="song.has.pdf" class="tag">sheet</span>
        <span v-if="song.has.timing || song.has.lines" class="tag">lyrics ⏱</span>
        <span v-if="song.arrangement && song.arrangement !== 'off'" class="tag">{{ song.arrangement }}</span>
      </p>
    </div>
    <span v-if="list" class="len">{{ song.bpm ? `${song.bpm} BPM` : '' }}</span>
    <span v-if="list" class="len">{{ song.created.slice(0, 10) }}</span>
    <Icon v-if="isFavorite(song.id)" class="fav" name="heart" filled :size="16" />
    <button v-if="list" class="icon-btn info" title="The song's page" @click.stop="go(`/song/${song.id}`)"><Icon name="info" /></button>
    <button class="more icon-btn" title="More" @click.stop="emit('menu', $event)"><Icon name="more" /></button>
  </article>
</template>

<style scoped>
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.04);
  transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), background 0.25s, box-shadow 0.25s;
  outline: none;
  animation: rise 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}
.card:not(.list) {
  cursor: pointer;
}
.card:hover,
.card:focus-visible {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.06);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
}
.card.now {
  border-color: color-mix(in srgb, var(--accent) 50%, transparent);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent) 40%, transparent), 0 18px 50px var(--glow);
}
/* back on the songs' page: the song that plays lights up for a moment, so the eye finds it */
.card.found {
  box-shadow: 0 0 0 2px var(--accent), 0 0 46px color-mix(in srgb, var(--accent) 55%, transparent);
}
.art {
  position: relative;
}
.play {
  position: absolute;
  right: 10px;
  bottom: 10px;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  border: 0;
  display: grid;
  place-items: center;
  background: var(--accent);
  color: #0b0a12;
  cursor: pointer;
  opacity: 0;
  transform: translateY(8px) scale(0.9);
  transition: opacity 0.2s, transform 0.25s;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}
.card:hover .play,
.card.now .play {
  opacity: 1;
  transform: none;
}
.eq {
  position: absolute;
  left: 12px;
  bottom: 12px;
  display: flex;
  gap: 3px;
  align-items: flex-end;
  height: 18px;
}
.eq i {
  width: 4px;
  background: #fff;
  border-radius: 2px;
  animation: eq 0.9s ease-in-out infinite;
}
.eq i:nth-child(2) {
  animation-delay: -0.3s;
}
.eq i:nth-child(3) {
  animation-delay: -0.6s;
}
.eq i:nth-child(4) {
  animation-delay: -0.15s;
}
.title {
  display: block;
  font: 600 15px/1.3 var(--font);
  color: #fff;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.title:hover {
  color: var(--accent);
}
.sub,
.snippet,
.tags {
  margin: 3px 0 0;
  font: 12px var(--font);
  color: var(--muted);
}
.sub {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dot {
  margin: 0 5px;
}
.snippet {
  font-style: italic;
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.tag {
  font-size: 10px;
  padding: 2px 7px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.07);
  color: rgba(255, 255, 255, 0.7);
}
.tag.new {
  color: #fff;
  border-color: transparent;
  background: #e5484d;
}
/* your own tags: the accent, and a click shows the songs with it */
.tag.mine {
  border: 0;
  cursor: pointer;
  font: 600 10px var(--font);
  color: #fff;
  background: color-mix(in srgb, var(--accent) 34%, transparent);
}
.tag.mine:hover {
  background: color-mix(in srgb, var(--accent) 55%, transparent);
}
.tag.other {
  color: #ffd9a0;
  border-color: rgba(255, 190, 90, 0.45);
  background: rgba(255, 170, 60, 0.12);
}
.tag.model {
  background: color-mix(in srgb, var(--accent) 22%, transparent);
  color: #fff;
}
.fav {
  position: absolute;
  top: 18px;
  left: 18px;
  color: #ff5f8f;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.6));
}
.more {
  position: absolute;
  top: 16px;
  right: 16px;
  opacity: 0;
  background: rgba(0, 0, 0, 0.45);
}
.card:hover .more {
  opacity: 1;
}
/* the list view */
.card.list {
  flex-direction: row;
  align-items: center;
  padding: 6px 10px;
  border-radius: 12px;
  animation: none;
}
.card.list:hover {
  transform: none;
}
.card.list .art {
  width: 48px;
  flex: none;
}
.card.list .play {
  width: 30px;
  height: 30px;
  right: 9px;
  bottom: 9px;
}
.card.list .text {
  flex: 1;
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(180px, 2fr) 1fr;
  align-items: center;
  column-gap: 16px;
}
.card.list .tags {
  grid-column: 2;
  grid-row: 1 / span 2;
}
.card.list .snippet {
  display: none;
}
.card.list .fav {
  position: static;
  margin-right: 4px;
}
.card.list .more {
  position: static;
}
.len {
  font: 12px var(--mono);
  color: var(--muted);
  width: 90px;
  text-align: right;
}
/* a touch screen has no hover: the play and the more buttons show always */
@media (hover: none) {
  .card .play,
  .card .more {
    opacity: 1;
    transform: none;
  }
  .card:hover {
    transform: none;
    box-shadow: none;
  }
}
/* a phone's rows: the cover, the title and its genre and length, the heart and the menu - no columns of facts */
@media (max-width: 700px) {
  .card.list {
    gap: 12px;
    padding: 6px 4px 6px 6px;
    min-height: 60px;
  }
  .card.list .text {
    display: block;
  }
  .card.list .tags,
  .card.list .len,
  .card.list .info {
    display: none;
  }
  .card.list .title {
    font-size: 15px;
  }
  .card.list .more {
    background: none;
    color: var(--muted);
  }
  .card.list .play {
    opacity: 0;
  }
  .card.list.now .play {
    opacity: 1;
  }
  .card:not(.list) {
    padding: 8px;
    gap: 8px;
    border-radius: 16px;
  }
  .card:not(.list) .play {
    width: 40px;
    height: 40px;
    right: 8px;
    bottom: 8px;
  }
  .card:not(.list) .tags {
    display: none;
  }
  .card:not(.list) .more {
    top: 12px;
    right: 12px;
  }
}
@keyframes eq {
  0%,
  100% {
    height: 4px;
  }
  50% {
    height: 18px;
  }
}
@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
}
</style>
