import Component from '@ember/component';
import { scheduleOnce } from '@ember/runloop';
import { inject as service } from '@ember/service';
import layout from './template';

export default Component.extend({
  layout,

  filestack: service(),

  actions: {
    handleSelection (data) {
      if (this.get('onSelection')) {
        this.get('onSelection')(data);
      }
    },

    handleError (data) {
      if (data.code === 101 && this.get('onClose')) {
        this.get('onClose')();
      } else if (this.get('onError')) {
        this.get('onError')(data);
      }
    },

    handleClose () {
      const oc = this.get('onClose');
      if (oc) {
        oc();
      }
    }
  },

  getCallClose () {
    return () => {
      this.send('handleClose');
    };
  },

  onSelection: null,
  onError: null,
  onClose: null,
  options: null,

  didInsertElement() {
    this._super(...arguments);
    scheduleOnce('afterRender', this, function () {
      this.get('filestack.promise').then((filestack) => {
        let options = this.get('options') || {};
        options['onClose'] = options['onClose'] || this.getCallClose();
        filestack.pick(options).then((data) => {
          this.send('handleSelection', data);
        }).catch((data) => {
          this.send('handleError', data);
        });
      });
    });
  }
});
