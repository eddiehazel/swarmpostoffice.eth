import formatPrice from '../helpers/format-price.js';
import formatDateTime from '../helpers/format-date-time.js';
import formatNumber from '../helpers/format-number.js';
import subtract from '../helpers/subtract.js';
import calculatePercentageChange from '../helpers/calculate-percentage-change.js';
import gt from '../helpers/gt.js';
import lt from '../helpers/lt.js';
import abs from '../helpers/abs.js';

<template>
  {{#if @historical}}
    <div class="stats historical-stats">
      {{#if @historical.week}}
        <div class="stat-card historical-card">
          <div class="stat-label">1 Week Ago</div>
          <div class="stat-value" style="font-size: 1.3em;">{{formatPrice @historical.week.price}} PLUR</div>
          {{#if @latestPrice}}
            {{#let (subtract @latestPrice @historical.week.price) as |priceDiff|}}
              {{#let (calculatePercentageChange @historical.week.price @latestPrice) as |percentChange|}}
                <div class="detail-value {{if (gt priceDiff 0) 'percentage-increase'}} {{if (lt priceDiff 0) 'percentage-decrease'}}" style="margin-top: 8px; font-size: 1.1em;">
                  {{if (gt priceDiff 0) '↑'}} {{if (lt priceDiff 0) '↓'}} {{formatPrice (abs priceDiff)}} PLUR
                </div>
                <div class="detail-value {{if (gt priceDiff 0) 'percentage-increase'}} {{if (lt priceDiff 0) 'percentage-decrease'}}" style="font-size: 0.95em;">
                  {{if (gt priceDiff 0) '↑'}} {{if (lt priceDiff 0) '↓'}} {{formatNumber (abs percentChange) minimumFractionDigits=2 maximumFractionDigits=2}}%
                </div>
              {{/let}}
            {{/let}}
          {{/if}}
          <div style="margin-top: 8px; font-size: 0.8em;">
            <a href="https://gnosisscan.io/block/{{@historical.week.blockNumber}}" target="_blank" rel="noopener noreferrer" style="color: #667eea; text-decoration: none;">
              Block #{{formatNumber @historical.week.blockNumber}}
            </a>
          </div>
          <div style="font-size: 0.75em; color: #888; margin-top: 4px;">
            {{formatDateTime @historical.week.timestamp}}
          </div>
        </div>
      {{/if}}
      {{#if @historical.month}}
        <div class="stat-card historical-card">
          <div class="stat-label">1 Month Ago</div>
          <div class="stat-value" style="font-size: 1.3em;">{{formatPrice @historical.month.price}} PLUR</div>
          {{#if @latestPrice}}
            {{#let (subtract @latestPrice @historical.month.price) as |priceDiff|}}
              {{#let (calculatePercentageChange @historical.month.price @latestPrice) as |percentChange|}}
                <div class="detail-value {{if (gt priceDiff 0) 'percentage-increase'}} {{if (lt priceDiff 0) 'percentage-decrease'}}" style="margin-top: 8px; font-size: 1.1em;">
                  {{if (gt priceDiff 0) '↑'}} {{if (lt priceDiff 0) '↓'}} {{formatPrice (abs priceDiff)}} PLUR
                </div>
                <div class="detail-value {{if (gt priceDiff 0) 'percentage-increase'}} {{if (lt priceDiff 0) 'percentage-decrease'}}" style="font-size: 0.95em;">
                  {{if (gt priceDiff 0) '↑'}} {{if (lt priceDiff 0) '↓'}} {{formatNumber (abs percentChange) minimumFractionDigits=2 maximumFractionDigits=2}}%
                </div>
              {{/let}}
            {{/let}}
          {{/if}}
          <div style="margin-top: 8px; font-size: 0.8em;">
            <a href="https://gnosisscan.io/block/{{@historical.month.blockNumber}}" target="_blank" rel="noopener noreferrer" style="color: #667eea; text-decoration: none;">
              Block #{{formatNumber @historical.month.blockNumber}}
            </a>
          </div>
          <div style="font-size: 0.75em; color: #888; margin-top: 4px;">
            {{formatDateTime @historical.month.timestamp}}
          </div>
        </div>
      {{/if}}
      {{#if @historical.threeMonths}}
        <div class="stat-card historical-card">
          <div class="stat-label">3 Months Ago</div>
          <div class="stat-value" style="font-size: 1.3em;">{{formatPrice @historical.threeMonths.price}} PLUR</div>
          {{#if @latestPrice}}
            {{#let (subtract @latestPrice @historical.threeMonths.price) as |priceDiff|}}
              {{#let (calculatePercentageChange @historical.threeMonths.price @latestPrice) as |percentChange|}}
                <div class="detail-value {{if (gt priceDiff 0) 'percentage-increase'}} {{if (lt priceDiff 0) 'percentage-decrease'}}" style="margin-top: 8px; font-size: 1.1em;">
                  {{if (gt priceDiff 0) '↑'}} {{if (lt priceDiff 0) '↓'}} {{formatPrice (abs priceDiff)}} PLUR
                </div>
                <div class="detail-value {{if (gt priceDiff 0) 'percentage-increase'}} {{if (lt priceDiff 0) 'percentage-decrease'}}" style="font-size: 0.95em;">
                  {{if (gt priceDiff 0) '↑'}} {{if (lt priceDiff 0) '↓'}} {{formatNumber (abs percentChange) minimumFractionDigits=2 maximumFractionDigits=2}}%
                </div>
              {{/let}}
            {{/let}}
          {{/if}}
          <div style="margin-top: 8px; font-size: 0.8em;">
            <a href="https://gnosisscan.io/block/{{@historical.threeMonths.blockNumber}}" target="_blank" rel="noopener noreferrer" style="color: #667eea; text-decoration: none;">
              Block #{{formatNumber @historical.threeMonths.blockNumber}}
            </a>
          </div>
          <div style="font-size: 0.75em; color: #888; margin-top: 4px;">
            {{formatDateTime @historical.threeMonths.timestamp}}
          </div>
        </div>
      {{/if}}
      {{#if @historical.sixMonths}}
        <div class="stat-card historical-card">
          <div class="stat-label">6 Months Ago</div>
          <div class="stat-value" style="font-size: 1.3em;">{{formatPrice @historical.sixMonths.price}} PLUR</div>
          {{#if @latestPrice}}
            {{#let (subtract @latestPrice @historical.sixMonths.price) as |priceDiff|}}
              {{#let (calculatePercentageChange @historical.sixMonths.price @latestPrice) as |percentChange|}}
                <div class="detail-value {{if (gt priceDiff 0) 'percentage-increase'}} {{if (lt priceDiff 0) 'percentage-decrease'}}" style="margin-top: 8px; font-size: 1.1em;">
                  {{if (gt priceDiff 0) '↑'}} {{if (lt priceDiff 0) '↓'}} {{formatPrice (abs priceDiff)}} PLUR
                </div>
                <div class="detail-value {{if (gt priceDiff 0) 'percentage-increase'}} {{if (lt priceDiff 0) 'percentage-decrease'}}" style="font-size: 0.95em;">
                  {{if (gt priceDiff 0) '↑'}} {{if (lt priceDiff 0) '↓'}} {{formatNumber (abs percentChange) minimumFractionDigits=2 maximumFractionDigits=2}}%
                </div>
              {{/let}}
            {{/let}}
          {{/if}}
          <div style="margin-top: 8px; font-size: 0.8em;">
            <a href="https://gnosisscan.io/block/{{@historical.sixMonths.blockNumber}}" target="_blank" rel="noopener noreferrer" style="color: #667eea; text-decoration: none;">
              Block #{{formatNumber @historical.sixMonths.blockNumber}}
            </a>
          </div>
          <div style="font-size: 0.75em; color: #888; margin-top: 4px;">
            {{formatDateTime @historical.sixMonths.timestamp}}
          </div>
        </div>
      {{/if}}
    </div>
  {{/if}}
</template>
