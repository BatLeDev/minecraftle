import { test, expect } from '@playwright/test'
import { seededRandom, shuffle } from '../../src/utils/random.ts'

test('the same seed replays the same sequence', () => {
  const a = seededRandom('minecraftle')
  const b = seededRandom('minecraftle')
  expect([a(), a(), a()]).toEqual([b(), b(), b()])
})

test('different seeds diverge', () => {
  expect(seededRandom('a')()).not.toBe(seededRandom('b')())
})

test('values stay within [0, 1)', () => {
  const random = seededRandom('range')
  for (let i = 0; i < 1000; i++) {
    const value = random()
    expect(value).toBeGreaterThanOrEqual(0)
    expect(value).toBeLessThan(1)
  }
})

test('shuffling leaves the input untouched and keeps every element', () => {
  const input = Object.freeze(['a', 'b', 'c', 'd', 'e'])
  const out = shuffle(input, seededRandom('shuffle'))
  expect(input).toEqual(['a', 'b', 'c', 'd', 'e'])
  expect([...out].sort()).toEqual(['a', 'b', 'c', 'd', 'e'])
})

test('shuffling is reproducible for a given seed', () => {
  const input = ['a', 'b', 'c', 'd', 'e']
  expect(shuffle(input, seededRandom('x'))).toEqual(shuffle(input, seededRandom('x')))
})
