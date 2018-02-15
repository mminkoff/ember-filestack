# Ember-filestack

[![npm version](https://badge.fury.io/js/ember-filestack.svg)](http://badge.fury.io/js/ember-filestack)
[![Build Status](https://travis-ci.org/mminkoff/ember-filestack.svg)](https://travis-ci.org/mminkoff/ember-filestack.svg?branch=master)
[![Ember Observer Score](http://emberobserver.com/badges/ember-filestack.svg)](http://emberobserver.com/addons/ember-filestack)

Provides file picking, storing, and converting funtionality from [Filestack](https://www.filestack.com) using v3+ of their API.

This addon borrows from and builds heavily on [Ember-cli-filepicker](https://github.com/DudaDev/ember-cli-filepicker)

## Installation

* `ember install ember-filestack`

## Usage
* Create your filestack.com key here: https://www.filestack.com/.
* Add your filestack.com key in your config/environment.js
```javascript
//config/environment.js
module.exports = function(environment) {
  var ENV = {
    //...
    filestackKey: '<your-filestack-key>'
  };
  //...
}
```
* Use the filestack.com documentation for options like extensions and services.
* In your template:
```handlebars
{{ember-filestack-picker options=options onSelection=(action 'fileSelected') onClose=(action 'onClose') onError=(action 'onError')}}
```
* You then pass the options and actions to determine the picker's behaviour.
```js
export default Ember.Component.extend({
  options: {
    accept: ['image/*'],
    maxSize: 10485760
  },

  actions: {
    fileSelected(result) {
      // the `filesUploaded` is an array of files you've just uploaded
      console.log(result.filesUploaded);
    },
    onClose() {
      // ...
    },
    onError(file, error) {
      // ...
    }
  }
});
```
* Complete documentation of all the available options and response data can be found [here](https://www.filestack.com/docs/javascript-api/pick-v3).


## Custom CDN
To minimize your quota usage, you can put filestack behind your own CDNs.

There are two distinct filestack URL's you may want to proxy to.

1. https://process.filestackapi.com
2. https://cdn.filestackcontent.com

The first is for image transformations (the `{{filestack-image}}` helper lets you easily resize any image -- even arbitrary image URLs). But it renders a URL to that transformation each time, so any time someone visits a page with an image resized (eg https://process.filestackapi.com/resize=width:750/2h25ZGRHTfmQ2DBEt3yR), that will count against your transformation quota. Same for your bandwidth quota, when visiting a page that renders images with https://cdn.filestackcontent.com.

To preserve your quotas, setup two CDNs (eg cloudfront) to point to these URLs. Then configure `ember-filestack` to use your CDNs in ENV:
```javascript
module.exports = function(environment) {
  var ENV = {
    //...
    filestackKey: '<your-filestack-key>'
  filestackProcessCDN: '<your-process-cdn.cloudfront.net>',
  filestackContentCDN: '<your-content-cdn.cloudfront.net>',
  };
```

This way, identical image process or display requests will be cached & come from your CDN, thus saving your quotas on filestack.


## Notes
In order to have access to the `filestack` instance you can:
* If `Ember.inject.service` is supported then in your object you can use:
```javascript
export default Ember.Component.extend({
  //injecting the filestack object
  filestack: Ember.inject.service(),

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

## Running

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

## Running Tests

* `npm test` (Runs `ember try:each` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).
