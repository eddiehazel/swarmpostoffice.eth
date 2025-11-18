import { helper } from '@ember/component/helper';

export default helper(function abs([value]) {
  return Math.abs(value);
});
