import { computed, ref, watch } from 'vue'
import { MAX_GUESSES, applyGuess, craft, craftIndex, createGame } from '@/utils/game.ts'
import { EMPTY_GRID, GRID_CELLS, setCell } from '@/utils/grid.ts'
import { dayNumber, puzzleForDay } from '@/utils/puzzle.ts'
import { seededRandom } from '@/utils/random.ts'
import { readJson, writeJson } from '@/utils/storage.ts'
import { Hint } from '@/utils/types.ts'
import type { Grid, ItemId, RecipeMap } from '@/utils/types.ts'
import { recordDaily } from './useStats.ts'
import recipesData from '@/data/recipes.json' with { type: 'json' }

const STORAGE_KEY = 'minecraftle:game'

export const recipes = recipesData as RecipeMap
const recipeKeys = Object.keys(recipes)

// Built once: every placement of every recipe, so telling what a grid crafts is
// a single lookup rather than a scan over the catalogue on each guess.
const index = craftIndex(recipes)

export type Mode = 'daily' | 'random'

type Saved = {
  day: number
  guesses: Grid[]
  draft: Grid
}

/** Overridable so tests can pin the date; production reads the real clock. */
const now = ref(new Date())

const mode = ref<Mode>('daily')
const day = ref(dayNumber(now.value))
const randomSolution = ref<string>(recipeKeys[0])
const guesses = ref<Grid[]>([])
const draft = ref<Grid>(EMPTY_GRID)
const selected = ref<ItemId | null>(null)

/**
 * Set when a player who has used all ten attempts chooses to keep going.
 *
 * The daily is already recorded as a loss by then — carrying on is for the
 * satisfaction of finding it, not for the statistics.
 */
const continued = ref(false)

const solution = computed(() => mode.value === 'daily'
  ? puzzleForDay(day.value, recipeKeys)
  : randomSolution.value)

/**
 * The engine state, replayed from the guesses rather than stored alongside them.
 *
 * Ten guesses at most, so replaying is far cheaper than keeping derived state in
 * sync — and it means a saved game only holds what the player actually did.
 */
const game = computed(() => {
  const limit = continued.value ? Number.POSITIVE_INFINITY : MAX_GUESSES
  let state = createGame(recipes, solution.value)
  for (const guess of guesses.value) state = applyGuess(state, guess, index, limit)
  return state
})

/**
 * The best hint each ingredient has earned so far, for tinting the inventory:
 * green wins over yellow, yellow over grey. This is what tells a player at a
 * glance which ingredients they have already ruled out.
 */
const ingredientHints = computed(() => {
  const best = new Map<ItemId, Hint>()
  game.value.guesses.forEach((guess, g) => {
    const hints = game.value.hints[g]
    for (let i = 0; i < GRID_CELLS; i++) {
      const item = guess[i]
      if (item === null) continue
      best.set(item, Math.max(best.get(item) ?? Hint.Absent, hints[i]) as Hint)
    }
  })
  return best
})

// --- persistence ---------------------------------------------------------
// Only the daily puzzle is saved. A random game is a throwaway, and saving it
// would let it overwrite the daily a player is halfway through.

function restore () {
  const saved = readJson<Partial<Saved>>(STORAGE_KEY, {})
  if (saved.day !== day.value || !Array.isArray(saved.guesses)) return
  guesses.value = saved.guesses.filter(isGrid).slice(0, MAX_GUESSES)
  if (isGrid(saved.draft)) draft.value = Object.freeze(saved.draft)
}

function isGrid (value: unknown): value is Grid {
  return Array.isArray(value) && value.length === GRID_CELLS &&
    value.every(cell => cell === null || typeof cell === 'string')
}

watch([guesses, draft], () => {
  if (mode.value !== 'daily') return
  writeJson(STORAGE_KEY, { day: day.value, guesses: guesses.value, draft: draft.value } satisfies Saved)
}, { deep: true })

