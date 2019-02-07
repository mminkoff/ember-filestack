import { set } from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('helper:filestack-image', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    const config = this.owner.resolveRegistration('config:environment');
    set(config, 'filestackContentCDN', null);
    set(config, 'filestackProcessCDN', null);
  });

  test('it renders a resize with options', async function(assert) {
    this.set('imageToken', '123ABC');
    await render(hbs`{{filestack-image imageToken width='200' height='300' fit='crop'}}`);
    let expected = 'https://process.filestackapi.com/resize=width:200,height:300,fit:crop/123ABC';
    assert.dom('*').hasText(expected);
  });

  test('it renders a link to cdn.filestackcontent.com without options', async function(assert) {
    this.set('imageToken', '123ABC');
    await render(hbs`{{filestack-image imageToken}}`);
    let expected = 'https://cdn.filestackcontent.com/123ABC';
    assert.dom('*').hasText(expected);
  });

  test('it handles urls with missing arguments', async function(assert) {
    let imageUrl = 'https://d1wtqaffaaj63z.cloudfront.net/images/NY_199_E_of_Hammertown_2014.jpg';
    this.set('imageUrl', imageUrl);
    await render(hbs`{{filestack-image imageUrl width=500 fit=crop}}`);
    let expected = `https://process.filestackapi.com/AOkSBYOLvTqK3GzWzQMOuz/resize=width:500/${imageUrl}`;
    assert.dom('*').hasText(expected);
  });

  test('it handles missing urls', async function(assert) {
    this.set('imageToken', null);
    await render(hbs`{{filestack-image imageToken}}`);
    assert.dom('*').hasText('');
  });

  test('it handles missing hash arguments', async function(assert) {
    this.set('crop', null);
    this.set('imageToken', '123ABC');
    await render(hbs`{{filestack-image imageToken width='200' height='300' fit=crop}}`);
    let expected = 'https://process.filestackapi.com/resize=width:200,height:300/123ABC';
    assert.dom('*').hasText(expected);
  });

  test('it renders the original URL when options are missing & passed a URL', async function(assert) {
    let imageUrl = 'https://d1wtqaffaaj63z.cloudfront.net/images/NY_199_E_of_Hammertown_2014.jpg';
    this.set('imageUrl', imageUrl);
    await render(hbs`{{filestack-image imageUrl}}`);
    assert.dom('*').hasText(imageUrl);
  });

  test('it renders using https://cdn.filestackcontent.com/ when options are missing & passed a token', async function(assert) {
    this.set('imageToken', '123ABC');
    await render(hbs`{{filestack-image imageToken}}`);
    let expected = 'https://cdn.filestackcontent.com/123ABC';
    assert.dom('*').hasText(expected);
  });

  test('it does not set options if the only option is fit', async function(assert) {
    // resize api requires width and/or height
    // setting ONLY resize=fit:crop returns a 400
    this.set('imageToken', '123ABC');
    await render(hbs`{{filestack-image imageToken fit='crop'}}`);
    let expected = 'https://cdn.filestackcontent.com/123ABC';
    assert.dom('*').hasText(expected);
  });

  test('it does not set options if the only option is align', async function(assert) {
    // resize api requires width and/or height
    // setting ONLY resize=align:top returns a 400
    this.set('imageToken', '123ABC');
    await render(hbs`{{filestack-image imageToken align='top'}}`);
    let expected = 'https://cdn.filestackcontent.com/123ABC';
    assert.dom('*').hasText(expected);
  });

  test('it does not set options if the only options are fit & align', async function(assert) {
    // resize api requires width and/or height
    // setting ONLY resize=align:top returns a 400
    this.set('imageToken', '123ABC');
    await render(hbs`{{filestack-image imageToken align='top' fit='crop'}}`);
    let expected = 'https://cdn.filestackcontent.com/123ABC';
    assert.dom('*').hasText(expected);
  });

  test('it uses the config.filestackProcessCDN when passed an image URL', async function(assert) {
    const config = this.owner.resolveRegistration('config:environment');
    const processUrl = 'https://myprocess.cloudfront.com';
    set(config, 'filestackProcessCDN', processUrl);
    const imageUrl = 'https://d1wtqaffaaj63z.cloudfront.net/images/NY_199_E_of_Hammertown_2014.jpg';

    this.set('imageUrl', imageUrl);
    await render(hbs`{{filestack-image imageUrl width='500' fit='crop'}}`);

    const expected = `${processUrl}/AOkSBYOLvTqK3GzWzQMOuz/resize=width:500,fit:crop/${imageUrl}`;
    assert.dom('*').hasText(expected);
  });

  test('it uses the config.filestackProcessCDN when passed an image token', async function(assert) {
    const config = this.owner.resolveRegistration('config:environment');
    const processUrl = 'https://myprocess.cloudfront.com';
    set(config, 'filestackProcessCDN', processUrl);

    await render(hbs`{{filestack-image '678qwer' width='500' fit='crop'}}`);

    const expected = `${processUrl}/resize=width:500,fit:crop/678qwer`;
    assert.dom('*').hasText(expected);
  });

  test('it uses the config.filestackContentCDN when passed an image URL that begins with cdn.filestackcontent.com', async function(assert) {
    const config = this.owner.resolveRegistration('config:environment');
    const contentUrl = 'https://mycontent.cloudfront.com';
    set(config, 'filestackContentCDN', contentUrl);
    const imageUrl = 'https://cdn.filestackcontent.com/2h25ZGRHTfmQ2DBEt3yR';

    this.set('imageUrl', imageUrl);
    await render(hbs`{{filestack-image imageUrl}}`);

    const expected = `${contentUrl}/2h25ZGRHTfmQ2DBEt3yR`
    assert.dom('*').hasText(expected);
  });

  test('it does not use config.filestackContentCDN when passed an image URL that does not begin with cdn.filestackcontent.com', async function(assert) {
    const config = this.owner.resolveRegistration('config:environment');
    const contentUrl = 'https://mycontent.cloudfront.com';
    set(config, 'filestackContentCDN', contentUrl);
    const imageUrl = 'https://d1wtqaffaaj63z.cloudfront.net/images/NY_199_E_of_Hammertown_2014.jpg';

    this.set('imageUrl', imageUrl);
    await render(hbs`{{filestack-image imageUrl}}`);

    const expected = imageUrl;
    assert.dom('*').hasText(expected);
  });

  test('it uses the config.filestackContentCDN when passed an image token', async function(assert) {
    const config = this.owner.resolveRegistration('config:environment');
    const contentUrl = 'https://mycontent.cloudfront.com';
    set(config, 'filestackContentCDN', contentUrl);

    await render(hbs`{{filestack-image '678qwer'}}`);

    const expected = `${contentUrl}/678qwer`;
    assert.dom('*').hasText(expected);
  });

  test('it renders a rotate with options', async function(assert) {
    this.set('imageToken', '123ABC');
    await render(hbs`{{filestack-image imageToken rotate=(hash deg=38 exif='false')}}`);
    let expected = 'https://process.filestackapi.com/rotate=deg:38,exif:false/123ABC';
    assert.dom('*').hasText(expected);
  });
});
