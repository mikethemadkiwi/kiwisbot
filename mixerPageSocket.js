//requires
let util = require('util');
let events = require('events');
//module
let obj = function(){
    let self = this;
    const express = require('express');
    const app = express();
    const colors = require('colors');
    const path = require('path');
    const fs = require('fs');
    const cookieParser = require('cookie-parser'); //COOOKIES!! NOM
    const bodyParser = require('body-parser');
    // const server = require('http').createServer(app);
    const server = require('https').createServer({
        key: fs.readFileSync('./kiwisbot.pem'),
        cert: fs.readFileSync('./kiwisbot.crt'),
        requestCert: true,
        rejectUnauthorized: false
    },app);
    const io = require('socket.io')(server);
    // io.set('origins', /*your desired origins*/);
    io.set('transports', ['websocket',
        'flashsocket',
        'htmlfile',
        'xhr-polling',
        'jsonp-polling',
        'polling']);    
    var sockets = {};
    const webport = 12345;
    const port = process.env.PORT || webport;


    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(express.static(__dirname + '/www/'));
    server.listen(port, function() {
        console.log(colors.yellow('Webserver Listening on port: ' + webport));
    });


    self.removeFromArray = function(array, value) {
        var idx = array.indexOf(value);
        if (idx !== -1) {
            array.splice(idx, 1);
        }
        return array;
    }
    self.sendToSocket = function(name, data){
        // console.log(name, data)
        io.emit(name, data);
    }


    self.socketUsers = [];
    //
    io.on('connection', function (socket) {
        socket.name = socket.id;  
        console.log(colors.green(`Socket Event`));
        console.log(`${socket.name} connected from : ${socket.handshake.address}`); 
        self.socketUsers[socket.id] = socket;
        self.emit('connected', socket)
        io.emit('connected', socket.handshake.address);
        // console.log(self.socketUsers);
        //


        
        //
        socket.on('disconnect', function () {
        console.log(colors.green(`Socket Event`));
            console.log(socket.name + ' disconnected');            
            self.removeFromArray(self.socketUsers, socket.name)
            self.emit('disconnected', socket)
            io.emit('disconnected', socket.handshake.address);
            // console.log(self.socketUsers);
        });
    });

};
obj.prototype = new events.EventEmitter;
module.exports = obj;