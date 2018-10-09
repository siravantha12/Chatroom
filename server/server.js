var express = require('express');
var server = express();
var path = require("path");
var ejs = require("ejs");
var bodyParser = require('body-parser');

server.set('views',path.join(__dirname+'/../assets/view'))
server.engine('html',ejs.renderFile);
server.set('view engine','html');
server.use(bodyParser.urlencoded({ extended:true}));

server.get('/',function(req,res){
  res.render('simpleChat.html');
});

server.post('/',function(req,res){
  res.write()
});

server.listen(3456);