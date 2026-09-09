<script setup lang="ts">
import { computed, ref } from 'vue'
import { mdiCheck, mdiContentCopy } from '@mdi/js'
import CraftGrid from './CraftGrid.vue'
import { useGame, recipes } from '@/composables/useGame.ts'
import { useOptions } from '@/composables/useOptions.ts'
import { itemName } from '@/utils/items.ts'
import { placements } from '@/utils/variants.ts'
import { shareText } from '@/utils/share.ts'

const model = defineModel<boolean>({ required: true })

const { game, solution, day, mode, status, playRandom } = useGame()
const { options } = useOptions()

const copied = ref(false)

const solutionGrid = computed(() => placements(recipes[solution.value].input)[0])
const solutionName = computed(() => itemName(recipes[solution.value].output, options.value.locale))

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
  <v-dialog
    v-model="model"
    max-width="30rem"
    scrollable
  >
    <v-card>
      <v-card-item>
        <v-card-title>
          {{ status === 'won'
            ? $t('result.won', { count: game.guesses.length }, game.guesses.length)
            : $t('result.lost') }}
        </v-card-title>
        <v-card-subtitle>{{ $t('result.solution', { name: solutionName }) }}</v-card-subtitle>
      </v-card-item>

      <v-card-text>
        <div class="d-flex justify-center mb-4">
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
      </v-card-text>

      <v-card-actions>
        <v-btn
          v-if="mode === 'daily'"
          :prepend-icon="copied ? mdiCheck : mdiContentCopy"
          @click="copy"
        >
          {{ copied ? $t('result.copied') : $t('result.share') }}
        </v-btn>
        <v-spacer />
        <v-btn @click="playRandom(); model = false">
          {{ $t('result.playRandom') }}
        </v-btn>
        <v-btn @click="model = false">
          {{ $t('result.close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.summary {
  font-family: inherit;
  line-height: 1.15;
  text-align: center;
  max-height: 16rem;
  overflow-y: auto;
  margin: 0;
}
</style>
