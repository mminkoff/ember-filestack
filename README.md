# ember-filestack

[![npm version](https://badge.fury.io/js/ember-filestack.svg)](http://badge.fury.io/js/ember-filestack)
[![Build Status](https://travis-ci.org/mminkoff/ember-filestack.svg)](https://travis-ci.org/mminkoff/ember-filestack.svg?branch=master)
[![Ember Observer Score](http://emberobserver.com/badges/ember-filestack.svg)](http://emberobserver.com/addons/ember-filestack)

Provides file picking, storing, and converting funtionality from [Filestack](https://www.filestack.com) using [v3+ of their API](https://www.filestack.com/docs/javascript-api/pick-v3).

This addon borrows from and builds heavily on [ember-cli-filepicker](https://github.com/DudaDev/ember-cli-filepicker)

## Installation

* `ember install ember-filestack`

## Configuration
### API Key
* Create your filestack.com key here: https://www.filestack.com/.
* Add your filestack.com key in your config/environment.js
```js
//config/environment.js
module.exports = function(environment) {
  var ENV = {
    //...
    filestackKey: '<your-filestack-key>'
  };
  //...
}
```

### Custom CDN
To minimize your quota usage, you can put filestack behind your own CDNs.

There are two distinct filestack URL's you may want to proxy to.

#### https://cdn.filestackcontent.com
This is where files uploaded to Filestack live. [Filestack's CDN](https://www.filestack.com/features/cdn) is excellent, but you may want to configure a proxy to this origin in order to preserve CDN bandwidth on your Filestack account.

#### https://process.filestackapi.com
This is the entry point for dynamically transforming files. Each transformation produces a unique URL, but each `GET` to one of these URLs will count against your transformation quota regardless of whether or not it’s already been performed. Putting your own CDN in front of processing urls will dramatically reduce the number of transformation requests you make while still giving you the full power of Filestack’s Transformation APIs.

To preserve your quotas, setup two CDNs (e.g., AWS CloudFront) to point to these URLs. Then configure `ember-filestack` to use your CDNs in ENV:
```js
module.exports = function(environment) {
  var ENV = {
    //...
    filestackProcessCDN: '<your-process-cdn.cloudfront.net>',
    filestackContentCDN: '<your-content-cdn.cloudfront.net>',
  };
```

We recommend that you set up both of these CDNs because `ember-filestack` will ensure that Filestack’s CDN and Transformation API are never accessed directly.

## Usage
### File Selection/Upload
* Use the [Filestack Pick Documentation](https://www.filestack.com/docs/javascript-api/pick-v3) to determine what `options` you want to configure.

#### Template
```hbs
{{filestack-picker options=filestackPickerOptions onSelection=(action 'fileSelected') onClose=(action 'onClose') onError=(action 'onError')}}
```

#### Component
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
    onClose() {
      // ...
    },
    onError(file, error) {
      // ...
    }
  }
});
```

Complete documentation of all the available options and response data can be found [here](https://www.filestack.com/docs/javascript-api/pick-v3).

### Display
#### Template Examples
The `filestack-image` helper accepts a filestack handle or any image url plus any number of [transformations](#transformations) in the format `transformationName=(hash ...)`.
```handlebars
  {{filestack-image filestackHandleOrUrl}}
  {{filestack-image filestackHandleOrUrl resize=(hash width=50 height=50 fit='scale')}}
  {{filestack-image filestackHandleOrUrl output=(hash format='jpg')}}
  {{filestack-image filestackHandleOrUrl output=(hash format='png') resize=(hash width=500 height=500 fit='max')}}
```

#### Component Examples
```js
export default Component.extend({
  filestack: service(),
  scaledImage: computed('imageUrl', function() {
    let url = this.get('imageUrl');
    let transformations = {
      output: {
        format: 'png',
      },
      resize: {
        width: 500,
        height: 500,
        fit: 'max',
      },
    };

    return this.get('filestack').imageUrl(url, transformations);
  }),
});
```


### Transformations
The Filestack Transformations API provides a way to dynamically request a transformed version of any file (even ones not uploaded to Filestack).

#### Image
[Filestack Image Transformation Docs](https://www.filestack.com/docs/image-transformations)

You can use any transformation, but be aware that it is your responsibility to produce a valid transformation. For example, Filestack will return a `400 Bad Request` if you attempt to resize an SVG.

Below you’ll find a list of transformations and notes on any further handling of the transformation that `ember-filestack` currently does.

| Transformation | Notes |
|:--------|:------------|
| [ascii](https://www.filestack.com/docs/image-transformations/ascii) |  |
| [blackwhite](https://www.filestack.com/docs/image-transformations/filters#blackwhite) |  |
| [blur_faces](https://www.filestack.com/docs/image-transformations/facial-detection#blur_faces) |  |
| [blur](https://www.filestack.com/docs/image-transformations/filters#blur) |  |
| [border](https://www.filestack.com/docs/image-transformations/borders-and-effects#border) |  |
| [cache](https://www.filestack.com/docs/image-transformations/caching) |  |
| [circle](https://www.filestack.com/docs/image-transformations/borders-and-effects#circle) |  |
| [collage](https://www.filestack.com/docs/image-transformations/collage) |  |
| [compress](https://www.filestack.com/docs/image-transformations/compress) |  |
| [crop_faces](https://www.filestack.com/docs/image-transformations/facial-detection#crop_faces) |  |
| [crop](https://www.filestack.com/docs/image-transformations/crop) |  |
| [debug](https://www.filestack.com/docs/image-transformations/debug) |  |
| [detect_faces](https://www.filestack.com/docs/image-transformations/facial-detection#detect_faces) |  |
| [enhance](https://www.filestack.com/docs/image-transformations/enchancements#enhance) |  |
| [flip](https://www.filestack.com/docs/image-transformations/rotate#flip) |  |
| [flop](https://www.filestack.com/docs/image-transformations/rotate#flop) |  |
| [modulate](https://www.filestack.com/docs/image-transformations/filters#modulate) |  |
| [monochrome](https://www.filestack.com/docs/image-transformations/filters#monochrome) |  |
| [negative](https://www.filestack.com/docs/image-transformations/filters#negative) |  |
| [oil_paint](https://www.filestack.com/docs/image-transformations/filters#oil_paint) |  |
| [output](https://www.filestack.com/docs/image-transformations/conversion) |  |
| [partial_blur](https://www.filestack.com/docs/image-transformations/filters#partial_blur) |  |
| [partial_pixelate](https://www.filestack.com/docs/image-transformations/filters#partial_pixelate) |  |
| [pixelate_faces](https://www.filestack.com/docs/image-transformations/facial-detection#pixelate_faces) |  |
| [pixelate](https://www.filestack.com/docs/image-transformations/filters#pixelate) |  |
| [polaroid](https://www.filestack.com/docs/image-transformations/borders-and-effects#polaroid) |  |
| [quality](https://www.filestack.com/docs/image-transformations/quality) |  |
| [redeye](https://www.filestack.com/docs/image-transformations/enhancements#redeye) |  |
| [resize](https://www.filestack.com/docs/image-transformations/resize) | A resize transformation will not be attempted unless `width` or `height` is provided. |
| [rotate](https://www.filestack.com/docs/image-transformations/rotate#rotate) |  |
| [rounded_corners](https://www.filestack.com/docs/image-transformations/borders-and-effects#rounded-corners) |  |
| [security](https://www.filestack.com/docs/image-transformations/security) |  |
| [sepia](https://www.filestack.com/docs/image-transformations/filters#sepia) |  |
| [shadow](https://www.filestack.com/docs/image-transformations/borders-and-effects#shadow) |  |
| [sharpen](https://www.filestack.com/docs/image-transformations/filters#sharpen) |  |
| [store](https://www.filestack.com/docs/image-transformations/store) |  |
| [torn_edges](https://www.filestack.com/docs/image-transformations/borders-and-effects#torn-edges) |  |
| [upscale](https://www.filestack.com/docs/image-transformations/enhancements#upscale) |  |
| [urlscreenshot](https://www.filestack.com/docs/image-transformations/screenshot) |  |
| [vignette](https://www.filestack.com/docs/image-transformations/borders-and-effects#vignette) |  |
| [watermark](https://www.filestack.com/docs/image-transformations/watermark) |  |
| [zip](https://www.filestack.com/docs/image-transformations/zip) |  |

### Direct Filestack JS API Access
In order to access the browser’s `filestack` instance we recommend that you use `filestack.promise`.
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

## Contributing - Pull Requests Welcome!
### Adding Transformations
There are nearly forty transformations for images alone. If you’re looking for a place to contribute consider adding a transformation builder.

A transformation builder accepts an `options` object (e.g., `{ "option1": 123, "option2": false }`) and returns a Filestack-compliant options string (e.g., `"option1:123,option2:false"`).

Adding custom transformation builders `ember-filestack` can prevent users from creating invalid transformations. See the `transformationBuilders` object in the `filestack` service for examples.

### Tests
* `npm test` (Runs `ember try:each` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`
