<script setup lang="ts">
// Every icon drawn for Plenio VST3 (24 x 24, stroked with the current colour).
defineProps<{ name: string; size?: number }>()
</script>

<template>
  <svg
    :width="size ?? 16"
    :height="size ?? 16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <template v-if="name === 'play'"><path d="M7 5.5v13l11-6.5z" fill="currentColor" stroke="none" /></template>
    <template v-else-if="name === 'stop'"><rect x="6.5" y="6.5" width="11" height="11" rx="2" fill="currentColor" stroke="none" /></template>
    <template v-else-if="name === 'sparkle'"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /><path d="M19 15.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" /></template>
    <template v-else-if="name === 'chevron-down'"><path d="M6 9l6 6 6-6" /></template>
    <template v-else-if="name === 'chevron-right'"><path d="M9 6l6 6-6 6" /></template>
    <template v-else-if="name === 'gear'"><circle cx="12" cy="12" r="3.2" /><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7" /></template>
    <template v-else-if="name === 'folder'"><path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2h7a2 2 0 0 1 2 2v7.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" /></template>
    <template v-else-if="name === 'library'"><rect x="4" y="4" width="4" height="16" rx="1" /><rect x="10" y="4" width="4" height="16" rx="1" /><path d="M16.5 5.2l3.6-1 3 15.4-3.6 1z" transform="translate(-2 0)" /></template>
    <template v-else-if="name === 'close'"><path d="M6 6l12 12M18 6L6 18" /></template>
    <template v-else-if="name === 'check'"><path d="M5 12.5l4.5 4.5L19 7.5" /></template>
    <template v-else-if="name === 'music'"><path d="M9 18V6l10-2v12" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="16.5" cy="16" r="2.5" /></template>
    <template v-else-if="name === 'mic'"><rect x="9" y="3.5" width="6" height="11" rx="3" /><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" /></template>
    <template v-else-if="name === 'wave'"><path d="M3 12h2M7 8v8M11 5v14M15 9v6M19 7v10M21 12h0" /></template>
    <template v-else-if="name === 'plus'"><path d="M12 5v14M5 12h14" /></template>
    <template v-else-if="name === 'trash'"><path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 12.5h9l1-12.5" /></template>
    <template v-else-if="name === 'undo'"><path d="M9 7L4.5 11.5 9 16" /><path d="M5 11.5h9a5 5 0 0 1 0 10h-2" /></template>
    <template v-else-if="name === 'star'"><path d="M12 3.5l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.8l6-.8z" fill="currentColor" stroke="none" /></template>
    <template v-else-if="name === 'refresh'"><path d="M19.5 9A8 8 0 0 0 5 7.5M4.5 15A8 8 0 0 0 19 16.5" /><path d="M19.5 4v5h-5M4.5 20v-5h5" /></template>
    <template v-else-if="name === 'power'"><path d="M12 3v8" /><path d="M7 6.2a7.5 7.5 0 1 0 10 0" /></template>
    <template v-else-if="name === 'download'"><path d="M12 4v11M7 10.5l5 5 5-5M5 19.5h14" /></template>
    <template v-else-if="name === 'drag'"><circle cx="9" cy="7" r="1.3" fill="currentColor" /><circle cx="15" cy="7" r="1.3" fill="currentColor" /><circle cx="9" cy="12" r="1.3" fill="currentColor" /><circle cx="15" cy="12" r="1.3" fill="currentColor" /><circle cx="9" cy="17" r="1.3" fill="currentColor" /><circle cx="15" cy="17" r="1.3" fill="currentColor" /></template>
    <template v-else-if="name === 'cover'"><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="2.5" /><path d="M12 3.5a8.5 8.5 0 0 1 8.5 8.5" /></template>
    <template v-else-if="name === 'pen'"><path d="M4.5 19.5l1-4.5L16 4.5l3.5 3.5L9 18.5z" /><path d="M13.5 7l3.5 3.5" /></template>
    <template v-else-if="name === 'lyrics'"><path d="M5 6h14M5 10h10M5 14h12M5 18h7" /></template>
    <template v-else-if="name === 'info'"><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5.5M12 7.7v.2" /></template>
    <template v-else-if="name === 'sliders'"><path d="M5 5v14M12 5v14M19 5v14" /><circle cx="5" cy="9" r="2" fill="var(--bg)" /><circle cx="12" cy="15" r="2" fill="var(--bg)" /><circle cx="19" cy="8" r="2" fill="var(--bg)" /></template>
    <template v-else-if="name === 'export'"><path d="M12 15V4M7.5 8.5L12 4l4.5 4.5" /><path d="M5 13v5.5a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5V13" /></template>
    <template v-else-if="name === 'zoom-in'"><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4 4M8.5 11h5M11 8.5v5" /></template>
    <template v-else-if="name === 'zoom-out'"><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4 4M8.5 11h5" /></template>
    <template v-else-if="name === 'follow'"><path d="M12 3v18" /><path d="M8 7l4-4 4 4" /><path d="M4 12h3M17 12h3" /></template>
    <template v-else-if="name === 'warning'"><path d="M12 4l9 16H3z" /><path d="M12 10v4.5M12 17.3v.2" /></template>
    <template v-else><circle cx="12" cy="12" r="3" /></template>
  </svg>
</template>
