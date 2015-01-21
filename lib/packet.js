"use strict";
 
var msgpack = require("msgpack"),
    crypto = require("crypto");

/*
    {
      "id": 12345,
      "title": "derp",
      "body": "",              // Optional
      "url": "",               // Optional
      "image_url": "",         // Optional
      "timestamp": 123456789
    }
*/

var Packet = function () {
  this.id        = null;
  this.title     = null;
  this.body      = null;
  this.url       = null;
  this.image_url = null;
  this.timestamp = null;
};

var SHA256_DIGEST_LENGTH = 32; // Bytes in a SHA256 digest

var unpack = function (raw, api_secret) {
  var signature = raw.slice(0, SHA256_DIGEST_LENGTH);
  var packed    = raw.slice(SHA256_DIGEST_LENGTH);
  
  var hmac = crypto.createHmac("sha256", api_secret);
  hmac.update(packed);
  if(signature.toString("base64") != hmac.digest("base64")) {
    throw new Error("Signature does not match.");
  }

  var hash = msgpack.unpack(packed);

  var packet = new Packet();

  packet.id = hash.id;
  packet.title = hash.title;
  packet.body = hash.body;
  packet.url = hash.url;
  packet.image_url = hash.image_url;
  packet.timestamp = hash.timestamp;

  return packet;
};

Packet.prototype.pack = function (api_secret) {
    if(this.timestamp === null) { this.timestamp = (+ new Date()); }

    var packed = msgpack.pack({
      id: this.id,
      title: this.title,
      body: this.body,
      url: this.url,
      image_url: this.image_url,
      timestamp: this.timestamp
    });

    var hmac = crypto.createHmac("sha256", api_secret);
    hmac.update(packed);

    return Buffer.concat([hmac.digest(), packed]);
};

module.exports = {
  Packet: Packet,
  unpack: unpack
};
