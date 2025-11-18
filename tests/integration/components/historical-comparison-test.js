import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | historical-comparison', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders with historical data including new time periods', async function (assert) {
    const latestPrice = 1000000;
    const historical = {
      day: {
        price: 950000,
        blockNumber: 38000000,
        timestamp: 1700000000,
      },
      week: {
        price: 900000,
        blockNumber: 37900000,
        timestamp: 1699000000,
      },
      twoWeeks: {
        price: 850000,
        blockNumber: 37800000,
        timestamp: 1698000000,
      },
      month: {
        price: 800000,
        blockNumber: 37700000,
        timestamp: 1697000000,
      },
      threeMonths: {
        price: 700000,
        blockNumber: 37400000,
        timestamp: 1694000000,
      },
      sixMonths: {
        price: 600000,
        blockNumber: 37100000,
        timestamp: 1691000000,
      },
    };

    this.set('historical', historical);
    this.set('latestPrice', latestPrice);

    await render(
      hbs`<HistoricalComparison @historical={{this.historical}} @latestPrice={{this.latestPrice}} />`
    );

    // Check that all time period labels are rendered
    assert.dom('.stat-label').exists({ count: 6 });
    assert.dom('.stat-label:nth-of-type(1)').hasText('1 Day Ago');
    assert.dom('.stat-label:nth-of-type(2)').hasText('1 Week Ago');
    assert.dom('.stat-label:nth-of-type(3)').hasText('2 Weeks Ago');
    assert.dom('.stat-label:nth-of-type(4)').hasText('1 Month Ago');
    assert.dom('.stat-label:nth-of-type(5)').hasText('3 Months Ago');
    assert.dom('.stat-label:nth-of-type(6)').hasText('6 Months Ago');
  });

  test('it renders without historical data', async function (assert) {
    this.set('historical', null);
    this.set('latestPrice', 1000000);

    await render(
      hbs`<HistoricalComparison @historical={{this.historical}} @latestPrice={{this.latestPrice}} />`
    );

    // Should not render anything when no historical data
    assert.dom('.stat-card').doesNotExist();
  });

  test('it renders partial historical data', async function (assert) {
    const historical = {
      day: {
        price: 950000,
        blockNumber: 38000000,
        timestamp: 1700000000,
      },
      twoWeeks: {
        price: 850000,
        blockNumber: 37800000,
        timestamp: 1698000000,
      },
    };

    this.set('historical', historical);
    this.set('latestPrice', 1000000);

    await render(
      hbs`<HistoricalComparison @historical={{this.historical}} @latestPrice={{this.latestPrice}} />`
    );

    // Should render only available periods
    assert.dom('.stat-card').exists({ count: 2 });
    assert.dom('.stat-label').exists({ count: 2 });
  });
});
