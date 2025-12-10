import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import chartSetup from '../modifiers/chart-setup';
import chartUpdate from '../modifiers/chart-update';
import * as d3 from 'd3';

export default class PriceChart extends Component {
  @tracked chartElement = null;
  @tracked tooltipElement = null;

  get hasData() {
    return this.args.data && this.args.data.length > 0;
  }

  get chartData() {
    if (!this.hasData) {
      // Return flat line at 0 for loading state
      return Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
        price: 0,
        timestamp: Date.now() - (29 - i) * 24 * 60 * 60 * 1000,
      }));
    }

    const mapped = this.args.data
      .map((item) => ({
        date: new Date(item.timestamp * 1000),
        pricePLUR: typeof item.price === 'number' ? item.price / 1e18 : 0, // Convert to PLUR
        priceWei: item.price,
        timestamp: item.timestamp,
        blockNumber: item.blockNumber,
        txHash: item.txHash,
        interpolated: item.interpolated,
      }))
      .filter((d) => d.pricePLUR > 0); // Remove zero prices

    console.log('[Chart] chartData:', {
      total: mapped.length,
      rawDataCount: this.args.data.length,
      first: mapped[0]
        ? {
            date: mapped[0].date.toISOString(),
            block: mapped[0].blockNumber,
            pricePLUR: mapped[0].pricePLUR.toFixed(6),
          }
        : null,
      last: mapped[mapped.length - 1]
        ? {
            date: mapped[mapped.length - 1].date.toISOString(),
            block: mapped[mapped.length - 1].blockNumber,
            pricePLUR: mapped[mapped.length - 1].pricePLUR.toFixed(6),
          }
        : null,
      interpolated: mapped.filter((d) => d.interpolated).length,
    });

    return mapped;
  }

  @action
  setupChart(element) {
    this.chartElement = element;
    this.renderChart();
  }

  @action
  setupTooltip(element) {
    this.tooltipElement = element;
  }

  @action
  updateChart() {
    if (this.chartElement) {
      this.renderChart();
    }
  }

  renderChart() {
    if (!this.chartElement) return;

    const data = this.chartData;
    const container = this.chartElement;

    // Clear previous chart
    d3.select(container).selectAll('*').remove();

    // Dimensions
    const margin = { top: 20, right: 30, bottom: 50, left: 70 };
    const containerWidth = container.clientWidth;
    const containerHeight = 400;
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    // Create SVG
    const svg = d3
      .select(container)
      .append('svg')
      .attr('width', containerWidth)
      .attr('height', containerHeight)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create gradient for the line
    const gradient = svg
      .append('defs')
      .append('linearGradient')
      .attr('id', 'line-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', width)
      .attr('y2', 0);

    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#667eea');

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#764ba2');

    // Create gradient for the area fill
    const areaGradient = svg
      .append('defs')
      .append('linearGradient')
      .attr('id', 'area-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', height);

    areaGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#667eea')
      .attr('stop-opacity', 0.3);

    areaGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#764ba2')
      .attr('stop-opacity', 0.05);

    // X-axis: Block numbers
    const x = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.blockNumber))
      .range([0, width]);

    // Y-axis: Price in PLUR (already converted)
    const yExtent = d3.extent(data, (d) => d.pricePLUR);
    const priceRange = yExtent[1] - yExtent[0];
    // Use 10% padding, but ensure minimum padding is 5% of max price
    const yPadding = Math.max(priceRange * 0.1, yExtent[1] * 0.05);

    const yDomain = [Math.max(0, yExtent[0] - yPadding), yExtent[1] + yPadding];

    console.log('[Chart] Axis setup:', {
      dataPoints: data.length,
      xExtent: d3.extent(data, (d) => d.blockNumber),
      yExtent: { min: yExtent[0], max: yExtent[1] },
      priceRange,
      padding: yPadding,
      yDomain,
    });

    const y = d3.scaleLinear().domain(yDomain).range([height, 0]);

    // Line generator with beautiful curve
    const line = d3
      .line()
      .x((d) => x(d.blockNumber))
      .y((d) => y(d.pricePLUR))
      .curve(d3.curveCardinal.tension(0.5)); // Beautiful rounded spline

    // Area generator for fill
    const area = d3
      .area()
      .x((d) => x(d.blockNumber))
      .y0(height)
      .y1((d) => y(d.pricePLUR))
      .curve(d3.curveCardinal.tension(0.5));

    // Add area fill
    svg
      .append('path')
      .datum(data)
      .attr('class', 'area')
      .attr('d', area)
      .style('fill', 'url(#area-gradient)')
      .style('opacity', 0)
      .transition()
      .duration(1500)
      .style('opacity', 1);

    // Add the line path (start at y=0 for animation)
    const path = svg
      .append('path')
      .datum(data)
      .attr('class', 'line')
      .attr('fill', 'none')
      .attr('stroke', 'url(#line-gradient)')
      .attr('stroke-width', 3)
      .attr('d', line);

    // Animate the line from 0 to actual values
    const lineZero = d3
      .line()
      .x((d) => x(d.date))
      .y(() => y(0))
      .curve(d3.curveCardinal.tension(0.5));

    path
      .attr('d', lineZero)
      .transition()
      .duration(1500)
      .ease(d3.easeCubicOut)
      .attr('d', line);

    // Add X axis with block numbers
    const xAxis = d3
      .axisBottom(x)
      .ticks(6)
      .tickFormat((d) => d.toLocaleString());

    svg
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)')
      .style('fill', '#888')
      .style('font-size', '12px');

    svg.selectAll('.x-axis path, .x-axis line').style('stroke', '#ddd');

    // Add X axis label
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 5)
      .style('text-anchor', 'middle')
      .style('fill', '#667eea')
      .style('font-weight', '600')
      .style('font-size', '14px')
      .text('Block Number');

    // Add Y axis (values already in PLUR)
    // Calculate appropriate number of decimal places based on price magnitude
    const maxPrice = yExtent[1];
    const minPrice = yExtent[0];

    // Determine decimals based on price range
    let decimals;
    if (priceRange < 0.001) decimals = 8;
    else if (priceRange < 0.1) decimals = 6;
    else if (priceRange < 10) decimals = 4;
    else if (priceRange < 100) decimals = 2;
    else decimals = 0;

    console.log('[Chart] Y-axis formatting:', {
      minPrice,
      maxPrice,
      priceRange,
      decimals,
      sampleTicks: y.ticks(6).map((d) => d.toFixed(8)),
    });

    const yAxis = d3
      .axisLeft(y)
      .ticks(6)
      .tickFormat((d) => d.toFixed(decimals));

    svg
      .append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .style('fill', '#888')
      .style('font-size', '12px');

    svg.selectAll('.y-axis path, .y-axis line').style('stroke', '#ddd');

    // Add Y axis label
    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - height / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('fill', '#667eea')
      .style('font-weight', '600')
      .style('font-size', '14px')
      .text('Price (PLUR)');

    // Add interactive points and tooltip
    if (this.hasData) {
      const tooltip = d3.select(this.tooltipElement);

      // Add invisible overlay for mouse tracking
      const overlay = svg
        .append('rect')
        .attr('class', 'overlay')
        .attr('width', width)
        .attr('height', height)
        .style('fill', 'none')
        .style('pointer-events', 'all');

      // Add focus elements
      const focus = svg
        .append('g')
        .attr('class', 'focus')
        .style('display', 'none');

      focus
        .append('circle')
        .attr('r', 5)
        .style('fill', '#764ba2')
        .style('stroke', '#fff')
        .style('stroke-width', 2);

      focus
        .append('line')
        .attr('class', 'vertical-line')
        .style('stroke', '#764ba2')
        .style('stroke-width', 1)
        .style('stroke-dasharray', '3,3')
        .style('opacity', 0.5);

      // Bisector for finding nearest data point by block number
      const bisect = d3.bisector((d) => d.blockNumber).left;

      overlay
        .on('mouseover', () => {
          focus.style('display', null);
          tooltip.style('display', 'block');
        })
        .on('mouseout', () => {
          focus.style('display', 'none');
          tooltip.style('display', 'none');
        })
        .on('mousemove', (event) => {
          const [mouseX] = d3.pointer(event);
          const x0 = x.invert(mouseX);
          const i = bisect(data, x0, 1);
          const d0 = data[i - 1];
          const d1 = data[i];
          if (!d0 || !d1) return;

          const d = x0 - d0.blockNumber > d1.blockNumber - x0 ? d1 : d0;

          focus.attr(
            'transform',
            `translate(${x(d.blockNumber)},${y(d.pricePLUR)})`
          );

          focus
            .select('.vertical-line')
            .attr('y1', 0)
            .attr('y2', height - y(d.pricePLUR));

          // Position tooltip
          const tooltipX = event.pageX;
          const tooltipY = event.pageY - 80;

          tooltip.style('left', `${tooltipX}px`).style('top', `${tooltipY}px`)
            .html(`
              <div class="tooltip-date">${d3.timeFormat('%B %d, %Y')(d.date)}</div>
              <div class="tooltip-price">${d.pricePLUR.toFixed(6)} PLUR</div>
              <div class="tooltip-block">Block: ${d.blockNumber.toLocaleString()}</div>
            `);
        });

      // Add data points
      svg
        .selectAll('.dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('cx', (d) => x(d.blockNumber))
        .attr('cy', height)
        .attr('r', 0)
        .style('fill', '#764ba2')
        .style('stroke', '#fff')
        .style('stroke-width', 2)
        .style('opacity', 0.8)
        .transition()
        .delay((d, i) => i * 20)
        .duration(500)
        .attr('cy', (d) => y(d.pricePLUR))
        .attr('r', 4);
    }
  }

  <template>
    <div class="price-chart-container">
      <div class="price-chart-header">
        <h2>30-Day Price Trend</h2>
        {{#unless this.hasData}}
          <span class="loading-indicator">Loading data...</span>
        {{/unless}}
      </div>
      <div class="price-chart-wrapper">
        <div
          class="price-chart"
          {{chartSetup this.setupChart}}
          {{chartUpdate data=@data updateFn=this.updateChart}}
        ></div>
        <div class="chart-tooltip" {{chartSetup this.setupTooltip}}></div>
      </div>
    </div>
  </template>
}
