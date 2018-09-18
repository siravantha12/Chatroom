var mysql = require('mysql');

exports.mysqlCreateConnection = function() {
	
	// Connects to instance of mysql database. Currently runs off local mysql database.
	var con = mysql.createConnection({
		host: "localhost",
		user: "root",
		password: "password",
		database: "chat"
	});

	return con;
}

exports.mysqlValidateUser = function(firstName, lastName){
	con.query("select * from chatusers where firstName = " + firstName  + " and lastName = " + lastName , function (err, result, fields){
		if(err) throw err;
		console.log(result);
	})
}
