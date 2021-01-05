import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';
import { isBlank } from '@ember/utils';
import { join } from '@ember/runloop';
import { warn } from '@ember/debug';

export default Helper.extend({
  filestack: service(),

  compute([handleOrUrl], transformations) {
    if (typeof FastBoot !== 'undefined') {
      return;
    }

    if (isBlank(handleOrUrl)) {
      return;
    }

    if (!this.filestack.client) {
      this.filestack.initClient().then(() => {
        // workaround bug https://github.com/emberjs/ember.js/issues/14774
        join(() => this.recompute());
      });
      return;
    }

    try {
      return this.filestack.getUrl(handleOrUrl, transformations);
    } catch (e) {
      warn(`An error occurred while trying to generate a filestack url for the handle '${handleOrUrl}'. Is this a valid filestack handle or url? Error: ${e}`, {
        id: 'ember-filestack.filestack-url-generation'
      });
      return '';
    }
  }
});
