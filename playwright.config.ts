import { defineConfig, devices } from '@playwright/test';

// Locally we drive the installed system Chrome via `channel` (Playwright's browser
// CDN is not on the network allowlist). CI installs Chromium normally, so channel
// is left undefined there.
const channel = process.env.CI ? undefined : 'chrome';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:4173',
    headless: true,
    serviceWorkers: 'block', // offline spec overrides this with `test.use`
    trace: 'on-first-retry',
    // Pre-seed the first-run Mature 17+ gate as accepted so gameplay specs are not
    // blocked by it (Overhaul P3). The dedicated agegate.spec overrides this with a
    // clean state to exercise the gate itself.
    storageState: 'tests/e2e/.auth/age-verified.json',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], channel } }],
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4173',
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
});
