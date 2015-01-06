var      net = require('net'),
       redis = require("redis"),
 redisClient = redis.createClient();

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
 
var server = net.createServer(function (socket) {

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
 
});

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
