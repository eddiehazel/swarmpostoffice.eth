import { helper } from '@ember/component/helper';

export default helper(function notEq([a, b]) {
  return a !== b;
});
