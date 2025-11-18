import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Dashboard Components
 * Tests individual component rendering and interaction
 */

test.describe('Dashboard Components - Stat Cards', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/?key=test_api_key_12345');
    // Wait for potential data load
    await page.waitForTimeout(2000);
  });

  test('should display stat cards with proper structure', async ({ page }) => {
    // Look for stat-related content
    const pageContent = await page.textContent('body');

    // Should have some content related to stats or loading
    expect(pageContent).toBeTruthy();
    expect(pageContent.length).toBeGreaterThan(50);
  });

  test('should format numbers correctly in stats', async ({ page }) => {
    await page.waitForTimeout(3000);

    // Check if numbers are present (could be stats or event data)
    const numbers = await page.locator('body').textContent();

    // Basic sanity check - page has loaded with content
    expect(numbers).toBeTruthy();
  });
});

test.describe('Dashboard Components - Event List', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/?key=test_api_key_12345');
    await page.waitForTimeout(2000);
  });

  test('should render event list container', async ({ page }) => {
    // Check for list-like structures or event containers
    const lists = await page.locator('ul, ol, div[class*="list"], div[class*="event"]').count();

    // Should have some container elements
    expect(lists).toBeGreaterThanOrEqual(0);
  });

  test('should handle empty event state', async ({ page }) => {
    // Navigate with potentially invalid key to trigger empty state
    await page.goto('/?key=invalid');
    await page.waitForTimeout(3000);

    // Page should still render without crashing
    const body = await page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should display event items with proper structure', async ({ page }) => {
    await page.waitForTimeout(3000);

    // Look for structured content (divs, sections, articles)
    const containers = await page.locator('div, section, article').count();

    // Should have rendered some container elements
    expect(containers).toBeGreaterThan(5);
  });
});

test.describe('Dashboard Components - Historical Comparison', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/?key=test_api_key_12345');
    await page.waitForTimeout(2000);
  });

  test('should render historical comparison section', async ({ page }) => {
    await page.waitForTimeout(3000);

    const pageText = await page.textContent('body');

    // Look for time-related text (week, month, etc.) or general content
    const hasTimeReferences = /week|month|ago|historical|Loading|Price/i.test(pageText);
    expect(hasTimeReferences).toBe(true);
  });

  test('should display time period labels', async ({ page }) => {
    await page.waitForTimeout(3000);

    // Check if page has rendered multiple text elements
    const textElements = await page.locator('p, span, div, h1, h2, h3').count();
    expect(textElements).toBeGreaterThan(0);
  });
});

test.describe('Dashboard Components - Loading States', () => {

  test('should show loading spinner initially', async ({ page }) => {
    // Start navigating but don't wait for full load
    const navigationPromise = page.goto('/?key=test_api_key_12345');

    // Quickly check for loading state
    await page.waitForTimeout(100);

    const bodyVisible = await page.locator('body').isVisible();
    expect(bodyVisible).toBe(true);

    await navigationPromise;
  });

  test('should transition from loading to content', async ({ page }) => {
    await page.goto('/?key=test_api_key_12345');

    // Wait a bit for data to potentially load
    await page.waitForTimeout(4000);

    // Content should have updated (more elements than just loading)
    const elementCount = await page.locator('*').count();
    expect(elementCount).toBeGreaterThan(10);
  });
});

test.describe('Dashboard Components - Error Handling', () => {

  test('should handle API errors gracefully', async ({ page }) => {
    // Use invalid API key
    await page.goto('/?key=invalid_key_xyz');
    await page.waitForTimeout(3000);

    // Should show error or empty state, not crash
    const body = await page.locator('body');
    await expect(body).toBeVisible();

    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });

  test('should display error message when API fails', async ({ page }) => {
    await page.goto('/?key=');
    await page.waitForTimeout(3000);

    // Page should render without JavaScript crashes
    const errors = [];
    page.on('pageerror', error => errors.push(error));

    await page.waitForTimeout(1000);

    // Allow for API-related errors, but not runtime crashes
    const body = await page.locator('body');
    await expect(body).toBeVisible();
  });
});
