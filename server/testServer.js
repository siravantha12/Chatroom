var express = require("express");
var app = express();
var path = require("path");
var bodyParser = require('body-parser');
var mysqlConnection = require("./demo_connection.js");

app.get('/',function(req,res){
	res.sendFile(path.join(__dirname+'/userForm.html'));
});

app.use(bodyParser.urlencoded({ extended:true}));

app.post('/',function(req,res){
	console.log("Inside post");
	var parsedInfo = {};
	parsedInfo.firstName = req.body.userFirstName;
	parsedInfo.lastName = req.body.userLastName;
	res.write("Your name is " + parsedInfo.firstName + " " + parsedInfo.lastName + "\n");
	res.write("Attempting to connect to mysql database\n");
	var con = mysqlConnection.mysqlCreateConnection();

	con.connect(function(err) {
		if(err) throw err;
	});

	con.query("select * from chatusers", function (err, result, fields){
		if(err) throw err;
		console.log(result);
	});

	res.end("Connected to database");
});

app.listen(3456);
