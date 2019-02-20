import Component from '@ember/component';
import layout from './template';

import { deprecate } from '@ember/application/deprecations';

export default Component.extend({
  tagName: '',
  layout,

  init() {
    this._super(...arguments);

    deprecate('`ember-filestack-picker` component is deprecated and will be removed in future versions. Please use `filestack-picker` component instead and check documentation on its new features.',
      false,
      {
        id: 'ember-filestack.ember-filestack-picker',
        until: '3.0.0',
        url: 'https://github.com/mminkoff/ember-filestack/blob/master/MIGRATION.md'
      }
    );
  }
});
