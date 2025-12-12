import StatCard from '../components/stat-card.gjs';
import StorageCostGrid from '../components/storage-cost-grid.gjs';
import HistoricalComparison from '../components/historical-comparison.gjs';
import PriceChart from '../components/price-chart.gjs';
import EventList from '../components/event-list.gjs';
import concat from '../helpers/concat';
import formatPrice from '../helpers/format-price';
import { fn } from '@ember/helper';

<template>
  <div class="container">
    <div class="header">
      <h1>📬 Swarm Post Office 📯</h1>
      <div class="contract-info">
        📮 Contract:
        <strong><a
            href="https://gnosisscan.io/address/0x47EeF336e7fE5bED98499A4696bce8f28c1B0a8b"
          >0x47EeF336e7fE5bED98499A4696bce8f28c1B0a8b</a></strong><br />
        🌐 Network:
        <strong>Gnosis Chain</strong>
      </div>
    </div>

    <div class="stats">
      <StorageCostGrid @latestPrice={{@model.stats.latestPrice}} />
      <StatCard
        @label="💰 Latest Price"
        @value={{if
          @model.stats.latestPrice
          (concat (formatPrice @model.stats.latestPrice) " PLUR")
          "-"
        }}
      />
      <div class="stat-card">
        <div class="stat-label">📊 24hr Change</div>
        <div class="stat-value">{{if
            @model.stats.dayChange
            (concat @model.stats.dayChange "%")
            "-"
          }}</div>
        {{#if @model.stats.dayChangePLUR}}
          <div class="stat-sub-value">{{@model.stats.dayChangePLUR}} PLUR</div>
        {{/if}}
      </div>
    </div>

    {{#if @model.historical}}
      <HistoricalComparison
        @historical={{@model.historical}}
        @latestPrice={{@model.stats.latestPrice}}
      />
    {{/if}}

    <PriceChart @data={{@model.dailyPrices}} />

    <EventList
      @events={{@model.events}}
      @isLoading={{@model.isLoading}}
      @isLoadingMore={{@model.isLoadingMore}}
      @error={{@model.error}}
      @newEventHashes={{@model.newEventHashes}}
      @hasMoreEvents={{@model.hasMoreEvents}}
      @totalEventsLoaded={{@model.totalEventsLoaded}}
      @onLoadMore={{@model.loadMoreEventsAction}}
    />
  </div>
</template>
