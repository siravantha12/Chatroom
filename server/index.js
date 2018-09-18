console.log("Basic HTTP Server");

var http = require("http");

var handlerMethod = function(req, res){
	
	res.end("A simple response from a simple web server");
}

http.createServer(handlerMethod).listen(3456,'localhost');

console.log("HTTP Server listening on port 3456");
