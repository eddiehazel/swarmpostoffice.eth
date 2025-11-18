import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | format-price', function (hooks) {
  setupRenderingTest(hooks);

  test('it formats price with commas', async function (assert) {
    this.set('price', 1000);
    await render(hbs`{{format-price this.price}}`);
    assert.dom().hasText('1,000');
  });

  test('it handles null values', async function (assert) {
    this.set('price', null);
    await render(hbs`{{format-price this.price}}`);
    assert.dom().hasText('-');
  });

  test('it handles undefined values', async function (assert) {
    this.set('price', undefined);
    await render(hbs`{{format-price this.price}}`);
    assert.dom().hasText('-');
  });
});
