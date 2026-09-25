/**
 * Plenio frontend extension entry (built to web/js/plenio.js).
 *
 * Uses documented hooks only: registerExtension, getCustomWidgets,
 * beforeRegisterNodeDef, node callbacks and api events.
 */
// @ts-expect-error - provided by ComfyUI at runtime (scripts shim), kept external by the build
import { api } from '../../../scripts/api.js'
// @ts-expect-error - provided by ComfyUI at runtime (scripts shim), kept external by the build
import { app } from '../../../scripts/app.js'

import type { Fetcher } from '../api/client'
import { chain, type ComfyApp, type ComfyNode } from '../shared/comfy'
import type { SheetPayload } from '../shared/sheetSession'
import { setPayload } from './payloads'
import { SHEET_STATE_TYPE, setFetcher, sheetStateWidget } from './sheetStateWidget'
import { installStyles } from './style'
import { addSummaryDisplay } from './summary'

export const EXTENSION_NAME = 'Plenio.Core'

interface ComfyApi extends Fetcher {
  addEventListener(type: string, listener: (event: CustomEvent) => void): void
}

const comfyApi = api as ComfyApi
setFetcher(comfyApi)

;(app as ComfyApp).registerExtension({
  name: EXTENSION_NAME,
  getCustomWidgets: () => ({ [SHEET_STATE_TYPE]: sheetStateWidget }),
  beforeRegisterNodeDef(nodeType, nodeData) {
    if (!nodeData.name.startsWith('Plenio')) return
    addSummaryDisplay(nodeType)
    if (nodeData.name === 'PlenioSongSheet') {
      nodeType.prototype.onExecuted = chain(nodeType.prototype.onExecuted, function (this: ComfyNode, output) {
        const items = output?.plenio_sheet as SheetPayload[] | undefined
        const payload = items?.[items.length - 1]
        if (payload) setPayload(String(this.id), payload)
      })
    }
  },
  setup() {
    installStyles()
    // Sent by the Song Sheet before it stops with a conflict or validation error.
    comfyApi.addEventListener('plenio.sheet', (event: CustomEvent) => {
      const payload = event.detail as SheetPayload
      if (payload?.node_id) setPayload(String(payload.node_id), payload)
    })
  }
})
