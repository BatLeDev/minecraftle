import { test, expect } from '@playwright/test'
import { scoreGuess } from '../../src/utils/hints.ts'
import { placements } from '../../src/utils/variants.ts'
import { Hint } from '../../src/utils/types.ts'
import type { Grid, RecipeShape } from '../../src/utils/types.ts'

const P = 'minecraft:planks'
const S = 'minecraft:stick'

/** The stick recipe: two planks stacked vertically. */
const STICK: RecipeShape = [[P], [P]]

/** Builds a grid from nine cells written out as a readable 3x3 block. */
const g = (...cells: (string | null)[]): Grid => Object.freeze(cells)
const _ = null

const A = Hint.Absent
const M = Hint.Misplaced
const C = Hint.Correct

test.describe('issue #67 — hints must not depend on where a shape sits', () => {
  test('a wooden sword scores the same in every column', () => {
    const variants = placements(STICK)

    const left = scoreGuess(g(P, _, _, P, _, _, S, _, _), variants)
    const middle = scoreGuess(g(_, P, _, _, P, _, _, S, _), variants)
    const right = scoreGuess(g(_, _, P, _, _, P, _, _, S), variants)

    expect(left.hints).toEqual([C, A, A, C, A, A, A, A, A])
    expect(middle.hints).toEqual([A, C, A, A, C, A, A, A, A])
    expect(right.hints).toEqual([A, A, C, A, A, C, A, A, A])
  })

  test('an earlier guess does not bias a later one toward the left', () => {
    // The reported reproduction: play a shape that leaves several placements
    // alive, then play one that pins the answer down in the middle column.
    // Upstream trimmed the surviving set using an arbitrarily chosen "best"
    // placement, so the middle column came back yellow instead of green.
    const afterSlab = scoreGuess(g(P, P, P, _, _, _, _, _, _), placements(STICK))
    expect(afterSlab.variants.length).toBe(3)

    const middle = scoreGuess(g(_, P, _, _, P, _, _, S, _), afterSlab.variants)
    expect(middle.hints).toEqual([A, C, A, A, C, A, A, A, A])
  })

  test('a shape matching several placements equally greens none of them', () => {
    // Three placements match one plank each, and no slot is correct in all
    // three, so nothing may be promised as green.
    const scored = scoreGuess(g(P, P, P, _, _, _, _, _, _), placements(STICK))
    expect(scored.hints).toEqual([M, M, A, A, A, A, A, A, A])
  })

  test('a guess equal to a placement is solved wherever it sits', () => {
    const variants = placements(STICK)
    for (const [a, b] of [[0, 3], [1, 4], [2, 5], [3, 6], [4, 7], [5, 8]]) {
      const cells: (string | null)[] = Array(9).fill(null)
      cells[a] = P
      cells[b] = P
      expect(scoreGuess(g(...cells), variants).solved, `placement ${a}/${b}`).toBe(true)
    }
  })
})

test.describe('yellow slots', () => {
  test('never promise more copies of an item than the solution holds', () => {
    // The solution holds two planks; a guess with five must not light up five.
    const scored = scoreGuess(g(P, P, P, P, P, _, _, _, _), placements(STICK))
    const lit = scored.hints.filter(h => h !== Hint.Absent).length
    expect(lit).toBe(2)
  })

  test('an item absent from the solution stays grey', () => {
    const scored = scoreGuess(g(S, S, S, _, _, _, _, _, _), placements(STICK))
    expect(scored.hints).toEqual([A, A, A, A, A, A, A, A, A])
  })

  test('green slots consume the budget before yellow ones', () => {
    // One plank is pinned green, so only the second may still be yellow.
    const variants = placements(STICK).filter((_v, i) => i === 0)
    const scored = scoreGuess(g(P, P, P, _, _, _, _, _, _), variants)
    expect(scored.hints[0]).toBe(C)
    expect(scored.hints.filter(h => h === M).length).toBe(1)
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

test('the surviving set only ever shrinks', () => {
  let variants = placements(STICK)
  const before = variants.length
  variants = scoreGuess(g(P, _, _, _, _, _, _, _, _), variants).variants as Grid[]
  expect(variants.length).toBeLessThanOrEqual(before)
  expect(variants.length).toBeGreaterThan(0)
})
