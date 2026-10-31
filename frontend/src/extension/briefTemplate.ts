/**
 * The brief template panel (Phase 11C D6, plan §8.2; visible since 1.5.0): the chosen template's values in the
 * brief's fields, and what is the template's and what is one's own.
 *
 * The precedence rule (**typed value > template value > empty**) lives in the backend (`core.brief`) and this panel
 * asks it (`POST /plenio/brief/fields`). Since 1.5.0 the fields *show* the template's values (owner's request
 * 2026-10-31: they stayed empty and were filled by a button): an empty field gets the template's value, and choosing
 * another template replaces the values a template filled - its choices (vocals, length, melody) too. A value the
 * user changed is never replaced, so changing the template cannot destroy an edit. The run reads the same as before:
 * an empty field took the template's value then too. One's own lyrics are never filled.
 */
import { type BriefFields, type Fetcher, briefFields } from '../api/client'
import { refreshOwnValues } from './briefChoices'
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
  'lyrics',
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
  lyrics: 'vocals.lyrics',
  lyrics_from: 'vocals.lyrics_from',
  melody: 'vocals.melody',
  lead_instrument: 'vocals.lead_instrument'
}

/** The *lyrics* choice that makes the lyrics field one's own lyrics (`core.brief.OWN_LYRICS`). */
export const OWN_LYRICS = 'my own, sung as written below'

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
  for (const field of [...TEXT_FIELDS, ...CHOICE_FIELDS, 'lyrics_from']) {
    const widget = widgetOf(node, field)
    if (widget) values[field] = typeof widget.value === 'string' ? widget.value : String(widget.value ?? '')
  }
  return values
}

/** Which brief the node is: a Cover Brief has its own fields and choices (the backend knows them). */
export function briefKind(node: ComfyNode): 'song' | 'cover' {
  const type = (node as { comfyClass?: string; type?: string }).comfyClass ?? (node as { type?: string }).type
  return type === 'PlenioCoverBrief' ? 'cover' : 'song'
}

const text = (value: unknown): string => (typeof value === 'string' ? value : String(value ?? ''))

/** The text fields the answer speaks of (a Cover Brief's depend on its vocals; own lyrics are left out). */
export function answeredFields(answer: BriefFields): string[] {
  return Object.keys(answer.sources).filter((field) => (TEXT_FIELDS as readonly string[]).includes(field))
}

/**
 * What the template writes into the fields: every empty field the template has a value for, and every field that
 * holds a value a template showed there (``shown``: per field; after another template was chosen, or when a vocals
 * choice brings its fields back with an older template's values - the frontend restores them after the panel filled
 * them) - the template's value now, or empty. A field the user changed stays.
 */
export function templatePlan(
  node: ComfyNode,
  answer: BriefFields,
  shown: Readonly<Record<string, readonly string[]>> = {}
): { field: string; value: string }[] {
  const plan: { field: string; value: string }[] = []
  for (const field of answeredFields(answer)) {
    const widget = widgetOf(node, field)
    if (!widget) continue
    const value = text(widget.value)
    const target = answer.fields[field] ?? ''
    const stale = (shown[field] ?? []).includes(value)
    if ((!value.trim() || stale) && value !== target) plan.push({ field, value: target })
  }
  // one's own lyrics chosen while the field still holds a template's idea: the field is cleared for them
  const lyrics = widgetOf(node, 'lyrics')
  const ideas = [...(shown.lyrics ?? []), answer.fields.lyrics ?? ''].filter(Boolean)
  if (lyrics && text(widgetOf(node, 'lyrics_from')?.value) === OWN_LYRICS && ideas.includes(text(lyrics.value))) {
    plan.push({ field: 'lyrics', value: '' })
  }
  return plan
}

/** What "refill from template" writes: the template's value into every text field that holds another one. */
export function refillPlan(node: ComfyNode, answer: BriefFields): { field: string; value: string }[] {
  const plan: { field: string; value: string }[] = []
  for (const field of answeredFields(answer)) {
    const widget = widgetOf(node, field)
    const target = answer.fields[field] ?? ''
    if (widget && text(widget.value) !== target) plan.push({ field, value: target })
  }
  return plan
}

