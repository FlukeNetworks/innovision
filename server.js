
var sio     = require('socket.io');
var http    = require('http');
var content = require('node-static');
var cmd     = require('./lib/command').cmd;
var g       = require('./lib/common');

g.log('Starting Graffeine server');

var file = new(content.Server)('public');

// changed handler not to hang with later versions of node.js

var handler = function(request, response) { 
    file.serve(request, response, function (err, res) { 
        if (err) { 
            console.error("ERROR: Problem serving " + request.url + " - " + err.message);
            response.writeHead(err.status, err.headers);
            response.end();
        }
        else {
            // console.log("> " + request.url + " - " + res.message);
        }
    });
};

var port = process.env.PORT || g.config.server.port;
var srv = http.createServer(handler);

srv.listen(port);

g.log('Open browser to http://127.0.0.1:' + port);
g.log('Starting WS server on ' + port);

var ws = srv.listen(port);
var conn = sio.listen(ws, { log: false });

conn.sockets.on('connection', function (socket) {

    var command = new cmd.Server(socket);
    
    g.log('Got connection');

    socket.on('graph-init',    command.graphInitialise);
    socket.on('graph-stats',   command.graphStatistics);
    socket.on('graph-fetch',   command.graphFetch);
    socket.on('node-join',     command.nodesJoin);
    socket.on('node-add',      command.nodeAdd);
    socket.on('node-update',   command.nodeUpdate);
    socket.on('node-find',     command.nodeFind);
    socket.on('node-delete',   command.nodeDelete);
    socket.on('nodes-orphans', command.nodesOrphans);
    socket.on('rel-delete',    command.relDelete);

});
