var express = require('express');
var server = express();
var path = require("path");

server.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/View/index.html'));
});

server.listen(1337,'0.0.0.0');