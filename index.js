/* eslint-env node */
'use strict';
var path = require('path');
var mergeTrees = require('broccoli-merge-trees');
var Funnel = require('broccoli-funnel');
var map = require('broccoli-stew').map;

module.exports = {
  name: 'ember-filestack',

  treeForVendor(tree) {
    var packagePath = path.dirname(require.resolve('filestack-js'));
    var packageTree = new Funnel(this.treeGenerator(packagePath), {
      srcDir: '/',
      destDir: 'filestack-js'
    });

    // don't load if FastBoot
    packageTree = map(packageTree, (content) => `if (typeof FastBoot === 'undefined') { ${content} }`);
    
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
