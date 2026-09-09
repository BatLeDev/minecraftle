import { test, expect } from '@playwright/test'
import { openGame } from './helpers/game.ts'

test('the interface and item names switch to French', async ({ page }) => {
  await openGame(page)
  await page.getByRole('button', { name: 'Français' }).click()

  await expect(page.getByRole('button', { name: 'Fabriquer' })).toBeVisible()
  await expect(page.getByText('10 essais restants', { exact: true })).toBeVisible()
  await expect(page.getByTestId('ingredient-minecraft:stick'))
    .toHaveAccessibleName('Choisir Bâton')
})

test('the chosen language survives a reload', async ({ page }) => {
  await openGame(page)
  await page.getByRole('button', { name: 'Français' }).click()
  await page.reload()
  await expect(page.getByRole('button', { name: 'Fabriquer' })).toBeVisible()
})

test('high contrast swaps the hint palette', async ({ page }) => {
  await openGame(page)
  await page.getByRole('button', { name: 'How to play' }).click()
  const swatch = page.getByRole('dialog').locator('.bg-correct')
  await expect(swatch).toHaveCSS('background-color', 'rgb(79, 156, 47)')

  await page.getByRole('button', { name: 'Close' }).click()
  await page.getByRole('button', { name: 'High contrast' }).click()
  await page.getByRole('button', { name: 'How to play' }).click()
  // Orange and blue stay distinguishable under every common colour vision
  // deficiency, which green and yellow do not.
  await expect(swatch).toHaveCSS('background-color', 'rgb(245, 121, 58)')
})

test('the rules are reachable and closable', async ({ page }) => {
  await openGame(page)
  await page.getByRole('button', { name: 'How to play' }).click()
  await expect(page.getByRole('dialog')).toContainText('ten tries')
  await page.getByRole('button', { name: 'Close' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
})
