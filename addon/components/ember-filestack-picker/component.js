import Ember from 'ember';
import layout from './template';

const { on, run: { scheduleOnce }, inject: { service }} = Ember;

export default Ember.Component.extend({
  layout,

  filestack: service(),

	actions: {
	  handleSelection(data) {
			if (this.get('onSelection')) {
				this.get('onSelection')(data);
			}
		},

		handleError(data) {
			if (data.code === 101 && this.get('onClose')) {
				this.get('onClose')();
			} else if (this.get('onError')) {
				this.get('onError')(data);
			}
		},
	},

	onSelection: null,
	onError: null,
	onClose: null,
	options: {},

	openFilepicker: on('didInsertElement', function() {
		scheduleOnce('afterRender', this, function() {
			this.get('filestack.promise').then( (filestack)=> {
				let options = this.get('options');
				filestack.pick(options).then((data)=>{
					this.send('handleSelection',data);
				}).catch((data)=>{
					this.send('handleError', data);
				});
			});
		});
	})
});
