import StatCard from '../components/stat-card.gjs';
import HistoricalComparison from '../components/historical-comparison.gjs';
import PriceChart from '../components/price-chart.gjs';
import EventList from '../components/event-list.gjs';
import or from '../helpers/or';
import concat from '../helpers/concat';
import formatPrice from '../helpers/format-price';

<template>
  <div class="container">
    <div class="header">
      <h1>📬 Price Update Events Dashboard</h1>
      <div class="contract-info">
        📮 Contract:
        <strong>0x47EeF336e7fE5bED98499A4696bce8f28c1B0a8b</strong><br />
        🌐 Network:
        <strong>Gnosis Chain</strong>
      </div>
    </div>

    <div class="stats">
      <StatCard
        @label="📦 Total Events"
        @value={{or @model.stats.totalEvents "-"}}
      />
      <StatCard
        @label="💰 Latest Price"
        @value={{if
          @model.stats.latestPrice
          (concat (formatPrice @model.stats.latestPrice) " PLUR")
          "-"
        }}
      />
      <StatCard
        @label="📊 Avg Change"
        @value={{if
          @model.stats.avgChange
          (concat @model.stats.avgChange "%")
          "-"
        }}
      />
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
      @error={{@model.error}}
      @newEventHashes={{@model.newEventHashes}}
    />
  </div>
</template>
