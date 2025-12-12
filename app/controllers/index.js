import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action, set } from '@ember/object';
import { getOwner } from '@ember/owner';
import { parseEvent } from '../utils/price-utils';

export default class IndexController extends Controller {
  @tracked model;
  @tracked previousEventHashes = [];
  @tracked isLoadingMore = false;
  @tracked events = [];
  @tracked totalEventsLoaded = 0;
  @tracked hasMoreEvents = true;

  get hasEvents() {
    return this.events?.length > 0;
  }

  // Getter to expose model events for template reactivity
  get displayEvents() {
    return this.model?.events || [];
  }

  get loadMoreEventsAction() {
    console.log('[Controller] Creating loadMoreEventsAction');
    return () => {
      console.log('[Controller] loadMoreEventsAction called');
      return this.loadMoreEvents();
    };
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

      // Fetch only currently loaded number of events (for refresh)
      const countToFetch = this.model.totalEventsLoaded || 10;
      const { events, currentBlock } =
        await etherscanApi.fetchPriceEvents(countToFetch);

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
          const changePLUR = change / 1e16;
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
        isLoadingMore: false,
        hasMoreEvents: this.hasMoreEvents,
        totalEventsLoaded: displayEvents.length,
      };

      console.log('[Controller] Setting model.stats:', model.stats);

      this.model = model;

      // Update tracked properties
      this.events = displayEvents;
      this.totalEventsLoaded = displayEvents.length;
    } catch (error) {
      this.model = { ...this.model, isLoading: false, error: error.message };
      console.error('Error refreshing data:', error);
    }
  }

  @action
  async loadMoreEvents() {
    const owner = getOwner(this);
    const etherscanApi = owner.lookup('service:etherscan-api');

    try {
      this.isLoadingMore = true;
      set(this.model, 'isLoadingMore', true);

      // Fetch 10 more events than currently loaded
      const newTotal = this.totalEventsLoaded + 10;
      console.log('[Controller] Loading more events:', {
        currentTotal: this.totalEventsLoaded,
        newTotal,
      });

      const { events, currentBlock } =
        await etherscanApi.fetchPriceEvents(newTotal);

      if (!events || events.length === 0) {
        this.isLoadingMore = false;
        set(this.model, 'hasMoreEvents', false);
        set(this.model, 'isLoadingMore', false);
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

      // Check if we got fewer events than requested (means no more events)
      const hasMoreEvents = events.length >= newTotal;

      console.log('[Controller] Load more complete:', {
        requested: newTotal,
        received: events.length,
        displayEvents: displayEvents.length,
        currentEventsLength: this.events?.length,
        hasMoreEvents,
      });

      // Update statistics with the latest data
      const totalEvents = parsedEvents.length;
      const latestPrice = parsedEvents[parsedEvents.length - 1].price;
      const changes = parsedEvents
        .map((e) => parseFloat(e.percentageChange))
        .filter((c) => c !== 0);
      const avgChange =
        changes.length > 0
          ? (changes.reduce((a, b) => a + b, 0) / changes.length).toFixed(2)
          : 0;

      // Update model properties directly using set for reactivity
      set(this.model, 'events', displayEvents);
      set(this.model.stats, 'totalEvents', totalEvents);
      set(this.model.stats, 'latestPrice', latestPrice);
      set(this.model.stats, 'avgChange', avgChange);
      set(this.model, 'totalEventsLoaded', displayEvents.length);
      set(this.model, 'hasMoreEvents', hasMoreEvents);
      set(this.model, 'isLoadingMore', false);

      // Update tracked properties - this will trigger UI updates
      this.events = displayEvents;
      this.totalEventsLoaded = displayEvents.length;
      this.hasMoreEvents = hasMoreEvents;
      this.isLoadingMore = false;

      console.log(
        '[Controller] Model properties updated:',
        this.model.events.length,
        'events'
      );
    } catch (error) {
      this.isLoadingMore = false;
      set(this.model, 'isLoadingMore', false);
      console.error('Error loading more events:', error);
    }
  }
}
