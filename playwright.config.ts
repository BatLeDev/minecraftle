import { defineConfig, devices } from '@playwright/test'

// Vite server port for e2e tests. It must stay distinct from the development port so
// that `reuseExistingServer` never latches onto a running `npm run dev` instead of
// booting its own instance.
const TEST_PORT = Number(process.env.E2E_PORT ?? 3100)

// The `webServer` option is global to the whole config, so it would boot Vite even for
// a unit-only run. Only skip it when every `--project` flag on the command line targets
// `unit` — any other invocation (no filter, `--project e2e`, or a mix) still needs it.
function getProjectArgs () {
  const projects: string[] = []
  for (let i = 0; i < process.argv.length; i++) {
    const arg = process.argv[i]
    if (arg === '--project') projects.push(process.argv[i + 1])
    else if (arg.startsWith('--project=')) projects.push(arg.slice('--project='.length))
  }
  return projects
}
const projectArgs = getProjectArgs()
const isUnitOnly = projectArgs.length > 0 && projectArgs.every(p => p === 'unit')

export default defineConfig({
  fullyParallel: false,
  // no per-project workers in Playwright: the browser suite runs alone, the unit project
  // keeps the default pool
  workers: isUnitOnly ? undefined : 1,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list']],
  outputDir: './tests/output',
  webServer: isUnitOnly
    ? undefined
    : {
        // `PUBLIC_URL` is unset here (rather than relying on CI step order) so the dev
        // server always serves on '/', matching the `url` readiness probe below. This
        // also protects a developer who has `PUBLIC_URL` exported locally. The port
        // travels through `APP_PORT`, never through `vite --port`: the flag would leave
        // `hmr.port` on the development port, pointing at the wrong server.
        command: 'PUBLIC_URL= npm run dev',
        env: { ...process.env, APP_PORT: String(TEST_PORT) },
        url: `http://localhost:${TEST_PORT}/`,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000
      },
  projects: [
    {
      name: 'unit',
      testDir: './tests/unit'
    },
    {
      name: 'e2e',
      testDir: './tests/e2e',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: `http://localhost:${TEST_PORT}`,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure'
      }
    }
  ]
})
