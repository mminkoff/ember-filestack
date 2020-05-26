import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class ApplicationController extends Controller {
  showFilestack = false;

  @tracked fileHandle;

  @action
  fileSelected(data) {
    this.fileHandle = data.filesUploaded[0].handle;
  }
}
