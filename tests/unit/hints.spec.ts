import { test, expect } from '@playwright/test'
import { scoreGuess } from '../../src/utils/hints.ts'
import { placements } from '../../src/utils/variants.ts'
import { Hint } from '../../src/utils/types.ts'
import type { Grid, RecipeShape } from '../../src/utils/types.ts'

const P = 'minecraft:planks'
const S = 'minecraft:stick'

/** The stick recipe: two planks stacked vertically, so six placements in all. */
const STICK: RecipeShape = [[P], [P]]

const g = (...cells: (string | null)[]): Grid => Object.freeze(cells)
const _ = null

const A = Hint.Absent
const M = Hint.Misplaced
const C = Hint.Correct

test.describe('issue #67 — a guess must not be judged on an earlier one', () => {
  test('a wooden sword scores the same in every column', () => {
    const variants = placements(STICK)

    expect(scoreGuess(g(P, _, _, P, _, _, S, _, _), variants).hints)
      .toEqual([C, A, A, C, A, A, A, A, A])
    expect(scoreGuess(g(_, P, _, _, P, _, _, S, _), variants).hints)
      .toEqual([A, C, A, A, C, A, A, A, A])
    expect(scoreGuess(g(_, _, P, _, _, P, _, _, S), variants).hints)
      .toEqual([A, A, C, A, A, C, A, A, A])
  })

  test('an ambiguous guess does not pin the answer for the next one', () => {
    // The reported reproduction. Upstream scored the slab against one
    // arbitrarily chosen placement and then threw the others away, so the sword
    // in the middle column came back yellow. Each guess now stands alone.
    const variants = placements(STICK)
    scoreGuess(g(P, P, P, _, _, _, _, _, _), variants)

    expect(scoreGuess(g(_, P, _, _, P, _, _, S, _), variants).hints)
      .toEqual([A, C, A, A, C, A, A, A, A])
  })

  test('the same shape scores the same wherever it is placed', () => {
    // Translation invariance: the shape is the puzzle, its position is not.
    const variants = placements(STICK)
    const topRow = scoreGuess(g(P, P, P, _, _, _, _, _, _), variants).hints
    const middleRow = scoreGuess(g(_, _, _, P, P, P, _, _, _), variants).hints

    expect(middleRow.slice(3, 6)).toEqual(topRow.slice(0, 3))
  })

  test('a guess equal to a placement is all green, wherever it sits', () => {
    const variants = placements(STICK)
    for (const [a, b] of [[0, 3], [1, 4], [2, 5], [3, 6], [4, 7], [5, 8]]) {
      const cells: (string | null)[] = Array(9).fill(null)
      cells[a] = P
      cells[b] = P
      const { hints } = scoreGuess(g(...cells), variants)
      expect([hints[a], hints[b]], `placement ${a}/${b}`).toEqual([C, C])
    }
  })
})

test.describe('generosity is kept', () => {
  test('a guess overlapping one plank still earns a green', () => {
    // Three placements tie here. Upstream greened one of them, and so do we —
    // what changed is that the other two are not discarded afterwards.
    const { hints } = scoreGuess(g(P, P, P, _, _, _, _, _, _), placements(STICK))
    expect(hints.filter(h => h === C).length).toBe(1)
    expect(hints.filter(h => h === M).length).toBe(1)
  })
})

test.describe('yellow slots', () => {
  test('never promise more copies of an item than the recipe holds', () => {
    const { hints } = scoreGuess(g(P, P, P, P, P, _, _, _, _), placements(STICK))
    expect(hints.filter(h => h !== A).length).toBe(2)
  })

  test('an item absent from the recipe stays grey', () => {
    const { hints } = scoreGuess(g(S, S, S, _, _, _, _, _, _), placements(STICK))
    expect(hints).toEqual([A, A, A, A, A, A, A, A, A])
  })

  test('green slots consume the budget before yellow ones', () => {
    const { hints } = scoreGuess(g(P, P, P, _, _, _, _, _, _), placements(STICK))
    const greens = hints.filter(h => h === C).length
    const yellows = hints.filter(h => h === M).length
    expect(greens + yellows).toBe(2)
  })
})

test('scoring never mutates its inputs', () => {
  const variants = placements(STICK)
  const snapshot = JSON.stringify(variants)
  const guess = g(P, _, _, P, _, _, _, _, _)
  const guessSnapshot = JSON.stringify(guess)
  scoreGuess(guess, variants)
  expect(JSON.stringify(variants)).toBe(snapshot)
  expect(JSON.stringify(guess)).toBe(guessSnapshot)
})

test('scoring the same guess twice gives the same answer', () => {
  const variants = placements(STICK)
  const guess = g(P, P, _, _, _, _, _, _, _)
  expect(scoreGuess(guess, variants).hints).toEqual(scoreGuess(guess, variants).hints)
})
