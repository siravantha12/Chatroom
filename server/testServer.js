var express = require("express");
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require("path");
var bodyParser = require('body-parser');
var mysqlConnection = require("./mysql.js");
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
require('../config/passport')(passport);

app.use(session({ secret: 'themoonlandingwasfake' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

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
app.get('/chatPage', isLoggedIn, function(req,res){
	res.sendFile(path.join(__dirname+'/chatPage.html'));
});


/*
 * Control client connections. Commented out code allows sockets to be grouped into individual
 * "chat rooms" (socket groups). Commented out for ease of testing.
 */
io.on('connection', function(socket){
	/*
	 * Connect to a chatroom by name
	 */
	socket.on('join', function(room){
		socket.leave(socket.room);
		socket.room = room;
		socket.join(room, function(){
			console.log(socket.rooms);	
		});
		mysqlConnection.mysqlCreateChat(room, function(result) {
			console.log("INSIDE THAT TIME");
		});
	});

	/*
	 * Emit new messages when the msg even is recieved
	 */
	socket.on('msg', function(msg){
		console.log("message recieved: " + msg + "submitting to room " + socket.room);
		io.to(socket.room).emit('newmsg', msg);
		// io.socket.in("room1").emit('newmsg', msg);
	})
})

app.use(bodyParser.urlencoded({extended:true}));

app.post('/action_page.php',function(req, res){
	var parsedInfo = {};
	parsedInfo.email = req.body.email;
	parsedInfo.psw = req.body.psw;
	parsedInfo.username = req.body.username;
	mysqlConnection.mysqlCreateAccount(parsedInfo.username, parsedInfo.email, parsedInfo.psw, function(result){
		if(result){
			console.log("Account created successfully");
			res.redirect('back');
		} else {
			res.end("Account could not be created, this message will become more helpful with time");	
get		}
	});
});

/*
 * Post response on userForm html. Will redirect client to chatpage if the user is validated.
 * Will tell the user they are invalid otherwise.
 */
app.post('/login', passport.authenticate('local-login', {
	successRedirect : '/chatPage',
	failureRedirect : '/',
	failureFlash : true
}));

/*
app.post('/login',function(req,res){
	console.log("Inside post");
	var parsedInfo = {};
	parsedInfo.userName = req.body.username;
	parsedInfo.password = req.body.password;
	console.log("validating user");
	mysqlConnection.mysqlValidateUser(parsedInfo.userName, parsedInfo.password, function(result){
		if(result){
			res.redirect('/chatPage');
		} else {
			res.end("You are invalid");
		}
	});
});
*/
/*
 * Listen on local network on port 3456 for incoming connections.
 */

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		res.redirect('/');
	}
}

http.listen(3456, '0.0.0.0', function(){
	console.log("listening on port: 3456");
});
