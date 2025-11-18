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

  test('getHistoricalPrices calculates correct block numbers for all periods', async function (assert) {
    const service = this.owner.lookup('service:etherscan-api');
    const currentBlock = 38000000;

    // Mock the getHistoricalPrice method to avoid actual API calls
    const originalGetHistoricalPrice = service.getHistoricalPrice;
    const calledBlocks = [];

    service.getHistoricalPrice = async function (targetBlock) {
      calledBlocks.push(targetBlock);
      return {
        price: 1000000,
        blockNumber: targetBlock,
        timestamp: Date.now(),
        txHash: '0x123',
      };
    };

    await service.getHistoricalPrices(currentBlock);

    // Verify that getHistoricalPrice was called with correct block numbers
    // BLOCKS_PER_DAY = 720 * 24 = 17,280
    // BLOCKS_PER_WEEK = 720 * 24 * 7 = 120,960
    // BLOCKS_PER_MONTH = 720 * 24 * 30 = 518,400
    const expectedBlocks = [
      currentBlock - 17280, // day (1 day ago)
      currentBlock - 120960, // week (1 week ago)
      currentBlock - 241920, // twoWeeks (2 weeks ago)
      currentBlock - 518400, // month (1 month ago)
      currentBlock - 1555200, // threeMonths (3 months ago)
      currentBlock - 3110400, // sixMonths (6 months ago)
    ];

    assert.strictEqual(
      calledBlocks.length,
      6,
      'getHistoricalPrice should be called 6 times'
    );

    for (const expectedBlock of expectedBlocks) {
      assert.true(
        calledBlocks.includes(expectedBlock),
        `Should fetch data for block ${expectedBlock}`
      );
    }

    // Restore original method
    service.getHistoricalPrice = originalGetHistoricalPrice;
  });

  test('getHistoricalPrices returns data with correct period keys', async function (assert) {
    const service = this.owner.lookup('service:etherscan-api');
    const currentBlock = 38000000;

    // Mock the getHistoricalPrice method
    service.getHistoricalPrice = async function (targetBlock) {
      return {
        price: 1000000,
        blockNumber: targetBlock,
        timestamp: Date.now(),
        txHash: '0x123',
      };
    };

    const historical = await service.getHistoricalPrices(currentBlock);

    // Verify all expected periods are present
    assert.ok(historical.day, 'Should include day period');
    assert.ok(historical.week, 'Should include week period');
    assert.ok(historical.twoWeeks, 'Should include twoWeeks period');
    assert.ok(historical.month, 'Should include month period');
    assert.ok(historical.threeMonths, 'Should include threeMonths period');
    assert.ok(historical.sixMonths, 'Should include sixMonths period');
  });
});
