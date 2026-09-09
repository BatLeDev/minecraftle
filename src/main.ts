import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import { createI18n } from 'vue-i18n'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import 'vuetify/styles'
import App from './App.vue'
import { messages } from './locales/index.ts'
import { useOptions } from './composables/useOptions.ts'

const { options } = useOptions()

/**
 * Two themes rather than one plus overrides: the high-contrast palette differs
 * only in the three hint colours, so switching is a single `theme.change()` and
 * no component ever needs to know which palette is active.
 *
 * The high-contrast pair is orange and blue, the combination that stays apart
 * under every common form of colour vision deficiency — green and yellow do not.
 */
const base = {
  background: '#101319',
  surface: '#181d26',
  'surface-bright': '#232a36',
  slot: '#2c3441',
  primary: '#5aa02c',
  absent: '#525a6b'
}

const vuetify = createVuetify({
  theme: {
    defaultTheme: options.value.highContrast ? 'contrast' : 'minecraftle',
    themes: {
      minecraftle: {
        dark: true,
        colors: { ...base, correct: '#4f9c2f', misplaced: '#c9971a' }
      },
      contrast: {
        dark: true,
        colors: { ...base, correct: '#f5793a', misplaced: '#85c0f9' }
      }
    }
  },
  icons: { defaultSet: 'mdi', aliases, sets: { mdi } }
})

const i18n = createI18n({
  legacy: false,
  locale: options.value.locale,
  fallbackLocale: 'en',
  messages
})

createApp(App).use(vuetify).use(i18n).mount('#app')
