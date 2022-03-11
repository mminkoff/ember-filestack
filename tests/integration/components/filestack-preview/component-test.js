import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | filestack preview', function (hooks) {
  setupRenderingTest(hooks);

  test('renders an iframe with filestack preview url', async function (assert) {
    await render(hbs`
      <FilestackPreview @handle="01234567890123456789" />
    `);

    assert.dom('iframe').exists({ count: 1 });
    assert
      .dom('iframe')
      .hasAttribute(
        'src',
        'https://cdn.filestackcontent.com/preview/01234567890123456789'
      );
  });

  test('css argument is reflected on iframe url', async function (assert) {
    await render(hbs`
      <FilestackPreview @handle="01234567890123456789" @css="background-color: yellow" />
    `);

    assert.dom('iframe').exists({ count: 1 });
    assert
      .dom('iframe')
      .hasAttribute(
        'src',
        'https://cdn.filestackcontent.com/preview=css:%22background-color%3A%20yellow%22/01234567890123456789'
      );
  });
});
