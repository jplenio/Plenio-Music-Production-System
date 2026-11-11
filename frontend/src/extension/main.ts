/**
 * Plenio frontend extension entry (built to web/js/plenio.js).
 *
 * Uses documented hooks only: registerExtension (with commands and menu commands), getCustomWidgets,
 * beforeRegisterNodeDef, beforeConfigureGraph, node callbacks, api events and app.loadGraphData.
 */
// @ts-expect-error - provided by ComfyUI at runtime (scripts shim), kept external by the build
import { api } from '../../../scripts/api.js'
// @ts-expect-error - provided by ComfyUI at runtime (scripts shim), kept external by the build
import { app } from '../../../scripts/app.js'

import { type Fetcher, PlenioApiError, upgradeBlocks } from '../api/client'
import { chain, type ComfyApp, type ComfyNode } from '../shared/comfy'
import type { AsrNote, SheetPayload } from '../shared/sheetSession'
import {
  MODEL_BLOCKS_COMMAND,
  blocksMessages,
  bringBlocksUpToDate,
  modelBlocksMessages,
  oldModelBlocksMessage
} from './blocks'
import { MAX_TOKENS, raiseLlmLimits } from './llmLimits'
import { installBriefLists } from './briefChoices'
import { BRIEF_NODES, installBriefTemplatePanel } from './briefTemplate'
import { CONTINUE_COMMAND, type ContinueHost, installRecordDrop, openContinueSong } from './continueSong'
import { dynamicComboNames, restoreWidgetValues, savedWidgetValues } from './dynamicCombo'
import { addEqCurve } from './eqWidget'
import { MODE_BEFORE_0_2_2, migrateWidgetValues, renameWidgetValues } from './migrate'
import {
  MISSING_EVENT,
  MODEL_CHOICE,
  type MissingDetail,
  ModelChoiceLabels,
  componentOf,
  lacksFile,
  missingNotice
} from './modelChoice'
import { setAsrNote, setPayload } from './payloads'
import { PLAYER_COMMAND, installContinueFromPlayer, installPlayerButton, openPlayer } from './player'
import { ReviewQueue } from './reviewQueue'
import {
  type StatusHost,
  clearRunStates,
  installRunStatus,
  refreshRunStatus,
  setRunState,
  sheetState
} from './runStatus'
import { type SheetMusicHost, type SheetMusicOutcome, SheetMusicJobs, sheetMusicJobs } from './sheetMusic'
import { SEED_NODE, installSeedNode } from './seedNode'
import { SETUP_COMMAND, installSetupTab } from './setupTab'
import { installSeedsFollowMode } from './seedsFollowMode'
import { SHEET_STATE_TYPE, setFetcher, sheetStateWidget } from './sheetStateWidget'
import { FINISH_SWITCH_TYPE, finishSwitchWidget, refreshFinishSwitches, setCover } from './finishSwitch'
import { NONE as NO_PRESET, PRESET_NODE, applyChanges, changesFor } from './preset'
import { RELOAD_HINT, codeIsStale, importOrReload, loadFresh } from './staleCode'
import { addStemMixer } from './stemMixer'
import { installStyles } from './style'
import { addSummaryDisplay, setSummaryLine } from './summary'
import { type CanvasLike, installTooltipPlacement } from './tooltipPlacement'

export const EXTENSION_NAME = 'Plenio.Core'

interface ComfyApi extends Fetcher {
  addEventListener(type: string, listener: (event: CustomEvent) => void): void
}

const comfyApi = api as ComfyApi
setFetcher(comfyApi)
const comfyApp = app as ComfyApp
const continueHost: ContinueHost = { app: comfyApp, fetcher: comfyApi }
const playerHost = { app: comfyApp, fetcher: comfyApi }

interface GraphNodes {
  nodes?: ComfyNode[]
  getNodeById?(id: number | string): ComfyNode | null | undefined
}

const graph = (): GraphNodes | undefined => comfyApp.graph as GraphNodes | undefined

/** Plenio › Bring the model blocks up to date: the open workflow's 1.x model blocks get Model Choice, their files
 * kept as pins (core/blocks.py ``upgrade_models``), and the workflow is loaded again in its tab. */
