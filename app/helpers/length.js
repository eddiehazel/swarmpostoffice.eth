import { helper } from '@ember/component/helper';

export default helper(function length([value]) {
  if (typeof value === 'string' || Array.isArray(value)) {
    return value.length;
  }
  return 0;
});
