/**
 * Plenio Setup as a sidebar tab: registered at start, its page loaded only when it is first opened. It opens by
 * itself once after an install or an update that lacks files for a wanted template; later from the Plenio menu,
 * and at the row of a file a run stopped at. A dot on the tab says that the open workflow lacks a model file.
 */
import type { Fetcher } from '../api/client'
import type { ComfyApp } from '../shared/comfy'
import type { MountedSetup, SetupHost } from '../setup/mount'
import { type DownloadView, type PlanView, type SetupState, shouldOpen } from '../setup/model'

export const SETUP_TAB = 'plenio-setup'
export const SETUP_COMMAND = 'Plenio.OpenSetup'
export const DOWNLOAD_EVENT = 'plenio.download'

export interface SetupTabHost {
  app: ComfyApp
  fetcher: Fetcher & { addEventListener(type: string, listener: (event: CustomEvent) => void): void }
  openPlayer: (record?: string | null) => void
  openContinue: () => void
  /** Whether the open workflow lacks a model file (the tab's dot). */
  lacksFiles: () => boolean
}

/** The template's file among the templates ComfyUI serves for custom nodes (``/workflow_templates``). */
export async function templateUrl(fetcher: Fetcher, title: string): Promise<string | null> {
  const response = await fetcher.fetchApi('/workflow_templates')
  if (!response.ok) return null
  const listing = (await response.json()) as Record<string, string[]>
  for (const [pack, names] of Object.entries(listing)) {
    if (names.includes(title)) return `/workflow_templates/${encodeURIComponent(pack)}/${encodeURIComponent(title)}.json`
  }
  return null
}

export async function openTemplate(host: Pick<SetupTabHost, 'app' | 'fetcher'>, title: string): Promise<void> {
  const url = await templateUrl(host.fetcher, title)
  if (!url) throw new Error(`ComfyUI does not list the template ${title}.`)
  const response = await host.fetcher.fetchApi(url)
  if (!response.ok) throw new Error(`The template ${title} could not be read (${response.status}).`)
  await host.app.loadGraphData?.(await response.json(), true, true, title)
}

/** Setup opens by itself once per version, when a wanted template lacks files (``model.shouldOpen``). */
async function opensItself(fetcher: Fetcher): Promise<boolean> {
  const [stateAnswer, planAnswer] = await Promise.all([
    fetcher.fetchApi('/plenio/setup/state'),
    fetcher.fetchApi('/plenio/setup/plan')
  ])
  if (!stateAnswer.ok || !planAnswer.ok) return false // another computer: Setup is this one's
  const { state, version } = (await stateAnswer.json()) as { state: SetupState; version: string }
  const plan = (await planAnswer.json()) as PlanView
  if (!shouldOpen(state, version, plan)) return false
  await fetcher.fetchApi('/plenio/setup/state', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ opened_for: version })
  })
  return true
}

export function installSetupTab(host: SetupTabHost): { open(focus?: string | null): void } {
  let mounted: MountedSetup | null = null
  let focus: string | null = null
  const listeners = new Set<(download: DownloadView) => void>()
  host.fetcher.addEventListener(DOWNLOAD_EVENT, (event: CustomEvent) => {
    for (const listener of listeners) listener(event.detail as DownloadView)
  })
  const setupHost: SetupHost = {
    fetcher: host.fetcher,
    onDownloads: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    openTemplate: (title) =>
      void openTemplate(host, title).catch((error: unknown) =>
        host.app.extensionManager?.toast?.add({
          severity: 'error',
          summary: 'Plenio Setup',
          detail: String(error instanceof Error ? error.message : error),
          life: 12000
        })
      ),
    openPlayer: host.openPlayer,
    openContinue: host.openContinue
  }
  const manager = host.app.extensionManager
  manager?.registerSidebarTab?.({
    id: SETUP_TAB,
    icon: 'pi pi-box',
    title: 'Plenio',
    tooltip: 'Plenio Setup: the model files for your card, downloads, your first song',
    type: 'custom',
    iconBadge: () => (host.lacksFiles() ? '•' : null),
    render: (element) => {
      void import('../setup/mount').then(({ mountSetup }) => {
        mounted = mountSetup(element, setupHost, focus)
      })
    },
    destroy: () => {
      mounted?.unmount()
      mounted = null
    }
  })
  const open = (component: string | null = null): void => {
    focus = component
    mounted?.focus(component)
    if (manager?.sidebarTab?.activeSidebarTabId !== SETUP_TAB) {
      void manager?.command?.execute(`Workspace.ToggleSidebarTab.${SETUP_TAB}`)
    }
  }
  void opensItself(host.fetcher)
    .then((yes) => {
      if (yes) open()
    })
    .catch((error: unknown) => console.warn('Plenio: Setup could not check the plan', error))
  return { open }
}