async function modelBlocksUpToDate(): Promise<void> {
  const toast = (message: { severity: string; summary: string; detail: string }) =>
    comfyApp.extensionManager?.toast?.add({ ...message, life: 20000 })
  try {
    const current = (comfyApp.graph as { serialize?: () => unknown } | undefined)?.serialize?.()
    if (!current) return
    const answer = await upgradeBlocks(comfyApi, current, true)
    // into the open tab (its workflow object): without it the frontend opens a new, unsaved tab
    const active = comfyApp.extensionManager?.workflow?.activeWorkflow ?? null
    if (answer.workflow && comfyApp.loadGraphData) await comfyApp.loadGraphData(answer.workflow, false, true, active)
    for (const message of modelBlocksMessages(answer)) toast(message)
  } catch (error) {
    const detail = error instanceof PlenioApiError && error.hint ? `${error.message} ${error.hint}` : String(error)
    toast({ severity: 'error', summary: 'Model blocks not brought up to date', detail })
  }
}

/** Model Choice's fields: the plan's file beside *auto*, files that do not fit marked (modelChoice.ts). */
const modelLabels = new ModelChoiceLabels(comfyApi)

type BlockNode = ComfyNode & { subgraph?: { nodes?: ComfyNode[] } }

let labelsTimer: number | undefined
/** One reading of the facts after the Model Choices of a run have executed (each would ask on its own). */
function refreshLabelsSoon(): void {
  window.clearTimeout(labelsTimer)
  labelsTimer = window.setTimeout(() => void modelLabels.refresh().then(labelModelChoices), 1500)
}

/** Labels on every Model Choice of the open graph, inside blocks too, and on the blocks' promoted fields. */
function labelModelChoices(): void {
  for (const node of (graph()?.nodes ?? []) as BlockNode[]) {
    if (node.type === MODEL_CHOICE) modelLabels.label(node)
    for (const inner of node.subgraph?.nodes ?? []) if (inner.type === MODEL_CHOICE) modelLabels.label(inner)
    if (node.subgraph) modelLabels.labelBlock(node)
  }
  ;(comfyApp.graph as { setDirtyCanvas?: (a: boolean, b: boolean) => void } | undefined)?.setDirtyCanvas?.(true, true)
}

/** Whether a Model Choice of the open workflow has no file to give (Setup's dot). */
function workflowLacksFiles(): boolean {
  for (const node of (graph()?.nodes ?? []) as BlockNode[]) {
    for (const choice of [node, ...(node.subgraph?.nodes ?? [])]) {
      if (choice.type !== MODEL_CHOICE) continue
      const value = choice.widgets?.find((w) => w.name === 'component.file')?.value
      if (lacksFile(value, modelLabels.info(componentOf(choice)))) return true
    }
  }
  return false
}

let setupTab: { open(focus?: string | null): void } | null = null

/** A preset chosen in a template's Preset field: its fields set in the page, one undo step (preset.ts). */
async function applyPresetChoice(preset: string): Promise<void> {
  if (preset === NO_PRESET) return
  const graphNow = comfyApp.graph as (GraphNodes & { extra?: { plenio_api?: { id?: string } } }) | undefined
  const template = graphNow?.extra?.plenio_api?.id
  const toast = comfyApp.extensionManager?.toast
  if (!graphNow || !template) {
    toast?.add({ severity: 'info', summary: 'Preset', detail: 'This workflow is not a Plenio template: the preset sets nothing here.', life: 8000 })
    return
  }
  try {
    const changes = (await changesFor(comfyApi, template))[preset] ?? []
    const changed = applyChanges(graphNow, changes, (name, on) => {
      if (name === 'cover') setCover(graphNow as Parameters<typeof setCover>[0], on)
    })
    refreshFinishSwitches()
    ;(comfyApp.graph as { setDirtyCanvas?: (a: boolean, b: boolean) => void } | undefined)?.setDirtyCanvas?.(true, true)
    const workflow = comfyApp.extensionManager?.workflow?.activeWorkflow as { changeTracker?: { checkState?: () => void } } | undefined
    workflow?.changeTracker?.checkState?.()
    toast?.add({ severity: 'success', summary: 'Preset', detail: changed.length ? `Set: ${changed.join(', ')} (Ctrl+Z takes it back)` : 'Everything was set already.', life: 6000 })
  } catch (error) {
    console.error('Plenio: the preset could not be applied', error)
  }
}
/** The last error a run of this page gave (a problem report carries it). */
let lastRunError: unknown = null

