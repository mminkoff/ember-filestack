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
    let resizeOptions, urlRoot, imageUrl;
    if(!token) {
      return '';
    }
    if(token.match(/http(s?):\/\//)) {
      imageUrl = token;
      urlRoot = `https://process.filestackapi.com/${this.get('key')}`;
    } else {
      imageUrl = `https://cdn.filestackcontent.com/${token}`;
      urlRoot = 'https://process.filestackapi.com';
    }
    Object.keys(hash).forEach((key) => {
      let value = hash[key];
      if(value) {
        options.push(`${key}:${value}`);
      }
    });

    // API requires width or height
    if(options.length >= 1 && (hash.width || hash.height)) {
      resizeOptions = `resize=${options.join(',')}`;
    } else {
      return imageUrl;
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
