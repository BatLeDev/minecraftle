import { ref, watch } from 'vue'
import { readJson, writeJson } from '@/utils/storage.ts'

const STORAGE_KEY = 'minecraftle:options'

export type Locale = 'en' | 'fr'

export type Options = {
  /** Swaps the hint palette for one that stays legible with colour vision deficiency. */
  highContrast: boolean
  locale: Locale
}

function detectLocale (): Locale {
  const languages = typeof navigator === 'undefined' ? [] : navigator.languages ?? [navigator.language]
  return languages.some(language => language?.toLowerCase().startsWith('fr')) ? 'fr' : 'en'
}

function load (): Options {
  const stored = readJson<Partial<Options>>(STORAGE_KEY, {})
  return {
    highContrast: stored.highContrast === true,
    locale: stored.locale === 'fr' || stored.locale === 'en' ? stored.locale : detectLocale()
  }
}

// Module-level state, so every component shares one set of options without a
// store: the same pattern the other apps use for shared reactive state.
const options = ref<Options>(load())

watch(options, value => writeJson(STORAGE_KEY, value), { deep: true })

export function useOptions () {
  return { options }
}
