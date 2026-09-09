<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import ItemIcon from './ItemIcon.vue'
import McButton from './McButton.vue'
import { useDragAndDrop } from '@/composables/useDragAndDrop.ts'
import { useGame } from '@/composables/useGame.ts'
import { useOptions } from '@/composables/useOptions.ts'
import { MAX_GUESSES } from '@/utils/game.ts'
import { ingredients, itemName } from '@/utils/items.ts'
import { Hint } from '@/utils/types.ts'
import type { ItemId } from '@/utils/types.ts'

const { t } = useI18n()
const { options } = useOptions()
const { selected, ingredientHints, attempt, status, clearDraft } = useGame()
const { pressIngredient, toggleIngredient } = useDragAndDrop()

/**
 * Tints an ingredient with the best hint it has ever earned, so a player can see
 * at a glance what they have already ruled out instead of scrolling back through
 * their guesses — upstream issue #42. The corner shape doubles the colour.
 */
function hintClass (item: ItemId) {
  const hint = ingredientHints.value.get(item)
  if (hint === Hint.Correct) return 'slot--correct'
  if (hint === Hint.Misplaced) return 'slot--misplaced'
  if (hint === Hint.Absent) return 'slot--absent'
  return null
}

function label (item: ItemId) {
  const name = itemName(item, options.value.locale)
  return selected.value === item
    ? t('a11y.selectedIngredient', { item: name })
    : t('a11y.selectIngredient', { item: name })
}
</script>

<template>
  <section class="inventory box inv-background">
    <h2>{{ $t('board.ingredients') }}</h2>

    <div class="slots">
      <button
        v-for="item in ingredients"
        :key="item"
        type="button"
        class="slot"
        :class="[hintClass(item), { 'slot--held': selected === item }]"
        :aria-pressed="selected === item"
        :aria-label="label(item)"
        :title="itemName(item, options.locale)"
        :data-testid="`ingredient-${item}`"
        @keydown.enter.prevent="toggleIngredient(item)"
        @keydown.space.prevent="toggleIngredient(item)"
        @pointerdown="pressIngredient(item)"
      >
        <ItemIcon
          :item="item"
          :size="40"
        />
      </button>
    </div>

    <div class="footer">
      <McButton
        :disabled="status !== 'playing'"
        @click="clearDraft"
      >
        {{ $t('board.clear') }}
      </McButton>
      <p>{{ $t('board.guessCounter', { n: attempt, total: MAX_GUESSES }) }}</p>
    </div>
  </section>
</template>

<style scoped>
.inventory {
  padding: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
  width: 22rem;
}

.inventory h2 {
  align-self: flex-start;
  font-size: 1.1rem;
  white-space: nowrap;
}

/* Six to a row, as the box width allows, and touching like the real inventory. */
.slots {
  display: grid;
  grid-template-columns: repeat(6, 3rem);
}

.footer {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.slot--held {
  outline: 3px solid var(--focus);
  outline-offset: -3px;
}
</style>
