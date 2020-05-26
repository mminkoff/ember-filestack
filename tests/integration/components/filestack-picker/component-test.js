import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, waitFor } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | filestack picker', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {

    await render(hbs`
      <FilestackPicker/>
    `);

    await waitFor('.fsp-picker');

    assert.dom('.fsp-picker').exists({ count: 1 }, 'pick modal is open');

    // close any open pickers
    await click('.fsp-picker__close-button');

    assert.dom('.fsp-picker', document).doesNotExist('pick modal is closed');
  });

  test('it renders with undefined options', async function(assert) {
    this.set('options', undefined);

    await render(hbs`
      <FilestackPicker @options={{options}} />
    `);

    await waitFor('.fsp-picker');

    assert.dom('.fsp-picker').exists({ count: 1 }, 'pick modal is open');

    // close any open pickers
    await click('.fsp-picker__close-button');

    assert.dom('.fsp-picker').doesNotExist('pick modal is closed');
  });

  test('it calls onClose', async function(assert) {
    this.set('options', { fromSources: ['local_file_system'] });
    this.set('onClose', () => {
      this.set('closed', true);
    });

    await render(hbs`
      <FilestackPicker @onClose={{onClose}} @options={{options}} />
    `);

    await waitFor('.fsp-picker');

    assert.dom('.fsp-picker').exists({ count: 1 }, 'pick modal is open');

    // close any open pickers
    await click('.fsp-picker__close-button');

    assert.equal(this.closed, true);

    assert.dom('.fsp-picker').doesNotExist('pick modal is closed');
  });
});
