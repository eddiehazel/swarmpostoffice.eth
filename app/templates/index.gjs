import StatCard from '../components/stat-card.gjs';
import HistoricalComparison from '../components/historical-comparison.gjs';
import EventList from '../components/event-list.gjs';
import or from '../helpers/or';

<template>
  <div class="container">
    <div class="header">
      <h1>🔔 PRICE UPDATE EVENTS</h1>
      <div class="contract-info">
        Contract:
        <strong>0x47EeF336e7fE5bED98499A4696bce8f28c1B0a8b</strong><br />
        Network:
        <strong>Gnosis Chain</strong>
      </div>
    </div>

    <div class="stats">
      <StatCard
        @label="Total Events"
        @value={{or this.controller.model.stats.totalEvents "-"}}
      />
      <StatCard
        @label="Latest Price"
        @value={{this.controller.latestPriceDisplay}}
      />
      <StatCard
        @label="Avg Change"
        @value={{this.controller.avgChangeDisplay}}
      />
    </div>

    {{#if this.controller.model.historical}}
      <HistoricalComparison
        @historical={{this.controller.model.historical}}
        @latestPrice={{this.controller.model.stats.latestPrice}}
      />
    {{/if}}

    <EventList
      @events={{this.controller.model.events}}
      @isLoading={{this.controller.isLoading}}
      @error={{or this.controller.model.error this.controller.error}}
      @newEventHashes={{this.controller.newEventHashes}}
    />
  </div>
</template>
