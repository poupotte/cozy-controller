// Generated by CoffeeScript 1.9.3
var App, async, conf, config, directory, fs, initAppsDir, initAppsFiles, initDir, initFiles, initTokenFile, log, mkdirp, patch, path, permission, randomString;

fs = require('fs');

path = require('path');

async = require('async');

log = require('printit')();

permission = require('./middlewares/token');

App = require('./lib/app').App;

directory = require('./lib/directory');

conf = require('./lib/conf');

config = require('./lib/conf').get;

mkdirp = require('mkdirp');

patch = require('./lib/patch');

randomString = function(length) {
  var string;
  if (length == null) {
    length = 32;
  }
  string = "";
  while (string.length < length) {
    string += Math.random().toString(36).substr(2);
  }
  return string.substr(0, length);
};


/*
    Patch (15/10/15)
    Add directory for all applications
 */

initAppsDir = function(callback) {
  var apps;
  apps = fs.readdirSync(config('dir_app_bin'));
  return async.forEach(apps, function(app, cb) {
    var appli;
    if (app === 'stack.json') {
      return cb();
    } else {
      appli = {
        name: app,
        user: "cozy-" + app
      };
      return directory.create(appli, cb);
    }
  }, callback);
};


/*
    Initialize source directory
        * Create new directory
 */

initDir = function(callback) {
  var newDir;
  newDir = config('dir_app_bin');
  return mkdirp(newDir, function(err) {
    return fs.chmod(newDir, '0777', callback);
  });
};


/*
    Initialize source code directory and stack.json file
 */

initAppsFiles = function(callback) {
  log.info('init: source directory');
  return initDir(function(err) {
    var stackFile;
    if (err != null) {
      callback(err);
    }
    log.info('init: stack file');
    stackFile = config('file_stack');
    if (!fs.existsSync(stackFile)) {
      return fs.open(stackFile, 'w', callback);
    } else {
      return callback();
    }
  });
};


/*
    Init stack token stored in '/etc/cozy/stack.token'
 */

initTokenFile = function(callback) {
  var tokenFile;
  log.info("init: token file");
  tokenFile = config('file_token');
  if (tokenFile === '/etc/cozy/stack.token' && !fs.existsSync('/etc/cozy')) {
    fs.mkdirSync('/etc/cozy');
  }
  if (fs.existsSync(tokenFile)) {
    fs.unlinkSync(tokenFile);
  }
  return fs.open(tokenFile, 'w', function(err, fd) {
    if (err) {
      return callback("We cannot create token file. " + "Are you sure, token file configuration is a good path ?");
    } else {
      return fs.chmod(tokenFile, '0600', function(err) {
        var token;
        if (err != null) {
          callback(err);
        }
        token = randomString();
        return fs.writeFile(tokenFile, token, function(err) {
          permission.init(token);
          return callback(err);
        });
      });
    }
  });
};


/*
    Initialize files:
        * Initialize stack file and directory of source code
        * Initialize log files
        * Initialize token file
 */

initFiles = function(callback) {
  return initAppsFiles(function(err) {
    if (err != null) {
      return callback(err);
    } else {
      return mkdirp(config('dir_app_log'), function(err) {
        return mkdirp(config('dir_app_data'), function(err) {
          return initAppsDir(function(err) {
            if (process.env.NODE_ENV !== "development") {
              return initTokenFile(callback);
            } else {
              return callback();
            }
          });
        });
      });
    }
  });
};


/*
    Initialize files:
        * Initialize configuration
        * Initialize files
        * Rewrite file configuration
 */

module.exports.init = function(callback) {
  var initialize;
  log.info("### FILE INITIALIZATION ###");
  initialize = function() {
    return conf.init(function(err) {
      if (err) {
        return callback(err);
      } else {
        return initFiles(function(err) {
          return callback(err);
        });
      }
    });
  };
  if (fs.existsSync('/usr/local/cozy/autostart')) {
    return patch.apply(function() {
      return initialize();
    });
  } else {
    return initialize();
  }
};
