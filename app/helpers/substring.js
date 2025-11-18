import { helper } from '@ember/component/helper';

export default helper(function substring([str, start, end]) {
  if (!str) return '';
  if (end !== undefined) {
    return str.substring(start, end);
  }
  return str.substring(start);
});
