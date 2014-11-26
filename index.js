var     app = require('express')(),
     server = require('http').createServer(app),
      redis = require("redis"),
redisClient = redis.createClient();

redisClient.on("error", function (err) {
  console.log("Redis Error " + err);
});

app.post('/push', function (req, res) {
  // TODO: Check api key
  var msg = {
    "title": req.param('title'),
    "body": req.param('body'),
    "link": req.param('link')
  };
  redisClient.rpush(['push:queued', JSON.stringify(msg)], function (err, data) {
    if(err) {
      console.log('err: ', err);
      res.writeHead(500, {'Content-Type': 'text/plain'});
      res.end(err);
    }
    else {
      res.writeHead(200, {'Content-Type': 'text/json'});
      res.end(JSON.stringify({"response": "rad dude"}));
    }
 });
});

app.get('/', function (req, res) {
  res.send('Hello World!')
});

var server = app.listen(process.env.PORT || 3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

});
