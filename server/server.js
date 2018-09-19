var express = require('express');
var server = express();
var path = require("path");
var ejs = require("ejs");

server.set('views',path.join(__dirname+'/../assets/view'))
server.engine('html',ejs.renderFile);
server.set('view engine','html');

server.get('/',function(req,res){
  res.render('index');
});

// server.get('/',function(req,res){
//   res.sendFile(path.join(__dirname+'/userForm.html'));
// });

server.listen(1337,'0.0.0.0');
