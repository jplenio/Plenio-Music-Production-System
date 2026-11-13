<script setup lang="ts">
import { store } from '../store'
import Icon from './Icon.vue'
</script>

<template>
  <div class="toasts">
    <TransitionGroup name="toast">
      <div v-for="t in store.toasts" :key="t.id" class="toast" :class="{ problem: t.problem }">
        <Icon :name="t.problem ? 'warning' : 'check'" :size="15" />
        <span>{{ t.text }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toasts {
  position: fixed;
  right: 16px;
  bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 80;
  max-width: 420px;
  pointer-events: none;
}
.toast {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 10px 14px;
  border-radius: 10px;
  background: #221d30;
  border: 1px solid var(--line-strong);
  box-shadow: var(--shadow);
  font-size: 12.5px;
  line-height: 1.45;
}
.toast svg {
  flex: none;
  margin-top: 1px;
  color: var(--ok);
}
.toast.problem svg {
  color: var(--amber);
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.2s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
