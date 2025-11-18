import { helper } from '@ember/component/helper';

export default helper(function concat([...args]) {
  return args.filter(arg => arg != null).join('');
});


