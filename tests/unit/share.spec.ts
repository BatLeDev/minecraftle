import { test, expect } from '@playwright/test'
import { dayToIsoDate, shareText } from '../../src/utils/share.ts'
import { Hint } from '../../src/utils/types.ts'
import type { Hints } from '../../src/utils/types.ts'

const C = Hint.Correct
const M = Hint.Misplaced
const A = Hint.Absent

const day = Math.floor(Date.UTC(2026, 8, 9) / 86_400_000)
const oneGuess: Hints[] = [[C, M, A, A, A, A, A, A, A]]

test('a day number renders as its UTC date', () => {
  expect(dayToIsoDate(day)).toBe('2026-09-09')
})

test('a win reports the number of tries', () => {
  expect(shareText({ day, hints: oneGuess, won: true })).toBe(
    'Minecraftle 2026-09-09 1/10\n\n🟩🟨⬜\n⬜⬜⬜\n⬜⬜⬜'
  )
})

test('a loss reports an X rather than a count', () => {
  expect(shareText({ day, hints: oneGuess, won: false })).toContain('X/10')
})

test('the high-contrast palette carries into the share text', () => {
  const text = shareText({ day, hints: oneGuess, won: true, highContrast: true })
  expect(text).toContain('🟧🟦⬜')
  expect(text).not.toContain('🟩')
})

test('each guess adds three rows', () => {
  const text = shareText({ day, hints: [...oneGuess, ...oneGuess], won: true })
  expect(text.split('\n').filter(line => line.includes('⬜')).length).toBe(6)
})

test('there is no trailing blank line', () => {
  expect(shareText({ day, hints: oneGuess, won: true }).endsWith('⬜')).toBe(true)
})
