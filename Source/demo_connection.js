var mysql = require('mysql');

// Connects to instance of mysql database. Currently runs off local mysql database.
var con = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "password"
});

con.connect(function(err) {
	if(err) throw err;
	
	// Upon successful connection Connected will be printed on console
	console.log("Connected");
});
