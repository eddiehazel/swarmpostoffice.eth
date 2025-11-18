# Price Update Events Dashboard - Rebuild Prompt

## Project Overview

Create a dynamic, auto-refreshing HTML dashboard that displays price update events from a Gnosis Chain smart contract. The dashboard monitors PriceUpdate events emitted by a price oracle contract and presents them with historical comparisons, animations, and detailed statistics.

## Technical Specifications

### Contract Details

- **Contract Address**: `0x47EeF336e7fE5bED98499A4696bce8f28c1B0a8b`
- **Network**: Gnosis Chain (Chain ID: 100)
- **Event**: `PriceUpdate(uint256 price)`
- **Event Signature Hash**: `0xae46785019700e30375a5d7b4f91e32f8060ef085111f896ebf889450aa2ab5a`
- **Deployment Block**: ~37339192

### API Configuration

- **API Endpoint**: Etherscan API v2 (`https://api.etherscan.io/v2/api`)
- **Required Parameters**:
  - `chainid=100` (Gnosis Chain)
  - `apikey` (user's Etherscan API key)
- **Primary Endpoint Used**: `logs/getLogs` for fetching event logs

### Blockchain Constants (Gnosis Chain)

- **Block Time**: ~5 seconds per block
- **Blocks Per Hour**: ~720 blocks
- **Blocks Per Day**: ~17,280 blocks
- **Blocks Per Week**: ~120,960 blocks
- **Blocks Per Month**: ~518,400 blocks (30 days)

## Core Features

### 1. Real-Time Event Display

- **Display Count**: Last 50 PriceUpdate events
- **Sort Order**: Reverse chronological (newest events at top)
- **Auto-Refresh**: Every 30 seconds
- **Event Information**:
  - Precise datetime (from block timestamp)
  - Current price in PLUR
  - Block number (linked to GnosisScan)
  - Transaction hash (linked to GnosisScan)
  - Price change from previous event (both PLUR amount and percentage)
  - Color-coded changes (green for increase, red for decrease)

### 2. Animated Updates

- **New Event Detection**: Compare transaction hashes between refreshes
- **Animation**: Slide-in effect (0.5s duration, ease-out)
- **Visual Highlight**: Subtle blue gradient background for new events
- **CSS Animation**: `translateY(-20px)` to `translateY(0)` with opacity fade-in

### 3. Statistics Dashboard

Three main statistics cards:

- **Total Events**: Count of fetched events
- **Latest Price**: Most recent price in PLUR
- **Average Change**: Mean percentage change across all events

### 4. Historical Price Comparisons

Four time-based comparison cards showing price changes from:

- **1 Week Ago** (~120,960 blocks back)
- **1 Month Ago** (~518,400 blocks back)
- **3 Months Ago** (~1,555,200 blocks back)
- **6 Months Ago** (~3,110,400 blocks back)

Each historical card displays:

- Historical price at that time
- Absolute price change in PLUR
- Percentage change
- Block number (linked to GnosisScan)
- Exact datetime of the historical event
- Color-coded indicators (green/red for up/down)

### 5. Smart Data Fetching

**Initial Load Process**:

1. Fetch current latest block number using `eth_blockNumber`
2. Calculate optimal block range (go back ~50,000 blocks or ~7 days)
3. Fetch last 50 events from calculated range
4. Parse events and extract price data

**Historical Data Process**:

1. Calculate target blocks for each historical period
2. For each period, fetch events from ±500 blocks around target
3. Find closest event to target block
4. Calculate price differences and percentages

## Design Requirements

### Visual Design

- **Color Scheme**:
  - Primary gradient: Purple to violet (`#667eea` to `#764ba2`)
  - Background: Gradient background
  - Cards: White with subtle shadows
  - Increase color: Green (`#10b981`)
  - Decrease color: Red (`#ef4444`)

- **Typography**:
  - Font: Segoe UI / system fonts
  - Headers: Bold, larger sizes
  - Values: Numeric formatting with commas
  - Labels: Uppercase, smaller, lighter color

- **Layout**:
  - Responsive grid for stat cards
  - Maximum width container (1200px)
  - Card-based design with rounded corners
  - Adequate spacing and padding

### Responsive Design

- Mobile-friendly layout
- Stacked cards on small screens
- Readable font sizes across devices

## Data Processing Logic

### Price Change Calculation

```
percentageChange = ((newPrice - oldPrice) / oldPrice) * 100
priceChange = newPrice - oldPrice
```

### Hex to Decimal Conversion

All blockchain data comes in hex format and must be converted:

- Block numbers: `parseInt(hex, 16)`
- Timestamps: `parseInt(hex, 16)`
- Price data: `parseInt(hex, 16)`

### Event Parsing Order

1. Fetch events (newest to oldest from API)
2. Sort oldest to newest for calculations
3. Calculate changes comparing to previous event
4. Reverse order for display (newest on top)

## API Call Structure

### Fetching Events

```
GET https://api.etherscan.io/v2/api
  ?chainid=100
  &module=logs
  &action=getLogs
  &fromBlock=[calculated]
  &toBlock=[current]
  &address=0x47EeF336e7fE5bED98499A4696bce8f28c1B0a8b
  &topic0=0xae46785019700e30375a5d7b4f91e32f8060ef085111f896ebf889450aa2ab5a
  &page=1
  &offset=1000
  &apikey=[user-key]
```

### Fetching Current Block

```
GET https://api.etherscan.io/v2/api
  ?chainid=100
  &module=proxy
  &action=eth_blockNumber
  &apikey=[user-key]
```

## User Experience Features

### Loading States

- Spinner animation during data fetch
- Loading message
- Error handling with user-friendly messages

### Interactive Elements

- Clickable transaction hashes linking to GnosisScan
- Clickable block numbers linking to GnosisScan
- Hover effects on event cards
- Smooth transitions and animations

### Auto-Refresh Behavior

- Non-intrusive updates every 30 seconds
- Maintains scroll position
- Highlights only genuinely new events
- Smooth animation for new entries

## Implementation Notes

### Single-File Architecture

Everything should be in one HTML file:

- Inline CSS in `<style>` tags
- Inline JavaScript in `<script>` tags
- No external dependencies except API calls

### Security Considerations

- API key embedded in JavaScript (client-side only)
- No server-side code required
- Direct API calls from browser

### Error Handling

- Network errors: Display error message
- API errors: Log to console and show user-friendly message
- Missing data: Show placeholder text ("-")
- Graceful degradation if historical data unavailable

### Performance Optimization

- Batch API calls where possible
- Cache block timestamps when available
- Limit event display to 50 items
- Efficient DOM updates (innerHTML once per refresh)

## Expected File Output

A single `price_updates.html` file that:

- Opens directly in any modern browser
- Requires no installation or build process
- Works with just an internet connection
- Auto-updates every 30 seconds
- Shows beautiful, animated price updates
- Provides historical context with price comparisons

## Testing Checklist

- [ ] Events load correctly on first load
- [ ] 50 most recent events are displayed
- [ ] Events are in reverse chronological order (newest first)
- [ ] Price changes calculate correctly
- [ ] Historical comparisons show accurate data
- [ ] Block and transaction links work
- [ ] Auto-refresh triggers after 30 seconds
- [ ] New events animate in smoothly
- [ ] All timestamps are accurate
- [ ] Mobile responsive layout works
- [ ] Error states display properly

## Additional Context

This dashboard monitors a Swarm network price oracle contract that adjusts storage prices based on network redundancy. The PriceUpdate events represent automatic price adjustments made by the oracle system. Understanding price trends over time helps network participants anticipate storage costs and network health.

---

**Note**: This prompt contains all necessary information to rebuild the dashboard from scratch using any LLM or development tool. The API key should be replaced with the user's own Etherscan API key when implementing.
