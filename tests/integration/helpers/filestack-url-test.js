import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const FILESTACK_CDN = 'https://cdn.filestackcontent.com';

module('helper:filestack-url', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    const config = this.owner.resolveRegistration('config:environment');
    config['ember-filestack'].customCDN = null;

    this.apiKey = config['ember-filestack'].apiKey;
    this.handle = '01234567890123456789';
    this.imageUrl = 'https://d1wtqaffaaj63z.cloudfront.net/images/NY_199_E_of_Hammertown_2014.jpg';
  });

  test('it renders a resize with options', async function(assert) {
    await render(hbs`
      {{filestack-url handle resize=(hash width=200 height=300 fit="crop")}}
    `);

    assert.dom('*').hasText(`${FILESTACK_CDN}/${this.apiKey}/resize=width:200,height:300,fit:crop/${this.handle}`);
  });

  test('it renders a link filestack cdn without options', async function(assert) {
    await render(hbs`
      {{filestack-url handle}}
    `);

    assert.dom('*').hasText(`${FILESTACK_CDN}/${this.apiKey}/${this.handle}`);
  });

  test('it handles urls with missing arguments (crop is undefined here)', async function(assert) {
    await render(hbs`
      {{filestack-url imageUrl resize=(hash width=500 fit=crop)}}
    `);

    assert.dom('*').hasText(`${FILESTACK_CDN}/${this.apiKey}/resize=width:500/"${this.imageUrl}"`);
  });

  test('it handles false handles/urls', async function(assert) {
    this.set('handle', null);

    await render(hbs`
      {{filestack-url handle}}
    `);

    assert.dom('*').hasText('');
  });

  test('it handles missing hash arguments', async function(assert) {
    this.set('crop', null);

    await render(hbs`
      {{filestack-url handle resize=(hash width=200 height=300 fit=crop)}}
    `);

    assert.dom('*').hasText(`${FILESTACK_CDN}/${this.apiKey}/resize=width:200,height:300/${this.handle}`);
  });

  test('it renders the original URL when options are missing & passed a URL', async function(assert) {
    await render(hbs`
      {{filestack-url imageUrl}}
    `);

    assert.dom('*').hasText(this.imageUrl);
  });

  test('it uses customCDN config when passed an image URL', async function(assert) {
    let config = this.owner.resolveRegistration('config:environment');
    let customCDN = 'https://myprocess.cloudfront.com';
    config['ember-filestack'] = { ...config['ember-filestack'], customCDN };

    await render(hbs`
      {{filestack-url imageUrl resize=(hash width=500 fit="crop")}}
    `);

    assert.dom('*').hasText(`${customCDN}/${this.apiKey}/resize=width:500,fit:crop/"${this.imageUrl}"`);
  });

  test('it uses customCDN config when passed an image token', async function(assert) {
    let config = this.owner.resolveRegistration('config:environment');
    let customCDN = 'https://myprocess.cloudfront.com';
    config['ember-filestack'] = { ...config['ember-filestack'], customCDN };

    await render(hbs`
      {{filestack-url handle resize=(hash width=500 fit="crop")}}
    `);

    assert.dom('*').hasText(`${customCDN}/${this.apiKey}/resize=width:500,fit:crop/${this.handle}`);
  });

  test('it uses customCDN config when passed an image URL that begins with cdn.filestackcontent.com', async function(assert) {
    let config = this.owner.resolveRegistration('config:environment');
    let customCDN = 'https://myprocess.cloudfront.com';
    config['ember-filestack'] = { ...config['ember-filestack'], customCDN };

    let imageUrl = 'https://cdn.filestackcontent.com/2h25ZGRHTfmQ2DBEt3yR';
    this.set('imageUrl', imageUrl);

    await render(hbs`
      {{filestack-url imageUrl}}
    `);

    assert.dom('*').hasText(`${customCDN}/2h25ZGRHTfmQ2DBEt3yR`);
  });

  test('it does not use customCDN config when passed an image URL that does not begin with cdn.filestackcontent.com', async function(assert) {
    let config = this.owner.resolveRegistration('config:environment');
    let customCDN = 'https://myprocess.cloudfront.com';
    config['ember-filestack'] = { ...config['ember-filestack'], customCDN };

    await render(hbs`
      {{filestack-url imageUrl}}
    `);

    assert.dom('*').hasText(this.imageUrl);
  });
});
