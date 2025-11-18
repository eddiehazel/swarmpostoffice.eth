import { module, test } from 'qunit';
import {
  calculatePercentageChange,
  formatPrice,
  formatDateTime,
  parseEvent,
} from 'price-dashboard/utils/price-utils';

module('Unit | Utility | price-utils', function () {
  test('calculatePercentageChange calculates correctly', function (assert) {
    assert.strictEqual(calculatePercentageChange(100, 110), 10);
    assert.strictEqual(calculatePercentageChange(100, 90), -10);
    assert.strictEqual(calculatePercentageChange(100, 100), 0);
    assert.strictEqual(calculatePercentageChange(0, 100), 0);
  });

  test('formatPrice formats numbers with commas', function (assert) {
    assert.strictEqual(formatPrice(1000), '1,000');
    assert.strictEqual(formatPrice(1000000), '1,000,000');
    assert.strictEqual(formatPrice(123), '123');
  });

  test('formatDateTime formats timestamp correctly', function (assert) {
    const timestamp = 1609459200; // 2021-01-01 00:00:00 UTC
    const formatted = formatDateTime(timestamp);
    assert.ok(formatted.includes('Jan'));
    assert.ok(formatted.includes('2021'));
  });

  test('parseEvent parses event data correctly', function (assert) {
    const event = {
      blockNumber: '0x100',
      data: '0x3e8', // 1000
      timeStamp: '0x5f3d4800', // 1609459200
      transactionHash: '0x123',
    };

    const parsed = parseEvent(event, 900);
    assert.strictEqual(parsed.blockNumber, 256);
    assert.strictEqual(parsed.price, 1000);
    // 0x5f3d4800 = 1609459200 in decimal
    assert.strictEqual(parsed.timestamp, parseInt('0x5f3d4800', 16));
    assert.strictEqual(parsed.txHash, '0x123');
    assert.strictEqual(parsed.priceChange, 100);
    assert.ok(parsed.percentageChange > 0);
  });

  test('parseEvent handles null previous price', function (assert) {
    const event = {
      blockNumber: '0x100',
      data: '0x3e8',
      timeStamp: '0x5f3d4800',
      transactionHash: '0x123',
    };

    const parsed = parseEvent(event, null);
    assert.strictEqual(parsed.priceChange, 0);
    assert.strictEqual(parsed.percentageChange, 0);
  });
});
