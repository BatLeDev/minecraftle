import { computed, ref, watch } from 'vue'
import { MAX_GUESSES } from '@/utils/game.ts'
import { readJson, writeJson } from '@/utils/storage.ts'

const STORAGE_KEY = 'minecraftle:stats'

export type Stats = {
  played: number
  wins: number
  /** Wins by number of guesses; index 0 is a win in one guess. */
  distribution: number[]
  currentStreak: number
  maxStreak: number
  /** UTC day number of the last daily puzzle finished, so a streak can be broken. */
  lastPlayedDay: number | null
}

function load (): Stats {
  const stored = readJson<Partial<Stats>>(STORAGE_KEY, {})
  const distribution = Array.isArray(stored.distribution) ? stored.distribution.slice(0, MAX_GUESSES) : []
  while (distribution.length < MAX_GUESSES) distribution.push(0)
  return {
    played: stored.played ?? 0,
    wins: stored.wins ?? 0,
    distribution,
    currentStreak: stored.currentStreak ?? 0,
    maxStreak: stored.maxStreak ?? 0,
    lastPlayedDay: stored.lastPlayedDay ?? null
  }
}

const stats = ref<Stats>(load())

watch(stats, value => writeJson(STORAGE_KEY, value), { deep: true })

/**
 * Records a finished daily puzzle.
 *
 * Only ever called once per day: the day number is checked against the last one
 * recorded, which is what stops a replayed daily from inflating the totals — the
 * complaint behind upstream issue #73.
 */
export function recordDaily (day: number, won: boolean, guesses: number) {
  const current = stats.value
  if (current.lastPlayedDay === day) return

  const continuesStreak = current.lastPlayedDay === day - 1
  const currentStreak = won ? (continuesStreak ? current.currentStreak : 0) + 1 : 0
  const distribution = current.distribution.slice()
  if (won) distribution[guesses - 1]++

  stats.value = {
    played: current.played + 1,
    wins: current.wins + (won ? 1 : 0),
    distribution,
    currentStreak,
    maxStreak: Math.max(current.maxStreak, currentStreak),
    lastPlayedDay: day
  }
}

export function useStats () {
  const winRate = computed(() => stats.value.played === 0
    ? 0
    : Math.round((stats.value.wins / stats.value.played) * 100))
  const bestCount = computed(() => Math.max(1, ...stats.value.distribution))
  return { stats, winRate, bestCount, recordDaily }
}
