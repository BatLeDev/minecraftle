import { test, expect } from '@playwright/test'
import { craft, openGame, solutionGrid, wrongGrid } from './helpers/game.ts'
import { MAX_GUESSES } from '../../src/utils/game.ts'

test('a win is recorded once, and replaying the daily does not count twice', async ({ page }) => {
  // Upstream issue #73: a finished daily could be played again and inflate the
  // totals, showing more games than wins at a 100% win rate.
  await openGame(page)
  await craft(page, solutionGrid)
  await page.getByRole('button', { name: 'Close' }).click()

  await page.getByRole('button', { name: 'Statistics' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toContainText('100%')
  await expect(dialog.getByText('Played').locator('xpath=preceding-sibling::*[1]')).toHaveText('1')
  await page.getByRole('button', { name: 'Close' }).click()

  await page.reload()
  await page.getByRole('button', { name: 'Statistics' }).click()
  await expect(dialog.getByText('Played').locator('xpath=preceding-sibling::*[1]')).toHaveText('1')
})

test('a finished daily comes back finished after a reload', async ({ page }) => {
  await openGame(page)
  await craft(page, solutionGrid)
  await page.getByRole('button', { name: 'Close' }).click()

  await page.reload()
  await expect(page.getByTestId('draft-grid')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Show summary' })).toBeVisible()
})

test('running out of tries loses the game', async ({ page }) => {
  await openGame(page)
  for (let i = 0; i < MAX_GUESSES; i++) await craft(page, wrongGrid())

  await expect(page.getByRole('dialog')).toContainText('Out of tries')
  await expect(page.getByTestId(`guess-${MAX_GUESSES}`)).toBeVisible()
  await expect(page.getByTestId('draft-grid')).toHaveCount(0)
})

test('a random game leaves the statistics alone', async ({ page }) => {
  await openGame(page)
  await page.getByRole('button', { name: 'Random' }).click()
  await page.getByRole('button', { name: 'Statistics' }).click()
  await expect(page.getByRole('dialog')).toContainText('Finish a daily puzzle')
})
