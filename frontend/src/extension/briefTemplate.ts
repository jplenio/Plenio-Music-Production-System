/**
 * The brief template panel (Phase 11C D6, plan §8.2): what the chosen template fills, and the
 * explicit actions that copy its values into the widgets.
 *
 * The precedence rule (**typed value > template value > empty**) lives in the backend
 * (`core.brief`) and this panel asks it (`POST /plenio/brief/fields`); the panel only *shows* the
 * answer and writes widget values when the user asks for it. Widget values are never changed
 * silently, so changing the template cannot destroy an edit; clearing a field returns it to the
 * template value.
 *
 * Ghost text in the input fields themselves is not implemented: the frontend at hand does not pass
 * a placeholder to a single-line text widget (checked in the 1.53.6 bundle: the non-multiline path
 * calls `addWidget('text', name, value, cb, {})`), and a *dynamic* placeholder has no API. The
 * compact *Template fills:* line below the selector is the documented fallback.
 */
import { type BriefFields, type Fetcher, briefFields } from '../api/client'
import type { ComfyNode, ComfyNodeType, ComfyWidget } from '../shared/comfy'
import { chain } from '../shared/comfy'

/** Text fields of a brief (the same names as `core.brief.TEXT_FIELDS`). */
export const TEXT_FIELDS = [
  'description',
  'genre',
  'mood',
  'tempo',
  'key',
  'meter',
  'language',
  'voice',
  'theme',
  'lead_instrument'
] as const

/** Choice fields: the widget value always wins; the template's differs only as a hint. */
export const CHOICE_FIELDS = ['length', 'vocals', 'melody'] as const

/** The widget a brief field lives in (the vocals group's children are named `vocals.<child>`). */
export const WIDGET_OF: Record<string, string> = {
  description: 'description',
  genre: 'genre',
  mood: 'mood',
  tempo: 'tempo',
  key: 'key',
  meter: 'meter',
  length: 'length',
  vocals: 'vocals',
  language: 'vocals.language',
  voice: 'vocals.voice',
  theme: 'vocals.theme',
  melody: 'vocals.melody',
  lead_instrument: 'vocals.lead_instrument'
}

/** The predecessor toolkit's placeholder for "let the model decide" (empty to the backend). */
export const LEGACY_PLACEHOLDER = 'custom'

export function isLegacyPlaceholder(value: unknown): boolean {
  return typeof value === 'string' && value.trim().toLowerCase() === LEGACY_PLACEHOLDER
}

export function widgetOf(node: ComfyNode, field: string): ComfyWidget | undefined {
  const name = WIDGET_OF[field]
  if (!name) return undefined
  return (node.widgets ?? []).find((widget) => widget.name === name)
}

/** The current widget values of the fields the backend rule needs. */
export function briefValues(node: ComfyNode): Record<string, string> {
  const values: Record<string, string> = {}
  for (const field of [...TEXT_FIELDS, ...CHOICE_FIELDS]) {
    const widget = widgetOf(node, field)
    if (widget) values[field] = typeof widget.value === 'string' ? widget.value : String(widget.value ?? '')
  }
  return values
}

/** What "copy template text" writes: only the empty text fields the template defines. */
export function fillPlan(node: ComfyNode, answer: BriefFields): { field: string; value: string }[] {
  const plan: { field: string; value: string }[] = []
  for (const fill of answer.fills) {
    if (!(TEXT_FIELDS as readonly string[]).includes(fill.field)) continue
    const widget = widgetOf(node, fill.field)
    if (widget && !String(widget.value ?? '').trim() && fill.value) plan.push({ field: fill.field, value: fill.value })
  }
  return plan
}

/** What "reset all to template" clears: every text field the user typed something into. */
export function resetPlan(node: ComfyNode): ComfyWidget[] {
  const widgets: ComfyWidget[] = []
  for (const field of TEXT_FIELDS) {
    const widget = widgetOf(node, field)
    if (widget && String(widget.value ?? '').trim()) widgets.push(widget)
  }
  return widgets
}

