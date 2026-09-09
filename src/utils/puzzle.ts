import { seededRandom, shuffle } from './random.ts'

const MS_PER_DAY = 86_400_000

/**
 * How many days at a cycle boundary are kept free of repeats. Without it a
 * recipe could close one permutation and open the next, landing two days in a
 * row — which is exactly the complaint about the original draw.
 */
const SEAM_GUARD = 10

/**
 * The UTC day a date falls on, counted from the Unix epoch.
 *
 * UTC, not local time: the original seeded on `date.toDateString()`, so the
 * puzzle rolled over at midnight in each player's own zone and two people on
 * the same calendar day could be given different recipes.
 */
export function dayNumber (date: Date): number {
  return Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / MS_PER_DAY)
}

/**
 * The recipe for a given day.
 *
 * The original drew independently every day — a draw *with replacement*. Over
 * two years that produced 42 repeats less than a week apart, three of them on
 * consecutive days, while some recipes came up twelve times and others once.
 *
 * Instead the catalogue is shuffled into a cycle and walked in order, so every
 * recipe comes up exactly once per cycle, the order changes each time round,
 * and the whole thing stays a pure function of the date — no storage, no state.
 */
export function puzzleForDay (day: number, keys: readonly string[]): string {
  if (keys.length === 0) throw new Error('puzzleForDay needs at least one recipe')
  const size = keys.length
  const cycle = Math.floor(day / size)
  const offset = ((day % size) + size) % size
  return permutationForCycle(cycle, keys)[offset]
}

export function puzzleForDate (date: Date, keys: readonly string[]): string {
  return puzzleForDay(dayNumber(date), keys)
}

/** The unadjusted shuffle for a cycle. Pure, and cheap enough to redo on demand. */
function basePermutation (cycle: number, keys: readonly string[]): string[] {
  return shuffle(keys, seededRandom(`minecraftle-cycle-${cycle}`))
}

/**
 * The shuffle for a cycle, with its opening entries kept clear of the previous
 * cycle's closing ones.
 *
 * Only the first `SEAM_GUARD` positions are ever moved, and only with entries
 * taken from the middle. The tail therefore always matches `basePermutation`,
 * which is what lets the previous cycle be read from the base shuffle without
 * recursing back through every cycle before it.
 */
function permutationForCycle (cycle: number, keys: readonly string[]): string[] {
  const size = keys.length
  const guard = Math.min(SEAM_GUARD, Math.floor(size / 4))
  const perm = basePermutation(cycle, keys)
  if (guard === 0 || cycle === 0) return perm

  const previous = basePermutation(cycle - 1, keys)
  const forbidden = new Set(previous.slice(size - guard))

  let donor = guard
  for (let i = 0; i < guard; i++) {
    if (!forbidden.has(perm[i])) continue
    while (donor < size - guard && forbidden.has(perm[donor])) donor++
    if (donor >= size - guard) break // nothing left to swap with; leave it be
    ;[perm[i], perm[donor]] = [perm[donor], perm[i]]
    donor++
  }
  return perm
}
