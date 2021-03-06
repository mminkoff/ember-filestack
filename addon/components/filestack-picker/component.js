import Component from '@ember/component';
import { computed } from '@ember/object';
import { assign } from '@ember/polyfills';
import { inject as service } from '@ember/service';

export default Component.extend({
  tagName: '',

  filestack: service(),

  // All the possible picker options taken from https://filestack.github.io/filestack-js/interfaces/pickeroptions.html
  pickerOptions: Object.freeze([
    'accept', 'allowManualRetry', 'cleanupImageExif', 'concurrency', 'container', 'customSourceContainer',
    'customSourceName', 'customSourcePath', 'customText', 'disableStorageKey', 'disableThumbnails',
    'disableTransformer', 'displayMode', 'dropPane', 'exposeOriginalFile', 'fromSources', 'globalDropZone',
    'hideModalWhenUploading', 'imageDim', 'imageMax', 'imageMin', 'lang', 'maxFiles', 'maxSize', 'minFiles',
    'modalSize', 'onCancel', 'onClose', 'onFileSelected', 'onFileUploadFailed', 'onFileUploadFinished',
    'onFileUploadProgress', 'onFileUploadStarted', 'onOpen', 'onUploadDone', 'onUploadStarted', 'preferLinkOverStore',
    'rootId', 'startUploadingWhenMaxFilesReached', 'storeTo', 'transformations', 'uploadConfig', 'uploadInBackground',
    'videoResolution'
  ]),

  // gathers all the options to initialize picker
  gatheredOptions: computed('pickerOptions.[]', function() {
    let options = {};

    this.pickerOptions.forEach((o) => {
      let value = this.get(o);

      if (value !== undefined) {
        options[o] = value;
      }
    });

    return options;
  }),

  didInsertElement() {
    this._super(...arguments);
    this.initPicker();
  },

  didUpdateAttrs() {
    if (this.picker) {
      this.picker.close();
    }
    this.initPicker();
  },

  async initPicker() {
    if (typeof FastBoot !== 'undefined') {
      return;
    }

    try {
      await this.filestack.initClient();

      let options = this.options || {};
      let gatheredOptions = this.gatheredOptions;
      let pickerOptions = assign({}, options, gatheredOptions);

      let picker = await this.filestack.getPicker(pickerOptions);
      await picker.open();

      this.picker = picker;
    } catch(e) {
      if (this.onError) {
        this.onError(e);
      } else {
        throw e;
      }
    }
  }
});
