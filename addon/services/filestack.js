import Service from '@ember/service';
import { getOwner } from '@ember/application';
import { assign } from '@ember/polyfills';
import sanitizeTransformations from 'ember-filestack/utils/sanitize-transformations';

export default Service.extend({

  async initClient() {
    if (this.client) {
      return this.client;
    }

    let ENV = getOwner(this).resolveRegistration('config:environment');
    let emberFilestackOptions = ENV['ember-filestack'] || {};
    let apiKey = emberFilestackOptions.apiKey;
    let clientOptions = emberFilestackOptions.clientOptions;

    if (!apiKey) {
      throw new Error('Filestack API key not found.');
    }

    let filestack = await import('filestack-js');

    let client = filestack.init(apiKey, clientOptions);

    this.set('client', client);

    return client;
  },

  getUrl(handleOrUrl, transformations) {
    let filestack = this.client;
    if (!filestack) {
      throw new Error('Attempted to generate a transform url without calling `initClient` first.');
    }

    // glimmer gives us immutable EmptyObject instances, so we need to clone them
    transformations = assign({}, transformations);
    let ENV = getOwner(this).resolveRegistration('config:environment');
    let emberFilestackOptions = ENV['ember-filestack'] || {};
    let customCDN = emberFilestackOptions.customCDN;
    let isUrl = handleOrUrl.match(/^http(s?):\/\//);
    let filestackUrl;

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
    let filestack = this.client;
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
    let filestack = this.client;
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
