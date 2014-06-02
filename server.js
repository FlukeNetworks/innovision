var sio = require('socket.io');
var express = require('express');
var http = require('http');
var https = require('https');
var content = require('node-static');
var cmd = require('./lib/command').cmd;
var g = require('./lib/common');

/* Express Config */
var app = express();

var srvUsername = process.env.USERNAME || 'user';
var srvPassword = process.env.PASSWORD || 'password';

var auth = express.basicAuth(function (user, pass, callback) {
    if (user === srvUsername && pass === srvPassword) {
        return callback(null, true);
    }
    return callback(null, false); //denied
});


g.log('Starting Graffeine server');


/* express routes */
//app.get('*',function(req,res,next){
//    if(req.headers['x-forwarded-proto']!='https')
//        res.redirect('https://mypreferreddomain.com'+req.url)
//    else
//        next() /* Continue to other routes if we're not redirecting */
//})

app.configure(function () {
    
    app.use(express.static(__dirname + '/public'));
    app.use(auth);
    app.use(app.router);
});


var port = process.env.PORT || g.config.server.port;
var sslport = process.env.SSLPORT || g.config.server.sslport;
var srv = http.createServer(app);
//var srv_https = https.createServer(ssl_handler);

g.log('Open browser to http://127.0.0.1:' + port);
g.log('Open browser to https://127.0.0.1:' + sslport);
g.log('Starting WS server on ' + port);
//srv_https.listen(port);


var ws = srv.listen(port);
var conn = sio.listen(ws, { log: false });

conn.sockets.on('connection', function (socket) {

    var command = new cmd.Server(socket);

    g.log('Got connection');

    socket.on('graph-init', command.graphInitialise);
    socket.on('graph-stats', command.graphStatistics);
    socket.on('graph-fetch', command.graphFetch);
    socket.on('node-join', command.nodesJoin);
    socket.on('node-add', command.nodeAdd);
    socket.on('node-update', command.nodeUpdate);
    socket.on('node-find', command.nodeFind);
    socket.on('node-delete', command.nodeDelete);
    socket.on('nodes-orphans', command.nodesOrphans);
    socket.on('rel-delete', command.relDelete);

});
