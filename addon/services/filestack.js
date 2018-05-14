import Ember from 'ember';
import filestack from 'filestack';

const {
  RSVP: { Promise },
  computed: { reads },
  getOwner,
  getProperties,
  isEmpty,
  run: { later },
} = Ember;

const defaultContentCDN = "https://cdn.filestackcontent.com";
const defaultContentCDNRegex = new RegExp(`^${defaultContentCDN}`);

const defaultConfig = {
  filestackProcessCDN: "https://process.filestackapi.com",
  filestackContentCDN: defaultContentCDN,
  filestackLoadTimeout: 10000,
};

const configurationKeys = [
  'filestackContentCDN',
  'filestackKey',
  'filestackLoadTimeout',
  'filestackProcessCDN',
]

export default Ember.Service.extend({
  promise: null,
  instance: null,
  apiKey: reads('config.filestackKey'),
  processCDN: reads('config.filestackProcessCDN'),
  contentCDN: reads('config.filestackContentCDN'),
  loadTimeout: reads('config.filestackLoadTimeout'),
  fastboot: Ember.computed(function() {
    return getOwner(this).lookup('service:fastboot');
  }),
  isUsingCustomContentCDN: Ember.computed('contentCDN', function() {
    return this.get('contentCDN') !== defaultContentCDN;
  }),

  init() {
    this._super(...arguments);
    this._loadConfig();
    if (!this.get('fastboot.isFastBoot')) {
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
    let mergedConfig = {};

    // clean out `config` since `getProperties` will return an object with valueless keys
    configurationKeys.forEach((key) => (config[key] == null) && delete config[key]);

    // cannot use `assign` since it is unavailable in Ember 2.4
    configurationKeys.forEach((key) => {
      mergedConfig[key] = config[key] || defaultConfig[key];
    });

    this.set('config', mergedConfig);
  },

  _buildTransformations(transformationHashes) {
    let parts = [];
    let transformations = Object.assign({}, transformationHashes);
    let transformationKeys = Object.keys(transformations);

    // Immediately ignore legacy resize options if explicit 'resize' is provided
    if (transformationKeys.includes('resize')) {
      delete(transformations.width);
      delete(transformations.height);
      delete(transformations.fit);
    }

    let legacyResizeKeys = ['width', 'height', 'fit', 'align'].filter((legacyKey) => transformationKeys.includes(legacyKey));

    if (legacyResizeKeys.length > 0) {
      transformations['resize'] = {};

      legacyResizeKeys.forEach((legacyResizeKey) => {
        transformations.resize[legacyResizeKey] = transformations[legacyResizeKey];
        delete(transformations[legacyResizeKey]);
      });
    }

    Object.keys(transformations).forEach((transformationName) => {
      let optionsHash = transformations[transformationName];
      let options = (this.transformationBuilders[transformationName] || this.transformationBuilders._default)(optionsHash);
      let transformationValue = options.join(',');

      if (transformationValue) {
        parts.push(`${transformationName}=${transformationValue}`);
      }
    });

    return parts;
  },

  _initFilestack() {
    var _isPromiseFulfilled = false;

    this.set('promise', new Promise((resolve, reject)=> {
      const apiKey = this.get('apiKey');
      if (!apiKey) {
        reject(new Error("Filestack API key not found."));
        return;
      }

      if (filestack && filestack.init) {
        const instance = filestack.init(apiKey);

        if (!(this.isDestroyed || this.isDestroying)) {
          this.set('instance', instance);
        }

        resolve(instance);
        _isPromiseFulfilled = true;
      } else {
        reject(new Error("Filestack not found."));
        return;
      }

      later(this, function(){
        if (!_isPromiseFulfilled){
          reject.call(null, new Error('Filestack load timeout.'));
        }
      }, this.get('loadTimeout'));
    }));
  },

  transformationBuilders: {
    _default(options) {
      let optionStrings = [];

      Object.keys(options).forEach((optionName) => {
        let optionValue = options[optionName];

        if (optionValue) {
          optionStrings.push(`${optionName}:${optionValue}`);
        }
      });

      return optionStrings;
    },

    resize(options) {
      if (!options.width && !options.height) { return []; }

      let optionStrings = [];

      Object.keys(options).forEach((optionName) => {
        let optionValue = options[optionName];

        if (optionValue) {
          optionStrings.push(`${optionName}:${optionValue}`);
        }
      });

      return optionStrings;
    },
  }
});

// let {
//   ascii,
//   blackwhite,
//   blur,
//   blurFaces,
//   border,
//   cache,
//   circle,
//   collage,
//   compress,
//   crop,
//   cropFaces,
//   debug,
//   detectFaces,
//   enhance,
//   flip,
//   flop,
//   modulate,
//   monochrome,
//   negative,
//   oilPaint,
//   output,
//   partialBlur,
//   partialPixelate,
//   pixelate,
//   pixelateFaces,
//   polaroid,
//   quality,
//   redeye,
//   resize,
//   rotate,
//   roundedCorners,
//   security,
//   sepia,
//   shadow,
//   sharpen,
//   store,
//   tornEdges,
//   upscale,
//   urlscreenshot,
//   vignette,
//   watermark,
//   zip,
//   } = transformations;
