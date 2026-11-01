/**
 * 1.5.0's answer length for every LLM call: the shipped blocks have it, and a saved workflow's blocks get it as
 * the workflow opens - where they have a limit an earlier version shipped, not one set by hand. In Node, which
 * reads the shipped blocks.
 *
 * @vitest-environment node
 */
import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { CONTEXT, MAX_TOKENS, raiseLlmLimits } from '../src/extension/llmLimits'

const writer = (maxLength: number) => ({ type: 'TextGenerate', widgets_values: ['', maxLength, 'on', 0.8] })
const local = (maxTokens: number, context: number) => ({
  type: 'PlenioLocalLLM',
  widgets_values: ['', '(choose a model)', 0, 'fixed', maxTokens, 0.8, false, context, false, '', true]
})
const graph = (...subgraphs: unknown[]) => ({ nodes: [], links: [], definitions: { subgraphs } })

describe('the LLM limits', () => {
  it('raises what earlier versions shipped in Plenio blocks, and only that', () => {
    const g = graph(
      { name: 'Plenio · Write Song', nodes: [writer(6144), local(6144, 12288)] },
      { name: 'Plenio · Arrange', nodes: [writer(2048), local(2048, 8192)] },
      { name: 'Plenio · Fix Misheard Words', nodes: [writer(1024), local(4000, 8192)] },
      { name: 'My own block', nodes: [writer(6144)] }
    )
    expect(raiseLlmLimits(g)).toEqual(['Plenio · Write Song', 'Plenio · Arrange', 'Plenio · Fix Misheard Words'])
    const [song, arrange, heard, own] = g.definitions.subgraphs as { nodes: { widgets_values: unknown[] }[] }[]
    expect(song.nodes[0].widgets_values[1]).toBe(MAX_TOKENS)
    expect(song.nodes[1].widgets_values[4]).toBe(MAX_TOKENS)
    expect(song.nodes[1].widgets_values[7]).toBe(CONTEXT)
    expect(arrange.nodes[1].widgets_values[7]).toBe(CONTEXT)
    expect(heard.nodes[1].widgets_values[4]).toBe(4000) // set by hand: kept
    expect(heard.nodes[1].widgets_values[7]).toBe(CONTEXT)
    expect(own.nodes[0].widgets_values[1]).toBe(6144) // not a Plenio block
    expect(raiseLlmLimits(g)).toEqual([]) // already raised
    expect(raiseLlmLimits({ nodes: [] })).toEqual([])
  })

  it('is what the shipped blocks have', () => {
    const folder = new URL('../../subgraphs/', import.meta.url).href
    let seen = 0
    for (const name of ['Write Song', 'Arrange', 'Fix Misheard Words']) {
      const blueprint = JSON.parse(readFileSync(new URL(encodeURIComponent(`Plenio · ${name}.json`), folder), 'utf-8'))
      for (const definition of blueprint.definitions?.subgraphs ?? []) {
        for (const node of definition.nodes ?? []) {
          if (node.type === 'TextGenerate') expect(node.widgets_values[1]).toBe(MAX_TOKENS)
          if (node.type === 'PlenioLocalLLM') {
            expect(node.widgets_values[4]).toBe(MAX_TOKENS)
            expect(node.widgets_values[7]).toBe(CONTEXT)
            seen++
          }
        }
      }
    }
    expect(seen).toBe(6) // Write Song's writer and two repairs, Arrange's plan and re-ask, Fix Misheard Words
  })
})
