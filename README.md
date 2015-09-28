# drive-watch.js

# Watch for drive mount/eject events in OS X

## Current status

[![NPM version](https://img.shields.io/npm/v/drive-watch.svg)](https://www.npmjs.com/package/drive-watch)
[![Build Status](https://img.shields.io/travis/overlookmotel/drive-watch/master.svg)](http://travis-ci.org/overlookmotel/drive-watch)
[![Dependency Status](https://img.shields.io/david/overlookmotel/drive-watch.svg)](https://david-dm.org/overlookmotel/drive-watch)
[![Dev dependency Status](https://img.shields.io/david/dev/overlookmotel/drive-watch.svg)](https://david-dm.org/overlookmotel/drive-watch)
[![Coverage Status](https://img.shields.io/coveralls/overlookmotel/drive-watch/master.svg)](https://coveralls.io/r/overlookmotel/drive-watch)

API is subject to change in later versions (v0.2.0). No tests but it seems to work. OS X only!

## Usage

Watches drives attached to the system and calls a function when a drive is mounted/ejected.

Call `new DriveWatch(handler)` then call `.start()`.

`.start()` returns a Promise which resolves when watching has begun. It returns an array of the names of drives currently mounted.

`handler` is called thereafter whenever a drive is mounted or ejected. `handler` is called with arguments `(eventType, driveName)`.

`.drives` contains an array of the names of currently mounted drives.

Call `.stop()` to stop watching.

### Example

```js
var DriveWatch = require('drive-watch');

var dw = new DriveWatch(function(eventType, driveName) {
    // Called when a drive is mounted/ejected
    console.log('Event: ' + eventType + ' - ' + driveName);
});

dw.start()
.then(function(drives) {
    // drives = array of drive names currently connected
    console.log('Drives:', drives);
})
```

This outputs:

```
// Initial output
Drives: [ 'Macintosh HD' ]

// Connect a drive
Event: mount - MyDrive

// Eject the drive
Event: eject - MyDrive
```

## Tests

Use `npm test` to run the tests. Use `npm run cover` to check coverage.

## Changelog

See [changelog.md](https://github.com/overlookmotel/drive-watch/blob/master/changelog.md)

## Issues

If you discover a bug, please raise an issue on Github. https://github.com/overlookmotel/drive-watch/issues

## Contribution

Pull requests are very welcome. Please:

* ensure all tests pass before submitting PR
* add an entry to changelog
* add tests for new features
* document new functionality/API additions in README
