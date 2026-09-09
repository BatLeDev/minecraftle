import { GRID_CELLS, countItems, gridKey } from './grid.ts'
import { Hint } from './types.ts'
import type { Grid, Hints } from './types.ts'

export type Scored = {
  /** The hint for each of the nine slots. */
  readonly hints: Hints
}

/**
 * Scores a guess against every placement of the solution.
 *
 * A recipe can legally sit anywhere in the grid, and crafting it works from any
 * of those positions — so the absolute position is not part of the puzzle, only
 * the shape is. Each guess is therefore judged on its own against whichever
 * placement it matches best, and nothing is carried between guesses.
 *
 * That last part is what upstream issue #67 was about. The original also picked
 * a best-matching placement, but it then *discarded* every placement whose
 * correct slots differed from that one's. One tie broken by array order — which
 * is generation order, biased toward the top-left — permanently pinned the
 * answer to the left, and a later guess that perfectly matched a middle-column
 * placement came back yellow instead of green. Judging every guess against the
 * full set removes the carry-over while keeping the original's generosity.
 */
export function scoreGuess (guess: Grid, variants: readonly Grid[]): Scored {
  if (variants.length === 0) throw new Error('scoreGuess needs at least one placement')

  let best = -1
  let candidates: Grid[] = []
  for (const variant of variants) {
    const matches = exactMatches(guess, variant)
    if (matches > best) { best = matches; candidates = [variant] } else if (matches === best) candidates.push(variant)
  }

  // Ties are broken on the placement's own contents, never on its position in
  // the array: generation order is an implementation detail, and letting it
  // decide is what made the same shape score differently in different columns.
  const chosen = candidates.reduce((a, b) => (gridKey(a) <= gridKey(b) ? a : b))

  const hints: Hint[] = Array<Hint>(GRID_CELLS).fill(Hint.Absent)
  for (let i = 0; i < GRID_CELLS; i++) {
    if (guess[i] !== null && guess[i] === chosen[i]) hints[i] = Hint.Correct
  }

  // Yellow for the copies of an item that are in the recipe but not yet placed.
  // Every placement holds the same items, so the budget is the same whichever
  // one was chosen.
  const remaining = countItems(chosen)
  for (let i = 0; i < GRID_CELLS; i++) {
    if (hints[i] !== Hint.Correct) continue
    remaining.set(guess[i] as string, (remaining.get(guess[i] as string) ?? 0) - 1)
  }
  for (let i = 0; i < GRID_CELLS; i++) {
    const item = guess[i]
    if (item === null || hints[i] === Hint.Correct) continue
    const left = remaining.get(item) ?? 0
    if (left > 0) {
      hints[i] = Hint.Misplaced
      remaining.set(item, left - 1)
    }
  }

  return { hints }
}

function exactMatches (guess: Grid, variant: Grid): number {
  let n = 0
  for (let i = 0; i < GRID_CELLS; i++) {
    if (variant[i] !== null && guess[i] === variant[i]) n++
  }
  return n
}
