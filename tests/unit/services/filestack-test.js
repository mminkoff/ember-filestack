import { Promise } from 'rsvp';
import { set } from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | filestack', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    const config = this.owner.resolveRegistration('config:environment');
    set(config, 'filestackContentCDN', null);
    set(config, 'filestackProcessCDN', null);
  });

  test('it exists', function (assert) {
    let service = this.owner.lookup('service:filestack');
    assert.ok(service);
  });

  test('it resolves the promise ', function (assert) {
    let service = this.owner.lookup('service:filestack');
    let promise = service.get('promise');

    assert.ok(promise instanceof Promise, "promise' value is an intance of proper RSVP.Promise");

    return promise.then(function (filepicker) {
      assert.ok(!!filepicker, 'instance exists');
      assert.equal(typeof filepicker.pick, 'function', 'The resolved filepicker object has pick method');
    });
  });

  test('it returns a proper filepicker instance', function (assert) {
    let service = this.owner.lookup('service:filestack');
    return service.get('promise').then(function (filepicker) {
      assert.equal(service.get('instance'), filepicker, "'instance' value is the resolved filepicker object");
    });
  });

  test('it builds a filestack URL', function(assert) {
    let expected = 'https://cdn.filestackcontent.com/123ABC';
    let url = this.owner.lookup('service:filestack').imageUrl('123ABC');
    assert.equal(url, expected);
  });

  test('it returns a process URL with resize options', function(assert) {
    let expected = 'https://process.filestackapi.com/resize=width:200,height:300,fit:crop/123ABC';
    let url = this.owner.lookup('service:filestack').imageUrl('123ABC', { resize: { width: 200, height: 300, fit: 'crop' }});
    assert.equal(url, expected);
  });

  test('it returns content URL to cdn.filestackcontent.com', function(assert) {
    let url = this.owner.lookup('service:filestack').imageUrl('123ABC');
    let expected = 'https://cdn.filestackcontent.com/123ABC';
    assert.equal(url, expected);
  });

  test('it handles missing urls', function(assert) {
    let url = this.owner.lookup('service:filestack').imageUrl(null);
    assert.equal(url, '');
  });

  test('it handles missing hash arguments', function(assert) {
    let url = this.owner.lookup('service:filestack').imageUrl('123ABC', { resize: { width: 200, height: 300, fit: null }});
    let expected = 'https://process.filestackapi.com/resize=width:200,height:300/123ABC';
    assert.equal(url, expected);
  });

  test('it returns the original URL when options are missing & passed a URL', function(assert) {
    let imageUrl = 'https://d1wtqaffaaj63z.cloudfront.net/images/NY_199_E_of_Hammertown_2014.jpg';
    let url = this.owner.lookup('service:filestack').imageUrl(imageUrl);
    assert.equal(url, imageUrl);
  });

  test('it does not return a resize transformation if resize options are passed but do not include width or height', function(assert) {
    // resize api requires width and/or height
    // setting ONLY resize=fit:crop returns a 400
    let url = this.owner.lookup('service:filestack').imageUrl('123ABC', { resize: { fit: 'crop' }});
    let expected = 'https://cdn.filestackcontent.com/123ABC';
    assert.equal(url, expected);
  });

  test('it uses the config.filestackProcessCDN when passed an image URL', function(assert) {
    let config = this.owner.resolveRegistration('config:environment');
    let processUrl = 'https://myprocess.cloudfront.com';
    set(config, 'filestackProcessCDN', processUrl);

    let imageUrl = 'https://d1wtqaffaaj63z.cloudfront.net/images/NY_199_E_of_Hammertown_2014.jpg';
    let url = this.owner.lookup('service:filestack').imageUrl(imageUrl, { resize: { width: '500', fit: 'crop' }});
    let expected = `${processUrl}/AOkSBYOLvTqK3GzWzQMOuz/resize=width:500,fit:crop/${imageUrl}`;
    assert.equal(url, expected);
  });

  test('it uses the config.filestackProcessCDN when passed an image token', function(assert) {
    let config = this.owner.resolveRegistration('config:environment');
    let processUrl = 'https://myprocess.cloudfront.com';
    set(config, 'filestackProcessCDN', processUrl);

    let url = this.owner.lookup('service:filestack').imageUrl('678qwer', { resize: { width: 500, fit: 'crop' }});
    let expected = `${processUrl}/resize=width:500,fit:crop/678qwer`;
    assert.equal(url, expected);
  });

  test('it uses the config.filestackContentCDN when passed an image URL that begins with cdn.filestackcontent.com', function(assert) {
    let config = this.owner.resolveRegistration('config:environment');
    let contentUrl = 'https://mycontent.cloudfront.com';
    set(config, 'filestackContentCDN', contentUrl);

    let imageUrl = 'https://cdn.filestackcontent.com/2h25ZGRHTfmQ2DBEt3yR';
    let url = this.owner.lookup('service:filestack').imageUrl(imageUrl);
    let expected = `${contentUrl}/2h25ZGRHTfmQ2DBEt3yR`
    assert.equal(url, expected);
  });

  test('it does not use config.filestackContentCDN when passed an image URL that does not begin with cdn.filestackcontent.com', function(assert) {
    let config = this.owner.resolveRegistration('config:environment');
    let contentUrl = 'https://mycontent.cloudfront.com';
    set(config, 'filestackContentCDN', contentUrl);

    let imageUrl = 'https://d1wtqaffaaj63z.cloudfront.net/images/NY_199_E_of_Hammertown_2014.jpg';
    let url = this.owner.lookup('service:filestack').imageUrl(imageUrl);
    let expected = imageUrl;
    assert.equal(url, expected);
  });

  test('it uses the config.filestackContentCDN when passed an image token', function(assert) {
    let config = this.owner.resolveRegistration('config:environment');
    let contentUrl = 'https://mycontent.cloudfront.com';
    set(config, 'filestackContentCDN', contentUrl);

    let url = this.owner.lookup('service:filestack').imageUrl('678qwer');
    let expected = `${contentUrl}/678qwer`;
    assert.equal(url, expected);
  });

  test('it accepts arbitrary transformations', function(assert) {
    let url = this.owner.lookup('service:filestack').imageUrl('123ABC', { not_a_real_transform: { fake_option: 38, not_real_option: 'false' }});
    let expected = 'https://process.filestackapi.com/not_a_real_transform=fake_option:38,not_real_option:false/123ABC';
    assert.equal(url, expected);
  });

  test('it handles boolean values appropriately', function(assert) {
    let url = this.owner.lookup('service:filestack').imageUrl('123ABC', { rotate: { deg: 38, exif: false }});
    let expected = 'https://process.filestackapi.com/rotate=deg:38,exif:false/123ABC';
    assert.equal(url, expected);
  });
});
