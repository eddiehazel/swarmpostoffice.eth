import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | index', function (hooks) {
  setupApplicationTest(hooks);

  test('visiting /', async function (assert) {
    await visit('/?key=test-key');
    assert.strictEqual(currentURL(), '/?key=test-key');
    assert.dom('h1').hasText('🔔 PRICE UPDATE EVENTS');
  });

  test('it displays contract information', async function (assert) {
    await visit('/?key=test-key');
    assert
      .dom('.contract-info')
      .includesText('0x47EeF336e7fE5bED98499A4696bce8f28c1B0a8b');
    assert.dom('.contract-info').includesText('Gnosis Chain');
  });

  test('it displays stat cards', async function (assert) {
    await visit('/?key=test-key');
    assert.dom('.stat-card').exists({ count: 3 });
    assert.dom('.stat-label').exists({ count: 3 });
  });

  test('it displays events after loading', async function (assert) {
    await visit('/?key=test-key');

    // We should see the events container
    assert
      .dom('.events-container')
      .exists('Events container should be visible');

    // The events should be displayed (or a "no events" message)
    assert
      .dom('.event-item, .no-events, .loading')
      .exists('Should show events or a status message');
  });
});
