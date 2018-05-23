import Ember from 'ember';

const {
  Helper,
  inject: { service },
} = Ember;

export default Helper.extend({
  filestack: service(),
  compute([handleOrUrl], transformations) {
    return this.get('filestack').imageUrl(handleOrUrl, transformations);
  }
});
