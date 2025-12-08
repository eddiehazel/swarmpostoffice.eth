import Service, { service } from '@ember/service';
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
  @service etherscanCache;
  @tracked apiKey = null;

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
   * Get current block number (with caching)
   */
  async getCurrentBlock() {
    // Try to get from cache first
    const cached = this.etherscanCache.getCurrentBlock();
    if (cached) {
      console.log('Using cached current block:', cached.number);
      return cached.number;
    }

    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('API key is required. Add ?key=YOUR_KEY to the URL.');
    }

    try {
      const url = `${API_BASE}?chainid=${CHAIN_ID}&module=proxy&action=eth_blockNumber&apikey=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.result) {
        const blockNumber = this.hexToDecimal(data.result);
        // Cache the current block
        this.etherscanCache.setCurrentBlock(blockNumber);
        console.log('Fetched and cached current block:', blockNumber);
        return blockNumber;
      }
      throw new Error(data.message || 'Failed to fetch current block');
    } catch (error) {
      console.error('Error fetching current block:', error);
      throw error;
    }
  }

  /**
   * Fetch price update events (with intelligent caching)
   */
  async fetchPriceEvents(maxEvents = 50) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('API key is required. Add ?key=YOUR_KEY to the URL.');
    }

    try {
      const currentBlock = await this.getCurrentBlock();
      const fromBlock = Math.max(DEPLOYMENT_BLOCK, currentBlock - 50000);

      // Check if we need to fetch any data
      const missingRanges = this.etherscanCache.getMissingRanges(
        fromBlock,
        currentBlock
      );

      console.log(
        `Block range ${fromBlock}-${currentBlock}: ${missingRanges.length} missing ranges`
      );

      // Fetch data for missing ranges
      for (const range of missingRanges) {
        console.log(
          `Fetching missing range: ${range.fromBlock}-${range.toBlock}`
        );
        await this._fetchAndCacheRange(range.fromBlock, range.toBlock, apiKey);
      }

      // Get all events from cache for the requested range
      const allEvents = this.etherscanCache.getEventsInRange(
        fromBlock,
        currentBlock
      );

      // Sort by block number descending and take the last maxEvents
      const sortedEvents = allEvents
        .sort((a, b) => b.blockNumber - a.blockNumber)
        .slice(0, maxEvents);

      // Convert to the format expected by the app (with hex values)
      const formattedEvents = sortedEvents.map((event) => ({
        blockNumber: `0x${event.blockNumber.toString(16)}`,
        data: `0x${event.data.toString(16)}`,
        timeStamp: `0x${event.timeStamp.toString(16)}`,
        transactionHash: event.transactionHash,
      }));

      console.log(
        `Returning ${formattedEvents.length} events from cache (${allEvents.length} total in range)`
      );

      return {
        events: formattedEvents,
        currentBlock,
      };
    } catch (error) {
      console.error('Error fetching price events:', error);
      throw error;
    }
  }

  /**
   * Fetch events for a specific block range and cache them
   * @private
   */
  async _fetchAndCacheRange(fromBlock, toBlock, apiKey) {
    const url = `${API_BASE}?chainid=${CHAIN_ID}&module=logs&action=getLogs&fromBlock=${fromBlock}&toBlock=${toBlock}&address=${CONTRACT_ADDRESS}&topic0=${PRICE_UPDATE_TOPIC}&page=1&offset=1000&apikey=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === '1' && Array.isArray(data.result)) {
      // Convert events to decimal format for caching
      const normalizedEvents = data.result.map((event) => ({
        blockNumber: this.hexToDecimal(event.blockNumber),
        data: this.hexToDecimal(event.data),
        timeStamp: this.hexToDecimal(event.timeStamp),
        transactionHash: event.transactionHash,
      }));

      // Add events to cache
      this.etherscanCache.addEvents(normalizedEvents);

      // Mark this range as cached
      this.etherscanCache.addBlockRange(fromBlock, toBlock);

      console.log(
        `Cached ${normalizedEvents.length} events for range ${fromBlock}-${toBlock}`
      );
    } else if (data.result && typeof data.result === 'string') {
      // API returned an error message
      if (data.result.includes('No records found')) {
        // No events in this range - still mark as cached to avoid re-fetching
        this.etherscanCache.addBlockRange(fromBlock, toBlock);
        console.log(`No events found for range ${fromBlock}-${toBlock}`);
      } else {
        throw new Error(data.result);
      }
    } else {
      throw new Error(data.message || 'Failed to fetch events');
    }
  }

  /**
   * Get historical price data for a specific block range (with caching)
   */
  async getHistoricalPrice(targetBlock) {
    // Try to get from cache first
    const cached = this.etherscanCache.getHistoricalPrice(targetBlock);
    if (cached) {
      console.log('Using cached historical price for block:', targetBlock);
      return cached;
    }

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

          // Cache the historical price
          this.etherscanCache.setHistoricalPrice(targetBlock, priceData);
          console.log(
            'Fetched and cached historical price for block:',
            targetBlock
          );

          return priceData;
        }
      }
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
}
