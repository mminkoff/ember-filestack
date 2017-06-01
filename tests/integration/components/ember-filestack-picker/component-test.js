import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

moduleForComponent('ember-filestack-picker', 'Integration | Component | ember filestack picker', {
  integration: true
});

test('it renders', function (assert) {
  this.set('options', {fromSources: 'local_file_system'});

  this.render(hbs`{{ember-filestack-picker options=options}}`);

  return wait().then(function () {
    assert.equal(window.$('.fsp-picker').length, 1, 'pick modal is open');

    // close any open pickers
    window.$('.fsp-picker__close-button').click();
  });
});

test('it calls onClose', function (assert) {
  this.set('options', {fromSources: 'local_file_system'});
  this.set('onClose', () => {
    this.set('closed', true);
  });

  this.render(hbs`{{ember-filestack-picker onClose=onClose options=options}}`);

  return wait().then(() => {
    assert.equal(window.$('.fsp-picker').length, 1, 'pick modal is open');

    // close any open pickers
    window.$('.fsp-picker__close-button').click();

    return wait().then(() => {
      assert.equal(this.get('closed'), true);
    });
  });
});
