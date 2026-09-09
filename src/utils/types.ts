/** An item id as Minecraft spells it, e.g. `minecraft:stick`. */
export type ItemId = string

/** One crafting slot: an item, or nothing. */
export type Cell = ItemId | null

/**
 * A crafting grid, row-major and flat: index 0 is top-left, 8 bottom-right.
 * Flat beats nested here — every comparison in the engine walks all nine cells,
 * and a single index removes a whole class of row/column mix-ups.
 */
export type Grid = readonly Cell[]

/**
 * How one slot scored against the solution.
 *
 * A frozen object rather than a `const enum`: `isolatedModules` forbids reading
 * an enum member across module boundaries, which is exactly what the engine and
 * the components both do.
 */
export const Hint = {
  /** The item is not in the solution, or every copy of it is already accounted for. */
  Absent: 0,
  /** The item is in the solution, but this slot is not certain. */
  Misplaced: 1,
  /** This exact item sits in this exact slot in every solution still possible. */
  Correct: 2
} as const

// A value and a type may share a name in TypeScript; the rule cannot see that.
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type Hint = typeof Hint[keyof typeof Hint]

export type Hints = readonly Hint[]

/** A recipe's shape, as authored: 1 to 3 rows of 1 to 3 columns. */
export type RecipeShape = readonly (ItemId | null)[][]

export type Recipe = {
  readonly output: ItemId
  readonly input: RecipeShape
}

export type RecipeMap = Readonly<Record<string, Recipe>>

export type GameStatus = 'playing' | 'won' | 'lost'
