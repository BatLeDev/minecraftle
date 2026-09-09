import { test, expect } from '@playwright/test'
import { EMPTY_GRID, countItems, gridEquals, gridKey, isEmpty, setCell } from '../../src/utils/grid.ts'

const P = 'minecraft:planks'

test('setting a cell returns a new grid and leaves the old one alone', () => {
  const next = setCell(EMPTY_GRID, 4, P)
  expect(next[4]).toBe(P)
  expect(EMPTY_GRID[4]).toBe(null)
  expect(next).not.toBe(EMPTY_GRID)
})

test('setting a cell to the value it already holds returns the same grid', () => {
  expect(setCell(EMPTY_GRID, 0, null)).toBe(EMPTY_GRID)
})

test('an empty grid reads as empty', () => {
  expect(isEmpty(EMPTY_GRID)).toBe(true)
  expect(isEmpty(setCell(EMPTY_GRID, 0, P))).toBe(false)
})

test('grids compare by content', () => {
  expect(gridEquals(setCell(EMPTY_GRID, 1, P), setCell(EMPTY_GRID, 1, P))).toBe(true)
  expect(gridEquals(setCell(EMPTY_GRID, 1, P), setCell(EMPTY_GRID, 2, P))).toBe(false)
})

test('the grid key distinguishes position, not just contents', () => {
  expect(gridKey(setCell(EMPTY_GRID, 1, P))).not.toBe(gridKey(setCell(EMPTY_GRID, 2, P)))
})

test('counting ignores empty slots', () => {
  const grid = setCell(setCell(EMPTY_GRID, 0, P), 8, P)
  expect(countItems(grid)).toEqual(new Map([[P, 2]]))
})
