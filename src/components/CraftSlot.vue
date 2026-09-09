<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ItemIcon from './ItemIcon.vue'
import { useOptions } from '@/composables/useOptions.ts'
import { itemName } from '@/utils/items.ts'
import { Hint } from '@/utils/types.ts'
import type { Cell } from '@/utils/types.ts'

const props = defineProps<{
  item: Cell
  /** Omitted while the guess is still being built. */
  hint?: Hint
  index: number
  interactive?: boolean
}>()

const emit = defineEmits<{
  place: []
  clear: []
  press: []
  enter: []
  release: []
}>()

const { t } = useI18n()
const { options } = useOptions()

const row = computed(() => Math.floor(props.index / 3) + 1)
const col = computed(() => (props.index % 3) + 1)

const hintClass = computed(() => {
  // An empty slot stays empty even in a played guess: the shape of a recipe is
  // part of the puzzle, so a blank must not read as a wrong ingredient.
  if (props.hint === undefined || !props.item) return null
  if (props.hint === Hint.Correct) return 'slot--correct'
  if (props.hint === Hint.Misplaced) return 'slot--misplaced'
  return 'slot--absent'
})

const label = computed(() => {
  const position = { row: row.value, col: col.value }
  if (!props.item) return t('a11y.slotEmpty', position)
  const item = itemName(props.item, options.value.locale)
  if (props.hint === Hint.Correct) return t('a11y.slotCorrect', { ...position, item })
  if (props.hint === Hint.Misplaced) return t('a11y.slotMisplaced', { ...position, item })
  if (props.hint === Hint.Absent) return t('a11y.slotAbsent', { ...position, item })
  return t('a11y.slotFilled', { ...position, item })
})
</script>

<template>
  <!-- A real button when the slot can be played, so focus, Enter and screen
       reader announcements all come for free. Played guesses are inert. -->
  <button
    v-if="interactive"
    type="button"
    class="slot"
    :class="hintClass"
    :aria-label="label"
    :data-slot-index="index"
    :data-testid="`slot-${index}`"
    @keydown.enter.prevent="emit('place')"
    @keydown.space.prevent="emit('place')"
    @keydown.delete.prevent="emit('clear')"
    @keydown.backspace.prevent="emit('clear')"
    @contextmenu.prevent="emit('clear')"
    @pointerdown="emit('press')"
    @pointerenter="emit('enter')"
    @pointermove="emit('enter')"
    @pointerup="emit('release')"
  >
    <ItemIcon
      v-if="item"
      :item="item"
      :size="48"
    />
  </button>
  <div
    v-else
    class="slot"
    :class="hintClass"
    role="img"
    :aria-label="label"
    :data-testid="`slot-${index}`"
  >
    <ItemIcon
      v-if="item"
      :item="item"
      :size="48"
    />
  </div>
</template>
