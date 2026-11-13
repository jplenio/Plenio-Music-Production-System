<script setup lang="ts">
import SidePanel from './SidePanel.vue'
import SongHeader from './SongHeader.vue'
import Timeline from './Timeline.vue'

defineEmits<{ new: [] }>()
</script>

<template>
  <div class="song-view">
    <SongHeader />
    <div class="body">
      <SidePanel />
      <Timeline />
    </div>
  </div>
</template>

<style scoped>
.song-view {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.body {
  flex: 1;
  min-height: 0;
  display: flex;
}
</style>
