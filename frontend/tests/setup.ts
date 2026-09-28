/**
 * The emulator's gaps, filled for the tests only.
 *
 * happy-dom does not implement the legacy ``Option`` constructor. Every browser has it and the
 * widgets use it (gain ranges, EQ presets, reverb presets), so the tests provide it here.
 */
if (typeof (globalThis as { Option?: unknown }).Option !== 'function') {
  function Option(text = '', value = ''): HTMLOptionElement {
    const option = document.createElement('option')
    option.textContent = text
    option.value = value
    return option
  }
  Object.defineProperty(globalThis, 'Option', { value: Option, configurable: true, writable: true })
}
