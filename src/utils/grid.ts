import type { Cell, Grid } from './types.ts'

export const GRID_SIZE = 3
export const GRID_CELLS = GRID_SIZE * GRID_SIZE

export const EMPTY_GRID: Grid = Object.freeze(Array<Cell>(GRID_CELLS).fill(null))

export const index = (row: number, col: number) => row * GRID_SIZE + col
export const rowOf = (i: number) => Math.floor(i / GRID_SIZE)
export const colOf = (i: number) => i % GRID_SIZE

/** Returns a new grid; the input is never modified. */
export function setCell (grid: Grid, i: number, item: Cell): Grid {
  if (grid[i] === item) return grid
  const next = grid.slice()
  next[i] = item
  return Object.freeze(next)
}

export function clearGrid (): Grid {
  return EMPTY_GRID
}

export function isEmpty (grid: Grid): boolean {
  return grid.every(cell => cell === null)
}

export function gridEquals (a: Grid, b: Grid): boolean {
  for (let i = 0; i < GRID_CELLS; i++) if (a[i] !== b[i]) return false
  return true
}

/** A stable identity for a grid, used to de-duplicate placements. */
export function gridKey (grid: Grid): string {
  return grid.map(cell => cell ?? '').join('|')
}

/** How many times each item appears, ignoring empty slots. */
export function countItems (grid: Grid): Map<string, number> {
  const counts = new Map<string, number>()
  for (const cell of grid) {
    if (cell === null) continue
    counts.set(cell, (counts.get(cell) ?? 0) + 1)
  }
  return counts
}
