/**
 * localStorage behind a guard.
 *
 * Reads and writes both throw outright in a few real situations — private
 * windows, browsers set to block site data — so every access is wrapped. A
 * player whose browser refuses storage should still get a playable game, just
 * without the ability to resume it.
 */
export function readJson<T> (key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeJson (key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage full, or blocked: the game carries on in memory
  }
}
