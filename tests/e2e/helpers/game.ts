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

/**
 * A real recipe that is not the answer, for filling failed attempts.
 *
 * It has to craft something: a guess is only submittable once the grid produces
 * an item, which is what makes every attempt a genuine recipe.
 */
export const wrongKey = Object.keys(all).find(key => key !== solutionKey)!

export function wrongGrid (): Grid {
  return placements(all[wrongKey].input)[0]
}

export async function openGame (page: Page) {
  await page.clock.install({ time: FIXED_DATE })
  await page.goto('/')
  await page.getByTestId('draft-grid').waitFor()
}

/**
 * Fills the current grid, one slot at a time.
 *
 * The ingredient is taken again before every placement because a slot click
 * swaps: what is held goes in and whatever was there comes out, which for an
 * empty slot means the hand ends up empty. Filling several slots in one gesture
 * is what dragging is for, and that is covered in its own suite.
 */
export async function fillGrid (page: Page, grid: Grid) {
  for (let i = 0; i < 9; i++) {
    const item = grid[i]
    if (item === null) continue
    await page.getByTestId(`ingredient-${item}`).click()
    await page.getByTestId('draft-grid').getByTestId(`slot-${i}`).click()
  }
}

/** The result slot is how a guess is played, exactly as in the game. */
export function craftButton (page: Page) {
  return page.getByTestId('draft-grid-output')
}

export async function craft (page: Page, grid: Grid) {
  await fillGrid(page, grid)
  await craftButton(page).click()
}
