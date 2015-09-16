# Vaani

FirefoxOS Virtual Assistant

[![Build Status](https://travis-ci.org/mozilla/vaani.svg?branch=master)](https://travis-ci.org/mozilla/vaani)
[![Dependency Status](https://david-dm.org/mozilla/vaani.svg?style=flat)](https://david-dm.org/mozilla/vaani)
[![devDependency Status](https://david-dm.org/mozilla/vaani/dev-status.svg?style=flat)](https://david-dm.org/mozilla/vaani#info=devDependencies)

## Setup

```bash
$ git clone git@github.com:mozilla/vaani.git
$ cd vaani
$ npm run setup
```

## Build

```bash
$ npm run build
```

## Flash

Once built you can flash the `./build` directory to your device using WebIDE.

## Debug logs

To see the output from the `debug` calls open your browser or WebIDE console and execute:

```js
myDebug.enable('*');
```

## Tests

Runs the lint and tests.

```js
$ npm test
```

## Dev mode

In dev mode we watch for changes and automatically re-build the app.

```bash
$ npm start
```

## License

Apache License, Version 2.0
