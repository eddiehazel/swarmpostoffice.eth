# Playwright E2E Tests for Price Dashboard

This directory contains end-to-end tests for the Ember price dashboard using Playwright.

## Running in Claude Code Cloud Environment

These tests are optimized to run in the **Claude Code web environment** with:
- ✅ Headless Chromium browser (pre-installed)
- ✅ Ubuntu 24.04 LTS
- ✅ 30GB disk + 13GB RAM
- ✅ Node.js 22.21.1

## Test Scripts

```bash
# Run all E2E tests
npm run test:e2e

# Run with headed browser (won't work in cloud, use locally)
npm run test:e2e:headed

# Debug mode (step through tests)
npm run test:e2e:debug

# View HTML test report
npm run test:e2e:report

# Generate test code from browser actions (local dev)
npm run test:e2e:codegen

# Run both Ember and E2E tests
npm run test:all
```

## Test Files

### `dashboard.spec.js`
Tests core dashboard functionality:
- Page load and title
- Statistics section display
- Event list rendering
- Error handling
- Responsive design
- Accessibility basics

### `components.spec.js`
Tests individual components:
- Stat cards formatting
- Event list structure
- Historical comparison display
- Loading states
- Error states

### `interactions.spec.js`
Tests dynamic behavior:
- Auto-refresh functionality
- Responsive design across viewports
- Performance metrics
- Browser features (back/forward, reload)
- Memory leak prevention

## Configuration

See `playwright.config.js` in the root directory for:
- Test timeout settings (30s per test)
- Browser launch options (optimized for cloud sandbox)
- Web server configuration (auto-starts Ember dev server)
- Reporter settings (HTML, list, JSON)

## Cloud Environment Limitations

⚠️ **Screenshots**: May crash due to missing graphics libraries
⚠️ **Videos**: Disabled (not supported reliably in sandbox)
⚠️ **External HTTPS**: Certificate validation issues possible
⚠️ **Visual Testing**: Cannot visually inspect, use assertions instead

## Writing Tests

### Basic Test Structure

```javascript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?key=test_api_key');
    await page.waitForTimeout(2000); // Allow initial load
  });

  test('should do something', async ({ page }) => {
    // Your test code
    const element = page.locator('h1');
    await expect(element).toBeVisible();
  });
});
```

### Best Practices

1. **Always wait for load**: Use `waitForTimeout()` after navigation
2. **Check visibility**: Use `toBeVisible()` for rendered elements
3. **Handle API delays**: Tests account for async data fetching
4. **Test responsively**: Include mobile/tablet viewport tests
5. **Avoid screenshots**: They often crash in cloud environment
6. **Use text content**: Check `textContent()` instead of visual inspection

## CI/CD Integration

These tests are designed to run in CI environments:
- Retries: 2 attempts in CI mode
- Workers: 1 parallel worker in CI
- Timeout: 30s per test
- Reporters: HTML, list, and JSON output

## Debugging

If tests fail:

1. Check the console output for errors
2. Review `test-results/` directory
3. Open HTML report: `npm run test:e2e:report`
4. Look at `test-results.json` for detailed data

## API Key Testing

Tests use a mock API key (`test_api_key_12345`). The app should handle:
- Valid keys: Load data successfully
- Invalid keys: Show error state gracefully
- Missing keys: Display appropriate message

## Performance Expectations

- Initial page load: < 5 seconds
- Test execution: ~30 seconds per file
- Total suite: ~2-3 minutes

## Support

For issues with Playwright or these tests, check:
- [Playwright Documentation](https://playwright.dev)
- [Claude Code Documentation](https://docs.claude.com)
- Project GitHub issues
