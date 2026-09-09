import { GRID_SIZE } from './grid.ts'
import { MAX_GUESSES } from './game.ts'
import { Hint } from './types.ts'
import type { Grid, Hints } from './types.ts'

/**
 * Four symbols, not three.
 *
 * The original marked an empty slot and a wrong ingredient with the same white
 * square, which threw away the shape of each attempt — and the shape is the
 * puzzle. The two dark squares follow what the board shows: a wrong ingredient
 * sits on a lighter grey than an untouched slot.
 */
const EMPTY = '⬛'
const WRONG = '⬜'

const PALETTE = {
  standard: { correct: '🟩', misplaced: '🟨' },
  highContrast: { correct: '🟧', misplaced: '🟦' }
} as const

export type ShareOptions = {
  /** The puzzle's UTC day, rendered as the date in the header. */
  day: number
  guesses: readonly Grid[]
  hints: readonly Hints[]
  won: boolean
  highContrast?: boolean
}

/** The ISO date of a UTC day number, which is what the header shows. */
export function dayToIsoDate (day: number): string {
  return new Date(day * 86_400_000).toISOString().slice(0, 10)
}

/**
 * The shareable result: a header line, then each attempt as coloured squares.
 *
 * The high-contrast palette carries over, so a player using it shares the
 * colours they actually saw.
 */
export function shareText ({ day, guesses, hints, won, highContrast = false }: ShareOptions): string {
  const palette = highContrast ? PALETTE.highContrast : PALETTE.standard
  const score = won ? String(hints.length) : 'X'
  const lines = [`Minecraftle ${dayToIsoDate(day)} ${score}/${MAX_GUESSES}`, '']

  hints.forEach((guessHints, g) => {
    for (let row = 0; row < GRID_SIZE; row++) {
      let line = ''
      for (let col = 0; col < GRID_SIZE; col++) {
        const i = row * GRID_SIZE + col
        const hint = guessHints[i] ?? Hint.Absent
        if (hint === Hint.Correct) line += palette.correct
        else if (hint === Hint.Misplaced) line += palette.misplaced
        else line += guesses[g]?.[i] ? WRONG : EMPTY
      }
      lines.push(line)
    }
    lines.push('')
  })

  return lines.join('\n').trimEnd()
}
