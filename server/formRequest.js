var http = require('http');

var connect = require('connect');

var bodyParser = require('body-parser');

var mysqlConnection = require("./demo_connection.js");

var app = connect()
	.use(bodyParser.urlencoded(
		{extended:true}
	))
	.use(function(req,res){

		var parsedInfo = {};

		parsedInfo.firstName = req.body.userFirstName;
		parsedInfo.lastName = req.body.userLastName;

		var con = mysqlConnection.mysqlCreateConnection();

		con.connect(function(err) {
			if(err) throw err;
		})

		res.end("User info parsed from: " + parsedInfo.firstName + " " + parsedInfo.lastName + " Connected to database");

	});

http.createServer(app).listen(3456);

console.log("Listening on port 3456");
