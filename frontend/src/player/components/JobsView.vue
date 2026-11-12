<script setup lang="ts">
/**
 * In the making (owner's request 2026-10-18): the videos and shared players waiting, being made and made - each
 * with how far it is, a stop, and when it is done: watch or try it, download, open the folder.
 */
import { INTROS, introShown } from '../intro'
const intro = introShown('jobs')
import { computed, ref } from 'vue'

import { api } from '../api'
import { type Job, finished, forgetFinished, forgetJob, jobs, progressOf, progressText, stopJob } from '../jobs'
import { formatTime } from '../timing'
import Icon from './Icon.vue'

const newestFirst = computed(() => [...jobs.value].reverse())
const error = ref('')

const sizeText = (bytes: number): string => (bytes > 2 ** 30 ? `${(bytes / 2 ** 30).toFixed(2)} GB` : `${Math.max(1, Math.round(bytes / 2 ** 20))} MB`)
const fileUrl = (job: Job, download = false): string => `/${job.kind === 'video' ? 'videos' : 'packages'}/${encodeURIComponent(job.file ?? '')}${download ? '?download=1' : ''}`

async function showFolder(job: Job): Promise<void> {
  error.value = ''
  try {
    if (job.kind === 'video') await api.openVideos(job.file ?? '')
    else await api.openPackages(job.file ?? '')
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  }
}
function stop(job: Job): void {
  if (job.state === 'working' && !window.confirm(`Stop making “${job.title}”?`)) return
  void stopJob(job)
}
</script>

<template>
  <div class="jobs-page">
    <header>
      <h1><Icon name="layers" :size="30" /> In the making</h1>
      <p v-if="intro" class="intro">{{ INTROS.jobs }}</p>
      <button v-if="finished.length" class="ghost" @click="forgetFinished"><Icon name="close" :size="16" /> Clear the finished</button>
    </header>
    <p class="lead">
      Videos (<b>Video…</b> on a song's page) and shared players (<b>Share…</b>) are made here in the background, each kind one after the other - go on listening meanwhile.
      A video is drawn by this page: it goes on in a tab in the background, but not when the page closes. A shared player is made by the player itself and goes on when the page closes.
    </p>
    <p v-if="!jobs.length" class="empty">Nothing in the making. A video or a shared player you start shows here, with how far it is.</p>
    <ul class="list">
      <li v-for="job in newestFirst" :key="job.id" :class="[job.state, job.kind]">
        <Icon class="kind" :name="job.kind === 'video' ? 'layers' : 'download'" :size="22" />
        <div class="main">
          <p class="title">
            <b>{{ job.title }}</b>
            <span class="what">{{ job.kind === 'video' ? 'video' : 'shared player' }} · {{ job.detail }}</span>
          </p>
          <div v-if="job.state === 'working' || job.state === 'waiting'" class="bar" :class="{ waiting: job.state === 'waiting' }"><i :style="{ width: `${Math.max(2, progressOf(job) * 100)}%` }" /></div>
          <p class="state">
            {{ progressText(job) }}
            <template v-if="job.kind === 'video' && job.state === 'working' && job.speed"> · {{ job.speed.toFixed(1) }}× as fast as it plays · {{ formatTime(job.left) }} left</template>
            <template v-if="job.state === 'done' && job.size"> · {{ job.files && job.files.length > 1 ? `${job.files.length} parts` : job.file }} · {{ sizeText(job.size) }}</template>
          </p>
          <p v-if="job.state === 'done' && job.files && job.files.length > 1" class="parts">
            <a v-for="f in job.files" :key="f.name" :href="`/packages/${encodeURIComponent(f.name)}?download=1`" :download="f.name"><Icon name="download" :size="12" /> {{ f.name }} <small>{{ sizeText(f.size) }}</small></a>
          </p>
        </div>
        <div class="actions">
          <button v-if="job.state === 'working' || job.state === 'waiting'" class="ghost small" @click="stop(job)"><Icon name="close" :size="14" /> Stop</button>
          <template v-if="job.state === 'done' && job.file">
            <a class="ghost small" :href="fileUrl(job)" target="_blank" rel="noopener"><Icon name="play" :size="14" /> {{ job.kind === 'video' ? 'Watch' : 'Try it' }}</a>
            <a v-if="!job.files || job.files.length < 2" class="ghost small" :href="fileUrl(job, true)" :download="job.file"><Icon name="download" :size="14" /> Download</a>
            <button class="ghost small" @click="showFolder(job)"><Icon name="folder" :size="14" /> Folder</button>
          </template>
          <button v-if="job.state !== 'working' && job.state !== 'waiting'" class="icon-btn" title="Take it off the list (the file stays)" @click="forgetJob(job)"><Icon name="close" :size="16" /></button>
        </div>
      </li>
    </ul>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<style scoped>
.intro {
  margin: 2px 0 10px;
  color: var(--muted);
}
.jobs-page {
  padding: 26px 34px 40px;
  max-width: 1100px;
}
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}
h1 {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 6px;
  font: 800 34px var(--font);
}
.lead,
.empty {
  color: var(--muted);
  max-width: 760px;
  line-height: 1.5;
}
.empty {
  padding: 30px 0;
}
.list {
  list-style: none;
  padding: 0;
  margin: 18px 0 0;
  display: grid;
  gap: 8px;
}
li {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  padding: 12px 16px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
}
li.working {
  border-color: color-mix(in srgb, var(--accent) 50%, transparent);
}
li.error {
  border-color: rgba(255, 120, 120, 0.45);
}
.kind {
  color: var(--accent);
}
.title {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 10px;
  align-items: baseline;
  margin: 0 0 6px;
}
.what {
  color: var(--muted);
  font-size: 12px;
}
.state {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--muted);
}
li.error .state {
  color: #ff9a9a;
}
li.done .state {
  color: #7fe0a0;
}
.bar {
  height: 8px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}
.bar i {
  display: block;
  height: 100%;
  background: var(--accent);
  transition: width 0.4s;
}
.bar.waiting i {
  background: rgba(255, 255, 255, 0.25);
}
.parts {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  margin: 6px 0 0;
  font-size: 12px;
}
.parts a {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #fff;
}
.parts small {
  color: var(--muted);
}
.actions {
  display: flex;
  gap: 6px;
  align-items: center;
}
.small {
  height: 32px;
  padding: 0 12px;
  font-size: 12px;
}
.error {
  color: #ff9a9a;
}
@media (max-width: 760px) {
  li {
    grid-template-columns: 1fr;
  }
}
</style>
