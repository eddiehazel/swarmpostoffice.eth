import { modifier } from 'ember-modifier';

export default modifier((element, _positional, { data, updateFn }) => {
  if (data) {
    updateFn();
  }
});
