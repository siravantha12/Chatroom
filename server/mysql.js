var mysql = require('mysql');
var crypto = require('crypto');

var baseConnection = createConnection();

function getSalt(userName, accountEmail, callback) {
	baseConnection.query("select * from chataccounts where userName = '" + userName + "' and accountEmail = '" + accountEmail + "'", function (err, result, fields){
		if(err) throw err;
		console.log("Getting the salt");
		console.log(result);
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

exports.mysqlAccountCreation = function(firstName, lastName, callback){
	var con = createConnection();
	con.query("select * from chatusers where firstName = '" + firstName + "' and lastName = '" + lastName + "'", function (err, result, fields){
		if(err) throw err;
		console.log("Checking user account for uniqueness");
		if(result.length != 0){
			callback(false);
		}
	});
	con.query("insert into chatusers values ('" + firstName + "','" + lastName + "')", function (err, result, fields){
		if(err) throw err;
		callback(true);
	});
}

exports.mysqlValidateUser = function(firstName, lastName, callback){
	var con = createConnection();
	con.query("select * from chatusers where firstName = '" + firstName  + "' and lastName = '" + lastName + "'" , function (err, result, fields){
		if(err) throw err;
		console.log(result);
		if(result.length == 1){
			console.log("Valid user");
			callback(1);
		} else {
			console.log("Invalid user");
			callback(0);
		}
	});
}

exports.isExistingUser = function(accountEmail, callback){
	baseConnection.query("select * from chataccounts where accountEmail = '" + accountEmail + "'", function(err, result, fields){
		if(err) callback(err);
		if(result.length == 0){
			callback(false);
		} else {
			callback(true);
		}
	});
}

exports.mysqlCreateAccount = function(userName, accountEmail, password, callback){
	var salt = crypto.randomBytes(16).toString('hex');
	var hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
	baseConnection.query("Insert into chataccounts (userName, accountPassword, salt, accountEmail) values ('" + userName + "','" + hash + "','" + salt + "','" + accountEmail + "');", function(err, result, fields){
		if(err) throw err;
		console.log("Account created");
		callback();
	});
}
