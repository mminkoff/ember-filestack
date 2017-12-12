import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('filestack-image', 'helper:filestack-image', {
  integration: true
});

// Replace this with your real tests.
test('it renders a resize with options', function(assert) {
  this.set('imageToken', '123ABC');
  this.render(hbs`{{filestack-image imageToken width='200' height='300' fit='crop'}}`);
  let expected = 'https://process.filestackapi.com/resize=width:200,height:300,fit:crop/123ABC';
  assert.equal(this.$().text().trim(), expected);
});

test('it renders a resize without options', function(assert) {
  this.set('imageToken', '123ABC');
  this.render(hbs`{{filestack-image imageToken}}`);
  let expected = 'https://process.filestackapi.com/123ABC';
  assert.equal(this.$().text().trim(), expected);
});

test('it handles urls', function(assert) {
  this.set('imageToken', 'https://d1wtqaffaaj63z.cloudfront.net/images/NY_199_E_of_Hammertown_2014.jpg');
  this.render(hbs`{{filestack-image imageToken}}`);
  let expected = 'https://process.filestackapi.com/AOkSBYOLvTqK3GzWzQMOuz/https://d1wtqaffaaj63z.cloudfront.net/images/NY_199_E_of_Hammertown_2014.jpg';
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
