import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

const CONTRACT_ADDRESS = '0x47EeF336e7fE5bED98499A4696bce8f28c1B0a8b';
const API_BASE = 'https://api.etherscan.io/v2/api';
const CHAIN_ID = 100; // Gnosis Chain
const PRICE_UPDATE_TOPIC =
  '0xae46785019700e30375a5d7b4f91e32f8060ef085111f896ebf889450aa2ab5a';
const DEPLOYMENT_BLOCK = 37339192;
const BLOCKS_PER_HOUR = 720;
const BLOCKS_PER_DAY = BLOCKS_PER_HOUR * 24;
const BLOCKS_PER_WEEK = BLOCKS_PER_DAY * 7;
const BLOCKS_PER_MONTH = BLOCKS_PER_DAY * 30;

export default class EtherscanApiService extends Service {
  @tracked apiKey = null;

  // Cache for historical price data
  // Key: block number, Value: { data, timestamp }
  priceCache = new Map();

  // Cache TTL: 5 minutes (historical data doesn't change)
  CACHE_TTL = 5 * 60 * 1000;

  // localStorage key for persisting cache
  CACHE_STORAGE_KEY = 'etherscan-price-cache';

  constructor() {
    super(...arguments);
    this.loadCacheFromStorage();
    console.log(
      `[Service] EtherscanApiService initialized with ${this.priceCache.size} cached entries from localStorage`
    );
  }

  /**
   * Load cache from localStorage
   */
  loadCacheFromStorage() {
    if (typeof window === 'undefined' || !window.localStorage) return;

    try {
      const stored = localStorage.getItem(this.CACHE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert plain object back to Map
        Object.entries(parsed).forEach(([key, value]) => {
          this.priceCache.set(parseInt(key), value);
        });
        console.log(
          `[Cache] Loaded ${this.priceCache.size} entries from localStorage`
        );
      }
    } catch (error) {
      console.error('[Cache] Error loading from localStorage:', error);
    }
  }

  /**
   * Save cache to localStorage
   */
  saveCacheToStorage() {
    if (typeof window === 'undefined' || !window.localStorage) return;

    try {
      // Convert Map to plain object for JSON serialization
      const obj = {};
      this.priceCache.forEach((value, key) => {
        obj[key] = value;
      });
      localStorage.setItem(this.CACHE_STORAGE_KEY, JSON.stringify(obj));
    } catch (error) {
      console.error('[Cache] Error saving to localStorage:', error);
    }
  }

  /**
   * Get API key from URL parameter or environment
   */
  getApiKey() {
    if (this.apiKey) {
      return this.apiKey;
    }

    // Try to get from URL params
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const key = params.get('key');
      if (key) {
        this.apiKey = key;
        return key;
      }
    }

