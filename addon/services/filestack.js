import Service from '@ember/service';
import { Promise } from 'rsvp';
import { assign } from '@ember/polyfills';
import { reads } from '@ember/object/computed';
import { getOwner } from '@ember/application';
import { getProperties, computed } from '@ember/object';
import { isPresent, isEmpty } from '@ember/utils';
import { later } from '@ember/runloop';

const defaultContentCDN = 'https://cdn.filestackcontent.com';
const defaultContentCDNRegex = new RegExp(`^${defaultContentCDN}`);

const defaultConfig = {
  filestackProcessCDN: 'https://process.filestackapi.com',
  filestackContentCDN: defaultContentCDN,
  filestackLoadTimeout: 10000,
};

const configurationKeys = [
  'filestackContentCDN',
  'filestackKey',
  'filestackLoadTimeout',
  'filestackProcessCDN',
]

export default Service.extend({
  promise: null,
  instance: null,
  apiKey: reads('config.filestackKey'),
  processCDN: reads('config.filestackProcessCDN'),
  contentCDN: reads('config.filestackContentCDN'),
  loadTimeout: reads('config.filestackLoadTimeout'),
  isUsingCustomContentCDN: computed('contentCDN', function() {
    return this.get('contentCDN') !== defaultContentCDN;
  }),

  init() {
    this._super(...arguments);
    this._loadConfig();
    if (typeof FastBoot === 'undefined') {
      this._initFilestack();
    }
  },

  imageUrl(handleOrUrl, transformations={}) {
    if (!handleOrUrl) { return ''; }

    let processUrl, contentUrl;
    let transformationParts = this._buildTransformations(transformations);
    let isUrl = handleOrUrl.match(/^http(s?):\/\//);

    if (isUrl) {
      // If it’s a URL then make sure it always loads from the content CDN
      // ex: https://cdn.filestackcontent.com/0GI1H4G7TEO8SWRoOpXN => https://theworldsbestcdn.website/0GI1H4G7TEO8SWRoOpXN
      contentUrl = handleOrUrl.replace(defaultContentCDNRegex, this.get('contentCDN'));
    } else {
      // If it’s not a URL treat it as a Filestack FileLink Handle
      // ex: 0GI1H4G7TEO8SWRoOpXN => https://theworldsbestcdn.website/0GI1H4G7TEO8SWRoOpXN
      contentUrl = `${this.get('contentCDN')}/${handleOrUrl}`;
    }

    if (isEmpty(transformationParts)) {
      return contentUrl;
    } else {
      // if transformations are present then we need to call the Filestack Process API
      if (isUrl) {
        // If it’s content from a URL, we need to use the Filestack API key
        processUrl = `${this.get('processCDN')}/${this.get('apiKey')}`;
      } else {
        // If it’s a Filestack FileLink Handle, no API key is necessary
        processUrl = this.get('processCDN');
      }

      return [processUrl, transformationParts.join('/'), handleOrUrl].join('/');
    }
  },

  _loadConfig() {
    let ENV = getOwner(this).resolveRegistration('config:environment');
    let config = getProperties(ENV, ...configurationKeys);
    // clean out `config` since `getProperties` will return an object with valueless keys
    configurationKeys.forEach((key) => (config[key] == null) && delete config[key]);

    let mergedConfig = assign({}, defaultConfig, config);

    this.set('config', mergedConfig);
  },

  _buildTransformations(transformationHashes) {
    let parts = [];
    let transformations = assign({}, transformationHashes);
    let transformationKeys = Object.keys(transformations);

    // Immediately ignore legacy resize options if explicit 'resize' is provided
    if (transformationKeys.indexOf('resize') !== -1) {
      delete(transformations.width);
      delete(transformations.height);
      delete(transformations.fit);
    }

    let legacyResizeKeys = ['width', 'height', 'fit', 'align'].filter((legacyKey) => transformationKeys.indexOf(legacyKey) !== -1);

    if (legacyResizeKeys.length > 0) {
      transformations['resize'] = {};

      legacyResizeKeys.forEach((legacyResizeKey) => {
        transformations.resize[legacyResizeKey] = transformations[legacyResizeKey];
        delete(transformations[legacyResizeKey]);
      });
    }

    Object.keys(transformations).forEach((transformationName) => {
      let optionsHash = transformations[transformationName];
      let options = (this.transformationBuilders[transformationName] || this.transformationBuilders._default).call(this, optionsHash);
      let transformationValue = options.join(',');

      if (transformationValue) {
        parts.push(`${transformationName}=${transformationValue}`);
      }
    });

    return parts;
  },

  _initFilestack() {
    var _isPromiseFulfilled = false;

    this.set('promise', new Promise((resolve, reject) => {
      const apiKey = this.get('apiKey');
      if (!apiKey) {
        reject(new Error('Filestack API key not found.'));
        return;
      }

      import('filestack-js').then((filestack) => {
        if (filestack && filestack.default && filestack.default.init) {
          const instance = filestack.default.init(apiKey);

          if (!(this.isDestroyed || this.isDestroying)) {
            this.set('instance', instance);
          }

          resolve(instance);
          _isPromiseFulfilled = true;
        } else {
          reject(new Error('Filestack not found.'));
          return;
        }
      });

      later(this, function() {
        if (!_isPromiseFulfilled){
          reject.call(null, new Error('Filestack load timeout.'));
        }
      }, this.get('loadTimeout'));
    }));
  },

  transformationBuilders: Object.freeze({
    _default(options) {
      let optionStrings = [];

      Object.keys(options).forEach((optionName) => {
        let optionValue = options[optionName];

        if (isPresent(optionValue)) {
          optionStrings.push(`${optionName}:${optionValue.toString()}`);
        }
      });

      return optionStrings;
    },

    resize(options) {
      if (!options.width && !options.height) { return []; }

      return this.transformationBuilders._default(options);
    }
  })
});
