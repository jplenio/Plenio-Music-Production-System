<script setup lang="ts">
/**
 * The ABC text of the score (CodeMirror 6): the canonical representation. Diagnostics come
 * from the backend analysis; undo/redo belongs to the Song Sheet editor (one history for
 * text and notation edits), so CodeMirror's own history is not installed.
 */
import { defaultKeymap } from '@codemirror/commands'
import { HighlightStyle, StreamLanguage, syntaxHighlighting } from '@codemirror/language'
import { type Diagnostic, lintGutter, setDiagnostics } from '@codemirror/lint'
import { EditorSelection, EditorState } from '@codemirror/state'
import { EditorView, drawSelection, highlightActiveLine, keymap, lineNumbers } from '@codemirror/view'
import { tags } from '@lezer/highlight'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

import type { ScoreDiagnostic } from '../../shared/scoreView'

const props = defineProps<{
  text: string
  diagnostics: ScoreDiagnostic[]
  /** Source range of the element selected in the notation (scrolled to and selected here). */
  reveal: [number, number] | null
  readonly?: boolean
}>()
const emit = defineEmits<{ change: [text: string]; cursor: [offset: number] }>()

const host = ref<HTMLDivElement | null>(null)
let view: EditorView | null = null
let external = false

const abcLanguage = StreamLanguage.define<null>({
  token(stream) {
    if (stream.sol() && stream.match(/^%.*/)) return 'comment'
    if (stream.sol() && stream.match(/^[A-Za-z]:.*/)) return 'meta'
    if (stream.match(/^"[^"\n]*"/)) return 'string'
    if (stream.match(/^\[K:[^\]\n]*\]/)) return 'meta'
    if (stream.eat('|')) return 'punctuation'
    if (stream.match(/^[zZ][0-9]*/)) return 'atom'
    if (stream.match(/^(\^\^|__|\^|_|=)?[A-Ga-g][,']*[0-9]*-?/)) return 'variableName'
    stream.next()
    return null
  },
  startState: () => null
})

const highlight = HighlightStyle.define([
  { tag: tags.comment, color: 'var(--plenio-abc-comment, #8fa3b0)', fontStyle: 'italic' },
  { tag: tags.meta, color: 'var(--plenio-abc-meta, #6fa8dc)' },
  { tag: tags.string, color: 'var(--plenio-abc-chord, #d6a15a)' },
  { tag: tags.atom, color: 'var(--plenio-abc-rest, #9a9a9a)' },
  { tag: tags.punctuation, color: 'var(--plenio-abc-bar, #c0c0c0)', fontWeight: 'bold' }
])

const theme = EditorView.theme({
  '&': {
    backgroundColor: 'var(--comfy-input-bg, #1e1e1e)',
    color: 'var(--input-text, #dddddd)',
    fontSize: '12px',
    border: '1px solid var(--border-color, #444)',
    borderRadius: '6px',
    height: '100%'
  },
  '&.cm-focused': { outline: '1px solid #2f6fb0' },
  '.cm-content': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', caretColor: 'currentColor' },
  '.cm-gutters': { backgroundColor: 'transparent', color: 'var(--descrip-text, #888)', border: 'none' },
  '.cm-activeLine': { backgroundColor: 'rgba(127, 127, 127, 0.08)' },
  '.cm-scroller': { overflow: 'auto' }
})

function diagnosticsFor(state: EditorState): Diagnostic[] {
  const length = state.doc.length
  return props.diagnostics
    .filter((d) => typeof d.start === 'number' && typeof d.end === 'number')
    .map((d) => ({
      from: Math.min(d.start as number, length),
      to: Math.min(Math.max(d.end as number, d.start as number), length),
      severity: d.severity === 'error' ? 'error' : d.severity === 'warning' ? 'warning' : 'info',
      message: d.message
    }))
}

onMounted(() => {
  if (!host.value) return
  view = new EditorView({
    parent: host.value,
    state: EditorState.create({
      doc: props.text,
      extensions: [
        lineNumbers(),
        drawSelection(),
        highlightActiveLine(),
        keymap.of(defaultKeymap),
        abcLanguage,
        syntaxHighlighting(highlight),
        lintGutter(),
        theme,
        EditorView.lineWrapping,
        EditorState.readOnly.of(!!props.readonly),
        EditorView.contentAttributes.of({ 'aria-label': 'Score as ABC text', spellcheck: 'false' }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged && !external) emit('change', update.state.doc.toString())
          if (update.selectionSet && !external && update.transactions.some((t) => t.isUserEvent('select'))) {
            emit('cursor', update.state.selection.main.head)
          }
        })
      ]
    })
  })
  view.dispatch(setDiagnostics(view.state, diagnosticsFor(view.state)))
})

onBeforeUnmount(() => view?.destroy())

watch(
  () => props.text,
  (text) => {
    if (!view || view.state.doc.toString() === text) return
    external = true
    const head = Math.min(view.state.selection.main.head, text.length)
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: text }, selection: { anchor: head } })
    external = false
    view.dispatch(setDiagnostics(view.state, diagnosticsFor(view.state)))
  }
)

watch(
  () => props.diagnostics,
  () => {
    if (view) view.dispatch(setDiagnostics(view.state, diagnosticsFor(view.state)))
  }
)

watch(
  () => props.reveal,
  (range) => {
    if (!view || !range) return
    const length = view.state.doc.length
    const [from, to] = [Math.min(range[0], length), Math.min(range[1], length)]
    const current = view.state.selection.main
    if (current.from === from && current.to === to) return
    external = true
    view.dispatch({ selection: EditorSelection.single(from, to), scrollIntoView: true })
    external = false
  }
)
</script>

<template>
  <div ref="host" class="abc-editor" />
</template>
