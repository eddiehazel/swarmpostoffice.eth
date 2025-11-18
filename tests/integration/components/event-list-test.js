import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | event-list', function (hooks) {
  setupRenderingTest(hooks);

  test('it shows loading state', async function (assert) {
    await render(hbs`
      <EventList @events={{array}} @isLoading={{true}} @error={{null}} @newEventHashes={{array}} />
    `);

    assert.dom('.loading').exists();
    assert.dom('.spinner').exists();
  });

  test('it shows error message', async function (assert) {
    await render(hbs`
      <EventList @events={{array}} @isLoading={{false}} @error="Test error" @newEventHashes={{array}} />
    `);

    assert.dom('.error').exists();
    assert.dom('.error').includesText('Test error');
  });

  test('it shows no events message', async function (assert) {
    this.set('events', []);
    await render(hbs`
      <EventList @events={{this.events}} @isLoading={{false}} @error={{null}} @newEventHashes={{array}} />
    `);

    assert.dom('.no-events').exists();
  });

  test('it renders events', async function (assert) {
    this.set('events', [
      {
        blockNumber: 12345,
        price: 1000,
        timestamp: 1609459200,
        txHash: '0x123',
        percentageChange: 0,
        priceChange: 0,
      },
    ]);

    await render(hbs`
      <EventList @events={{this.events}} @isLoading={{false}} @error={{null}} @newEventHashes={{array}} />
    `);

    assert.dom('.event-item').exists({ count: 1 });
  });
});
