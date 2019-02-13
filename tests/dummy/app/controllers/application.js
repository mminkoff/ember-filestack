import Controller from '@ember/controller';

export default Controller.extend({
  showFilestack: false,

  actions: {
    fileSelected(data) {
      this.set('fileHandle', data.filesUploaded[0].handle);
    }
  }
});
