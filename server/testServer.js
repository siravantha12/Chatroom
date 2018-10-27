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
	// Determine the user identity of whoever connects to a socket
	var cookie_string = socket.request.headers.cookie;
	if(cookie_string){
		var parsed_cookies = cookie.parse(cookie_string);
		var connect_sid = parsed_cookies['connect.sid'];
		var sessionId = connect_sid.match(/(?<=s:).*?(?=\.)/);
		sessionStore.get(sessionId, function(error, session){
			console.log(session.passport.user);
			socket.userid = session.passport.user;
			mysqlConnection.getRowById(socket.userid, function(err, result){
				socket.username = result[0].userName;
			});
		});
	}
	socket.on('join', function(room){
		mysqlConnection.mysqlCreateChat(room, function(result) {
			socket.leave(socket.room);
			room = room + "#" + result.insertId;
			socket.room = room;
			socket.roomid = result.insertId;
			io.to(socket.id).emit('newmsg', data);
			socket.join(room, function(){
				mysqlConnection.getMessagesForRoom(socket.roomid, function(err, result){
					io.to(socket.id).emit('allchatmessages', result);	
				});
			});
		});
	});

	/*
 	* Emit new messages when the msg even is recieved
 	*/
	socket.on('msg', function(msg){
		mysqlConnection.mysqlStoreMessage(socket.roomid, socket.userid, msg.message);
		console.log("Message sent from " + socket.username);
		msg.username = socket.username;
		msg.date = new Date();
		io.to(socket.room).emit('newmsg', msg);
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
