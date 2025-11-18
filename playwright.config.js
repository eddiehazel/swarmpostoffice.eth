import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Ember price dashboard E2E tests
 * Optimized for Claude Code cloud environment with headless Chromium
 *
 * CLOUD ENVIRONMENT LIMITATIONS:
 * - Page crashes can occur with complex Ember applications
 * - Screenshots and visual testing may be unstable
 * - Use simple smoke tests and API/network testing instead
 */
export default defineConfig({
  // Test directory
  testDir: './tests/e2e',

  // Maximum time one test can run
  timeout: 60 * 1000, // Increased for cloud environment

  // Test execution settings
  fullyParallel: false, // Sequential to avoid resource conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // Retry once by default
  workers: 1, // Single worker for stability

  // Reporter configuration
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results.json' }]
  ],

  // Shared settings for all tests
  use: {
    // Base URL for the app
    baseURL: process.env.BASE_URL || 'http://localhost:4200',

    // Browser options optimized for Claude Code cloud environment
    headless: true,

    // Collect trace for debugging (disabled - causes instability)
    trace: 'off',

    // Screenshot on failure (disabled - causes crashes in cloud)
    screenshot: 'off',

    // Video recording (disabled due to cloud environment limitations)
    video: 'off',

    // Ignore HTTPS errors in cloud environment
    ignoreHTTPSErrors: true,

    // Extended timeouts for cloud environment
    navigationTimeout: 20000,
    actionTimeout: 15000,
  },

  // Configure projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: {
        viewport: { width: 1280, height: 720 },
        // Additional args for cloud sandbox environment stability
        launchOptions: {
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-software-rasterizer',
            '--disable-features=VizDisplayCompositor',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--no-first-run',
            '--no-zygote',
            '--single-process', // Critical for cloud environment
          ],
          chromiumSandbox: false,
          timeout: 30000,
        }
      },
    },
  ],

  // Web server configuration - start Ember dev server before tests
  webServer: {
    command: 'npm start',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
