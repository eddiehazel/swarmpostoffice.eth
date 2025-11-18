import { test, expect } from '@playwright/test';

test.describe('Loading Screen', () => {
  test('should show loading screen immediately on page load', async ({
    page,
  }) => {
    // Start navigation but don't wait for it to complete
    const navigationPromise = page.goto('/?key=test-key');

    // Wait for the loading screen to appear
    const loadingScreen = page.locator('.loading-screen-overlay');
    await expect(loadingScreen).toBeVisible({ timeout: 2000 });

    // Verify loading screen has postal theme elements
    await expect(page.locator('.glitch-text')).toHaveText(
      'INITIALIZING POSTAL NETWORK'
    );
    await expect(page.locator('.postal-emoji')).toBeVisible();

    // Verify skeleton elements are present
    await expect(page.locator('.loading-stat-card')).toHaveCount(3);
    await expect(page.locator('.loading-event-item')).toHaveCount(5);
    await expect(page.locator('.loading-bar')).toBeVisible();

    // Verify technical details
    await expect(page.locator('.system-status')).toContainText(
      'SWARM_POST_OFFICE'
    );

    // Wait for navigation to complete
    await navigationPromise;
  });

  test('should hide loading screen after data loads', async ({ page }) => {
    await page.goto('/?key=test-key');

    // Loading screen should disappear
    await expect(page.locator('.loading-screen-overlay')).not.toBeVisible({
      timeout: 10000,
    });

    // Main content should be visible
    await expect(page.locator('.container')).toBeVisible();
    await expect(page.locator('h1')).toContainText('PRICE UPDATE EVENTS');
  });

  test('should show shimmer animation on skeleton boxes', async ({ page }) => {
    // Start navigation
    const navigationPromise = page.goto('/?key=test-key');

    // Wait for loading screen
    await expect(page.locator('.loading-screen-overlay')).toBeVisible({
      timeout: 2000,
    });

    // Check that skeleton boxes have the shimmer pseudo-element
    const skeletonBox = page.locator('.skeleton-box').first();
    await expect(skeletonBox).toBeVisible();

    // Verify skeleton boxes have proper styling
    await expect(skeletonBox).toHaveCSS('position', 'relative');
    await expect(skeletonBox).toHaveCSS('overflow', 'hidden');

    await navigationPromise;
  });

  test('should display all loading screen sections', async ({ page }) => {
    const navigationPromise = page.goto('/?key=test-key');

    await expect(page.locator('.loading-screen-overlay')).toBeVisible({
      timeout: 2000,
    });

    // Header section
    await expect(page.locator('.loading-header')).toBeVisible();
    await expect(page.locator('.loading-title')).toBeVisible();

    // Stats section
    await expect(page.locator('.loading-stats')).toBeVisible();
    await expect(page.locator('.skeleton-label')).toHaveCount(7); // 3 stats + 4 historical

    // Historical section
    await expect(page.locator('.loading-historical')).toBeVisible();
    await expect(page.locator('.loading-historical-title')).toContainText(
      'HISTORICAL_DATA_ANALYSIS'
    );

    // Events section
    await expect(page.locator('.loading-events')).toBeVisible();
    await expect(page.locator('.events-title-loading')).toContainText(
      'RECENT_TRANSMISSIONS'
    );

    // Footer
    await expect(page.locator('.loading-footer')).toBeVisible();
    await expect(page.locator('.loading-bar-container')).toBeVisible();

    await navigationPromise;
  });
});
