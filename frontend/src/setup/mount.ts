/** Mount Plenio Setup into the sidebar tab's element (loaded lazily: only when the tab is first opened). */
import { createApp, h, ref } from 'vue'

import type { Fetcher } from '../api/client'
import type { DownloadView } from './model'
import setupCss from './setup.css?inline'
import SetupPanel from './SetupPanel.vue'

export interface SetupHost {
  fetcher: Fetcher
  onDownloads: (listener: (download: DownloadView) => void) => () => void
  openTemplate: (title: string) => void
  openPlayer: (record?: string | null) => void
  openContinue: () => void
  problemContext: () => { workflow: unknown; error: unknown }
}

export interface MountedSetup {
  /** Show the row of this component first (a run stopped at its missing file). */
  focus(component: string | null): void
  unmount(): void
}

function installCss(): void {
  if (document.getElementById('plenio-setup-styles')) return
  const style = document.createElement('style')
  style.id = 'plenio-setup-styles'
  style.textContent = setupCss
  document.head.append(style)
}

export function mountSetup(element: HTMLElement, host: SetupHost, focus: string | null = null): MountedSetup {
  installCss()
  const focused = ref<string | null>(focus)
  const generation = ref(0)
  const app = createApp({
    render: () =>
      h(SetupPanel, {
        key: generation.value,
        fetcher: host.fetcher,
        onDownloads: host.onDownloads,
        openTemplate: host.openTemplate,
        openPlayer: host.openPlayer,
        openContinue: host.openContinue,
        problemContext: host.problemContext,
        focus: focused.value
      })
  })
  app.mount(element)
  return {
    focus(component) {
      focused.value = component
      generation.value += 1 // read the plan again: a run that stopped may have changed what is missing
    },
    unmount: () => app.unmount()
  }
}
