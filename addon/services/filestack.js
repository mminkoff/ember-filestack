import Ember from 'ember';
import filestack from 'filestack';

const {
	computed,
	computed: { alias },
	getOwner,
	on,
	run: { later },
	RSVP: { Promise }
} = Ember;

export default Ember.Service.extend({
	promise: null,
	instance: null,

	_initFilestack: on('init', function() {
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
	}),

  config: computed(function() {
    return getOwner(this).resolveRegistration('config:environment');
  }),

	key: alias('config.filestackKey'),

	loadTimeout: computed('config.filestackLoadTimeout', function() {
    return this.get('config.filestackLoadTimeout') || 10000;
  })
});
