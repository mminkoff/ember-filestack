import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { assign } from '@ember/polyfills';
import { inject as service } from '@ember/service';

export default Component.extend({
  filestack: service(),

  // id option defaults to the component's elementId
  id: reads('elementId'),

  // All the possible preview options taken from https://filestack.github.io/filestack-js/interfaces/previewoptions.html
  previewOptions: Object.freeze([
    'css', 'id'
  ]),

  // gathers all the options to initialize picker
  gatheredOptions: computed('previewOptions.[]', function() {
    let options = {};

    this.previewOptions.forEach((o) => {
      let value = this.get(o);

      if (value !== undefined) {
        options[o] = value;
      }
    });

    return options;
  }),

  didInsertElement() {
    this._super(...arguments);
    this.initPreview();
  },

  async initPreview() {
    if (typeof FastBoot !== 'undefined') {
      return;
    }

    let handle = this.handle;
    if (!handle) {
      throw new Error('Attempted to preview file without setting mandatory `handle` argument.');
    }

    try {
      await this.filestack.initClient();

      let options = this.options || {};
      let gatheredOptions = this.gatheredOptions;
      let pickerOptions = assign({}, options, gatheredOptions);

      this.filestack.preview(handle, pickerOptions);
    } catch(e) {
      if (this.onError) {
        this.onError(e);
      } else {
        throw e;
      }
    }
  }
});
