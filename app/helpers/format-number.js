import { helper } from '@ember/component/helper';

export default helper(function formatNumber([value, options = {}]) {
  if (value === null || value === undefined) return '-';
  return value.toLocaleString('en-US', options);
});


