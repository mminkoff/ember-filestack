import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';
import { isBlank } from '@ember/utils';
import { join } from '@ember/runloop';

export default Helper.extend({
  filestack: service(),

  compute([handleOrUrl], transformations) {
    if (typeof FastBoot !== 'undefined') {
      return;
    }

    if (isBlank(handleOrUrl)) {
      return;
    }

    if (!this.get('filestack.client')) {
      this.get('filestack').initClient().then(() => {
        // workaround bug https://github.com/emberjs/ember.js/issues/14774
        join(() => this.recompute());
      });
      return;
    }

    return this.get('filestack').getUrl(handleOrUrl, transformations);
  }
});
