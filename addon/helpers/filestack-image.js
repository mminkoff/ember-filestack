import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';

export default Helper.extend({
  filestack: service(),
  compute([handleOrUrl], transformations) {
    return this.get('filestack').imageUrl(handleOrUrl, transformations);
  }
});
