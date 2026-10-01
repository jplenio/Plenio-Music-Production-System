/** Mount the Song Sheet dialog (loaded lazily, only when a sheet is opened). */
import { createApp } from 'vue'

import type { Fetcher, GuideNote } from '../api/client'
import type { AsrNote, ScoreChange, ScoreTarget, SheetPayload } from '../shared/sheetSession'
import type { DocumentKind, SheetState } from '../shared/sheetState'
import type { LyricsTarget } from './score/lyricsFollow'
import dialogCss from './dialog.css?inline'
import SheetDialog from './SheetDialog.vue'

export interface OpenOptions {
  title: string
  state: SheetState
  payload: SheetPayload | null
  asrNote?: AsrNote | null
  owned: DocumentKind[]
  review: string
  fetcher: Fetcher
  /** The Song Sheet node's ``plenio_editor_layout`` property. */
  layout?: string | null
  /** The Guide notes of the node's ``plenio_guide`` property (playback and MIDI only). */
  guide?: GuideNote[]
  /** The sheet that owns the context lyrics, when they can follow the score's sections. */
  lyricsTarget?: LyricsTarget | null
  /** The sheet that owns the context score (a cover's score sheet), when this sheet may edit it. */
  scoreTarget?: ScoreTarget | null
  /**
   * ``lyrics``: the context lyrics arranged like the score, for the sheet that owns them; ``score``: the
   * context score as edited here, for the sheet that owns it.
   */
  onApply: (state: SheetState, guide: GuideNote[], lyrics: string | null, score: ScoreChange | null) => void
}

function installCss(): void {
  if (document.getElementById('plenio-dialog-styles')) return
  const style = document.createElement('style')
  style.id = 'plenio-dialog-styles'
  style.textContent = dialogCss
  document.head.append(style)
}

export function openSheetDialog(options: OpenOptions): () => void {
  installCss()
  const host = document.createElement('div')
  document.body.append(host)
  const close = () => {
    app.unmount()
    host.remove()
  }
  const app = createApp(SheetDialog, {
    title: options.title,
    state: options.state,
    payload: options.payload,
    asrNote: options.asrNote ?? null,
    owned: options.owned,
    review: options.review,
    fetcher: options.fetcher,
    layout: options.layout ?? null,
    guide: options.guide ?? [],
    lyricsTarget: options.lyricsTarget ?? null,
    scoreTarget: options.scoreTarget ?? null,
    onApply: (state: SheetState, guide: GuideNote[], lyrics: string | null, score: ScoreChange | null) => {
      options.onApply(state, guide, lyrics, score)
      close()
    },
    onClose: close
  })
  app.mount(host)
  return close
}
