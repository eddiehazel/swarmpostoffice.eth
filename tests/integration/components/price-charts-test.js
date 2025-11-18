import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, waitFor } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';

// Mock EtherscanApi service for testing
class MockEtherscanApiService extends Service {
  getDailyChartData() {
    return Promise.resolve([
      { date: new Date('2024-01-01'), price: 100, blockNumber: 1000 },
      { date: new Date('2024-01-02'), price: 110, blockNumber: 1001 },
    ]);
  }

  getWeeklyChartData() {
    return Promise.resolve([
      { date: new Date('2024-01-01'), price: 100, blockNumber: 1000 },
      { date: new Date('2024-01-08'), price: 120, blockNumber: 1002 },
    ]);
  }

  getMonthlyChartData() {
    return Promise.resolve([
      { date: new Date('2024-01-01'), price: 100, blockNumber: 1000 },
      { date: new Date('2024-02-01'), price: 150, blockNumber: 1003 },
    ]);
  }
}

class ErrorEtherscanApiService extends Service {
  getDailyChartData() {
    return Promise.reject(new Error('Test error'));
  }

  getWeeklyChartData() {
    return Promise.reject(new Error('Test error'));
  }

  getMonthlyChartData() {
    return Promise.reject(new Error('Test error'));
  }
}

module('Integration | Component | price-charts', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders with loading state initially', async function (assert) {
    this.owner.register('service:etherscan-api', MockEtherscanApiService);

    await render(hbs`<PriceCharts />`);

    // Check that the component renders
    assert.dom('.price-charts').exists();
  });

  test('it shows loading spinner while fetching data', async function (assert) {
    this.owner.register('service:etherscan-api', MockEtherscanApiService);

    const renderPromise = render(hbs`<PriceCharts />`);

    // Should show loading state
    assert.dom('.charts-loading').exists();
    assert.dom('.loading-spinner').exists();

    await renderPromise;
  });

  test('it renders chart containers after loading', async function (assert) {
    this.owner.register('service:etherscan-api', MockEtherscanApiService);

    await render(hbs`<PriceCharts />`);

    // Wait for the charts to load
    await waitFor('.charts-grid', { timeout: 5000 });

    assert.dom('.charts-grid').exists();
    assert.dom('.chart-container').exists({ count: 3 });
    assert.dom('#daily-chart').exists();
    assert.dom('#weekly-chart').exists();
    assert.dom('#monthly-chart').exists();
  });

  test('it shows error message when data fetching fails', async function (assert) {
    this.owner.register('service:etherscan-api', ErrorEtherscanApiService);

    await render(hbs`<PriceCharts />`);

    // Wait for error state
    await waitFor('.charts-error', { timeout: 5000 });

    assert.dom('.charts-error').exists();
    assert.dom('.charts-error').containsText('Error loading charts');
  });

  test('it has correct CSS classes', async function (assert) {
    this.owner.register('service:etherscan-api', MockEtherscanApiService);

    await render(hbs`<PriceCharts />`);

    assert.dom('.price-charts').exists();
    assert.dom('.price-charts').hasClass('price-charts');
  });
});
