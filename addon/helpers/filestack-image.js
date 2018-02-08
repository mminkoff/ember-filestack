import Ember from 'ember';

const {
  computed,
  computed: { reads },
  getOwner,
  Helper,
} = Ember;

const defaultProcessUrl = "https://process.filestackapi.com";
const defaultContentUrl = "https://cdn.filestackcontent.com";
const contentUrlRegex = new RegExp(defaultContentUrl);

export default Helper.extend({
  config: computed(function() {
    return getOwner(this).resolveRegistration('config:environment');
  }),
  key: reads('config.filestackKey'),
  customProcessUrl: reads('config.filestackProcessCDN'),
  customContentUrl: reads('config.filestackContentCDN'),
  processUrl: computed(function(){
    return this.get('customProcessUrl') || defaultProcessUrl;
  }),
  contentUrl: computed(function() {
    return this.get('customContentUrl') || defaultContentUrl;
  }),
  compute([token], hash) {
    let options = [];
    let urlRoot, imageUrl;
    if(!token) {
      return '';
    }
    if(token.match(/http(s?):\/\//)) {
      imageUrl = token;
      if(this.get('contentUrl') !== defaultContentUrl && imageUrl.match(contentUrlRegex)) {
        // avoid unnecessary hits to bandwitch quota
        imageUrl = imageUrl.replace(defaultContentUrl, this.get('contentUrl'));
      }
      urlRoot = `${this.get('processUrl')}/${this.get('key')}`;
    } else {
      imageUrl = `${this.get('contentUrl')}/${token}`;
      urlRoot = this.get('processUrl');
    }
    Object.keys(hash).forEach((key) => {
      let value = hash[key];
      if(value) {
        options.push(`${key}:${value}`);
      }
    });

    // API requires width or height
    if(options.length >= 1 && (hash.width || hash.height)) {
      options = `resize=${options.join(',')}`;
    } else {
      // avoid unnecessary hits to transform quota
      return imageUrl;
    }

    return [
      urlRoot,
      options,
      token,
    ].filter((element) => {
      return element;
    }).join('/');
  }
});
