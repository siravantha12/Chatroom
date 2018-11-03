var mysql = require('mysql');
var crypto = require('crypto'); // Used for password encryption

var baseConnection = createConnection();

function getSalt(userName, accountEmail, callback) {
	baseConnection.query("select * from chataccounts where userName = '" + userName + "' and accountEmail = '" + accountEmail + "'", function (err, result, fields){
		if(err) throw err;
		callback(result[0].salt);
	});
}

function createConnection() {
	
	// Connects to instance of mysql database. Currently runs off local mysql database.
	var con = mysql.createConnection({
		host: "216.96.149.200",
		user: "cbates10",
		password: "Imbroglio3724!",
		database: "chat"
	});
	return con;
}

exports.getChatrooms = function(userid, callback){
	baseConnection.query("select r.roomid, c.roomName from roomusers r join chatrooms c on r.roomid = c.roomid where r.accountNumber = " + userid + ";", function (err, result, fields){
		callback(err, result);
	});
}

exports.addFriends = function(userid1, userid2, callback){
	baseConnection.query("insert into friends values (" + userid1 + "," +userid2 +");", function (err, result, fields) {
		callback(err, result);
	});
}

exports.getFriends = function(userid, callback) {
	baseConnection.query("select f.friendid2, c.userName from friends f join chataccounts c on c.accountNumber = f.friendid2 where friendid1 = " + userid + ";", function (err, result, fields) {
		callback(err, result);
	});
}

exports.getMessagesForRoom = function(roomid, callback){
	baseConnection.query("select userName, messagetime, chatmessage from chatroommessages natural join chataccounts where roomid = " + roomid + ";", function (err, result, fields){
		callback(err, result);
	});
}

exports.getRowById = function(accountNumber, callback){
	baseConnection.query("select * from chataccounts where accountNumber = " + accountNumber + ";", function(err, result, fields){
		callback(err, result);
	});
}

/*
 * Method to validate a password
 */
function validatePassword(password, hash, salt) {
	var passHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
	return hash == passHash; 
}

/*
 * Function to validate a user given a username and password
 */
function mysqlValidateUser(userName, password, callback){
	var hash;
	baseConnection.query("select * from chataccounts where userName = '" + userName + "'", function(err, result, fields){
		if(err) throw err;
		var passHash;
		for(var i = 0; i < result.length; i++){
			console.log("Checking against values " + result[i].accountPassword + " " + result[i].salt);
			passHash = crypto.pbkdf2Sync(password, result[i].salt, 1000, 64, 'sha512').toString('hex');
			if(result[i].accountPassword == passHash){
				return callback(true, result[i].accountNumber);
			}
		}
		callback(false);
	});
}

/*
 * Function to create a chatroom given a chatname, privateLock (is the chatroom private), and a password if the chat is private
 */
exports.mysqlCreateChat = function(chatName, callback){
	baseConnection.query("insert into chatrooms (roomName) values ('" + chatName + "');", function(err, result, fields){
		if(err) throw err;
		console.log(result);
		callback(result);
	});
}

exports.mysqlStoreMessage = function(roomid, accountNumber, message){
	baseConnection.query("insert into chatroommessages (roomid, accountNumber, chatmessage) values (" + roomid + "," + accountNumber + ",'" + message + "');");
}

exports.mysqlValidateUser = mysqlValidateUser;

/*
 * Function to create an account in the database given a username, email, and password
 */
exports.mysqlCreateAccount = function(userName, accountEmail, password, callback){
	var salt = crypto.randomBytes(16).toString('hex');
	var hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
	mysqlValidateUser(userName, password, function(result){
		if(result){
			callback(false);
		} else {
			baseConnection.query("Insert into chataccounts (userName, accountPassword, salt, accountEmail) values ('" + userName + "','" + hash + "','" + salt + "','" + accountEmail + "');", function(err, result, fields){
				if(err) throw err;
				callback(true);
			});

		}
	});
}

