import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import './styles/main.css'
import App from './App.vue'
import { messages } from './locales/index.ts'
import { useOptions } from './composables/useOptions.ts'

const { options } = useOptions()

const i18n = createI18n({
  legacy: false,
  locale: options.value.locale,
  fallbackLocale: 'en',
  messages
})

createApp(App).use(i18n).mount('#app')
