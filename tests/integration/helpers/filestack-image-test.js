import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

const {
  set,
  getOwner,
} = Ember;

moduleForComponent('filestack-image', 'helper:filestack-image', {
  integration: true,
  beforeEach: function() {
    const config = getOwner(this).resolveRegistration('config:environment');
    set(config, 'filestackContentCDN', null);
    set(config, 'filestackProcessCDN', null);
  },
});

test('it renders a resize with options', function(assert) {
  this.set('imageToken', '123ABC');
  this.render(hbs`{{filestack-image imageToken width='200' height='300' fit='crop'}}`);
  let expected = 'https://process.filestackapi.com/resize=width:200,height:300,fit:crop/123ABC';
  assert.equal(this.$().text().trim(), expected);
});

test('it renders a link to cdn.filestackcontent.com without options', function(assert) {
  this.set('imageToken', '123ABC');
  this.render(hbs`{{filestack-image imageToken}}`);
  let expected = 'https://cdn.filestackcontent.com/123ABC';
  assert.equal(this.$().text().trim(), expected);
});

test('it handles urls with missing arguments', function(assert) {
  let imageUrl = 'https://d1wtqaffaaj63z.cloudfront.net/images/NY_199_E_of_Hammertown_2014.jpg';
  this.set('imageUrl', imageUrl);
  this.render(hbs`{{filestack-image imageUrl width=500 fit=crop}}`);
  let expected = `https://process.filestackapi.com/AOkSBYOLvTqK3GzWzQMOuz/resize=width:500/${imageUrl}`;
  assert.equal(this.$().text().trim(), expected);
});

test('it handles missing urls', function(assert) {
  this.set('imageToken', null);
  this.render(hbs`{{filestack-image imageToken}}`);
  assert.equal(this.$().text().trim(), '');
});

test('it handles missing hash arguments', function(assert) {
  this.set('crop', null);
  this.set('imageToken', '123ABC');
  this.render(hbs`{{filestack-image imageToken width='200' height='300' fit=crop}}`);
  let expected = 'https://process.filestackapi.com/resize=width:200,height:300/123ABC';
  assert.equal(this.$().text().trim(), expected);
});

test('it renders the original URL when options are missing & passed a URL', function(assert) {
  let imageUrl = 'https://d1wtqaffaaj63z.cloudfront.net/images/NY_199_E_of_Hammertown_2014.jpg';
  this.set('imageUrl', imageUrl);
  this.render(hbs`{{filestack-image imageUrl}}`);
  assert.equal(this.$().text().trim(), imageUrl);
});

test('it renders using https://cdn.filestackcontent.com/ when options are missing & passed a token', function(assert) {
  this.set('imageToken', '123ABC');
  this.render(hbs`{{filestack-image imageToken}}`);
  let expected = 'https://cdn.filestackcontent.com/123ABC';
  assert.equal(this.$().text().trim(), expected);
});

test('it does not set options if the only option is fit', function(assert) {
  // resize api requires width and/or height
  // setting ONLY resize=fit:crop returns a 400
  this.set('imageToken', '123ABC');
  this.render(hbs`{{filestack-image imageToken fit='crop'}}`);
  let expected = 'https://cdn.filestackcontent.com/123ABC';
  assert.equal(this.$().text().trim(), expected);
});

test('it does not set options if the only option is align', function(assert) {
  // resize api requires width and/or height
  // setting ONLY resize=align:top returns a 400
  this.set('imageToken', '123ABC');
  this.render(hbs`{{filestack-image imageToken align='top'}}`);
  let expected = 'https://cdn.filestackcontent.com/123ABC';
  assert.equal(this.$().text().trim(), expected);
});

test('it does not set options if the only options are fit & align', function(assert) {
  // resize api requires width and/or height
  // setting ONLY resize=align:top returns a 400
  this.set('imageToken', '123ABC');
  this.render(hbs`{{filestack-image imageToken align='top' fit='crop'}}`);
  let expected = 'https://cdn.filestackcontent.com/123ABC';
  assert.equal(this.$().text().trim(), expected);
});

test('it uses the config.filestackProcessCDN when passed an image URL', function(assert) {
  const config = getOwner(this).resolveRegistration('config:environment');
  const processUrl = 'https://myprocess.cloudfront.com';
  set(config, 'filestackProcessCDN', processUrl);
  const imageUrl = 'https://d1wtqaffaaj63z.cloudfront.net/images/NY_199_E_of_Hammertown_2014.jpg';

  this.set('imageUrl', imageUrl);
  this.render(hbs`{{filestack-image imageUrl width='500' fit='crop'}}`);

  const expected = `${processUrl}/AOkSBYOLvTqK3GzWzQMOuz/resize=width:500,fit:crop/${imageUrl}`;
  assert.equal(this.$().text().trim(), expected);
});

test('it uses the config.filestackProcessCDN when passed an image token', function(assert) {
  const config = getOwner(this).resolveRegistration('config:environment');
  const processUrl = 'https://myprocess.cloudfront.com';
  set(config, 'filestackProcessCDN', processUrl);

  this.render(hbs`{{filestack-image '678qwer' width='500' fit='crop'}}`);

  const expected = `${processUrl}/resize=width:500,fit:crop/678qwer`;
  assert.equal(this.$().text().trim(), expected);
});

test('it uses the config.filestackContentCDN when passed an image URL that begins with cdn.filestackcontent.com', function(assert) {
  const config = getOwner(this).resolveRegistration('config:environment');
  const contentUrl = 'https://mycontent.cloudfront.com';
  set(config, 'filestackContentCDN', contentUrl);
  const imageUrl = 'https://cdn.filestackcontent.com/2h25ZGRHTfmQ2DBEt3yR';

  this.set('imageUrl', imageUrl);
  this.render(hbs`{{filestack-image imageUrl}}`);

  const expected = `${contentUrl}/2h25ZGRHTfmQ2DBEt3yR`
  assert.equal(this.$().text().trim(), expected);
});

test('it does not use config.filestackContentCDN when passed an image URL that does not begin with cdn.filestackcontent.com', function(assert) {
  const config = getOwner(this).resolveRegistration('config:environment');
  const contentUrl = 'https://mycontent.cloudfront.com';
  set(config, 'filestackContentCDN', contentUrl);
  const imageUrl = 'https://d1wtqaffaaj63z.cloudfront.net/images/NY_199_E_of_Hammertown_2014.jpg';

  this.set('imageUrl', imageUrl);
  this.render(hbs`{{filestack-image imageUrl}}`);

  const expected = imageUrl;
  assert.equal(this.$().text().trim(), expected);
});

test('it uses the config.filestackContentCDN when passed an image token', function(assert) {
  const config = getOwner(this).resolveRegistration('config:environment');
  const contentUrl = 'https://mycontent.cloudfront.com';
  set(config, 'filestackContentCDN', contentUrl);

  this.render(hbs`{{filestack-image '678qwer'}}`);

  const expected = `${contentUrl}/678qwer`;
  assert.equal(this.$().text().trim(), expected);
});
