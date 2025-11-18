import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | stat-card', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders label and value', async function (assert) {
    await render(hbs`
      <StatCard @label="Test Label" @value="Test Value" />
    `);

    assert.dom('.stat-label').hasText('Test Label');
    assert.dom('.stat-value').hasText('Test Value');
  });

  test('it has correct CSS classes', async function (assert) {
    await render(hbs`
      <StatCard @label="Label" @value="Value" />
    `);

    assert.dom('.stat-card').exists();
    assert.dom('.stat-label').exists();
    assert.dom('.stat-value').exists();
  });
});
