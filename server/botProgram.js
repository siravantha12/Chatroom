var express = require("express");
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require("path");

app.get('/',function(req,res){
    res.sendFile(path.join(__dirname+'/botchat.html'));
});

io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('chat message', function(msg){
        console.log('message: ' + msg);
        io.emit('chat message', msg);
      });
    socket.on('disconnect', function(){
      console.log('user disconnected');
    });
});

http.listen(3456, function(){
    console.log('listening on localhost:3456');
});