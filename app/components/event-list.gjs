import EventItem from './event-item.gjs';
import eq from '../helpers/eq.js';
import notEq from '../helpers/not-eq.js';
import includes from '../helpers/includes.js';
import { on } from '@ember/modifier';

<template>
  <div class="events-container">
    <div class="events-header">
      <h2 class="events-title">📨 Last {{@totalEventsLoaded}} Price Updates</h2>
      {{#if @isLoading}}
        <div class="refresh-info">Loading...</div>
      {{else}}
        <div class="refresh-info">Auto-refreshes every 30 seconds</div>
      {{/if}}
    </div>
    <div class="events-content">
      {{#if @isLoading}}
        <div class="loading">
          <div class="spinner"></div>
          📭 Loading price events...
        </div>
      {{else if @error}}
        <div class="error">
          <strong>Error loading events:</strong><br />
          {{@error}}
        </div>
      {{else if (eq @events.length 0)}}
        <div class="no-events">No price update events found.</div>
      {{else}}
        {{#each @events as |event|}}
          <EventItem
            @event={{event}}
            @showChange={{notEq event.percentageChange 0}}
            @isNew={{includes @newEventHashes event.txHash}}
          />
        {{/each}}
        {{#if @hasMoreEvents}}
          <div class="load-more-container">
            <button
              type="button"
              class="load-more-button"
              disabled={{@isLoadingMore}}
              {{on "click" @onLoadMore}}
            >
              {{#if @isLoadingMore}}
                <div class="spinner-small"></div>
                Loading...
              {{else}}
                Load 10 More Events
              {{/if}}
            </button>
          </div>
        {{/if}}
      {{/if}}
    </div>
  </div>
</template>
