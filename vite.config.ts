import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import vueI18n from '@intlify/unplugin-vue-i18n/vite'
import { fileURLToPath, URL } from 'node:url'

// `loadEnv`, not `process.env`: Vite never populates `process.env` from a `.env` file,
// so reading the port there would silently fall back to the default and collide again.
// It still lets an already exported `process.env` win, which is how Playwright injects
// its own `APP_PORT` into the dev server it boots.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const port = Number(env.APP_PORT ?? 3000)
  return {
    // GitHub Pages serves a project site under /<repo>/, so the base is injected at
    // build time rather than hardcoded — a local build or a custom domain keeps '/'.
    base: env.PUBLIC_URL ?? '/',
    plugins: [
      vueI18n({}),
      vue({ template: { transformAssetUrls } }),
      vuetify({ autoImport: true })
    ],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
    },
    server: {
      // pre-transform the module graph at boot instead of on the first request: without
      // it the first page pays the whole transform waterfall, which is what makes e2e
      // suites race their own cold start
      warmup: { clientFiles: ['./src/main.ts', './src/**/*.vue'] },
      port,
      strictPort: !!env.APP_PORT,
      // hmr follows the server port: a websocket left on the default would make the app
      // hold two ports and cancel out the whole point of drawing one
      hmr: { port, protocol: 'ws' }
    }
  }
})
