import neostandard from 'neostandard'
import pluginVue from 'eslint-plugin-vue'

const vueFlatRecommended = pluginVue.configs['flat/recommended']

export default [
  { ignores: ['dist/', 'node_modules/', 'tests/output/', 'src/data/'] },
  ...vueFlatRecommended,
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
