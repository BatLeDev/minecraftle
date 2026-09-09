import { test, expect } from '@playwright/test'
import recipes from '../../src/data/recipes.json' with { type: 'json' }
import ingredients from '../../src/data/ingredients.json' with { type: 'json' }
import items from '../../src/data/items.json' with { type: 'json' }
import type { RecipeMap } from '../../src/utils/types.ts'

const all = recipes as RecipeMap
const catalogue = items.items as unknown as Record<string, { name: { en: string, fr: string }, sprite: [number, number] }>

test('every recipe can be built from the offered ingredients', () => {
  // Otherwise a player could draw a puzzle they have no way of solving.
  const available = new Set(ingredients as string[])
  const unbuildable = Object.entries(all)
    .filter(([, recipe]) => recipe.input.flat().some(cell => cell !== null && !available.has(cell)))
    .map(([key]) => key)
  expect(unbuildable).toEqual([])
})

test('every item has a name in both languages', () => {
  const missing = Object.entries(catalogue)
    .filter(([, meta]) => !meta.name.en || !meta.name.fr)
    .map(([id]) => id)
  expect(missing).toEqual([])
})

test('no two items share an atlas cell', () => {
  const cells = Object.values(catalogue).map(meta => meta.sprite.join(','))
  expect(new Set(cells).size).toBe(cells.length)
})

test('every atlas cell is inside the atlas', () => {
  const outside = Object.entries(catalogue)
    .filter(([, meta]) => meta.sprite[0] >= items.cols || meta.sprite[1] >= items.rows)
    .map(([id]) => id)
  expect(outside).toEqual([])
})

test('every recipe output and ingredient is a known item', () => {
  const unknown = new Set<string>()
  for (const recipe of Object.values(all)) {
    if (!catalogue[recipe.output]) unknown.add(recipe.output)
    for (const cell of recipe.input.flat()) {
      if (cell !== null && !catalogue[cell]) unknown.add(cell)
    }
  }
  for (const id of ingredients as string[]) if (!catalogue[id]) unknown.add(id)
  expect([...unknown]).toEqual([])
})
