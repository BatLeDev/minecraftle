<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

const props = defineProps<{ title: string }>()
const model = defineModel<boolean>({ required: true })

const panel = ref<HTMLElement | null>(null)
let opener: HTMLElement | null = null

/**
 * Focus goes in when the dialog opens and comes back to whatever opened it when
 * it closes; without the second half a keyboard user is dropped at the top of
 * the document.
 */
watch(model, async (open, wasOpen) => {
  if (open && !wasOpen) {
    opener = document.activeElement as HTMLElement | null
    await nextTick()
    panel.value?.focus()
    return
  }
  if (!open && wasOpen) {
    // The opener can be gone or disabled by now, so a failed focus is left
    // alone rather than moved somewhere arbitrary.
    if (opener?.isConnected && !(opener as HTMLButtonElement).disabled) opener.focus()
    opener = null
  }
})

/** Keeps Tab inside the dialog while it is open. */
function onKeydown (event: KeyboardEvent) {
  if (event.key === 'Escape') { model.value = false; return }
  if (event.key !== 'Tab' || !panel.value) return
  const focusable = [...panel.value.querySelectorAll<HTMLElement>(
    'button:not(:disabled), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )]
  if (!focusable.length) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  const active = document.activeElement
  if (event.shiftKey && (active === first || active === panel.value)) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}
</script>

<template>
  <div
    v-if="model"
    class="mc-backdrop"
    @pointerdown.self="model = false"
  >
    <div
      ref="panel"
      class="mc-dialog box inv-background"
      role="dialog"
      aria-modal="true"
      :aria-label="props.title"
      tabindex="-1"
      @keydown="onKeydown"
    >
      <h2>{{ props.title }}</h2>
      <slot />
    </div>
  </div>
</template>
