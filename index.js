'use strict';

module.exports = {
  name: require('./package').name,

  options: {
    babel: {
      plugins: [
        // Ensure that `ember-auto-import` can handle the dynamic imports
        require.resolve('ember-auto-import/babel-plugin'),
      ],
    },
  },
};
