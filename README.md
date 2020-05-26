# ember-filestack

[![npm version](https://badge.fury.io/js/ember-filestack.svg)](http://badge.fury.io/js/ember-filestack)
[![Build Status](https://travis-ci.org/mminkoff/ember-filestack.svg)](https://travis-ci.org/mminkoff/ember-filestack.svg?branch=master)
[![Ember Observer Score](http://emberobserver.com/badges/ember-filestack.svg)](http://emberobserver.com/addons/ember-filestack)

Provides file picking, storing, and converting funtionality from [Filestack](https://www.filestack.com) using [filestack-js](https://github.com/filestack/filestack-js).

# Installation

`ember install ember-filestack`

# Compatibility

* Ember.js v3.12 or above
* Ember CLI v2.13 or above
* Node.js v10 or above

ember-filestack supports all ember LTS versions (that means 3.8+ at the moment). With that being said,
it may support versions even older than that.

To use it on ember versions prior to 2.5, you must include [ember-assign-polyfill](https://github.com/shipshapecode/ember-assign-polyfill) on your app.

Angle bracket invocation syntax is optional, but if you can use it in ember versions back to 2.12 if you install [ember-angle-bracket-invocation-polyfill](https://github.com/rwjblue/ember-angle-bracket-invocation-polyfill) on your app.

# Migration from 1.0.0

There are important changes since v1.0.0. Most will be supported with deprecation notices until v3.0.0. However, there have also been important changes in the underlyng filestack.js module.  Please refer to the [Filestack API changelog](https://github.com/filestack/filestack-js/blob/cc3196dc2a9c65ec503eb264d362998114ba142e/CHANGELOG.md) for changes to available options.

Please read our [migration guide](https://github.com/mminkoff/ember-filestack/blob/master/MIGRATION.md) for changes to `environment.js` and the Ember components.

# Configuration

## API Key

* Create your filestack.com key at https://www.filestack.com/.
* Add your filestack.com key in your `config/environment.js` file

```js
// config/environment.js
module.exports = function(environment) {
  let ENV = {
    //...
    'ember-filestack': {
      apiKey: 'AOkSBYOLvTqK3GzWzQMOuz'
    }
  };
  //...
};
```

## Custom CDN

To minimize your quota usage (both bandwidth and process quotas), you can put filestack behind your own CDNs (e.g. AWS CloudFront).
To do that you will want to proxy all urls with the host `https://cdn.filestackcontent.com`.

Then you can configure your custom CDN url like:

```js
// config/environment.js
module.exports = function(environment) {
  let ENV = {
    //...
    'ember-filestack': {
      apiKey: '<your filestack api key>',
      customCDN: '<your-cdn.cloudfront.net>'
    }
  };
  //...
};
```

When `customCDN` is defined, `ember-filestack` will ensure that Filestack’s CDN is never accessed directly.

## Global config for picker and preview

You can add global options for the picker and preview components (read more about them in the next sections).
For that, you can use the `pickerOptions` and `previewOptions` keys in the ember-filestack config.
Additionally, any necessary filestack [client options](https://filestack.github.io/filestack-js/interfaces/clientoptions.html) must be defined here.

Example:

```js
// config/environment.js
module.exports = function(environment) {
  let ENV = {
    //...
    'ember-filestack': {
      // ...
      clientOptions: {
        // add any client options here
      },
      pickerOptions: {
        // add any global picker options here
      },
      previewOptions: {
        // add any global preview options here
      }
    }
  };
  //...
```

# Usage

## File Picker

The file picker is rendered using the `<FilestackPicker/>` component. This component accepts all the available picker options
that the filestack picker accepts. Complete documentation of all the available options can be found
[here](https://filestack.github.io/filestack-js/interfaces/pickeroptions.html).

Example:

```hbs
<button onclick={{action (mut showFilePicker) true}}>Choose file</button>

{{#if showFilePicker}}
  <FilestackPicker
    @accept="image/*"
    @onUploadDone={{action "fileSelected"}}
    @onClose={{action (mut showFilePicker) false}}
  />
{{/if}}
```

```js
export default Component.extend({
  actions: {
    fileSelected(result) {
      // `result` is an array of files you've just uploaded
      console.log(result.filesUploaded);
    }
  }
});
```

## Generate file urls

When you need to generate a filestack url, you should use the `{{filestack-url}}` helper.

This helper accepts a filestack handle or any image url as the first (and only) positional parameter.

Additionally, you can pass in additional multiple named parameters that correspond to [transforms](https://www.filestack.com/docs/concepts/transform/).
The helper accepts all the available transforms that filestack provides. You can check the available transform options
[here](https://filestack.github.io/filestack-js/interfaces/transformoptions.html).

Examples:

```hbs
{{filestack-url handleOrUrl}}

{{filestack-url handleOrUrl resize=(hash width=50 height=50 fit="scale")}}

{{filestack-url handleOrUrl output=(hash format="jpg")}}

{{filestack-url handleOrUrl output=(hash format="png") resize=(hash width=500 height=500 fit="max")}}
```

You can also use the included `filestack` service to generate image urls:

```js
import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Component.extend({
  filestack: service(),

  scaledImage: computed('imageUrl', function() {
    let url = this.get('imageUrl');
    let transformations = {
      output: {
        format: 'png'
      },
      resize: {
        width: 500,
        height: 500,
        fit: 'max'
      }
    };

    return this.get('filestack').getUrl(url, transformations);
  })
});
```

All of these will respect the `customCDN` configuration, if present.

Notice that *it is* possible to write invalid transforms. For example, you can't specify a transform of
`resize=(hash fit="some-invalid-value")`. Under the hook, `filestack-js` will validate the passed transform options,
so expect errors if you do something wrong.

## Filestack previewer

Filestack has a feature to preview documents in a nice file previewer. This renders
an iframe with filestack's previewer and it supports multiple formats. Read more about
this feature [here](https://www.filestack.com/docs/concepts/transform/#document-viewer).

ember-filestack provides a `<FilestackPreview/>` component that you can use to quickly insert this
iframe anywhere in your DOM.

Example:

```hbs
<FilestackPreview @handle={{fileHandle}}/>
```

This component supports all the preview options that filestack supports.
Complete documentation of all the available options can be found
[here](https://filestack.github.io/filestack-js/interfaces/previewoptions.html).

## Direct filestack client Access

Sometimes you might need to use the filestack client manually.
To do that, you can use the `filestack` service `initClient` method as follows:

```js
import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  // inject the filestack service
  filestack: service(),

  async someFunction() {
    // Use the promise in case you are not sure that your component will be initialized after filestack has been loaded

    let filestack = await this.filestack.initClient();

    // do something with filestack
  }
});
```

Notice that `initClient` is asynchronous (returns a Promise). This happens because we lazily initialize and import
filestack client. Please read the next section for more information.

## Lazy filestack initialization

All the filestack javascript and the respective filestack initialization is done **only when needed**.
This means that, if a user never renders a filepicker or generates a filestack url, your app won't spend any
resources or bandwidth with filestack related work.

With that being said, `ember-filestack` makes sure that it only initializes filestack **once**. This means that, for example,
if you call `this.filestack.initClient()` twice, all the heavy work will be done once. In this example the second call
would return the filestack client immediately.

## Fastboot considerations

`ember-filestack` will no-op on fastboot environments since `filestack-js` requires access to `document` (which isn't available on node).
