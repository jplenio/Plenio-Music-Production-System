/**
 * Undo/redo for one document: labelled text snapshots (documents are small texts).
 * Typing is grouped: ``record(..., { group: 'typing' })`` replaces the previous snapshot
 * while the same group continues, so one undo removes a burst of typing.
 */

export interface Snapshot {
  text: string
  label: string
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

  record(text: string, label: string, options: { group?: string } = {}): void {
    if (text === this.current.text) return
    const group = options.group ?? null
    this.entries = this.entries.slice(0, this.cursor + 1)
    if (group !== null && group === this.openGroup && this.cursor > 0) {
      this.entries[this.cursor] = { text, label }
    } else {
      this.entries.push({ text, label })
      this.cursor = this.entries.length - 1
      if (this.entries.length > this.limit) {
        this.entries.shift()
        this.cursor--
      }
    }
    this.openGroup = group
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
