// --------------------
// drive-watch module
// --------------------

// modules
var fs = require('fs-extra-promise');

// exports
var DriveWatch = module.exports = function(eventHandler) {
    this.eventHandler = eventHandler;
    return this;
};

DriveWatch.prototype.start = function() {
    var self = this,
        drives = this.drives;

    // start watching
    var newEvents = false,
        started = false;

    this.watcher = fs.watch('/Volumes', function(event, name) { // jshint ignore:line
        if (!started) {
            newEvents = true;
            return;
        }

        if (drives.indexOf(name) != -1) {
            // drive ejected
            drives.splice(drives.indexOf(name), 1);
            return self.eventHandler('eject', name);
        }

        // drive mounted
        drives.push(name);
        return self.eventHandler('mount', name);
    });

    // get drives currently connected
    return getDrives();

    function getDrives() {
        return fs.readdirAsync('/Volumes')
        .then(function(files) {
            if (newEvents) {
                newEvents = false;
                return getDrives();
            }

            started = true;

            drives = self.drives = [];
            files.forEach(function(name) {
                if (name == '.DS_Store') return;
                drives.push(name);
            });

            return drives;
        });
    }
};

DriveWatch.prototype.stop = function() {
    this.watcher.close();
    delete this.watcher;
};
