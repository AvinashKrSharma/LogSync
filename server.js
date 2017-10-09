var WebSocketServer = require('ws').Server;
var express = require('express');
var path = require('path');
var app = express();
var server = require('http').createServer();
var chokidar = require('chokidar');
var fs = require('fs');

app.use(express.static(path.join(__dirname, '/public')));
var fileLength = 0;

function sendFileContents(path, ws, event){
    fs.readFile(path, 'utf8', function (err,data) {
        if (err) {
            return console.log(err);
        }
        data = data.split("\n");
        newData = data;
        fileLength && (newData = data.slice(fileLength - 1));
        ws.send(JSON.stringify({msg: newData}), function () { /* ignore errors */ });
        fileLength = data.length;
    });
}

function startWatcher(ws){
    chokidar.watch('./logs.txt', {}).on('all', (event, path) => {
        sendFileContents(path, ws, event);
    });
}

var wss = new WebSocketServer({server: server});
wss.on('connection', function (ws) {
    startWatcher(ws);
    console.log('started client interval');
    ws.on('close', function () {
        console.log('stopping client interval');
    });
});

server.on('request', app);
server.listen(8080, function () {
    console.log('Listening on http://localhost:8080');
});
