import Ember from 'ember';
import filestack from 'filestack';

const {
	computed: { reads },
	getOwner,
	getProperties,
	run: { later },
	RSVP: { Promise }
} = Ember;

const defaultContentCDN = "https://cdn.filestackcontent.com";
const defaultContentCDNRegex = new RegExp(defaultContentCDN);

const defaultConfig = {
	filestackProcessCDN: "https://process.filestackapi.com",
	filestackContentCDN: defaultContentCDN,
	filestackLoadTimeout: 10000,
};

const configurationKeys = [
	'filestackContentCDN',
	'filestackKey',
	'filestackLoadTimeout',
	'filestackProcessCDN',
]

export default Ember.Service.extend({
	promise: null,
	instance: null,
	key: reads('config.filestackKey'),
  processCDN: reads('config.filestackProcessCDN'),
  contentCDN: reads('config.filestackContentCDN'),
	loadTimeout: reads('config.filestackLoadTimeout'),

	init() {
		this._super(...arguments);
		this._loadConfig();
		this._initFilestack();
	},

	buildUrl(token, hash={}) {
    let options = [];
		let urlRoot, imageUrl;

    if(!token) {
      return '';
		}

    if(token.match(/http(s?):\/\//)) {
      imageUrl = token;
      if(this.get('contentCDN') !== defaultContentCDN && imageUrl.match(defaultContentCDNRegex)) {
        // avoid unnecessary hits to bandwitch quota
        imageUrl = imageUrl.replace(defaultContentCDN, this.get('contentCDN'));
      }
      urlRoot = `${this.get('processCDN')}/${this.get('key')}`;
    } else {
      imageUrl = `${this.get('contentCDN')}/${token}`;
      urlRoot = this.get('processCDN');
    }

    // if there is no width AND no height specified, there's no valid resize to do
    if(!hash.width && !hash.height) {
      return imageUrl;
    }

    Object.keys(hash).forEach((key) => {
      let value = hash[key];
      if(value) {
        options.push(`${key}:${value}`);
      }
    });

		options = `resize=${options.join(',')}`;
		imageUrl = [ urlRoot, options, token ].filter((element) => element).join('/');

    return imageUrl;
	},

	_loadConfig() {
		let env = getOwner(this).resolveRegistration('config:environment');
		let config = getProperties(env, ...configurationKeys);
		let mergedConfig = {};

		// clean out `config` since `getProperties` will return an object with valueless keys
		configurationKeys.forEach((key) => (config[key] == null) && delete config[key]);

		// cannot use `assign` since it is unavailable in Ember 2.4
		configurationKeys.forEach((key) => {
			mergedConfig[key] = config[key] || defaultConfig[key];
		});

		this.set('config', mergedConfig);
	},

	_initFilestack: function() {
		var _isPromiseFulfilled = false;

		this.set('promise', new Promise((resolve, reject)=> {
			const key = this.get('key');
			if (! key ) {
				reject(new Error("Filestack key not found."));
				return;
			}

			if (filestack && filestack.init) {
				const instance = filestack.init(key);

				if (!(this.isDestroyed || this.isDestroying)) {
					this.set('instance', instance);
				}

				resolve(instance);
				_isPromiseFulfilled = true;
			} else {
				reject(new Error("Filestack not found."));
				return;
			}

			later(this, function(){
				if (!_isPromiseFulfilled){
					reject.call(null, new Error('Filestack load timeout.'));
				}
			}, this.get('loadTimeout'));
		}));
	},
});
