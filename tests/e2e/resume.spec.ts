import { test, expect } from '@playwright/test'
import { craft, openGame, wrongGrid } from './helpers/game.ts'

test('a game in progress survives a reload', async ({ page }) => {
  // The original saved only the date of the last finished game, so reloading
  // mid-puzzle threw the board away.
  await openGame(page)
  await craft(page, wrongGrid())
  await expect(page.getByTestId('guess-1')).toBeVisible()

  await page.reload()
  await expect(page.getByTestId('guess-1')).toBeVisible()
  await expect(page.getByText('Guess 2/10')).toBeVisible()
})

test('a half-filled grid survives a reload', async ({ page }) => {
  await openGame(page)
  await page.getByTestId('ingredient-minecraft:stick').click()
  await page.getByTestId('draft-grid').getByTestId('slot-4').click()

  await page.reload()
  await expect(page.getByTestId('draft-grid').getByTestId('slot-4'))
    .toHaveAccessibleName('Row 2, column 2: Stick')
})

test('a random game does not overwrite the daily in progress', async ({ page }) => {
  await openGame(page)
  await craft(page, wrongGrid())

  await page.getByRole('button', { name: 'Random' }).click()
  await expect(page.getByTestId('guess-1')).toHaveCount(0)

  await page.getByRole('button', { name: 'Daily' }).click()
  await expect(page.getByTestId('guess-1')).toBeVisible()
})