/** What "use template choices" writes: length, vocals and melody when the template differs. */
export function choicePlan(answer: BriefFields): { field: string; value: string }[] {
  return answer.choices
    .filter((choice) => choice.suggested && choice.suggested !== choice.current)
    .map((choice) => ({ field: choice.field, value: choice.suggested }))
}

/** The *Template fills:* line, or ``null`` when there is nothing to say. */
export function fillsLine(answer: BriefFields | null, answered: boolean): string | null {
  if (!answered) return null
  if (!answer || answer.template === 'none') return null
  if (!answer.fills.length) return 'The template fills nothing: every text field has your value.'
  const parts = answer.fills.map((fill) => `${fill.field} (${shorten(fill.value)})`)
  return `Template fills: ${parts.join(', ')}`
}

/** The *the template suggests other choices* line, or ``null``. */
export function choicesLine(answer: BriefFields | null): string | null {
  const plan = answer ? choicePlan(answer) : []
  if (!plan.length) return null
  return `The template suggests: ${plan.map((item) => `${item.field} = ${item.value}`).join(', ')}`
}

export function notesLine(answer: BriefFields | null): string | null {
  return answer?.notes.length ? answer.notes.join('; ') : null
}

function shorten(text: string, limit = 44): string {
  const flat = text.replace(/\s+/g, ' ').trim()
  return flat.length > limit ? `${flat.slice(0, limit - 1)}…` : flat
}

/** Write values into widgets (the user's action; the widget callback keeps the node in sync). */export function writeValues(node: ComfyNode, changes: { field: string; value: unknown }[]): void {
  for (const change of changes) {
    const widget = widgetOf(node, change.field)
    if (!widget) continue
    widget.value = change.value
    widget.callback?.(change.value)
  }
  node.setDirtyCanvas?.(true, true)
}

export function clearWidgets(node: ComfyNode, widgets: ComfyWidget[]): void {
  for (const widget of widgets) {
    widget.value = ''
    widget.callback?.('')
  }
  node.setDirtyCanvas?.(true, true)
}

/**
 * Clear the predecessor toolkit's ``custom`` placeholder from the brief's text widgets.
 *
 * The backend treats the word as empty and notes it in the summary (O5); clearing the widget makes
 * the UI say the same thing. Saved workflows arrive by name or by position, so this runs on the
 * live widgets after a load rather than on the saved values. Returns the fields it cleared.
 */
export function clearLegacyPlaceholders(node: ComfyNode): string[] {
  const cleared: string[] = []
  for (const field of TEXT_FIELDS) {
    const widget = widgetOf(node, field)
    if (!widget || !isLegacyPlaceholder(widget.value)) continue
    widget.value = ''
    widget.callback?.('')
    cleared.push(field)
  }
  if (cleared.length) node.setDirtyCanvas?.(true, true)
  return cleared
}

// --- the panel ----------------------------------------------------------------------------------

const PANEL = 'plenio_brief_template'
const REFRESH_MS = 400

export interface TemplatePanel {
  widget: ComfyWidget
  refresh: () => void
  answer: () => BriefFields | null
  dispose: () => void
}

/**
 * Attach the panel to a brief node: the *Template fills:* line, the actions and the note about the
 * legacy placeholder. It reads the values from the widgets, asks the backend for the rule and
 * writes values only on a click.
 */
