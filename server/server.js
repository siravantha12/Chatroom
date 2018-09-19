var express = require('express');
var server = express();
var path = require("path");
var ejs = require("ejs");
var bodyParser = require('body-parser');

server.set('views',path.join(__dirname+'/../assets/view'))
server.engine('html',ejs.renderFile);
server.set('view engine','html');

server.get('/',function(req,res){
  res.render('simpleChat');
});

server.use(bodyParser.urlencoded({ extended:true}));

server.post('/',function(req,res){
  var parsedInfo = {};
  parsedInfo.chatText = req.body.ChatText;
  console.log("User said: "+ parsedInfo.chatText + "\n");
  //var chatbox = parsedInfo.chatText;
  //res.render('simpleChat',{chatbox:parsedInfo.chatText})
});

// server.get('/',function(req,res){
//   res.sendFile(path.join(__dirname+'/userForm.html'));
// });

server.listen(1337,'0.0.0.0');
