/* eslint-env node */
'use strict';
var path = require('path');
var mergeTrees = require('broccoli-merge-trees');
var Funnel = require('broccoli-funnel');

module.exports = {
  name: 'ember-filestack',

  treeForVendor: function(tree) {
    var packagePath = path.dirname(require.resolve('filestack-js'));
    var packageTree = new Funnel(this.treeGenerator(packagePath), {
      srcDir: '/',
      destDir: 'filestack-js'
    });
    return mergeTrees([tree, packageTree]);
  },

  included: function(app) {
    this._super.included(app);

    if (app.import) {
      this.importDependencies(app);
    }
  },

  importDependencies: function(app) {
    app.import('vendor/filestack-js/filestack.js');
    this.import('vendor/shims/filestack.js');
  }
};
