# Vaani

FirefoxOS Virtual Assistant

## Setup

```bash
$ git clone git@github.com:mozilla/vaani.git
$ cd vaani
$ npm run bower
$ npm install
```

In order to make developing in the browser easier we can run a custom build of
Gecko. Grab yourself a clone of
[`gecko-dev`](https://github.com/mozilla/gecko-dev). Then inside the
`/configure.in` file flip the following flags:

```
MOZ_WEBSPEECH_MODELS=1
MOZ_WEBSPEECH_POCKETSPHINX=1
```

Then build via:

```bash
$ ./mach build
```

Once the build is complete you should be able to start the browser via:

```bash
$ ./mach run
```

When your browser opens you need to flip the following prefs via
http://about:config

| preference                               | type    | value |
|:---------------------------------------- |:------- |:----- |
| media.webspeech.recognition.enable       | boolean | true  |
| media.webspeech.recognition.force_enable | boolean | true  |
| media.webspeech.synth.enabled            | boolean | true  |


## Build

```bash
$ npm run build
```

## Local dev server

In the browser accessing the mic requests permission from the user everytime.
That is unless you're on a secure connection. In order to start the local dev
server with ssl you'll need to create some keys. Run this from the project's
root directory:

```bash
$ openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem
```

To serve the `./build` directory locally run:

```bash
$ npm start
```

Now open https://localhost:8080/ in your navigator of choice. As well as
serving the app, this will also watch for changes and automatically re-build
the app.
