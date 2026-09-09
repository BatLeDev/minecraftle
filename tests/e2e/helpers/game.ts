import type { Page } from '@playwright/test'
import { dayNumber, puzzleForDay } from '../../../src/utils/puzzle.ts'
import { placements } from '../../../src/utils/variants.ts'
import { itemName } from '../../../src/utils/items.ts'
import recipes from '../../../src/data/recipes.json' with { type: 'json' }
import type { Grid, RecipeMap } from '../../../src/utils/types.ts'

const all = recipes as RecipeMap

/**
 * The clock every test pins, so the puzzle of the day is the same every run.
 * Without it the suite would quietly test a different recipe each day.
 */
export const FIXED_DATE = new Date('2026-09-09T12:00:00Z')

export const solutionKey = puzzleForDay(dayNumber(FIXED_DATE), Object.keys(all))
export const solutionGrid = placements(all[solutionKey].input)[0]
export const solutionOutput = all[solutionKey].output

export function solutionName (locale: 'en' | 'fr') {
  return itemName(solutionOutput, locale)
}

/** A grid that is certainly not the answer, for filling failed attempts. */
export function wrongGrid (): Grid {
  const cells: (string | null)[] = Array(9).fill(null)
  // Two ingredients that no recipe pairs this way, so it never crafts by luck.
  cells[0] = 'minecraft:diamond'
  cells[8] = 'minecraft:leather'
  return cells
}

export async function openGame (page: Page) {
  await page.clock.install({ time: FIXED_DATE })
  await page.goto('/')
  await page.getByTestId('draft-grid').waitFor()
}

/**
 * Fills the current grid.
 *
 * The held ingredient is tracked because clicking the ingredient already held
 * puts it back down — so a recipe using the same item twice must not click it
 * again between placements.
 */
export async function fillGrid (page: Page, grid: Grid) {
  let held: string | null = null
  for (let i = 0; i < 9; i++) {
    const item = grid[i]
    if (item === null) continue
    if (held !== item) {
      await page.getByTestId(`ingredient-${item}`).click()
      held = item
    }
    await page.getByTestId('draft-grid').getByTestId(`slot-${i}`).click()
  }
}

export async function craft (page: Page, grid: Grid) {
  await fillGrid(page, grid)
  await page.getByRole('button', { name: 'Craft' }).click()
}
