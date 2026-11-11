/**
 * A folder of the player's that no file manager opened: its path, shown with a button that copies it.
 *
 * *Open the folder* asks the player's server to show a folder on this computer's screen. That is the Studio
 * add-on's part (`plenio/addons/file_manager.py`); the Comfy Registry package leaves it out, and its server answers
 * `opened: false` with the folder's path and a sentence. The page then shows both - the path is what the listener
 * needs, whichever way they open it.
 */
import { ref } from 'vue'

export interface FolderAnswer {
  folder: string
  /** `false`: no file manager was started (an older server leaves the field out: it opened the folder). */
  opened?: boolean
  hint?: string
}

/** The folder to show as a path, or `null`. */
export const folderNote = ref<FolderAnswer | null>(null)

/** Take the server's answer to *Open the folder*: one that was not opened is shown as a path to copy. */
export function noteFolder<T extends FolderAnswer>(answer: T): T {
  if (answer && answer.opened === false && answer.folder) folderNote.value = { folder: answer.folder, opened: false, hint: answer.hint ?? '' }
  return answer
}

/** Copy `text` to the clipboard; `false` when the browser refuses (the field stays selected to copy by hand). */
export async function copyText(text: string, clipboard: Pick<Clipboard, 'writeText'> | null = globalThis.navigator?.clipboard ?? null): Promise<boolean> {
  if (!clipboard) return false
  try {
    await clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
