import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { modifier } from 'ember-modifier';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

// Register Chart.js components
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default class PriceChartsComponent extends Component {
  @service etherscanApi;
  @tracked dailyData = [];
  @tracked weeklyData = [];
  @tracked monthlyData = [];
  @tracked isLoading = true;
  @tracked error = null;

  dailyChart = null;
  weeklyChart = null;
  monthlyChart = null;

  setupChart = modifier((element, [chartType]) => {
    this.loadChartData();

    return () => {
      // Cleanup charts on component destroy
      if (this.dailyChart) this.dailyChart.destroy();
      if (this.weeklyChart) this.weeklyChart.destroy();
      if (this.monthlyChart) this.monthlyChart.destroy();
    };
  });

  @action
  async loadChartData() {
    try {
      this.isLoading = true;
      this.error = null;

      // Load all three datasets
      const [daily, weekly, monthly] = await Promise.all([
        this.etherscanApi.getDailyChartData(),
        this.etherscanApi.getWeeklyChartData(),
        this.etherscanApi.getMonthlyChartData(),
      ]);

      this.dailyData = daily;
      this.weeklyData = weekly;
      this.monthlyData = monthly;

      // Create charts after data is loaded
      this.createCharts();
    } catch (err) {
      console.error('Error loading chart data:', err);
      this.error = err.message;
    } finally {
      this.isLoading = false;
    }
  }

  @action
  createCharts() {
    // Create daily chart
    const dailyCanvas = document.getElementById('daily-chart');
    if (dailyCanvas && this.dailyData.length > 0) {
      if (this.dailyChart) this.dailyChart.destroy();
      this.dailyChart = new Chart(dailyCanvas, {
        type: 'line',
        data: {
          labels: this.dailyData.map((d) => d.date),
          datasets: [
            {
              label: 'Price (PLUR)',
              data: this.dailyData.map((d) => d.price),
              borderColor: '#667eea',
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
              fill: true,
              tension: 0.4,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ],
        },
        options: this.getChartOptions('Daily Price - Last 2 Weeks'),
      });
    }

    // Create weekly chart
    const weeklyCanvas = document.getElementById('weekly-chart');
    if (weeklyCanvas && this.weeklyData.length > 0) {
      if (this.weeklyChart) this.weeklyChart.destroy();
      this.weeklyChart = new Chart(weeklyCanvas, {
        type: 'line',
        data: {
          labels: this.weeklyData.map((d) => d.date),
          datasets: [
            {
              label: 'Price (PLUR)',
              data: this.weeklyData.map((d) => d.price),
              borderColor: '#764ba2',
              backgroundColor: 'rgba(118, 75, 162, 0.1)',
              fill: true,
              tension: 0.4,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ],
        },
        options: this.getChartOptions('Weekly Price - Last 3 Months'),
      });
    }

    // Create monthly chart
    const monthlyCanvas = document.getElementById('monthly-chart');
    if (monthlyCanvas && this.monthlyData.length > 0) {
      if (this.monthlyChart) this.monthlyChart.destroy();
      this.monthlyChart = new Chart(monthlyCanvas, {
        type: 'line',
        data: {
          labels: this.monthlyData.map((d) => d.date),
          datasets: [
            {
              label: 'Price (PLUR)',
              data: this.monthlyData.map((d) => d.price),
              borderColor: '#f093fb',
              backgroundColor: 'rgba(240, 147, 251, 0.1)',
              fill: true,
              tension: 0.4,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ],
        },
        options: this.getChartOptions('Monthly Price - Last Year'),
      });
    }
  }

  getChartOptions(title) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: title,
          color: '#333',
          font: {
            size: 16,
            weight: 'bold',
          },
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: (context) => {
              const value = context.parsed.y;
              return `Price: ${value.toLocaleString()} PLUR`;
            },
          },
        },
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day',
            displayFormats: {
              day: 'MMM d',
            },
          },
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: false,
          ticks: {
            callback: (value) => value.toLocaleString(),
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)',
          },
        },
      },
    };
  }

  <template>
    <div class="price-charts" {{this.setupChart}}>
      {{#if this.isLoading}}
        <div class="charts-loading">
          <div class="loading-spinner"></div>
          <p>Loading price charts...</p>
        </div>
      {{else if this.error}}
        <div class="charts-error">
          <p>Error loading charts: {{this.error}}</p>
        </div>
      {{else}}
        <div class="charts-grid">
          <div class="chart-container">
            <canvas id="daily-chart"></canvas>
          </div>
          <div class="chart-container">
            <canvas id="weekly-chart"></canvas>
          </div>
          <div class="chart-container">
            <canvas id="monthly-chart"></canvas>
          </div>
        </div>
      {{/if}}
    </div>
  </template>
}
