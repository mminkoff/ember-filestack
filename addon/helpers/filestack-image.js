import Ember from 'ember';

const {
  Helper,
  inject: { service },
} = Ember;

export default Helper.extend({
  filestack: service(),
  compute([token], hash) {
    return this.get('filestack').buildUrl(token, hash);
  }
});
