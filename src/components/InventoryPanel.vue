<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import ItemIcon from './ItemIcon.vue'
import { useGame } from '@/composables/useGame.ts'
import { useOptions } from '@/composables/useOptions.ts'
import { ingredients, itemName } from '@/utils/items.ts'
import { Hint } from '@/utils/types.ts'
import type { ItemId } from '@/utils/types.ts'

const { t } = useI18n()
const { options } = useOptions()
const { selected, select, ingredientHints } = useGame()

/**
 * Tints an ingredient with the best hint it has ever earned, so a player can see
 * at a glance what they have already ruled out instead of scrolling back through
 * their guesses — upstream issue #42.
 */
function tint (item: ItemId) {
  const hint = ingredientHints.value.get(item)
  if (hint === Hint.Correct) return 'bg-correct'
  if (hint === Hint.Misplaced) return 'bg-misplaced'
  if (hint === Hint.Absent) return 'bg-absent'
  return 'inventory-slot--untried'
}

function label (item: ItemId) {
  const name = itemName(item, options.value.locale)
  return selected.value === item
    ? t('a11y.selectedIngredient', { item: name })
    : t('a11y.selectIngredient', { item: name })
}
</script>

<template>
  <section>
    <h2 class="text-subtitle-2 text-medium-emphasis mb-2">
      {{ $t('board.ingredients') }}
    </h2>
    <div class="inventory">
      <v-btn
        v-for="item in ingredients"
        :key="item"
        class="inventory-slot"
        :class="[tint(item), { 'inventory-slot--selected': selected === item }]"
        :aria-pressed="selected === item"
        :aria-label="label(item)"
        :data-testid="`ingredient-${item}`"
        width="48"
        height="48"
        variant="flat"
        rounded="sm"
        @click="select(item)"
      >
        <ItemIcon
          :item="item"
          :size="34"
        />
        <v-tooltip
          activator="parent"
          location="top"
        >
          {{ itemName(item, options.locale) }}
        </v-tooltip>
      </v-btn>
    </div>
  </section>
</template>

<style scoped>
.inventory {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.inventory-slot {
  min-width: 0;
  border: 1px solid rgb(var(--v-theme-on-surface), 0.16);
}

.inventory-slot--untried {
  background-color: rgb(var(--v-theme-slot));
}

.inventory-slot--selected {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}
</style>
