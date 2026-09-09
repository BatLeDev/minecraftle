import { EMPTY_GRID, GRID_SIZE, gridKey, index } from './grid.ts'
import type { Grid, RecipeShape } from './types.ts'

/**
 * Every way a recipe can sit in the 3x3 grid: each translation that still fits,
 * plus the horizontally mirrored shape, which Minecraft accepts too.
 *
 * Duplicates are dropped. A shape that is its own mirror — a single column, or
 * a symmetric pattern — would otherwise yield each placement twice, and the
 * hint logic reasons about *how many* placements survive.
 */
export function placements (shape: RecipeShape): Grid[] {
  const seen = new Set<string>()
  const out: Grid[] = []

  for (const variant of [shape, mirror(shape)]) {
    for (const grid of translations(variant)) {
      const key = gridKey(grid)
      if (seen.has(key)) continue
      seen.add(key)
      out.push(grid)
    }
  }
  return out
}

/** Mirrors a shape left-to-right, without touching the input. */
function mirror (shape: RecipeShape): RecipeShape {
  return shape.map(row => row.slice().reverse())
}

function translations (shape: RecipeShape): Grid[] {
  const height = shape.length
  const width = shape[0].length
  const out: Grid[] = []

  for (let top = 0; top + height <= GRID_SIZE; top++) {
    for (let left = 0; left + width <= GRID_SIZE; left++) {
      const grid = EMPTY_GRID.slice()
      for (let r = 0; r < height; r++) {
        for (let c = 0; c < width; c++) {
          grid[index(top + r, left + c)] = shape[r][c]
        }
      }
      out.push(Object.freeze(grid))
    }
  }
  return out
}
