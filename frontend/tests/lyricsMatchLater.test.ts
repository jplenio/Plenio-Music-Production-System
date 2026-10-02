/**
 * Lyrics that did not match the sections when the editor opened follow them as soon as they do: the
 * usual fix is renaming a section to the lyrics' tag (the sheet warns about the mismatch).
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { type App, createApp, h, nextTick } from 'vue'

import type { Fetcher, ScoreOperation } from '../src/api/client'
import type { ScoreModelView, ScoreView } from '../src/shared/scoreView'
import type { WorkingDoc } from '../src/shared/sheetSession'
import ScoreTab from '../src/sheet-editor/score/ScoreTab.vue'
import { defaultPrefs, savePrefs } from '../src/sheet-editor/score/prefs'
import fixture from './fixtures/tricky-score.json'

const VIEW = fixture.view as unknown as ScoreView
const MODEL = VIEW.model as ScoreModelView
const LYRICS = '[Intro]\n\n[Verse]\nverse a\n\n[Bridge]\nbridge a'
const renamed = (model: ScoreModelView): ScoreModelView => ({
  ...model,
  sections: model.sections.map((s) => (s.label === 'chorus' ? { ...s, label: 'bridge' } : s))
})
const RENAMED = renamed(MODEL)
const DUPLICATED: ScoreModelView = {
  ...RENAMED,
  total: MODEL.total + 64,
  measures: [...MODEL.measures, ...MODEL.measures.slice(5).map((m, i) => ({ ...m, n: 8 + i, onset: 224 + 32 * i }))],
  sections: [...RENAMED.sections, { label: 'bridge', first_bar: 8, bars: 2, implicit: false }]
}

let app: App | null = null
afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
})
beforeEach(() => {
  window.localStorage.clear()
  savePrefs({ ...defaultPrefs() })
})

async function settle(times = 5): Promise<void> {
  for (let i = 0; i < times; i++) {
    await new Promise((resolve) => setTimeout(resolve, 0))
    await nextTick()
  }
}

describe('lyrics that match the sections later', () => {
  it('follow them once a section is renamed to the lyrics’ tag', async () => {
    const answers: Record<string, ScoreModelView> = { rename_section: RENAMED, arrange_sections: DUPLICATED }
    const fetcher: Fetcher = {
      fetchApi: (route: string, init?: RequestInit) => {
        const op = route.includes('/transform') ? (JSON.parse(String(init?.body)).operation as ScoreOperation) : null
        const body = op
          ? {
              abc: `${fixture.abc}\n% ${op.op}\n`,
              changes: [op.op],
              warnings: [],
              select: [],
              time_map: op.op === 'arrange_sections' ? [[0, 224, 0], [160, 224, 224]] : null,
              analysis: { ...VIEW, model: answers[op.op] }
            }
          : route.includes('/analyze')
            ? VIEW
            : route.includes('/lyrics')
              ? { sections: [] }
              : {}
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) } as Response)
      }
    }
    const reported: (string | null)[] = []
    const host = document.createElement('div')
    document.body.appendChild(host)
    const doc: WorkingDoc = { kind: 'score', text: fixture.abc, intent: 'keep' }
    app = createApp({
      render: () =>
        h(ScoreTab, {
          doc,
          fetcher,
          payload: null,
          readonly: false,
          layoutDefault: 'review',
          lyrics: LYRICS,
          title: 'Song',
          lyricsTarget: { title: 'Song Sheet · Text', blocked: null, replans: false },
          onLyricsChange: (text: string | null) => reported.push(text)
        })
    })
    app.mount(host)
    await settle()
    expect(host.querySelector('.lyrics-follow')?.textContent).not.toContain('arranges them too') // no match yet
    // rename the chorus to "bridge", as the lyrics have it
    ;([...host.querySelectorAll('.section-tools button')].filter((b) => b.textContent?.trim() === 'Rename')[2] as HTMLButtonElement).click()
    await nextTick()
    const field = host.querySelector('input[aria-label="Section name"]') as HTMLInputElement
    field.value = 'bridge'
    field.dispatchEvent(new Event('input'))
    field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await settle()
    expect(host.querySelector('.lyrics-follow')?.textContent).toContain('arranges them too')
    // and now the lyrics follow a duplicated section
    ;([...host.querySelectorAll('.section-head')][2] as HTMLElement).click()
    await nextTick()
    ;([...host.querySelectorAll('.section-actions button')].find((b) => b.textContent?.trim() === 'Duplicate') as HTMLButtonElement).click()
    await settle()
    expect(reported.at(-1)).toBe(`${LYRICS}\n\n[Bridge]\nbridge a`)
  })
})