/** The fields that show the template's value, and those that hold the user's own. */
export function fieldOrigins(node: ComfyNode, answer: BriefFields): { template: string[]; own: string[] } {
  const origins = { template: [] as string[], own: [] as string[] }
  for (const field of answeredFields(answer)) {
    const value = text(widgetOf(node, field)?.value).trim()
    if (!value) continue
    origins[value === (answer.fields[field] ?? '').trim() ? 'template' : 'own'].push(field)
  }
  return origins
}

/** What "use template choices" writes: length, vocals and melody when the template differs. */
export function choicePlan(answer: BriefFields): { field: string; value: string }[] {
  return answer.choices
    .filter((choice) => choice.suggested && choice.suggested !== choice.current)
    .map((choice) => ({ field: choice.field, value: choice.suggested }))
}

/** The line under the selector: which fields show the template's value and which hold the user's own (``null``
 * before the first answer and without a template). */
export function originsLine(node: ComfyNode, answer: BriefFields | null, answered: boolean): string | null {
  if (!answered || !answer || answer.template === 'none') return null
  const { template, own } = fieldOrigins(node, answer)
  const parts = [
    template.length ? `From the template: ${template.join(', ')}` : '',
    own.length ? `your own: ${own.join(', ')}` : ''
  ].filter(Boolean)
  return parts.length ? parts.join(' · ') : 'The template has no text for these fields.'
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

/** What the chosen creative mode does (the *arrangement* tooltip names no modes), or ``null`` for *off*. */
export function modeLine(answer: BriefFields | null): string | null {
  const mode = answer?.mode
  return mode?.description ? `Creative mode ${mode.name} (experimental): ${mode.description}` : null
}

/** Write values into widgets (the user's action; the widget callback keeps the node in sync). */
export function writeValues(node: ComfyNode, changes: { field: string; value: unknown }[]): void {
  for (const change of changes) {
    const widget = widgetOf(node, change.field)
    if (!widget) continue
    widget.value = change.value
    widget.callback?.(change.value)
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
 * Attach the panel to a brief node: the template's values in the fields, the line that says which are the template's,
 * the actions and the note about the legacy placeholder. It reads the values from the widgets and asks the backend for
 * the rule; it writes the template's values into empty fields, and into the fields the previous template had filled.
 */
export function addBriefTemplatePanel(node: ComfyNode, fetcher: Fetcher): TemplatePanel {
  let current: BriefFields | null = null
  /** The template the fields were last filled from. */
  let filled: string | null = null
  /** Per field, the templates' values it showed (kept while a vocals choice hides the field). */
  const shown: Record<string, string[]> = {}
  let answered = false
  let problem: string | null = null
  let timer: ReturnType<typeof setTimeout> | undefined

  const element = document.createElement('div')
  element.className = 'plenio-brief-template'
  const line = document.createElement('div')
  line.className = 'line'
  const hint = document.createElement('div')
  hint.className = 'hint'
  const mode = document.createElement('div')
  mode.className = 'mode'
  const buttons = document.createElement('div')
  buttons.className = 'actions'
  element.append(line, hint, mode, buttons)

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
  const choices = make('Use template choices', 'Set length, vocals and melody to the template’s choices', () => {
    if (!current) return
    writeValues(node, choicePlan(current))
    render()
  })
  const refill = make('Refill from template', 'Put the template’s value back into every text field you changed', () => {
    if (!current) return
    const plan = refillPlan(node, current)
    if (!plan.length) return
    const names = plan.map((item) => item.field).join(', ')
    if (!window.confirm(`Replace your values in ${names} with the template's?`)) return
    writeValues(node, plan)
    render()
  })
  const again = make('↻', 'Ask again what the template fills', () => void refresh())

  const render = (): void => {
    line.textContent = problem ?? originsLine(node, current, answered) ?? 'No template: the fields hold your values only.'
    line.dataset.state = problem ? 'error' : answered && current ? 'ok' : 'empty'
    const suggestions = choicesLine(current)
    const notes = notesLine(current)
    hint.textContent = [suggestions, notes].filter(Boolean).join(' · ')
    hint.style.display = hint.textContent ? '' : 'none'
    mode.textContent = modeLine(current) ?? ''
    mode.style.display = mode.textContent ? '' : 'none'
    buttons.style.display = answered && current && current.template !== 'none' ? '' : 'none'
    choices.disabled = !current || !choicePlan(current).length
    refill.disabled = !current || !refillPlan(node, current).length
    again.disabled = false
    node.setDirtyCanvas?.(true, true)
  }

  /** The template's values into the fields: empty ones, and - another template chosen - its choices and the fields
   * the previous one had filled. An answer for a template no longer chosen writes nothing (another one is coming). */
  const fill = (answer: BriefFields): void => {
    const chosen = String(node.widgets?.find((widget) => widget.name === 'template')?.value ?? 'none')
    if (answer.template !== (chosen || 'none')) return
    if (filled !== null && filled !== answer.template) {
      // a song's choice follows where it holds a template's value (the length set for short test songs stays); a
      // cover's in its own words (a sung template: the original lyrics, an instrumental one: instrumental)
      const cover = briefKind(node) === 'cover'
      const follow = (field: string): boolean => cover || (shown[field] ?? []).includes(text(widgetOf(node, field)?.value))
      writeValues(node, choicePlan(answer).filter((choice) => follow(choice.field)))
    }
    const plan = templatePlan(node, answer, shown)
    if (plan.length) writeValues(node, plan)
    for (const field of [...answeredFields(answer), ...CHOICE_FIELDS]) {
      const value = text(widgetOf(node, field)?.value)
      if (value && value === (answer.fields[field] ?? '') && !(shown[field] ??= []).includes(value)) shown[field].push(value)
    }
    filled = answer.template
  }

  // every field the rule reads refreshes the panel. The vocals group's children (language, voice,
  // theme, melody, lead instrument) are rebuilt when *vocals* changes, so wiring is idempotent and
  // runs again after each change and each answer: a new child widget is wired, a known one is not.
  const wired = new WeakSet<ComfyWidget>()
  const wire = (): void => {
    labelWidgets(node)
    for (const name of ['template', 'arrangement', ...Object.keys(WIDGET_OF)]) {
      const widget =
        name === 'template' || name === 'arrangement'
          ? node.widgets?.find((candidate) => candidate.name === name)
          : widgetOf(node, name)
      if (!widget || wired.has(widget)) continue
      wired.add(widget)
      widget.callback = chain(widget.callback, () => {
        wire()
        refresh()
      })
    }
    // a vocals choice's new fields: their lists offer one's own value too
    refreshOwnValues(node)
  }

  const ask = async (): Promise<void> => {
    wire()
    const template = String(node.widgets?.find((widget) => widget.name === 'template')?.value ?? 'none')
    try {
      const arrangement = String(node.widgets?.find((widget) => widget.name === 'arrangement')?.value ?? '')
      current = await briefFields(fetcher, { fields: briefValues(node), template, kind: briefKind(node), arrangement })
      problem = null
      fill(current)
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

  wire()

  const widget = node.addDOMWidget(PANEL, PANEL, element, {
    serialize: false,
    getValue: () => '',
    setValue: () => {},
    getMinHeight: () => 64,
    getMaxHeight: () => 128
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

/** Labels for a vocals choice's inputs whose names say less (the frontend shows a DynamicCombo input's name). */
export const WIDGET_LABELS: Record<string, string> = {
  'vocals.lyrics_from': 'lyrics',
  'vocals.lyrics': 'lyrics idea or text'
}

export function labelWidgets(node: ComfyNode): void {
  for (const widget of node.widgets ?? []) {
    const label = WIDGET_LABELS[widget.name]
    if (label && (widget as { label?: string }).label !== label) (widget as { label?: string }).label = label
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
