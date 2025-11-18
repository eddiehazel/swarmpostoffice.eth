import Route from '@ember/routing/route';
import { getOwner } from '@ember/owner';
import { parseEvent } from '../utils/price-utils';

export default class IndexRoute extends Route {
  model() {
    // Return empty model immediately to allow template to render with loading screen
    return {
      events: [],
      stats: { totalEvents: 0, latestPrice: 0, avgChange: 0 },
      historical: null,
      currentBlock: null,
      newEventHashes: [],
    };
  }

  async setupController(controller, model) {
    super.setupController(controller, model);

    // Load initial data
    await this.loadInitialData(controller);

    // Set up auto-refresh every 30 seconds
    this.refreshTimer = setInterval(() => {
      controller.refresh();
    }, 30000);
  }

  async loadInitialData(controller) {
    const owner = getOwner(this);
    const etherscanApi = owner.lookup('service:etherscan-api');

    try {
      // Fetch events
      const { events, currentBlock } = await etherscanApi.fetchPriceEvents(50);

      if (!events || events.length === 0) {
        controller.model = {
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

      controller.model = {
        events: displayEvents,
        stats: {
          totalEvents,
          latestPrice,
          avgChange,
        },
        historical,
        currentBlock,
        newEventHashes: [],
      };
    } catch (error) {
      controller.error = error.message;
      controller.model = {
        events: [],
        stats: { totalEvents: 0, latestPrice: 0, avgChange: 0 },
        historical: null,
        currentBlock: null,
        newEventHashes: [],
        error: error.message,
      };
      console.error('Error loading initial data:', error);
    }
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      // Reset controller state when leaving the route
      controller.isLoading = false;
      controller.error = null;
      controller.previousEventHashes = [];
    }
  }

  deactivate() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
}
