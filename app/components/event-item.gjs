import formatDateTime from '../helpers/format-date-time.js';
import formatPrice from '../helpers/format-price.js';
import formatNumber from '../helpers/format-number.js';
import substring from '../helpers/substring.js';
import subtract from '../helpers/subtract.js';
import length from '../helpers/length.js';
import gt from '../helpers/gt.js';
import lt from '../helpers/lt.js';
import abs from '../helpers/abs.js';

<template>
  <div class="event-item {{if @isNew 'new-event'}}" ...attributes>
    <div class="event-header">
      <div class="event-time">{{formatDateTime @event.timestamp}}</div>
      <div class="price-badge">Price: {{formatPrice @event.price}} PLUR</div>
    </div>
    <div class="event-details">
      <div class="detail-item">
        <div class="detail-label">Block Number</div>
        <div class="detail-value">
          <a href="https://gnosisscan.io/block/{{@event.blockNumber}}" target="_blank" rel="noopener noreferrer">
            {{formatNumber @event.blockNumber}}
          </a>
        </div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Transaction Hash</div>
        <div class="detail-value" style="font-size: 0.85em;">
          <a href="https://gnosisscan.io/tx/{{@event.txHash}}" target="_blank" rel="noopener noreferrer" style="color: #667eea; text-decoration: none;">
            {{substring @event.txHash 0 10}}...{{substring @event.txHash (subtract (length @event.txHash) 8) (length @event.txHash)}}
          </a>
        </div>
      </div>
      {{#if @showChange}}
        <div class="detail-item">
          <div class="detail-label">Change from Previous</div>
          <div class="detail-value {{if (gt @event.percentageChange 0) 'percentage-increase'}} {{if (lt @event.percentageChange 0) 'percentage-decrease'}}">
            {{if (gt @event.percentageChange 0) '↑'}} {{if (lt @event.percentageChange 0) '↓'}} {{formatNumber (abs @event.percentageChange) minimumFractionDigits=2 maximumFractionDigits=2}}%
          </div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Price Change (PLUR)</div>
          <div class="detail-value {{if (gt @event.priceChange 0) 'percentage-increase'}} {{if (lt @event.priceChange 0) 'percentage-decrease'}}">
            {{if (gt @event.priceChange 0) '↑'}} {{if (lt @event.priceChange 0) '↓'}} {{formatPrice (abs @event.priceChange)}}
          </div>
        </div>
      {{/if}}
    </div>
  </div>
</template>

