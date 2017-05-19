import Ember from 'ember';

export default Ember.Controller.extend({
  showFilestack: false,

  options: {
    accept: 'image/*'
  },

	actions : {
		showPicker: function() {
			this.set('showFilestack', true);
		},
		hidePicker: function() {
			this.set('showFilestack', false);
		},
		fileSelected: function(data) {
      this.set('pickedUrl',data["filesUploaded"][0].url);
			this.send('hidePicker');
		},
		onClose: function() {
			this.send('hidePicker');
		},
		onError: function(error) {
      this.set('pickerError',error);
			this.send('hidePicker');
		}
	}
});