/** A node of the open graph by the id an execution event names (a subgraph's inner nodes read ``outer:inner``). */
function nodeById(id: unknown): ComfyNode | null {
  if (id === null || id === undefined) return null
  const text = String(id)
  return graph()?.getNodeById?.(text.includes(':') ? text : Number(text)) ?? null
}

/** A brief's own value for a list field: the frontend's prompt dialog (the browser's on an older frontend). */
async function askOwnValue(field: string, current: string): Promise<string | null> {
  const message = `Your own ${field.replace('_', ' ')} - any text; the list holds the style templates' values.`
  const dialog = comfyApp.extensionManager?.dialog
  if (dialog?.prompt) return dialog.prompt({ title: 'Plenio · your own value', message, defaultValue: current })
  return window.prompt(message, current)
}

/** Runs that stop for review, queued in a series: a warning (reviewQueue.ts). */
const reviewQueue = new ReviewQueue((notice) =>
  comfyApp.extensionManager?.toast?.add({ severity: 'warn', summary: notice.summary, detail: notice.detail, life: 20000 })
)

const statusHost: StatusHost = {
  scale: () => comfyApp.canvas?.ds?.scale ?? 1,
  toast: (summary, detail) => comfyApp.extensionManager?.toast?.add({ severity: 'info', summary, detail, life: 12000 })
}

/** This page runs older Plenio code than the files ComfyUI serves now (updated while the page was open). */
const stale = (): Promise<boolean> => codeIsStale(import.meta.url, loadFresh)

/** Export Release's sheet music: drawn here with the score editor's notation code, saved by Plenio. */
const sheetHost: SheetMusicHost = {
  fetcher: comfyApi,
  async draw(abc, title, paper, size) {
    const { notationPdf, renderLines } = await importOrReload(
      () => import('../sheet-editor/score/notationExport'),
      stale,
      'The sheet music is drawn and saved then.'
    )
    const drawing = renderLines(abc, title, paper, size)
    try {
      if (!drawing.lines.length) throw new Error('the score has no music to draw')
      return await notationPdf(drawing.lines, paper, title)
    } finally {
      drawing.dispose()
    }
  }
}

/** The Export Release node of the open workflow that announced ``file`` (none when another workflow is open). */
function exportNodeOf(nodeId: unknown, file: string): ComfyNode | null {
  const node = nodeById(nodeId)
  const summary = node?.properties?.plenio_summary as { markdown?: string } | undefined
  return node?.type === 'PlenioExportRelease' && summary?.markdown?.includes(`- sheet music: ${file}`) ? node : null
}

function sheetOutcome(outcome: SheetMusicOutcome, nodeId: unknown): void {
  const prefix = `- sheet music: ${outcome.job.file}`
  const node = exportNodeOf(nodeId, outcome.job.file)
  if ('saved' in outcome) {
    if (node) setSummaryLine(node, prefix, `${prefix} - saved (${Math.max(1, Math.round(outcome.saved.bytes / 1024))} KB)`)
    comfyApp.extensionManager?.toast?.add({ severity: 'success', summary: 'Sheet music saved', detail: outcome.saved.file, life: 6000 })
    return
  }
  const { error } = outcome
  const message = error instanceof PlenioApiError && error.hint ? `${error.message} ${error.hint}` : String(error instanceof Error ? error.message : error)
  if (outcome.quiet) {
    console.info(`Plenio: ${outcome.job.file} was saved by another page`)
    return
  }
  if (node) setSummaryLine(node, prefix, `${prefix} - not saved: ${message}`, 'warning')
  comfyApp.extensionManager?.toast?.add({ severity: 'error', summary: 'Sheet music not saved', detail: `${outcome.job.file}: ${message}`, life: 15000 })
}

