import { modifier } from 'ember-modifier';

export default modifier((element, [setupFn]) => {
  setupFn(element);
});
