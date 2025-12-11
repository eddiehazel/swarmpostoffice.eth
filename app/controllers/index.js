import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { getOwner } from '@ember/owner';
import { parseEvent } from '../utils/price-utils';

export default class IndexController extends Controller {
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
    const owner = getOwner(this);
    const etherscanApi = owner.lookup('service:etherscan-api');

    try {
      this.model = { ...this.model, isLoading: true, error: null };

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
          isLoading: false,
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

      // Get daily prices for the last 30 days
      const dailyPrices =
        await etherscanApi.getDailyPricesForMonth(currentBlock);

      // Calculate 24hr change from dailyPrices
      let dayChange = 0;
      let dayChangePLUR = '';
      console.log('[Controller] Calculating 24hr change:', {
        dailyPricesLength: dailyPrices?.length,
        hasData: dailyPrices && dailyPrices.length >= 2,
      });

      if (dailyPrices && dailyPrices.length >= 2) {
        const today = dailyPrices[dailyPrices.length - 1];
        const yesterday = dailyPrices[dailyPrices.length - 2];

        console.log('[Controller] 24hr data:', {
          today: {
            price: today?.price,
            pricePLUR: today?.price ? today.price / 1e18 : 0,
            timestamp: today?.timestamp,
          },
          yesterday: {
            price: yesterday?.price,
            pricePLUR: yesterday?.price ? yesterday.price / 1e18 : 0,
            timestamp: yesterday?.timestamp,
          },
        });

        if (today && yesterday && yesterday.price > 0) {
          const change = today.price - yesterday.price;
          const changePercent = (change / yesterday.price) * 100;
          dayChange = changePercent.toFixed(2);
          const changePLUR = change / 1e18;
          const sign = changePLUR >= 0 ? '+' : '';
          // Use more decimals to show meaningful values
          const absChange = Math.abs(changePLUR);
          let decimals = 2;
          if (absChange < 0.01) decimals = 6;
          else if (absChange < 1) decimals = 4;
          dayChangePLUR = `${sign}${changePLUR.toFixed(decimals)}`;

          console.log('[Controller] 24hr change calculated:', {
            change,
            changePercent: dayChange,
            changePLUR: dayChangePLUR,
          });
        } else {
          console.warn('[Controller] Cannot calculate 24hr change:', {
            hasToday: !!today,
            hasYesterday: !!yesterday,
            yesterdayPrice: yesterday?.price,
          });
        }
      }

      const model = {
        events: displayEvents,
        stats: {
          totalEvents,
          latestPrice,
          avgChange,
          dayChange,
          dayChangePLUR,
        },
        historical,
        dailyPrices,
        currentBlock,
        newEventHashes: this.newEventHashes,
        isLoading: false,
      };

      console.log('[Controller] Setting model.stats:', model.stats);

      this.model = model;
    } catch (error) {
      this.model = { ...this.model, isLoading: false, error: error.message };
      console.error('Error refreshing data:', error);
    }
  }
}
