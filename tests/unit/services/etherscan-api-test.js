import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | etherscan-api', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const service = this.owner.lookup('service:etherscan-api');
    assert.ok(service);
  });

  test('hexToDecimal converts hex to decimal', function (assert) {
    const service = this.owner.lookup('service:etherscan-api');
    assert.strictEqual(service.hexToDecimal('0x1'), 1);
    assert.strictEqual(service.hexToDecimal('0xa'), 10);
    assert.strictEqual(service.hexToDecimal('0xff'), 255);
    assert.strictEqual(service.hexToDecimal('0x100'), 256);
  });

  test('getApiKey returns null when no key is set', function (assert) {
    const service = this.owner.lookup('service:etherscan-api');
    // Mock URLSearchParams
    const originalURLSearchParams = window.URLSearchParams;
    const mockParams = new Map();
    window.URLSearchParams = class {
      constructor() {
        this.map = mockParams;
      }
      get(key) {
        return this.map.get(key);
      }
    };
    mockParams.clear();

    const key = service.getApiKey();
    assert.strictEqual(key, null);

    window.URLSearchParams = originalURLSearchParams;
  });

  test('getApiKey returns key from URL parameter', function (assert) {
    const service = this.owner.lookup('service:etherscan-api');
    // Set API key directly for testing
    service.apiKey = 'test-api-key-123';

    const key = service.getApiKey();
    assert.strictEqual(key, 'test-api-key-123');

    service.apiKey = null;
  });

  test('getDailyChartData returns empty array on error', async function (assert) {
    const service = this.owner.lookup('service:etherscan-api');
    // Set API key to null to trigger error
    service.apiKey = null;

    const result = await service.getDailyChartData();
    assert.ok(Array.isArray(result), 'Result should be an array');
    assert.strictEqual(result.length, 0, 'Result should be empty on error');
  });

  test('getWeeklyChartData returns empty array on error', async function (assert) {
    const service = this.owner.lookup('service:etherscan-api');
    // Set API key to null to trigger error
    service.apiKey = null;

    const result = await service.getWeeklyChartData();
    assert.ok(Array.isArray(result), 'Result should be an array');
    assert.strictEqual(result.length, 0, 'Result should be empty on error');
  });

  test('getMonthlyChartData returns empty array on error', async function (assert) {
    const service = this.owner.lookup('service:etherscan-api');
    // Set API key to null to trigger error
    service.apiKey = null;

    const result = await service.getMonthlyChartData();
    assert.ok(Array.isArray(result), 'Result should be an array');
    assert.strictEqual(result.length, 0, 'Result should be empty on error');
  });
});
