import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | index', function (hooks) {
  setupApplicationTest(hooks);

  test('visiting /', async function (assert) {
    await visit('/?key=test-key');
    assert.strictEqual(currentURL(), '/?key=test-key');
    assert.dom('h1').hasText('📬 Price Update Events Dashboard');
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
});
