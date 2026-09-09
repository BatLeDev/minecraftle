<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import CraftGrid from './CraftGrid.vue'
import McButton from './McButton.vue'
import McDialog from './McDialog.vue'
import { useGame, recipes } from '@/composables/useGame.ts'
import { useOptions } from '@/composables/useOptions.ts'
import { itemName } from '@/utils/items.ts'
import { placements } from '@/utils/variants.ts'
import { shareText } from '@/utils/share.ts'

const model = defineModel<boolean>({ required: true })

const { t } = useI18n()
const { game, solution, day, mode, status, playRandom } = useGame()
const { options } = useOptions()

const copied = ref(false)

const solutionGrid = computed(() => placements(recipes[solution.value].input)[0])
const solutionName = computed(() => itemName(recipes[solution.value].output, options.value.locale))

const heading = computed(() => status.value === 'won'
  ? t('result.won', { count: game.value.guesses.length }, game.value.guesses.length)
  : t('result.lost'))

const summary = computed(() => shareText({
  day: day.value,
  guesses: game.value.guesses,
  hints: game.value.hints,
  won: status.value === 'won',
  highContrast: options.value.highContrast
}))

async function copy () {
  try {
    await navigator.clipboard.writeText(summary.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 1500)
  } catch {
    // clipboard denied or unavailable: the summary is on screen to copy by hand
  }
}
</script>

<template>
  <McDialog
    v-model="model"
    :title="heading"
  >
    <p>{{ $t('result.solution', { name: solutionName }) }}</p>

    <div class="solution">
      <CraftGrid
        :grid="solutionGrid"
        :output="recipes[solution].output"
        test-id="solution-grid"
      />
    </div>

    <pre
      v-if="mode === 'daily'"
      class="summary"
    >{{ summary }}</pre>

    <div class="actions">
      <McButton
        v-if="mode === 'daily'"
        small
        @click="copy"
      >
        {{ copied ? $t('result.copied') : $t('result.share') }}
      </McButton>
      <McButton
        small
        @click="playRandom(); model = false"
      >
        {{ $t('result.playRandom') }}
      </McButton>
      <McButton
        small
        @click="model = false"
      >
        {{ $t('result.close') }}
      </McButton>
    </div>
  </McDialog>
</template>

<style scoped>
.solution {
  display: flex;
  justify-content: center;
  margin-bottom: 0.75rem;
}

.summary {
  max-height: 14rem;
  margin: 0 0 0.75rem;
  overflow-y: auto;
  font-family: inherit;
  line-height: 1.15;
  text-align: center;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: flex-end;
}
</style>
