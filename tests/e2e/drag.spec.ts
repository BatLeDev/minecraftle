import { test, expect } from '@playwright/test'
import { craftButton, openGame } from './helpers/game.ts'

const PLANKS = 'minecraft:planks'
const STICK = 'minecraft:stick'

const slot = (page: import('@playwright/test').Page, i: number) =>
  page.getByTestId('draft-grid').getByTestId(`slot-${i}`)

/** Presses on an element and releases over another, as a real drag would. */
async function dragTo (page: import('@playwright/test').Page, from: ReturnType<typeof slot>, to: ReturnType<typeof slot>) {
  const a = await from.boundingBox()
  const b = await to.boundingBox()
  if (!a || !b) throw new Error('element not visible')
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2)
  await page.mouse.down()
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 8 })
  await page.mouse.up()
}

test('an ingredient can be dragged from the list onto the grid', async ({ page }) => {
  await openGame(page)
  await dragTo(page, page.getByTestId(`ingredient-${PLANKS}`), slot(page, 4))
  await expect(slot(page, 4)).toHaveAccessibleName('Row 2, column 2: Planks')
})

test('an item can be dragged from one slot to another', async ({ page }) => {
  await openGame(page)
  await page.getByTestId(`ingredient-${PLANKS}`).click()
  await slot(page, 0).click()
  await expect(slot(page, 0)).toHaveAccessibleName('Row 1, column 1: Planks')

  // Placing into an empty slot leaves the hand empty, so the slot can be
  // picked straight back up.
  await dragTo(page, slot(page, 0), slot(page, 8))
  await expect(slot(page, 0)).toHaveAccessibleName('Row 1, column 1: empty')
  await expect(slot(page, 8)).toHaveAccessibleName('Row 3, column 3: Planks')
})

test('the held item rides the cursor', async ({ page }) => {
  await openGame(page)
  await expect(page.locator('.held-item')).toHaveCount(0)
  await page.getByTestId(`ingredient-${STICK}`).click()
  await expect(page.locator('.held-item')).toBeVisible()
})

test('releasing outside the grid keeps the item in hand', async ({ page }) => {
  // Upstream issue #66, reproduced from the report: press on an ingredient,
  // drag out past the panel, release, then play a different ingredient. The
  // original lost the item because a bare mouseup outside the grid was
  // delivered elsewhere; pointer capture keeps it.
  await openGame(page)
  const box = await page.getByTestId(`ingredient-${PLANKS}`).boundingBox()
  if (!box) throw new Error('ingredient not visible')

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(5, 5, { steps: 10 }) // well outside the board
  await page.mouse.up()

  await expect(page.locator('.held-item')).toBeVisible()

  // And a different ingredient still plays normally afterwards.
  await page.getByTestId(`ingredient-${STICK}`).click()
  await slot(page, 1).click()
  await expect(slot(page, 1)).toHaveAccessibleName('Row 1, column 2: Stick')
})

test('pressing a held ingredient again puts it down', async ({ page }) => {
  await openGame(page)
  await page.getByTestId(`ingredient-${STICK}`).click()
  await expect(page.locator('.held-item')).toBeVisible()

  await page.getByTestId(`ingredient-${STICK}`).click()
  await expect(page.locator('.held-item')).toHaveCount(0)
})

test('dragging across empty slots fills each one', async ({ page }) => {
  // The game's own way of spreading a stack: hold the button and sweep.
  await openGame(page)
  await page.getByTestId(`ingredient-${PLANKS}`).click()

  const first = await slot(page, 0).boundingBox()
  const last = await slot(page, 2).boundingBox()
  if (!first || !last) throw new Error('slots not visible')
  await page.mouse.move(first.x + first.width / 2, first.y + first.height / 2)
  await page.mouse.down()
  await page.mouse.move(last.x + last.width / 2, last.y + last.height / 2, { steps: 12 })
  await page.mouse.up()

  for (const [i, col] of [[0, 1], [1, 2], [2, 3]] as const) {
    await expect(slot(page, i)).toHaveAccessibleName(`Row 1, column ${col}: Planks`)
  }
  // Sweeping empties the hand, as spreading a stack does.
  await expect(page.locator('.held-item')).toHaveCount(0)
})

test('played guesses cannot be dragged', async ({ page }) => {
  await openGame(page)
  await page.getByTestId(`ingredient-${PLANKS}`).click()
  await slot(page, 0).click()
  await craftButton(page).click()

  // The played row is inert: its slots are images, not buttons.
  const played = page.getByTestId('guess-1').getByTestId('slot-0')
  await expect(played).toHaveRole('img')
})
