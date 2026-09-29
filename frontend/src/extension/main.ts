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
import type { AsrNote, SheetPayload } from '../shared/sheetSession'
import { BRIEF_NODES, installBriefTemplatePanel } from './briefTemplate'
import { dynamicComboNames, restoreWidgetValues, savedWidgetValues } from './dynamicCombo'
import { addEqCurve } from './eqWidget'
import { MODE_BEFORE_0_2_2, migrateWidgetValues } from './migrate'
import { setAsrNote, setPayload } from './payloads'
import {
  type StatusHost,
  clearRunStates,
  installRunStatus,
  refreshRunStatus,
  setRunState,
  sheetState
} from './runStatus'
import { SHEET_STATE_TYPE, setFetcher, sheetStateWidget } from './sheetStateWidget'
import { addStemMixer } from './stemMixer'
import { installStyles } from './style'
import { addSummaryDisplay } from './summary'

export const EXTENSION_NAME = 'Plenio.Core'

interface ComfyApi extends Fetcher {
  addEventListener(type: string, listener: (event: CustomEvent) => void): void
}

const comfyApi = api as ComfyApi
setFetcher(comfyApi)
const comfyApp = app as ComfyApp

interface GraphNodes {
  nodes?: ComfyNode[]
  getNodeById?(id: number | string): ComfyNode | null | undefined
}

const graph = (): GraphNodes | undefined => comfyApp.graph as GraphNodes | undefined

/** A node of the open graph by the id an execution event names (a subgraph's inner nodes read ``outer:inner``). */
function nodeById(id: unknown): ComfyNode | null {
  if (id === null || id === undefined) return null
  const text = String(id)
  return graph()?.getNodeById?.(text.includes(':') ? text : Number(text)) ?? null
}

const statusHost: StatusHost = {
  scale: () => comfyApp.canvas?.ds?.scale ?? 1,
  toast: (summary, detail) => comfyApp.extensionManager?.toast?.add({ severity: 'info', summary, detail, life: 12000 })
}

;(app as ComfyApp).registerExtension({
  name: EXTENSION_NAME,
  getCustomWidgets: () => ({ [SHEET_STATE_TYPE]: sheetStateWidget }),
  // the sheets' review stops depend on the linked brief's mode: known once the links are in place
  afterConfigureGraph: () => refreshRunStatus(),
  beforeRegisterNodeDef(nodeType, nodeData) {
    if (!nodeData.name.startsWith('Plenio')) return
    addSummaryDisplay(nodeType)
    // where the run stands: a status badge per node, a frame where it stopped or failed (runStatus.ts)
    installRunStatus(nodeType, statusHost)
    const combos = dynamicComboNames(nodeData.input)
    if (combos.size || nodeData.name in MODE_BEFORE_0_2_2) {
      // Frontend 1.53.6 restores the values of a node with a DynamicCombo out of order (see
      // dynamicCombo.ts). Only configure itself still sees the saved values; onConfigure does not.
      // Values saved by an older Plenio are brought to the current layout first (migrate.ts).
      const configure = nodeType.prototype.configure
      nodeType.prototype.configure = function (this: ComfyNode, info: Record<string, unknown>) {
        const current = migrateWidgetValues(nodeData, info)
        const saved = savedWidgetValues(current)
        const result = configure?.call(this, current)
        restoreWidgetValues(this, saved, combos)
        return result
      }
    }
    if (nodeData.name === 'PlenioTranscribeLyrics') {
      nodeType.prototype.onExecuted = chain(nodeType.prototype.onExecuted, function (this: ComfyNode, output) {
        for (const note of (output?.plenio_asr as AsrNote[] | undefined) ?? []) setAsrNote(note)
      })
    }
    if (nodeData.name === 'PlenioEQ') {
      const curves = new WeakMap<ComfyNode, ReturnType<typeof addEqCurve>>()
      const created = (nodeType.prototype as ComfyNode & { onNodeCreated?: () => void }).onNodeCreated
      ;(nodeType.prototype as ComfyNode & { onNodeCreated?: () => void }).onNodeCreated = function (this: ComfyNode) {
        created?.call(this)
        curves.set(this, addEqCurve(this, comfyApi))
      }
      nodeType.prototype.onExecuted = chain(nodeType.prototype.onExecuted, function (this: ComfyNode, output) {
        curves.get(this)?.showExecuted(output)
      })
    }
    if (BRIEF_NODES.has(nodeData.name)) {
      // the template panel: what the template fills, and the explicit actions (M3/D6)
      installBriefTemplatePanel(nodeType, comfyApi)
    }
    if (nodeData.name === 'PlenioStemMixer') {
      // the mixer widget: strips, faders, sends and the muted ranges (M6/D12)
      const mixers = new WeakMap<ComfyNode, ReturnType<typeof addStemMixer>>()
      const created = (nodeType.prototype as ComfyNode & { onNodeCreated?: () => void }).onNodeCreated
      ;(nodeType.prototype as ComfyNode & { onNodeCreated?: () => void }).onNodeCreated = function (this: ComfyNode) {
        created?.call(this)
        mixers.set(this, addStemMixer(this))
      }
      nodeType.prototype.onExecuted = chain(nodeType.prototype.onExecuted, function (this: ComfyNode, output) {
        mixers.get(this)?.showExecuted(output)
      })
    }
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
      if (!payload?.node_id) return
      setPayload(String(payload.node_id), payload)
      const node = nodeById(payload.node_id)
      if (node) setRunState(node, sheetState(payload))
    })
    // A new run: the previous run's results go, so the canvas shows how far this run gets.
    comfyApi.addEventListener('execution_start', () => {
      clearRunStates(graph()?.nodes ?? [])
    })
    comfyApi.addEventListener('execution_error', (event: CustomEvent) => {
      const node = nodeById((event.detail as { node_id?: unknown } | undefined)?.node_id)
      if (node && String(node.type).startsWith('Plenio')) setRunState(node, 'error')
    })
  }
})
