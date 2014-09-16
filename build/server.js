// Generated by CoffeeScript 1.7.0
var americano, application, controller, init;

americano = require('americano');

init = require('./server/initialize');

controller = require('./server/lib/controller');

application = module.exports = function(callback) {
  var err, options;
  if ((process.env.USER != null) && process.env.USER !== 'root') {
    err = "Are you sure, you are root ?";
    console.log(err);
    if (callback != null) {
      return callback(err);
    }
  } else {
    options = {
      name: 'controller',
      port: process.env.PORT || 9002,
      host: process.env.HOST || "127.0.0.1",
      root: __dirname
    };
    init.init((function(_this) {
      return function(err) {
        console.log(err);
        if (err != null) {
          callback(err);
        }
        return init.autostart(function(err) {
          if (err == null) {
            return americano.start(options, callback);
          } else {
            console.log(err);
            if (callback != null) {
              return callback(err);
            }
          }
        });
      };
    })(this));
    process.on('uncaughtException', function(err) {
      console.log(err);
      return console.log(err.stack);
    });
    process.on('exit', function(code) {
      console.log("exit");
      return controller.stopAll((function(_this) {
        return function() {
          return process.exit(code);
        };
      })(this));
    });

    /*process.on 'close', (code) ->
        controller.stopAll ()=>
            console.log "stop"
            process.exit(code)
     */
    return process.on('SIGTERM', function() {
      console.log("exit");
      return controller.stopAll((function(_this) {
        return function() {
          return process.exit(code);
        };
      })(this));
    });

    /*process.on "SIGINT", (code) ->
        console.log "SIGINT"
        controller.stopAll ()=>
            process.exit(code)
     */
  }
};

if (!module.parent) {
  application();
}
