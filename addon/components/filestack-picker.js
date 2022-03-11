import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class FilestackPickerComponent extends Component {
  @service filestack;

  // All the possible picker options taken from https://filestack.github.io/filestack-js/interfaces/pickeroptions.html
  pickerOptions = [
    'accept',
    'allowManualRetry',
    'cleanupImageExif',
    'concurrency',
    'container',
    'customSourceContainer',
    'customSourceName',
    'customSourcePath',
    'customText',
    'disableStorageKey',
    'disableThumbnails',
    'disableTransformer',
    'displayMode',
    'dropPane',
    'exposeOriginalFile',
    'fromSources',
    'globalDropZone',
    'hideModalWhenUploading',
    'imageDim',
    'imageMax',
    'imageMin',
    'lang',
    'maxFiles',
    'maxSize',
    'minFiles',
    'modalSize',
    'onCancel',
    'onClose',
    'onFileSelected',
    'onFileUploadFailed',
    'onFileUploadFinished',
    'onFileUploadProgress',
    'onFileUploadStarted',
    'onOpen',
    'onUploadDone',
    'onUploadStarted',
    'preferLinkOverStore',
    'rootId',
    'startUploadingWhenMaxFilesReached',
    'storeTo',
    'transformations',
    'uploadConfig',
    'uploadInBackground',
    'videoResolution',
  ];

  // gathers all the options to initialize picker
  get gatheredOptions() {
    let options = {};

    for (let o of this.pickerOptions) {
      let value = this.args[o] || this[o];

      if (value !== undefined) {
        options[o] = value;
      }
    }

    return options;
  }

  constructor() {
    super(...arguments);
    this.initPicker();
  }

  async initPicker() {
    if (typeof FastBoot !== 'undefined') {
      return;
    }

    try {
      await this.filestack.initClient();

      let options = this.args.options || {};
      let gatheredOptions = this.gatheredOptions;
      let pickerOptions = Object.assign({}, options, gatheredOptions);

      let picker = await this.filestack.getPicker(pickerOptions);
      await picker.open();

      this.picker = picker;
    } catch (e) {
      if (this.args.onError) {
        this.args.onError(e);
      } else {
        throw e;
      }
    }
  }
}
