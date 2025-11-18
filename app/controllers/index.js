import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { parseEvent } from '../utils/price-utils';

export default class IndexController extends Controller {
  @tracked isLoading = false;
  @tracked isInitialLoading = true;
  @tracked error = null;
  @tracked previousEventHashes = [];

  get hasEvents() {
    return this.model?.events?.length > 0;
  }

  get newEventHashes() {
    if (!this.model?.events || this.previousEventHashes.length === 0) {
      return [];
    }

    const currentHashes = this.model.events.map((e) => e.txHash);
    return currentHashes.filter(
      (hash) => !this.previousEventHashes.includes(hash)
    );
  }

  get latestPriceDisplay() {
    if (!this.model?.stats?.latestPrice) return '-';
    return `${this.model.stats.latestPrice.toLocaleString()} PLUR`;
  }

  get avgChangeDisplay() {
    if (!this.model?.stats?.avgChange) return '-';
    return `${this.model.stats.avgChange}%`;
  }

  @action
  async refresh() {
    const etherscanApi = this.owner.lookup('service:etherscan-api');

    try {
      this.isLoading = true;
      this.error = null;

      // Store previous hashes for animation detection
      if (this.model?.events) {
        this.previousEventHashes = this.model.events.map((e) => e.txHash);
      }

      // Fetch events
      const { events, currentBlock } = await etherscanApi.fetchPriceEvents(50);

      if (!events || events.length === 0) {
        this.model = {
          events: [],
          stats: { totalEvents: 0, latestPrice: 0, avgChange: 0 },
          historical: null,
          currentBlock: null,
          newEventHashes: [],
        };
        return;
      }

      // Parse events and calculate changes
      const parsedEvents = events
        .sort((a, b) => {
          const hexToDecimal = (hex) => parseInt(hex, 16);
          return hexToDecimal(a.blockNumber) - hexToDecimal(b.blockNumber);
        })
        .map((event, index) => {
          const previousPrice =
            index > 0 ? parseInt(events[index - 1].data, 16) : null;
          return parseEvent(event, previousPrice);
        });

      // Reverse for display (newest first)
      const displayEvents = [...parsedEvents].reverse();

      // Calculate statistics
      const totalEvents = parsedEvents.length;
      const latestPrice = parsedEvents[parsedEvents.length - 1].price;
      const changes = parsedEvents
        .map((e) => parseFloat(e.percentageChange))
        .filter((c) => c !== 0);
      const avgChange =
        changes.length > 0
          ? (changes.reduce((a, b) => a + b, 0) / changes.length).toFixed(2)
          : 0;

      // Get historical data
      const historical = await etherscanApi.getHistoricalPrices(currentBlock);

      this.model = {
        events: displayEvents,
        stats: {
          totalEvents,
          latestPrice,
          avgChange,
        },
        historical,
        currentBlock,
        newEventHashes: this.newEventHashes,
      };
    } catch (error) {
      this.error = error.message;
      console.error('Error refreshing data:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
