import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | filestack picker', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('options', { fromSources: 'local_file_system' });

    await render(hbs`{{filestack-picker options=options}}`);

    assert.dom('.fsp-picker', document).exists({ count: 1 }, 'pick modal is open');

    // close any open pickers
    let button = document.querySelector('.fsp-picker__close-button');
    await click(button);

    assert.dom('.fsp-picker', document).doesNotExist('pick modal is closed');
  });

  test('it renders with undefined options', async function(assert) {
    this.set('options', undefined);

    await render(hbs`{{filestack-picker options=options}}`);

    assert.dom('.fsp-picker', document).exists({ count: 1 }, 'pick modal is open');

    // close any open pickers
    let button = document.querySelector('.fsp-picker__close-button');
    await click(button);

    assert.dom('.fsp-picker', document).doesNotExist('pick modal is closed');
  });

  test('it calls onClose', async function(assert) {
    this.set('options', { fromSources: 'local_file_system' });
    this.set('onClose', () => {
      this.set('closed', true);
    });

    await render(hbs`{{filestack-picker onClose=onClose options=options}}`);

    assert.dom('.fsp-picker', document).exists({ count: 1 }, 'pick modal is open');

    // close any open pickers
    let button = document.querySelector('.fsp-picker__close-button');
    await click(button);

    assert.equal(this.get('closed'), true);

    assert.dom('.fsp-picker', document).doesNotExist('pick modal is closed');
  });
});
