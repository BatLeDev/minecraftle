<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import CraftArrow from './CraftArrow.vue'
import CraftSlot from './CraftSlot.vue'
import ItemIcon from './ItemIcon.vue'
import { useOptions } from '@/composables/useOptions.ts'
import { itemName } from '@/utils/items.ts'
import { GRID_CELLS } from '@/utils/grid.ts'
import type { Grid, Hints } from '@/utils/types.ts'

const props = defineProps<{
  grid: Grid
  hints?: Hints
  interactive?: boolean
  /** 1-based, for the accessible name; omitted on the grid being built. */
  guessNumber?: number
  output?: string | null
  /** Overrides the generated test id, for a grid that is neither a guess nor the draft. */
  testId?: string
  /** Drops the panel background, for the grid shown inside a dialog. */
  bare?: boolean
}>()

const emit = defineEmits<{
  place: [index: number]
  clear: [index: number]
  press: [index: number]
  enter: [index: number]
  release: [index: number]
  submit: []
}>()

const { t } = useI18n()
const { options } = useOptions()
const slots = ref<HTMLElement[]>([])

const label = computed(() => props.guessNumber
  ? t('a11y.guessNumber', { n: props.guessNumber })
  : t('a11y.currentGuess'))

const testId = computed(() =>
  props.testId ?? (props.guessNumber ? `guess-${props.guessNumber}` : 'draft-grid'))

const outputLabel = computed(() => {
  if (!props.output) return t('board.outputEmpty')
  const name = itemName(props.output, options.value.locale)
  return props.interactive ? t('board.craftItem', { name }) : t('board.outputIs', { name })
})

/**
 * Arrow keys walk the grid.
 *
 * Without this the grid is only reachable by tabbing through nine buttons in a
 * row, which tells a keyboard user nothing about the two-dimensional shape they
 * are building — and the shape is the whole puzzle.
 */
function onKeydown (event: KeyboardEvent, i: number) {
  const moves: Record<string, number> = {
    ArrowRight: i % 3 === 2 ? 0 : 1,
    ArrowLeft: i % 3 === 0 ? 0 : -1,
    ArrowDown: i > 5 ? 0 : 3,
    ArrowUp: i < 3 ? 0 : -3
  }
  const delta = moves[event.key]
  if (delta === undefined) return
  event.preventDefault()
  const target = slots.value[i + delta] as unknown as { $el?: HTMLElement }
  ;(target?.$el ?? target as unknown as HTMLElement)?.focus?.()
}
</script>

<template>
  <!-- Each attempt is its own inventory window, stacked down the page, as
       upstream draws them. -->
  <div
    class="crafting-table box"
    :class="{ 'inv-background': !bare }"
  >
    <div
      class="grid"
      role="group"
      :aria-label="label"
      :data-testid="testId"
    >
      <CraftSlot
        v-for="i in GRID_CELLS"
        :key="i - 1"
        :ref="el => { if (el) slots[i - 1] = el as HTMLElement }"
        :item="grid[i - 1]"
        :hint="hints?.[i - 1]"
        :index="i - 1"
        :interactive="interactive"
        @place="emit('place', i - 1)"
        @clear="emit('clear', i - 1)"
        @press="emit('press', i - 1)"
        @enter="emit('enter', i - 1)"
        @release="emit('release', i - 1)"
        @keydown="onKeydown($event, i - 1)"
      />
    </div>

    <CraftArrow />

    <!-- The result slot is also how a guess is submitted, as in the game: it
         only accepts a click once the grid actually crafts something, so every
         attempt is a real recipe rather than an arbitrary arrangement. -->
    <button
      v-if="interactive"
      type="button"
      class="slot slot--output"
      :disabled="!output"
      :aria-label="outputLabel"
      :data-testid="`${testId}-output`"
      @click="emit('submit')"
    >
      <ItemIcon
        v-if="output"
        :item="output"
        :size="48"
      />
    </button>
    <div
      v-else
      class="slot slot--output"
      role="img"
      :aria-label="outputLabel"
      :data-testid="`${testId}-output`"
    >
      <ItemIcon
        v-if="output"
        :item="output"
        :size="48"
      />
    </div>
  </div>
</template>

<style scoped>
.crafting-table {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  /* Less air above and below than at the sides, as the crafting window has. */
  padding: 0.6rem 0.9rem;
}

/* Gaps taken from the crafting window texture, where the arrow sits closer to
   the grid than to the result. */
.crafting-table .craft-arrow {
  margin: 0 1.25rem 0 1rem;
}

/* Three columns of touching slots, as in the crafting window. */
.grid {
  display: grid;
  grid-template-columns: repeat(3, var(--slot-size));
}

</style>
