/**
 * The LLM nodes inside a saved workflow's Plenio blocks get 1.5.0's answer length: a thinking model's thoughts
 * come before its answer and can run to many thousand tokens, and the 6144 (writer), 2048 (arrangement) and
 * 1024 (misheard words) tokens earlier versions shipped cut some of them off.
 *
 * ComfyUI keeps each block's inner graph in the workflow, so a workflow saved before keeps the old limits.
 * Before the frontend configures it (``beforeConfigureGraph``), the blocks' Generate Text and Local LLM nodes
 * whose answer length or context is one an earlier version shipped get the current ones; a value set by hand
 * stays. ``plenio/core/blocks.py`` (``OLD_LLM_LIMITS``) knows the same values.
 */

const BLOCK_PREFIX = 'Plenio · '
export const MAX_TOKENS = 16384
export const CONTEXT = 24576
const OLD_MAX_TOKENS = [1024, 2048, 6144]
const OLD_CONTEXTS = [8192, 12288]

/** By node type: the position in ``widgets_values``, the values earlier versions shipped, the current one. */
const LIMITS: Record<string, [number, number[], number][]> = {
  TextGenerate: [[1, OLD_MAX_TOKENS, MAX_TOKENS]],
  PlenioLocalLLM: [
    [4, OLD_MAX_TOKENS, MAX_TOKENS],
    [7, OLD_CONTEXTS, CONTEXT]
  ]
}

interface Definition {
  name?: unknown
  nodes?: { type?: unknown; widgets_values?: unknown }[]
}

/** Raises the shipped LLM limits in ``graph``'s Plenio blocks in place; the names of the blocks it changed. */
export function raiseLlmLimits(graph: unknown): string[] {
  const subgraphs = (graph as { definitions?: { subgraphs?: unknown } } | null)?.definitions?.subgraphs
  if (!Array.isArray(subgraphs)) return []
  const changed: string[] = []
  for (const definition of subgraphs as Definition[]) {
    if (typeof definition?.name !== 'string' || !definition.name.startsWith(BLOCK_PREFIX)) continue
    let raised = false
    for (const node of definition.nodes ?? []) {
      const values = node?.widgets_values
      const limits = LIMITS[String(node?.type)]
      if (!limits || !Array.isArray(values)) continue
      for (const [index, old, now] of limits) {
        if (typeof values[index] === 'number' && old.includes(values[index])) {
          values[index] = now
          raised = true
        }
      }
    }
    if (raised) changed.push(definition.name)
  }
  return changed
}
