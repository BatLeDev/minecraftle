import { test, expect } from '@playwright/test'
import { openGame } from './helpers/game.ts'

test('the interface and item names switch to French', async ({ page }) => {
  await openGame(page)
  await page.getByTestId('toggle-language').click()

  await expect(page.getByRole('button', { name: 'Vider la grille' })).toBeVisible()
  await expect(page.getByText('Essai 1/10')).toBeVisible()
  await expect(page.getByTestId('ingredient-minecraft:stick'))
    .toHaveAccessibleName('Choisir Bâton')
})

test('the chosen language survives a reload', async ({ page }) => {
  await openGame(page)
  await page.getByTestId('toggle-language').click()
  await page.reload()
  await expect(page.getByRole('button', { name: 'Vider la grille' })).toBeVisible()
})

test('high contrast swaps the hint palette', async ({ page }) => {
  await openGame(page)
  await page.getByRole('button', { name: 'How to play' }).click()
  const swatch = page.getByRole('dialog').locator('.slot--correct')
  const before = await swatch.evaluate(el => getComputedStyle(el).backgroundColor)
  await page.getByRole('button', { name: 'Close' }).click()

  await page.getByTestId('toggle-contrast').click()
  await page.getByRole('button', { name: 'How to play' }).click()
  // Orange and blue stay distinguishable under every common colour vision
  // deficiency, which green and yellow do not.
  await expect(swatch).toHaveCSS('background-color', 'rgb(245, 121, 58)')
  expect(await swatch.evaluate(el => getComputedStyle(el).backgroundColor)).not.toBe(before)
})

test('the rules are reachable and closable', async ({ page }) => {
  await openGame(page)
  await page.getByRole('button', { name: 'How to play' }).click()
  await expect(page.getByRole('dialog')).toContainText('ten tries')
  await page.getByRole('button', { name: 'Close' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
})
