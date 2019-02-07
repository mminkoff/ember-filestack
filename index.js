'use strict';
const path = require('path');
const mergeTrees = require('broccoli-merge-trees');
const Funnel = require('broccoli-funnel');
const fastbootTransform = require('fastboot-transform');

module.exports = {
  name: require('./package').name,

  treeForVendor(tree) {
    let packagePath = path.dirname(require.resolve('filestack-js'));
    let packageTree = fastbootTransform(new Funnel(this.treeGenerator(packagePath), {
      srcDir: '/',
      destDir: 'filestack-js'
    }));

    return new mergeTrees([tree, packageTree]);
  },

  included(app) {
    this._super.included(app);

    if (app.import) {
      this.importDependencies(app);
    }
  },

  importDependencies(app) {
    app.import('vendor/filestack-js/filestack.js');
    this.import('vendor/shims/filestack.js');
  }
};