    return null;
  }

  /**
   * Convert hex string to decimal number
   */
  hexToDecimal(hex) {
    return parseInt(hex, 16);
  }

  /**
   * Check if cached data is still valid
   */
  isCacheValid(cacheEntry) {
    if (!cacheEntry) return false;
    return Date.now() - cacheEntry.timestamp < this.CACHE_TTL;
  }

  /**
   * Get cached price data for a block
   */
  getCachedPrice(blockNumber) {
    const cacheEntry = this.priceCache.get(blockNumber);
    if (this.isCacheValid(cacheEntry)) {
      // Return the cached data even if it's null
      // We use undefined to indicate cache miss, null means "no data found"
      return cacheEntry.data === null ? null : cacheEntry.data;
    }
    // Clean up expired entry
    if (cacheEntry) {
      this.priceCache.delete(blockNumber);
    }
    return undefined; // Cache miss
  }

  /**
   * Cache price data for a block
   */
  setCachedPrice(blockNumber, data) {
    this.priceCache.set(blockNumber, {
      data,
      timestamp: Date.now(),
    });
    // Persist to localStorage
    this.saveCacheToStorage();
  }

  /**
   * Get current block number
   */
  async getCurrentBlock() {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('API key is required. Add ?key=YOUR_KEY to the URL.');
    }

    try {
      const url = `${API_BASE}?chainid=${CHAIN_ID}&module=proxy&action=eth_blockNumber&apikey=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.result) {
        return this.hexToDecimal(data.result);
      }
      throw new Error(data.message || 'Failed to fetch current block');
    } catch (error) {
      console.error('Error fetching current block:', error);
      throw error;
    }
  }

  /**
   * Fetch price update events
   */
  async fetchPriceEvents(maxEvents = 50) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('API key is required. Add ?key=YOUR_KEY to the URL.');
    }

    try {
      const currentBlock = await this.getCurrentBlock();
      const fromBlock = Math.max(DEPLOYMENT_BLOCK, currentBlock - 50000);

      const url = `${API_BASE}?chainid=${CHAIN_ID}&module=logs&action=getLogs&fromBlock=${fromBlock}&toBlock=${currentBlock}&address=${CONTRACT_ADDRESS}&topic0=${PRICE_UPDATE_TOPIC}&page=1&offset=1000&apikey=${apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === '1' && Array.isArray(data.result)) {
        // Sort by block number descending and take the last maxEvents
        const sortedEvents = data.result.sort(
          (a, b) =>
            this.hexToDecimal(b.blockNumber) - this.hexToDecimal(a.blockNumber)
        );
        return {
          events: sortedEvents.slice(0, maxEvents),
          currentBlock,
        };
      } else if (data.result && typeof data.result === 'string') {
        throw new Error(data.result);
      } else {
        throw new Error(data.message || 'Failed to fetch events');
      }
    } catch (error) {
      console.error('Error fetching price events:', error);
      throw error;
    }
  }

  /**
   * Get historical price data for a specific block range
   */
  async getHistoricalPrice(targetBlock) {
    // Check cache first
    const cached = this.getCachedPrice(targetBlock);
    if (cached !== undefined) {
      console.log(
        `[Cache HIT] Block ${targetBlock}`,
        cached ? `(Price: ${(cached.price / 1e18).toFixed(6)})` : '(null)'
      );
      return cached; // Could be null or actual data
    }

    console.log(
      `[Cache MISS] Block ${targetBlock} - Fetching from API (Cache has ${this.priceCache.size} entries)`
    );

    const apiKey = this.getApiKey();
    if (!apiKey) {
      return null;
    }

    try {
      const fromBlock = Math.max(DEPLOYMENT_BLOCK, targetBlock - 500);
      const toBlock = targetBlock + 500;

      const url = `${API_BASE}?chainid=${CHAIN_ID}&module=logs&action=getLogs&fromBlock=${fromBlock}&toBlock=${toBlock}&address=${CONTRACT_ADDRESS}&topic0=${PRICE_UPDATE_TOPIC}&page=1&offset=100&apikey=${apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (
        data.status === '1' &&
        Array.isArray(data.result) &&
        data.result.length > 0
      ) {
        // Find the closest event to the target block
        let closestEvent = null;
        let minDiff = Infinity;

        for (const event of data.result) {
          const eventBlock = this.hexToDecimal(event.blockNumber);
          const diff = Math.abs(eventBlock - targetBlock);
          if (diff < minDiff) {
            minDiff = diff;
            closestEvent = event;
          }
        }

        if (closestEvent) {
          const priceData = {
            price: this.hexToDecimal(closestEvent.data),
            blockNumber: this.hexToDecimal(closestEvent.blockNumber),
            timestamp: this.hexToDecimal(closestEvent.timeStamp),
            txHash: closestEvent.transactionHash,
          };

          // Cache the result
          this.setCachedPrice(targetBlock, priceData);

          return priceData;
        }
      }

      // Cache null results too to avoid repeated failed requests
      this.setCachedPrice(targetBlock, null);
      return null;
    } catch (error) {
      console.error(
        `Error fetching historical price for block ${targetBlock}:`,
        error
      );
      return null;
    }
  }

  /**
   * Get historical prices for multiple periods
   */
  async getHistoricalPrices(currentBlock) {
    const periods = {
      week: currentBlock - BLOCKS_PER_WEEK,
      month: currentBlock - BLOCKS_PER_MONTH,
      threeMonths: currentBlock - BLOCKS_PER_MONTH * 3,
      sixMonths: currentBlock - BLOCKS_PER_MONTH * 6,
    };

    const historical = {};

    for (const [period, targetBlock] of Object.entries(periods)) {
      const data = await this.getHistoricalPrice(targetBlock);
      if (data) {
        historical[period] = data;
      }
    }

    return historical;
  }

  /**
   * Get daily prices for the last 30 days
   */
  async getDailyPricesForMonth(currentBlock) {
    const dailyPrices = [];
    let lastKnownPrice = null;

    // Snap current block to 5-minute intervals (60 blocks at 720 blocks/hour)
    // This ensures we request the same blocks for ~5 minutes, maximizing cache hits
    const SNAP_INTERVAL = 60;
    const snappedCurrentBlock =
      Math.floor(currentBlock / SNAP_INTERVAL) * SNAP_INTERVAL;

    // Calculate current timestamp once
    const now = Math.floor(Date.now() / 1000);

    console.log(
      `[Cache] getDailyPricesForMonth - Current: ${currentBlock} → Snapped: ${snappedCurrentBlock}, Cache: ${this.priceCache.size} entries`
    );

    // Fetch price for each of the last 30 days
    // Process from OLDEST to NEWEST to properly forward-fill missing data
    for (let day = 29; day >= 0; day--) {
      // Calculate target block from snapped current block
      const targetBlock = snappedCurrentBlock - BLOCKS_PER_DAY * day;

      // For historical days (not today), snap to day boundaries for stable cache keys
      let cacheBlock;
      if (day === 0) {
        // Today: use the snapped current block
        cacheBlock = snappedCurrentBlock;
      } else {
        // Historical days: snap to day boundary anchored to deployment
        const blocksSinceDeployment = targetBlock - DEPLOYMENT_BLOCK;
        const daysSinceDeployment = Math.floor(
          blocksSinceDeployment / BLOCKS_PER_DAY
        );
        cacheBlock = DEPLOYMENT_BLOCK + daysSinceDeployment * BLOCKS_PER_DAY;
      }

      if (day >= 27) {
        // Log last 3 days for debugging
        console.log(
          `Day ${day}: target=${targetBlock}, cache=${cacheBlock}, diff=${targetBlock - cacheBlock}`
        );
      }

      const priceData = await this.getHistoricalPrice(cacheBlock);

      // Calculate the correct timestamp for this specific day
      const approximateTimestamp = now - day * 24 * 60 * 60;

      if (priceData) {
        lastKnownPrice = priceData;
        dailyPrices.push({
          ...priceData,
          dayIndex: day, // 0 = today, 1 = yesterday, etc.
        });
      } else if (lastKnownPrice) {
        // Forward-fill: use the last known price from earlier days
        dailyPrices.push({
          price: lastKnownPrice.price,
          blockNumber: cacheBlock,
          timestamp: approximateTimestamp,
          txHash: null, // No actual transaction
          dayIndex: day,
          interpolated: true, // Mark as interpolated data
        });
      } else {
        // No price data yet, skip this day (will be at start of chart)
        console.warn(`[Cache] No price data for day ${day}, skipping`);
      }
    }

    let cacheHits = 0;
    this.priceCache.forEach((entry) => {
      if (this.isCacheValid(entry)) cacheHits++;
    });

    console.log(
      `[Cache] getDailyPricesForMonth completed - ${dailyPrices.length} days returned, Cache: ${cacheHits} valid / ${this.priceCache.size} total entries`
    );

    // Already in chronological order (oldest first) since we looped from day 29 to 0
    return dailyPrices;
  }
}
