<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import CraftSlot from './CraftSlot.vue'
import ItemIcon from './ItemIcon.vue'
import { GRID_CELLS } from '@/utils/grid.ts'
import type { Grid, Hints } from '@/utils/types.ts'

const props = defineProps<{
  grid: Grid
  hints?: Hints
  interactive?: boolean
  /** 1-based, for the accessible name; omitted on the grid being built. */
  guessNumber?: number
  output?: string | null
  /** Overrides the generated test id, for grids that are neither a guess nor the draft. */
  testId?: string
}>()

const emit = defineEmits<{ place: [index: number]; clear: [index: number] }>()

const { t } = useI18n()

const slots = ref<HTMLElement[]>([])

const label = computed(() => props.guessNumber
  ? t('a11y.guessNumber', { n: props.guessNumber })
  : t('a11y.currentGuess'))

/**
 * Arrow keys walk the grid.
 *
 * Without this the grid is only reachable by tabbing through nine buttons in a
 * row, which tells a keyboard user nothing about the two-dimensional shape they
 * are building — the shape being the whole puzzle.
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
  const target = slots.value[i + delta]
  // v-btn renders the button itself, so the ref may be the component root
  ;(target as unknown as { $el?: HTMLElement })?.$el?.focus?.() ?? target?.focus?.()
}
</script>

<template>
  <div class="d-flex align-center ga-3">
    <div
      class="craft-grid"
      role="group"
      :aria-label="label"
      :data-testid="testId ?? (guessNumber ? `guess-${guessNumber}` : 'draft-grid')"
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
        @keydown="onKeydown($event, i - 1)"
      />
    </div>

    <!-- The crafting result, which is feedback in its own right: a guess that
         crafts the wrong thing still tells the player their shape is valid. -->
    <v-sheet
      class="craft-output d-flex align-center justify-center"
      :class="{ 'craft-output--empty': !output }"
      width="52"
      height="52"
      rounded="sm"
      role="img"
      :aria-label="output ? $t('board.output') : ''"
      :data-testid="testId ? `${testId}-output` : (guessNumber ? `output-${guessNumber}` : 'output-draft')"
    >
      <ItemIcon
        v-if="output"
        :item="output"
        :size="40"
      />
    </v-sheet>
  </div>
</template>

<style scoped>
.craft-grid {
  display: grid;
  grid-template-columns: repeat(3, auto);
  gap: 4px;
  padding: 6px;
  border-radius: 6px;
  background-color: rgb(var(--v-theme-surface-bright));
}

.craft-output {
  background-color: rgb(var(--v-theme-slot));
  border: 1px solid rgb(var(--v-theme-on-surface), 0.16);
}

.craft-output--empty {
  opacity: 0.45;
}
</style>
