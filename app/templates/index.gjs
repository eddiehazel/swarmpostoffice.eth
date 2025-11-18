import StatCard from '../components/stat-card.gjs';
import HistoricalComparison from '../components/historical-comparison.gjs';
import EventList from '../components/event-list.gjs';
import or from '../helpers/or';

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
        @value={{this.controller.latestPriceDisplay}}
      />
      <StatCard
        @label="📊 Avg Change"
        @value={{this.controller.avgChangeDisplay}}
      />
    </div>

    {{#if @model.historical}}
      <HistoricalComparison
        @historical={{@model.historical}}
        @latestPrice={{@model.stats.latestPrice}}
      />
    {{/if}}

    <EventList
      @events={{@model.events}}
      @isLoading={{this.controller.isLoading}}
      @error={{or @model.error this.controller.error}}
      @newEventHashes={{this.controller.newEventHashes}}
    />
  </div>
</template>
