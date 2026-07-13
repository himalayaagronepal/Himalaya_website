import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  timeout: 30_000,
  expect: { timeout: 5000 },
  fullyParallel: false,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chromium'] },
    },
  ],
  use: {
    headless: true,
    baseURL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },
});
