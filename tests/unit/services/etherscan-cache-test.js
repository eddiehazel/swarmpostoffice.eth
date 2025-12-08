import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | etherscan-cache', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    // Clear localStorage before each test
    localStorage.clear();
  });

  test('it exists', function (assert) {
    const service = this.owner.lookup('service:etherscan-cache');
    assert.ok(service);
  });

  test('getEvents returns empty array when no cache', function (assert) {
    const service = this.owner.lookup('service:etherscan-cache');
    const events = service.getEvents();
    assert.deepEqual(events, []);
  });

  test('setEvents and getEvents work correctly', function (assert) {
    const service = this.owner.lookup('service:etherscan-cache');
    const testEvents = [
      {
        blockNumber: 12345,
        data: 67890,
        timeStamp: 1234567890,
        transactionHash: '0xabc123',
      },
      {
        blockNumber: 12346,
        data: 67891,
        timeStamp: 1234567891,
        transactionHash: '0xdef456',
      },
    ];

    service.setEvents(testEvents);
    const retrieved = service.getEvents();

    assert.deepEqual(retrieved, testEvents);
  });

  test('addEvents merges and deduplicates events', function (assert) {
    const service = this.owner.lookup('service:etherscan-cache');

    const firstBatch = [
      {
        blockNumber: 12345,
        data: 100,
        timeStamp: 1000,
        transactionHash: '0xabc123',
      },
    ];

    const secondBatch = [
      {
        blockNumber: 12345,
        data: 100,
        timeStamp: 1000,
        transactionHash: '0xabc123',
      }, // Duplicate
      {
        blockNumber: 12346,
        data: 200,
        timeStamp: 2000,
        transactionHash: '0xdef456',
      }, // New
    ];

    service.addEvents(firstBatch);
    service.addEvents(secondBatch);

    const events = service.getEvents();
    assert.strictEqual(events.length, 2, 'Should have 2 unique events');
    assert.strictEqual(
      events[0].blockNumber,
      12346,
      'Should be sorted by block number descending'
    );
    assert.strictEqual(events[1].blockNumber, 12345);
  });

  test('addBlockRange stores ranges correctly', function (assert) {
    const service = this.owner.lookup('service:etherscan-cache');

    service.addBlockRange(1000, 2000);
    const ranges = service.getBlockRanges();

    assert.strictEqual(ranges.length, 1);
    assert.strictEqual(ranges[0].fromBlock, 1000);
    assert.strictEqual(ranges[0].toBlock, 2000);
  });

  test('addBlockRange merges overlapping ranges', function (assert) {
    const service = this.owner.lookup('service:etherscan-cache');

    service.addBlockRange(1000, 2000);
    service.addBlockRange(1500, 2500); // Overlaps with first range

    const ranges = service.getBlockRanges();

    assert.strictEqual(ranges.length, 1, 'Should merge overlapping ranges');
    assert.strictEqual(ranges[0].fromBlock, 1000);
    assert.strictEqual(ranges[0].toBlock, 2500);
  });

  test('addBlockRange merges adjacent ranges', function (assert) {
    const service = this.owner.lookup('service:etherscan-cache');

    service.addBlockRange(1000, 2000);
    service.addBlockRange(2001, 3000); // Adjacent to first range

    const ranges = service.getBlockRanges();

    assert.strictEqual(ranges.length, 1, 'Should merge adjacent ranges');
    assert.strictEqual(ranges[0].fromBlock, 1000);
    assert.strictEqual(ranges[0].toBlock, 3000);
  });

  test('getCurrentBlock returns null when cache is empty', function (assert) {
    const service = this.owner.lookup('service:etherscan-cache');
    const cached = service.getCurrentBlock();
    assert.strictEqual(cached, null);
  });

  test('setCurrentBlock and getCurrentBlock work correctly', function (assert) {
    const service = this.owner.lookup('service:etherscan-cache');

    service.setCurrentBlock(12345);
    const cached = service.getCurrentBlock();

    assert.ok(cached);
    assert.strictEqual(cached.number, 12345);
    assert.ok(cached.timestamp);
  });

  test('getCurrentBlock returns null after TTL expires', function (assert) {
    const service = this.owner.lookup('service:etherscan-cache');

    // Set a very short TTL for testing
    service.CURRENT_BLOCK_TTL = 10; // 10ms

    service.setCurrentBlock(12345);

    // Immediately should be cached
    let cached = service.getCurrentBlock();
    assert.ok(cached);

    // Wait for TTL to expire
    const done = assert.async();
    setTimeout(() => {
      cached = service.getCurrentBlock();
      assert.strictEqual(cached, null, 'Cache should expire after TTL');
      done();
    }, 20);
  });

  test('isRangeCached returns true for cached range', function (assert) {
    const service = this.owner.lookup('service:etherscan-cache');

    service.addBlockRange(1000, 2000);

    assert.true(service.isRangeCached(1000, 2000));
    assert.true(service.isRangeCached(1100, 1900)); // Subset
    assert.false(service.isRangeCached(1000, 2500)); // Extends beyond cache
    assert.false(service.isRangeCached(500, 1500)); // Starts before cache
  });

  test('getMissingRanges returns full range when nothing cached', function (assert) {
    const service = this.owner.lookup('service:etherscan-cache');

    const missing = service.getMissingRanges(1000, 2000);

    assert.strictEqual(missing.length, 1);
    assert.strictEqual(missing[0].fromBlock, 1000);
    assert.strictEqual(missing[0].toBlock, 2000);
  });

  test('getMissingRanges returns empty array when fully cached', function (assert) {
    const service = this.owner.lookup('service:etherscan-cache');

    service.addBlockRange(1000, 2000);

    const missing = service.getMissingRanges(1100, 1900);

    assert.strictEqual(missing.length, 0);
  });

  test('getMissingRanges returns correct gaps', function (assert) {
    const service = this.owner.lookup('service:etherscan-cache');

    service.addBlockRange(1000, 1500);
    service.addBlockRange(2000, 2500);

    const missing = service.getMissingRanges(500, 3000);

    assert.strictEqual(missing.length, 3);
    assert.strictEqual(missing[0].fromBlock, 500);
    assert.strictEqual(missing[0].toBlock, 999);
    assert.strictEqual(missing[1].fromBlock, 1501);
    assert.strictEqual(missing[1].toBlock, 1999);
    assert.strictEqual(missing[2].fromBlock, 2501);
    assert.strictEqual(missing[2].toBlock, 3000);
  });

  test('getEventsInRange filters events correctly', function (assert) {
    const service = this.owner.lookup('service:etherscan-cache');

    const events = [
      {
        blockNumber: 1000,
        data: 100,
        timeStamp: 1000,
        transactionHash: '0x1',
      },
      {
        blockNumber: 1500,
        data: 150,
        timeStamp: 1500,
        transactionHash: '0x2',
      },
      {
        blockNumber: 2000,
        data: 200,
        timeStamp: 2000,
        transactionHash: '0x3',
      },
      {
        blockNumber: 2500,
        data: 250,
        timeStamp: 2500,
        transactionHash: '0x4',
      },
    ];

    service.setEvents(events);

    const filtered = service.getEventsInRange(1200, 2200);

    assert.strictEqual(filtered.length, 2);
    assert.strictEqual(filtered[0].blockNumber, 1500);
    assert.strictEqual(filtered[1].blockNumber, 2000);
  });

  test('clearCache removes all cached data', function (assert) {
    const service = this.owner.lookup('service:etherscan-cache');

    service.setCurrentBlock(12345);
    service.addBlockRange(1000, 2000);
    service.addEvents([
      {
        blockNumber: 1500,
        data: 100,
        timeStamp: 1000,
        transactionHash: '0x1',
      },
    ]);

    service.clearCache();

    assert.strictEqual(service.getCurrentBlock(), null);
    assert.deepEqual(service.getBlockRanges(), []);
    assert.deepEqual(service.getEvents(), []);
  });

  test('setHistoricalPrice and getHistoricalPrice work correctly', function (assert) {
    const service = this.owner.lookup('service:etherscan-cache');

    const priceData = {
      price: 12345,
      blockNumber: 67890,
      timestamp: 1234567890,
      txHash: '0xabc123',
    };

    service.setHistoricalPrice(67890, priceData);
    const cached = service.getHistoricalPrice(67890);

    assert.deepEqual(cached, priceData);
  });

  test('getHistoricalPrice returns null for uncached block', function (assert) {
    const service = this.owner.lookup('service:etherscan-cache');

    const cached = service.getHistoricalPrice(12345);

    assert.strictEqual(cached, null);
  });

  test('getCacheStats returns correct statistics', function (assert) {
    const service = this.owner.lookup('service:etherscan-cache');

    service.setCurrentBlock(12345);
    service.addBlockRange(1000, 1100); // 101 blocks
    service.addBlockRange(2000, 2050); // 51 blocks
    service.addEvents([
      {
        blockNumber: 1000,
        data: 100,
        timeStamp: 1000,
        transactionHash: '0x1',
      },
      {
        blockNumber: 2000,
        data: 200,
        timeStamp: 2000,
        transactionHash: '0x2',
      },
    ]);

    const stats = service.getCacheStats();

    assert.strictEqual(stats.totalEvents, 2);
    assert.strictEqual(stats.totalRanges, 2);
    assert.strictEqual(stats.totalBlocksCached, 152); // 101 + 51
    assert.true(stats.currentBlockCached);
    assert.strictEqual(stats.ranges.length, 2);
  });
});
