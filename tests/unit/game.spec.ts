import { test, expect } from '@playwright/test'
import { MAX_GUESSES, applyGuess, craft, craftIndex, createGame } from '../../src/utils/game.ts'
import { EMPTY_GRID, setCell } from '../../src/utils/grid.ts'
import { placements } from '../../src/utils/variants.ts'
import recipes from '../../src/data/recipes.json' with { type: 'json' }
import type { Grid, RecipeMap } from '../../src/utils/types.ts'

const all = recipes as RecipeMap
const index = craftIndex(all)

/** The first placement of a recipe, i.e. one grid that genuinely crafts it. */
const solutionGrid = (key: string): Grid => placements(all[key].input)[0]

test('every recipe in the catalogue can be crafted', () => {
  const uncraftable = Object.keys(all).filter(key => craft(index, solutionGrid(key)) === null)
  expect(uncraftable).toEqual([])
})

test('an empty grid crafts nothing', () => {
  expect(craft(index, EMPTY_GRID)).toBe(null)
})

test('crafting the target wins the game', () => {
  const state = applyGuess(createGame(all, 'stick'), solutionGrid('stick'), index)
  expect(state.status).toBe('won')
  expect(state.crafted).toEqual(['stick'])
})

test('crafting something else records the output without winning', () => {
  const state = applyGuess(createGame(all, 'stick'), solutionGrid('torch'), index)
  expect(state.status).toBe('playing')
  expect(state.crafted).toEqual(['torch'])
})

test('the game is lost after the last guess', () => {
  let state = createGame(all, 'stick')
  const wrong = setCell(EMPTY_GRID, 0, 'minecraft:diamond')
  for (let i = 0; i < MAX_GUESSES; i++) state = applyGuess(state, wrong, index)
  expect(state.status).toBe('lost')
  expect(state.guesses.length).toBe(MAX_GUESSES)
})

test('guesses are ignored once the game is over', () => {
  const won = applyGuess(createGame(all, 'stick'), solutionGrid('stick'), index)
  const after = applyGuess(won, solutionGrid('torch'), index)
  expect(after).toBe(won)
})

test('playing a guess never mutates the previous state', () => {
  const before = createGame(all, 'stick')
  const snapshot = JSON.stringify(before)
  applyGuess(before, solutionGrid('torch'), index)
  expect(JSON.stringify(before)).toBe(snapshot)
})

test('an unknown recipe is refused', () => {
  expect(() => createGame(all, 'not_a_recipe')).toThrow()
})
