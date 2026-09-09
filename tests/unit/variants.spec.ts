import { test, expect } from '@playwright/test'
import { placements } from '../../src/utils/variants.ts'
import { gridKey } from '../../src/utils/grid.ts'
import type { RecipeShape } from '../../src/utils/types.ts'

const P = 'minecraft:planks'
const S = 'minecraft:stick'

test('a single cell fits in all nine slots', () => {
  expect(placements([[P]]).length).toBe(9)
})

test('a full 3x3 shape fits exactly once', () => {
  const full: RecipeShape = [[P, P, P], [P, P, P], [P, P, P]]
  expect(placements(full).length).toBe(1)
})

test('a vertical domino has six placements and no mirrored duplicates', () => {
  // Mirroring a single column gives the same column back; without
  // de-duplication each of the six placements would be counted twice.
  const grids = placements([[P], [P]])
  expect(grids.length).toBe(6)
  expect(new Set(grids.map(gridKey)).size).toBe(6)
})

test('an asymmetric shape yields its mirror too', () => {
  // Two cells side by side, different items: mirroring is a genuinely new shape,
  // so both orientations appear in each of the six positions.
  const grids = placements([[P, S]])
  expect(grids.length).toBe(12)
  expect(new Set(grids.map(gridKey)).size).toBe(12)
})

test('placing never mutates the recipe', () => {
  const shape: RecipeShape = [[P, S], [S, P]]
  const snapshot = JSON.stringify(shape)
  placements(shape)
  expect(JSON.stringify(shape)).toBe(snapshot)
})