/** The Export Release node (execution id) each job came from; recovered jobs have none. */
const jobNodes = new Map<string, unknown>()
/** The sheet music jobs of this page: from every execution, and the ones still waiting on the server. */
const sheetJobs = new SheetMusicJobs(sheetHost, (outcome) => {
  sheetOutcome(outcome, jobNodes.get(outcome.job.token))
  jobNodes.delete(outcome.job.token)
})

;(app as ComfyApp).registerExtension({
  name: EXTENSION_NAME,
  getCustomWidgets: () => ({ [SHEET_STATE_TYPE]: sheetStateWidget, [FINISH_SWITCH_TYPE]: finishSwitchWidget }),
  // a song's release record opens its workflow again, its documents kept (continueSong.ts)
  commands: [
    {
      id: CONTINUE_COMMAND,
      label: 'Continue a Plenio song…',
      icon: 'pi pi-history',
      function: () =>
        openContinueSong(continueHost).catch((error: unknown) => {
          console.error('Plenio: the Continue a song dialog could not open', error)
          comfyApp.extensionManager?.toast?.add({
            severity: 'error',
            summary: 'Continue a song',
            detail: String(error instanceof Error ? error.message : error),
            life: 15000
          })
        })
    },
    { id: PLAYER_COMMAND, label: 'Plenio Player', icon: 'pi pi-play-circle', function: () => openPlayer(playerHost) },
    { id: SETUP_COMMAND, label: 'Plenio Setup', icon: 'pi pi-box', function: () => setupTab?.open() },
    {
      id: MODEL_BLOCKS_COMMAND,
      label: 'Bring the model blocks up to date',
      icon: 'pi pi-sync',
      function: () => void modelBlocksUpToDate()
    }
  ],
  menuCommands: [
    { path: ['File'], commands: [CONTINUE_COMMAND, MODEL_BLOCKS_COMMAND] },
    { path: ['Plenio'], commands: [SETUP_COMMAND, PLAYER_COMMAND, CONTINUE_COMMAND, MODEL_BLOCKS_COMMAND] }
  ],
  // the Plenio Player, one click away beside Run (player.ts): started as a program of its own when none runs
  actionBarButtons: [
    {
      icon: 'pi pi-play-circle',
      label: 'Plenio Player',
      tooltip: 'Open the Plenio Player: your songs with live lyrics, sheet music and visuals (starts it if needed)',
      onClick: () => void openPlayer(playerHost)
    }
  ],
  // a workflow saved before its blocks followed the brief's creativity: they are brought up to date before
  // the frontend configures it (blocks.ts); loading goes on as it was when that fails
  async beforeConfigureGraph(graphData) {
    // the blocks' LLM nodes get 1.5.0's answer length where they have the one an earlier version shipped
    const raised = raiseLlmLimits(graphData)
    if (raised.length) console.info(`Plenio: longer LLM answers (${MAX_TOKENS} tokens) in ${raised.join(', ')}`)
    // model blocks saved before Model Choice run as they are: said once, the command offered (blocks.ts)
    const models = oldModelBlocksMessage(graphData)
    if (models) comfyApp.extensionManager?.toast?.add({ ...models, life: 20000 })
    try {
      const answer = await bringBlocksUpToDate(graphData, comfyApi)
      for (const message of blocksMessages(answer)) comfyApp.extensionManager?.toast?.add({ ...message, life: 20000 })
    } catch (error) {
      console.error('Plenio: the blocks of this workflow could not be brought up to date', error)
      const detail = error instanceof PlenioApiError && error.hint ? `${error.message} ${error.hint}` : String(error instanceof Error ? error.message : error)
      comfyApp.extensionManager?.toast?.add({
        severity: 'warn',
        summary: "Plenio blocks not brought up to date - the brief's creativity may not reach their sampling",
        detail,
        life: 20000
      })
    }
  },
  // the sheets' review stops depend on the linked brief's mode: known once the links are in place
  afterConfigureGraph: () => {
    labelModelChoices()
    refreshRunStatus()
    // the Cover Art switch shows what the loaded workflow's cover nodes do
    refreshFinishSwitches()
  },
  async beforeRegisterNodeDef(nodeType, nodeData) {
    if (!nodeData.name.startsWith('Plenio')) return
    // the briefs' text fields as lists of the templates' values, one's own value always possible (briefChoices.ts);
    // before anything else: the frontend makes the widgets from the definition once this hook is done
    if (BRIEF_NODES.has(nodeData.name)) await installBriefLists(nodeType, nodeData, comfyApi, askOwnValue)
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
        renameWidgetValues(nodeData.name, this.widgets)
        return result
      }
    }
    if (nodeData.name === 'PlenioTranscribeLyrics') {
      nodeType.prototype.onExecuted = chain(nodeType.prototype.onExecuted, function (this: ComfyNode, output) {
        for (const note of (output?.plenio_asr as AsrNote[] | undefined) ?? []) setAsrNote(note)
      })
    }
    if (nodeData.name === PRESET_NODE) {
      const created = (nodeType.prototype as ComfyNode & { onNodeCreated?: () => void }).onNodeCreated
      ;(nodeType.prototype as ComfyNode & { onNodeCreated?: () => void }).onNodeCreated = function (this: ComfyNode) {
        created?.call(this)
        const widget = this.widgets?.find((w) => w.name === 'preset') as { callback?: (value: unknown) => void } | undefined
        if (!widget) return
        const own = widget.callback
        widget.callback = (value: unknown) => {
          own?.(value)
          void applyPresetChoice(String(value))
        }
      }
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
    if (nodeData.name === MODEL_CHOICE) {
      const created = (nodeType.prototype as ComfyNode & { onNodeCreated?: () => void }).onNodeCreated
      ;(nodeType.prototype as ComfyNode & { onNodeCreated?: () => void }).onNodeCreated = function (this: ComfyNode) {
        created?.call(this)
        modelLabels.label(this)
        // another component makes the file field anew: label the new one
        const component = this.widgets?.find((w) => w.name === 'component')
        if (component) {
          component.callback = chain(component.callback, () => window.setTimeout(() => modelLabels.label(this), 0))
        }
      }
      // what is installed may have changed with the run: the labels follow, once for all Model Choices of a run
      nodeType.prototype.onExecuted = chain(nodeType.prototype.onExecuted, function (this: ComfyNode) {
        refreshLabelsSoon()
      })
    }
    if (nodeData.name === 'PlenioExportRelease') {
      // a button that opens the Plenio Player at the song just exported (player.ts)
      installPlayerButton(nodeType, playerHost)
    }
    if (nodeData.name === SEED_NODE) {
      // one switch: a new seed drawn before every run, or the same seed again (seedNode.ts)
      installSeedNode(nodeType)
    }
    if (BRIEF_NODES.has(nodeData.name)) {
      // the template panel: what the template fills, and the explicit actions (M3/D6)
      installBriefTemplatePanel(nodeType, comfyApi)
      // a run that stops for review, queued in a series: say so (reviewQueue.ts)
      const created = (nodeType.prototype as ComfyNode & { onNodeCreated?: () => void }).onNodeCreated
      ;(nodeType.prototype as ComfyNode & { onNodeCreated?: () => void }).onNodeCreated = function (this: ComfyNode) {
        created?.call(this)
        reviewQueue.watch(this)
        // runs without a stop draw every seed anew, runs with review stops keep the song's (seedsFollowMode.ts)
        installSeedsFollowMode(this, (summary, detail) =>
          comfyApp.extensionManager?.toast?.add({ severity: 'info', summary, detail, life: 10000 })
        )
      }
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
  // R: the lists are read again - and the facts behind the labels (ComfyUI then copies the inner fields' options,
  // labels included, to the blocks' promoted fields)
  async refreshComboInNodes() {
    await modelLabels.refresh()
    labelModelChoices()
  },
  setup() {
    installStyles()
    void modelLabels.refresh().then(labelModelChoices)
    // Plenio Setup in the sidebar: opens by itself once when a wanted template lacks files (setupTab.ts)
    setupTab = installSetupTab({
      app: comfyApp,
      fetcher: comfyApi,
      openPlayer: (record) => void openPlayer(playerHost, record ?? null),
      openContinue: () =>
        void openContinueSong(continueHost).catch((error: unknown) =>
          console.error('Plenio: the Continue a song dialog could not open', error)
        ),
      problemContext: () => ({
        workflow: (comfyApp.graph as { serialize?: () => unknown } | undefined)?.serialize?.() ?? null,
        error: lastRunError
      }),
      lacksFiles: workflowLacksFiles
    })
    // a run stopped at a model file that is not there: what to do, and Setup at that file's row
    comfyApi.addEventListener(MISSING_EVENT, (event: CustomEvent) => {
      const detail = (event.detail ?? {}) as MissingDetail
      comfyApp.extensionManager?.toast?.add({ severity: 'warn', ...missingNotice(detail), life: 30000 })
      if (detail.variant) setupTab?.open(detail.component ?? null)
    })
    // Plenio nodes' tooltips beside the node, not over its fields (tooltipPlacement.ts)
    installTooltipPlacement(() => (comfyApp as { canvas?: unknown }).canvas as CanvasLike | undefined)
    // a <name>.plenio.json dropped onto ComfyUI continues its song (instead of loading nothing)
    installRecordDrop(continueHost)
    // opened by the Plenio Player's "Open in ComfyUI": the song it sends continues here (player.ts)
    installContinueFromPlayer(continueHost)
    // Sent by the Song Sheet before it stops with a conflict or validation error.
    comfyApi.addEventListener('plenio.sheet', (event: CustomEvent) => {
      const payload = event.detail as SheetPayload
      if (!payload?.node_id) return
      setPayload(String(payload.node_id), payload)
      const node = nodeById(payload.node_id)
      if (node) setRunState(node, sheetState(payload))
    })
    // the server's queue, for the warning about runs that stop for review (reviewQueue.ts)
    comfyApi.addEventListener('status', (event: CustomEvent) => {
      reviewQueue.status((event.detail as { exec_info?: { queue_remaining?: unknown } } | null)?.exec_info?.queue_remaining)
    })
    // A new run: the previous run's results go, so the canvas shows how far this run gets.
    comfyApi.addEventListener('execution_start', () => {
      clearRunStates(graph()?.nodes ?? [])
    })
    comfyApi.addEventListener('execution_error', (event: CustomEvent) => {
      lastRunError = event.detail ?? null
      const node = nodeById((event.detail as { node_id?: unknown } | undefined)?.node_id)
      if (node && String(node.type).startsWith('Plenio')) setRunState(node, 'error')
    })
    // Export Release's sheet music: from every execution this page hears of, whichever workflow it shows
    // (ComfyUI calls onExecuted only for a node of the open workflow), and the jobs still waiting when the
    // page opens, comes back to the front or reconnects (a run that ended while no page drew it)
    comfyApi.addEventListener('executed', (event: CustomEvent) => {
      const detail = event.detail as { node?: unknown; display_node?: unknown; output?: Record<string, unknown> } | undefined
      const jobs = sheetMusicJobs(detail?.output)
      const nodeId = detail?.display_node ?? detail?.node
      for (const job of jobs) jobNodes.set(job.token, nodeId)
      sheetJobs.take(jobs)
    })
    const recover = () => void sheetJobs.recover()
    // a server restarted with another Plenio: this page's code is old - it says so once and draws nothing
    // (a reloaded page draws the sheet music still waiting)
    let warned = false
    comfyApi.addEventListener('reconnected', () => {
      void stale().then((old) => {
        if (!old) recover()
        else if (!warned) {
          warned = true
          comfyApp.extensionManager?.toast?.add({ severity: 'warn', summary: 'Plenio was updated', detail: RELOAD_HINT })
        }
      })
    })
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') recover()
    })
    window.setTimeout(recover, 3000)
  }
})
