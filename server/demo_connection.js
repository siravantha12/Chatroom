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

exports.mysqlValidateUser = function(firstName, lastName, callback){
	var con = createConnection();
	con.query("select * from chatusers where firstName = '" + firstName  + "' and lastName = '" + lastName + "'" , function (err, result, fields){
		if(err) throw err;
		console.log(result);
		if(result.length == 1){
			console.log("Valid user");
			return callback(1);
		} else {
			console.log("Invalid user");
			return callback(0);
		}
	});
}
