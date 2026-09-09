import { test, expect } from '@playwright/test'
import { openGame } from './helpers/game.ts'

const slot = (page: import('@playwright/test').Page, i: number) =>
  page.getByTestId('draft-grid').getByTestId(`slot-${i}`)

test('arrow keys walk the grid', async ({ page }) => {
  await openGame(page)
  await slot(page, 0).focus()

  await page.keyboard.press('ArrowRight')
  await expect(slot(page, 1)).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await expect(slot(page, 4)).toBeFocused()
  await page.keyboard.press('ArrowLeft')
  await expect(slot(page, 3)).toBeFocused()
  await page.keyboard.press('ArrowUp')
  await expect(slot(page, 0)).toBeFocused()
})

test('arrow keys stop at the edges instead of wrapping', async ({ page }) => {
  await openGame(page)
  await slot(page, 0).focus()
  await page.keyboard.press('ArrowLeft')
  await expect(slot(page, 0)).toBeFocused()
  await page.keyboard.press('ArrowUp')
  await expect(slot(page, 0)).toBeFocused()
})

test('an ingredient can be placed and removed without a mouse', async ({ page }) => {
  await openGame(page)
  await page.getByTestId('ingredient-minecraft:stick').focus()
  await page.keyboard.press('Enter')

  await slot(page, 4).focus()
  await page.keyboard.press('Enter')
  await expect(slot(page, 4)).toHaveAccessibleName('Row 2, column 2: Stick')

  await page.keyboard.press('Backspace')
  await expect(slot(page, 4)).toHaveAccessibleName('Row 2, column 2: empty')
})
