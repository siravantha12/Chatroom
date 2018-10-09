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

function validatePassword(password, hash, salt) {
	var passHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
	return hash == passHash; 
}

exports.mysqlAccountCreation = function(userName, password, callback){
	var con = createConnection();

	con.query("select * from chataccounts where userName = '" + firstName + "' and lastName = '" + lastName + "'", function (err, result, fields){
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

function mysqlValidateUser(userName, password, callback){
	var hash;
	baseConnection.query("select * from chataccounts where userName = '" + userName + "'", function(err, result, fields){
		if(err) throw err;
		console.log(result);

		for(var i = 0; i < result.length; i++){
			console.log("Checking against values " + result[i].accountPassword + " " + result[i].salt);
			if(validatePassword(password, result[i].accountPassword, result[i].salt)){
				console.log("valid user");
				return callback(true);
			}
		}
		console.log("invalid user");
		callback(false);
	});
}

exports.mysqlValidateUser = mysqlValidateUser;

exports.mysqlCreateAccount = function(userName, accountEmail, password, callback){
	var salt = crypto.randomBytes(16).toString('hex');
	var hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
	mysqlValidateUser(userName, password, function(result){
		if(result){
			callback(false);
		} else {
			console.log("account does not exist, creating account");
			baseConnection.query("Insert into chataccounts (userName, accountPassword, salt, accountEmail) values ('" + userName + "','" + hash + "','" + salt + "','" + accountEmail + "');", function(err, result, fields){
				if(err) throw err;
				console.log("Account created");
				callback(true);
			});

		}
	});
}
