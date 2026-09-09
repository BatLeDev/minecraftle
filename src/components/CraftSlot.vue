<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ItemIcon from './ItemIcon.vue'
import { useOptions } from '@/composables/useOptions.ts'
import { itemName } from '@/utils/items.ts'
import { Hint } from '@/utils/types.ts'
import type { Cell } from '@/utils/types.ts'

const props = withDefaults(defineProps<{
  item: Cell
  /** Omitted while the guess is still being built. */
  hint?: Hint
  index: number
  interactive?: boolean
  size?: number
}>(), { size: 52 })

const emit = defineEmits<{ place: []; clear: [] }>()

const { t } = useI18n()
const { options } = useOptions()

const row = computed(() => Math.floor(props.index / 3) + 1)
const col = computed(() => (props.index % 3) + 1)

const colour = computed(() => {
  // An empty slot stays empty even in a played guess: the shape of a recipe is
  // part of the puzzle, so a blank must not read as a wrong ingredient.
  if (props.hint === undefined || !props.item) return 'slot-blank'
  if (props.hint === Hint.Correct) return 'bg-correct'
  if (props.hint === Hint.Misplaced) return 'bg-misplaced'
  return 'bg-absent'
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
       reader announcements all come for free. Past guesses are inert. -->
  <v-btn
    v-if="interactive"
    class="craft-slot"
    :class="colour"
    :width="size"
    :height="size"
    :aria-label="label"
    :data-testid="`slot-${index}`"
    variant="flat"
    rounded="sm"
    @click="emit('place')"
    @contextmenu.prevent="emit('clear')"
    @keydown.delete.prevent="emit('clear')"
    @keydown.backspace.prevent="emit('clear')"
  >
    <ItemIcon
      v-if="item"
      :item="item"
      :size="size - 12"
    />
  </v-btn>
  <v-sheet
    v-else
    class="craft-slot d-flex align-center justify-center"
    :class="colour"
    :width="size"
    :height="size"
    rounded="sm"
    role="img"
    :aria-label="label"
    :data-testid="`slot-${index}`"
  >
    <ItemIcon
      v-if="item"
      :item="item"
      :size="size - 12"
    />
  </v-sheet>
</template>

<style scoped>
.craft-slot {
  min-width: 0;
  border: 1px solid rgb(var(--v-theme-on-surface), 0.16);
}

.slot-blank {
  background-color: rgb(var(--v-theme-slot));
}
</style>
