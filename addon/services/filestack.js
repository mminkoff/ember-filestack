import Service from '@ember/service';
import { getOwner } from '@ember/application';
import { assign } from '@ember/polyfills';
import sanitizeTransformations from 'ember-filestack/utils/sanitize-transformations';
import { deprecate } from '@ember/application/deprecations';
import { computed } from '@ember/object';

export default Service.extend({

  promise: computed(function() {
    deprecate('Using the `promise` property of the `filestack` service is deprecated. Please use the `filestack.initClient()` function instead.',
      false,
      {
        id: 'ember-filestack.service-promise',
        until: '3.0.0',
        url: 'https://github.com/mminkoff/ember-filestack/blob/master/MIGRATION.md'
      }
    );

    return this.initClient();
  }),

  instance: computed(function() {
    deprecate('Using the `instance` property of the `filestack` service is deprecated. Please use the `filestack.initClient()` function instead.',
      false,
      {
        id: 'ember-filestack.service-instance',
        until: '3.0.0',
        url: 'https://github.com/mminkoff/ember-filestack/blob/master/MIGRATION.md'
      }
    );

    return this.get('client');
  }),

  async initClient() {
    if (this.get('client')) {
      return this.get('client');
    }

    let ENV = getOwner(this).resolveRegistration('config:environment');
    let deprecatedApiKey = ENV.filestackKey;
    let emberFilestackOptions = ENV['ember-filestack'] || {};
    let apiKey = emberFilestackOptions.apiKey || deprecatedApiKey;
    let clientOptions = emberFilestackOptions.clientOptions;

    deprecate('Using `ENV.filestackKey` is deprecated. Please use `ENV[\'ember-filestack\'].apiKey` instead. Please read migration guide for more information.',
      deprecatedApiKey === undefined,
      {
        id: 'ember-filestack.env-filestack-key',
        until: '3.0.0',
        url: 'https://github.com/mminkoff/ember-filestack/blob/master/MIGRATION.md'
      }
    );

    if (!apiKey) {
      throw new Error('Filestack API key not found.');
    }

    let filestack = await import('filestack-js');

    let client = filestack.init(apiKey, clientOptions);

    this.set('client', client);

    return client;
  },

  getUrl(handleOrUrl, transformations) {
    let filestack = this.get('client');
    if (!filestack) {
      throw new Error('Attempted to generate a transform url without calling `initClient` first.');
    }

    // glimmer gives us immutable EmptyObject instances, so we need to clone them
    transformations = assign({}, transformations);
    let ENV = getOwner(this).resolveRegistration('config:environment');
    let deprecatedCDN = ENV.filestackProcessCDN || ENV.filestackContentCDN;
    let emberFilestackOptions = ENV['ember-filestack'] || {};
    let customCDN = emberFilestackOptions.customCDN || deprecatedCDN;
    let isUrl = handleOrUrl.match(/^http(s?):\/\//);
    let filestackUrl;

    deprecate('Using `ENV.filestackProcessCDN` or `ENV.filestackContentCDN` is deprecated. Please use `ENV[\'ember-filestack\'].customCDN` instead. Please read migration guide for more information.',
      deprecatedCDN === undefined,
      {
        id: 'ember-filestack.env-cdn-keys',
        until: '3.0.0',
        url: 'https://github.com/mminkoff/ember-filestack/blob/master/MIGRATION.md'
      }
    );

    if (isUrl && Object.keys(transformations).length === 0) {
      filestackUrl = handleOrUrl;
    } else {
      sanitizeTransformations(transformations);
      filestackUrl = filestack.transform(handleOrUrl, transformations);
    }

    if (customCDN) {
      return filestackUrl.replace(filestack.session.urls.cdnUrl, customCDN);
    } else {
      return filestackUrl;
    }
  },

  async getPicker(options) {
    let filestack = this.get('client');
    if (!filestack) {
      throw new Error('Attempted to generate a transform url without calling `initClient` first.');
    }

    let ENV = getOwner(this).resolveRegistration('config:environment');
    let emberFilestackOptions = ENV['ember-filestack'] || {};
    let configOptions = emberFilestackOptions.pickerOptions;

    let pickerOptions = assign({}, configOptions, options);

    return await filestack.picker(pickerOptions);
  },

  preview(handle, options) {
    let filestack = this.get('client');
    if (!filestack) {
      throw new Error('Attempted to preview file without calling `initClient` first.');
    }

    let ENV = getOwner(this).resolveRegistration('config:environment');
    let emberFilestackOptions = ENV['ember-filestack'] || {};
    let configOptions = emberFilestackOptions.previewOptions;

    let previewOptions = assign({}, configOptions, options);

    return filestack.preview(handle, previewOptions);
  }
});
