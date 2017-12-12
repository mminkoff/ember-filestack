import Ember from 'ember';

const {
  computed,
  computed: { alias },
  getOwner,
  Helper,
} = Ember;

export default Helper.extend({
  config: computed(function() {
    return getOwner(this).resolveRegistration('config:environment');
  }),
  key: alias('config.filestackKey'),
  compute([token], hash) {
    let options = [];
    let resizeOptions, urlRoot;
    if(!token) {
      return '';
    }
    Object.keys(hash).forEach((key) => {
      let value = hash[key];
      if(value) {
        options.push(`${key}:${value}`);
      }
    });

    if(options.length >= 1) {
      resizeOptions = `resize=${options.join(',')}`;
    } else {
      resizeOptions = null;
    }

    if(token.match(/http(s?):\/\//)) {
      urlRoot = `https://process.filestackapi.com/${this.get('key')}`;
    } else {
      urlRoot = 'https://process.filestackapi.com';
    }
    return [
      urlRoot,
      resizeOptions,
      token,
    ].filter((element) => {
      return element;
    }).join('/');
  }
});
