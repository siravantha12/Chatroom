var express = require("express");
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require("path");

app.get('/',function(req,res){
    res.sendFile(path.join(__dirname+'/botchat.html'));
});

io.on('connection', function(socket){
    //Emits to all people that a user connected
    //io.emit('chat message','user connected');
    //Emits to all people beside send (user that have connected) that a user connected
    socket.broadcast.emit('chat message', "User connected");
    socket.on('chat message', function(msg){
        console.log('message: ' + msg);
        io.emit('chat message', msg);
      });
});

http.listen(3456, function(){
    console.log('listening on localhost:3456');
});