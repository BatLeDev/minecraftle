<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from 'vuetify'
import {
  mdiCircleHalfFull, mdiChartBar, mdiDiceMultiple, mdiHelpCircleOutline, mdiTranslate
} from '@mdi/js'
import CraftGrid from './components/CraftGrid.vue'
import InventoryPanel from './components/InventoryPanel.vue'
import HowToPlayDialog from './components/HowToPlayDialog.vue'
import ResultDialog from './components/ResultDialog.vue'
import StatsDialog from './components/StatsDialog.vue'
import { useGame } from './composables/useGame.ts'
import { useOptions } from './composables/useOptions.ts'

const { locale } = useI18n()
const theme = useTheme()
const { options } = useOptions()
const {
  game, draft, mode, status, canSubmit, guessesLeft,
  placeAt, clearAt, clearDraft, submit, playRandom, playDaily
} = useGame()

const howToOpen = ref(false)
const statsOpen = ref(false)
const resultOpen = ref(false)

// The palette lives in two themes rather than in component styles, so the
// high-contrast switch is one call and nothing has to know the colours.
watch(() => options.value.highContrast, high => {
  theme.change(high ? 'contrast' : 'minecraftle')
}, { immediate: true })

watch(() => options.value.locale, value => { locale.value = value }, { immediate: true })

// The end-of-game dialog opens once per finished game, and stays closable.
watch(status, (value, previous) => {
  if (value !== 'playing' && previous === 'playing') resultOpen.value = true
})

const showDraft = computed(() => status.value === 'playing')

function toggleLocale () {
  options.value.locale = options.value.locale === 'fr' ? 'en' : 'fr'
}
</script>

<template>
  <v-app>
    <v-app-bar
      flat
      density="comfortable"
    >
      <v-app-bar-title class="font-weight-bold">
        {{ $t('title') }}
      </v-app-bar-title>

      <v-btn
        :icon="mdiHelpCircleOutline"
        :aria-label="$t('nav.howToPlay')"
        @click="howToOpen = true"
      >
        <v-icon :icon="mdiHelpCircleOutline" />
        <v-tooltip
          activator="parent"
          location="bottom"
        >
          {{ $t('nav.howToPlay') }}
        </v-tooltip>
      </v-btn>

      <v-btn
        :aria-label="$t('nav.stats')"
        @click="statsOpen = true"
      >
        <v-icon :icon="mdiChartBar" />
        <v-tooltip
          activator="parent"
          location="bottom"
        >
          {{ $t('nav.stats') }}
        </v-tooltip>
      </v-btn>

      <v-btn
        :aria-label="$t('nav.highContrast')"
        :aria-pressed="options.highContrast"
        @click="options.highContrast = !options.highContrast"
      >
        <v-icon :icon="mdiCircleHalfFull" />
        <v-tooltip
          activator="parent"
          location="bottom"
        >
          {{ $t('nav.highContrast') }}
        </v-tooltip>
      </v-btn>

      <v-btn
        :aria-label="$t('nav.language')"
        @click="toggleLocale"
      >
        <v-icon :icon="mdiTranslate" />
        <v-tooltip
          activator="parent"
          location="bottom"
        >
          {{ $t('nav.language') }}
        </v-tooltip>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container class="board">
        <p class="text-center text-medium-emphasis mb-4">
          {{ $t('tagline') }}
        </p>

        <v-alert
          v-if="mode === 'random'"
          class="mb-4"
          density="compact"
          type="info"
          variant="tonal"
        >
          {{ $t('board.randomGame') }}
        </v-alert>

        <div class="d-flex flex-column align-center ga-2 mb-4">
          <CraftGrid
            v-for="(guess, i) in game.guesses"
            :key="i"
            :grid="guess"
            :hints="game.hints[i]"
            :guess-number="i + 1"
            :output="game.crafted[i]"
          />
          <CraftGrid
            v-if="showDraft"
            :grid="draft"
            interactive
            :output="null"
            @place="placeAt"
            @clear="clearAt"
          />
        </div>

        <div class="d-flex align-center justify-center ga-2 mb-6">
          <v-btn
            color="primary"
            :disabled="!canSubmit"
            @click="submit"
          >
            {{ $t('board.craft') }}
          </v-btn>
          <v-btn
            variant="text"
            :disabled="status !== 'playing'"
            @click="clearDraft"
          >
            {{ $t('board.clear') }}
          </v-btn>
          <span class="text-medium-emphasis text-body-2">
            {{ $t('board.guessesLeft', { count: guessesLeft }, guessesLeft) }}
          </span>
        </div>

        <InventoryPanel class="mb-6" />

        <div class="d-flex ga-2 mb-8">
          <v-btn
            :variant="mode === 'daily' ? 'tonal' : 'text'"
            @click="playDaily"
          >
            {{ $t('nav.daily') }}
          </v-btn>
          <v-btn
            :prepend-icon="mdiDiceMultiple"
            :variant="mode === 'random' ? 'tonal' : 'text'"
            @click="playRandom"
          >
            {{ $t('nav.random') }}
          </v-btn>
          <v-spacer />
          <v-btn
            v-if="status !== 'playing'"
            variant="text"
            @click="resultOpen = true"
          >
            {{ $t('result.summary') }}
          </v-btn>
        </div>

        <footer class="text-caption text-medium-emphasis text-center">
          <p>
            {{ $t('footer.fork') }}
            <a
              class="text-medium-emphasis"
              href="https://github.com/zachpmanson/minecraftle"
              rel="noopener"
            >{{ $t('nav.source') }}</a>
          </p>
          <p>{{ $t('footer.mojang') }}</p>
        </footer>
      </v-container>
    </v-main>

    <HowToPlayDialog v-model="howToOpen" />
    <StatsDialog v-model="statsOpen" />
    <ResultDialog v-model="resultOpen" />
  </v-app>
</template>

<style scoped>
.board {
  max-width: 32rem;
}
</style>