// A finished daily counts once, on the day it was finished. Replaying it later
// changes nothing, which is what upstream issue #73 asked for.
watch(() => mode.value === 'daily' && game.value.status, status => {
  if (status === 'won' || status === 'lost') {
    recordDaily(day.value, status === 'won', game.value.guesses.length)
  }
}, { immediate: true })

restore()

// --- actions -------------------------------------------------------------

/**
 * The item each played guess crafted, as an item id.
 *
 * The engine records the recipe *key* — that is what the win check compares —
 * but an icon needs the item id, and the two are not the same string.
 */
const craftedOutputs = computed(() =>
  game.value.crafted.map(key => (key ? recipes[key].output : null)))

/**
 * What the grid being built would craft, live.
 *
 * Shown in the result slot as the player fills the grid, and it is also the
 * gate on submitting: a guess has to be a real recipe, which is what makes each
 * attempt worth something instead of an arbitrary arrangement.
 */
const draftOutput = computed(() => {
  const key = craft(index, draft.value)
  return key ? recipes[key].output : null
})

export function useGame () {
  const status = computed(() => game.value.status)
  const canSubmit = computed(() => status.value === 'playing' && draftOutput.value !== null)
  const guessesLeft = computed(() => MAX_GUESSES - game.value.guesses.length)
  /** True once the ten attempts are used up and the player has not chosen yet. */
  const outOfTries = computed(() => status.value === 'lost' && !continued.value)

  function keepPlaying () {
    continued.value = true
  }

  /** Which attempt is being played, 1-based, as the counter shows it. */
  const attempt = computed(() => continued.value
    ? game.value.guesses.length + 1
    : Math.min(game.value.guesses.length + 1, MAX_GUESSES))

  /** Picks an ingredient up, or puts it down if it was already held. */
  function select (item: ItemId | null) {
    selected.value = selected.value === item ? null : item
  }

  /**
   * Fills a slot with the held ingredient, or empties it when nothing is held.
   *
   * The original made the ingredient follow the mouse cursor, which is where
   * upstream issue #66 came from — releasing the button outside the grid lost
   * the item. An explicit selection has no such state to drop, and it is the
   * only version of this that works with a keyboard or on a touchscreen.
   */
  function placeAt (i: number) {
    if (status.value !== 'playing') return
    draft.value = setCell(draft.value, i, selected.value)
  }

  function clearAt (i: number) {
    if (status.value !== 'playing') return
    draft.value = setCell(draft.value, i, null)
  }

  function clearDraft () {
    draft.value = EMPTY_GRID
  }

  function submit () {
    if (!canSubmit.value) return
    guesses.value = [...guesses.value, draft.value]
    draft.value = EMPTY_GRID
    selected.value = null
  }

  /** Starts a throwaway game on a recipe drawn from the clock, not the date. */
  function playRandom () {
    continued.value = false
    const random = seededRandom(`random-${Date.now()}-${Math.random()}`)
    randomSolution.value = recipeKeys[Math.floor(random() * recipeKeys.length)]
    mode.value = 'random'
    guesses.value = []
    draft.value = EMPTY_GRID
    selected.value = null
  }

  /** Returns to the puzzle of the day, restoring it from storage. */
  function playDaily () {
    continued.value = false
    mode.value = 'daily'
    guesses.value = []
    draft.value = EMPTY_GRID
    selected.value = null
    restore()
  }

  /** Lets the end-to-end suite pin the clock without reloading the module. */
  function setDate (date: Date) {
    now.value = date
    day.value = dayNumber(date)
    if (mode.value === 'daily') {
      guesses.value = []
      draft.value = EMPTY_GRID
      restore()
    }
  }

  return {
    mode,
    day,
    game,
    solution,
    guesses,
    draft,
    selected,
    status,
    canSubmit,
    guessesLeft,
    attempt,
    outOfTries,
    continued,
    keepPlaying,
    draftOutput,
    craftedOutputs,
    ingredientHints,
    select,
    placeAt,
    clearAt,
    clearDraft,
    submit,
    playRandom,
    playDaily,
    setDate
  }
}
