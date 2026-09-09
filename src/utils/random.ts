/**
 * A tiny seeded generator, so the daily puzzle is reproducible without pulling
 * in a dependency. `seedrandom` was overkill for drawing a handful of numbers a
 * day, and its ARC4 key schedule bought nothing here.
 */

/** FNV-1a, for turning a seed string into the 32 bits mulberry32 wants. */
export function hashSeed (seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** mulberry32: 32 bits of state, uniform enough for a puzzle of the day. */
export function mulberry32 (seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6D2B79F5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function seededRandom (seed: string): () => number {
  return mulberry32(hashSeed(seed))
}

/** Fisher-Yates, out of place so the caller's array is never touched. */
export function shuffle<T> (values: readonly T[], random: () => number): T[] {
  const out = values.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}
