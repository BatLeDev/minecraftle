import { test, expect } from '@playwright/test'
import { dayToIsoDate, shareText } from '../../src/utils/share.ts'
import { Hint } from '../../src/utils/types.ts'
import type { Grid, Hints } from '../../src/utils/types.ts'

const C = Hint.Correct
const M = Hint.Misplaced
const A = Hint.Absent
const P = 'minecraft:planks'
const _ = null

const day = Math.floor(Date.UTC(2026, 8, 9) / 86_400_000)
// Three slots played: one right, one misplaced, one simply wrong. The rest empty.
const guesses: Grid[] = [[P, P, P, _, _, _, _, _, _]]
const hints: Hints[] = [[C, M, A, A, A, A, A, A, A]]

test('a day number renders as its UTC date', () => {
  expect(dayToIsoDate(day)).toBe('2026-09-09')
})

test('a win reports the number of tries', () => {
  expect(shareText({ day, guesses, hints, won: true })).toBe(
    'Minecraftle 2026-09-09 1/10\n\n🟩🟨⬜\n⬛⬛⬛\n⬛⬛⬛'
  )
})

test('an empty slot and a wrong ingredient use different squares', () => {
  // The original used the same white square for both, which hid the shape the
  // player had actually tried.
  const text = shareText({ day, guesses, hints, won: true })
  expect(text).toContain('🟩🟨⬜')
  expect(text).toContain('⬛⬛⬛')
})

test('a loss reports an X rather than a count', () => {
  expect(shareText({ day, guesses, hints, won: false })).toContain('X/10')
})

test('the high-contrast palette carries into the share text', () => {
  const text = shareText({ day, guesses, hints, won: true, highContrast: true })
  expect(text).toContain('🟧🟦⬜')
  expect(text).not.toContain('🟩')
})

test('each attempt adds three rows', () => {
  const text = shareText({ day, guesses: [...guesses, ...guesses], hints: [...hints, ...hints], won: true })
  expect(text.split('\n').filter(line => /[\u2B1B\u2B1C\u{1F7E9}\u{1F7E8}]/u.test(line)).length).toBe(6)
})

test('a win past the ten attempts still reports X', () => {
  // Carrying on after the limit does not turn a recorded loss into a win.
  const eleven = Array.from({ length: 11 }, () => hints[0])
  const grids = Array.from({ length: 11 }, () => guesses[0])
  expect(shareText({ day, guesses: grids, hints: eleven, won: true })).toContain('X/10')
})

test('there is no trailing blank line', () => {
  expect(shareText({ day, guesses, hints, won: true }).endsWith('⬛')).toBe(true)
})
