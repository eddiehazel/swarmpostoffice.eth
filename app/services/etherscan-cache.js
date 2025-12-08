import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

/**
 * Service to cache Etherscan API responses in localStorage
 * Tracks which block ranges have been fetched to minimize API calls
 */
export default class EtherscanCacheService extends Service {
  @tracked cacheVersion = '1.0.0';

  // Cache keys
  CACHE_KEY_EVENTS = 'etherscan-cache-events';
  CACHE_KEY_BLOCK_RANGES = 'etherscan-cache-block-ranges';
  CACHE_KEY_CURRENT_BLOCK = 'etherscan-cache-current-block';
  CACHE_KEY_HISTORICAL_PRICES = 'etherscan-cache-historical-prices';

  // Cache TTL in milliseconds
  CURRENT_BLOCK_TTL = 30 * 1000; // 30 seconds (blocks change frequently)
  HISTORICAL_PRICE_TTL = 24 * 60 * 60 * 1000; // 24 hours (historical data is immutable)

  /**
   * Get all cached events
   * @returns {Array} Array of event objects
   */
  getEvents() {
    try {
      const data = localStorage.getItem(this.CACHE_KEY_EVENTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading events from cache:', error);
      return [];
    }
  }

  /**
   * Get cached block ranges that have been fetched
   * @returns {Array} Array of {fromBlock, toBlock} objects
   */
  getBlockRanges() {
    try {
      const data = localStorage.getItem(this.CACHE_KEY_BLOCK_RANGES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading block ranges from cache:', error);
      return [];
    }
  }

  /**
   * Get cached current block with timestamp
   * @returns {Object|null} {number, timestamp} or null if expired/missing
   */
  getCurrentBlock() {
    try {
      const data = localStorage.getItem(this.CACHE_KEY_CURRENT_BLOCK);
      if (!data) return null;

      const cached = JSON.parse(data);
      const now = Date.now();

      // Check if cache is still valid
      if (now - cached.timestamp > this.CURRENT_BLOCK_TTL) {
        return null;
      }

      return cached;
    } catch (error) {
      console.error('Error reading current block from cache:', error);
      return null;
    }
  }

  /**
   * Get cached historical price for a specific block
   * @param {number} blockNumber - The block number
   * @returns {Object|null} Historical price data or null if not cached
   */
  getHistoricalPrice(blockNumber) {
    try {
      const data = localStorage.getItem(this.CACHE_KEY_HISTORICAL_PRICES);
      if (!data) return null;

      const prices = JSON.parse(data);
      const cached = prices[blockNumber];

      if (!cached) return null;

      const now = Date.now();
      // Historical data is immutable, but we'll expire it after TTL for freshness
      if (now - cached.timestamp > this.HISTORICAL_PRICE_TTL) {
        return null;
      }

      return cached.data;
    } catch (error) {
      console.error('Error reading historical price from cache:', error);
      return null;
    }
  }

  /**
   * Store events in cache
   * @param {Array} events - Array of event objects
   */
  setEvents(events) {
    try {
      localStorage.setItem(this.CACHE_KEY_EVENTS, JSON.stringify(events));
    } catch (error) {
      console.error('Error storing events in cache:', error);
    }
  }

  /**
   * Add a block range to the cache
   * @param {number} fromBlock - Start block
   * @param {number} toBlock - End block
   */
  addBlockRange(fromBlock, toBlock) {
    try {
      const ranges = this.getBlockRanges();

      // Merge overlapping or adjacent ranges
      const merged = this._mergeBlockRanges([
        ...ranges,
        { fromBlock, toBlock },
      ]);

      localStorage.setItem(this.CACHE_KEY_BLOCK_RANGES, JSON.stringify(merged));
    } catch (error) {
      console.error('Error storing block range in cache:', error);
    }
  }

  /**
   * Store current block number
   * @param {number} blockNumber - Current block number
   */
  setCurrentBlock(blockNumber) {
    try {
      const data = {
        number: blockNumber,
        timestamp: Date.now(),
      };
      localStorage.setItem(this.CACHE_KEY_CURRENT_BLOCK, JSON.stringify(data));
    } catch (error) {
      console.error('Error storing current block in cache:', error);
    }
  }

  /**
   * Store historical price data
   * @param {number} blockNumber - Block number
   * @param {Object} priceData - Historical price data
   */
  setHistoricalPrice(blockNumber, priceData) {
    try {
      const data = localStorage.getItem(this.CACHE_KEY_HISTORICAL_PRICES);
      const prices = data ? JSON.parse(data) : {};

      prices[blockNumber] = {
        data: priceData,
        timestamp: Date.now(),
      };

      localStorage.setItem(
        this.CACHE_KEY_HISTORICAL_PRICES,
        JSON.stringify(prices)
      );
    } catch (error) {
      console.error('Error storing historical price in cache:', error);
    }
  }

  /**
   * Add events to existing cache (merge and deduplicate)
   * @param {Array} newEvents - New events to add
   */
  addEvents(newEvents) {
    try {
      const existingEvents = this.getEvents();

      // Create a map for deduplication using transactionHash as key
      const eventMap = new Map();

      // Add existing events
      existingEvents.forEach((event) => {
        eventMap.set(event.transactionHash, event);
      });

      // Add new events (will overwrite duplicates)
      newEvents.forEach((event) => {
        eventMap.set(event.transactionHash, event);
      });

      // Convert back to array and sort by block number (descending)
      const mergedEvents = Array.from(eventMap.values()).sort(
        (a, b) => b.blockNumber - a.blockNumber
      );

      this.setEvents(mergedEvents);
    } catch (error) {
      console.error('Error adding events to cache:', error);
    }
  }

  /**
   * Check if a block range is fully covered by cache
   * @param {number} fromBlock - Start block
   * @param {number} toBlock - End block
   * @returns {boolean} True if range is fully cached
   */
  isRangeCached(fromBlock, toBlock) {
    const ranges = this.getBlockRanges();

    // Check if the requested range is covered by any cached range
    return ranges.some(
      (range) => range.fromBlock <= fromBlock && range.toBlock >= toBlock
    );
  }

  /**
   * Get missing block ranges that need to be fetched
   * @param {number} fromBlock - Desired start block
   * @param {number} toBlock - Desired end block
   * @returns {Array} Array of {fromBlock, toBlock} ranges that need fetching
   */
  getMissingRanges(fromBlock, toBlock) {
    const cachedRanges = this.getBlockRanges();

    if (cachedRanges.length === 0) {
      return [{ fromBlock, toBlock }];
    }

    // Sort cached ranges by fromBlock
    const sortedRanges = [...cachedRanges].sort(
      (a, b) => a.fromBlock - b.fromBlock
    );

    const missingRanges = [];
    let currentFrom = fromBlock;

    for (const range of sortedRanges) {
      // Skip ranges that don't overlap with our request
      if (range.toBlock < fromBlock || range.fromBlock > toBlock) {
        continue;
      }

      // If there's a gap before this cached range
      if (currentFrom < range.fromBlock) {
        missingRanges.push({
          fromBlock: currentFrom,
          toBlock: Math.min(range.fromBlock - 1, toBlock),
        });
      }

      // Move currentFrom forward
      currentFrom = Math.max(currentFrom, range.toBlock + 1);

      // If we've covered the entire requested range
      if (currentFrom > toBlock) {
        break;
      }
    }

    // If there's still a gap at the end
    if (currentFrom <= toBlock) {
      missingRanges.push({
        fromBlock: currentFrom,
        toBlock: toBlock,
      });
    }

    return missingRanges;
  }

  /**
   * Get events from cache for a specific block range
   * @param {number} fromBlock - Start block
   * @param {number} toBlock - End block
   * @returns {Array} Filtered events within the range
   */
  getEventsInRange(fromBlock, toBlock) {
    const allEvents = this.getEvents();

    return allEvents.filter(
      (event) => event.blockNumber >= fromBlock && event.blockNumber <= toBlock
    );
  }

  /**
   * Clear all cache data
   */
  clearCache() {
    try {
      localStorage.removeItem(this.CACHE_KEY_EVENTS);
      localStorage.removeItem(this.CACHE_KEY_BLOCK_RANGES);
      localStorage.removeItem(this.CACHE_KEY_CURRENT_BLOCK);
      localStorage.removeItem(this.CACHE_KEY_HISTORICAL_PRICES);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Merge overlapping or adjacent block ranges
   * @private
   * @param {Array} ranges - Array of {fromBlock, toBlock} objects
   * @returns {Array} Merged ranges
   */
  _mergeBlockRanges(ranges) {
    if (ranges.length === 0) return [];

    // Sort ranges by fromBlock
    const sorted = [...ranges].sort((a, b) => a.fromBlock - b.fromBlock);

    const merged = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
      const current = sorted[i];
      const last = merged[merged.length - 1];

      // Check if ranges overlap or are adjacent (allowing 1 block gap for efficiency)
      if (current.fromBlock <= last.toBlock + 1) {
        // Merge ranges
        last.toBlock = Math.max(last.toBlock, current.toBlock);
      } else {
        // Add as new range
        merged.push(current);
      }
    }

    return merged;
  }

  /**
   * Get cache statistics for debugging
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    const events = this.getEvents();
    const ranges = this.getBlockRanges();
    const currentBlock = this.getCurrentBlock();

    let totalBlocksCached = 0;
    ranges.forEach((range) => {
      totalBlocksCached += range.toBlock - range.fromBlock + 1;
    });

    return {
      totalEvents: events.length,
      totalRanges: ranges.length,
      totalBlocksCached,
      currentBlockCached: currentBlock !== null,
      ranges: ranges.map((r) => `${r.fromBlock}-${r.toBlock}`),
    };
  }
}
