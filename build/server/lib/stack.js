// Generated by CoffeeScript 1.8.0
var config, fs;

fs = require('fs');

config = require('./conf').get;


/*
    Add application <app> in stack.json
        * read stack file
        * parse date (in json)
        * add application <app>
        * write stack file with new stack applications
 */

module.exports.addApp = function(app, callback) {
  return fs.readFile(config('file_stack'), 'utf8', function(err, data) {
    try {
      data = JSON.parse(data);
    } catch (_error) {
      data = {};
    }
    data[app.name] = app;
    return fs.open(config('file_stack'), 'w', function(err, fd) {
      return fs.write(fd, JSON.stringify(data), 0, data.length, 0, callback);
    });
  });
};


/*
    Remove application <name> from stack.json
        * read stack file
        * parse date (in json)
        * remove application <name>
        * write stack file with new stack applications
 */

module.exports.removeApp = function(name, callback) {
  return fs.readFile(config('file_stack'), 'utf8', function(err, data) {
    try {
      data = JSON.parse(data);
    } catch (_error) {
      data = {};
    }
    delete data[name];
    return fs.open(config('file_stack'), 'w', function(err, fd) {
      return fs.write(fd, JSON.stringify(data), 0, data.length, 0, callback);
    });
  });
};
