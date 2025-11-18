import { module, test } from 'qunit';
import { visit, currentURL, waitFor, settled } from '@ember/test-helpers';
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

  test('it shows loading screen initially then displays data', async function (assert) {
    // Start visit but don't await it immediately
    const visitPromise = visit('/?key=test-key');

    // Check that loading screen is visible
    // Note: We need to wait a tick for the route to start rendering
    await waitFor('.loading-screen-overlay', { timeout: 1000 });
    assert
      .dom('.loading-screen-overlay')
      .exists('Loading screen should appear');
    assert
      .dom('.glitch-text')
      .hasText(
        'INITIALIZING POSTAL NETWORK',
        'Loading screen has postal theme'
      );
    assert
      .dom('.loading-stat-card')
      .exists({ count: 3 }, 'Loading screen shows 3 skeleton stat cards');
    assert
      .dom('.loading-event-item')
      .exists({ count: 5 }, 'Loading screen shows 5 skeleton event items');

    // Wait for the visit to complete (data loaded)
    await visitPromise;
    await settled();

    // Check that loading screen is gone
    assert
      .dom('.loading-screen-overlay')
      .doesNotExist('Loading screen should disappear after data loads');

    // Check that actual content is displayed
    assert.dom('.container').exists('Main container should be visible');
    assert.dom('h1').hasText('🔔 PRICE UPDATE EVENTS');
    assert
      .dom('.stat-card')
      .exists({ count: 3 }, 'Should show 3 actual stat cards');
  });

  test('it displays events after loading', async function (assert) {
    await visit('/?key=test-key');

    // After loading completes, we should not see the loading screen
    assert
      .dom('.loading-screen-overlay')
      .doesNotExist('Loading screen should not be visible');

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
