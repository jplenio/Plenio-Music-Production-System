import { createApp } from 'vue'

import App from './App.vue'
import { call, insidePlugin, useMock } from './bridge'
import './styles/base.css'

async function start(): Promise<void> {
  // outside the plug-in (development, `npm run build:mock` for pictures and tests) a demo answers; the plug-in's own
  // build leaves the demo out
  if (!insidePlugin() && (import.meta.env.DEV || import.meta.env.MODE === 'mock')) {
    const { mockCall } = await import('./mock/mock')
    useMock(mockCall)
  }
  window.addEventListener('keydown', (e) => {
    if (e.code !== 'Space' || e.repeat || e.ctrlKey || e.altKey || e.metaKey) return
    const target = e.target as HTMLElement | null
    if (target && (target.closest('input, textarea, select, [contenteditable="true"]') || target.isContentEditable)) return
    e.preventDefault()
    void call('host.key', { key: 'space' }).catch(() => undefined)
  })
  createApp(App).mount('#app')
}

void start()
