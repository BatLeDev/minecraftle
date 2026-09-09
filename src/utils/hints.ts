import { GRID_CELLS, countItems } from './grid.ts'
import { Hint } from './types.ts'
import type { Grid, Hints } from './types.ts'

export type Scored = {
  /** The hint for each of the nine slots. */
  readonly hints: Hints
  /**
   * The placements still possible after this guess. Feed it back in for the
   * next guess; it only ever shrinks.
   */
  readonly variants: readonly Grid[]
  /** True when the guess is exactly one of the placements. */
  readonly solved: boolean
}

/**
 * Scores a guess against the placements of the solution that are still possible.
 *
 * A recipe can legally sit anywhere in the grid, so the solution is a *set* of
 * placements rather than a single arrangement. Two rules keep the feedback
 * consistent, which is what upstream issue #67 is about:
 *
 *  - the surviving set narrows to the placements that match the guess best,
 *    which is the leniency players expect ("my shape was right, just offset");
 *  - a slot only turns green when it is correct in *every* surviving placement.
 *
 * Upstream instead picked one best placement with `matchcounts.indexOf(max)`,
 * so ties were broken by array order — which is generation order, biased toward
 * the top-left. The same shape then scored green in the left column and yellow
 * in the middle one. Unanimity removes the tie-break entirely, so the answer no
 * longer depends on the order placements happen to be generated in.
 */
export function scoreGuess (guess: Grid, variants: readonly Grid[]): Scored {
  if (variants.length === 0) throw new Error('scoreGuess needs at least one placement')

  let best = -1
  let candidates: Grid[] = []
  for (const variant of variants) {
    const matches = exactMatches(guess, variant)
    if (matches > best) { best = matches; candidates = [variant] } else if (matches === best) candidates.push(variant)
  }

  const hints: Hint[] = Array<Hint>(GRID_CELLS).fill(Hint.Absent)

  // Green only where every surviving placement agrees.
  for (let i = 0; i < GRID_CELLS; i++) {
    const item = guess[i]
    if (item === null) continue
    if (candidates.every(variant => variant[i] === item)) hints[i] = Hint.Correct
  }

  // Yellow for the copies of an item that are in the solution but not yet
  // placed. Every placement of a recipe holds the same items, so the budget is
  // the same whichever candidate we read it from.
  const remaining = countItems(candidates[0])
  for (let i = 0; i < GRID_CELLS; i++) {
    if (hints[i] !== Hint.Correct) continue
    const item = guess[i] as string
    remaining.set(item, (remaining.get(item) ?? 0) - 1)
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

  const solved = candidates.length > 0 && best === countNonEmpty(candidates[0]) &&
    candidates.some(variant => exactGrid(guess, variant))

  return { hints, variants: candidates, solved }
}

function exactMatches (guess: Grid, variant: Grid): number {
  let n = 0
  for (let i = 0; i < GRID_CELLS; i++) {
    if (variant[i] !== null && guess[i] === variant[i]) n++
  }
  return n
}

function exactGrid (guess: Grid, variant: Grid): boolean {
  for (let i = 0; i < GRID_CELLS; i++) if (guess[i] !== variant[i]) return false
  return true
}

function countNonEmpty (grid: Grid): number {
  let n = 0
  for (const cell of grid) if (cell !== null) n++
  return n
}
