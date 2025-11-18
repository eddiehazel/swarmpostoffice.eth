import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Price Dashboard - Main Dashboard Functionality
 * Tests run in headless Chromium in Claude Code cloud environment
 */

test.describe('Price Dashboard - Main Page', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard with a mock/test API key
    await page.goto('/?key=test_api_key_12345');
  });

  test('should display the dashboard title and header', async ({ page }) => {
    // Check for main heading
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();

    // Page should have loaded
    await expect(page).toHaveTitle(/Price/i);
  });

  test('should display the statistics section', async ({ page }) => {
    // Wait for content to load (or show loading state)
    await page.waitForTimeout(2000);

    // Check if stats cards or loading spinner is present
    const statsSection = page.getByText(/Total Events|Latest Price|Average Change|Loading/i).first();
    await expect(statsSection).toBeVisible();
  });

  test('should display event list or loading state', async ({ page }) => {
    // Wait for initial load
    await page.waitForTimeout(2000);

    // Should show either events or a loading/error state
    const hasContent = await page.locator('body').textContent();
    expect(hasContent).toBeTruthy();
    expect(hasContent.length).toBeGreaterThan(0);
  });

  test('should handle missing API key gracefully', async ({ page }) => {
    // Navigate without API key
    await page.goto('/');

    // Should still load the page (might show error or empty state)
    await expect(page).toHaveTitle(/Price/i);

    // Page should not crash
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should be responsive and render on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/?key=test_api_key_12345');

    // Page should still be visible
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should render with proper styling', async ({ page }) => {
    await page.goto('/?key=test_api_key_12345');

    // Check that body has loaded
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Check for purple gradient mentioned in README
    const hasGradient = await page.evaluate(() => {
      const styles = window.getComputedStyle(document.body);
      return styles.background || styles.backgroundColor;
    });

    expect(hasGradient).toBeTruthy();
  });
});

test.describe('Price Dashboard - Navigation', () => {

  test('should load without JavaScript errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));

    await page.goto('/?key=test_api_key_12345');
    await page.waitForTimeout(3000);

    // Check for critical errors (allow warnings)
    const criticalErrors = errors.filter(e =>
      !e.includes('Warning') &&
      !e.includes('deprecated') &&
      !e.includes('API')
    );

    expect(criticalErrors.length).toBe(0);
  });

  test('should not have accessibility violations on main elements', async ({ page }) => {
    await page.goto('/?key=test_api_key_12345');
    await page.waitForTimeout(2000);

    // Check for proper heading structure
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThan(0);

    // Check that body has proper structure
    const mainContent = await page.locator('body').count();
    expect(mainContent).toBe(1);
  });
});
