var http = require('http')

http.createServer(function(request, response) {
	response.writeHead(200, {"Content-Type": "text/plain"})
	response.end("Hey Charis.\n")
}).listen(process.env.PORT)