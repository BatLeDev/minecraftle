import { watch } from 'vue'
import type { Ref } from 'vue'

/**
 * Gives focus back to whatever opened a dialog, once it closes.
 *
 * Vuetify restores focus on its own when a dialog is wired to an `activator`,
 * but these are driven by a plain `v-model`, so it has nothing to return to and
 * a keyboard user is dropped at the top of the document instead.
 */
export function useReturnFocus (isOpen: Ref<boolean>) {
  let opener: HTMLElement | null = null

  watch(isOpen, (open, wasOpen) => {
    if (open && !wasOpen) {
      opener = document.activeElement as HTMLElement | null
      return
    }
    if (!open && wasOpen) {
      // The opener can be gone or disabled by now — the Craft button after the
      // last attempt, for instance — so a failed focus is left as it is rather
      // than moved somewhere arbitrary.
      if (opener?.isConnected && !(opener as HTMLButtonElement).disabled) opener.focus()
      opener = null
    }
  })
}