export function addBriefTemplatePanel(node: ComfyNode, fetcher: Fetcher): TemplatePanel {
  let current: BriefFields | null = null
  let answered = false
  let problem: string | null = null
  let timer: ReturnType<typeof setTimeout> | undefined

  const element = document.createElement('div')
  element.className = 'plenio-brief-template'
  const line = document.createElement('div')
  line.className = 'line'
  const hint = document.createElement('div')
  hint.className = 'hint'
  const buttons = document.createElement('div')
  buttons.className = 'actions'
  element.append(line, hint, buttons)

  const make = (label: string, title: string, action: () => void) => {
    const button = document.createElement('button')
    button.textContent = label
    button.title = title
    button.addEventListener('click', (event) => {
      event.stopPropagation()
      action()
    })
    buttons.append(button)
    return button
  }
  const copy = make('Copy template text', 'Fill every empty text field with the template’s text', () => {
    if (!current) return
    writeValues(node, fillPlan(node, current).map((item) => ({ field: item.field, value: item.value })))
    render()
  })
  const choices = make('Use template choices', 'Set length, vocals and melody to the template’s choices', () => {
    if (!current) return
    writeValues(node, choicePlan(current))
    render()
  })
  const reset = make('Reset all to template', 'Clear every text field you typed into (they fall back to the template)', () => {
    const plan = resetPlan(node)
    if (!plan.length) return
    if (!window.confirm(`Clear ${plan.length} text field(s)? The template's values apply again.`)) return
    clearWidgets(node, plan)
    render()
  })
  const again = make('↻', 'Ask again what the template fills', () => void refresh())

  const render = (): void => {
    const fills = fillsLine(current, answered)
    line.textContent = problem ?? fills ?? 'The template fills nothing: every text field has your value.'
    line.dataset.state = problem ? 'error' : answered && current ? 'ok' : 'empty'
    const suggestions = choicesLine(current)
    const notes = notesLine(current)
    hint.textContent = [suggestions, notes].filter(Boolean).join(' · ')
    hint.style.display = hint.textContent ? '' : 'none'
    buttons.style.display = answered && current && current.template !== 'none' ? '' : 'none'
    copy.disabled = !current || !fillPlan(node, current).length
    choices.disabled = !current || !choicePlan(current).length
    reset.disabled = !resetPlan(node).length
    again.disabled = false
    node.setDirtyCanvas?.(true, true)
  }

  const ask = async (): Promise<void> => {
    const template = String(node.widgets?.find((widget) => widget.name === 'template')?.value ?? 'none')
    try {
      current = await briefFields(fetcher, { fields: briefValues(node), template })
      problem = null
    } catch (error) {
      current = null
      problem = `The template fields could not be read: ${error instanceof Error ? error.message : String(error)}`
    }
    answered = true
    render()
  }

  function refresh(): void {
    clearTimeout(timer)
    timer = setTimeout(() => void ask(), REFRESH_MS)
  }

  const templateWidget = node.widgets?.find((widget) => widget.name === 'template')
  if (templateWidget) templateWidget.callback = chain(templateWidget.callback, () => refresh())
  for (const field of ['description', 'genre', 'mood', 'tempo', 'key', 'meter'] as const) {
    const widget = widgetOf(node, field)
    if (widget) widget.callback = chain(widget.callback, () => refresh())
  }
  const vocals = widgetOf(node, 'vocals')
  if (vocals) vocals.callback = chain(vocals.callback, () => refresh())

  const widget = node.addDOMWidget(PANEL, PANEL, element, {
    serialize: false,
    getValue: () => '',
    setValue: () => {},
    getMinHeight: () => 64,
    getMaxHeight: () => 96
  })
  widget.serialize = false
  clearLegacyPlaceholders(node)
  render()
  refresh()

  return {
    widget,
    refresh,
    answer: () => current,
    dispose: () => clearTimeout(timer)
  }
}

/** The node types that carry a template selector. */
export const BRIEF_NODES = new Set(['PlenioSongBrief', 'PlenioCoverBrief'])

/** Attach the panel to every brief node of a node type (called from beforeRegisterNodeDef). */
export function installBriefTemplatePanel(nodeType: ComfyNodeType, fetcher: Fetcher): void {
  const panels = new WeakMap<ComfyNode, TemplatePanel>()
  type Created = { onNodeCreated?: () => void }
  const prototype = nodeType.prototype as ComfyNode & Created
  const created = prototype.onNodeCreated
  prototype.onNodeCreated = function (this: ComfyNode) {
    created?.call(this)
    panels.set(this, addBriefTemplatePanel(this, fetcher))
  }
  const configured = prototype.onConfigure
  prototype.onConfigure = function (this: ComfyNode, info: Record<string, unknown>) {
    configured?.call(this, info)
    clearLegacyPlaceholders(this)
    panels.get(this)?.refresh()
  }
}
