var mysql = require('mysql');

exports.mysqlCreateConnection = function() {
	
	// Connects to instance of mysql database. Currently runs off local mysql database.
	var con = mysql.createConnection({
		host: "localhost",
		user: "root",
		password: "password"
	});

	return con;
}
