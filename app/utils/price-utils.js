/**
 * Calculate percentage change between two prices
 */
export function calculatePercentageChange(oldPrice, newPrice) {
  if (oldPrice === 0) return 0;
  return parseFloat((((newPrice - oldPrice) / oldPrice) * 100).toFixed(2));
}

/**
 * Format price with commas
 */
export function formatPrice(price) {
  return price.toLocaleString();
}

/**
 * Format datetime from timestamp
 */
export function formatDateTime(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Parse event data into structured format
 */
export function parseEvent(event, previousPrice = null) {
  const hexToDecimal = (hex) => parseInt(hex, 16);

  const blockNumber = hexToDecimal(event.blockNumber);
  const price = hexToDecimal(event.data);
  const timestamp = hexToDecimal(event.timeStamp);

  let percentageChange = 0;
  let priceChange = 0;

  if (previousPrice !== null) {
    priceChange = price - previousPrice;
    percentageChange = calculatePercentageChange(previousPrice, price);
  }

  return {
    blockNumber,
    price,
    timestamp,
    percentageChange,
    priceChange,
    txHash: event.transactionHash,
  };
}
