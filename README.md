# 📬 Price Update Events Dashboard

A beautiful, modern Ember.js dashboard for monitoring PriceUpdate events from a Gnosis Chain smart contract. Built with Ember.js 6.8.0 (Octane edition) using the latest best practices and tools.

## Features

- 🔔 Real-time price update event monitoring
- 📊 Statistics dashboard (Total Events, Latest Price, Average Change)
- 📈 Historical price comparisons (1 week, 1 month, 3 months, 6 months ago)
- 🎨 Beautiful purple gradient UI with smooth animations
- 🔄 Auto-refresh every 30 seconds
- ✨ Slide-in animations for new events
- 📱 Fully responsive design
- ✅ Comprehensive test coverage

## Prerequisites

- Node.js >= 20.11
- npm >= 10

## Installation

```bash
npm install
```

## Running the Application

```bash
npm start
```

Then visit `http://localhost:4200/?key=YOUR_ETHERSCAN_API_KEY`

**Note**: You need to provide your Etherscan API key as a URL parameter: `?key=YOUR_KEY`

## Running Tests

```bash
npm test
```

## Project Structure

```
app/
  components/          # Glimmer components
    event-item.gjs
    event-list.gjs
    historical-comparison.gjs
    stat-card.gjs
  controllers/         # Route controllers
  helpers/             # Template helpers
  routes/              # Application routes
  services/            # Services (API integration)
  styles/              # CSS styles
  templates/           # Route templates
  utils/               # Utility functions
tests/
  acceptance/          # Acceptance tests
  integration/         # Component integration tests
  unit/                # Unit tests
```

## Technology Stack

- **Ember.js 6.8.0** - Latest stable version with Octane edition
- **Vite** - Modern build tool
- **QUnit** - Testing framework
- **Glimmer Components** - Modern component architecture
- **Tracked Properties** - Reactive state management

## API Configuration

The application connects to:

- **Network**: Gnosis Chain (Chain ID: 100)
- **Contract**: `0x47EeF336e7fE5bED98499A4696bce8f28c1B0a8b`
- **API**: Etherscan API v2 (`https://api.etherscan.io/v2/api`)

## Development

This project follows Ember.js best practices:

- Modern Octane syntax (Glimmer components, tracked properties)
- Component-based architecture
- Service-based API integration
- Comprehensive test coverage
- Responsive design

## License

MIT
