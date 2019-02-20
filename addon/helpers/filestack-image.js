import FilestackUrlHelper from './filestack-url';
import { deprecate } from '@ember/application/deprecations';

export default FilestackUrlHelper.extend({

  compute() {
    deprecate('`filestack-image` helper is deprecated and will be removed in future versions. Please use `filestack-url` helper instead and check documentation on its new features.',
      false,
      {
        id: 'ember-filestack.filestack-image',
        until: '2.0.0',
        url: 'https://github.com/mminkoff/ember-filestack/blob/master/MIGRATION.md'
      }
    );

    return this._super(...arguments);
  }

});
