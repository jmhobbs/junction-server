/*

 var msgpack = require('msgpack');

    // ... get a net.Stream instance, s, from somewhere

    var ms = new msgpack.Stream(s);
    ms.addListener('msg', function(m) {
        sys.debug('received message: ' + sys.inspect(m));
    });

    var b = msgpack.pack(o);

*/

var    redis = require("redis"),
 redisClient = redis.createClient(),
     msgpack = require('msgpack'),
     server;

if(process.env.USE_TLS == 'yes'){
  console.log('Using TLS');
  var fs = require('fs');
  var tls_options = {
    key: fs.readFileSync('private-key.pem'),
    cert: fs.readFileSync('public-cert.pem')
  };
  server = require('tls').createServer(tls_options, serverHandler);
}
else {
  console.log('NOT Using TLS');
  server = require('net').createServer(serverHandler);
}

redisClient.on("error", function (err) {
  console.log("Error " + err);
});

//redisClient.on("connect", function (err) {
//  console.log("Connect " + err);
//});

//redisClient.on("end", function (err) {
//  console.log("End " + err);
//});

//redisClient.on("drain", function (err) {
//  console.log("Drain " + err);
//});

//redisClient.on("idle", function (err) {
//  console.log("Idle " + err);
//});

var clients = [];
 
function serverHandler (socket) {

  socket.name = socket.remoteAddress + ":" + socket.remotePort 

  console.log("Connect:", socket.name);

  socket.write("Welcome " + socket.name + "\n");
 
  // Handle incoming messages from clients.
  socket.on('data', function (data) {
    console.log('data', data.toString('utf-8'));
  });
 
  // Remove the client from the list when it leaves
  socket.on('end', function () {
    console.log("Disconnect:", socket.name);
  });
 
}

redisClient.on("ready", function (err) {
  server.listen(3000);
  console.log("Push server running at port 3000\n");
});

function blockOnQueue () {
  redisClient.blpop(['push:queued', 1], function (err, data) {
    if(err || data) {
      console.log(err, data);
    }
    blockOnQueue();
  });
}

console.log("Polling redis!");

blockOnQueue();
