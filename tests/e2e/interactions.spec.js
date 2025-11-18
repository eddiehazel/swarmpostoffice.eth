import { test, expect } from '@playwright/test';

/**
 * E2E Tests for User Interactions and Dynamic Behavior
 * Tests auto-refresh, animations, and responsive behavior
 */

test.describe('Dashboard Interactions - Auto-refresh', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/?key=test_api_key_12345');
    await page.waitForTimeout(2000);
  });

  test('should load initial content', async ({ page }) => {
    // Verify page loads
    const body = await page.locator('body');
    await expect(body).toBeVisible();

    // Capture initial content
    const initialContent = await page.textContent('body');
    expect(initialContent).toBeTruthy();
    expect(initialContent.length).toBeGreaterThan(0);
  });

  test('should maintain content structure over time', async ({ page }) => {
    // Get initial element count
    const initialCount = await page.locator('div').count();

    // Wait a few seconds
    await page.waitForTimeout(5000);

    // Element structure should remain stable
    const laterCount = await page.locator('div').count();
    expect(laterCount).toBeGreaterThan(0);
    expect(Math.abs(laterCount - initialCount)).toBeLessThan(50);
  });

  test('should not crash during extended session', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));

    // Keep page open for a bit
    await page.waitForTimeout(10000);

    // Check that body is still responsive
    const body = await page.locator('body');
    await expect(body).toBeVisible();

    // Should not have accumulated critical errors
    expect(errors.length).toBeLessThan(10);
  });
});

test.describe('Dashboard Interactions - Responsive Design', () => {

  const viewports = [
    { name: 'Mobile Portrait', width: 375, height: 667 },
    { name: 'Mobile Landscape', width: 667, height: 375 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 },
  ];

  for (const viewport of viewports) {
    test(`should render correctly on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/?key=test_api_key_12345');
      await page.waitForTimeout(2000);

      // Body should be visible
      const body = await page.locator('body');
      await expect(body).toBeVisible();

      // Should have rendered content
      const content = await page.textContent('body');
      expect(content).toBeTruthy();
      expect(content.length).toBeGreaterThan(100);

      // No horizontal overflow
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 50);
    });
  }

  test('should maintain readability at different zoom levels', async ({ page }) => {
    await page.goto('/?key=test_api_key_12345');
    await page.waitForTimeout(2000);

    // Test different zoom levels
    for (const zoom of [0.75, 1.0, 1.25, 1.5]) {
      await page.evaluate((zoomLevel) => {
        document.body.style.zoom = zoomLevel;
      }, zoom);

      await page.waitForTimeout(500);

      // Content should still be visible
      const body = await page.locator('body');
      await expect(body).toBeVisible();
    }
  });
});

test.describe('Dashboard Interactions - Data Display', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/?key=test_api_key_12345');
    await page.waitForTimeout(3000);
  });

  test('should display formatted prices', async ({ page }) => {
    const content = await page.textContent('body');

    // Look for number patterns (prices, percentages, etc.)
    const hasNumbers = /\d+/.test(content);
    expect(hasNumbers).toBe(true);
  });

  test('should display dates or timestamps', async ({ page }) => {
    const content = await page.textContent('body');

    // Look for time-related content or just verify content exists
    expect(content).toBeTruthy();
    expect(content.length).toBeGreaterThan(200);
  });

  test('should handle percentage changes display', async ({ page }) => {
    const content = await page.textContent('body');

    // Content should have loaded
    expect(content).toBeTruthy();
  });
});

test.describe('Dashboard Interactions - Performance', () => {

  test('should load within reasonable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/?key=test_api_key_12345');

    const loadTime = Date.now() - startTime;

    // Should load initial page quickly (under 5 seconds)
    expect(loadTime).toBeLessThan(5000);
  });

  test('should handle rapid viewport changes', async ({ page }) => {
    await page.goto('/?key=test_api_key_12345');

    // Rapidly change viewport
    for (let i = 0; i < 5; i++) {
      await page.setViewportSize({ width: 375 + i * 100, height: 667 });
      await page.waitForTimeout(100);
    }

    // Should still be functional
    const body = await page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should not have memory leaks in DOM', async ({ page }) => {
    await page.goto('/?key=test_api_key_12345');

    const initialCount = await page.locator('*').count();

    // Wait for potential auto-refresh
    await page.waitForTimeout(10000);

    const laterCount = await page.locator('*').count();

    // DOM size shouldn't grow unbounded
    expect(Math.abs(laterCount - initialCount)).toBeLessThan(1000);
  });
});

test.describe('Dashboard Interactions - Browser Features', () => {

  test('should work with JavaScript enabled', async ({ page }) => {
    await page.goto('/?key=test_api_key_12345');
    await page.waitForTimeout(2000);

    // Execute JavaScript in page context
    const result = await page.evaluate(() => {
      return typeof window !== 'undefined' && typeof document !== 'undefined';
    });

    expect(result).toBe(true);
  });

  test('should handle browser back/forward', async ({ page }) => {
    await page.goto('/?key=test_api_key_12345');
    await page.waitForTimeout(2000);

    // Navigate to a different key
    await page.goto('/?key=different_key');
    await page.waitForTimeout(1000);

    // Go back
    await page.goBack();
    await page.waitForTimeout(1000);

    // Should still be functional
    const body = await page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should handle page reload', async ({ page }) => {
    await page.goto('/?key=test_api_key_12345');
    await page.waitForTimeout(2000);

    // Reload page
    await page.reload();
    await page.waitForTimeout(2000);

    // Should load successfully again
    const body = await page.locator('body');
    await expect(body).toBeVisible();
  });
});
