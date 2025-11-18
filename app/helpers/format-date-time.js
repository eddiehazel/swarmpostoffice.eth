import { helper } from '@ember/component/helper';

export default helper(function formatDateTime([timestamp]) {
  if (!timestamp) return '-';
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
});
