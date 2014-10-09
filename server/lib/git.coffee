path = require 'path'
exec = require('child_process').exec
request = require 'request'

###
    Initialize repository of <app>
        * Check if git url exist
            * url isn't a github url
            * repo doesn't exist in github
        * Clone repo (with one depth)
        * Change branch if necessary
        * Init submodule
###
module.exports.init = (app, callback) ->
    match = app.repository.url.match(/\/([\w\-_\.]+)\.git$/)
    if not match
        # Url isn't a github url
        err = 'Invalid git url: ' + app.repository.url
        exec "rm -rf #{app.dir}", (error, res) ->
            callback err

    url = app.repository.url
    request.get url.substr(0, (url.length-4)), (err, res, body) ->
        if res.statusCode isnt 200
            # Repo doesn't exist in github
            err = new Error('Invalid git url: ' + url)
            exec "rm -rf #{app.appDir}", {}, (error, res) ->
                callback err
        else
            url = app.repository.url
            # Setup the git commands to be executed
            commands = [
                'cd ' + app.appDir + ' && git clone --depth 1 ' + url,
                'cd ' + app.dir
            ]

            if app.repository.branch?
                commands[1] += ' && git checkout ' + app.repository.branch

            commands[1] += ' && git submodule update --init --recursive'

            executeUntilEmpty = ->
                command = commands.shift()
                # Remark: Using 'exec' here because chaining 'spawn' is not
                # effective here
                config =
                    env:
                        "USER": app.user
                clone = exec command, config, (err, stdout, stderr) ->
                    if err?
                        callback err, false
                    else if commands.length > 0
                        executeUntilEmpty()
                    else if commands.length is 0
                        callback()
            executeUntilEmpty()

###
    Update repository of <app>
        * Check if git url exist
            * url isn't a github url
        * Pull changes
        * Update submodule
###
module.exports.update = (app, callback) ->
    match = app.repository.url.match(/\/([\w\-_\.]+)\.git$/)
    if not match
        err = 'Invalid git url: ' + app.repository.url
        callback err

    # Setup the git commands to be executed
    if app.repository.branch?
        commands = [
            'cd ' + app.dir + ' && git reset --hard ',
            'cd ' + app.dir + ' && git pull origin ' + app.repository.branch,
            'cd ' + app.dir
        ]
    else
        commands = [
            'cd ' + app.dir + ' && git reset --hard ',
            'cd ' + app.dir + ' && git pull',
            'cd ' + app.dir
        ]

    commands[1] += ' && git submodule update --recursive'

    executeUntilEmpty = ->
        command = commands.shift()

        config =
            env:
                "USER": app.user
        # Remark: Using 'exec' here because chaining 'spawn'
        # is not effective her
        exec command, config, (err, stdout, stderr) ->
            if err?
                callback err, false
            else if commands.length > 0
                executeUntilEmpty()
            else if commands.length is 0
                callback()
    executeUntilEmpty()