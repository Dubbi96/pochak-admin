// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const path = require('path');

module.exports = defineConfig({
  testDir: __dirname,
  testMatch: '**/login-e2e.spec.js',
  fullyParallel: false,
  retries: 0,
  timeout: 30000,
  reporter: [
    ['json', { outputFile: path.join(__dirname, 'test-reports', 'login-e2e-results.json') }],
    ['list'],
  ],
  use: {
    trace: 'off',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], headless: true },
    },
  ],
});
