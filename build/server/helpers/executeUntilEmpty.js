// Generated by CoffeeScript 1.10.0
var exec, executeUntilEmpty;

exec = require('child_process').exec;

module.exports = executeUntilEmpty = function(commands, config, callback) {
  var command;
  command = commands.shift();
  if (command.indexOf('cd') !== -1) {
    config.cwd = command.split('cd ')[1];
    return executeUntilEmpty(commands, config, callback);
  }
  if (config.user != null) {
    command = "su " + config.user + " -c '" + command + "'";
  }
  return exec(command, config, function(err, stdout, stderr) {
    if (err != null) {
      return callback(err, false);
    } else if (commands.length > 0) {
      return executeUntilEmpty(commands, config, callback);
    } else {
      return callback();
    }
  });
};
