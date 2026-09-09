import { test, expect } from '@playwright/test'
import { craft, openGame, solutionGrid, solutionName, wrongGrid } from './helpers/game.ts'

test('the board and the ingredients are there on load', async ({ page }) => {
  await openGame(page)
  await expect(page.getByTestId('draft-grid')).toBeVisible()
  await expect(page.getByTestId('ingredient-minecraft:stick')).toBeVisible()
  await expect(page.getByText('10 tries left', { exact: true })).toBeVisible()
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
  await expect(page.getByText('9 tries left', { exact: true })).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('an empty grid cannot be submitted', async ({ page }) => {
  await openGame(page)
  await expect(page.getByRole('button', { name: 'Craft' })).toBeDisabled()
})

test('clearing empties the grid without costing a try', async ({ page }) => {
  await openGame(page)
  await page.getByTestId('ingredient-minecraft:stick').click()
  await page.getByTestId('draft-grid').getByTestId('slot-4').click()
  await expect(page.getByRole('button', { name: 'Craft' })).toBeEnabled()

  await page.getByRole('button', { name: 'Clear grid' }).click()
  await expect(page.getByRole('button', { name: 'Craft' })).toBeDisabled()
  await expect(page.getByText('10 tries left', { exact: true })).toBeVisible()
})

test('clicking a filled slot with nothing held empties it', async ({ page }) => {
  await openGame(page)
  const slot = page.getByTestId('draft-grid').getByTestId('slot-0')

  await page.getByTestId('ingredient-minecraft:stick').click()
  await slot.click()
  await expect(slot).toHaveAccessibleName('Row 1, column 1: Stick')

  // Put the ingredient back down, then click the slot again.
  await page.getByTestId('ingredient-minecraft:stick').click()
  await slot.click()
  await expect(slot).toHaveAccessibleName('Row 1, column 1: empty')
})
