import { test, expect } from '@playwright/test';

test.describe('Data Updates', () => {
  test('should display event data after loading completes', async ({
    page,
  }) => {
    await page.goto('/?key=test-key');

    // Wait for loading to complete
    await expect(page.locator('.loading-screen-overlay')).not.toBeVisible({
      timeout: 15000,
    });

    // Main container should be visible
    await expect(page.locator('.container')).toBeVisible();

    // Header should be displayed
    await expect(page.locator('.header')).toBeVisible();
    await expect(page.locator('h1')).toHaveText('🔔 PRICE UPDATE EVENTS');

    // Contract info should be visible
    await expect(page.locator('.contract-info')).toBeVisible();
    await expect(page.locator('.contract-info strong').first()).toContainText(
      '0x47EeF336e7fE5bED98499A4696bce8f28c1B0a8b'
    );
  });

  test('should display stat cards with data', async ({ page }) => {
    await page.goto('/?key=test-key');

    // Wait for data to load
    await expect(page.locator('.loading-screen-overlay')).not.toBeVisible({
      timeout: 15000,
    });

    // Should have 3 stat cards
    const statCards = page.locator('.stat-card');
    await expect(statCards).toHaveCount(3);

    // Each stat card should have a label and value
    for (let i = 0; i < 3; i++) {
      const card = statCards.nth(i);
      await expect(card.locator('.stat-label')).toBeVisible();
      await expect(card.locator('.stat-value')).toBeVisible();
    }

    // Verify stat labels
    await expect(page.locator('.stat-label').nth(0)).toHaveText('TOTAL EVENTS');
    await expect(page.locator('.stat-label').nth(1)).toHaveText('LATEST PRICE');
    await expect(page.locator('.stat-label').nth(2)).toHaveText('AVG CHANGE');
  });

  test('should display events container', async ({ page }) => {
    await page.goto('/?key=test-key');

    await expect(page.locator('.loading-screen-overlay')).not.toBeVisible({
      timeout: 15000,
    });

    // Events container should be visible
    await expect(page.locator('.events-container')).toBeVisible();
    await expect(page.locator('.events-title')).toBeVisible();

    // Should show either events, loading state, or no events message
    const hasEvents = await page.locator('.event-item').count();
    const hasLoading = await page.locator('.loading').count();
    const hasNoEvents = await page.locator('.no-events').count();

    expect(hasEvents + hasLoading + hasNoEvents).toBeGreaterThan(0);
  });

  test('should show event items if data exists', async ({ page }) => {
    await page.goto('/?key=test-key');

    await expect(page.locator('.loading-screen-overlay')).not.toBeVisible({
      timeout: 15000,
    });

    // If we have events, verify their structure
    const eventCount = await page.locator('.event-item').count();

    if (eventCount > 0) {
      const firstEvent = page.locator('.event-item').first();

      // Each event should have time and price badge
      await expect(firstEvent.locator('.event-time')).toBeVisible();
      await expect(firstEvent.locator('.price-badge')).toBeVisible();

      // Event details should be present
      await expect(firstEvent.locator('.event-details')).toBeVisible();
      await expect(firstEvent.locator('.detail-item')).toHaveCount(4); // 4 detail items per event
    }
  });

  test('should have proper color scheme', async ({ page }) => {
    await page.goto('/?key=test-key');

    await expect(page.locator('.loading-screen-overlay')).not.toBeVisible({
      timeout: 15000,
    });

    // Verify black/orange color scheme
    const body = page.locator('body');
    await expect(body).toHaveCSS('font-family', /Courier New/);

    // Check header has orange border
    const header = page.locator('.header');
    const borderColor = await header.evaluate((el) =>
      window.getComputedStyle(el).getPropertyValue('border-color')
    );
    // Orange should be present in the border
    expect(borderColor).toMatch(/rgb\(255,\s*102,\s*0\)/);
  });

  test('should handle refresh without showing loading screen', async ({
    page,
  }) => {
    await page.goto('/?key=test-key');

    // Wait for initial load to complete
    await expect(page.locator('.loading-screen-overlay')).not.toBeVisible({
      timeout: 15000,
    });

    // Wait a bit for the page to be fully ready
    await page.waitForTimeout(1000);

    // After initial load, loading screen should stay hidden even if data refreshes
    // (The auto-refresh happens every 30 seconds, but we can't easily wait that long in tests)
    await expect(page.locator('.loading-screen-overlay')).not.toBeVisible();
  });

  test('should display historical comparison if data exists', async ({
    page,
  }) => {
    await page.goto('/?key=test-key');

    await expect(page.locator('.loading-screen-overlay')).not.toBeVisible({
      timeout: 15000,
    });

    // Check if historical section exists
    const historicalExists =
      (await page.locator('.historical-stats').count()) > 0;

    if (historicalExists) {
      // If historical data exists, it should have 4 cards
      const historicalCards = page.locator('.historical-card');
      await expect(historicalCards).toHaveCount(4);

      // Each should be a stat card
      for (let i = 0; i < 4; i++) {
        const card = historicalCards.nth(i);
        await expect(card.locator('.stat-label')).toBeVisible();
        await expect(card.locator('.stat-value')).toBeVisible();
      }
    }
  });
});
