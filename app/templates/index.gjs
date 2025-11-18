import StatCard from '../components/stat-card.gjs';
import HistoricalComparison from '../components/historical-comparison.gjs';
import EventList from '../components/event-list.gjs';
import LoadingScreen from '../components/loading-screen.gjs';
import or from '../helpers/or';

<template>
  {{#if this.controller.isInitialLoading}}
    <LoadingScreen />
  {{else}}
    <div class="container">
      <div class="header">
        <h1>🔔 Price Update Events</h1>
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
          @value={{or @model.stats.totalEvents "-"}}
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
  {{/if}}
</template>
