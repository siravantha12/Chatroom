var express = require('express');
var server = express();
var cookieParser = require('cookie-parser');

server.use(cookieParser());

server.get('/', function(req, res){
    res.cookie('name', 'express').send('cookie set'); //Sets name = express cookie
    res.cookie(name, 'value', {expire: 360000 + Date.now()}); //Set expiration date (will most likley put a week before testing)
    res.clearCookie(name); //Clear cookie with name 'name'
 });
 

server.listen(1337,'0.0.0.0');
