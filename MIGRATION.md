# Migration from 1.0.0

A lot of things have changed since the last 1.0.0 release. This document outlines all the changes
that might need your attention during this process.

## Api key

On 1.0.0, you had to configure your filestack api key like:

```js
// config/environment.js
module.exports = function(environment) {
  let ENV = {
    //...
    filestackKey: '<your-filestack-key>'
  };
  //...
}
```

Now you should:

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
}
```

## Custom CDN

On 1.0.0, you could configure custom CDNs like

```js
// config/environment.js
module.exports = function(environment) {
  let ENV = {
    //...
    filestackProcessCDN: '<your-process-cdn.cloudfront.net>',
    filestackContentCDN: '<your-content-cdn.cloudfront.net>',
  };
  //...
};
```

Now you should:

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

Notice that there's only one CDN to configure now. That's because filestack no longer
uses `https://process.filestackapi.com` urls. All files are accessed through `https://cdn.filestackcontent.com`,
even if the url has transforms in it.

This is why only one CDN is needed now.

## File Picker

On 1.0.0 you would use the file picker using the `ember-filestack-picker` component like:

```hbs
{{#if showFilePicker}}
  {{ember-filestack-picker
    options=filestackPickerOptions
    onSelection=(action "fileSelected")
    onClose=(action (mut showFilePicker) false)
    onError=(action "onError")
  }}
{{/if}}
```

```js
const filestackPickerOptions = {
  accept: ['image/*'],
  maxSize: 10485760
};

export default Component.extend({
  filestackPickerOptions,
  actions: {
    fileSelected(result) {
      // the `filesUploaded` is an array of files you've just uploaded
      console.log(result.filesUploaded);
    },
    onError(file, error) {
      // ...
    }
  }
});
```

Now you would use something like:

```hbs
{{#if showFilePicker}}
  {{filestack-picker
    accept="image/*"
    onUploadDone=(action "fileSelected")
    onClose=(action (mut showFilePicker) false)
    onError=(action "onError")
  }}
{{/if}}
```

or if you prefer with the new angle bracket invocation syntax (recommended):

```hbs
{{#if showFilePicker}}
  <FilestackPicker
    @accept="image/*"
    @onUploadDone={{action "fileSelected"}}
    @onClose={{action (mut showFilePicker) false}}
  />
{{/if}}
```

You can use angle bracket invocation syntax with old versions of ember using [ember-angle-bracket-invocation-polyfill](https://github.com/rwjblue/ember-angle-bracket-invocation-polyfill).

Things to note:
- the component name changed from `ember-filestack-picker` to just `filestack-picker`.
- each key of `options` can now be passed directly to the component instead of having to build a hash yourself
- however, you can still use `@options={{someOptionsDefinedElsewhere}}` if you need to. These will be merged with the direct options explained above.
- Custom actions like `onSelection` action are now replaced for `onUploadDone`, for example. This is what the filestack library uses, and there's no need to rename that. It's just another option we pass in directly.
- You can now pass in two different types of actions to react to errors:
  - `onError` is triggered by `ember-filestack` itself when something goes wrong while initializing filestack or the picker. This is not triggered by the filestack library. It's not something very likely to occur, assuming that the api key is there and configs are correct.
  - `onFileUploadFailed` is triggered by the filestack library under the hood when the upload fails
- We just reference filestack's complete set of options here: https://filestack.github.io/filestack-js/interfaces/pickeroptions.html all of them are supported by this new component.

## Generate file urls

Generating filestack urls for files on 1.0.0 was done using the `filestack-image` helper like:

```hbs
{{filestack-image handleOrUrl}}
{{filestack-image handleOrUrl resize=(hash width=50 height=50 fit="scale")}}
{{filestack-image handleOrUrl output=(hash format="jpg")}}
{{filestack-image handleOrUrl output=(hash format="png") resize=(hash width=500 height=500 fit="max")}}
```

Now we do:

```hbs
{{filestack-url handleOrUrl}}
{{filestack-url handleOrUrl resize=(hash width=50 height=50 fit="scale")}}
{{filestack-url handleOrUrl output=(hash format="jpg")}}
{{filestack-url handleOrUrl output=(hash format="png") resize=(hash width=500 height=500 fit="max")}}
```

Things to note:
- the helper name changed from `filestack-image` to just `filestack-url`, since we can link/transform other files that aren't images.
- the handle/url is still passed in as the first and only positional parameter. Nothing changed.
- transformations also exactly the same as before. However, under the hood, we're not computing the url for the transformation ourselves anymore. We're realying on an updated version of the filestack library to do that for us. That's why it is wise to consult the transform options here: https://filestack.github.io/filestack-js/interfaces/transformoptions.html . These are the options that the helper supports because it passes them in directly to the filestack library.

# Direct Filestack JS API Access

On 1.0.0 you could access the filestack library instance like:

```js
export default Component.extend({
  //injecting the filestack object
  filestack: service(),

  someFunction: function(){
    // Use the promise in case you are not sure that your component will be initialized after filestack has been loaded
    this.get('filestack.promise').then(function(filestack){
      // do something with filestack
    });

    // OR if you are sure filestack has already been loaded use:
    this.get('filestack.instance')
  }
});
```

Now you do it like:

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

Things to note:
- you need to make sure that filestack is initialized using the service's `initClient` method.
- calling this method multiple times will initialize the filestack client only once, so this can be used as a getter for the filestack client instance
- the asynchronicity is due to the way ember-filestack lazily initializes filestack. If no one ever needs filestack related functionality in your app, ember-filestack waste any cpu resources with filestack. In fact, even the filestack library itself is loaded dynamically at runtime only if needed.

The underlying filestack library was also updated from `^0.11.4` to `^1.14.1`, so if you use filestack client directly,
please check if you need to update your code as well. Here is filestack-js changelog: https://github.com/filestack/filestack-js/blob/master/CHANGELOG.md
