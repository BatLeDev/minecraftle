<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import CraftGrid from './components/CraftGrid.vue'
import HeldItem from './components/HeldItem.vue'
import HowToPlayDialog from './components/HowToPlayDialog.vue'
import InventoryPanel from './components/InventoryPanel.vue'
import McButton from './components/McButton.vue'
import OutOfTriesDialog from './components/OutOfTriesDialog.vue'
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
  game, draft, mode, status, guessesLeft, solution, draftOutput, craftedOutputs, continued,
  placeAt, clearAt, submit, playRandom, playDaily, keepPlaying
} = useGame()
const { pressSlot, enterSlot, releaseSlot } = useDragAndDrop()

const howToOpen = ref(false)
const statsOpen = ref(false)
const resultOpen = ref(false)
const outOfTriesOpen = ref(false)

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

// A win reveals the result straight away. Running out of attempts asks first,
// so a player who wants to keep looking is not told the answer.
watch(status, (value, previous) => {
  if (previous !== 'playing') return
  if (value === 'won') resultOpen.value = true
  else if (value === 'lost') outOfTriesOpen.value = true
})

function giveUp () {
  outOfTriesOpen.value = false
  resultOpen.value = true
}

function keepGoing () {
  outOfTriesOpen.value = false
  keepPlaying()
}

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
    const counts = {
      n: count,
      correct: hints.filter(h => h === Hint.Correct).length,
      misplaced: hints.filter(h => h === Hint.Misplaced).length
    }
    // Past the limit there is no remaining count to report.
    announcement.value = continued.value
      ? t('a11y.announceGuessOver', counts)
      : t('a11y.announceGuess', { ...counts, left: guessesLeft.value })
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
          <McButton @click="playDaily">
            {{ $t('nav.daily') }}
          </McButton>
          <McButton @click="playRandom">
            {{ $t('nav.random') }}
          </McButton>
        </div>
        <div class="nav-row">
          <McButton @click="howToOpen = true">
            {{ $t('nav.howToPlay') }}
          </McButton>
          <McButton @click="statsOpen = true">
            {{ $t('nav.stats') }}
          </McButton>
        </div>
        <!-- Label and value on a full-width row, as the game's options menu
             reads, so each state is legible instead of guessed. -->
        <div class="nav-row">
          <McButton
            :aria-pressed="options.highContrast"
            data-testid="toggle-contrast"
            @click="options.highContrast = !options.highContrast"
          >
            <span>{{ $t('nav.highContrast') }} :</span>
            <span>{{ options.highContrast ? $t('nav.on') : $t('nav.off') }}</span>
          </McButton>
        </div>
        <div class="nav-row">
          <McButton
            data-testid="toggle-language"
            @click="toggleLocale"
          >
            <span>{{ $t('nav.language') }} :</span>
            <span>{{ $t('nav.languageValue') }}</span>
          </McButton>
        </div>
      </nav>
    </header>

    <main class="board">
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

  <OutOfTriesDialog
    v-model="outOfTriesOpen"
    @keep-playing="keepGoing"
    @give-up="giveUp"
  />
  <HowToPlayDialog v-model="howToOpen" />
  <StatsDialog v-model="statsOpen" />
  <ResultDialog v-model="resultOpen" />
</template>

<style scoped>
.page {
  /* Wide enough to leave the crafting row the margins the game gives it. */
  width: 26rem;
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
  /* The browser's default underline sits on the glyph baseline and collides
     with the descenders of this pixel font. */
  text-decoration-thickness: 1px;
  text-underline-offset: 0.25em;
}
</style>
