import { GRID_SIZE } from './grid.ts'
import { MAX_GUESSES } from './game.ts'
import { Hint } from './types.ts'
import type { Hints } from './types.ts'

const SQUARES = {
  standard: { [Hint.Correct]: '🟩', [Hint.Misplaced]: '🟨', [Hint.Absent]: '⬜' },
  highContrast: { [Hint.Correct]: '🟧', [Hint.Misplaced]: '🟦', [Hint.Absent]: '⬜' }
} as const

export type ShareOptions = {
  /** The puzzle's UTC day, rendered as the date in the header. */
  day: number
  hints: readonly Hints[]
  won: boolean
  highContrast?: boolean
}

/** The ISO date of a UTC day number, which is what the header shows. */
export function dayToIsoDate (day: number): string {
  return new Date(day * 86_400_000).toISOString().slice(0, 10)
}

/**
 * The shareable result: a header line, then the hint grids as coloured squares.
 *
 * The high-contrast palette carries over, so a player using it shares the
 * colours they actually saw.
 */
export function shareText ({ day, hints, won, highContrast = false }: ShareOptions): string {
  const squares = highContrast ? SQUARES.highContrast : SQUARES.standard
  const score = won ? String(hints.length) : 'X'
  const lines = [`Minecraftle ${dayToIsoDate(day)} ${score}/${MAX_GUESSES}`, '']

  for (const guess of hints) {
    for (let row = 0; row < GRID_SIZE; row++) {
      let line = ''
      for (let col = 0; col < GRID_SIZE; col++) {
        const hint = guess[row * GRID_SIZE + col] ?? Hint.Absent
        line += squares[hint]
      }
      lines.push(line)
    }
    lines.push('')
  }

  return lines.join('\n').trimEnd()
}
