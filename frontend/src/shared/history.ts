/**
 * Undo/redo for one document: labelled text snapshots (documents are small texts).
 * Typing is grouped: ``record(..., { group: 'typing' })`` replaces the previous snapshot
 * while the same group continues, so one undo removes a burst of typing.
 */

export interface Snapshot {
  text: string
  label: string
  /**
   * State that changed with this step besides the text (the score's Guide notes on a MIDI import).
   * An undo or redo hands it back with the text; a step without it leaves that state alone.
   */
  extra?: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export class History {
  private entries: Snapshot[]
  private cursor = 0
  private openGroup: string | null = null

  constructor(initial: string, private readonly limit = 200) {
    this.entries = [{ text: initial, label: 'start' }]
  }

  get current(): Snapshot {
    return this.entries[this.cursor]
  }

  get canUndo(): boolean {
    return this.cursor > 0
  }

  get canRedo(): boolean {
    return this.cursor < this.entries.length - 1
  }

  /** The label of the step an undo would revert, for tooltips. */
  get undoLabel(): string | null {
    return this.canUndo ? this.entries[this.cursor].label : null
  }

  get redoLabel(): string | null {
    return this.canRedo ? this.entries[this.cursor + 1].label : null
  }

  /**
   * A new step. ``side``: a step of the side state alone (the lyrics edited over the score) - it is
   * recorded although the text did not change.
   */
  record(text: string, label: string, options: { group?: string; extra?: unknown; side?: boolean } = {}): void {
    if (text === this.current.text && !options.side) return
    const group = options.group ?? null
    this.entries = this.entries.slice(0, this.cursor + 1)
    if (group !== null && group === this.openGroup && this.cursor > 0) {
      this.entries[this.cursor] = { text, label, extra: this.entries[this.cursor].extra }
    } else {
      this.entries.push(options.extra === undefined ? { text, label } : { text, label, extra: options.extra })
      this.cursor = this.entries.length - 1
      if (this.entries.length > this.limit) {
        this.entries.shift()
        this.cursor--
      }
    }
    this.openGroup = group
  }

  /**
   * Attach ``extra`` to the current step unless it has its own: the state that belonged to this
   * text before a step changes it, so an undo back to here restores it. Objects are merged key by
   * key - the step keeps what it has and gains what it lacks (an import's Guide notes, then the
   * lyrics of an arrangement).
   */
  annotate(extra: unknown): void {
    const own = this.current.extra
    if (own === undefined) this.entries[this.cursor] = { ...this.current, extra }
    else if (isRecord(own) && isRecord(extra)) this.entries[this.cursor] = { ...this.current, extra: { ...extra, ...own } }
  }

  /** Close the typing group, so the next edit is a separate step. */
  seal(): void {
    this.openGroup = null
  }

  undo(): Snapshot | null {
    if (!this.canUndo) return null
    this.cursor--
    this.openGroup = null
    return this.current
  }

  redo(): Snapshot | null {
    if (!this.canRedo) return null
    this.cursor++
    this.openGroup = null
    return this.current
  }
}
