import { describe, expect, it } from 'vitest'

import {
  type SheetPayload,
  nextState,
  normalize,
  ownedBeforeRun,
  startSession,
  withApproval
} from '../src/shared/sheetSession'
import { emptyState, type SheetState } from '../src/shared/sheetState'

const SHA = 'a'.repeat(64)
const NEW_SHA = 'b'.repeat(64)

function payload(docs: SheetPayload['docs']): SheetPayload {
  return {
    schema: 'plenio.sheet_payload/1',
    owned: Object.keys(docs) as SheetPayload['owned'],
    docs,
    context: {},
    findings: [],
    fingerprint: null,
    review: 'continue',
    approved: false,
    waiting: false,
    status: 'valid',
    planning_mode: 'full',
    score_seconds: 0,
    validation: null,
    engine: 'yue2',
    instrumental: false
  }
}

const draft = (text: string, sha = SHA, status: 'auto' | 'conflict' | 'edited' = 'auto') => ({
  state: 'auto' as const,
  status,
  upstream: text,
  upstream_sha256: sha,
  text,
  reason: ''
})

describe('normalize', () => {
  it('matches the backend rules', () => {
    expect(normalize('\n\n a \r\nb  \r\n\n')).toBe(' a\nb')
  })
})

describe('state transitions', () => {
  const p = payload({ lyrics: draft('[Verse]\ndraft') })

  it('keeps an untouched automatic document automatic', () => {
    const working = startSession(emptyState(), p, ['lyrics'])
    expect(working[0].text).toBe('[Verse]\ndraft')
    expect(nextState(emptyState(), p, working).docs).toEqual({})
  })

  it('turns a changed automatic document into an edit of the current draft', () => {
    const working = startSession(emptyState(), p, ['lyrics'])
    working[0].text = '[Verse]\nmine  \n'
    expect(nextState(emptyState(), p, working).docs.lyrics).toEqual({
      state: 'edited',
      text: '[Verse]\nmine',
      base_sha256: SHA
    })
  })

  it('makes a document manual or automatic on request', () => {
    const working = startSession(emptyState(), p, ['lyrics'])
    working[0].intent = 'manual'
    expect(nextState(emptyState(), p, working).docs.lyrics).toEqual({ state: 'manual', text: '[Verse]\ndraft' })
    const edited: SheetState = { ...emptyState(), docs: { lyrics: { state: 'edited', text: 'x', base_sha256: SHA } } }
    const back = startSession(edited, p, ['lyrics'])
    back[0].intent = 'auto'
    expect(nextState(edited, p, back).docs).toEqual({})
  })

  it('without a draft a typed document becomes manual', () => {
    const working = startSession(emptyState(), null, ['title'])
    working[0].text = 'My song'
    expect(nextState(emptyState(), null, working).docs.title).toEqual({ state: 'manual', text: 'My song' })
  })

  it('resolves a conflict by merging against the new draft', () => {
    const edited: SheetState = { ...emptyState(), docs: { lyrics: { state: 'edited', text: 'mine', base_sha256: SHA } } }
    const conflict = payload({ lyrics: draft('[Verse]\nnew', NEW_SHA, 'conflict') })
    const working = startSession(edited, conflict, ['lyrics'])
    expect(working[0].text).toBe('mine')
    working[0].intent = 'rebase'
    expect(nextState(edited, conflict, working).docs.lyrics).toEqual({
      state: 'edited',
      text: 'mine',
      base_sha256: NEW_SHA
    })
  })

  it('stores and clears approvals', () => {
    expect(withApproval(emptyState(), 'f'.repeat(64)).review?.approved_fingerprint).toBe('f'.repeat(64))
    expect(withApproval(emptyState(), null).review).toBeUndefined()
  })

  it('knows the owned documents before the first run', () => {
    const state: SheetState = { ...emptyState(), docs: { score: { state: 'manual', text: 'X:1' } } }
    expect(ownedBeforeRun(['title', 'brief', 'lyrics'], state)).toEqual(['title', 'lyrics', 'score'])
  })
})
