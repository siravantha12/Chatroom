var express = require("express");
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require("path");
var bodyParser = require('body-parser');
var mysqlConnection = require("./demo_connection.js");

app.use(express.static(__dirname + "/../assets"));

/*
 * Publish main page for user input
 */
app.get('/',function(req,res){
	res.sendFile(path.join(__dirname+'/../assets/view/index.html'));
});

/*
 * Publish chatPage.html 
 */
app.get('/chatPage', function(req,res){
	res.sendFile(path.join(__dirname+'/chatPage.html'));
});

/*
 * Control client connections. Commented out code allows sockets to be grouped into individual
 * "chat rooms" (socket groups). Commented out for ease of testing.
 */
io.on('connection', function(socket){

	// socket.join("room1");

	/*
	 * Emit new messages when the msg even is recieved
	 */
	socket.on('msg', function(msg){
		console.log("message recieved: " + msg);
		io.emit('newmsg', msg);
		// io.socket.in("room1").emit('newmsg', msg);
	});
});

app.use(bodyParser.urlencoded({extended:true}));

/*
 * Post response on userForm html. Will redirect client to chatpage if the user is validated.
 * Will tell the user they are invalid otherwise.
 */
app.post('/',function(req,res){
	console.log("Inside post");
	var parsedInfo = {};
	parsedInfo.firstName = req.body.username;
	parsedInfo.lastName = req.body.password;

	console.log("validating user");
	console.log("User info " + parsedInfo.firstName + " " + parsedInfo.lastName);
	mysqlConnection.mysqlValidateUser(parsedInfo.firstName, parsedInfo.lastName, function(result){
		if(result){
			return res.redirect('/chatPage');
		} else {
			res.end("You are invalid");
		}
	});

});

/*
 * Listen on local network on port 3456 for incomming connections.
 */
http.listen(3456, '0.0.0.0', function(){
	console.log("listening on port: 3456");
});
