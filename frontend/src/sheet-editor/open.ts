/** Mount the Song Sheet dialog (loaded lazily, only when a sheet is opened). */
import { createApp } from 'vue'

import type { Fetcher } from '../api/client'
import type { SheetPayload } from '../shared/sheetSession'
import type { DocumentKind, SheetState } from '../shared/sheetState'
import dialogCss from './dialog.css?inline'
import SheetDialog from './SheetDialog.vue'

export interface OpenOptions {
  title: string
  state: SheetState
  payload: SheetPayload | null
  owned: DocumentKind[]
  review: string
  fetcher: Fetcher
  onApply: (state: SheetState) => void
}

function installCss(): void {
  if (document.getElementById('plenio-dialog-styles')) return
  const style = document.createElement('style')
  style.id = 'plenio-dialog-styles'
  style.textContent = dialogCss
  document.head.append(style)
}

export function openSheetDialog(options: OpenOptions): () => void {
  installCss()
  const host = document.createElement('div')
  document.body.append(host)
  const close = () => {
    app.unmount()
    host.remove()
  }
  const app = createApp(SheetDialog, {
    title: options.title,
    state: options.state,
    payload: options.payload,
    owned: options.owned,
    review: options.review,
    fetcher: options.fetcher,
    onApply: (state: SheetState) => {
      options.onApply(state)
      close()
    },
    onClose: close
  })
  app.mount(host)
  return close
}
