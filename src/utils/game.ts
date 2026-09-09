import { EMPTY_GRID, gridKey } from './grid.ts'
import { scoreGuess } from './hints.ts'
import { placements } from './variants.ts'
import type { Grid, GameStatus, Hints, RecipeMap } from './types.ts'

export const MAX_GUESSES = 10

export type GameState = {
  /** Key of the recipe to find, e.g. `stick`. */
  readonly solution: string
  readonly guesses: readonly Grid[]
  readonly hints: readonly Hints[]
  /** What each guess actually crafted, if anything — shown as the grid's output. */
  readonly crafted: readonly (string | null)[]
  /** Every placement of the solution; constant for the whole game. */
  readonly variants: readonly Grid[]
  readonly status: GameStatus
}

/**
 * Maps every placement of every recipe to the recipe it crafts, so working out
 * what a grid produces is one lookup instead of a scan over the whole catalogue.
 */
export function craftIndex (recipes: RecipeMap): Map<string, string> {
  const byGrid = new Map<string, string>()
  for (const key of Object.keys(recipes).sort()) {
    for (const grid of placements(recipes[key].input)) {
      const k = gridKey(grid)
      // First key wins, and keys are walked in sorted order, so an ambiguous
      // arrangement always resolves to the same recipe.
      if (!byGrid.has(k)) byGrid.set(k, key)
    }
  }
  return byGrid
}

export function craft (index: Map<string, string>, grid: Grid): string | null {
  return index.get(gridKey(grid)) ?? null
}

export function createGame (recipes: RecipeMap, solution: string): GameState {
  const recipe = recipes[solution]
  if (!recipe) throw new Error(`unknown recipe ${solution}`)
  return {
    solution,
    guesses: [],
    hints: [],
    crafted: [],
    variants: placements(recipe.input),
    status: 'playing'
  }
}

/**
 * Plays one guess. Returns a new state; the input is never modified.
 *
 * A guess wins by crafting the target recipe, which is not quite the same as
 * matching a placement of it: crafting anything at all is worth showing, so the
 * output is recorded either way.
 */
export function applyGuess (
  state: GameState,
  guess: Grid,
  index: Map<string, string>,
  /**
   * How many attempts are allowed. Raised when a player who has run out chooses
   * to keep going rather than be shown the answer.
   */
  limit: number = MAX_GUESSES
): GameState {
  if (state.status !== 'playing') return state

  const scored = scoreGuess(guess, state.variants)
  const crafted = craft(index, guess)
  const guesses = [...state.guesses, guess]
  const won = crafted === state.solution
  const status: GameStatus = won ? 'won' : guesses.length >= limit ? 'lost' : 'playing'

  return {
    ...state,
    guesses,
    hints: [...state.hints, scored.hints],
    crafted: [...state.crafted, crafted],
    status
  }
}

export const emptyGuess = () => EMPTY_GRID
