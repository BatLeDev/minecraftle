import { test, expect } from '@playwright/test'
import { craft, craftButton, fillGrid, openGame, solutionGrid, solutionName, wrongGrid } from './helpers/game.ts'

test('the board and the ingredients are there on load', async ({ page }) => {
  await openGame(page)
  await expect(page.getByTestId('draft-grid')).toBeVisible()
  await expect(page.getByTestId('ingredient-minecraft:stick')).toBeVisible()
  await expect(page.getByText('Guess 1/10')).toBeVisible()
})

test('crafting the recipe of the day wins the game', async ({ page }) => {
  await openGame(page)
  await craft(page, solutionGrid)

  const dialog = page.getByRole('dialog')
  await expect(dialog).toContainText('Crafted in 1 try')
  await expect(dialog).toContainText(solutionName('en'))
  // The shareable summary uses one square per slot.
  await expect(dialog).toContainText('🟩')
})

test('a wrong guess is kept on the board and costs a try', async ({ page }) => {
  await openGame(page)
  await craft(page, wrongGrid())

  await expect(page.getByTestId('guess-1')).toBeVisible()
  await expect(page.getByText('Guess 2/10')).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('a played guess shows what it crafted', async ({ page }) => {
  // The result of an attempt is feedback in its own right: a guess that crafts
  // the wrong item still says the shape was a valid recipe.
  await openGame(page)
  await craft(page, wrongGrid())
  await expect(page.getByTestId('guess-1-output')).toHaveAccessibleName(/Result: .+/)
})

test('an empty grid cannot be submitted', async ({ page }) => {
  await openGame(page)
  await expect(craftButton(page)).toBeDisabled()
})

test('clearing empties the grid without costing a try', async ({ page }) => {
  // A real recipe, because the result slot only accepts a grid that crafts.
  await openGame(page)
  await fillGrid(page, wrongGrid())
  await expect(craftButton(page)).toBeEnabled()

  await page.getByRole('button', { name: 'Clear grid' }).click()
  await expect(craftButton(page)).toBeDisabled()
  await expect(page.getByText('Guess 1/10')).toBeVisible()
})

test('clicking a slot swaps what is held for what is in it', async ({ page }) => {
  await openGame(page)
  const slot = page.getByTestId('draft-grid').getByTestId('slot-0')

  await page.getByTestId('ingredient-minecraft:stick').click()
  await slot.click()
  await expect(slot).toHaveAccessibleName('Row 1, column 1: Stick')
  // Placing into an empty slot leaves the hand empty.
  await expect(page.locator('.held-item')).toHaveCount(0)

  // With an empty hand, the slot's item comes back out.
  await slot.click()
  await expect(slot).toHaveAccessibleName('Row 1, column 1: empty')
  await expect(page.locator('.held-item')).toBeVisible()
})
