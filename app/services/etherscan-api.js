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
          return {
            price: this.hexToDecimal(closestEvent.data),
            blockNumber: this.hexToDecimal(closestEvent.blockNumber),
            timestamp: this.hexToDecimal(closestEvent.timeStamp),
            txHash: closestEvent.transactionHash,
          };
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

  /**
   * Get daily prices for the last 30 days
   */
  async getDailyPricesForMonth(currentBlock) {
    const dailyPrices = [];

    // Fetch price for each of the last 30 days
    for (let day = 0; day < 30; day++) {
      const targetBlock = currentBlock - BLOCKS_PER_DAY * day;
      const priceData = await this.getHistoricalPrice(targetBlock);

      if (priceData) {
        dailyPrices.push({
          ...priceData,
          dayIndex: day, // 0 = today, 1 = yesterday, etc.
        });
      }
    }

    // Return in chronological order (oldest first)
    return dailyPrices.reverse();
  }
}
