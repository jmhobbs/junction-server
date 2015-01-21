"use strict";

var crypto = require("crypto"),
    APIKey = require("./api_key.js");

// Maximum number of milliseconds for clock drift of
// a challenge response.
var MAX_CHALLENGE_DRIFT = 1500,
   SHA256_DIGEST_LENGTH = 32; // Bytes in a SHA256 digest

var Client = function (socket) {
  this.socket              = socket;
  this.user                = null;
  this.connected           = (+new Date());
  this.authenticated       = 0;
  this.api_key             = null;
  this.challenge_timestamp = null;
  this.challenge           = null;
};

Client.prototype.is_authenticated = function () {
  return this.authenticated > 0;
};

/*
 Creates a buffer object for the challenge consisting of 8 bytes of
 timestamp followed by 8 bytes of random data.
*/
Client.prototype.create_challenge = function () {
  this.challenge_timestamp = (+new Date());
  var random = crypto.randomBytes(8);
  var time = new Buffer(8);
  time.fill(0);
  time.writeDoubleLE(this.challenge_timestamp, 0);
  this.challenge = Buffer.concat([random, time]);
  return this.challenge;
};

Client.prototype.authenticate = function (redis_client, response, callback) {
  if((+new Date()) - this.challenge_timestamp > MAX_CHALLENGE_DRIFT) {
    this.challenge = null;
    this.challenge_timestamp = null;
    return callback(new Error("Challenge has expired."), false);
  }

  var signature = response.slice(0, SHA256_DIGEST_LENGTH),
            key = response.slice(SHA256_DIGEST_LENGTH);

  var self = this;

  APIKey.findByKey(redis_client, key, function (error, api_key) {
    if(api_key !== null) {
      var hmac = crypto.createHmac("sha256", api_key.secret);
      hmac.update(self.challenge);
      if(signature.toString("base64") === hmac.digest("base64")) {
        self.api_key = api_key;
        self.authenticated = (+new Date());
        self.challenge = null;
        self.challenge_timestamp = null;
        return callback(null, true);
      }
    }
    return callback(new Error("Challenge failed."), false);
  });
};

module.exports = {
  Client: Client
};
