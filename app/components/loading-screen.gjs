import { array } from '@ember/helper';

<template>
  <div class="loading-screen-overlay">
    <div class="loading-screen-container">
      {{! Header Section }}
      <div class="loading-header skeleton-box">
        <div class="loading-title">
          <span class="postal-emoji">📮</span>
          <span class="glitch-text">INITIALIZING POSTAL NETWORK</span>
          <span class="postal-emoji">📬</span>
        </div>
        <div class="loading-subtitle">
          <div class="tech-line">
            <span class="label">CONTRACT_ADDRESS:</span>
            <span class="skeleton-text skeleton-text-long"></span>
          </div>
          <div class="tech-line">
            <span class="label">NETWORK_ID:</span>
            <span class="skeleton-text skeleton-text-short"></span>
          </div>
          <div class="tech-line">
            <span class="label">STATUS:</span>
            <span class="status-blink">ESTABLISHING CONNECTION</span>
            <span class="loading-dots"></span>
          </div>
        </div>
      </div>

      {{! Stats Grid }}
      <div class="loading-stats">
        <div class="loading-stat-card skeleton-box" data-delay="0">
          <div class="stat-icon">📊</div>
          <div class="skeleton-label">TOTAL_EVENTS</div>
          <div class="skeleton-value"></div>
          <div class="tech-detail">QUERYING DATABASE...</div>
        </div>
        <div class="loading-stat-card skeleton-box" data-delay="1">
          <div class="stat-icon">💰</div>
          <div class="skeleton-label">LATEST_PRICE</div>
          <div class="skeleton-value"></div>
          <div class="tech-detail">FETCHING BLOCKCHAIN...</div>
        </div>
        <div class="loading-stat-card skeleton-box" data-delay="2">
          <div class="stat-icon">📈</div>
          <div class="skeleton-label">AVG_CHANGE</div>
          <div class="skeleton-value"></div>
          <div class="tech-detail">CALCULATING METRICS...</div>
        </div>
      </div>

      {{! Historical Comparison }}
      <div class="loading-historical">
        <div class="loading-historical-title skeleton-box">
          <span class="postal-emoji">📫</span>
          HISTORICAL_DATA_ANALYSIS
          <span class="postal-emoji">🏤</span>
        </div>
        <div class="loading-historical-grid">
          <div
            class="loading-stat-card skeleton-box historical-card"
            data-delay="3"
          >
            <div class="stat-icon">📅</div>
            <div class="skeleton-label">1_WEEK_AGO</div>
            <div class="skeleton-value"></div>
            <div class="tech-detail">LOADING ARCHIVE...</div>
          </div>
          <div
            class="loading-stat-card skeleton-box historical-card"
            data-delay="4"
          >
            <div class="stat-icon">📆</div>
            <div class="skeleton-label">1_MONTH_AGO</div>
            <div class="skeleton-value"></div>
            <div class="tech-detail">LOADING ARCHIVE...</div>
          </div>
          <div
            class="loading-stat-card skeleton-box historical-card"
            data-delay="5"
          >
            <div class="stat-icon">🗓️</div>
            <div class="skeleton-label">3_MONTHS_AGO</div>
            <div class="skeleton-value"></div>
            <div class="tech-detail">LOADING ARCHIVE...</div>
          </div>
          <div
            class="loading-stat-card skeleton-box historical-card"
            data-delay="6"
          >
            <div class="stat-icon">📋</div>
            <div class="skeleton-label">6_MONTHS_AGO</div>
            <div class="skeleton-value"></div>
            <div class="tech-detail">LOADING ARCHIVE...</div>
          </div>
        </div>
      </div>

      {{! Events Container }}
      <div class="loading-events skeleton-box">
        <div class="loading-events-header">
          <div class="events-title-loading">
            <span class="postal-emoji">✉️</span>
            RECENT_TRANSMISSIONS
            <span class="postal-emoji">📪</span>
          </div>
          <div class="tech-status">
            <span class="status-indicator"></span>
            SYNCING_BLOCKCHAIN_EVENTS
          </div>
        </div>

        <div class="loading-event-items">
          {{#each (array 1 2 3 4 5) as |index|}}
            <div class="loading-event-item skeleton-box" data-delay={{index}}>
              <div class="event-item-header">
                <div class="skeleton-text skeleton-text-medium"></div>
                <div class="skeleton-badge"></div>
              </div>
              <div class="event-item-details">
                <div class="event-detail-row">
                  <span class="detail-label-loading">TX_HASH:</span>
                  <div class="skeleton-text skeleton-text-long"></div>
                </div>
                <div class="event-detail-row">
                  <span class="detail-label-loading">BLOCK:</span>
                  <div class="skeleton-text skeleton-text-short"></div>
                </div>
                <div class="event-detail-row">
                  <span class="detail-label-loading">CHANGE:</span>
                  <div class="skeleton-text skeleton-text-medium"></div>
                </div>
              </div>
            </div>
          {{/each}}
        </div>
      </div>

      {{! Technical Footer }}
      <div class="loading-footer">
        <div class="system-status">
          <span class="postal-emoji">🚚</span>
          SWARM_POST_OFFICE_v1.0
          <span class="postal-emoji">📮</span>
        </div>
        <div class="loading-bar-container">
          <div class="loading-bar"></div>
        </div>
        <div class="tech-info">
          ESTABLISHING_SECURE_CONNECTION // VALIDATING_CONTRACTS // SYNCING_DATA
        </div>
      </div>
    </div>
  </div>
</template>
