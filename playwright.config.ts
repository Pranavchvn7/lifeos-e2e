import { defineConfig, devices } from '@playwright/test';

// Load .env for local runs (Node 20.12+). In CI the values come from the workflow instead.
try {
  process.loadEnvFile('.env');
} catch {
  /* no .env file — fine */
}

const baseURL = (process.env.BASE_URL ?? 'https://life-os-lake-three.vercel.app').replace(/\/$/, '');
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  outputDir: 'test-results',

  // Every test creates its own account, so tests are fully independent and can run in parallel.
  fullyParallel: true,
  forbidOnly: isCI, // fail the build if someone leaves test.only in the code
  retries: isCI ? 1 : 0,
  // One worker in CI: every test signs up a new user, and the server limits sign-ups per IP address.
  workers: isCI ? 1 : undefined,

  timeout: 60_000,
  expect: { timeout: 10_000 },

  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ...(isCI ? ([['github']] as const) : []),
    ...(process.env.ALLURE === 'true'
      ? ([['allure-playwright', { environmentInfo: { BASE_URL: baseURL, NODE: process.version } }]] as const)
      : []),
  ],

  use: {
    baseURL,
    // Fixed timezone + locale so "today", weekdays and date formats are the same on every machine.
    timezoneId: 'UTC',
    locale: 'en-US',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // Smoke tests also run on a phone-sized screen (bottom navigation instead of the sidebar).
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] }, grep: /@smoke/ },
  ],
});
