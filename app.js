'use strict';
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const fs = require('fs');
const path = require('path');

let app = express();
let server = http.Server(app);
server.listen(20080);

app.use(express.static(__dirname + '/public'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

let io = socketio(server);

let imageDir = './images';

io.on('connection', function (socket) {

    fs.readdir(imageDir, function (err, files) {
        if (err) console.error(err);

        files.forEach(file => {

            let readStream = fs.createReadStream(path.resolve(__dirname, imageDir + '/' + file), {encoding: 'binary'});
            let chunks = [];

            readStream.on('open', () => {
                socket.emit('new-image', file);
                console.log('Loading: ' + file);
            });

            readStream.on('data', (chunk) => {
                chunks.push(chunk);
                socket.emit('img-chunk', chunk, file);
            });

            readStream.on('end', () => {
                console.log('Image loaded');
            });

        });

    });

});
