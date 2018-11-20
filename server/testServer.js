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
var cookieParser = require('cookie-parser');
var MySQLStore = require('express-mysql-session')(session);
var connect = require('connect');
var cookie = require('./node_modules/cookie');

require('../config/passport')(passport);

var mysqlOptions = {
	host: "216.96.149.200",
	user: "cbates10",
	password: "Imbroglio3724!",
	database: "chat"
};

var sessionStore = new MySQLStore(mysqlOptions);

app.use(cookieParser());
app.use(session({ secret: 'themoonlandingwasfake', store: sessionStore }));
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
	res.sendFile(path.join(__dirname+'/../assets/view/chatPage.html'));
});


/*
 * Control client connections. Commented out code allows sockets to be grouped into individual
 * "chat rooms" (socket groups). Commented out for ease of testing.
 */
var currentConnections = {};

io.on('connection', function(socket){
	/*
 	* Connect to a chatroom by name
 	*/
	// Determine the user identity of whoever connects to a socket
	var cookie_string = socket.request.headers.cookie;
	if(cookie_string){
		var parsed_cookies = cookie.parse(cookie_string);
		var connect_sid = parsed_cookies['connect.sid'];
		var sessionId = connect_sid.match(/(?<=s:).*?(?=\.)/);
		sessionStore.get(sessionId, function(error, session){
			socket.userid = session.passport.user;
			mysqlConnection.getRowById(socket.userid, function(err, result){
				console.log("This is the initial part");
				console.log(result[0].userName);
				var userId = result[0].userName + socket.userid;
				socket.fullUserName = userId;
				currentConnections[socket.userid] = socket.id;
				socket.username = result[0].userName;
				io.to(socket.id).emit('username', userId);
			});
			mysqlConnection.getFriends(socket.userid, function(err, result){
				io.to(socket.id).emit('friendslist', result);
			});
			mysqlConnection.getChatrooms(socket.userid, function(err, result){
				var chatrooms = new Array(result.length);
				socket.roomlist = [];
				for(var i = 0; i < result.length; i++){
					chatrooms[i] = result[i].roomName + "#" + result[i].roomid;
					socket.roomlist.push(chatrooms[i]);
				}
				console.log("Submitting chatroom list to client");
				io.to(socket.id).emit('chatroomlist', socket.roomlist);
				console.log(socket.roomlist);
			});
		});
	}

	socket.on('switch', function(index) {
		console.log("Switching client to room " + socket.roomlist[index]);
		socket.leave(socket.room);
		socket.room = socket.roomlist[index];
		socket.roomid = socket.room.match(/#(\d+)/)[1];
		socket.join(socket.room, function(){
			io.to(socket.id).emit('joinedroom', socket.room);
			mysqlConnection.getMessagesForRoom(socket.roomid, function(err, result){
				for(var i = 0; i < result.length; i++) {
					console.log(result[i]);
					console.log(result[i].messagetime);
					//var thingding = result[i].messagetime;
					//matchthing += String(thingding).match(/(\d{1,2}:\d{1,2}:\d{1,2})/)[1];
					//console.log(matchthing);
				}
				io.to(socket.id).emit('allchatmessages', result);	
			});
		});

	});

	socket.on('privatemessage', function(msg, id) {
		console.log("sending from " + socket.userid + " To "  + id);
		console.log("The socket id for the given id of " + socket.userid + " is " + currentConnections[socket.userid]);
		msg.username = socket.username;
		var date = new Date();
		msg.date = date.toTimeString();
		console.log("Emitting the private message");
		io.to(socket.id).emit('newprivatemessage', msg, id);
		io.to(currentConnections[id]).emit('newprivatemessage', msg, socket.userid);
	});

	socket.on('join', function(room){
		mysqlConnection.mysqlCreateChat(room, function(result) {
			socket.leave(socket.room);
			var roomname = room;
			socket.roomname = room;
			room = room + "#" + result.insertId;
			socket.room = room;
			socket.roomid = result.insertId;
			console.log("Adding chatroom id " + socket.roomid + " to user id " + socket.userid);
			mysqlConnection.addChatroomToAccount(socket.userid, socket.roomid, function(err, result) {
				if(err) throw err;
			});
			socket.join(room, function(){
				io.to(socket.id).emit('joinedroom', roomname);
				mysqlConnection.getMessagesForRoom(socket.roomid, function(err, result){
					console.log("The messages are shown below");
					console.log(result[0]);
					io.to(socket.id).emit('allchatmessages', result);	
				});
			});
		});
	});


	socket.on('addfriend', function(friendid) {
		console.log("Entered the add friend logic");
		mysqlConnection.getRowById(friendid, function(err, result) {
			if(result.length != 0) {
				io.to(currentConnections[friendid]).emit('friendinvite', socket.username, socket.userid);
			}
		});
	});
	/*
 	* Emit new messages when the msg event is recieved
 	*/
	socket.on('msg', function(msg){
		console.log(socket.roomid);
		console.log(socket.userid);
		console.log(msg.message);
		mysqlConnection.mysqlStoreMessage(socket.roomid, socket.userid, msg.message);
		msg.username = socket.username;
		msg.userid = socket.userid;
		var date = new Date();
		msg.date = date.toTimeString();
		io.to(socket.room).emit('newmsg', msg);
	});

	socket.on('inviteuser', function(user){
		console.log("all is needed is " + user);
		console.log(currentConnections[user]);
		if(currentConnections[user]){
			io.to(currentConnections[user]).emit('inviteduser', socket.roomname, socket.roomid);
		} 
	});

	socket.on('acceptinvite', function(room, roomid){
		socket.leave(socket.room);
		socket.roomname = room;
		socket.roomid = roomid;
		socket.room = room + "#" + roomid;
		socket.join(socket.room, function(){
			io.to(socket.id).emit('joinedroom', socket.roomname);
		});
	});
})

app.use(bodyParser.urlencoded({extended:true}));

app.post('/action_page.php',function(req, res){
	var parsedInfo = {};
	parsedInfo.email = req.body.email;
	parsedInfo.psw = req.body.psw;
	parsedInfo.username = req.body.username;
	mysqlConnection.mysqlCreateAccount(parsedInfo.username, parsedInfo.email, parsedInfo.psw, function(result){
		if(result){
			res.redirect('back');
		} else {
			res.end("Account could not be created, this message will become more helpful with time");	
		}
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
