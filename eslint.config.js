import neostandard from 'neostandard'
import pluginVue from 'eslint-plugin-vue'
import pluginVuetify from 'eslint-plugin-vuetify'

// eslint-plugin-vuetify's flat/base already registers the `vue` plugin, and ESLint
// 9.39+ rejects redefining a plugin — strip `plugins` from vue's flat config.
const vueFlatRecommended = pluginVue.configs['flat/recommended'].map(({ plugins, ...rest }) => rest)

export default [
  { ignores: ['dist/', 'node_modules/', 'tests/output/', 'src/data/'] },
  ...vueFlatRecommended,
  ...pluginVuetify.configs['flat/recommended'],
  ...neostandard({ ts: true, env: ['browser'] }),
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: { parser: '@typescript-eslint/parser' }
    }
  },
  {
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/require-default-prop': 'off'
    }
  }
]
