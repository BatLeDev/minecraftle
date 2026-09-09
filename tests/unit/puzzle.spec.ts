import { test, expect } from '@playwright/test'
import { dayNumber, puzzleForDate, puzzleForDay } from '../../src/utils/puzzle.ts'
import recipes from '../../src/data/recipes.json' with { type: 'json' }

const keys = Object.keys(recipes)

test('the same day always gives the same recipe', () => {
  const a = puzzleForDate(new Date('2026-09-09T00:00:00Z'), keys)
  const b = puzzleForDate(new Date('2026-09-09T23:59:59Z'), keys)
  expect(a).toBe(b)
})

test('the day rolls over at UTC midnight, not local midnight', () => {
  // Same instant, two clocks. The original seeded on the local date string, so
  // these two players saw different puzzles.
  const instant = '2026-09-09T22:30:00Z'
  expect(dayNumber(new Date(instant))).toBe(dayNumber(new Date(instant)))
  expect(puzzleForDate(new Date('2026-09-09T00:00:00Z'), keys))
    .not.toBe(puzzleForDate(new Date('2026-09-10T00:00:00Z'), keys))
})

test('every recipe comes up exactly once per cycle', () => {
  // Measured on an aligned cycle: a window that straddles two permutations can
  // legitimately show a recipe twice, which is what the seam guard bounds.
  const cycle = Math.floor(dayNumber(new Date('2026-01-01T00:00:00Z')) / keys.length)
  const start = cycle * keys.length
  const seen = new Set<string>()
  for (let i = 0; i < keys.length; i++) seen.add(puzzleForDay(start + i, keys))
  expect(seen.size).toBe(keys.length)
})

test('no recipe repeats within ten days, cycle boundaries included', () => {
  // Two full cycles plus change, so at least two seams are crossed.
  const start = dayNumber(new Date('2026-01-01T00:00:00Z'))
  const days = keys.length * 3
  const lastSeen = new Map<string, number>()
  const offenders: string[] = []
  for (let i = 0; i < days; i++) {
    const key = puzzleForDay(start + i, keys)
    const previous = lastSeen.get(key)
    if (previous !== undefined && i - previous < 10) offenders.push(`${key} on days ${previous} and ${i}`)
    lastSeen.set(key, i)
  }
  expect(offenders).toEqual([])
})

test('recipes come up evenly over two years', () => {
  // The original drew with replacement, so over the same span some recipes came
  // up twelve times and others once.
  const start = dayNumber(new Date('2026-01-01T00:00:00Z'))
  const counts = new Map<string, number>()
  for (let i = 0; i < 730; i++) {
    const key = puzzleForDay(start + i, keys)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  // 730 days is 5.5 cycles, and an unaligned window clips a seventh cycle at
  // each end, so 5 to 7 appearances is the whole spread. The original draw put
  // that spread at 1 to 12 over the same span.
  const values = [...counts.values()]
  expect(Math.min(...values)).toBeGreaterThanOrEqual(5)
  expect(Math.max(...values)).toBeLessThanOrEqual(7)
})

test('a single-recipe catalogue still works', () => {
  expect(puzzleForDay(12345, ['stick'])).toBe('stick')
})

test('an empty catalogue is refused rather than returning undefined', () => {
  expect(() => puzzleForDay(1, [])).toThrow()
})
