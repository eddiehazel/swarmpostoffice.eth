import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | event-item', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders event information', async function (assert) {
    this.set('event', {
      blockNumber: 12345,
      price: 1000,
      timestamp: 1609459200,
      txHash: '0x1234567890abcdef',
      percentageChange: 5.5,
      priceChange: 50
    });

    await render(hbs`
      <EventItem @event={{this.event}} @showChange={{true}} @isNew={{false}} />
    `);

    assert.dom('.event-time').exists();
    assert.dom('.price-badge').hasText(/Price:.*PLUR/);
    assert.dom('.detail-label').exists({ count: 4 });
  });

  test('it applies new-event class when isNew is true', async function (assert) {
    this.set('event', {
      blockNumber: 12345,
      price: 1000,
      timestamp: 1609459200,
      txHash: '0x1234567890abcdef',
      percentageChange: 0,
      priceChange: 0
    });

    await render(hbs`
      <EventItem @event={{this.event}} @showChange={{false}} @isNew={{true}} />
    `);

    assert.dom('.event-item.new-event').exists();
  });

  test('it shows change information when showChange is true', async function (assert) {
    this.set('event', {
      blockNumber: 12345,
      price: 1000,
      timestamp: 1609459200,
      txHash: '0x1234567890abcdef',
      percentageChange: 5.5,
      priceChange: 50
    });

    await render(hbs`
      <EventItem @event={{this.event}} @showChange={{true}} @isNew={{false}} />
    `);

    assert.dom('.detail-label').exists({ count: 4 });
  });
});


