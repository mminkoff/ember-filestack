import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('filestack-image', 'helper:filestack-image', {
  integration: true
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

test('it handles urls', function(assert) {
  let expected = 'https://d1wtqaffaaj63z.cloudfront.net/images/NY_199_E_of_Hammertown_2014.jpg';
  this.set('imageUrl', expected);
  this.render(hbs`{{filestack-image imageUrl}}`);
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
