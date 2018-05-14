import { moduleFor, test } from 'ember-qunit';
import Ember from 'ember';

const {
  set,
  getOwner,
} = Ember;

moduleFor('service:filestack', 'Unit | Service | filestack', {
  needs: ['config:environment'],
  beforeEach: function() {
    const config = getOwner(this).resolveRegistration('config:environment');
    set(config, 'filestackContentCDN', null);
    set(config, 'filestackProcessCDN', null);
  },
});

test('it exists', function (assert) {
  let service = this.subject();
  assert.ok(service);
});

test('it resolves the promise ', function (assert) {
  var service = this.subject();
  var promise = service.get('promise');

  assert.ok(promise instanceof Ember.RSVP.Promise, "promise' value is an intance of proper RSVP.Promise");

  return promise.then(function (filepicker) {
    assert.ok(!!filepicker, 'instance exists');
    assert.equal(typeof filepicker.pick, 'function', 'The resolved filepicker object has pick method');
  });
});

test('it returns a proper filepicker instance', function (assert) {
  var service = this.subject();
  return service.get('promise').then(function (filepicker) {
    assert.equal(service.get('instance'), filepicker, "'instance' value is the resolved filepicker object");
  });
});

test('it builds a filestack URL', function(assert) {
  var service = this.subject();
  let expected = 'https://cdn.filestackcontent.com/123ABC';
  assert.equal(service.imageUrl("123ABC"), expected);
});
