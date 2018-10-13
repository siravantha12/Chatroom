/* 
 *  Test File for Render Function
 *  Job = render "html" with userinfo/chat
 *  Purpose = Not clutter server.js
 */

var express = require("express");
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require("path");
var bodyParser = require('body-parser');
var mysqlConnection = require("./mysql.js");
var ejs = require("ejs");

app.set('views',path.join(__dirname+'/../assets/view'))
app.engine('html',ejs.renderFile);
app.set('view engine','html');

app.use(express.static(__dirname + "/../assets"));

app.get('/',function(req,res){
	renderUserInfo(res,'index.html','name');
});

/*
 * Listen on local network on port 3456 for incoming connections.
 */
app.post('/',function(req,res){
	console.log("Inside post");
	var parsedInfo = {};
	parsedInfo.userName = req.body.username;
	parsedInfo.password = req.body.password;
    console.log("validating user");
    res.redirect('/chatPage');
	mysqlConnection.mysqlValidateUser(parsedInfo.userName, parsedInfo.password, function(result){
		if(result){
			return res.redirect('/chatPage');
		} else {
			res.end("You are invalid");
		}
	});
});

/*
 * Simple Function to render "htmlName" with a tuple/array UserInfo
 * UserInfo = [UserName,etc.,etc.,etc.] etc = Maybe Other info if we needed
 */

function renderUserInfo(res,htmlName,UserInfo){
    res.render(htmlName);
}

app.listen(3456,'0.0.0.0');