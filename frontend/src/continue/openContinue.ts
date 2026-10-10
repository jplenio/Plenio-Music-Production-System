/** Mount the *Continue a song* dialog (loaded lazily, only when it is opened). */
import { createApp } from 'vue'

import type { Fetcher } from '../api/client'
import dialogCss from '../sheet-editor/dialog.css?inline'
import continueCss from './continue.css?inline'
import ContinueDialog from './ContinueDialog.vue'

function installCss(): void {
  for (const [id, css] of [
    ['plenio-dialog-styles', dialogCss],
    ['plenio-continue-styles', continueCss]
  ]) {
    if (document.getElementById(id)) continue
    const style = document.createElement('style')
    style.id = id
    style.textContent = css
    document.head.append(style)
  }
}

export function openContinueDialog(
  fetcher: Fetcher,
  onContinue: (request: { path: string } | { record: unknown; name: string }) => Promise<void>
): () => void {
  installCss()
  const host = document.createElement('div')
  document.body.append(host)
  const close = () => {
    app.unmount()
    host.remove()
  }
  const app = createApp(ContinueDialog, { fetcher, onContinue, onClose: close })
  app.mount(host)
  return close
}
