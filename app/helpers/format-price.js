import { helper } from '@ember/component/helper';

export default helper(function formatPrice([price]) {
  if (price === null || price === undefined) return '-';
  return price.toLocaleString();
});
