import { test, expect } from '@playwright/test'
import { craft, openGame, solutionGrid, solutionName, wrongGrid } from './helpers/game.ts'
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

test('running out of tries asks before revealing the answer', async ({ page }) => {
  await openGame(page)
  for (let i = 0; i < MAX_GUESSES; i++) await craft(page, wrongGrid())

  const dialog = page.getByRole('dialog')
  await expect(dialog).toContainText('Out of tries')
  await expect(page.getByTestId('keep-playing')).toBeVisible()
  await expect(page.getByTestId('give-up')).toBeVisible()
  // The recipe is not given away yet.
  await expect(dialog).not.toContainText('The recipe was')
})

test('giving up reveals the recipe', async ({ page }) => {
  await openGame(page)
  for (let i = 0; i < MAX_GUESSES; i++) await craft(page, wrongGrid())
  await page.getByTestId('give-up').click()

  await expect(page.getByRole('dialog')).toContainText(`The recipe was ${solutionName('en')}`)
  await expect(page.getByTestId('draft-grid')).toHaveCount(0)
})

test('keeping on gives the board back, past the limit', async ({ page }) => {
  await openGame(page)
  for (let i = 0; i < MAX_GUESSES; i++) await craft(page, wrongGrid())
  await page.getByTestId('keep-playing').click()

  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByTestId('draft-grid')).toBeVisible()
  await expect(page.getByText('Attempt 11, past the limit')).toBeVisible()
})

test('a win found past the limit still shares as a loss', async ({ page }) => {
  // The puzzle was recorded as lost when the tenth attempt ran out; carrying on
  // is for the satisfaction of finding it.
  await openGame(page)
  for (let i = 0; i < MAX_GUESSES; i++) await craft(page, wrongGrid())
  await page.getByTestId('keep-playing').click()
  await craft(page, solutionGrid)

  const dialog = page.getByRole('dialog')
  await expect(dialog).toContainText('X/10')
  await page.getByRole('button', { name: 'Close' }).click()

  await page.getByRole('button', { name: 'Statistics' }).click()
  await expect(page.getByRole('dialog')).toContainText('0%')
})

test('a random game leaves the statistics alone', async ({ page }) => {
  await openGame(page)
  await page.getByRole('button', { name: 'Random' }).click()
  await page.getByRole('button', { name: 'Statistics' }).click()
  await expect(page.getByRole('dialog')).toContainText('Finish a daily puzzle')
})
