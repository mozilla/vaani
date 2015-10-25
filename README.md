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

## Custom commands

Custom Command is a feature to enable 3rd party apps to register their voice
commands. Voice commands will be predefined actions in the short term. We may
use [Action of schema.org](http://schema.org/Action) as base and extend it as
action list. 3rd party apps should use JSON-LD to state which actions they
support. Once the actions detected, Vaani calls the apps to handle that. 

[Learn how to implement custom
commands](https://wiki.mozilla.org/Firefox_OS/Vaani/Custom_Command).

## License

Apache License, Version 2.0
