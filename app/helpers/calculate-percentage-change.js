import { helper } from '@ember/component/helper';

export default helper(function calculatePercentageChange([oldPrice, newPrice]) {
  if (oldPrice === 0) return 0;
  return parseFloat((((newPrice - oldPrice) / oldPrice) * 100).toFixed(2));
});
