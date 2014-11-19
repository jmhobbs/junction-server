// https://github.com/Automattic/socket.io/tree/0.9.17
var http = require('http'),
    http_server = http.createServer(http_reponse),
    io = require('socket.io').listen(http_server),
		url = require('url');

function http_reponse (request, response) {
	var parsed_url = url.parse(request.url, true);
  io.sockets.emit("message", {"title": parsed_url.query.title, "body": parsed_url.query.body});
  response.writeHead(200, {'Content-Type': 'text/json'});
  response.end(JSON.stringify({"response": "rad dude"}));
}

io.sockets.on('connection', function (socket) {
  console.log("client connected");
});

http_server.listen(process.env.PORT || 3000);
