// --------------------
// drive-watch module
// --------------------

// modules
var fs = require('fs-extra-promise'),
    _ = require('lodash');

// exports

// create drivesPath
var platform = process.platform;
var drivesPath = (function() {
    if (platform == 'darwin') return '/Volumes';
    if (platform == 'linux') return '/media/' + process.env.USER;
    throw new Error("Platform '" + platform + "' not supported");
})();

var DriveWatch = module.exports = function(eventHandler, options) {
    if (eventHandler && typeof eventHandler == 'object') {
        options = eventHandler;
        eventHandler = options.handler;
    } else {
        if (!options) options = {};
        if (!eventHandler) eventHandler = options.handler;
    }

    delete options.handler;
    if (options.scanInterval === undefined) options.scanInterval = 10000; // 10 seconds

    this.options = options;
    this.eventHandler = eventHandler;
    return this;
};

DriveWatch.prototype.start = function() {
    var self = this;

    // start watching
    var reading, newEvents;

    this.watcher = fs.watch(drivesPath, function(event, name) { // jshint ignore:line
        if (reading) {
            newEvents = true;
            return;
        }

        var foundIndex = self.drives.indexOf(name);
        if (foundIndex != -1) {
            // drive ejected
            self.drives.splice(foundIndex, 1);
            if (self.eventHandler) self.eventHandler('eject', name);
            return;
        }

        // drive mounted
        self.drives.push(name);
        if (self.eventHandler) self.eventHandler('mount', name);
    });

    // get drives currently connected
    return getDrives();

    // get drives initially connected
    function getDrives() {
        return getDrivesNow().then(function(drives) {
            // if new drive events during scan, redo scan
            if (newEvents) return getDrives();
            recordDrives(drives);

            if (self.options.scanInterval) self.scanTimer = setTimeout(updateDrives, self.options.scanInterval);

            // return drives array, cloned so not altered by future events
            return self.drives.slice(0);
        });
    }

    // periodic scan for drives mounted/ejected
    function updateDrives() {
        delete self.scanTimer;

        var oldDrives = self.drives;

        return getDrivesNow().then(function(drives) {
            // if new drive events during scan, redo scan
            if (newEvents) return updateDrives();
            recordDrives(drives);

            if (self.eventHandler) {
                // find drives ejected
                _.difference(oldDrives, drives).forEach(function(name) {
                    self.eventHandler('eject', name);
                });

                // find drives mounted
                _.difference(drives, oldDrives).forEach(function(name) {
                    self.eventHandler('mount', name);
                });
            }

            // schedule to run again
            self.scanTimer = setTimeout(updateDrives, self.options.scanInterval);
        });
    }

    // scan for connected drives
    function getDrivesNow() {
        reading = true;
        newEvents = false;

        return fs.readdirAsync(drivesPath)
        .then(function(files) {
            var drives = files.filter(function(name) {
                return name != '.DS_Store';
            });

            return drives;
        });
    }

    // save drives array to this.drives
    function recordDrives(drives) {
        self.drives = drives;
        reading = false;
    }
};

DriveWatch.prototype.stop = function() {
    if (this.watcher) this.watcher.close();
    delete this.watcher;

    if (this.scanTimer) clearTimeout(this.scanTimer);
    delete this.scanTimer;
};
