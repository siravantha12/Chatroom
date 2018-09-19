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

	console.log("validating user");
	mysqlConnection.mysqlValidateUser(parsedInfo.firstName, parsedInfo.lastName, function(result){
		if(result){
			res.end("You are valid");
		} else {
			res.end("You are invalid");
		}
	});

});

app.listen(3456, '0.0.0.0', function(){
	console.log("listening on port: 3456");
});
