(function() {
  function vendorModule() {
    'use strict';

    return { 'default': self['filestack'] };
  }

  define('filestack', [], vendorModule);
})();
