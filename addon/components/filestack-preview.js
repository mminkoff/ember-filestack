import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { guidFor } from '@ember/object/internals';

export default class FilestackPreviewComponent extends Component {
  @service filestack;

  // create default id
  get id() {
    return this.args.id || guidFor(this);
  }

  // All the possible preview options taken from https://filestack.github.io/filestack-js/interfaces/previewoptions.html
  previewOptions = ['css', 'id'];

  // gathers all the options to initialize picker
  get gatheredOptions() {
    let options = {};

    for (let o of this.previewOptions) {
      let value = this.args[o] || this[o];

      if (value !== undefined) {
        options[o] = value;
      }
    }

    return options;
  }

  constructor() {
    super(...arguments);
    this.initPreview();
  }

  async initPreview() {
    if (typeof FastBoot !== 'undefined') {
      return;
    }

    let handle = this.args.handle;

    if (!handle) {
      throw new Error(
        'Attempted to preview file without setting mandatory `handle` argument.'
      );
    }

    try {
      await this.filestack.initClient();

      let options = this.options || {};
      let gatheredOptions = this.gatheredOptions;
      let pickerOptions = Object.assign({}, options, gatheredOptions);

      this.filestack.preview(handle, pickerOptions);
    } catch (e) {
      if (this.args.onError) {
        this.args.onError(e);
      } else {
        throw e;
      }
    }
  }
}
