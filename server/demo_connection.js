var mysql = require('mysql');

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
