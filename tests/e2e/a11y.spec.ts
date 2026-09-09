import { test, expect } from '@playwright/test'
import { craft, openGame, solutionGrid, wrongGrid } from './helpers/game.ts'

test('the page has a single level-one heading', async ({ page }) => {
  await openGame(page)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Minecraftle')
})

test('the document language follows the interface language', async ({ page }) => {
  // A screen reader picks its voice from this attribute; leaving it on English
  // would have it read the French interface with an English pronunciation.
  await openGame(page)
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')

  await page.getByRole('button', { name: 'Français' }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
})

test('the result of an attempt is announced', async ({ page }) => {
  // Nothing else speaks: focus stays put and the colours are silent.
  await openGame(page)
  const live = page.locator('[aria-live="polite"]')
  await expect(live).toHaveText('')

  await craft(page, wrongGrid())
  await expect(live).toContainText('Try 1')
  await expect(live).toContainText('9 tries left')
})

test('winning and losing are announced with the recipe', async ({ page }) => {
  await openGame(page)
  await craft(page, solutionGrid)
  await expect(page.locator('[aria-live="polite"]')).toContainText('Crafted in 1')
})

test('hints carry a shape, not only a colour', async ({ page }) => {
  // WCAG 1.4.1: colour may not be the only way information is conveyed.
  await openGame(page)
  await craft(page, solutionGrid)

  const marked = page.getByTestId('guess-1').locator('.slot--correct')
  expect(await marked.count()).toBeGreaterThan(0)
  // The shape is drawn, not just declared.
  const size = await marked.first().evaluate(el =>
    getComputedStyle(el, '::after').width
  )
  expect(size).not.toBe('auto')
})

test('every interactive control has an accessible name', async ({ page }) => {
  await openGame(page)
  const unnamed = await page.getByRole('button').evaluateAll(buttons =>
    buttons.filter(b => !(b.getAttribute('aria-label') || b.textContent?.trim())).length
  )
  expect(unnamed).toBe(0)
})

test('a dialog takes focus and gives it back on close', async ({ page }) => {
  await openGame(page)
  await page.getByRole('button', { name: 'How to play' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()

  // Polled rather than read once: focus moves a tick after the dialog paints.
  await expect.poll(() => page.evaluate(() =>
    !!document.activeElement?.closest('[role="dialog"], .v-overlay__content')
  )).toBe(true)

  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)

  // Focus must come back to the control that opened the dialog, or a keyboard
  // user is dropped at the top of the document.
  await expect.poll(() => page.evaluate(() =>
    document.activeElement?.textContent?.trim()
  )).toBe('How to play')
})

test('tap targets are large enough', async ({ page }) => {
  // WCAG 2.2 asks for at least 24x24 CSS pixels.
  await openGame(page)
  const small = await page.getByRole('button').evaluateAll(buttons =>
    buttons.filter(b => {
      const r = b.getBoundingClientRect()
      return r.width > 0 && (r.width < 24 || r.height < 24)
    }).length
  )
  expect(small).toBe(0)
})
