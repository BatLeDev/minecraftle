<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import CraftGrid from './components/CraftGrid.vue'
import HeldItem from './components/HeldItem.vue'
import HowToPlayDialog from './components/HowToPlayDialog.vue'
import InventoryPanel from './components/InventoryPanel.vue'
import McButton from './components/McButton.vue'
import ResultDialog from './components/ResultDialog.vue'
import StatsDialog from './components/StatsDialog.vue'
import { useDragAndDrop } from './composables/useDragAndDrop.ts'
import { useGame, recipes } from './composables/useGame.ts'
import { useOptions } from './composables/useOptions.ts'
import { itemName } from './utils/items.ts'
import { Hint } from './utils/types.ts'

const { t, locale } = useI18n()
const { options } = useOptions()
const {
  game, draft, mode, status, guessesLeft, solution, draftOutput, craftedOutputs,
  placeAt, clearAt, submit, playRandom, playDaily
} = useGame()
const { pressSlot, enterSlot, releaseSlot } = useDragAndDrop()

const howToOpen = ref(false)
const statsOpen = ref(false)
const resultOpen = ref(false)

const showDraft = computed(() => status.value === 'playing')

// The palette lives in a data attribute rather than in component styles, so the
// high-contrast switch swaps three custom properties and nothing else knows.
watch(() => options.value.highContrast, high => {
  document.documentElement.dataset.contrast = high ? 'high' : 'normal'
}, { immediate: true })

watch(() => options.value.locale, value => {
  locale.value = value
  // The document language has to follow the interface, or a screen reader keeps
  // reading French text with an English voice.
  document.documentElement.lang = value
}, { immediate: true })

// The end-of-game dialog opens once per finished game, and stays closable.
watch(status, (value, previous) => {
  if (value !== 'playing' && previous === 'playing') resultOpen.value = true
})

// Spoken feedback after each attempt. Nothing else announces the result: the
// colours and the board are silent to a screen reader once focus stays put.
const announcement = ref('')
watch(() => game.value.guesses.length, count => {
  if (!count) { announcement.value = ''; return }
  const name = itemName(recipes[solution.value].output, options.value.locale)
  if (status.value === 'won') {
    announcement.value = t('a11y.announceWon', { n: count, name })
  } else if (status.value === 'lost') {
    announcement.value = t('a11y.announceLost', { name })
  } else {
    const hints = game.value.hints[count - 1]
    announcement.value = t('a11y.announceGuess', {
      n: count,
      correct: hints.filter(h => h === Hint.Correct).length,
      misplaced: hints.filter(h => h === Hint.Misplaced).length,
      left: guessesLeft.value
    })
  }
})

function toggleLocale () {
  options.value.locale = options.value.locale === 'fr' ? 'en' : 'fr'
}
</script>

<template>
  <HeldItem />

  <p
    class="sr-only"
    aria-live="polite"
    role="status"
  >
    {{ announcement }}
  </p>

  <div class="page">
    <header>
      <h1>{{ $t('title') }}</h1>
      <nav class="nav">
        <div class="nav-row">
          <McButton @click="howToOpen = true">
            {{ $t('nav.howToPlay') }}
          </McButton>
          <McButton @click="statsOpen = true">
            {{ $t('nav.stats') }}
          </McButton>
        </div>
        <div class="nav-row">
          <McButton
            :aria-pressed="options.highContrast"
            @click="options.highContrast = !options.highContrast"
          >
            {{ $t('nav.highContrast') }}
          </McButton>
          <McButton @click="toggleLocale">
            {{ $t('nav.language') }}
          </McButton>
        </div>
        <div class="nav-row">
          <McButton @click="playDaily">
            {{ $t('nav.daily') }}
          </McButton>
          <McButton @click="playRandom">
            {{ $t('nav.random') }}
          </McButton>
        </div>
      </nav>
    </header>

    <main class="board">
      <div class="banner inv-background box">
        <div class="marquee">
          <p>{{ $t('board.banner') }}</p>
        </div>
      </div>

      <p
        v-if="mode === 'random'"
        class="notice inv-background box"
      >
        {{ $t('board.randomGame') }}
      </p>

      <CraftGrid
        v-for="(guess, i) in game.guesses"
        :key="i"
        :grid="guess"
        :hints="game.hints[i]"
        :guess-number="i + 1"
        :output="craftedOutputs[i]"
      />
      <CraftGrid
        v-if="showDraft"
        :grid="draft"
        interactive
        :output="draftOutput"
        @place="placeAt"
        @clear="clearAt"
        @press="pressSlot"
        @enter="enterSlot"
        @release="releaseSlot"
        @submit="submit"
      />

      <InventoryPanel />

      <McButton
        v-if="status !== 'playing'"
        @click="resultOpen = true"
      >
        {{ $t('result.summary') }}
      </McButton>

      <footer>
        <p>
          {{ $t('footer.fork') }}
          <a
            href="https://github.com/BatLeDev/minecraftle"
            rel="noopener"
          >{{ $t('nav.source') }}</a>
        </p>
        <p>{{ $t('footer.mojang') }}</p>
      </footer>
    </main>
  </div>

  <HowToPlayDialog v-model="howToOpen" />
  <StatsDialog v-model="statsOpen" />
  <ResultDialog v-model="resultOpen" />
</template>

<style scoped>
.page {
  /* The whole column matches the panels, so the buttons line up with the board
     instead of overhanging it. */
  width: 22rem;
  max-width: 100%;
  margin: 0 auto;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.nav-row {
  display: flex;
  gap: 0.5rem;
  font-size: 0.85rem;
}

/* Equal widths, as the game's menus lay their buttons out. */
.nav-row > * {
  flex: 1;
}

.board {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.banner {
  width: 100%;
  padding: 0.6rem 0.75rem;
}

.notice {
  width: 100%;
  padding: 0.75rem;
  text-align: center;
}

footer {
  margin-top: 1rem;
  font-size: 0.7rem;
  color: var(--inv-background);
  text-align: center;
}

footer a {
  color: var(--button-text-hover);
}
</style>
